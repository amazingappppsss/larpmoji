import type { Category, Emoji, CategoryId } from '../types'
import { ASSET_EMOJIS } from './assetEmojis'
import { bigEyes, bigMouth, eyesOf, mouthOf, randomRecipe, type CursedRecipe } from '../lib/cursed'

export const CATEGORIES: Category[] = [
  { id: 'cursed', label: 'Cursed', blurb: 'something is wrong with their face', color: '#b6ff00', glyph: '👁️' },
  { id: 'bigeyes', label: 'Big Eyes', blurb: 'pupils fully dilated', color: '#00e5ff', glyph: '😳' },
  { id: 'deepfried', label: 'Deep Fried', blurb: 'extra crispy, 400°F', color: '#ff5a00', glyph: '🔥' },
  { id: 'melted', label: 'Melted', blurb: 'physics has left the chat', color: '#c77dff', glyph: '🫠' },
  { id: 'mashups', label: 'Mashups', blurb: 'two emojis, one braincell', color: '#ff2e88', glyph: '🧬' },
  { id: 'reactions', label: 'Reactions', blurb: 'captioned for the group chat', color: '#ffe600', glyph: '💬' },
]

export const ENDLESS_CATEGORY: Category = { id: 'endless', label: 'Endless', blurb: 'freshly generated, never seen before', color: '#ffffff', glyph: '♾️' }
export const CUSTOM_CATEGORY: Category = { id: 'custom', label: 'My Cooks', blurb: 'made by you', color: '#b6ff00', glyph: '🧪' }

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? (id === 'endless' ? ENDLESS_CATEGORY : CUSTOM_CATEGORY)
}

interface Seed {
  name: string
  category: CategoryId
  tags: string[]
  description: string
  uses: number
  recipe: CursedRecipe
}

const S = (name: string, category: CategoryId, tags: string[], description: string, uses: number, recipe: CursedRecipe): Seed => ({
  name,
  category,
  tags,
  description,
  uses,
  recipe,
})

