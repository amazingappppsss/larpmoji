import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Clock, Copy, Download, Heart, Keyboard, Search, Sparkles, X } from 'lucide-react'
import type { Category, Emoji } from '../../types'
import { filterEmojis } from '../../lib/search'
import { EmojiImage } from '../EmojiImage'
import { SearchBar } from '../SearchBar'

/**
 * Reusable emoji keyboard.
 *
 * It knows nothing about app state: pass in the emojis, which ids are
 * favourites / recently used, and callbacks. That keeps it reusable
 * (chat composer, comment box, etc.) and fine with hundreds of emojis
 * (lazy images + `content-visibility` on each section).
 */
export interface EmojiKeyboardProps {
  open: boolean
  onClose: () => void
  emojis: Emoji[]
  categories: Category[]
  favouriteIds: string[]
  recentIds: string[]
  /** Called when an emoji is picked. Should copy/send it. */
  onSend: (emoji: Emoji) => void
  onDownload: (emoji: Emoji) => void
  onToggleFavourite: (emoji: Emoji) => void
  isFavourite: (id: string) => boolean
  title?: string
}

interface Section {
  id: string
  label: string
  icon: React.ReactNode
  items: Emoji[]
}

export function EmojiKeyboard({
  open,
  onClose,
  emojis,
  categories,
  favouriteIds,
  recentIds,
  onSend,
  onDownload,
  onToggleFavourite,
  isFavourite,
  title = 'larpmoji keyboard',
}: EmojiKeyboardProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Emoji | null>(null)
  const [activeSection, setActiveSection] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const byId = useMemo(() => new Map(emojis.map((e) => [e.id, e])), [emojis])

  const sections: Section[] = useMemo(() => {
    if (query.trim()) {
      return [
        {
          id: 'results',
          label: 'Results',
          icon: <Search className="size-3.5" />,
          items: filterEmojis(emojis, { query, category: 'all', sort: 'trending' }),
        },
      ]
    }
    const pickIds = (ids: string[]) => ids.map((id) => byId.get(id)).filter((e): e is Emoji => !!e)
    const featured = emojis.filter((e) => e.featured)
    const out: Section[] = [
      { id: 'recent', label: 'Recently used', icon: <Clock className="size-3.5" />, items: pickIds(recentIds) },
      { id: 'favourites', label: 'Favourites', icon: <Heart className="size-3.5" />, items: pickIds(favouriteIds) },
      { id: 'featured', label: 'Featured', icon: <Sparkles className="size-3.5" />, items: featured },
      ...categories.map((c) => ({
        id: c.id,
        label: c.label,
        icon: <span aria-hidden>{c.glyph}</span>,
        items: emojis.filter((e) => e.category === c.id || e.alsoIn?.includes(c.id)),
      })),
    ]
    // Recent + favourites always show (with a hint if empty); other empty sections are hidden.
    return out.filter((s) => s.id === 'recent' || s.id === 'favourites' || s.items.length > 0)
  }, [query, emojis, byId, recentIds, favouriteIds, categories])

  // Escape closes; lock background scroll on small screens; focus the panel.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    panelRef.current?.querySelector<HTMLInputElement>('input[type=search]')?.focus({ preventScroll: true })
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Track which section is in view for the tab strip.
  useEffect(() => {
    const root = scrollRef.current
    if (!open || !root) return
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) setActiveSection(top.target.getAttribute('data-section') ?? '')
      },
      { root, rootMargin: '0px 0px -70% 0px' },
    )
    root.querySelectorAll('[data-section]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [open, sections])

  if (!open) return null

  const jumpTo = (id: string) => {
    const el = scrollRef.current?.querySelector(`[data-section="${id}"]`) as HTMLElement | null
    if (el && scrollRef.current) scrollRef.current.scrollTo({ top: el.offsetTop - 4, behavior: 'smooth' })
  }

  const pick = (e: Emoji) => {
    setSelected(e)
    onSend(e)
  }

  /** Arrow-key navigation between emoji keys (grid-aware). */
  const onGridKey = (ev: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(ev.key)) return
    const keys = Array.from(scrollRef.current?.querySelectorAll<HTMLButtonElement>('[data-emoji-key]') ?? [])
    const i = keys.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    ev.preventDefault()
    const cur = keys[i].getBoundingClientRect()
    let next: HTMLButtonElement | undefined
    if (ev.key === 'ArrowLeft') next = keys[i - 1]
    else if (ev.key === 'ArrowRight') next = keys[i + 1]
    else {
      const dir = ev.key === 'ArrowDown' ? 1 : -1
      const candidates = keys.filter((k) => {
        const r = k.getBoundingClientRect()
        return dir > 0 ? r.top > cur.top + 4 : r.top < cur.top - 4
      })
      const rowTop = dir > 0 ? Math.min(...candidates.map((k) => k.getBoundingClientRect().top)) : Math.max(...candidates.map((k) => k.getBoundingClientRect().top))
      next = candidates
        .filter((k) => Math.abs(k.getBoundingClientRect().top - rowTop) < 4)
        .sort((a, b) => Math.abs(a.getBoundingClientRect().left - cur.left) - Math.abs(b.getBoundingClientRect().left - cur.left))[0]
    }
    next?.focus()
    next?.scrollIntoView({ block: 'nearest' })
  }

  const fav = selected ? isFavourite(selected.id) : false

  return (
    <>
      {/* backdrop (mobile only – desktop keeps the page usable) */}
      <div className="fixed inset-0 z-40 bg-fg/20 backdrop-blur-[2px] sm:hidden" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-label={title}
        className="fixed z-50 inset-x-0 bottom-0 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[420px] h-[min(78dvh,600px)] flex flex-col bg-white/[0.97] backdrop-blur-xl border border-white rounded-t-[1.75rem] sm:rounded-[1.75rem] shadow-soft animate-rise pb-[env(safe-area-inset-bottom)]"
      >
        {/* title bar */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <span className="grid place-items-center size-8 rounded-lg bg-acid text-ink">
            <Keyboard className="size-4" aria-hidden />
          </span>
          <h2 className="font-display font-bold text-lg leading-none">{title}</h2>
          <button onClick={onClose} className="btn ml-auto size-9 bg-raised hover:bg-line" aria-label="Close keyboard">
            <X className="size-4" />
          </button>
        </div>

        {/* selection preview */}
        <div className="mx-3 mb-2 rounded-2xl bg-gradient-to-br from-[#fff0f7] to-[#f3eeff] p-2.5 flex items-center gap-3 min-h-[92px]">
          {selected ? (
            <>
              <div className="grid place-items-center size-[72px] shrink-0 rounded-xl checker overflow-hidden">
                <EmojiImage emoji={selected} loading="eager" compact className="max-w-[64px] max-h-[64px] w-full h-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold leading-tight truncate">{selected.name}</div>
                <div className="text-[11px] text-muted truncate">:{selected.slug}:</div>
                <div className="mt-1.5 flex gap-1.5">
                  <button onClick={() => onSend(selected)} className="btn h-8 px-3 bg-acid text-ink text-xs">
                    <Copy className="size-3.5" /> Copy
                  </button>
                  <button onClick={() => onDownload(selected)} className="btn size-8 bg-surface border border-line" aria-label={`Download ${selected.name}`}>
                    <Download className="size-3.5" />
                  </button>
                  <button
                    onClick={() => onToggleFavourite(selected)}
                    aria-pressed={fav}
                    className={`btn size-8 border ${fav ? 'bg-hot border-hot text-white' : 'bg-surface border-line'}`}
                    aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <Heart className={`size-3.5 ${fav ? 'fill-white' : ''}`} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted px-1">
              Tap to copy ♡ cuties copy as <span className="text-hot">images</span>, kaomoji as <span className="text-hot">real text</span>.
            </p>
          )}
        </div>

        <div className="px-3">
          <SearchBar value={query} onChange={setQuery} size="sm" placeholder="Search emojis…" />
        </div>

        {/* section tabs */}
        {!query.trim() && (
          <div className="flex gap-1 px-3 pt-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Keyboard sections">
            {sections.map((s) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={activeSection === s.id}
                onClick={() => jumpTo(s.id)}
                title={s.label}
                className={`shrink-0 grid place-items-center size-8 rounded-lg text-sm font-extrabold border-2 ${
                  activeSection === s.id ? 'bg-acid/20 border-acid' : 'border-transparent hover:bg-raised'
                }`}
              >
                {s.icon}
                <span className="sr-only">{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* grid */}
        <div ref={scrollRef} onKeyDown={onGridKey} className="relative flex-1 overflow-y-auto overscroll-contain px-3 pt-1 pb-3 mt-1">
          {sections.map((s) => (
            <section key={s.id} data-section={s.id} className="pt-2 [content-visibility:auto] [contain-intrinsic-size:auto_200px]">
              <h3 className="sticky top-0 z-10 bg-surface/95 backdrop-blur flex items-center gap-1.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-muted">
                {s.icon} {s.label}
                <span className="font-mono font-normal">{s.items.length}</span>
              </h3>
              {s.items.length === 0 ? (
                <p className="text-xs text-muted/70 py-2 px-1">
                  {s.id === 'recent' ? 'Emojis you copy will show up here.' : s.id === 'favourites' ? 'Heart an emoji to pin it here.' : 'No matches. Try another word.'}
                </p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-1">
                  {s.items.map((e) => (
                    <button
                      key={`${s.id}-${e.id}`}
                      data-emoji-key
                      style={e.text ? { gridColumn: 'span 2', aspectRatio: 'auto', height: '100%' } : undefined}
                      onClick={() => pick(e)}
                      title={`${e.name} — click to copy`}
                      aria-label={`Copy ${e.name}`}
                      className={`grid place-items-center aspect-square rounded-xl transition-transform hover:scale-115 hover:bg-raised active:scale-95 ${
                        selected?.id === e.id ? 'bg-acid/20 ring-2 ring-acid' : ''
                      }`}
                    >
                      <EmojiImage emoji={e} compact className={e.text ? 'w-full h-9 px-1' : 'size-9'} />
                    </button>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
