import type { Emoji } from '../types'
import { renderCursed } from './cursed'

/** Load any image src (SVG, PNG data URL or file URL) into an HTMLImageElement. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = src
  })
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png'),
  )
}

/** Draw an image to a PNG, preserving its aspect ratio. `maxSide` caps the longest edge (0 = natural size). */
async function rasterise(src: string, maxSide: number): Promise<Blob> {
  const img = await loadImage(src)
  const w = img.naturalWidth || 512
  const h = img.naturalHeight || 512
  const scale = maxSide > 0 ? maxSide / Math.max(w, h) : 1
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvasToPng(canvas)
}

/**
 * Get a PNG blob for an emoji.
 * - File-based / uploaded PNGs are returned byte-for-byte (original quality, original aspect ratio).
 * - Other raster formats are converted to PNG at their natural size.
 * - Generated SVG art is rasterised at `svgSize`.
 */
export async function emojiToPngBlob(emoji: Emoji, svgSize = 512): Promise<Blob> {
  if (emoji.recipe && !emoji.src) {
    const img = emoji.recipe.image ? await loadImage(emoji.recipe.image) : null
    return canvasToPng(renderCursed(emoji.recipe, svgSize, img))
  }
  if (emoji.svg) return rasterise(emoji.src, svgSize)
  const res = await fetch(emoji.src)
  if (!res.ok) throw new Error(`Emoji file missing (${res.status})`)
  const blob = await res.blob()
  if (blob.type === 'image/png') return blob
  if (!blob.type.startsWith('image/')) throw new Error('Emoji file is not an image')
  const url = URL.createObjectURL(blob)
  try {
    return await rasterise(url, 0)
  } finally {
    URL.revokeObjectURL(url)
  }
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function downloadPng(emoji: Emoji, size = 512) {
  const blob = await emojiToPngBlob(emoji, size)
  downloadBlob(blob, emoji.svg || emoji.recipe ? `${emoji.slug}-${size}.png` : `${emoji.slug}.png`)
}

export function downloadSvg(emoji: Emoji) {
  if (!emoji.svg) throw new Error('No SVG available for this emoji')
  downloadBlob(new Blob([emoji.svg], { type: 'image/svg+xml' }), `${emoji.slug}.svg`)
}

export function canCopyImage(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof ClipboardItem !== 'undefined' &&
    !!navigator.clipboard?.write &&
    (typeof ClipboardItem.supports !== 'function' || ClipboardItem.supports('image/png'))
  )
}

/** Copy the emoji as real PNG image data (paste into Discord, Slack, iMessage…). */
export async function copyImage(emoji: Emoji) {
  if (!canCopyImage()) throw new Error('Image copy not supported in this browser')
  // Passing a promise (not an awaited blob) keeps Safari's user-gesture requirement happy.
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': emojiToPngBlob(emoji, 320) })])
}

export type SendResult = 'copied' | 'downloaded'

/**
 * "Send" an emoji: copy the image to the clipboard, or download it if the
 * browser can't put images on the clipboard. Never copies just the name.
 */
export async function sendEmoji(emoji: Emoji): Promise<SendResult> {
  if (canCopyImage()) {
    try {
      await copyImage(emoji)
      return 'copied'
    } catch (err) {
      // Permission denied / unsupported at runtime → fall back to download.
      if (err instanceof Error && /missing|not an image/i.test(err.message)) throw err
    }
  }
  await downloadPng(emoji)
  return 'downloaded'
}

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  ta.remove()
  if (!ok) throw new Error('Copy failed')
}

export const shortcode = (e: Emoji) => `:${e.slug}:`
