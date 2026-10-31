import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Copy, Dices, Download, ImagePlus, RotateCcw, Save } from 'lucide-react'
import type { Emoji } from '../../types'
import { BASE_FACES, renderCursed, type CursedRecipe, type Layer, type Warp } from '../../lib/cursed'
import { slugify } from '../../data/emojis'
import { loadImage } from '../../lib/emojiActions'
import { useStore } from '../../store/AppStore'
import { useEmojiActions } from '../../store/useEmojiActions'

type Base = { kind: 'emoji'; char: string } | { kind: 'image'; src: string }

interface Controls {
  bigEyes: number
  bigMouth: number
  eyeSwap: string
  mouthSwap: string
  eyeY: number
  eyeGap: number
  fry: number
  melt: number
  swirl: number
  wave: number
  stretchX: number
  stretchY: number
  pixelate: number
  hue: number
  decor: string
  caption: string
  captionPos: 'top' | 'bottom'
  seed: number
}

const DEFAULTS: Controls = {
  bigEyes: 0,
  bigMouth: 0,
  eyeSwap: '',
  mouthSwap: '',
  eyeY: 0.42,
  eyeGap: 0.26,
  fry: 0,
  melt: 0,
  swirl: 0,
  wave: 0,
  stretchX: 1,
  stretchY: 1,
  pixelate: 0,
  hue: 0,
  decor: '',
  caption: '',
  captionPos: 'bottom',
  seed: 1,
}

const EYE_SWAPS = ['👁️', '🌀', '⭐', '🔴', '💀', '😳', '✨']
const MOUTH_SWAPS = ['👄', '🫦', '👅', '🦷']
const DECORS = ['🔥', '✨', '💧', '👉👈', '📸', '🎺', '☕', '💅', '🙏', '🧢', '👑', '💯']
const CAPTION_IDEAS = ['bruh', 'no cap', 'sus', "i'm dead", 'mid', 'real', 'help', 'slay', 'ratio', 'W', 'L']
const MAX_UPLOAD_MB = 10

function toRecipe(base: Base, c: Controls): CursedRecipe {
  const L = { x: 0.5 - c.eyeGap / 2, y: c.eyeY }
  const R = { x: 0.5 + c.eyeGap / 2, y: c.eyeY }
  const mouth = { x: 0.5, y: c.eyeY + 0.24 }
  const warps: Warp[] = []
  const layers: Layer[] = []
  if (c.eyeSwap) layers.push({ char: c.eyeSwap, ...L, size: 0.2 }, { char: c.eyeSwap, ...R, size: 0.2 })
  if (c.mouthSwap) layers.push({ char: c.mouthSwap, ...mouth, size: 0.28 })
  if (c.decor === '👉👈') layers.push({ char: '👉', x: 0.28, y: 0.87, size: 0.24 }, { char: '👈', x: 0.72, y: 0.87, size: 0.24 })
  else if (c.decor) layers.push({ char: c.decor, x: 0.8, y: 0.8, size: 0.3, rotate: -10 })
  if (c.bigEyes) warps.push({ kind: 'bulge', ...L, r: 0.18, amount: c.bigEyes }, { kind: 'bulge', ...R, r: 0.18, amount: c.bigEyes })
  if (c.bigMouth) warps.push({ kind: 'bulge', ...mouth, r: 0.24, amount: c.bigMouth })
  if (c.swirl) warps.push({ kind: 'swirl', x: 0.5, y: 0.5, r: 0.48, amount: c.swirl })
  if (c.wave) warps.push({ kind: 'wave', amount: c.wave })
  if (c.melt) warps.push({ kind: 'melt', amount: c.melt })
  return {
    ...(base.kind === 'emoji' ? { base: base.char } : { image: base.src }),
    baseScale: c.decor === '👉👈' ? 0.72 : 0.82,
    stretchX: c.stretchX,
    stretchY: c.stretchY,
    warps,
    layers,
    fry: c.fry,
    pixelate: c.pixelate,
    hue: c.hue,
    caption: c.caption,
    captionPos: c.captionPos,
    seed: c.seed,
  }
}