const SEEDS: Seed[] = [
  // ---------------- big eyes
  S('Crying Laughing (Awake)', 'bigeyes', ['laughing', 'crying', 'lmao', 'wide eyes'], 'Laughing so hard the eyes opened.', 98_200, { base: '😂', warps: bigEyes(2, 0.22) }),
  S('Rolling Unwell', 'bigeyes', ['rofl', 'laughing', 'unhinged'], 'On the floor. Vision blurry. Still laughing.', 71_400, { base: '🤣', warps: bigEyes(1.8, 0.2) }),
  S('Pleading Max', 'bigeyes', ['please', 'begging', 'pleading', 'puppy'], 'Weaponised puppy eyes. Resistance is futile.', 88_010, { base: '🥺', warps: bigEyes(1.4, 0.2) }),
  S('Flushed 4K', 'bigeyes', ['embarrassed', 'flushed', 'shook'], 'Saw the message. Saw it in 4K.', 64_300, { base: '😳', warps: bigEyes(1.5, 0.21) }),
  S('Smiling Through It', 'bigeyes', ['smile', 'fine', 'creepy'], 'Everything is fine. Eyes are not.', 52_900, { base: '🙂', warps: bigEyes(2.2, 0.19) }),
  S('Skull Stare', 'bigeyes', ['dead', 'skull', 'stare'], 'Dead, but paying close attention.', 49_100, { base: '💀', warps: bigEyes(1.3, 0.18) }),
  S('Moai Noticed', 'bigeyes', ['moai', 'stone', 'staring'], 'The moai has seen what you did.', 45_600, { base: '🗿', warps: [{ kind: 'bulge', x: 0.42, y: 0.42, r: 0.15, amount: 1.4 }, { kind: 'bulge', x: 0.62, y: 0.42, r: 0.15, amount: 1.4 }] }),
  S('Sobbing Wide', 'bigeyes', ['crying', 'sob', 'sad'], 'Tears at full pressure, eyes at full aperture.', 41_000, { base: '😭', warps: bigEyes(1.8, 0.21) }),
  S('Doggo Overclocked', 'bigeyes', ['dog', 'cute', 'wide eyes'], 'Heard the word "walk".', 38_800, { base: '🐶', warps: bigEyes(1.8, 0.17) }),
  S('Cat Loading', 'bigeyes', ['cat', 'shook', 'wide eyes'], 'Pupils: buffering.', 36_200, { base: '🐱', warps: bigEyes(1.8, 0.17) }),
  S('Grin Too Wide', 'bigeyes', ['grin', 'smile', 'mouth'], 'The smile kept going.', 33_700, { base: '😀', warps: [bigMouth(1.3, 0.26), ...bigEyes(0.6, 0.15)] }),

  // ---------------- cursed (face parts)
  S('Real Eyes', 'cursed', ['eyes', 'realistic', 'creepy', 'stare'], 'Upgraded to real eyes. Regrets nothing.', 91_300, { base: '🙂', layers: eyesOf('👁️', 0.2) }),
  S('Lip Service', 'cursed', ['lips', 'mouth', 'creepy'], 'The mouth was replaced. Do not ask by whom.', 72_800, { base: '😐', layers: [mouthOf('👄', 0.3)] }),
  S('Full Upgrade', 'cursed', ['eyes', 'lips', 'creepy', 'stare'], 'Eyes AND lips. Maximum realism achieved.', 66_000, { base: '😶', layers: [...eyesOf('👁️', 0.19), mouthOf('👄', 0.28)] }),
  S('Cowboy Stare', 'cursed', ['cowboy', 'yeehaw', 'eyes'], 'Yeehaw, but haunted.', 58_400, { base: '🤠', layers: [...eyesOf('👁️', 0.17, 0.05), mouthOf('👄', 0.22, 0.03)] }),
  S('Clown Upgrade', 'cursed', ['clown', 'eyes', 'honk'], 'Honk. With depth perception.', 37_000, { base: '🤡', layers: eyesOf('👁️', 0.18, 0.02) }),
  S('Biting Lip', 'cursed', ['flirt', 'lips', 'rizz'], 'Unsolicited rizz detected.', 61_500, { base: '😏', layers: [mouthOf('🫦', 0.3)] }),
  S('Moon Has Eyes', 'cursed', ['moon', 'eyes', 'night'], 'Moon is watching. Go to sleep.', 29_800, { base: '🌚', layers: [{ char: '👁️', x: 0.4, y: 0.42, size: 0.18 }, { char: '👁️', x: 0.62, y: 0.42, size: 0.18 }] }),
  S('Spiral Brain', 'cursed', ['dizzy', 'hypnotised', 'confused'], 'Thinking about one (1) email.', 34_200, { base: '😶', layers: eyesOf('🌀', 0.2) }),
  S('Star Eyes Too Many', 'cursed', ['star', 'excited', 'amazed'], 'The excitement has become a medical condition.', 27_500, { base: '😮', layers: [...eyesOf('⭐', 0.24), { char: '⭐', x: 0.5, y: 0.25, size: 0.16 }] }),
  S('Tongue Out Wrong', 'cursed', ['tongue', 'silly', 'goofy'], 'Wrong tongue, right energy.', 25_000, { base: '🙂', layers: [mouthOf('👅', 0.3, 0.05)] }),
  S('Frog Upgrade', 'cursed', ['frog', 'eyes', 'pepe-ish'], 'He has seen the other side of the pond.', 30_900, { base: '🐸', layers: [{ char: '👁️', x: 0.33, y: 0.3, size: 0.2 }, { char: '👁️', x: 0.67, y: 0.3, size: 0.2 }] }),

  // ---------------- deep fried
  S('Deep Fried Crying', 'deepfried', ['laughing', 'fried', 'lmao', 'crispy'], 'Fried at 400°F. Still laughing.', 83_000, { base: '😂', fry: 0.85, warps: bigEyes(0.8, 0.18), seed: 3 }),
  S('Crispy Skull', 'deepfried', ['dead', 'skull', 'fried'], 'Dead, then deep fried. Thorough.', 69_300, { base: '💀', fry: 0.9, seed: 7 }),
  S('Fried Thumbs', 'deepfried', ['ok', 'thumbs up', 'fried'], 'Approval, extra crispy.', 47_700, { base: '👍', fry: 0.8, stretchX: 1.15, seed: 5 }),
  S('Burnt Moai', 'deepfried', ['moai', 'fried', 'stone'], 'Carved by ancients. Fried by teenagers.', 40_500, { base: '🗿', fry: 0.95, seed: 9 }),
  S('Sizzling Pleading', 'deepfried', ['please', 'fried', 'pleading'], 'Please (crunchy).', 37_400, { base: '🥺', fry: 0.75, warps: bigEyes(0.9, 0.2), seed: 2 }),
  S('Oil Bath Cowboy', 'deepfried', ['cowboy', 'fried'], 'Yeehaw at 180°C.', 28_100, { base: '🤠', fry: 0.9, seed: 11 }),
  S('Fried 100', 'deepfried', ['100', 'facts', 'fried'], 'Facts, but crunchy.', 55_200, { base: '💯', fry: 1, stretchY: 1.15, seed: 4 }),
  S('Mind Fried', 'deepfried', ['mind blown', 'fried', 'shock'], 'Brain left the fryer before the head did.', 31_600, { base: '🤯', fry: 0.85, seed: 8 }),
  S('Crispy Fire', 'deepfried', ['fire', 'lit', 'fried'], 'It was already on fire. We fried it anyway.', 26_000, { base: '🔥', fry: 1, warps: [{ kind: 'bulge', x: 0.5, y: 0.55, r: 0.4, amount: 0.6 }], seed: 6 }),

  // ---------------- melted
  S('Meltdown Laugh', 'melted', ['laughing', 'melting', 'drip'], 'Laughed until structurally unsound.', 50_800, { base: '😂', warps: [{ kind: 'melt', amount: 0.75 }], seed: 21 }),
  S('Puddle Smile', 'melted', ['melting', 'fine', 'hot'], 'Smiling while becoming a liquid.', 46_300, { base: '🫠', warps: [{ kind: 'melt', amount: 0.9 }], seed: 4 }),
  S('Swirl Brain', 'melted', ['dizzy', 'swirl', 'confused'], 'Brain.exe has stopped working.', 42_100, { base: '😵‍💫', warps: [{ kind: 'swirl', x: 0.5, y: 0.5, r: 0.48, amount: 4 }] }),
  S('Wide Boi', 'melted', ['stretched', 'wide', 'thicc'], 'Horizontal mode activated.', 59_900, { base: '😐', stretchX: 1.45, stretchY: 0.8 }),
  S('Tall Skull', 'melted', ['stretched', 'skull', 'tall'], 'Dead, but make it vertical.', 35_000, { base: '💀', stretchY: 1.4, stretchX: 0.75 }),
  S('Wavy Moai', 'melted', ['moai', 'wavy', 'trippy'], 'The moai is vibing on a different frequency.', 22_700, { base: '🗿', warps: [{ kind: 'wave', amount: 0.8 }] }),
  S('Drippy Cool', 'melted', ['cool', 'sunglasses', 'drip'], 'Too much drip. Literally.', 38_300, { base: '😎', warps: [{ kind: 'melt', amount: 0.6 }], seed: 9 }),
  S('Vortex Cry', 'melted', ['crying', 'swirl', 'sad'], 'Tears went in a circle.', 24_800, { base: '😭', warps: [{ kind: 'swirl', x: 0.5, y: 0.5, r: 0.48, amount: -5 }] }),
  S('Pixel Grief', 'melted', ['pixel', 'crying', 'retro', 'low quality'], 'Sadness at 144p.', 21_000, { base: '😭', pixelate: 0.55 }),
  S('Inverted Laugh', 'melted', ['laughing', 'trippy', 'colour'], 'Laughing in another dimension.', 19_400, { base: '😂', hue: 180, warps: [{ kind: 'wave', amount: 0.4 }] }),

  // ---------------- mashups
  S('Fingers Touching', 'mashups', ['shy', 'nervous', 'pleading', '👉👈'], 'Would you maybe… perhaps…', 87_600, { base: '🥺', baseScale: 0.72, layers: [{ char: '👉', x: 0.3, y: 0.86, size: 0.26 }, { char: '👈', x: 0.7, y: 0.86, size: 0.26 }] }),
  S('Sus Photo', 'mashups', ['sus', 'suspicious', 'caught', 'camera'], 'Caught in 4K. Evidence secured.', 79_000, { base: '🤨', baseScale: 0.74, layers: [{ char: '📸', x: 0.8, y: 0.76, size: 0.34, rotate: -12 }] }),
  S('Skull Trumpet', 'mashups', ['skull', 'trumpet', 'doot', 'spooky'], 'Doot doot. Spooky season forever.', 51_900, { base: '💀', baseScale: 0.7, layers: [{ char: '🎺', x: 0.74, y: 0.74, size: 0.38, rotate: 20 }] }),
  S('Sipping Tea Frog', 'mashups', ['tea', 'gossip', 'frog', 'none of my business'], 'Not my business. Still listening.', 63_100, { base: '🐸', baseScale: 0.72, layers: [{ char: '☕', x: 0.75, y: 0.78, size: 0.3 }] }),
  S('Clown Nails', 'mashups', ['clown', 'nails', 'unbothered'], 'Clowned, but manicured.', 33_300, { base: '🤡', baseScale: 0.74, layers: [{ char: '💅', x: 0.78, y: 0.78, size: 0.32 }] }),
  S('Moai Sparkle', 'mashups', ['moai', 'sparkle', 'aesthetic'], 'Stone-cold but sparkling.', 44_700, { base: '🗿', baseScale: 0.72, layers: [{ char: '✨', x: 0.2, y: 0.2, size: 0.26 }, { char: '✨', x: 0.82, y: 0.78, size: 0.22 }] }),
  S('This Is Fine', 'mashups', ['fine', 'fire', 'denial', 'everything is fine'], 'Coffee in hand. Building on fire.', 81_200, { base: '🙂', baseScale: 0.62, under: [{ char: '🔥', x: 0.22, y: 0.66, size: 0.44 }, { char: '🔥', x: 0.78, y: 0.66, size: 0.44 }], layers: [{ char: '☕', x: 0.7, y: 0.8, size: 0.26 }] }),
  S('Big Brain Fire', 'mashups', ['smart', 'brain', 'genius'], 'One idea. It was on fire.', 30_700, { base: '🧠', baseScale: 0.7, layers: [{ char: '🔥', x: 0.5, y: 0.18, size: 0.34 }] }),
  S('Chef Kiss Skull', 'mashups', ['perfect', 'chef kiss', 'dead'], 'So good I died.', 27_900, { base: '💀', baseScale: 0.72, layers: [{ char: '🤌', x: 0.78, y: 0.78, size: 0.32 }] }),
  S('Salute Cap', 'mashups', ['cap', 'lie', 'salute', 'no cap'], 'Respectfully: that was cap.', 36_600, { base: '🫡', baseScale: 0.72, layers: [{ char: '🧢', x: 0.5, y: 0.16, size: 0.42 }] }),
  S('Eye Mouth Eye', 'mashups', ['👁👄👁', 'stare', 'shook', 'what'], 'The classic. It is staring. It knows.', 92_500, { base: '', layers: [{ char: '👁️', x: 0.28, y: 0.42, size: 0.34 }, { char: '👁️', x: 0.72, y: 0.42, size: 0.34 }, { char: '👄', x: 0.5, y: 0.64, size: 0.3 }] }),
  S('Cold Sweat Brain', 'mashups', ['cold', 'freezing', 'brain freeze'], 'Brain freeze, but emotionally.', 18_300, { base: '🥶', baseScale: 0.74, layers: [{ char: '🧊', x: 0.2, y: 0.8, size: 0.26 }, { char: '🧊', x: 0.82, y: 0.2, size: 0.2 }] }),
  S('Crowned Clown', 'mashups', ['clown', 'king', 'crown'], 'King of the circus.', 26_400, { base: '🤡', baseScale: 0.72, layers: [{ char: '👑', x: 0.5, y: 0.13, size: 0.36 }] }),
  S('Praying Sob', 'mashups', ['please', 'crying', 'begging', 'pray'], 'Begging the universe, respectfully.', 47_200, { base: '😭', baseScale: 0.72, layers: [{ char: '🙏', x: 0.5, y: 0.86, size: 0.3 }] }),

  // ---------------- reactions (captioned)
  S('Bruh Moai', 'reactions', ['bruh', 'moai', 'disappointed'], 'One syllable. Infinite disappointment.', 77_300, { base: '🗿', caption: 'bruh' }),
  S("I'm Dead", 'reactions', ['dead', 'lmao', 'skull'], 'Cause of death: that message.', 85_800, { base: '💀', caption: "i'm dead" }),
  S('Sus', 'reactions', ['sus', 'suspicious', 'hmm'], 'Kinda sus ngl.', 62_000, { base: '🤨', caption: 'sus' }),
  S('Mid', 'reactions', ['mid', 'average', 'meh'], 'Aggressively average.', 49_900, { base: '😐', caption: 'mid' }),
  S('Massive W', 'reactions', ['win', 'w', 'nice'], 'Undeniable win.', 58_000, { base: '👍', caption: 'W', fry: 0.4, seed: 2 }),
  S('Take The L', 'reactions', ['loss', 'l', 'fail'], 'Take this L and carry it with pride.', 51_200, { base: '👎', caption: 'L' }),
  S('No Cap', 'reactions', ['no cap', 'true', 'facts'], 'Notarised. Legally binding.', 43_900, { base: '🧢', caption: 'no cap' }),
  S('Slay', 'reactions', ['slay', 'serve', 'iconic'], 'Ate and left no crumbs.', 56_600, { base: '💅', caption: 'slay' }),
  S('Skill Issue', 'reactions', ['skill issue', 'git gud'], 'Diagnosis: severe skill issue.', 45_300, { base: '🤓', caption: 'skill issue' }),
  S('Ratio', 'reactions', ['ratio', 'owned', 'replies'], 'Deploy beneath a bad take.', 66_700, { base: '😹', caption: 'ratio', captionPos: 'top' }),
  S('Delulu', 'reactions', ['delusional', 'manifesting', 'dreamy'], 'Delulu is the solulu.', 39_100, { base: '🥰', caption: 'delulu', warps: bigEyes(0.7, 0.17) }),
  S('Help', 'reactions', ['help', 'panic', 'scream'], 'Typed with shaking hands.', 34_000, { base: '😩', caption: 'help', fry: 0.5, seed: 12 }),
  S('Real', 'reactions', ['real', 'agree', 'true'], 'So real it hurts.', 40_400, { base: '😔', caption: 'real' }),
  S('Ok And?', 'reactions', ['unbothered', 'whatever', 'ok'], 'Your point has been noted and discarded.', 31_800, { base: '🙄', caption: 'ok and?' }),
]

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'emoji'
  )
}

