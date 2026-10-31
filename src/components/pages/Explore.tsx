import { useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, Sparkles } from 'lucide-react'
import type { CategoryId, Collection, Emoji } from '../../types'
import { CATEGORIES, COLLECTIONS, collectionOf, generatedEmoji, getCategory } from '../../data/emojis'
import { generatedCutie } from '../../data/cuteEmojis'
import { filterEmojis } from '../../lib/search'
import { useStore } from '../../store/AppStore'
import { SearchBar } from '../SearchBar'
import { EmojiGrid, EmptyState } from '../EmojiGrid'
import { EmojiImage } from '../EmojiImage'
import { ChatPreview } from '../ChatPreview'

const BATCH = 18
const MAX_ENDLESS = 720
const HERO = ['cute-sparkle-mochi', 'cute-teary-bear', 'cute-lovey-bunny', 'cute-smug-kitty', 'cute-sleepy-cloud', 'cute-yay-frog', 'cute-heart-eyes-mochi']

export function Explore() {
  const { allEmojis, navigate, setOpenEmoji, setKeyboardOpen, pack } = useStore()
  const [collection, setCollection] = useState<Collection>('cute')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')

  const inCollection = useMemo(() => allEmojis.filter((e) => collectionOf(e) === collection), [allEmojis, collection])
  // searching looks everywhere; browsing stays inside the chosen collection
  const results = useMemo(
    () => filterEmojis(query.trim() ? allEmojis : inCollection, { query, category: query.trim() ? 'all' : category, sort: 'trending' }),
    [allEmojis, inCollection, query, category],
  )
  const cats = CATEGORIES.filter((c) => c.collection === collection)
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of inCollection) for (const id of [e.category, ...(e.alsoIn ?? [])]) c[id] = (c[id] ?? 0) + 1
    return c
  }, [inCollection])

  const browsing = !query.trim() && category === 'all'
  const activeCat = category === 'all' ? null : getCategory(category)
  const hero = useMemo(() => HERO.map((id) => allEmojis.find((e) => e.id === id)).filter((e): e is Emoji => !!e), [allEmojis])
  const switchTo = (c: Collection) => {
    setCollection(c)
    setCategory('all')
    setQuery('')
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-5">
      {/* HERO */}
      <section className="relative pt-8 sm:pt-12 pb-6 grid lg:grid-cols-[1.1fr_1fr] gap-6 items-center">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white shadow-softer px-3 py-1 text-xs font-black text-hot">
            <Sparkles className="size-3.5" /> new · premium cuties just dropped
          </span>
          <h1 className="meme text-[13vw] sm:text-7xl leading-[0.95] mt-4">
            cute emojis,
            <br />
            <span className="gradient-text">tap to copy ♡</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-fg/70 font-semibold max-w-md">
            Premium kawaii emojis, kaomoji and sticker packs. Paste them in WhatsApp, iMessage, Discord, anywhere.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => setKeyboardOpen(true)} className="btn h-12 px-5 bg-gradient-to-r from-[#ff7ab8] to-[#b98cff] text-white shadow-pop">
              <Keyboard className="size-5" /> Open Keyboard
            </button>
            <button onClick={() => navigate('stickers')} className="btn h-12 px-5 bg-white text-fg shadow-softer">
              🎀 Make a sticker pack {pack.ids.length > 0 && <span className="text-hot">({pack.ids.length})</span>}
            </button>
          </div>
        </div>

        {/* floating sticker cloud */}
        <div className="relative h-56 sm:h-72 lg:h-80" aria-hidden>
          {hero.map((e, i) => {
            const spots = [
              ['38%', '18%', 'size-36 sm:size-44', 0],
              ['4%', '6%', 'size-20 sm:size-24', 0.6],
              ['70%', '2%', 'size-20 sm:size-28', 1.2],
              ['8%', '62%', 'size-16 sm:size-24', 1.8],
              ['76%', '58%', 'size-20 sm:size-24', 0.3],
              ['52%', '72%', 'size-14 sm:size-20', 0.9],
              ['24%', '34%', 'size-12 sm:size-16', 1.5],
            ] as const
            const [l, t, cls, d] = spots[i]
            return (
              <button key={e.id} tabIndex={-1} onClick={() => setOpenEmoji(e)} className={`absolute ${cls} animate-float`} style={{ left: l, top: t, animationDelay: `${d}s` }}>
                <EmojiImage emoji={e} loading="eager" className="size-full drop-shadow-[0_12px_18px_rgb(160_90_170/0.25)]" />
              </button>
            )
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-6">
        <div className="min-w-0">
          {/* COLLECTION SWITCHER */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-[1.6rem] bg-white/70 shadow-softer border border-white" role="tablist" aria-label="Collections">
            {COLLECTIONS.map((c) => {
              const active = collection === c.id && !query.trim()
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchTo(c.id)}
                  className={`rounded-[1.2rem] px-2 py-2.5 sm:py-3 text-center transition-all ${active ? 'bg-white shadow-soft' : 'hover:bg-white/60'}`}
                >
                  <div className="font-display font-bold text-base sm:text-lg leading-none">
                    <span aria-hidden>{c.glyph}</span> {c.label}
                  </div>
                  <div className={`hidden sm:block mt-1 text-[11px] font-semibold ${active ? 'text-hot' : 'text-muted'}`}>{c.blurb}</div>
                </button>
              )
            })}
          </div>

          <div className="sticky top-16 z-20 -mx-3 sm:-mx-5 px-3 sm:px-5 pt-3 pb-1 bg-gradient-to-b from-bg via-bg/95 to-bg/0">
            <SearchBar value={query} onChange={setQuery} hotkey placeholder="search: love, sleepy, bunny, cry, kaomoji…" />
            {!query.trim() && (
              <div className="-mx-3 sm:-mx-5 px-3 sm:px-5 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 py-2.5 w-max" role="tablist" aria-label="Categories">
                  {[{ id: 'all' as const, label: 'All', glyph: '🌈', color: '#ffffff' }, ...cats].map((c) => {
                    const active = category === c.id
                    return (
                      <button
                        key={c.id}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setCategory(c.id)}
                        style={active ? { background: c.id === 'all' ? '#3b2a4a' : c.color } : undefined}
                        className={`btn h-10 px-4 text-sm whitespace-nowrap ${active ? (c.id === 'all' ? 'text-white shadow-soft' : 'text-ink shadow-soft') : 'bg-white text-fg/75 shadow-softer'}`}
                      >
                        <span aria-hidden className="font-emoji text-base leading-none">{c.glyph}</span>
                        {c.label}
                        <span className="text-[11px] opacity-60">{c.id === 'all' ? inCollection.length : (counts[c.id] ?? 0)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {collection === 'text' && browsing && (
            <p className="mb-3 rounded-2xl bg-white/80 shadow-softer px-4 py-3 text-sm font-semibold text-fg/80">
              ♡ These copy as <b className="text-hot">real text</b>, so they paste inline like keyboard emojis: in messages, bios, captions, usernames.
            </p>
          )}
          {!browsing && (
            <p className="mt-1 mb-3 text-sm font-semibold text-muted">
              {results.length} result{results.length === 1 ? '' : 's'}
              {activeCat && !query.trim() && <> · {activeCat.blurb}</>}
            </p>
          )}

          <EmojiGrid
            emojis={results}
            empty={
              <EmptyState glyph="🥺" title="nothing here yet">
                No emoji for “{query}”. Try “love”, “sleepy” or “bunny”.
              </EmptyState>
            }
          />

          {browsing && collection !== 'text' && <EndlessFeed key={collection} kind={collection} />}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <ChatPreview />
            <button onClick={() => navigate('stickers')} className="group rounded-[1.75rem] p-5 text-left bg-gradient-to-br from-[#ffd1e6] via-[#e8dbff] to-[#d4ecff] shadow-soft hover:-translate-y-0.5 transition">
              <div className="text-3xl mb-1" aria-hidden>🎀</div>
              <div className="meme text-2xl leading-tight">turn them into stickers</div>
              <p className="text-sm font-semibold text-fg/70 mt-1">Build a pack for WhatsApp, Telegram & Discord in a minute.</p>
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

/** Infinite stream of freshly generated emojis (cute or cursed). */
function EndlessFeed({ kind }: { kind: Collection }) {
  const [start] = useState(() => Math.floor(Math.random() * 1_000_000))
  const [count, setCount] = useState(BATCH)
  const sentinel = useRef<HTMLDivElement>(null)
  const items = useMemo(() => Array.from({ length: count }, (_, i) => (kind === 'cute' ? generatedCutie(start + i) : generatedEmoji(start + i))), [start, count, kind])

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && setCount((c) => Math.min(c + BATCH, MAX_ENDLESS)), { rootMargin: '600px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="mt-12">
      <div className="mb-4">
        <h2 className="meme text-3xl sm:text-4xl leading-none">
          {kind === 'cute' ? (
            <>
              ♾️ endless <span className="gradient-text">cuties</span>
            </>
          ) : (
            '♾️ endless cursed'
          )}
        </h2>
        <p className="text-sm font-semibold text-muted mt-1">Made fresh as you scroll. Every one is one of one, so stash your favourites ♡</p>
      </div>
      <EmojiGrid emojis={items} />
      <div ref={sentinel} className="h-20 grid place-items-center text-muted text-sm font-semibold">
        {count < MAX_ENDLESS ? 'making more cuties…' : 'that’s enough cute for today ♡'}
      </div>
    </section>
  )
}
