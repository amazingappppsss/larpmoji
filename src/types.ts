import type { CursedRecipe } from './lib/cursed'

export type Collection = 'cute' | 'text' | 'cursed'
export type CategoryId =
  | 'love' | 'happy' | 'sad' | 'sleepy' | 'sassy' | 'critters'
  | 'kaomoji' | 'combos' | 'aesthetic'
  | 'cursed' | 'bigeyes' | 'deepfried' | 'melted' | 'mashups' | 'reactions'
  | 'endless' | 'custom'

export interface Category {
  id: CategoryId
  label: string
  blurb: string
  /** accent hex colour */
  color: string
  glyph: string
  collection: Collection
}

export interface Emoji {
  id: string
  name: string
  /** shortcode without colons, e.g. "skull-laugh" */
  slug: string
  category: CategoryId
  tags: string[]
  description: string
  author: string
  uses: number
  createdAt: string
  /** image URL (file / data URL). Empty for recipe emojis until rendered. */
  src: string
  /** cursed-engine recipe; rendered on demand in the browser */
  recipe?: CursedRecipe
  /** text emojis: copied as plain text so they paste like keyboard emojis */
  text?: string
  /** raw SVG markup (generated emojis only) */
  svg?: string
  custom?: boolean
  /** true for hand-made raster assets served from /public/emojis */
  asset?: boolean
  /** pinned to the top of the library */
  featured?: boolean
  /** extra categories this emoji should also appear under */
  alsoIn?: CategoryId[]
}
