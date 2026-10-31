import { Keyboard } from 'lucide-react'
import { useStore, type Route } from '../store/AppStore'
import { EMOJIS } from '../data/emojis'
import { EmojiImage } from './EmojiImage'

const NAV: { id: Route; label: string; glyph: string }[] = [
  { id: 'explore', label: 'Feed', glyph: '🔥' },
  { id: 'create', label: 'Cook', glyph: '🧪' },
  { id: 'favourites', label: 'Stash', glyph: '💾' },
  { id: 'stickers', label: 'Packs', glyph: '📦' },
]

const LOGO = EMOJIS.find((e) => e.id === 'lm-crying-laughing-awake')!

export function Header() {
  const { route, navigate, favourites, setKeyboardOpen, pack } = useStore()
  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 h-16 flex items-center gap-2">
        <button onClick={() => navigate('explore')} className="flex items-center gap-1.5 group shrink-0" aria-label="LARPMOJI home">
          <EmojiImage emoji={LOGO} loading="eager" className="size-10 group-hover:animate-wobble" />
          <span className="meme text-[26px] sm:text-3xl leading-none tracking-wide">
            LARP<span className="text-acid">MOJI</span>
          </span>
        </button>

        <nav className="ml-auto flex items-center gap-1 rounded-full bg-surface border border-line p-1" aria-label="Main">
          {NAV.map(({ id, label, glyph }) => {
            const active = route === id
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`btn relative px-2.5 sm:px-4 h-9 text-sm ${active ? 'bg-acid text-black' : 'text-fg/80 hover:text-fg hover:bg-raised'}`}
              >
                <span aria-hidden>{glyph}</span>
                <span className="hidden sm:inline">{label}</span>
                {id === 'favourites' && favourites.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 grid place-items-center rounded-full bg-hot text-white text-[10px]">{favourites.length}</span>
                )}
                {id === 'stickers' && pack.ids.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 grid place-items-center rounded-full bg-cyan text-black text-[10px]">{pack.ids.length}</span>
                )}
              </button>
            )
          })}
        </nav>
        <button
          onClick={() => setKeyboardOpen(true)}
          className="btn size-11 bg-surface border border-line hover:border-acid hover:text-acid shrink-0"
          aria-label="Open emoji keyboard"
          title="Emoji keyboard (K)"
        >
          <Keyboard className="size-5" />
        </button>
      </div>
    </header>
  )
}
