import { Header } from './components/Header'
import { Marquee } from './components/Marquee'
import { EmojiModal } from './components/EmojiModal'
import { Toasts } from './components/Toasts'
import { KeyboardDock } from './components/keyboard/KeyboardDock'
import { Explore } from './components/pages/Explore'
import { Favourites } from './components/pages/Favourites'
import { Creator } from './components/pages/Creator'
import { AppStoreProvider, useStore } from './store/AppStore'

function Routes() {
  const { route } = useStore()
  if (route === 'favourites') return <Favourites />
  if (route === 'create') return <Creator />
  return <Explore />
}

export default function App() {
  return (
    <AppStoreProvider>
      <Header />
      <Marquee />
      <main className="pb-32">
        <Routes />
      </main>
      <footer className="border-t-3 border-ink bg-ink text-white/70 text-sm">
        <div className="mx-auto max-w-6xl px-4 py-6 flex flex-wrap justify-between gap-2 font-semibold">
          <span>
            <span className="font-display text-sun">LARPMOJI</span> · made for the group chat
          </span>
          <span className="font-mono text-xs">press / to search · K for keyboard</span>
        </div>
      </footer>
      <EmojiModal />
      <KeyboardDock />
      <Toasts />
    </AppStoreProvider>
  )
}
