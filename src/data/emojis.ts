import type { Category, Emoji, CategoryId } from '../types'
import { renderArt, svgToDataUrl, type ArtRecipe } from './emojiArt'
import { ASSET_EMOJIS } from './assetEmojis'

export const CATEGORIES: Category[] = [
  { id: 'reactions', label: 'Reactions', blurb: 'for when words are too much effort', color: 'bg-sun', glyph: '‼' },
  { id: 'vibes', label: 'Vibes', blurb: 'immaculate, unexplainable', color: 'bg-lilac', glyph: '✦' },
  { id: 'cursed', label: 'Cursed', blurb: 'do not look directly at these', color: 'bg-tomato', glyph: '☠' },
  { id: 'copium', label: 'Copium', blurb: 'inhale responsibly', color: 'bg-sky', glyph: '☁' },
  { id: 'gremlin', label: 'Gremlin', blurb: '3am behaviour', color: 'bg-lime', glyph: '⚡' },
  { id: 'wholesome', label: 'Wholesome', blurb: 'touch grass edition', color: 'bg-bubblegum', glyph: '♥' },
  { id: 'stickers', label: 'Text Stickers', blurb: 'say less (literally)', color: 'bg-tangerine', glyph: 'Aa' },
]

export const CUSTOM_CATEGORY: Category = {
  id: 'custom',
  label: 'Your Lab',
  blurb: 'fresh out of the creator',
  color: 'bg-mint',
  glyph: '⚗',
}

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CUSTOM_CATEGORY
}

interface Seed {
  name: string
  category: CategoryId
  tags: string[]
  description: string
  author: string
  uses: number
  daysAgo: number
  art: ArtRecipe
}

