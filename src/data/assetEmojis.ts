import type { Emoji, CategoryId } from '../types'

/**
 * Hand-made raster emojis shipped as files in /public/emojis.
 *
 * These are used EXACTLY as provided – the app never redraws them.
 * To add more: put the file in public/emojis/ and add an entry below.
 */
interface AssetSeed {
  file: string
  name: string
  slug: string
  category: CategoryId
  alsoIn?: CategoryId[]
  tags: string[]
  description: string
  author: string
  uses: number
  createdAt: string
  featured?: boolean
}

const ASSET_SEEDS: AssetSeed[] = [
  {
    file: 'crying-laughing.png',
    name: 'Crying Laughing',
    slug: 'crying-laughing',
    category: 'cursed',
    alsoIn: ['reactions'],
    tags: ['laughing', 'crying', 'uncontrollable laughter', 'funny', 'absurd', 'reaction'],
    description: 'Laughing so hard the face stopped obeying physics.',
    author: 'larpmoji',
    uses: 120_000,
    createdAt: '2026-10-31T00:00:00.000Z',
    featured: true,
  },
]

/** Resolve a file in public/emojis, respecting Vite's base path (works on sub-path deploys). */
export const assetUrl = (file: string) => `${import.meta.env.BASE_URL}emojis/${file}`

export const ASSET_EMOJIS: Emoji[] = ASSET_SEEDS.map((a) => ({
  id: `asset-${a.slug}`,
  name: a.name,
  slug: a.slug,
  category: a.category,
  alsoIn: a.alsoIn,
  tags: a.tags,
  description: a.description,
  author: a.author,
  uses: a.uses,
  createdAt: a.createdAt,
  src: assetUrl(a.file),
  asset: true,
  featured: a.featured,
}))
