/**
 * A tiny procedural "emoji art" engine.
 *
 * Every mock emoji is described by a small recipe (shape, eyes, mouth, extras)
 * and turned into an original SVG string. Keeping art in code means there are
 * no image files to manage and no licensing questions.
 */

export type Shape = 'circle' | 'blob' | 'squircle' | 'melt' | 'ghost' | 'star' | 'egg'
export type Eyes =
  | 'dots'
  | 'wide'
  | 'x'
  | 'happy'
  | 'sus'
  | 'spiral'
  | 'hearts'
  | 'stars'
  | 'tired'
  | 'side'
  | 'shiny'
  | 'closed'
  | 'none'
export type Mouth =
  | 'smile'
  | 'grin'
  | 'flat'
  | 'wobbly'
  | 'o'
  | 'frown'
  | 'tongue'
  | 'teeth'
  | 'smirk'
  | 'cat'
  | 'scream'
  | 'none'
export type Extra =
  | 'sweat'
  | 'blush'
  | 'tear'
  | 'tears'
  | 'sparkles'
  | 'shades'
  | 'crown'
  | 'halo'
  | 'steam'
  | 'clown'
  | 'flower'
  | 'fire'
  | 'brain'
  | 'cap'
  | 'hand'

export interface FaceRecipe {
  kind?: 'face'
  shape: Shape
  fill: string
  eyes: Eyes
  mouth: Mouth
  extras?: Extra[]
}

export interface StickerRecipe {
  kind: 'sticker'
  text: string
  fill: string
  ink?: string
  tilt?: number
}

export type ArtRecipe = FaceRecipe | StickerRecipe

