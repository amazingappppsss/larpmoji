import { useEffect, useMemo, useRef, useState } from 'react'
import { Dices, FlaskConical, Keyboard } from 'lucide-react'
import type { CategoryId, Emoji } from '../../types'
import { generatedEmoji, getCategory } from '../../data/emojis'
import { filterEmojis } from '../../lib/search'
import { useStore } from '../../store/AppStore'
import { SearchBar } from '../SearchBar'
import { CategoryBar } from '../CategoryBar'
import { EmojiGrid, EmptyState } from '../EmojiGrid'
import { EmojiImage } from '../EmojiImage'
import { ChatPreview } from '../ChatPreview'

const BATCH = 18
const MAX_ENDLESS = 720

export function Explore() {
  const { allEmojis, navigate, setOpenEmoji, setKeyboardOpen } = useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')

  const results = useMemo(() => filterEmojis(allEmojis, { query, category, sort: 'trending' }), [allEmojis, query, category])
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allEmojis.length }
    for (const e of allEmojis) for (const id of [e.category, ...(e.alsoIn ?? [])]) c[id] = (c[id] ?? 0) + 1
    return c
  }, [allEmojis])

  const browsing = !query.trim() && category === 'all'
  const activeCat = category === 'all' ? null : getCategory(category)
  const heroEmojis = useMemo(() => ['lm-real-eyes', 'lm-crispy-skull', 'lm-fingers-touching', 'lm-sus-photo', 'lm-puddle-smile'].map((id) => allEmojis.find((e) => e.id === id)).filter((e): e is Emoji => !!e), [allEmojis])

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-5">
      {/* INTRO — what is this */}
      <section className="pt-6 sm:pt-10 pb-4 grid lg:grid-cols-[1fr_auto] gap-6 items-end">
        <div>
          <h1 className="meme text-[13vw] sm:text-7xl lg:text-8xl leading-[0.88]">
            cursed emojis.
            <br />
            <span className="text-acid [-webkit-text-stroke-color:#000]">tap to copy.</span>
          </h1>
          <ol className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            {[
              ['👆', 'tap any emoji'],
              ['📋', "it's copied as an image"],
              ['💬', 'paste in WhatsApp, Discord, iMessage…'],
            ].map(([g, t], i) => (
              <li key={t} className="flex items-center gap-2">
                <span className="flex items-center gap-2 rounded-full bg-surface border border-line pl-1.5 pr-3 py-1">
                  <span className="grid place-items-center size-7 rounded-full bg-raised">{g}</span>
                  <span>
                    <b className="text-acid">{i + 1}.</b> {t}
                  </span>
                </span>
                {i < 2 && <span className="hidden sm:inline text-muted" aria-hidden>→</span>}
              </li>
            ))}
          </ol>
        </div>
        <div className="hidden lg:flex gap-1" aria-hidden>
          {heroEmojis.map((e, i) => (
            <button key={e.id} onClick={() => setOpenEmoji(e)} tabIndex={-1} className="animate-float" style={{ animationDelay: `${i * 0.4}s` }}>
              <EmojiImage emoji={e} loading="eager" className="size-20" />
            </button>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-6">
        <div className="min-w-0">
          <div className="sticky top-16 z-20 -mx-3 sm:-mx-5 px-3 sm:px-5 pt-2 pb-1 bg-bg/90 backdrop-blur-md">
            <SearchBar value={query} onChange={setQuery} hotkey />
            <CategoryBar value={category} onChange={setCategory} counts={counts} />
          </div>

          {!browsing && (
            <p className="mt-3 mb-3 text-sm text-muted">
              {results.length} result{results.length === 1 ? '' : 's'}
              {activeCat && !query.trim() && <> · {activeCat.blurb}</>}
            </p>
          )}
          <div className={browsing ? 'mt-3' : ''}>
            <EmojiGrid
              emojis={results}
              empty={
                <EmptyState glyph="🕳️" title="nothing here">
                  No emoji for “{query}”.{' '}
                  <button className="text-acid underline" onClick={() => navigate('create')}>
                    Cook it yourself →
                  </button>
                </EmptyState>
              }
            />
          </div>

          {browsing && <EndlessFeed />}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <button onClick={() => setKeyboardOpen(true)} className="btn h-12 w-full bg-acid text-black hover:brightness-110">
              <Keyboard className="size-5" /> Open Keyboard <kbd className="text-[10px] border border-black/30 rounded px-1">K</kbd>
            </button>
            <ChatPreview />
            <button onClick={() => navigate('create')} className="group rounded-3xl bg-hot p-5 text-left hover:brightness-110 transition">
              <FlaskConical className="size-7 mb-2" aria-hidden />
              <div className="meme text-3xl leading-none">cook your own</div>
              <p className="text-sm mt-2 text-white/85">Pick any emoji or upload a pic. Bulge it, fry it, melt it. 10 seconds.</p>
            </button>
          </div>
        </aside>
      </div>

      {/* mobile CTA */}
      <button onClick={() => navigate('create')} className="lg:hidden mt-8 w-full rounded-3xl bg-hot p-5 text-left">
        <div className="meme text-3xl leading-none">🧪 cook your own</div>
        <p className="text-sm mt-1 text-white/85">Pick any emoji or upload a pic and curse it.</p>
      </button>
    </div>
  )
}

/** Infinite stream of freshly generated cursed emojis. */
function EndlessFeed() {
  const [start] = useState(() => Math.floor(Math.random() * 1_000_000))
  const [count, setCount] = useState(BATCH)
  const sentinel = useRef<HTMLDivElement>(null)
  const items = useMemo(() => Array.from({ length: count }, (_, i) => generatedEmoji(start + i)), [start, count])

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && setCount((c) => Math.min(c + BATCH, MAX_ENDLESS)), { rootMargin: '600px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <h2 className="meme text-4xl sm:text-5xl leading-none">
            ♾️ <span className="text-cyan">endless</span> cursed
          </h2>
          <p className="text-sm text-muted mt-1">Generated live as you scroll. Every one is brand new. Stash the good ones.</p>
        </div>
        <Dices className="size-8 text-cyan animate-float shrink-0" aria-hidden />
      </div>
      <EmojiGrid emojis={items} />
      <div ref={sentinel} className="h-20 grid place-items-center text-muted text-sm">
        {count < MAX_ENDLESS ? 'cooking more…' : 'ok that’s enough cursed for today 😵'}
      </div>
    </section>
  )
}
