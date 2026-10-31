import { zipSync, strToU8 } from 'fflate'
import type { Emoji } from '../types'
import { renderCursed } from './cursed'
import { loadImage } from './emojiActions'

/**
 * Sticker pack export.
 *
 * Specs used:
 *  - WhatsApp (.wastickers zip): title.txt, author.txt, 96×96 PNG tray icon (≤50KB),
 *    3–30 stickers, each 512×512 WebP ≤100KB, transparent background, ~16px margin.
 *  - Telegram (@Stickers bot): PNG/WebP, one side exactly 512px, ≤512KB, sent as a file.
 *  - Discord custom emoji: PNG ≤256KB (128×128 recommended); name = filename, [a-z0-9_] 2–32 chars.
 *  - Discord server sticker: PNG ≤512KB, 320×320.
 */

export const WA_MIN = 3
export const WA_MAX = 30

export interface PackMeta {
  name: string
  author: string
  outline: boolean
}

/* ------------------------------------------------------------------ rendering */

/** Get the emoji's artwork as a canvas/image at roughly `size` px. Recipes are re-rendered crisp. */
async function artwork(emoji: Emoji, size: number): Promise<CanvasImageSource & { width: number; height: number }> {
  if (emoji.recipe) {
    const img = emoji.recipe.image ? await loadImage(emoji.recipe.image) : null
    return renderCursed(emoji.recipe, size, img)
  }
  const img = await loadImage(emoji.src)
  return Object.assign(img, { width: img.naturalWidth, height: img.naturalHeight })
}

/**
 * Render an emoji as a square sticker: centred, aspect ratio preserved, transparent margin,
 * optional white "die-cut" border like real stickers.
 */
export async function renderSticker(emoji: Emoji, size = 512, opts: { outline?: boolean; margin?: number } = {}): Promise<HTMLCanvasElement> {
  const outline = opts.outline ?? true
  const margin = opts.margin ?? Math.round(size * 0.03)
  const border = outline ? Math.max(2, Math.round(size * 0.022)) : 0
  const box = size - 2 * (margin + border)

  const art = await artwork(emoji, Math.max(256, box))
  const k = Math.min(box / art.width, box / art.height)
  const w = Math.round(art.width * k)
  const h = Math.round(art.height * k)
  const x = Math.round((size - w) / 2)
  const y = Math.round((size - h) / 2)

  const out = document.createElement('canvas')
  out.width = out.height = size
  const ctx = out.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'

  if (border) {
    // Build a white silhouette by stamping the art in a ring, then tinting it white.
    const sil = document.createElement('canvas')
    sil.width = sil.height = size
    const s = sil.getContext('2d')!
    const steps = 24
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2
      s.drawImage(art, x + Math.cos(a) * border, y + Math.sin(a) * border, w, h)
    }
    s.drawImage(art, x, y, w, h)
    s.globalCompositeOperation = 'source-in'
    s.fillStyle = '#ffffff'
    s.fillRect(0, 0, size, size)
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = size * 0.012
    ctx.drawImage(sil, 0, 0)
    ctx.shadowColor = 'transparent'
  }
  ctx.drawImage(art, x, y, w, h)
  return out
}

/* ------------------------------------------------------------------ encoding */

function toBlob(c: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('Image export failed'))), type, quality))
}

let webpSupport: boolean | null = null
/** Safari can't *encode* WebP from a canvas; Chrome, Edge, Firefox and Android can. */
export async function canEncodeWebp(): Promise<boolean> {
  if (webpSupport !== null) return webpSupport
  const c = document.createElement('canvas')
  c.width = c.height = 2
  try {
    const b = await toBlob(c, 'image/webp', 0.8)
    webpSupport = b.type === 'image/webp'
  } catch {
    webpSupport = false
  }
  return webpSupport
}

/** WebP under a byte budget (steps quality down until it fits). */
export async function toWebpUnder(c: HTMLCanvasElement, maxBytes: number): Promise<Blob> {
  for (const q of [0.92, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25]) {
    const b = await toBlob(c, 'image/webp', q)
    if (b.type !== 'image/webp') throw new Error('This browser can’t make WebP files. Try Chrome or Android.')
    if (b.size <= maxBytes) return b
  }
  throw new Error('Sticker too detailed to fit WhatsApp’s 100KB limit — try less deep-fry.')
}