const INK = '#111111'
const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`

function shapePath(shape: Shape): string {
  switch (shape) {
    case 'circle':
      return 'M64 14a52 52 0 1 1 0 104a52 52 0 1 1 0-104z'
    case 'squircle':
      return 'M46 14h36c22 0 34 12 34 34v36c0 22-12 34-34 34H46c-22 0-34-12-34-34V48c0-22 12-34 34-34z'
    case 'blob':
      return 'M66 12c26 0 50 16 50 46c0 30-18 58-52 58C30 116 12 94 12 66C12 34 36 12 66 12z'
    case 'egg':
      return 'M64 8c26 0 46 34 46 64c0 28-20 46-46 46S18 100 18 72C18 42 38 8 64 8z'
    case 'melt':
      return 'M64 12c29 0 52 22 52 50c0 10-2 18-6 24c-3 5-4 11-4 18c0 7-8 7-8 0c0-6-5-8-8-4c-3 5-3 14-10 14s-6-9-9-12c-3-3-7 0-8 6c-1 8-10 8-10 0c0-6-4-9-8-6c-4 3-5 10-11 9c-6-1-4-10-7-14C18 86 12 76 12 62c0-28 23-50 52-50z'
    case 'ghost':
      return 'M64 10c28 0 48 22 48 50v54l-12-8l-12 10l-12-10l-12 10l-12-10l-12 10l-12-10l-12 8V60c0-28 20-50 48-50z'
    case 'star':
      return 'M64 8l14 30l32 4l-24 22l7 32l-29-16l-29 16l7-32L18 42l32-4z'
  }
}

function eyesSvg(eyes: Eyes): string {
  const L = 46
  const R = 82
  const y = 56
  switch (eyes) {
    case 'dots':
      return `<ellipse cx="${L}" cy="${y}" rx="6" ry="9" fill="${INK}"/><ellipse cx="${R}" cy="${y}" rx="6" ry="9" fill="${INK}"/>`
    case 'wide':
      return [L, R]
        .map(
          (x) =>
            `<circle cx="${x}" cy="${y}" r="13" fill="#fff" ${S}/><circle cx="${x}" cy="${y + 1}" r="5" fill="${INK}"/>`,
        )
        .join('')
    case 'x':
      return [L, R]
        .map((x) => `<path d="M${x - 8} ${y - 8}l16 16M${x + 8} ${y - 8}l-16 16" fill="none" ${S}/>`)
        .join('')
    case 'happy':
      return [L, R].map((x) => `<path d="M${x - 9} ${y + 4}q9-14 18 0" fill="none" ${S}/>`).join('')
    case 'closed':
      return [L, R].map((x) => `<path d="M${x - 9} ${y}q9 10 18 0" fill="none" ${S}/>`).join('')
    case 'sus':
      return [L, R]
        .map(
          (x) =>
            `<path d="M${x - 11} ${y}h22" fill="none" ${S}/><ellipse cx="${x + 4}" cy="${y + 5}" rx="5" ry="4" fill="${INK}"/>`,
        )
        .join('')
    case 'side':
      return [L, R]
        .map(
          (x) =>
            `<ellipse cx="${x}" cy="${y}" rx="13" ry="10" fill="#fff" ${S}/><circle cx="${x + 7}" cy="${y}" r="5" fill="${INK}"/>`,
        )
        .join('')
    case 'spiral':
      return [L, R]
        .map(
          (x) =>
            `<path d="M${x} ${y}m-1 0a2 2 0 1 1 3 2a5 5 0 1 1-7-6a8 8 0 1 1 11 10" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
        )
        .join('')
    case 'hearts':
      return [L, R]
        .map(
          (x) =>
            `<path d="M${x} ${y + 9}l-10-10a6 6 0 0 1 10-8a6 6 0 0 1 10 8z" fill="#ff3b6b" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`,
        )
        .join('')
    case 'stars':
      return [L, R]
        .map(
          (x) =>
            `<path d="M${x} ${y - 11}l3 8l8 1l-6 5l2 8l-7-4l-7 4l2-8l-6-5l8-1z" fill="#ffd23f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
        )
        .join('')
    case 'tired':
      return [L, R]
        .map(
          (x) =>
            `<path d="M${x - 10} ${y - 2}h20" fill="none" ${S}/><path d="M${x - 8} ${y + 7}q8 5 16 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`,
        )
        .join('')
    case 'shiny':
      return [L, R]
        .map(
          (x) =>
            `<ellipse cx="${x}" cy="${y}" rx="11" ry="14" fill="${INK}"/><circle cx="${x - 4}" cy="${y - 6}" r="4.5" fill="#fff"/><circle cx="${x + 4}" cy="${y + 5}" r="2" fill="#fff"/>`,
        )
        .join('')
    case 'none':
      return ''
  }
}

function mouthSvg(mouth: Mouth): string {
  const y = 86
  switch (mouth) {
    case 'smile':
      return `<path d="M44 ${y - 2}q20 20 40 0" fill="none" ${S}/>`
    case 'grin':
      return `<path d="M40 ${y - 6}h48q-2 26-24 26t-24-26z" fill="${INK}" ${S}/><path d="M48 ${y + 10}q16 -8 32 0q-6 8-16 8t-16-8z" fill="#ff6b8a"/>`
    case 'flat':
      return `<path d="M48 ${y}h32" fill="none" ${S}/>`
    case 'wobbly':
      return `<path d="M42 ${y}q5-6 10 0t10 0t10 0t10 0" fill="none" ${S}/>`
    case 'o':
      return `<ellipse cx="64" cy="${y + 2}" rx="8" ry="10" fill="${INK}"/>`
    case 'frown':
      return `<path d="M46 ${y + 8}q18-16 36 0" fill="none" ${S}/>`
    case 'tongue':
      return `<path d="M44 ${y - 2}q20 16 40 0" fill="none" ${S}/><path d="M58 ${y + 4}v8a6 6 0 0 0 12 0v-9" fill="#ff6b8a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`
    case 'teeth':
      return `<rect x="40" y="${y - 8}" width="48" height="18" rx="6" fill="#fff" ${S}/><path d="M40 ${y + 1}h48M52 ${y - 8}v18M64 ${y - 8}v18M76 ${y - 8}v18" fill="none" stroke="${INK}" stroke-width="3"/>`
    case 'smirk':
      return `<path d="M50 ${y + 2}q18 4 30-10" fill="none" ${S}/>`
    case 'cat':
      return `<path d="M48 ${y - 2}q8 10 16 0q8 10 16 0" fill="none" ${S}/>`
    case 'scream':
      return `<ellipse cx="64" cy="${y + 4}" rx="12" ry="17" fill="${INK}"/><ellipse cx="64" cy="${y + 12}" rx="7" ry="5" fill="#ff6b8a"/>`
    case 'none':
      return ''
  }
}

