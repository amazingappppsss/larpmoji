import { useCallback, useEffect, useRef, useState } from 'react'
import { Dices, Download, FlipHorizontal2, ImagePlus, RotateCcw, Save, Upload } from 'lucide-react'
import type { Emoji } from '../../types'
import { PALETTE, randomFace, renderArt, svgToDataUrl } from '../../data/emojiArt'
import { slugify } from '../../data/emojis'
import { loadImage } from '../../lib/emojiActions'
import { useStore } from '../../store/AppStore'

type Mask = 'none' | 'circle' | 'rounded' | 'blob'
type CaptionPos = 'top' | 'bottom'

interface Settings {
  mask: Mask
  zoom: number
  rotate: number
  offsetX: number // fraction of canvas size
  offsetY: number
  flip: boolean
  bg: string // 'transparent' or hex
  outline: boolean
  caption: string
  captionPos: CaptionPos
}

const DEFAULTS: Settings = {
  mask: 'circle',
  zoom: 1,
  rotate: 0,
  offsetX: 0,
  offsetY: 0,
  flip: false,
  bg: 'transparent',
  outline: true,
  caption: '',
  captionPos: 'bottom',
}

const OUTPUT = 256
const MAX_UPLOAD_MB = 8

function maskPath(ctx: CanvasRenderingContext2D, mask: Mask, s: number, inset: number) {
  const a = inset
  const b = s - inset
  ctx.beginPath()
  if (mask === 'circle') ctx.arc(s / 2, s / 2, s / 2 - inset, 0, Math.PI * 2)
  else if (mask === 'rounded') ctx.roundRect(a, a, b - a, b - a, s * 0.24)
  else if (mask === 'blob') {
    const k = s / 128
    ctx.moveTo(66 * k, a)
    ctx.bezierCurveTo(98 * k, a, b, 26 * k, b, 60 * k)
    ctx.bezierCurveTo(b, 96 * k, 92 * k, b, 62 * k, b)
    ctx.bezierCurveTo(26 * k, b, a, 94 * k, a, 64 * k)
    ctx.bezierCurveTo(a, 28 * k, 32 * k, a, 66 * k, a)
  } else ctx.rect(0, 0, s, s)
  ctx.closePath()
}

