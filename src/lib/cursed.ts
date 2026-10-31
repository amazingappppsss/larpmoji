/**
 * THE CURSED ENGINE
 *
 * Takes real emoji glyphs (rendered by the user's own device font: Apple, Google, Microsoft…)
 * or an uploaded image, and cooks them: bulging eyes, deep-frying, melting, swirling,
 * mash-ups and meme captions. Everything runs on a <canvas> in the browser.
 */

export interface Layer {
  /** emoji character(s) to stamp on top */
  char: string
  /** centre position + size as fractions of the canvas (0..1) */
  x: number
  y: number
  size: number
  rotate?: number
  flip?: boolean
}

export type Warp =
  | { kind: 'bulge'; x: number; y: number; r: number; amount: number } // amount > 0 magnifies, < 0 pinches
  | { kind: 'swirl'; x: number; y: number; r: number; amount: number } // radians at centre
  | { kind: 'melt'; amount: number } // 0..1
  | { kind: 'wave'; amount: number } // 0..1

export interface CursedRecipe {
  /** base emoji character(s). Ignored when `image` is set. */
  base?: string
  /** data/object URL of an uploaded image used as the base */
  image?: string
  baseScale?: number // default .82
  stretchX?: number // default 1
  stretchY?: number // default 1
  rotate?: number // degrees
  flip?: boolean
  under?: Layer[] // drawn behind the base
  layers?: Layer[] // drawn on top of the base
  warps?: Warp[]
  fry?: number // 0..1 deep-fry intensity
  pixelate?: number // 0..1
  hue?: number // degrees
  caption?: string
  captionPos?: 'top' | 'bottom'
  seed?: number
}

export const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif'

/* ------------------------------------------------------------------ helpers */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeCanvas(size: number) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas not supported')
  return { c, ctx }
}