function extraSvg(extra: Extra): string {
  switch (extra) {
    case 'sweat':
      return `<path d="M106 26q10 14 0 22q-10-8 0-22z" fill="#7cc8ff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`
    case 'blush':
      return `<ellipse cx="34" cy="74" rx="9" ry="5" fill="#ff7aa8" opacity=".8"/><ellipse cx="94" cy="74" rx="9" ry="5" fill="#ff7aa8" opacity=".8"/>`
    case 'tear':
      return `<path d="M40 66q-6 12 0 18q6-6 0-18z" fill="#7cc8ff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`
    case 'tears':
      return `<path d="M36 64q-4 20-14 40" fill="none" stroke="#7cc8ff" stroke-width="9" stroke-linecap="round"/><path d="M92 64q4 20 14 40" fill="none" stroke="#7cc8ff" stroke-width="9" stroke-linecap="round"/>`
    case 'sparkles':
      return `<path d="M108 10l3 8l8 3l-8 3l-3 8l-3-8l-8-3l8-3z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M18 96l2 5l5 2l-5 2l-2 5l-2-5l-5-2l5-2z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`
    case 'shades':
      return `<path d="M26 48h76" fill="none" ${S}/><path d="M28 48h32v6q0 12-16 12t-16-12z" fill="${INK}" ${S}/><path d="M68 48h32v6q0 12-16 12t-16-12z" fill="${INK}" ${S}/><path d="M34 52l8 0" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`
    case 'crown':
      return `<path d="M38 22l-4-20l16 12l14-14l14 14l16-12l-4 20z" fill="#ffd23f" ${S}/>`
    case 'halo':
      return `<ellipse cx="64" cy="8" rx="30" ry="6" fill="none" stroke="#ffd23f" stroke-width="7"/><ellipse cx="64" cy="8" rx="30" ry="6" fill="none" stroke="${INK}" stroke-width="2"/>`
    case 'steam':
      return `<path d="M14 30q-6-8 2-14q8-6 2-14" fill="none" stroke="#bbb" stroke-width="6" stroke-linecap="round"/><path d="M114 30q6-8-2-14q-8-6-2-14" fill="none" stroke="#bbb" stroke-width="6" stroke-linecap="round"/>`
    case 'clown':
      return `<circle cx="64" cy="72" r="9" fill="#ff3b3b" ${S}/>`
    case 'flower':
      return `<g transform="translate(100 24)">${[0, 72, 144, 216, 288]
        .map((a) => `<ellipse cx="0" cy="-9" rx="6" ry="9" transform="rotate(${a})" fill="#fff" stroke="${INK}" stroke-width="3"/>`)
        .join('')}<circle r="5" fill="#ffd23f" stroke="${INK}" stroke-width="3"/></g>`
    case 'fire':
      return `<path d="M64 2q14 14 6 28q10-4 10-14q12 16 2 30H46q-10-14 4-30q0 10 6 14q-6-16 8-28z" fill="#ff8a1f" ${S}/>`
    case 'brain':
      return `<path d="M34 30q-4-18 14-20q6-8 16-2q10-6 16 2q18 2 14 20z" fill="#ffb3d1" ${S}/><path d="M56 14q-2 8 4 14M74 14q2 8-4 14" fill="none" stroke="${INK}" stroke-width="3"/>`
    case 'cap':
      return `<path d="M24 38q4-30 40-30t40 30z" fill="#3d7bff" ${S}/><path d="M60 38h56q2 8-10 8H60z" fill="#3d7bff" ${S}/>`
    case 'hand':
      return `<path d="M88 118v-26q0-6 6-6t6 6v-12q0-6 6-6t6 6v38" fill="#ffd23f" ${S}/>`
  }
}

