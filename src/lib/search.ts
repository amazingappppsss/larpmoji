import type { Emoji, CategoryId } from '../types'

export type SortMode = 'trending' | 'newest' | 'az'

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').trim()

/** Score how well an emoji matches a query. 0 = no match. */
export function scoreEmoji(e: Emoji, query: string): number {
  const q = norm(query)
  if (!q) return 1
  const name = norm(e.name)
  const terms = q.split(/\s+/)
  let score = 0
  for (const t of terms) {
    let best = 0
    if (name === t) best = 100
    else if (name.startsWith(t)) best = 60
    else if (name.includes(t)) best = 40
    if (e.tags.some((tag) => norm(tag) === t)) best = Math.max(best, 50)
    else if (e.tags.some((tag) => norm(tag).includes(t))) best = Math.max(best, 30)
    if (e.slug.includes(t)) best = Math.max(best, 25)
    if (norm(e.category).includes(t)) best = Math.max(best, 15)
    if (norm(e.description).includes(t)) best = Math.max(best, 10)
    if (norm(e.author).includes(t)) best = Math.max(best, 8)
    if (best === 0) return 0 // every term must match something
    score += best
  }
  return score
}

export function filterEmojis(
  list: Emoji[],
  opts: { query: string; category: CategoryId | 'all'; sort: SortMode },
): Emoji[] {
  const scored = list
    .filter((e) => opts.category === 'all' || e.category === opts.category || !!e.alsoIn?.includes(opts.category))
    .map((e) => ({ e, s: scoreEmoji(e, opts.query) }))
    .filter((x) => x.s > 0)

  scored.sort((a, b) => {
    if (opts.query.trim() && a.s !== b.s) return b.s - a.s
    if (!opts.query.trim() && opts.sort === 'trending' && !!a.e.featured !== !!b.e.featured) return a.e.featured ? -1 : 1
    if (opts.sort === 'newest') return b.e.createdAt.localeCompare(a.e.createdAt)
    if (opts.sort === 'az') return a.e.name.localeCompare(b.e.name)
    return b.e.uses - a.e.uses
  })
  return scored.map((x) => x.e)
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86_400_000)
  if (d <= 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d}d ago`
  const m = Math.floor(d / 30)
  return `${m}mo ago`
}
