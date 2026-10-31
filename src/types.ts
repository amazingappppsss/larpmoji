export type CategoryId =
  | 'reactions'
  | 'vibes'
  | 'cursed'
  | 'copium'
  | 'gremlin'
  | 'wholesome'
  | 'stickers'
  | 'custom'

export interface Category {
  id: CategoryId
  label: string
  blurb: string
  /** Tailwind background class used for chips + accents */
  color: string
  glyph: string
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
  /** data URL that can be dropped straight into <img src> */
  src: string
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