/** Draw an emoji glyph centred (by its real ink bounds) at x,y with a given box size. */
function drawGlyph(ctx: CanvasRenderingContext2D, char: string, x: number, y: number, size: number, rotate = 0, flip = false) {
  ctx.save()
  ctx.translate(x, y)
  if (rotate) ctx.rotate((rotate * Math.PI) / 180)
  if (flip) ctx.scale(-1, 1)
  ctx.font = `${size}px ${EMOJI_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  const m = ctx.measureText(char)
  const asc = m.actualBoundingBoxAscent || size * 0.8
  const desc = m.actualBoundingBoxDescent || size * 0.1
  const left = m.actualBoundingBoxLeft || m.width / 2
  const right = m.actualBoundingBoxRight || m.width / 2
  ctx.fillText(char, (left - right) / 2, (asc - desc) / 2)
  ctx.restore()
}

function sampleBilinear(src: Uint8ClampedArray, w: number, h: number, x: number, y: number, out: Uint8ClampedArray, o: number) {
  if (x < 0 || y < 0 || x > w - 1 || y > h - 1) {
    out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0
    return
  }
  const x0 = x | 0
  const y0 = y | 0
  const x1 = Math.min(x0 + 1, w - 1)
  const y1 = Math.min(y0 + 1, h - 1)
  const fx = x - x0
  const fy = y - y0
  const i00 = (y0 * w + x0) * 4
  const i10 = (y0 * w + x1) * 4
  const i01 = (y1 * w + x0) * 4
  const i11 = (y1 * w + x1) * 4
  for (let k = 0; k < 4; k++) {
    const a = src[i00 + k] + (src[i10 + k] - src[i00 + k]) * fx
    const b = src[i01 + k] + (src[i11 + k] - src[i01 + k]) * fx
    out[o + k] = a + (b - a) * fy
  }
}

/** Apply a coordinate-mapping warp: map(dx, dy) returns the source pixel for each destination pixel. */
function remap(ctx: CanvasRenderingContext2D, s: number, map: (x: number, y: number) => [number, number] | null) {
  const img = ctx.getImageData(0, 0, s, s)
  const src = img.data
  const out = new Uint8ClampedArray(src.length)
  out.set(src)
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const m = map(x, y)
      if (m) sampleBilinear(src, s, s, m[0], m[1], out, (y * s + x) * 4)
    }
  }
  img.data.set(out)
  ctx.putImageData(img, 0, 0)
}

function applyWarp(ctx: CanvasRenderingContext2D, s: number, w: Warp, rand: () => number) {
  if (w.kind === 'bulge') {
    const cx = w.x * s
    const cy = w.y * s
    const r = w.r * s
    const power = 1 + w.amount // >1 magnify
    remap(ctx, s, (x, y) => {
      const dx = x - cx
      const dy = y - cy
      const d = Math.hypot(dx, dy) / r
      if (d >= 1) return null
      const f = Math.pow(d, power - 1)
      return [cx + dx * f, cy + dy * f]
    })
  } else if (w.kind === 'swirl') {
    const cx = w.x * s
    const cy = w.y * s
    const r = w.r * s
    remap(ctx, s, (x, y) => {
      const dx = x - cx
      const dy = y - cy
      const d = Math.hypot(dx, dy) / r
      if (d >= 1) return null
      const a = w.amount * (1 - d) * (1 - d)
      const cos = Math.cos(a)
      const sin = Math.sin(a)
      return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos]
    })
  } else if (w.kind === 'melt') {
    const p1 = rand() * 10
    const p2 = rand() * 10
    const p3 = rand() * 10
    remap(ctx, s, (x, y) => {
      const u = x / s
      const drip = 0.5 + 0.5 * Math.sin(u * 13 + p1) * Math.sin(u * 7.3 + p2) + 0.25 * Math.sin(u * 29 + p3)
      const t = y / s
      const dy = w.amount * s * 0.45 * Math.max(0, drip) * t * t
      return [x + Math.sin(t * 9 + p1) * w.amount * s * 0.012, y - dy]
    })
  } else if (w.kind === 'wave') {
    remap(ctx, s, (x, y) => [x + Math.sin((y / s) * Math.PI * 6) * w.amount * s * 0.06, y + Math.sin((x / s) * Math.PI * 4) * w.amount * s * 0.03])
  }
}

function deepFry(ctx: CanvasRenderingContext2D, s: number, amount: number, rand: () => number) {
  const img = ctx.getImageData(0, 0, s, s)
  const d = img.data
  const contrast = 1 + amount * 2.2
  const sat = 1 + amount * 3.2
  const levels = Math.round(32 - amount * 26)
  const step = 255 / Math.max(2, levels)
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue
    let r = d[i]
    let g = d[i + 1]
    let b = d[i + 2]
    const l = 0.299 * r + 0.587 * g + 0.114 * b
    r = l + (r - l) * sat
    g = l + (g - l) * sat
    b = l + (b - l) * sat
    r = (r - 128) * contrast + 128 + amount * 70
    g = (g - 128) * contrast + 128 + amount * 10
    b = (b - 128) * contrast + 128 - amount * 80
    const n = (rand() - 0.5) * 120 * amount
    d[i] = Math.round((r + n) / step) * step
    d[i + 1] = Math.round((g + n) / step) * step
    d[i + 2] = Math.round((b + n) / step) * step
  }
  // sharpen pass (unsharp-ish) for that crunchy edge
  const src = new Uint8ClampedArray(d)
  const k = amount * 1.4
  for (let y = 1; y < s - 1; y++) {
    for (let x = 1; x < s - 1; x++) {
      const o = (y * s + x) * 4
      if (src[o + 3] === 0) continue
      for (let c = 0; c < 3; c++) {
        const lap = 4 * src[o + c] - src[o - 4 + c] - src[o + 4 + c] - src[o - s * 4 + c] - src[o + s * 4 + c]
        d[o + c] = src[o + c] + lap * k
      }
    }
  }
  ctx.putImageData(img, 0, 0)
}

function hueRotate(ctx: CanvasRenderingContext2D, s: number, deg: number) {
  const { c, ctx: t } = makeCanvas(s)
  t.filter = `hue-rotate(${deg}deg)`
  t.drawImage(ctx.canvas, 0, 0)
  ctx.clearRect(0, 0, s, s)
  ctx.drawImage(c, 0, 0)
}

function pixelate(ctx: CanvasRenderingContext2D, s: number, amount: number) {
  const block = Math.max(2, Math.round(2 + amount * 22))
  const small = Math.max(4, Math.round(s / block))
  const { c, ctx: t } = makeCanvas(small)
  t.imageSmoothingEnabled = true
  t.drawImage(ctx.canvas, 0, 0, small, small)
  ctx.clearRect(0, 0, s, s)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(c, 0, 0, s, s)
  ctx.imageSmoothingEnabled = true
}

function drawCaption(ctx: CanvasRenderingContext2D, s: number, text: string, pos: 'top' | 'bottom') {
  const t = text.toUpperCase()
  let size = s * 0.24
  const font = (px: number) => `${px}px Anton, Impact, "Arial Black", sans-serif`
  ctx.font = font(size)
  while (ctx.measureText(t).width > s * 0.94 && size > 8) ctx.font = font((size -= 2))
  ctx.textAlign = 'center'
  ctx.textBaseline = pos === 'top' ? 'top' : 'bottom'
  const y = pos === 'top' ? s * 0.02 : s * 0.98
  ctx.lineJoin = 'round'
  ctx.lineWidth = size * 0.2
  ctx.strokeStyle = '#000'
  ctx.strokeText(t, s / 2, y)
  ctx.fillStyle = '#fff'
  ctx.fillText(t, s / 2, y)
}

/* ------------------------------------------------------------------ main */

/** Render a recipe to a fresh canvas. `image` must already be loaded when the recipe uses one. */
export function renderCursed(recipe: CursedRecipe, size = 256, image?: HTMLImageElement | null): HTMLCanvasElement {
  const { c, ctx } = makeCanvas(size)
  const rand = mulberry32(recipe.seed ?? 1)
  const s = size
  const L = (l: Layer) => drawGlyph(ctx, l.char, l.x * s, l.y * s, l.size * s, l.rotate, l.flip)

  recipe.under?.forEach(L)

  // base
  ctx.save()
  ctx.translate(s / 2, s / 2)
  ctx.scale(recipe.stretchX ?? 1, recipe.stretchY ?? 1)
  if (recipe.rotate) ctx.rotate((recipe.rotate * Math.PI) / 180)
  if (recipe.flip) ctx.scale(-1, 1)
  const bs = (recipe.baseScale ?? 0.82) * s
  if (image) {
    const k = Math.min(bs / image.naturalWidth, bs / image.naturalHeight) * 1.15
    const w = image.naturalWidth * k
    const h = image.naturalHeight * k
    ctx.drawImage(image, -w / 2, -h / 2, w, h)
  } else if (recipe.base) {
    drawGlyph(ctx, recipe.base, 0, 0, bs)
  }
  ctx.restore()

  recipe.layers?.forEach(L)
  recipe.warps?.forEach((w) => applyWarp(ctx, s, w, rand))
  if (recipe.hue) hueRotate(ctx, s, recipe.hue)
  if (recipe.fry) deepFry(ctx, s, recipe.fry, rand)
  if (recipe.pixelate) pixelate(ctx, s, recipe.pixelate)
  if (recipe.caption?.trim()) drawCaption(ctx, s, recipe.caption.trim(), recipe.captionPos ?? 'bottom')
  return c
}

/* ------------------------------------------------------------------ cache + queue (keeps the UI smooth with hundreds of emojis) */

const cache = new Map<string, string>()
const pending = new Map<string, ((url: string) => void)[]>()
const queue: { key: string; recipe: CursedRecipe; size: number }[] = []
let running = false

export const recipeKey = (r: CursedRecipe, size: number) => `${size}|${JSON.stringify(r)}`

export function getCachedCursed(recipe: CursedRecipe, size = 256): string | undefined {
  return cache.get(recipeKey(recipe, size))
}

// Captions use the Anton web font — wait for it (max 2.5s) so first renders don't use a fallback font.
let fontsReady: Promise<unknown> | null = null
function waitForFonts() {
  if (!fontsReady) {
    const load = typeof document !== 'undefined' && document.fonts ? document.fonts.load('48px Anton', 'BRUH').catch(() => undefined) : Promise.resolve()
    fontsReady = Promise.race([load, new Promise((r) => setTimeout(r, 2500))])
  }
  return fontsReady
}

function pump() {
  if (running) return
  running = true
  void waitForFonts().then(() => requestAnimationFrame(tick))

  function tick() {
    const start = performance.now()
    while (queue.length && performance.now() - start < 12) {
      const job = queue.shift()!
      let url = ''
      try {
        url = renderCursed(job.recipe, job.size).toDataURL('image/png')
      } catch {
        url = ''
      }
      cache.set(job.key, url)
      pending.get(job.key)?.forEach((cb) => cb(url))
      pending.delete(job.key)
    }
    if (queue.length) requestAnimationFrame(tick)
    else running = false
  }
}

/** Queue a render; resolves with a PNG data URL. Rendering is spread over frames. */
export function requestCursed(recipe: CursedRecipe, size = 256): Promise<string> {
  const key = recipeKey(recipe, size)
  const hit = cache.get(key)
  if (hit !== undefined) return Promise.resolve(hit)
  return new Promise((resolve) => {
    if (pending.has(key)) pending.get(key)!.push(resolve)
    else {
      pending.set(key, [resolve])
      queue.push({ key, recipe, size })
      pump()
    }
  })
}

/* ------------------------------------------------------------------ face anatomy helpers (positions on a standard emoji face) */

export const FACE = {
  eyeL: { x: 0.37, y: 0.42 },
  eyeR: { x: 0.63, y: 0.42 },
  mouth: { x: 0.5, y: 0.66 },
}

export const bigEyes = (amount = 1.1, r = 0.17): Warp[] => [
  { kind: 'bulge', x: FACE.eyeL.x, y: FACE.eyeL.y, r, amount },
  { kind: 'bulge', x: FACE.eyeR.x, y: FACE.eyeR.y, r, amount },
]
export const bigMouth = (amount = 1, r = 0.22): Warp => ({ kind: 'bulge', x: FACE.mouth.x, y: FACE.mouth.y, r, amount })
export const eyesOf = (char: string, size = 0.2, dy = 0): Layer[] => [
  { char, x: FACE.eyeL.x, y: FACE.eyeL.y + dy, size },
  { char, x: FACE.eyeR.x, y: FACE.eyeR.y + dy, size },
]
export const mouthOf = (char: string, size = 0.24, dy = 0): Layer => ({ char, x: FACE.mouth.x, y: FACE.mouth.y + dy, size })

/* ------------------------------------------------------------------ random generator (endless feed + "cursify") */

export const BASE_FACES = ['😂', '🤣', '😭', '🙂', '😀', '😃', '😳', '🥺', '😐', '🤨', '😎', '🤠', '🥴', '😬', '🙃', '😏', '🤡', '💀', '🗿', '😩', '🥶', '🤯', '😈', '🫠', '😶', '🤓', '😵‍💫', '🫡', '😮', '🐸', '🐶', '🐱', '🌚', '🌝'] as const
const DECOR = ['🔥', '✨', '💯', '💧', '👁️', '👄', '🫦', '👉', '👈', '🙏', '💅', '🤌', '🧢', '📸', '🎺', '⚡', '💥', '🍷', '☕', '🌈', '👑', '🔪'] as const
const CAPTIONS = ['bruh', 'no cap', 'sus', 'mid', "i'm dead", 'real', 'ratio', 'based', 'slay', 'help', 'why', 'L', 'W', 'fr fr', 'ok and?', 'nah', 'skill issue', 'lore', 'delulu', 'oh no']

export function randomRecipe(seed: number, base?: string): CursedRecipe {
  const r = mulberry32(seed)
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)]
  const recipe: CursedRecipe = { base: base ?? pick(BASE_FACES), seed }
  const warps: Warp[] = []
  const layers: Layer[] = []
  const roll = r()
  if (roll < 0.35) warps.push(...bigEyes(0.7 + r() * 0.9))
  else if (roll < 0.5) layers.push(...eyesOf(pick(['👁️', '👁️', '🔴', '⭐', '💀', '🌀', '😳']), 0.16 + r() * 0.08))
  else if (roll < 0.6) warps.push({ kind: 'swirl', x: 0.5, y: 0.5, r: 0.45, amount: (r() < 0.5 ? -1 : 1) * (2 + r() * 3) })
  if (r() < 0.25) layers.push(mouthOf(pick(['👄', '🫦', '👅']), 0.22))
  if (r() < 0.3) warps.push(bigMouth(0.6 + r() * 0.8))
  if (r() < 0.3) warps.push({ kind: 'melt', amount: 0.35 + r() * 0.5 })
  if (r() < 0.15) warps.push({ kind: 'wave', amount: 0.3 + r() * 0.5 })
  if (r() < 0.3) {
    const d = pick(DECOR)
    layers.push({ char: d, x: 0.15 + r() * 0.7, y: r() < 0.5 ? 0.14 : 0.84, size: 0.24, rotate: (r() - 0.5) * 40 })
  }
  if (r() < 0.25) recipe.stretchX = 1 + r() * 0.35
  else if (r() < 0.15) recipe.stretchY = 1 + r() * 0.3
  if (r() < 0.35) recipe.fry = 0.3 + r() * 0.6
  if (r() < 0.08) recipe.pixelate = 0.3 + r() * 0.4
  if (r() < 0.1) recipe.hue = Math.round(60 + r() * 240)
  if (r() < 0.22) recipe.caption = pick(CAPTIONS)
  if (warps.length + layers.length === 0 && !recipe.fry && !recipe.caption) warps.push(...bigEyes(1.2))
  if (warps.length) recipe.warps = warps
  if (layers.length) recipe.layers = layers
  return recipe
}
