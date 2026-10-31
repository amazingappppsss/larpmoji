/**
 * CUTE ENGINE: original kawaii "premium" emojis drawn as SVG.
 * Soft 3D look: gradient body, glossy highlight, rim light, blush, sparkly eyes.
 */

export type Body = 'mochi' | 'round' | 'bunny' | 'cat' | 'bear' | 'frog' | 'chick' | 'ghost' | 'cloud' | 'heart'
export type Eyes =
  | 'dot'
  | 'sparkle'
  | 'happy'
  | 'content'
  | 'wink'
  | 'heart'
  | 'star'
  | 'teary'
  | 'shy'
  | 'sleepy'
  | 'surprised'
  | 'smug'
  | 'dizzy'
  | 'cry'
export type Mouth = 'w' | 'smile' | 'open' | 'o' | 'pout' | 'tongue' | 'wobble' | 'cat' | 'frown' | 'tiny' | 'none'
export type Extra =
  | 'bow'
  | 'hearts'
  | 'sparkles'
  | 'sweat'
  | 'zzz'
  | 'halo'
  | 'crown'
  | 'flower'
  | 'anger'
  | 'note'
  | 'bubble'
  | 'holdheart'
  | 'stars'
  | 'cheeklines'

export interface CuteRecipe {
  body: Body
  color: string
  eyes: Eyes
  mouth: Mouth
  extras?: Extra[]
  blush?: boolean
  /** extra accent colour for bows, hearts, etc. */
  accent?: string
}