/** PNG under a byte budget (scales down slightly if needed). */
export async function toPngUnder(c: HTMLCanvasElement, maxBytes: number): Promise<Blob> {
  let canvas = c
  for (let i = 0; i < 6; i++) {
    const b = await toBlob(canvas, 'image/png')
    if (b.size <= maxBytes) return b
    // shrink 10% but keep the canvas size (pad) so dimensions stay valid
    const scaled = document.createElement('canvas')
    scaled.width = c.width
    scaled.height = c.height
    const ctx = scaled.getContext('2d')!
    const f = 0.9 ** (i + 1)
    const w = c.width * f
    ctx.drawImage(c, (c.width - w) / 2, (c.height - w) / 2, w, w)
    canvas = scaled
  }
  return toBlob(canvas, 'image/png')
}

const bytes = async (b: Blob) => new Uint8Array(await b.arrayBuffer())

/** Discord emoji names: 2–32 chars of a-z, 0-9, _. Unique within the pack. */
export function discordName(name: string, used: Set<string>): string {
  let base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 28)
  if (base.length < 2) base = `cursed_${base || 'emoji'}`
  let n = base
  let i = 2
  while (used.has(n)) n = `${base}_${i++}`
  used.add(n)
  return n
}

export const fileSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'larpmoji-pack'

export type Progress = (done: number, total: number) => void

/* ------------------------------------------------------------------ pack builders */

/** WhatsApp .wastickers pack (zip). Import on Android with a sticker importer app. */
export async function buildWhatsAppPack(emojis: Emoji[], meta: PackMeta, onProgress?: Progress): Promise<Blob> {
  if (emojis.length < WA_MIN) throw new Error(`WhatsApp needs at least ${WA_MIN} stickers in a pack.`)
  if (emojis.length > WA_MAX) throw new Error(`WhatsApp packs can have at most ${WA_MAX} stickers.`)
  if (!(await canEncodeWebp())) throw new Error('This browser can’t make WhatsApp (WebP) stickers. Open the site in Chrome or on Android.')
  const files: Record<string, Uint8Array> = {
    'title.txt': strToU8(meta.name.trim() || 'LARPMOJI Pack'),
    'author.txt': strToU8(meta.author.trim() || 'LARPMOJI'),
  }
  // tray icon 96×96 PNG
  const tray = await renderSticker(emojis[0], 96, { outline: meta.outline, margin: 2 })
  files['tray.png'] = await bytes(await toPngUnder(tray, 50_000))
  for (let i = 0; i < emojis.length; i++) {
    const c = await renderSticker(emojis[i], 512, { outline: meta.outline, margin: 16 })
    files[`${String(i + 1).padStart(2, '0')}.webp`] = await bytes(await toWebpUnder(c, 100_000))
    onProgress?.(i + 1, emojis.length)
  }
  return new Blob([zipSync(files, { level: 0 }) as BlobPart], { type: 'application/zip' })
}

/** Telegram: 512×512 PNGs (≤512KB) + a cheat-sheet of emojis to send with each. */
export async function buildTelegramZip(emojis: Emoji[], meta: PackMeta, onProgress?: Progress): Promise<Blob> {
  const files: Record<string, Uint8Array> = {}
  const lines = [`${meta.name || 'LARPMOJI Pack'} — Telegram sticker files`, '', 'In Telegram, open @Stickers → /newpack → send each file AS A FILE, then its emoji:', '']
  for (let i = 0; i < emojis.length; i++) {
    const name = `${String(i + 1).padStart(2, '0')}.png`
    const c = await renderSticker(emojis[i], 512, { outline: meta.outline })
    files[name] = await bytes(await toPngUnder(c, 500_000))
    lines.push(`${name}  →  ${stickerEmoji(emojis[i])}   (${emojis[i].name})`)
    onProgress?.(i + 1, emojis.length)
  }
  lines.push('', 'Then: /publish → /skip (icon) → pick a short name → share t.me/addstickers/<short name>')
  files['HOW-TO.txt'] = strToU8(lines.join('\n'))
  return new Blob([zipSync(files, { level: 0 }) as BlobPart], { type: 'application/zip' })
}

