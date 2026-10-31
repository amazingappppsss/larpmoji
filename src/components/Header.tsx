import { Compass, Heart, Keyboard, WandSparkles } from 'lucide-react'
import { useStore, type Route } from '../store/AppStore'

const NAV: { id: Route; label: string; icon: typeof Compass; color: string }[] = [
  { id: 'explore', label: 'Explore', icon: Compass, color: 'bg-sun' },
  { id: 'favourites', label: 'Faves', icon: Heart, color: 'bg-bubblegum' },
  { id: 'create', label: 'Create', icon: WandSparkles, color: 'bg-lime' },
]

export function Header() {
  const { route, navigate, favourites, setKeyboardOpen } = useStore()
  return (
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b-3 border-ink">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-3">
        <button onClick={() => navigate('explore')} className="flex items-center gap-2 group" aria-label="LARPMOJI home">
          <span className="grid place-items-center size-10 rounded-full bg-sun sticker-sm group-hover:animate-wiggle text-xl">
            ☠
          </span>
          <span className="font-display text-2xl sm:text-3xl leading-none tracking-tight">
            LARP<span className="text-bubblegum [-webkit-text-stroke:1.5px_#111]">MOJI</span>
          </span>
        </button>

        <nav className="ml-auto flex items-center gap-1.5 sm:gap-2" aria-label="Main">
          {NAV.map(({ id, label, icon: Icon, color }) => {
            const active = route === id
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-extrabold sticker-sm press ${
                  active ? `${color} -rotate-2` : 'bg-white'
                }`}
              >
                <Icon className="size-4" aria-hidden />
                <span className="hidden sm:inline">{label}</span>
                {id === 'favourites' && favourites.length > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-ink text-white text-[10px] font-mono">
                    {favourites.length}
                  </span>
                )}
              </button>
            )
          })}
          <button
            onClick={() => setKeyboardOpen(true)}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-extrabold sticker-sm press bg-ink text-white"
            aria-label="Open emoji keyboard"
            title="Open keyboard (K)"
          >
            <Keyboard className="size-4" aria-hidden />
            <span className="hidden md:inline">Keyboard</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