function randomControls(): Controls {
  const r = Math.random
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)]
  const c: Controls = { ...DEFAULTS, seed: Math.floor(r() * 1e6) }
  const roll = r()
  if (roll < 0.5) c.bigEyes = +(0.8 + r() * 1).toFixed(2)
  else if (roll < 0.75) c.eyeSwap = pick(EYE_SWAPS)
  else c.swirl = +((r() < 0.5 ? -1 : 1) * (2 + r() * 3)).toFixed(1)
  const mouthRoll = r()
  if (mouthRoll < 0.3) c.mouthSwap = pick(MOUTH_SWAPS)
  else if (mouthRoll < 0.5) c.bigMouth = +(0.6 + r() * 0.8).toFixed(2)
  if (r() < 0.45) c.fry = +(0.4 + r() * 0.6).toFixed(2)
  if (r() < 0.3) c.melt = +(0.3 + r() * 0.6).toFixed(2)
  if (r() < 0.25) c.stretchX = +(1.15 + r() * 0.3).toFixed(2)
  if (r() < 0.3) c.decor = pick(DECORS)
  if (r() < 0.35) c.caption = pick(CAPTION_IDEAS)
  if (r() < 0.08) c.hue = Math.round(r() * 360)
  return c
}

export function Creator() {
  const { addCustom, toast, setOpenEmoji, remix, clearRemix } = useStore()
  const { send } = useEmojiActions()
  const [base, setBase] = useState<Base>({ kind: 'emoji', char: '😂' })
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [c, setC] = useState<Controls>({ ...DEFAULTS, bigEyes: 1.2 })
  const [name, setName] = useState('')
  const [customChar, setCustomChar] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof Controls>(k: K, v: Controls[K]) => setC((s) => ({ ...s, [k]: v }))
  const recipe = useMemo(() => toRecipe(base, c), [base, c])

  const loadBase = useCallback(
    async (src: string) => {
      try {
        const el = await loadImage(src)
        setImg(el)
        setBase({ kind: 'image', src })
      } catch {
        toast("Couldn't read that image. Try PNG, JPG, GIF or WebP.", 'error')
      }
    },
    [toast],
  )

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return
      if (!file.type.startsWith('image/')) return toast('That file is not an image.', 'error')
      if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return toast(`Max ${MAX_UPLOAD_MB}MB please.`, 'error')
      const reader = new FileReader()
      reader.onload = () => typeof reader.result === 'string' && loadBase(reader.result)
      reader.readAsDataURL(file)
      setC({ ...DEFAULTS })
      if (!name) setName(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 30))
    },
    [toast, loadBase, name],
  )

  // Remix: an emoji was sent here from its detail popup — bake it into an image base.
  useEffect(() => {
    if (!remix) return
    clearRemix()
    setC({ ...DEFAULTS })
    setName(remix.name ? `${remix.name} remix` : '')
    if (remix.recipe) {
      const run = async () => {
        const im = remix.recipe!.image ? await loadImage(remix.recipe!.image) : null
        void loadBase(renderCursed(remix.recipe!, 512, im).toDataURL('image/png'))
      }
      void run()
    } else if (remix.src) void loadBase(remix.src)
  }, [remix, clearRemix, loadBase])

  // Paste an image
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'))
      if (file) handleFile(file)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [handleFile])

  // Live preview (one render per animation frame)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const out = canvasRef.current
      if (!out) return
      const r = renderCursed(recipe, 384, base.kind === 'image' ? img : null)
      const ctx = out.getContext('2d')!
      ctx.clearRect(0, 0, out.width, out.height)
      ctx.drawImage(r, 0, 0, out.width, out.height)
    })
    return () => cancelAnimationFrame(id)
  }, [recipe, img, base.kind])

  const exportEmoji = (size: number): Emoji => {
    const finalName = name.trim() || `Cursed ${base.kind === 'emoji' ? base.char : 'Upload'}`
    return {
      id: `custom-${Date.now().toString(36)}`,
      name: finalName,
      slug: slugify(finalName.replace(/[^\w\s-]/g, '')) || 'cursed',
      category: 'custom',
      tags: ['custom', base.kind === 'emoji' ? base.char : 'upload'],
      description: 'Cooked in the LARPMOJI lab.',
      author: 'you',
      uses: 0,
      createdAt: new Date().toISOString(),
      src: renderCursed(recipe, size, base.kind === 'image' ? img : null).toDataURL('image/png'),
      // keep the recipe for emoji bases so sticker exports can re-render crisply at 512px
      ...(base.kind === 'emoji' ? { recipe } : {}),
      custom: true,
    }
  }

  const save = () => {
    const e = exportEmoji(256)
    addCustom(e)
    toast(`Saved to your stash`, 'success', e)
    setOpenEmoji(e)
  }
  const copy = () => void send(exportEmoji(320))
  const download = () => {
    const e = exportEmoji(512)
    const a = document.createElement('a')
    a.href = e.src
    a.download = `${e.slug}.png`
    a.click()
  }

  const pickChar = (ch: string) => {
    setBase({ kind: 'emoji', char: ch })
    setImg(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-5 pt-6 sm:pt-8">
      <h1 className="meme text-6xl sm:text-7xl leading-none">
        the <span className="text-acid">kitchen</span> 🧪
      </h1>
      <p className="mt-2 text-sm text-muted">Pick an emoji (or upload a pic) → smash the buttons → copy it into your chat.</p>

      <div className="mt-6 grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 items-start">
        {/* PREVIEW */}
        <div className="lg:sticky lg:top-20">
          <div
            onDragOver={(e) => (e.preventDefault(), setDragOver(true))}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFile(e.dataTransfer.files[0])
            }}
            className={`relative aspect-square rounded-[2rem] checker border border-line overflow-hidden ${dragOver ? 'ring-4 ring-acid' : ''}`}
          >
            <canvas ref={canvasRef} width={768} height={768} className="absolute inset-0 size-full" aria-label="Cursed emoji preview" />
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            <button onClick={() => setC(randomControls())} className="btn col-span-2 h-14 bg-cyan text-black text-lg hover:brightness-110">
              <Dices className="size-5" /> CURSIFY
            </button>
            <button onClick={copy} className="btn col-span-2 h-14 bg-acid text-black text-lg hover:brightness-110">
              <Copy className="size-5" /> COPY
            </button>
            <button onClick={save} className="btn col-span-2 h-11 bg-raised hover:bg-line text-sm">
              <Save className="size-4" /> Save to stash
            </button>
            <button onClick={download} className="btn h-11 bg-raised hover:bg-line text-sm" aria-label="Download PNG">
              <Download className="size-4" />
            </button>
            <button onClick={() => setC({ ...DEFAULTS })} className="btn h-11 bg-raised hover:bg-line text-sm" aria-label="Reset effects">
              <RotateCcw className="size-4" />
            </button>
          </div>
          <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder="name it (optional)" className="mt-2 w-full h-11 rounded-full bg-surface border border-line focus:border-acid outline-none px-4 text-sm" />
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col gap-4">
          <Panel title="1 · pick a victim">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1">
              <button
                onClick={() => fileRef.current?.click()}
                className={`grid place-items-center aspect-square rounded-xl border border-dashed ${base.kind === 'image' ? 'border-acid bg-acid/15' : 'border-line hover:border-fg/50'}`}
                aria-label="Upload an image"
                title="Upload an image"
              >
                <ImagePlus className="size-5" />
              </button>
              {BASE_FACES.map((ch) => (
                <button
                  key={ch}
                  onClick={() => pickChar(ch)}
                  className={`grid place-items-center aspect-square rounded-xl text-[28px] leading-none transition-transform hover:scale-110 ${base.kind === 'emoji' && base.char === ch ? 'bg-acid/20 ring-2 ring-acid' : 'hover:bg-raised'}`}
                  aria-label={`Use ${ch}`}
                >
                  {ch}
                </button>
              ))}
            </div>
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (customChar.trim()) pickChar(customChar.trim())
              }}
            >
              <input value={customChar} onChange={(e) => setCustomChar(e.target.value.slice(0, 8))} placeholder="…or type / paste ANY emoji" className="flex-1 min-w-0 h-10 rounded-full bg-raised border border-line focus:border-acid outline-none px-4 text-sm" />
              <button className="btn h-10 px-4 bg-fg text-black text-sm">Use</button>
            </form>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => (handleFile(e.target.files?.[0]), (e.target.value = ''))} />
          </Panel>

          <Panel title="2 · face crimes">
            <Slider label="👀 Big eyes" min={0} max={2.2} step={0.05} value={c.bigEyes} onChange={(v) => set('bigEyes', v)} />
            <Slider label="👄 Big mouth" min={0} max={2} step={0.05} value={c.bigMouth} onChange={(v) => set('bigMouth', v)} />
            <ChipRow label="Swap eyes" options={EYE_SWAPS} value={c.eyeSwap} onChange={(v) => set('eyeSwap', v)} />
            <ChipRow label="Swap mouth" options={MOUTH_SWAPS} value={c.mouthSwap} onChange={(v) => set('mouthSwap', v)} />
            <details className="mt-2 text-sm text-muted">
              <summary className="cursor-pointer hover:text-fg">eyes in the wrong place? (for uploads)</summary>
              <Slider label="Eye height" min={0.2} max={0.7} step={0.01} value={c.eyeY} onChange={(v) => set('eyeY', v)} />
              <Slider label="Eye spacing" min={0.1} max={0.5} step={0.01} value={c.eyeGap} onChange={(v) => set('eyeGap', v)} />
            </details>
          </Panel>

          <Panel title="3 · destroy it">
            <Slider label="🔥 Deep fry" min={0} max={1} step={0.02} value={c.fry} onChange={(v) => set('fry', v)} />
            <Slider label="🫠 Melt" min={0} max={1} step={0.02} value={c.melt} onChange={(v) => (set('melt', v), set('seed', c.seed || 1))} />
            <Slider label="🌀 Swirl" min={-6} max={6} step={0.1} value={c.swirl} onChange={(v) => set('swirl', v)} />
            <Slider label="〰️ Wobble" min={0} max={1} step={0.02} value={c.wave} onChange={(v) => set('wave', v)} />
            <Slider label="↔️ Wide" min={0.6} max={1.6} step={0.01} value={c.stretchX} onChange={(v) => set('stretchX', v)} />
            <Slider label="↕️ Tall" min={0.6} max={1.6} step={0.01} value={c.stretchY} onChange={(v) => set('stretchY', v)} />
            <Slider label="👾 Pixel" min={0} max={1} step={0.02} value={c.pixelate} onChange={(v) => set('pixelate', v)} />
            <Slider label="🌈 Colour" min={0} max={360} step={1} value={c.hue} onChange={(v) => set('hue', v)} />
          </Panel>

          <Panel title="4 · extras">
            <ChipRow label="Add" options={DECORS} value={c.decor} onChange={(v) => set('decor', v)} />
            <div className="mt-3 flex gap-2">
              <input value={c.caption} onChange={(e) => set('caption', e.target.value.slice(0, 18))} placeholder="meme caption (optional)" className="flex-1 min-w-0 h-10 rounded-full bg-raised border border-line focus:border-acid outline-none px-4 text-sm" />
              <button onClick={() => set('captionPos', c.captionPos === 'top' ? 'bottom' : 'top')} className="btn h-10 px-3 bg-raised border border-line text-xs">
                {c.captionPos === 'top' ? '⬆ top' : '⬇ bottom'}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CAPTION_IDEAS.map((t) => (
                <button key={t} onClick={() => set('caption', t)} className="rounded-full bg-raised hover:bg-line px-2.5 py-1 text-xs">
                  {t}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-surface border border-line p-4">
      <h2 className="font-display uppercase text-xl tracking-wide mb-2">{title}</h2>
      {children}
    </section>
  )
}

function Slider(props: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <label className="grid grid-cols-[7.5rem_1fr] items-center gap-3 py-1.5">
      <span className="text-sm whitespace-nowrap">{props.label}</span>
      <input type="range" min={props.min} max={props.max} step={props.step} value={props.value} onChange={(e) => props.onChange(Number(e.target.value))} className="w-full h-2" />
    </label>
  )
}

function ChipRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="text-sm w-[7.5rem] shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1">
        <button onClick={() => onChange('')} className={`h-9 px-2.5 rounded-xl text-xs ${!value ? 'bg-fg text-black' : 'bg-raised hover:bg-line'}`}>
          none
        </button>
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} className={`h-9 min-w-9 px-1 rounded-xl text-lg ${value === o ? 'bg-acid/25 ring-2 ring-acid' : 'bg-raised hover:bg-line'}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}