const DAY = 86_400_000
const NOW = Date.UTC(2026, 9, 31)

const LIBRARY: Emoji[] = SEEDS.map((s, i) => {
  const slug = slugify(s.name)
  return {
    id: `lm-${slug}`,
    slug,
    name: s.name,
    category: s.category,
    tags: s.tags,
    description: s.description,
    author: 'larpmoji',
    uses: s.uses,
    createdAt: new Date(NOW - ((i * 7) % 60) * DAY).toISOString(),
    src: '',
    recipe: s.recipe,
  }
})

/* ---------- endless generated emojis: id encodes the seed, so they can be favourited and restored */

const ADJ = ['Feral', 'Haunted', 'Crispy', 'Unwell', 'Cursed', 'Rogue', 'Sleepy', 'Forbidden', 'Silly', 'Feral', 'Melted', 'Ancient', 'Sus', 'Turbo', 'Mid', 'Delulu']
const NOUN = ['Goblin', 'Bean', 'Gremlin', 'Blob', 'Lad', 'Specimen', 'Creature', 'Entity', 'Menace', 'Gremlin', 'Unit', 'Thing', 'Guy', 'Bestie']

export function generatedEmoji(seed: number): Emoji {
  const recipe = randomRecipe(seed)
  const name = `${ADJ[seed % ADJ.length]} ${NOUN[Math.floor(seed / 7) % NOUN.length]} #${seed % 10000}`
  return {
    id: `gen-${seed}`,
    slug: `cursed-${seed}`,
    name,
    category: 'endless',
    tags: ['random', 'generated', 'cursed', recipe.base ?? ''].filter(Boolean),
    description: 'Freshly generated by the cursed engine. One of one.',
    author: 'the machine',
    uses: 0,
    createdAt: new Date(NOW).toISOString(),
    src: '',
    recipe,
  }
}

/** Central emoji dataset. Featured file-based assets come first. */
export const EMOJIS: Emoji[] = [...ASSET_EMOJIS.filter((e) => e.featured), ...ASSET_EMOJIS.filter((e) => !e.featured), ...LIBRARY]
