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
      <div className="overflow-hidden">
        <Marquee />
      </div>
      <main className="pb-32">
        <Routes />
      </main>
      <footer className="border-t border-line text-xs text-muted">
        <div className="mx-auto max-w-7xl px-5 py-6 flex flex-wrap justify-between gap-2">
          <span>
            <span className="meme text-base">LARP<span className="text-acid">MOJI</span></span> · emojis look like your phone’s own style
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