/* ---------- colour helpers */
function hexToRgb(h: string) {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`
}
function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t)
}
const lighten = (c: string, t: number) => mix(c, '#ffffff', t)
const darken = (c: string, t: number) => mix(c, '#3b2440', t)

const INK = '#3b2a4a'

/* ---------- body geometry (viewBox 0 0 160 160, body centred ~ (80, 92)) */
function bodyPath(body: Body): string {
  switch (body) {
    case 'round':
    case 'chick':
      return 'M80 36a56 56 0 1 1 0 112a56 56 0 1 1 0-112z'
    case 'ghost':
      return 'M80 30c30 0 52 22 52 52v52c0 6-6 8-10 4l-8-7-10 9c-3 3-7 3-10 0l-10-9-10 9c-3 3-7 3-10 0l-10-9-8 7c-4 4-10 2-10-4V82c0-30 22-52 52-52z'
    case 'cloud':
      return 'M44 136c-18 0-30-12-30-28 0-15 11-26 25-28 2-22 20-38 41-38 18 0 33 11 38 27 16 1 28 14 28 31 0 20-14 36-34 36z'
    case 'heart':
      return 'M80 142C40 116 18 94 18 68c0-20 15-34 33-34 13 0 23 7 29 17 6-10 16-17 29-17 18 0 33 14 33 34 0 26-22 48-62 74z'
    default:
      // mochi / bunny / cat / bear / frog: squishy ellipse
      return 'M80 40c38 0 62 24 62 54 0 30-24 50-62 50S18 124 18 94c0-30 24-54 62-54z'
  }
}

function ears(body: Body, fill: string, inner: string, stroke: string): string {
  const s = `stroke="${stroke}" stroke-width="2.5" stroke-opacity=".35"`
  switch (body) {
    case 'bunny':
      return `<g>
<ellipse cx="56" cy="34" rx="13" ry="32" transform="rotate(-14 56 34)" fill="${fill}" ${s}/>
<ellipse cx="56" cy="36" rx="6" ry="22" transform="rotate(-14 56 36)" fill="${inner}"/>
<ellipse cx="104" cy="34" rx="13" ry="32" transform="rotate(14 104 34)" fill="${fill}" ${s}/>
<ellipse cx="104" cy="36" rx="6" ry="22" transform="rotate(14 104 36)" fill="${inner}"/></g>`
    case 'cat':
      return `<g>
<path d="M30 70 L36 26 Q38 20 44 24 L70 46 Z" fill="${fill}" ${s} stroke-linejoin="round"/>
<path d="M40 56 L42 34 L58 47 Z" fill="${inner}"/>
<path d="M130 70 L124 26 Q122 20 116 24 L90 46 Z" fill="${fill}" ${s} stroke-linejoin="round"/>
<path d="M120 56 L118 34 L102 47 Z" fill="${inner}"/></g>`
    case 'bear':
      return `<g>
<circle cx="40" cy="50" r="17" fill="${fill}" ${s}/><circle cx="40" cy="50" r="9" fill="${inner}"/>
<circle cx="120" cy="50" r="17" fill="${fill}" ${s}/><circle cx="120" cy="50" r="9" fill="${inner}"/></g>`
    case 'frog':
      return `<g>
<circle cx="52" cy="50" r="20" fill="${fill}" ${s}/>
<circle cx="108" cy="50" r="20" fill="${fill}" ${s}/></g>`
    default:
      return ''
  }
}

/* ---------- face parts */
function eyePositions(body: Body) {
  if (body === 'frog') return { L: 52, R: 108, y: 50 }
  if (body === 'heart') return { L: 60, R: 100, y: 78 }
  if (body === 'cloud') return { L: 64, R: 100, y: 94 }
  if (body === 'ghost') return { L: 64, R: 96, y: 76 }
  return { L: 60, R: 100, y: 86 }
}
function mouthY(body: Body) {
  if (body === 'frog') return 102
  if (body === 'heart') return 96
  if (body === 'ghost') return 96
  if (body === 'cloud') return 112
  return 104
}

const sparkleEye = (x: number, y: number, s = 1, iris = '#5b3d7a') => `
<ellipse cx="${x}" cy="${y}" rx="${9 * s}" ry="${11.5 * s}" fill="url(#eyeGrad)"/>
<ellipse cx="${x}" cy="${y + 5 * s}" rx="${6 * s}" ry="${4 * s}" fill="${iris}" opacity=".55"/>
<circle cx="${x - 3.2 * s}" cy="${y - 4.5 * s}" r="${3.6 * s}" fill="#fff"/>
<circle cx="${x + 3.5 * s}" cy="${y + 4 * s}" r="${1.7 * s}" fill="#fff" opacity=".9"/>`

function eyesSvg(eyes: Eyes, body: Body, accent: string): string {
  const { L, R, y } = eyePositions(body)
  const st = `fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"`
  const both = (f: (x: number) => string) => f(L) + f(R)
  switch (eyes) {
    case 'dot':
      return both((x) => `<ellipse cx="${x}" cy="${y}" rx="5.2" ry="6.8" fill="${INK}"/><circle cx="${x - 1.6}" cy="${y - 2.4}" r="1.9" fill="#fff"/>`)
    case 'sparkle':
      return both((x) => sparkleEye(x, y))
    case 'happy':
      return both((x) => `<path d="M${x - 8} ${y + 3}q8-11 16 0" ${st}/>`)
    case 'content':
      return both((x) => `<path d="M${x - 8} ${y - 1}q8 9 16 0" ${st}/>`)
    case 'wink':
      return sparkleEye(L, y) + `<path d="M${R - 8} ${y + 2}q8-10 16 0" ${st}/>`
    case 'heart':
      return both(
        (x) =>
          `<path d="M${x} ${y + 9}l-9.5-9.5a5.8 5.8 0 0 1 9.5-7.2a5.8 5.8 0 0 1 9.5 7.2z" fill="${accent}" stroke="${darken(accent, 0.25)}" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="${x - 4}" cy="${y - 3}" rx="2.4" ry="1.6" fill="#fff" opacity=".85"/>`,
      )
    case 'star':
      return both(
        (x) =>
          `<path d="M${x} ${y - 11}l3.2 7.2 7.8.8-5.9 5.2 1.7 7.7-6.8-4-6.8 4 1.7-7.7-5.9-5.2 7.8-.8z" fill="#ffd66b" stroke="#e8a93a" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${x - 2}" cy="${y - 3}" r="1.6" fill="#fff"/>`,
      )
    case 'teary':
      return both(
        (x) =>
          sparkleEye(x, y, 1.08) +
          `<path d="M${x - 9} ${y + 7}q9 6 18 0" fill="#9fd8ff" opacity=".85"/><path d="M${x + (x === L ? -6 : 6)} ${y + 12}q-3 8 0 12q3-4 0-12z" fill="#9fd8ff" stroke="#6fb7ea" stroke-width="1"/>`,
      )
    case 'shy':
      return `<path d="M${L - 7} ${y - 6}l11 6-11 6" ${st}/><path d="M${R + 7} ${y - 6}l-11 6 11 6" ${st}/>`
    case 'sleepy':
      return both((x) => `<path d="M${x - 8} ${y + 1}q8 6 16 0" ${st}/><path d="M${x - 9} ${y + 1}l-3 3M${x + 9} ${y + 1}l3 3" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`)
    case 'surprised':
      return both((x) => `<circle cx="${x}" cy="${y}" r="8" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="3.6" fill="${INK}"/><circle cx="${x - 1.2}" cy="${y - 1.4}" r="1.1" fill="#fff"/>`)
    case 'smug':
      return both((x) => `<ellipse cx="${x}" cy="${y + 2}" rx="6" ry="5" fill="${INK}"/><path d="M${x - 9} ${y - 1}h18" ${st}/><circle cx="${x - 2}" cy="${y + 2}" r="1.5" fill="#fff"/>`)
    case 'dizzy':
      return both((x) => `<path d="M${x} ${y}m-1 0a1.8 1.8 0 1 1 2.8 1.6a4.6 4.6 0 1 1-6.4-5.2a7.4 7.4 0 1 1 10 9" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`)
    case 'cry':
      return both(
        (x) =>
          `<path d="M${x - 8} ${y}q8 7 16 0" ${st}/><path d="M${x + (x === L ? -4 : 4)} ${y + 4}v22" stroke="#9fd8ff" stroke-width="7" stroke-linecap="round" opacity=".95"/><path d="M${x + (x === L ? -5 : 3)} ${y + 8}v6" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`,
      )
  }
}