const SEEDS: Seed[] = [
  // ---------- reactions ----------
  { name: 'Skull Laugh', category: 'reactions', tags: ['dead', 'lmao', 'crying', 'funny'], description: 'I am deceased. Please water my plants.', author: 'pixelgoblin', uses: 98210, daysAgo: 40,
    art: { shape: 'circle', fill: '#f4f4f4', eyes: 'x', mouth: 'teeth', extras: ['tears'] } },
  { name: 'Shook', category: 'reactions', tags: ['shocked', 'omg', 'surprised'], description: 'Brain received the information and immediately rejected it.', author: 'nyanbyte', uses: 54012, daysAgo: 12,
    art: { shape: 'blob', fill: '#ffd23f', eyes: 'wide', mouth: 'scream', extras: ['sweat'] } },
  { name: 'Side Eye Supreme', category: 'reactions', tags: ['suspicious', 'judging', 'side-eye', 'hmm'], description: 'I saw that. Everyone saw that.', author: 'dorito_saint', uses: 76543, daysAgo: 66,
    art: { shape: 'squircle', fill: '#ff8a1f', eyes: 'side', mouth: 'flat' } },
  { name: 'Okay And', category: 'reactions', tags: ['whatever', 'unbothered', 'meh'], description: 'Your point has been noted and discarded.', author: 'lowpolyleo', uses: 23111, daysAgo: 5,
    art: { shape: 'circle', fill: '#b69cff', eyes: 'tired', mouth: 'smirk' } },
  { name: 'Scream Into Void', category: 'reactions', tags: ['aaa', 'panic', 'stress', 'screaming'], description: 'Volume set to maximum, location set to nowhere.', author: 'voidpost', uses: 41999, daysAgo: 20,
    art: { shape: 'melt', fill: '#ff5b5b', eyes: 'wide', mouth: 'scream', extras: ['steam'] } },
  { name: 'Excuse Me??', category: 'reactions', tags: ['what', 'confused', 'rude'], description: 'Reading the group chat after muting it for one hour.', author: 'nyanbyte', uses: 18877, daysAgo: 2,
    art: { shape: 'egg', fill: '#7cc8ff', eyes: 'dots', mouth: 'o', extras: ['sweat'] } },
  { name: 'Clapping Back', category: 'reactions', tags: ['savage', 'roast', 'clap'], description: 'Load-bearing sass. Do not remove.', author: 'dorito_saint', uses: 12034, daysAgo: 30,
    art: { shape: 'blob', fill: '#ff4fa3', eyes: 'sus', mouth: 'smirk', extras: ['hand'] } },

  // ---------- vibes ----------
  { name: 'Main Character', category: 'vibes', tags: ['protagonist', 'cool', 'confident'], description: 'Soundtrack is playing. Slow motion is engaged.', author: 'starlitbean', uses: 66120, daysAgo: 14,
    art: { shape: 'circle', fill: '#ffd23f', eyes: 'none', mouth: 'smirk', extras: ['shades', 'sparkles'] } },
  { name: 'Delulu Sparkle', category: 'vibes', tags: ['delusional', 'manifesting', 'dreamy'], description: 'Delulu is the solulu. Trust the process.', author: 'mothmilk', uses: 47788, daysAgo: 9,
    art: { shape: 'blob', fill: '#ffb3d1', eyes: 'stars', mouth: 'smile', extras: ['sparkles', 'blush'] } },
  { name: 'Unbothered King', category: 'vibes', tags: ['royalty', 'chill', 'unbothered'], description: 'Moisturized. In my lane. Flourishing.', author: 'lowpolyleo', uses: 39001, daysAgo: 52,
    art: { shape: 'squircle', fill: '#c6ff3d', eyes: 'closed', mouth: 'smile', extras: ['crown'] } },
  { name: 'Ghost Mode', category: 'vibes', tags: ['ghosting', 'offline', 'antisocial'], description: 'Read at 14:02. Never replied. Thriving.', author: 'voidpost', uses: 28450, daysAgo: 21,
    art: { shape: 'ghost', fill: '#ffffff', eyes: 'dots', mouth: 'o' } },
  { name: 'Anime Eyes', category: 'vibes', tags: ['kawaii', 'pleading', 'please'], description: 'Weaponised cuteness. Effective 100% of the time.', author: 'mothmilk', uses: 59980, daysAgo: 33,
    art: { shape: 'circle', fill: '#ffd23f', eyes: 'shiny', mouth: 'cat', extras: ['blush'] } },
  { name: 'Spicy Take', category: 'vibes', tags: ['hot', 'fire', 'controversial'], description: 'This opinion is legally classified as a weapon.', author: 'pixelgoblin', uses: 31260, daysAgo: 17,
    art: { shape: 'blob', fill: '#ff5b5b', eyes: 'sus', mouth: 'grin', extras: ['fire'] } },
  { name: 'Star Struck Blob', category: 'vibes', tags: ['amazed', 'wow', 'starry'], description: 'Stars in eyes, no thoughts in head.', author: 'starlitbean', uses: 22004, daysAgo: 44,
    art: { shape: 'star', fill: '#ffd23f', eyes: 'happy', mouth: 'smile' } },

  // ---------- cursed ----------
  { name: 'Melting Brain', category: 'cursed', tags: ['brainrot', 'tired', 'fried'], description: 'Seven hours of scrolling will do that to you.', author: 'voidpost', uses: 70123, daysAgo: 7,
    art: { shape: 'melt', fill: '#ffb3d1', eyes: 'spiral', mouth: 'wobbly', extras: ['brain'] } },
  { name: 'Uncanny Grin', category: 'cursed', tags: ['creepy', 'smile', 'unsettling'], description: 'It is smiling. It has always been smiling.', author: 'hexkitten', uses: 45556, daysAgo: 28,
    art: { shape: 'egg', fill: '#c6ff3d', eyes: 'dots', mouth: 'teeth' } },
  { name: 'Spiral Out', category: 'cursed', tags: ['dizzy', 'confused', 'chaos'], description: 'Thinking about one (1) email.', author: 'hexkitten', uses: 26780, daysAgo: 3,
    art: { shape: 'circle', fill: '#b69cff', eyes: 'spiral', mouth: 'wobbly', extras: ['sweat'] } },
  { name: 'Clown Behaviour', category: 'cursed', tags: ['clown', 'fool', 'embarrassing'], description: 'Full makeup. Wig on. Honk honk.', author: 'dorito_saint', uses: 61002, daysAgo: 60,
    art: { shape: 'circle', fill: '#ffffff', eyes: 'wide', mouth: 'grin', extras: ['clown', 'blush'] } },
  { name: 'Haunted Egg', category: 'cursed', tags: ['egg', 'haunted', 'weird'], description: 'Found in the fridge. It was not there before.', author: 'mothmilk', uses: 8890, daysAgo: 1,
    art: { shape: 'egg', fill: '#fff8e7', eyes: 'x', mouth: 'o', extras: ['halo'] } },
  { name: 'Screaming Star', category: 'cursed', tags: ['star', 'scream', 'loud'], description: 'Twinkle twinkle, absolutely not okay.', author: 'pixelgoblin', uses: 15333, daysAgo: 11,
    art: { shape: 'star', fill: '#ff8a1f', eyes: 'dots', mouth: 'o' } },
  { name: 'Sweaty Ghost', category: 'cursed', tags: ['nervous', 'ghost', 'anxious'], description: 'Haunting your DMs with anxiety.', author: 'hexkitten', uses: 11220, daysAgo: 19,
    art: { shape: 'ghost', fill: '#7cc8ff', eyes: 'wide', mouth: 'wobbly', extras: ['sweat'] } },

  // ---------- copium ----------
  { name: 'This Is Fine', category: 'copium', tags: ['fine', 'everything is fine', 'denial'], description: 'Smiling through the structural failure.', author: 'lowpolyleo', uses: 88120, daysAgo: 70,
    art: { shape: 'circle', fill: '#ffd23f', eyes: 'closed', mouth: 'smile', extras: ['fire', 'sweat'] } },
  { name: 'Copium Huff', category: 'copium', tags: ['cope', 'coping', 'denial'], description: 'It was rigged anyway. I did not even want it.', author: 'starlitbean', uses: 49012, daysAgo: 26,
    art: { shape: 'blob', fill: '#7cc8ff', eyes: 'closed', mouth: 'o', extras: ['steam'] } },
  { name: 'Brave Smile', category: 'copium', tags: ['sad', 'pretending', 'ok'], description: 'Crying on the inside, thriving on the outside.', author: 'nyanbyte', uses: 37650, daysAgo: 15,
    art: { shape: 'squircle', fill: '#ffb3d1', eyes: 'happy', mouth: 'smile', extras: ['tear'] } },
  { name: 'Waterfall Tears', category: 'copium', tags: ['crying', 'sob', 'emotional'], description: 'Hydration levels: critical. Emotions: also critical.', author: 'mothmilk', uses: 52300, daysAgo: 38,
    art: { shape: 'circle', fill: '#7cc8ff', eyes: 'closed', mouth: 'frown', extras: ['tears'] } },
  { name: 'Hopium Halo', category: 'copium', tags: ['hope', 'optimism', 'angel'], description: 'Next week will definitely be different.', author: 'starlitbean', uses: 20100, daysAgo: 8,
    art: { shape: 'egg', fill: '#fff8e7', eyes: 'stars', mouth: 'smile', extras: ['halo'] } },
  { name: 'Sweats Nervously', category: 'copium', tags: ['nervous', 'awkward', 'oops'], description: 'Was asked a follow-up question in the meeting.', author: 'dorito_saint', uses: 44400, daysAgo: 48,
    art: { shape: 'squircle', fill: '#ffd23f', eyes: 'wide', mouth: 'teeth', extras: ['sweat', 'sweat'] } },

  // ---------- gremlin ----------
  { name: 'Gremlin Hours', category: 'gremlin', tags: ['3am', 'chaos', 'goblin', 'night'], description: 'Snacking on cereal from the box at 3:07am.', author: 'pixelgoblin', uses: 64321, daysAgo: 10,
    art: { shape: 'blob', fill: '#c6ff3d', eyes: 'wide', mouth: 'grin' } },
  { name: 'Goblin Mode', category: 'gremlin', tags: ['goblin', 'feral', 'unhinged'], description: 'Societal expectations have left the chat.', author: 'hexkitten', uses: 58744, daysAgo: 35,
    art: { shape: 'melt', fill: '#3dffb5', eyes: 'sus', mouth: 'tongue' } },
  { name: 'Silly Little Guy', category: 'gremlin', tags: ['silly', 'goofy', 'small'], description: 'He is just a little guy. Leave him alone.', author: 'mothmilk', uses: 71002, daysAgo: 4,
    art: { shape: 'egg', fill: '#ff8a1f', eyes: 'dots', mouth: 'tongue', extras: ['cap'] } },
  { name: 'Rizz Attempt', category: 'gremlin', tags: ['flirt', 'rizz', 'smooth'], description: '0 rizz detected. Proceeding anyway.', author: 'lowpolyleo', uses: 33090, daysAgo: 22,
    art: { shape: 'squircle', fill: '#ff4fa3', eyes: 'sus', mouth: 'smirk', extras: ['sparkles'] } },
  { name: 'Mischief Cat', category: 'gremlin', tags: ['cat', 'plotting', 'scheming'], description: 'Plotting to knock something off a table.', author: 'nyanbyte', uses: 29812, daysAgo: 13,
    art: { shape: 'circle', fill: '#b69cff', eyes: 'sus', mouth: 'cat' } },
  { name: 'Cap Detector', category: 'gremlin', tags: ['cap', 'lie', 'no cap', 'liar'], description: 'Scanning statement... 100% cap detected.', author: 'dorito_saint', uses: 40011, daysAgo: 6,
    art: { shape: 'blob', fill: '#ffd23f', eyes: 'side', mouth: 'flat', extras: ['cap'] } },

  // ---------- wholesome ----------
  { name: 'Heart Eyes Blob', category: 'wholesome', tags: ['love', 'crush', 'adore'], description: 'Down catastrophically bad for this.', author: 'starlitbean', uses: 82020, daysAgo: 50,
    art: { shape: 'blob', fill: '#ff4fa3', eyes: 'hearts', mouth: 'smile', extras: ['blush'] } },
  { name: 'Touch Grass', category: 'wholesome', tags: ['outside', 'nature', 'grass'], description: 'Successfully went outside. Report: it was nice.', author: 'mothmilk', uses: 30030, daysAgo: 18,
    art: { shape: 'circle', fill: '#c6ff3d', eyes: 'happy', mouth: 'smile', extras: ['flower'] } },
  { name: 'Soft Hours', category: 'wholesome', tags: ['cozy', 'soft', 'calm'], description: 'Blanket on. Tea brewed. Notifications off.', author: 'nyanbyte', uses: 25500, daysAgo: 24,
    art: { shape: 'egg', fill: '#ffb3d1', eyes: 'closed', mouth: 'cat', extras: ['blush'] } },
  { name: 'Proud Of U', category: 'wholesome', tags: ['proud', 'support', 'yay'], description: 'Look at you. Doing things. Incredible.', author: 'starlitbean', uses: 27650, daysAgo: 29,
    art: { shape: 'star', fill: '#ffd23f', eyes: 'closed', mouth: 'smile', extras: ['blush'] } },
  { name: 'Angel Behaviour', category: 'wholesome', tags: ['innocent', 'angel', 'good'], description: 'Did nothing wrong. Never have. Never will.', author: 'hexkitten', uses: 19930, daysAgo: 42,
    art: { shape: 'circle', fill: '#fff8e7', eyes: 'happy', mouth: 'smile', extras: ['halo', 'blush'] } },
  { name: 'Lil Flower Friend', category: 'wholesome', tags: ['flower', 'cute', 'friend'], description: 'A small friend who believes in you.', author: 'mothmilk', uses: 14500, daysAgo: 16,
    art: { shape: 'blob', fill: '#3dffb5', eyes: 'shiny', mouth: 'smile', extras: ['flower'] } },

  // ---------- stickers ----------
  { name: 'Ratio', category: 'stickers', tags: ['ratio', 'owned', 'replies'], description: 'Deploy beneath a bad take.', author: 'voidpost', uses: 90012, daysAgo: 55,
    art: { kind: 'sticker', text: 'ratio', fill: '#ff4fa3', tilt: -8 } },
  { name: 'W', category: 'stickers', tags: ['win', 'w', 'nice'], description: 'A massive, undeniable win.', author: 'lowpolyleo', uses: 77777, daysAgo: 31,
    art: { kind: 'sticker', text: 'W', fill: '#c6ff3d', tilt: 6 } },
  { name: 'L', category: 'stickers', tags: ['loss', 'l', 'fail'], description: 'Take this L and carry it with pride.', author: 'lowpolyleo', uses: 70707, daysAgo: 31,
    art: { kind: 'sticker', text: 'L', fill: '#ff5b5b', tilt: -6 } },
  { name: 'FR FR', category: 'stickers', tags: ['for real', 'agree', 'true'], description: 'Notarised agreement. Legally binding.', author: 'nyanbyte', uses: 44120, daysAgo: 9,
    art: { kind: 'sticker', text: 'fr fr', fill: '#ffd23f', tilt: 4 } },
  { name: 'Mid', category: 'stickers', tags: ['mid', 'average', 'meh'], description: 'Perfectly, aggressively average.', author: 'hexkitten', uses: 38900, daysAgo: 27,
    art: { kind: 'sticker', text: 'mid', fill: '#b69cff', tilt: -10 } },
  { name: 'Based', category: 'stickers', tags: ['based', 'agree', 'respect'], description: 'Opinion has been certified based.', author: 'dorito_saint', uses: 35010, daysAgo: 37,
    art: { kind: 'sticker', text: 'based', fill: '#3d7bff', ink: '#ffffff', tilt: 7 } },
  { name: 'Slay', category: 'stickers', tags: ['slay', 'iconic', 'serve'], description: 'Ate and left no crumbs.', author: 'starlitbean', uses: 68400, daysAgo: 12,
    art: { kind: 'sticker', text: 'slay', fill: '#ff8a1f', tilt: -4 } },
  { name: 'Lore Drop', category: 'stickers', tags: ['lore', 'story', 'backstory'], description: 'For when the group chat gets backstory.', author: 'voidpost', uses: 16020, daysAgo: 2,
    art: { kind: 'sticker', text: 'lore', fill: '#3dffb5', tilt: 9 } },
  { name: 'Skill Issue', category: 'stickers', tags: ['skill issue', 'git gud', 'bad'], description: 'Diagnosis: severe skill issue.', author: 'pixelgoblin', uses: 51515, daysAgo: 19,
    art: { kind: 'sticker', text: 'skill issue', fill: '#ffffff', tilt: -7 } },
  { name: 'Bruh', category: 'stickers', tags: ['bruh', 'really', 'disappointed'], description: 'One syllable. Infinite disappointment.', author: 'pixelgoblin', uses: 60606, daysAgo: 45,
    art: { kind: 'sticker', text: 'bruh', fill: '#7cc8ff', tilt: 5 } },
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

const NOW = Date.now()
const DAY = 86_400_000

const GENERATED: Emoji[] = SEEDS.map((s, i) => {
  const svg = renderArt(s.art)
  const slug = slugify(s.name)
  return {
    id: `lm-${String(i + 1).padStart(3, '0')}-${slug}`,
    slug,
    name: s.name,
    category: s.category,
    tags: s.tags,
    description: s.description,
    author: s.author,
    uses: s.uses,
    createdAt: new Date(NOW - s.daysAgo * DAY).toISOString(),
    svg,
    src: svgToDataUrl(svg),
  }
})

/** Central emoji dataset. Featured file-based assets come first. */
export const EMOJIS: Emoji[] = [...ASSET_EMOJIS.filter((e) => e.featured), ...ASSET_EMOJIS.filter((e) => !e.featured), ...GENERATED]
