import type { Emoji, CategoryId } from '../types'
import { CUTE_COLORS as C, renderCute, type Body, type CuteRecipe, type Extra, type Eyes, type Mouth } from '../lib/cute'

export const svgToDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

interface Seed {
  name: string
  category: CategoryId
  tags: string[]
  description: string
  uses: number
  r: CuteRecipe
}
const S = (name: string, category: CategoryId, tags: string[], description: string, uses: number, r: CuteRecipe): Seed => ({ name, category, tags, description, uses, r })

const SEEDS: Seed[] = [
  // ♡ love
  S('Heart Eyes Mochi', 'love', ['love', 'crush', 'heart eyes', 'adore'], 'Saw you. Fell over. Rolled away blushing.', 99_100, { body: 'mochi', color: C.pink, eyes: 'heart', mouth: 'w', extras: ['hearts'], accent: '#ff5c9d' }),
  S('Hold My Heart', 'love', ['love', 'gift', 'for you', 'heart'], 'Here. It’s yours. Be careful with it.', 93_400, { body: 'bear', color: C.cream, eyes: 'content', mouth: 'w', extras: ['holdheart'], accent: '#ff5c9d' }),
  S('Lovey Bunny', 'love', ['love', 'bunny', 'cute', 'hearts'], 'Hopping straight into your DMs.', 88_200, { body: 'bunny', color: C.snow, eyes: 'happy', mouth: 'w', extras: ['hearts'], accent: '#ff7aa8' }),
  S('Big Heart', 'love', ['heart', 'love', 'smile'], 'A whole heart. Just for you.', 77_000, { body: 'heart', color: C.strawberry, eyes: 'sparkle', mouth: 'smile', extras: ['sparkles'] }),
  S('Kiss Kiss', 'love', ['kiss', 'mwah', 'love'], 'Mwah. That one landed.', 70_300, { body: 'cat', color: C.lilac, eyes: 'wink', mouth: 'pout', extras: ['hearts'], accent: '#ff5c9d' }),
  S('Smitten Kitten', 'love', ['cat', 'crush', 'shy', 'love'], 'Too shy to say it. Says it with blush.', 64_800, { body: 'cat', color: C.pink, eyes: 'shy', mouth: 'cat', extras: ['cheeklines', 'hearts'], accent: '#ff5c9d' }),
  S('Lovestruck Frog', 'love', ['frog', 'love', 'heart eyes'], 'Ribbit means I love you.', 51_200, { body: 'frog', color: C.matcha, eyes: 'heart', mouth: 'w', accent: '#ff5c9d' }),
  S('Bestie Bear', 'love', ['bestie', 'friend', 'hug', 'bear'], 'Certified bestie. Hug included.', 58_600, { body: 'bear', color: C.choco, eyes: 'happy', mouth: 'smile', extras: ['hearts'], accent: '#ff7aa8' }),

  // ✿ happy
  S('Sparkle Mochi', 'happy', ['happy', 'excited', 'sparkle', 'yay'], 'Bouncing with pure, unfiltered joy.', 97_700, { body: 'mochi', color: C.pink, eyes: 'sparkle', mouth: 'w', extras: ['bow', 'sparkles'], accent: '#ff7aa8' }),
  S('Yay Frog', 'happy', ['yay', 'happy', 'frog', 'excited'], 'Today is a good day (it said so).', 72_900, { body: 'frog', color: C.matcha, eyes: 'dot', mouth: 'open', extras: ['sparkles'] }),
  S('Starstruck', 'happy', ['wow', 'amazed', 'starstruck', 'excited'], 'Stars in eyes. Zero thoughts.', 69_000, { body: 'round', color: C.lavender, eyes: 'star', mouth: 'open', extras: ['stars'] }),
  S('Lil Chick', 'happy', ['chick', 'baby', 'cute', 'hi'], 'Peep! (that means hi)', 66_100, { body: 'chick', color: C.butter, eyes: 'sparkle', mouth: 'none', extras: ['flower'] }),
  S('Giggle Bunny', 'happy', ['laugh', 'giggle', 'lol', 'bunny'], 'Hehehe. Hehe. Okay one more: hehe.', 63_300, { body: 'bunny', color: C.pink, eyes: 'happy', mouth: 'open', extras: ['bow'], accent: '#ff7aa8' }),
  S('Royal Cutie', 'happy', ['queen', 'king', 'crown', 'proud'], 'Main character, but make it adorable.', 57_700, { body: 'round', color: C.butter, eyes: 'content', mouth: 'smile', extras: ['crown', 'sparkles'] }),
  S('Angel Puff', 'happy', ['angel', 'innocent', 'good'], 'Did nothing wrong. Ever. Look at the halo.', 54_900, { body: 'round', color: C.lilac, eyes: 'happy', mouth: 'smile', extras: ['halo', 'sparkles'] }),
  S('Vibing Kitty', 'happy', ['music', 'vibing', 'dance', 'cat'], 'Headphones off, vibes on.', 47_000, { body: 'cat', color: C.peach, eyes: 'content', mouth: 'w', extras: ['note'] }),
  S('Proud Of You', 'happy', ['proud', 'support', 'yay'], 'Look at you! Doing things!', 52_400, { body: 'bear', color: C.butter, eyes: 'sparkle', mouth: 'open', extras: ['stars'] }),
  S('Silly Tongue', 'happy', ['silly', 'tongue', 'playful', 'blep'], 'Blep. That’s it. That’s the message.', 61_000, { body: 'bunny', color: C.lavender, eyes: 'wink', mouth: 'tongue' }),

  // ☁ sad
  S('Teary Bear', 'sad', ['sad', 'teary', 'please', 'pleading'], 'Lip wobbling. Eyes glistening. Please?', 95_500, { body: 'bear', color: C.choco, eyes: 'teary', mouth: 'wobble' }),
  S('Sob Mochi', 'sad', ['crying', 'sob', 'sad', 'tears'], 'Crying, but in a cute way.', 84_000, { body: 'mochi', color: C.sky, eyes: 'cry', mouth: 'open' }),
  S('Pleading Bunny', 'sad', ['please', 'pleading', 'puppy eyes', 'begging'], 'Weaponised sparkly eyes. Resistance is futile.', 91_200, { body: 'bunny', color: C.snow, eyes: 'teary', mouth: 'pout', extras: ['bow'], accent: '#a8c8ff' }),
  S('Lil Rain Cloud', 'sad', ['sad', 'gloomy', 'cloud', 'down'], 'A tiny personal rain cloud.', 46_800, { body: 'cloud', color: C.grey, eyes: 'cry', mouth: 'frown' }),
  S('Sulky Kitty', 'sad', ['sulking', 'pout', 'upset', 'cat'], 'Not talking to you (please talk to me).', 43_500, { body: 'cat', color: C.grey, eyes: 'dot', mouth: 'frown', extras: ['sweat'] }),
  S('Nervous Ghost', 'sad', ['nervous', 'anxious', 'awkward', 'ghost'], 'Haunting the group chat, nervously.', 41_700, { body: 'ghost', color: C.snow, eyes: 'surprised', mouth: 'wobble', extras: ['sweat'] }),
  S('Heartbroken', 'sad', ['heartbreak', 'sad', 'hurt'], 'A little cracked, still cute.', 39_900, { body: 'heart', color: C.lavender, eyes: 'teary', mouth: 'frown' }),

  // ☾ sleepy
  S('Sleepy Cloud', 'sleepy', ['sleepy', 'tired', 'nap', 'zzz'], 'Floating straight into a nap.', 80_100, { body: 'cloud', color: C.sky, eyes: 'sleepy', mouth: 'tiny', extras: ['zzz', 'bubble'] }),
  S('Nap Bunny', 'sleepy', ['nap', 'sleepy', 'bunny', 'goodnight'], 'Do not disturb. Bunny is recharging.', 62_200, { body: 'bunny', color: C.lilac, eyes: 'sleepy', mouth: 'w', extras: ['zzz'] }),
  S('Goodnight Bear', 'sleepy', ['goodnight', 'gn', 'sleep', 'bear'], 'Gn. Sweet dreams. Drink water.', 58_000, { body: 'bear', color: C.lavender, eyes: 'sleepy', mouth: 'tiny', extras: ['zzz', 'stars'] }),
  S('Snoozing Mochi', 'sleepy', ['tired', 'sleepy', 'snooze'], 'Five more minutes (times twelve).', 49_300, { body: 'mochi', color: C.cream, eyes: 'sleepy', mouth: 'o', extras: ['bubble'] }),
  S('Dozy Frog', 'sleepy', ['tired', 'frog', 'chill'], 'Lily pad mode: engaged.', 37_400, { body: 'frog', color: C.mint, eyes: 'content', mouth: 'tiny', extras: ['zzz'] }),

  // ✦ sassy
  S('Smug Kitty', 'sassy', ['smug', 'sassy', 'cat', 'hehe'], 'I know something you don’t.', 86_700, { body: 'cat', color: C.butter, eyes: 'smug', mouth: 'cat' }),
  S('Pouty Mochi', 'sassy', ['pout', 'hmph', 'annoyed'], 'Hmph. Pout level: maximum.', 67_800, { body: 'mochi', color: C.peach, eyes: 'dot', mouth: 'pout', extras: ['anger'] }),
  S('Grumpy Bunny', 'sassy', ['angry', 'grumpy', 'mad'], 'Small. Fluffy. Furious.', 59_100, { body: 'bunny', color: C.strawberry, eyes: 'smug', mouth: 'frown', extras: ['anger'] }),
  S('Wink Wink', 'sassy', ['wink', 'flirt', 'rizz'], 'You didn’t see this. 😉', 71_900, { body: 'round', color: C.pink, eyes: 'wink', mouth: 'cat', extras: ['sparkles'] }),
  S('Shook Kitty', 'sassy', ['shocked', 'omg', 'surprised', 'shook'], 'Excuse me?? EXCUSE ME??', 65_400, { body: 'cat', color: C.snow, eyes: 'surprised', mouth: 'o', extras: ['sweat'] }),
  S('Dizzy Mochi', 'sassy', ['dizzy', 'confused', 'overwhelmed'], 'Too much information. Brain spinning.', 44_800, { body: 'mochi', color: C.mint, eyes: 'dizzy', mouth: 'wobble' }),
  S('Shy Ghost', 'sassy', ['shy', 'embarrassed', 'blush', 'ghost'], '>///< don’t look at me', 69_300, { body: 'ghost', color: C.snow, eyes: 'shy', mouth: 'o', extras: ['cheeklines'] }),
  S('Unbothered Queen', 'sassy', ['unbothered', 'queen', 'slay'], 'Crown on. Opinions off.', 53_500, { body: 'cat', color: C.lilac, eyes: 'content', mouth: 'smile', extras: ['crown'] }),

  // 🐾 critters
  S('Strawberry Bunny', 'critters', ['bunny', 'strawberry', 'pink'], 'Sweet, pink, and a little bit sour.', 57_200, { body: 'bunny', color: C.strawberry, eyes: 'sparkle', mouth: 'w', extras: ['bow'], accent: '#ffffff' }),
  S('Matcha Frog', 'critters', ['frog', 'matcha', 'green'], 'Earthy. Calm. Slightly caffeinated.', 48_900, { body: 'frog', color: C.matcha, eyes: 'sparkle', mouth: 'w', extras: ['flower'] }),
  S('Choco Bear', 'critters', ['bear', 'chocolate', 'brown'], 'Sweet tooth, soft heart.', 46_100, { body: 'bear', color: C.choco, eyes: 'sparkle', mouth: 'w' }),
  S('Lavender Kitty', 'critters', ['cat', 'purple', 'lavender'], 'Smells like lavender. Acts like chaos.', 42_300, { body: 'cat', color: C.lavender, eyes: 'sparkle', mouth: 'cat', extras: ['bow'], accent: '#ff8fb1' }),
  S('Butter Chick', 'critters', ['chick', 'yellow', 'baby'], 'Tiny. Fluffy. Absolutely in charge.', 40_200, { body: 'chick', color: C.butter, eyes: 'happy', mouth: 'none', extras: ['sparkles'] }),
  S('Mint Ghostie', 'critters', ['ghost', 'mint', 'spooky', 'cute'], 'Spooky season, but soft.', 38_800, { body: 'ghost', color: C.mint, eyes: 'sparkle', mouth: 'w' }),
  S('Peachy Mochi', 'critters', ['peach', 'mochi', 'orange'], 'Squishable. Do not eat.', 36_900, { body: 'mochi', color: C.peach, eyes: 'sparkle', mouth: 'smile', extras: ['flower'] }),
  S('Sky Bunny', 'critters', ['bunny', 'blue', 'sky'], 'Fluffy like a cloud, bouncy like a bunny.', 35_200, { body: 'bunny', color: C.sky, eyes: 'dot', mouth: 'w', extras: ['sparkles'] }),
  S('Snow Bear', 'critters', ['bear', 'white', 'polar', 'snow'], 'Cold paws, warm heart.', 33_700, { body: 'bear', color: C.snow, eyes: 'dot', mouth: 'smile', extras: ['stars'] }),
  S('Lilac Cloud', 'critters', ['cloud', 'purple', 'dreamy'], 'Daydreaming in pastel.', 31_100, { body: 'cloud', color: C.lilac, eyes: 'happy', mouth: 'w', extras: ['sparkles'] }),
]