function mouthSvg(mouth: Mouth, body: Body): string {
  const y = mouthY(body)
  const st = `fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`
  switch (mouth) {
    case 'w':
      return `<path d="M68 ${y - 2}q6 7 12 0q6 7 12 0" ${st}/>`
    case 'smile':
      return `<path d="M71 ${y - 2}q9 8 18 0" ${st}/>`
    case 'open':
      return `<path d="M68 ${y - 4}h24q0 15-12 15t-12-15z" fill="#7a3048" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M73 ${y + 6}q7-6 14 0q-2 4-7 4t-7-4z" fill="#ff8fab"/>`
    case 'o':
      return `<ellipse cx="80" cy="${y + 1}" rx="5" ry="6" fill="#7a3048" stroke="${INK}" stroke-width="2.5"/>`
    case 'pout':
      return `<path d="M76 ${y - 5}q6 3 0 5q6 2 0 5" ${st}/>`
    case 'tongue':
      return `<path d="M70 ${y - 3}q10 9 20 0" ${st}/><path d="M80 ${y + 1}v5a5 5 0 0 0 10 0v-6" fill="#ff8fab" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`
    case 'wobble':
      return `<path d="M68 ${y}q3-4 6 0t6 0t6 0t6 0" ${st}/>`
    case 'cat':
      return `<path d="M72 ${y - 3}q4 6 8 0q4 6 8 0" ${st}/>`
    case 'frown':
      return `<path d="M72 ${y + 4}q8-8 16 0" ${st}/>`
    case 'tiny':
      return `<path d="M77 ${y}h6" ${st}/>`
    case 'none':
      return ''
  }
}

function blushSvg(body: Body, lines: boolean): string {
  const { L, R, y } = eyePositions(body)
  const by = body === 'frog' ? 96 : y + 15
  const lx = body === 'frog' ? 46 : L - 8
  const rx = body === 'frog' ? 114 : R + 8
  let s = `<ellipse cx="${lx}" cy="${by}" rx="11" ry="6.5" fill="#ff8fb1" opacity=".55" filter="url(#soft)"/><ellipse cx="${rx}" cy="${by}" rx="11" ry="6.5" fill="#ff8fb1" opacity=".55" filter="url(#soft)"/>`
  if (lines)
    s += [lx, rx]
      .map((x) => `<path d="M${x - 6} ${by + 2}l3-5M${x - 1} ${by + 2}l3-5M${x + 4} ${by + 2}l3-5" stroke="#e85d8a" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>`)
      .join('')
  return s
}