/** Draw the emoji to a canvas. Shared by live preview and final export. */
function draw(canvas: HTMLCanvasElement, img: HTMLImageElement | null, st: Settings) {
  const s = canvas.width
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, s, s)
  const inset = st.outline && st.mask !== 'none' ? s * 0.035 : 0

  ctx.save()
  maskPath(ctx, st.mask, s, inset)
  ctx.clip()
  if (st.bg !== 'transparent') {
    ctx.fillStyle = st.bg
    ctx.fillRect(0, 0, s, s)
  }
  if (img) {
    // "cover" fit, then user zoom / pan / rotate / flip. Aspect ratio is always preserved.
    const base = Math.max(s / img.naturalWidth, s / img.naturalHeight)
    const w = img.naturalWidth * base * st.zoom
    const h = img.naturalHeight * base * st.zoom
    ctx.translate(s / 2 + st.offsetX * s, s / 2 + st.offsetY * s)
    ctx.rotate((st.rotate * Math.PI) / 180)
    if (st.flip) ctx.scale(-1, 1)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, -w / 2, -h / 2, w, h)
  }
  ctx.restore()

  if (st.outline && st.mask !== 'none') {
    maskPath(ctx, st.mask, s, inset)
    ctx.lineWidth = s * 0.05
    ctx.strokeStyle = '#111'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const text = st.caption.trim().toUpperCase()
  if (text) {
    let size = s * 0.2
    ctx.font = `900 ${size}px "Arial Black", Impact, sans-serif`
    while (ctx.measureText(text).width > s * 0.92 && size > 10) {
      size -= 2
      ctx.font = `900 ${size}px "Arial Black", Impact, sans-serif`
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = st.captionPos === 'top' ? 'top' : 'bottom'
    const y = st.captionPos === 'top' ? s * 0.04 : s * 0.96
    ctx.lineWidth = size * 0.22
    ctx.strokeStyle = '#111'
    ctx.lineJoin = 'round'
    ctx.strokeText(text, s / 2, y)
    ctx.fillStyle = '#fff'
    ctx.fillText(text, s / 2, y)
  }
}

export function Creator() {
  const { addCustom, toast, setOpenEmoji, remixSrc, clearRemix } = useStore()
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [st, setSt] = useState<Settings>(DEFAULTS)
  const [name, setName] = useState('')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSt((s) => ({ ...s, [k]: v }))

  const loadSrc = useCallback(
    async (src: string) => {
      try {
        setImg(await loadImage(src))
        setSt((s) => ({ ...s, zoom: 1, rotate: 0, offsetX: 0, offsetY: 0 }))
      } catch {
        toast("Couldn't read that image. Try a PNG, JPG, GIF or WebP.", 'error')
      }
    },
    [toast],
  )

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return
      if (!file.type.startsWith('image/')) return toast('That file is not an image.', 'error')
      if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return toast(`Max ${MAX_UPLOAD_MB}MB, please.`, 'error')
      const reader = new FileReader()
      reader.onload = () => typeof reader.result === 'string' && loadSrc(reader.result)
      reader.readAsDataURL(file)
      if (!name) setName(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 30))
    },
    [toast, loadSrc, name],
  )

  // Remix flow: an emoji was sent here from the detail modal
  useEffect(() => {
    if (remixSrc) {
      void loadSrc(remixSrc)
      clearRemix()
    }
  }, [remixSrc, clearRemix, loadSrc])

  // Paste an image from the clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'))
      if (file) handleFile(file)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [handleFile])

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current, img, st)
  }, [img, st])

  const rollBase = () => {
    void loadSrc(svgToDataUrl(renderArt(randomFace())))
    setSt((s) => ({ ...s, mask: 'none', outline: false, bg: 'transparent' }))
  }

  const exportPng = (): string => {
    const c = document.createElement('canvas')
    c.width = c.height = OUTPUT
    draw(c, img, st)
    return c.toDataURL('image/png')
  }

  const save = () => {
    if (!img) return toast('Upload an image first.', 'error')
    const finalName = name.trim() || 'Untitled Creation'
    const slug = slugify(finalName)
    const emoji: Emoji = {
      id: `custom-${Date.now().toString(36)}`,
      name: finalName,
      slug,
      category: 'custom',
      tags: tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 8),
      description: description.trim() || 'Fresh from the LARPMOJI lab.',
      author: 'you',
      uses: 0,
      createdAt: new Date().toISOString(),
      src: exportPng(),
      custom: true,
    }
    addCustom(emoji)
    toast(`${finalName} saved to your lab!`, 'success', emoji.src)
    setOpenEmoji(emoji)
  }

  const downloadNow = () => {
    if (!img) return
    const a = document.createElement('a')
    a.href = exportPng()
    a.download = `${slugify(name || 'larpmoji')}.png`
    a.click()
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!img) return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, ox: st.offsetX, oy: st.offsetY }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    set('offsetX', drag.current.ox + (e.clientX - drag.current.x) / rect.width)
    set('offsetY', drag.current.oy + (e.clientY - drag.current.y) / rect.height)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="font-display text-5xl sm:text-6xl leading-none">
        the <span className="bg-lime px-2 border-[3px] border-ink shadow-hard inline-block rotate-2">lab</span>
      </h1>
      <p className="mt-3 font-semibold text-ink/60">Upload a pic, crop it, crime it. Saved to your browser.</p>

      <div className="mt-8 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-8">
        {/* PREVIEW */}
        <div>
          <div
            onDragOver={(e) => (e.preventDefault(), setDragOver(true))}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFile(e.dataTransfer.files[0])
            }}
            className={`relative aspect-square max-w-md mx-auto rounded-[2rem] sticker shadow-hard-lg checker overflow-hidden ${dragOver ? 'ring-8 ring-bubblegum' : ''}`}
          >
            <canvas
              ref={canvasRef}
              width={512}
              height={512}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => (drag.current = null)}
              className={`absolute inset-0 size-full touch-none ${img ? 'cursor-grab active:cursor-grabbing' : ''}`}
              aria-label="Emoji preview. Drag to reposition."
            />
            {!img && (
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-4 flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border-[3px] border-dashed border-ink/40 bg-paper/80 hover:bg-sun/40 transition-colors"
              >
                <ImagePlus className="size-12" aria-hidden />
                <span className="font-display text-2xl">drop an image</span>
                <span className="text-sm font-semibold text-ink/60">or click to browse · or paste (Ctrl/⌘ + V)</span>
              </button>
            )}
          </div>
          {img && (
            <div className="mt-5 flex items-end justify-center gap-4" aria-label="Size previews">
              {[
                ['size-6', '24px'],
                ['size-10', '40px'],
                ['size-16', '64px'],
              ].map(([cls, label]) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <PreviewThumb canvas={canvasRef} className={cls} deps={[img, st]} />
                  <span className="font-mono text-[10px] text-ink/50">{label}</span>
                </div>
              ))}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => (handleFile(e.target.files?.[0]), (e.target.value = ''))} />
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-full bg-sun px-4 py-2 font-extrabold sticker-sm press">
              <Upload className="size-4" /> {img ? 'Replace image' : 'Upload image'}
            </button>
            <button onClick={rollBase} className="flex items-center gap-1.5 rounded-full bg-lilac px-4 py-2 font-extrabold sticker-sm press">
              <Dices className="size-4" /> Roll a random base
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col gap-5">
          <Panel title="1. shape">
            <div className="grid grid-cols-4 gap-2">
              {(['circle', 'rounded', 'blob', 'none'] as Mask[]).map((m) => (
                <button
                  key={m}
                  onClick={() => set('mask', m)}
                  aria-pressed={st.mask === m}
                  className={`rounded-xl py-2 font-extrabold text-sm capitalize border-[2.5px] border-ink ${st.mask === m ? 'bg-ink text-white' : 'bg-white'}`}
                >
                  {m === 'none' ? 'square' : m}
                </button>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-2 font-bold text-sm">
              <input type="checkbox" checked={st.outline} onChange={(e) => set('outline', e.target.checked)} className="size-4 accent-ink" />
              Thick sticker outline
            </label>
          </Panel>

          <Panel title="2. framing">
            <Slider label="Zoom" min={0.3} max={4} step={0.01} value={st.zoom} onChange={(v) => set('zoom', v)} display={`${st.zoom.toFixed(2)}×`} />
            <Slider label="Rotate" min={-180} max={180} step={1} value={st.rotate} onChange={(v) => set('rotate', v)} display={`${st.rotate}°`} />
            <div className="flex gap-2 mt-1">
              <button onClick={() => set('flip', !st.flip)} aria-pressed={st.flip} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold border-[2.5px] border-ink ${st.flip ? 'bg-ink text-white' : 'bg-white'}`}>
                <FlipHorizontal2 className="size-4" /> Flip
              </button>
              <button
                onClick={() => setSt((s) => ({ ...s, zoom: 1, rotate: 0, offsetX: 0, offsetY: 0, flip: false }))}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold border-[2.5px] border-ink bg-white"
              >
                <RotateCcw className="size-4" /> Reset
              </button>
              <span className="self-center text-xs font-semibold text-ink/50">Tip: drag the preview to move</span>
            </div>
          </Panel>

          <Panel title="3. background + caption">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => set('bg', 'transparent')}
                aria-label="Transparent background"
                aria-pressed={st.bg === 'transparent'}
                className={`size-9 rounded-full checker border-[2.5px] border-ink ${st.bg === 'transparent' ? 'ring-4 ring-ink/30 scale-110' : ''}`}
              />
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => set('bg', c)}
                  aria-label={`Background ${c}`}
                  aria-pressed={st.bg === c}
                  style={{ background: c }}
                  className={`size-9 rounded-full border-[2.5px] border-ink ${st.bg === c ? 'ring-4 ring-ink/30 scale-110' : ''}`}
                />
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={st.caption}
                onChange={(e) => set('caption', e.target.value.slice(0, 16))}
                placeholder="Caption (optional) e.g. NO CAP"
                className="flex-1 min-w-0 rounded-xl bg-white border-[2.5px] border-ink px-3 py-2 font-bold outline-none focus:bg-sun/20"
              />
              <select value={st.captionPos} onChange={(e) => set('captionPos', e.target.value as CaptionPos)} className="rounded-xl bg-white border-[2.5px] border-ink px-2 font-bold">
                <option value="bottom">Bottom</option>
                <option value="top">Top</option>
              </select>
            </div>
          </Panel>

          <Panel title="4. name it">
            <div className="grid gap-2">
              <label className="grid gap-1">
                <span className="text-sm font-extrabold">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 40))}
                  placeholder="e.g. Feral Raccoon"
                  className="rounded-xl bg-white border-[2.5px] border-ink px-3 py-2 font-bold outline-none focus:bg-sun/20"
                />
                <span className="font-mono text-xs text-ink/50">:{slugify(name || 'untitled-creation')}:</span>
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-extrabold">Tags (comma-separated)</span>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="raccoon, chaos, trash"
                  className="rounded-xl bg-white border-[2.5px] border-ink px-3 py-2 font-bold outline-none focus:bg-sun/20"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-sm font-extrabold">Description</span>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 120))}
                  placeholder="What's the lore?"
                  className="rounded-xl bg-white border-[2.5px] border-ink px-3 py-2 font-bold outline-none focus:bg-sun/20"
                />
              </label>
            </div>
          </Panel>

          <div className="flex flex-wrap gap-3">
            <button onClick={save} disabled={!img} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-lime px-5 py-3.5 font-extrabold text-lg sticker press disabled:opacity-50 disabled:pointer-events-none">
              <Save className="size-5" /> Save to my lab
            </button>
            <button onClick={downloadNow} disabled={!img} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 font-extrabold sticker press disabled:opacity-50 disabled:pointer-events-none">
              <Download className="size-5" /> PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white/70 border-[3px] border-ink p-4">
      <h2 className="font-display text-xl mb-3">{title}</h2>
      {children}
    </section>
  )
}

function Slider(props: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; display: string }) {
  return (
    <label className="grid grid-cols-[4rem_1fr_3.5rem] items-center gap-3 py-1">
      <span className="text-sm font-extrabold">{props.label}</span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="accent-bubblegum h-2"
      />
      <span className="font-mono text-xs text-right">{props.display}</span>
    </label>
  )
}

/** Mirrors the main preview canvas at a small size so you can judge legibility. */
function PreviewThumb({ canvas, className, deps }: { canvas: React.RefObject<HTMLCanvasElement | null>; className: string; deps: unknown[] }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    const id = requestAnimationFrame(() => canvas.current && setSrc(canvas.current.toDataURL('image/png')))
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return (
    <div className="grid place-items-center size-20 rounded-xl bg-white border-2 border-ink/15">
      {src && <img src={src} alt="" className={`${className} object-contain`} />}
    </div>
  )
}