/** Darken a hex colour a little for the inner rim highlight. */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const c = (v: number) => Math.max(0, Math.min(255, v + amt))
  const r = c((n >> 16) & 255)
  const g = c((n >> 8) & 255)
  const b = c(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function faceSvg(r: FaceRecipe): string {
  const d = shapePath(r.shape)
  const extras = r.extras ?? []
  const isBehind = (e: Extra) => e === 'halo' || e === 'steam'
  const behind = extras.filter(isBehind)
  const front = extras.filter((e) => !isBehind(e))
  return [
    ...behind.map(extraSvg),
    `<path d="${d}" transform="translate(5 5)" fill="${INK}"/>`,
    `<path d="${d}" fill="${r.fill}" ${S}/>`,
    `<path d="${d}" fill="none" stroke="${shade(r.fill, 60)}" stroke-width="4" transform="translate(64 64) scale(.82) translate(-64 -64)" opacity=".5"/>`,
    eyesSvg(r.eyes),
    mouthSvg(r.mouth),
    ...front.map(extraSvg),
  ].join('')
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`)
}

function stickerSvg(r: StickerRecipe): string {
  const ink = r.ink ?? INK
  const text = escapeXml(r.text.toUpperCase())
  const size = text.length <= 2 ? 58 : text.length <= 4 ? 40 : text.length <= 6 ? 30 : 22
  const tilt = r.tilt ?? -8
  return `<g transform="rotate(${tilt} 64 64)">
<rect x="12" y="34" width="110" height="64" rx="16" fill="${INK}"/>
<rect x="6" y="28" width="110" height="64" rx="16" fill="${r.fill}" ${S}/>
<text x="61" y="${60 + size * 0.36}" text-anchor="middle" font-family="'Arial Black','Helvetica Neue',Impact,sans-serif" font-weight="900" font-size="${size}" fill="${ink}" letter-spacing="-1">${text}</text>
</g>`
}

export function renderArt(recipe: ArtRecipe): string {
  const body = recipe.kind === 'sticker' ? stickerSvg(recipe) : faceSvg(recipe)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 140 140" width="512" height="512">${body}</svg>`
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/* ---------- randomiser (used by the creator's "roll a base" button) ---------- */

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

export const PALETTE = ['#ffd23f', '#ff4fa3', '#c6ff3d', '#3d7bff', '#ff8a1f', '#b69cff', '#3dffb5', '#ff5b5b', '#7cc8ff'] as const

export function randomFace(): FaceRecipe {
  const extrasPool: Extra[] = ['sweat', 'blush', 'tear', 'sparkles', 'shades', 'crown', 'halo', 'steam', 'clown', 'flower', 'fire', 'cap']
  const extras = Math.random() < 0.7 ? [pick(extrasPool)] : []
  if (Math.random() < 0.3) extras.push(pick(extrasPool))
  return {
    shape: pick(['circle', 'blob', 'squircle', 'melt', 'ghost', 'egg'] as const),
    fill: pick(PALETTE),
    eyes: pick(['dots', 'wide', 'x', 'happy', 'sus', 'spiral', 'hearts', 'stars', 'tired', 'side', 'shiny', 'closed'] as const),
    mouth: pick(['smile', 'grin', 'flat', 'wobbly', 'o', 'frown', 'tongue', 'teeth', 'smirk', 'cat', 'scream'] as const),
    extras: [...new Set(extras)],
  }
}
