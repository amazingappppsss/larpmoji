import { Header } from './components/Header'
import { Backdrop } from './components/Backdrop'
import { Marquee } from './components/Marquee'
import { EmojiModal } from './components/EmojiModal'
import { Toasts } from './components/Toasts'
import { KeyboardDock } from './components/keyboard/KeyboardDock'
import { Explore } from './components/pages/Explore'
import { Favourites } from './components/pages/Favourites'
import { Creator } from './components/pages/Creator'
import { Stickers } from './components/pages/Stickers'
import { AppStoreProvider, useStore } from './store/AppStore'

function Routes() {
  const { route } = useStore()
  if (route === 'favourites') return <Favourites />
  if (route === 'create') return <Creator />
  if (route === 'stickers') return <Stickers />
  return <Explore />
}

export default function App() {
  return (
    <AppStoreProvider>
      <Backdrop />
      <Header />
      <div className="overflow-hidden">
        <Marquee />
      </div>
      <main className="pb-32">
        <Routes />
      </main>
      <footer className="border-t border-line text-xs font-semibold text-muted bg-white/50">
        <div className="mx-auto max-w-7xl px-5 py-6 flex flex-wrap justify-between gap-2">
          <span>
            <span className="font-display font-bold text-base text-fg">larp<span className="gradient-text">moji</span></span> · made with ♡ for the group chat
          </span>
          <span>/ search · K keyboard</span>
        </div>
      </footer>
      <EmojiModal />
      <KeyboardDock />
      <Toasts />
    </AppStoreProvider>
  )
}