/** Discord: custom emojis (128px, ≤256KB, filename = emoji name) and/or server stickers (320px, ≤512KB). */
export async function buildDiscordZip(emojis: Emoji[], meta: PackMeta, onProgress?: Progress): Promise<Blob> {
  const files: Record<string, Uint8Array> = {}
  const used = new Set<string>()
  const readme = [
    `${meta.name || 'LARPMOJI Pack'} — Discord pack`,
    '',
    'EMOJIS (folder "emojis"): Server Settings → Emoji → Upload Emoji → select ALL files at once.',
    '  The file name becomes the emoji name, e.g. :crispy_skull:',
    '  Free servers get 50 emoji slots.',
    '',
    'STICKERS (folder "stickers"): Server Settings → Stickers → Upload Sticker (one at a time).',
    '  Free servers get 5 sticker slots; boosts unlock more.',
    '',
  ]
  for (let i = 0; i < emojis.length; i++) {
    const e = emojis[i]
    const n = discordName(e.name, used)
    const em = await renderSticker(e, 128, { outline: false, margin: 2 })
    files[`emojis/${n}.png`] = await bytes(await toPngUnder(em, 256_000))
    const st = await renderSticker(e, 320, { outline: meta.outline })
    files[`stickers/${n}.png`] = await bytes(await toPngUnder(st, 500_000))
    readme.push(`:${n}:  related emoji ${stickerEmoji(e)}`)
    onProgress?.(i + 1, emojis.length)
  }
  files['HOW-TO.txt'] = strToU8(readme.join('\n'))
  return new Blob([zipSync(files, { level: 0 }) as BlobPart], { type: 'application/zip' })
}

/** The "real" emoji a sticker is linked to (Telegram & Discord ask for one). */
export function stickerEmoji(e: Emoji): string {
  const base = e.recipe?.base
  if (base) return base
  const fromTags = e.tags.find((t) => /\p{Extended_Pictographic}/u.test(t))
  return fromTags ?? '😂'
}

/* ------------------------------------------------------------------ delivery */

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function canShareFiles(files: File[]): boolean {
  return typeof navigator !== 'undefined' && !!navigator.canShare && navigator.canShare({ files })
}

/** Share one sticker to an app (WhatsApp, Telegram…) via the phone's share sheet. Falls back to download. */
export async function shareSticker(emoji: Emoji, outline: boolean): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const c = await renderSticker(emoji, 512, { outline, margin: 16 })
  const webp = await canEncodeWebp()
  const blob = webp ? await toWebpUnder(c, 100_000) : await toPngUnder(c, 500_000)
  const file = new File([blob], `${fileSlug(emoji.name)}.${webp ? 'webp' : 'png'}`, { type: blob.type })
  if (canShareFiles([file])) {
    try {
      await navigator.share({ files: [file] })
      return 'shared'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    }
  }
  downloadBlob(blob, file.name)
  return 'downloaded'
}

/** iPhone path: hand all stickers to the share sheet so they can be saved to Photos in one go. */
export async function shareAllAsImages(emojis: Emoji[], outline: boolean, onProgress?: Progress): Promise<'shared' | 'unsupported' | 'cancelled'> {
  const files: File[] = []
  for (let i = 0; i < emojis.length; i++) {
    const c = await renderSticker(emojis[i], 512, { outline })
    files.push(new File([await toPngUnder(c, 500_000)], `${String(i + 1).padStart(2, '0')}-${fileSlug(emojis[i].name)}.png`, { type: 'image/png' }))
    onProgress?.(i + 1, emojis.length)
  }
  if (!canShareFiles(files)) return 'unsupported'
  try {
    await navigator.share({ files })
    return 'shared'
  } catch {
    return 'cancelled'
  }
}