const DAY = 86_400_000
const NOW = Date.UTC(2026, 9, 31)

export const CUTE_LIBRARY: Emoji[] = SEEDS.map((s, i) => {
  const svg = renderCute(s.r)
  const slug = s.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return {
    id: `cute-${slug}`,
    slug,
    name: s.name,
    category: s.category,
    tags: s.tags,
    description: s.description,
    author: 'larpmoji',
    uses: s.uses,
    createdAt: new Date(NOW - ((i * 5) % 40) * DAY).toISOString(),
    src: svgToDataUrl(svg),
    svg,
  }
})

/* ---------- endless cuties: id = "cutie-<seed>", fully deterministic */

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

const BODIES: Body[] = ['mochi', 'mochi', 'round', 'bunny', 'bunny', 'cat', 'cat', 'bear', 'frog', 'chick', 'ghost', 'cloud', 'heart']
const EYES: Eyes[] = ['sparkle', 'sparkle', 'dot', 'happy', 'content', 'wink', 'heart', 'star', 'teary', 'shy', 'sleepy', 'surprised', 'smug']
const MOUTHS: Mouth[] = ['w', 'w', 'smile', 'open', 'o', 'pout', 'tongue', 'cat', 'tiny']
const EXTRAS: Extra[] = ['bow', 'hearts', 'sparkles', 'stars', 'flower', 'crown', 'halo', 'note', 'sweat', 'zzz']
const ACCENTS = ['#ff7aa8', '#ff5c9d', '#a8c8ff', '#b99cff', '#ffb36b', '#7fd8b0']
const ADJ = ['Tiny', 'Squishy', 'Sparkly', 'Sleepy', 'Fluffy', 'Bubbly', 'Dreamy', 'Sweet', 'Smol', 'Soft', 'Cozy', 'Lil']
const NAMES: Record<Body, string> = { mochi: 'Mochi', round: 'Puff', bunny: 'Bunny', cat: 'Kitty', bear: 'Bear', frog: 'Froggy', chick: 'Chick', ghost: 'Ghostie', cloud: 'Cloud', heart: 'Heart' }

export function cutieRecipe(seed: number): CuteRecipe {
  const r = mulberry32(seed)
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)]
  const body = pick(BODIES)
  const extras: Extra[] = []
  if (r() < 0.65) extras.push(pick(EXTRAS))
  if (r() < 0.2) extras.push(pick(EXTRAS))
  return {
    body,
    color: pick(Object.values(C)),
    eyes: pick(EYES),
    mouth: body === 'chick' ? 'none' : pick(MOUTHS),
    extras: [...new Set(extras)],
    accent: pick(ACCENTS),
  }
}

export function generatedCutie(seed: number): Emoji {
  const recipe = cutieRecipe(seed)
  const svg = renderCute(recipe)
  return {
    id: `cutie-${seed}`,
    slug: `cutie-${seed}`,
    name: `${ADJ[seed % ADJ.length]} ${NAMES[recipe.body]} #${seed % 10000}`,
    category: 'endless',
    tags: ['cute', 'generated', recipe.body],
    description: 'A one-of-one cutie, freshly made just for you.',
    author: 'the cute machine',
    uses: 0,
    createdAt: new Date(NOW).toISOString(),
    src: svgToDataUrl(svg),
    svg,
  }
}
