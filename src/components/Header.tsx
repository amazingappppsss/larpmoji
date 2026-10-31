import { Keyboard } from 'lucide-react'
import { useStore, type Route } from '../store/AppStore'
import { EMOJIS } from '../data/emojis'
import { EmojiImage } from './EmojiImage'

const NAV: { id: Route; label: string; glyph: string }[] = [
  { id: 'explore', label: 'Explore', glyph: '✨' },
  { id: 'stickers', label: 'Packs', glyph: '🎀' },
  { id: 'favourites', label: 'Stash', glyph: '💗' },
  { id: 'create', label: 'Cook', glyph: '🧪' },
]

const LOGO = EMOJIS.find((e) => e.id === 'cute-sparkle-mochi')!

export function Header() {
  const { route, navigate, favourites, setKeyboardOpen, pack } = useStore()
  return (
    <header className="sticky top-0 z-30 glass border-b border-white/70 shadow-[0_1px_0_#f0e3f1]">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 h-16 flex items-center gap-2">
        <button onClick={() => navigate('explore')} className="flex items-center gap-1 group shrink-0" aria-label="LARPMOJI home">
          <EmojiImage emoji={LOGO} loading="eager" className="size-11 group-hover:animate-squish" />
          <span className="font-display font-bold text-[22px] sm:text-2xl tracking-tight leading-none">
            larp<span className="gradient-text">moji</span>
          </span>
        </button>

        <nav className="ml-auto flex items-center gap-0.5 rounded-full bg-raised/80 border border-white p-1 shadow-softer" aria-label="Main">
          {NAV.map(({ id, label, glyph }) => {
            const active = route === id
            const badge = id === 'favourites' ? favourites.length : id === 'stickers' ? pack.ids.length : 0
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`btn relative px-2.5 sm:px-3.5 h-9 text-sm ${active ? 'bg-white text-hot shadow-softer' : 'text-fg/70 hover:text-fg'}`}
              >
                <span aria-hidden>{glyph}</span>
                <span className="hidden md:inline">{label}</span>
                {badge > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 grid place-items-center rounded-full bg-hot text-white text-[10px] font-black">{badge}</span>}
              </button>
            )
          })}
        </nav>
        <button
          onClick={() => setKeyboardOpen(true)}
          className="btn size-11 bg-white border border-line text-hot shadow-softer shrink-0"
          aria-label="Open emoji keyboard"
          title="Emoji keyboard (K)"
        >
          <Keyboard className="size-5" />
        </button>
      </div>
    </header>
  )
}