function heartPath(x: number, y: number, s: number, fill: string) {
  return `<path transform="translate(${x} ${y}) scale(${s})" d="M0 8l-8-8a5 5 0 0 1 8-6a5 5 0 0 1 8 6z" fill="${fill}" stroke="${darken(fill, 0.25)}" stroke-width="${1.2 / s}" stroke-linejoin="round"/><ellipse transform="translate(${x} ${y}) scale(${s})" cx="-3.5" cy="-2.5" rx="1.8" ry="1.2" fill="#fff" opacity=".8"/>`
}
function sparkle(x: number, y: number, s: number, fill = '#fff') {
  return `<path transform="translate(${x} ${y}) scale(${s})" d="M0-10C1-3 3-1 10 0C3 1 1 3 0 10C-1 3-3 1-10 0C-3-1-1-3 0-10z" fill="${fill}" stroke="#e7b9ff" stroke-width="${1.2 / s}"/>`
}

function extraSvg(e: Extra, body: Body, accent: string): { back?: string; front?: string } {
  const topY = body === 'bunny' || body === 'cat' || body === 'bear' || body === 'frog' ? 34 : 38
  switch (e) {
    case 'bow':
      return {
        front: `<g transform="translate(${body === 'bunny' ? 104 : 112} ${body === 'bunny' ? 50 : 46}) rotate(18)">
<path d="M0 0c-6-10-22-14-22-2s16 8 22 2z" fill="${accent}" stroke="${darken(accent, 0.3)}" stroke-width="1.6"/>
<path d="M0 0c6-10 22-14 22-2s-16 8-22 2z" fill="${accent}" stroke="${darken(accent, 0.3)}" stroke-width="1.6"/>
<path d="M-2 2l-6 12M2 2l6 12" stroke="${darken(accent, 0.15)}" stroke-width="4" stroke-linecap="round"/>
<circle r="5" fill="${lighten(accent, 0.2)}" stroke="${darken(accent, 0.3)}" stroke-width="1.6"/>
<path d="M-16-4q4-3 8-1" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".7"/></g>`,
      }
    case 'hearts':
      return { front: heartPath(132, 40, 1.2, accent) + heartPath(144, 64, 0.8, lighten(accent, 0.2)) + heartPath(26, 46, 0.7, accent) }
    case 'sparkles':
      return { front: sparkle(134, 36, 1, '#fffbe6') + sparkle(24, 60, 0.7, '#fffbe6') + sparkle(140, 108, 0.55, '#fffbe6') }
    case 'stars':
      return { front: sparkle(130, 30, 0.9, '#ffe27a') + sparkle(28, 40, 0.65, '#ffe27a') }
    case 'sweat':
      return { front: `<path d="M128 56q10 14 0 21q-10-7 0-21z" fill="#bfe6ff" stroke="#7cc4f0" stroke-width="1.8"/><ellipse cx="125" cy="68" rx="1.6" ry="3" fill="#fff"/>` }
    case 'zzz':
      return {
        front: `<g fill="none" stroke="#9b8cff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M118 34h11l-11 11h11"/><path d="M134 16h8l-8 8h8" stroke-width="2.6"/></g>`,
      }
    case 'halo':
      return { back: `<ellipse cx="80" cy="${topY - 14}" rx="28" ry="7" fill="none" stroke="#ffe27a" stroke-width="6"/><ellipse cx="80" cy="${topY - 14}" rx="28" ry="7" fill="none" stroke="#fff6c8" stroke-width="2"/>` }
    case 'crown':
      return {
        front: `<g transform="translate(80 ${topY + 2})"><path d="M-22 6l-3-22 12 10 13-16 13 16 12-10-3 22z" fill="#ffd66b" stroke="#d9a033" stroke-width="2" stroke-linejoin="round"/><circle cx="0" cy="-2" r="3.5" fill="#ff8fb1"/><circle cx="-14" cy="0" r="2.5" fill="#9fd8ff"/><circle cx="14" cy="0" r="2.5" fill="#9fd8ff"/></g>`,
      }
    case 'flower':
      return {
        front: `<g transform="translate(46 ${topY + 12})">${[0, 72, 144, 216, 288]
          .map((a) => `<ellipse cx="0" cy="-8" rx="6" ry="8.5" transform="rotate(${a})" fill="#fff" stroke="#f3c6dd" stroke-width="1.5"/>`)
          .join('')}<circle r="5" fill="#ffd66b" stroke="#e8a93a" stroke-width="1.4"/></g>`,
      }
    case 'anger':
      return { front: `<g transform="translate(124 42)" stroke="#ff5d7a" stroke-width="4" stroke-linecap="round" fill="none"><path d="M-8-3q5 0 5-5M8-3q-5 0-5-5M-8 3q5 0 5 5M8 3q-5 0-5 5"/></g>` }
    case 'note':
      return { front: `<g transform="translate(130 40)" fill="#9b8cff"><path d="M0 0v-18l12-4v18" stroke="#9b8cff" stroke-width="3" fill="none"/><ellipse cx="-3" cy="1" rx="5" ry="4"/><ellipse cx="9" cy="-3" rx="5" ry="4"/></g>` }
    case 'bubble':
      return { front: `<circle cx="96" cy="118" r="9" fill="#d9f1ff" stroke="#a5d8f5" stroke-width="1.6" opacity=".95"/><circle cx="93" cy="115" r="2.6" fill="#fff"/>` }
    case 'holdheart':
      return {
        front:
          heartPath(80, 128, 1.9, accent) +
          `<ellipse cx="62" cy="134" rx="9" ry="7" fill="url(#bodyGrad)" stroke="#3b2440" stroke-opacity=".3" stroke-width="2"/><ellipse cx="98" cy="134" rx="9" ry="7" fill="url(#bodyGrad)" stroke="#3b2440" stroke-opacity=".3" stroke-width="2"/>`,
      }
    case 'cheeklines':
      return {}
  }
}

