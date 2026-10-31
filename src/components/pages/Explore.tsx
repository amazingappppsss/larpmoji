import { useMemo, useState } from 'react'
import { ArrowDownWideNarrow, Keyboard, Shuffle } from 'lucide-react'
import type { CategoryId } from '../../types'
import { CATEGORIES, getCategory } from '../../data/emojis'
import { filterEmojis, type SortMode } from '../../lib/search'
import { useStore } from '../../store/AppStore'
import { SearchBar } from '../SearchBar'
import { CategoryBar } from '../CategoryBar'
import { EmojiGrid, EmptyState } from '../EmojiGrid'
import { EmojiImage } from '../EmojiImage'

const SUGGESTIONS = ['crying', 'cope', 'skull', 'rizz', 'ghost', 'slay', '3am', 'love']

export function Explore() {
  const { allEmojis, setOpenEmoji, setKeyboardOpen } = useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [sort, setSort] = useState<SortMode>('trending')

  const results = useMemo(() => filterEmojis(allEmojis, { query, category, sort }), [allEmojis, query, category, sort])
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allEmojis.length }
    for (const e of allEmojis) for (const id of [e.category, ...(e.alsoIn ?? [])]) c[id] = (c[id] ?? 0) + 1
    return c
  }, [allEmojis])

  const featured = allEmojis.find((e) => e.featured) ?? allEmojis[0]
  const heroStack = allEmojis.filter((e) => !e.featured && !e.custom).slice(0, 4)
  const activeCat = category === 'all' ? null : getCategory(category)

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* HERO */}
      <section className="relative grid md:grid-cols-[1.3fr_1fr] gap-8 items-center pt-10 pb-8">
        <div>
          <p className="inline-block rotate-[-3deg] rounded-full bg-bubblegum text-white border-[3px] border-ink px-3 py-1 font-extrabold text-sm shadow-hard-sm">
            ✦ {allEmojis.length} emojis &amp; counting
          </p>
          <h1 className="font-display text-5xl sm:text-7xl leading-[0.9] mt-4">
            emojis for the <span className="relative inline-block -rotate-2 bg-sun px-2 border-[3px] border-ink shadow-hard">chronically</span>{' '}
            online
          </h1>
          <p className="mt-4 text-lg font-semibold max-w-md text-ink/80">
            Discover, steal (copy), and cook up unhinged internet-native emojis. No cap, just vibes.
          </p>
          <div className="mt-6 max-w-xl">
            <SearchBar value={query} onChange={setQuery} hotkey />
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-bold text-ink/50">try:</span>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => setQuery(s)} className="rounded-full bg-white border-2 border-ink px-2.5 py-0.5 font-bold hover:bg-sun">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* featured sticker pile */}
        <div className="relative h-72 sm:h-80 hidden md:block" aria-label="Featured emoji">
          {heroStack.map((e, i) => (
            <button
              key={e.id}
              onClick={() => setOpenEmoji(e)}
              className="absolute size-24 rounded-3xl bg-white sticker press grid place-items-center"
              style={{ top: ['4%', '58%', '6%', '62%'][i], left: ['2%', '6%', '74%', '72%'][i], rotate: ['-12deg', '9deg', '14deg', '-8deg'][i] }}
              aria-label={`Open ${e.name}`}
            >
              <EmojiImage emoji={e} loading="eager" className="size-18" />
            </button>
          ))}
          {featured && (
            <button
              onClick={() => setOpenEmoji(featured)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-44 rounded-[2rem] checker sticker shadow-hard-lg press grid place-items-center -rotate-3"
              aria-label={`Open featured emoji ${featured.name}`}
            >
              <EmojiImage emoji={featured} loading="eager" className="size-36" />
              <span className="absolute -bottom-4 rounded-full bg-sun border-[3px] border-ink px-3 py-0.5 font-display text-sm whitespace-nowrap">
                ★ {featured.name}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* keyboard promo */}
      <button
        onClick={() => setKeyboardOpen(true)}
        className="w-full mb-6 flex items-center gap-3 rounded-2xl bg-ink text-white px-4 py-3 text-left sticker press"
      >
        <span className="grid place-items-center size-10 rounded-xl bg-sun text-ink shrink-0">
          <Keyboard className="size-5" aria-hidden />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-extrabold">Open the LARPMOJI Keyboard</span>
          <span className="block text-sm text-white/70 truncate">Tap any emoji to copy the actual image, then paste it in any chat. Shortcut: K</span>
        </span>
        <span className="hidden sm:block rounded-full bg-lime text-ink px-3 py-1 font-extrabold text-sm border-2 border-white">Open Keyboard</span>
      </button>

      {/* FILTERS */}
      <div className="sticky top-16 z-20 -mx-4 px-4 pt-2 pb-1 bg-paper/90 backdrop-blur border-b-2 border-ink/10">
        <CategoryBar value={category} onChange={setCategory} counts={counts} />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 mt-6 mb-5">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl leading-none">
            {query.trim() ? `“${query.trim()}”` : activeCat ? activeCat.label : 'Fresh off the timeline'}
          </h2>
          <p className="font-semibold text-ink/60 mt-1">
            {results.length} result{results.length === 1 ? '' : 's'}
            {activeCat && !query.trim() && <> · {activeCat.blurb}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => results.length && setOpenEmoji(results[Math.floor(Math.random() * results.length)])}
            className="flex items-center gap-1.5 rounded-full bg-lilac px-3 py-2 text-sm font-extrabold sticker-sm press"
          >
            <Shuffle className="size-4" /> Random
          </button>
          <label className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-extrabold sticker-sm">
            <ArrowDownWideNarrow className="size-4" aria-hidden />
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="bg-transparent outline-none font-extrabold cursor-pointer">
              <option value="trending">Trending</option>
              <option value="newest">Newest</option>
              <option value="az">A → Z</option>
            </select>
          </label>
        </div>
      </div>

      <EmojiGrid
        emojis={results}
        empty={
          <EmptyState glyph="🕳" title="nothing here, bestie">
            No emoji matches “{query}”{category !== 'all' && ` in ${getCategory(category).label}`}.{' '}
            <button className="underline decoration-2 decoration-bubblegum" onClick={() => (setQuery(''), setCategory('all'))}>
              Reset filters
            </button>
          </EmptyState>
        }
      />

      {/* category showcase */}
      {!query.trim() && category === 'all' && (
        <section className="mt-16">
          <h2 className="font-display text-3xl mb-4">pick your poison</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((c, i) => {
              const sample = allEmojis.filter((e) => e.category === c.id).slice(0, 3)
              return (
                <button
                  key={c.id}
                  onClick={() => (setCategory(c.id), window.scrollTo({ top: 300, behavior: 'smooth' }))}
                  className={`${c.color} rounded-3xl p-4 text-left sticker press ${i % 2 ? 'rotate-1' : '-rotate-1'}`}
                >
                  <div className="flex -space-x-3 mb-3">
                    {sample.map((e) => (
                      <span key={e.id} className="grid place-items-center size-12 rounded-full bg-white border-2 border-ink">
                        <EmojiImage emoji={e} compact className="size-9" />
                      </span>
                    ))}
                  </div>
                  <div className="font-display text-xl leading-none">{c.label}</div>
                  <div className="text-sm font-semibold mt-1 opacity-80">{c.blurb}</div>
                </button>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