export function renderCute(r: CuteRecipe): string {
  const base = r.color
  const accent = r.accent ?? '#ff8fb1'
  const light = lighten(base, 0.6)
  const deep = darken(base, 0.18)
  const stroke = darken(base, 0.45)
  const inner = r.body === 'frog' ? lighten(base, 0.4) : mix(base, '#ff9fc0', 0.45)
  const d = bodyPath(r.body)
  const extras = (r.extras ?? []).map((e) => extraSvg(e, r.body, accent))

  const chickTuft = r.body === 'chick' ? `<path d="M76 38q-2-12 6-14q-2 6 2 8q2-8 9-6q-6 4-4 12" fill="${base}" stroke="${stroke}" stroke-opacity=".4" stroke-width="2"/>` : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="512" height="512">
<defs>
<radialGradient id="bodyGrad" cx="36%" cy="30%" r="78%">
<stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${deep}"/>
</radialGradient>
<linearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d3a"/><stop offset="1" stop-color="#5a3f78"/></linearGradient>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>
<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5"/></filter>
</defs>
<ellipse cx="80" cy="150" rx="44" ry="6" fill="#5b3d7a" opacity=".18" filter="url(#shadow)"/>
${extras.map((e) => e.back ?? '').join('')}
${ears(r.body, 'url(#bodyGrad)', inner, stroke)}
${chickTuft}
<path d="${d}" fill="url(#bodyGrad)" stroke="${stroke}" stroke-opacity=".35" stroke-width="2.5" stroke-linejoin="round"/>
<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" transform="translate(80 92) scale(.9) translate(-80 -92)" stroke-dasharray="0 210 90 400"/>
<ellipse cx="54" cy="${r.body === 'heart' ? 52 : 58}" rx="15" ry="8" transform="rotate(-28 54 58)" fill="#fff" opacity=".65" filter="url(#soft)"/>
<circle cx="46" cy="${r.body === 'heart' ? 60 : 68}" r="3" fill="#fff" opacity=".8"/>
${r.blush !== false ? blushSvg(r.body, !!r.extras?.includes('cheeklines')) : ''}
${eyesSvg(r.eyes, r.body, accent)}
${r.body === 'chick' ? `<path d="M74 ${mouthY(r.body) - 6}l6 7 6-7z" fill="#ffb347" stroke="#e08a1e" stroke-width="1.5" stroke-linejoin="round"/>` : mouthSvg(r.mouth, r.body)}
${extras.map((e) => e.front ?? '').join('')}
</svg>`
}

export const CUTE_COLORS = {
  pink: '#ffb5d0',
  peach: '#ffc8a8',
  butter: '#ffe39a',
  mint: '#b5ecd0',
  sky: '#b8dcff',
  lavender: '#d3c2ff',
  lilac: '#efc6ff',
  cream: '#fff0d8',
  snow: '#f6f3fb',
  choco: '#d1a483',
  matcha: '#cde6a2',
  strawberry: '#ff9fb5',
  grey: '#dcd8e6',
} as const
