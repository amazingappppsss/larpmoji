import { useCallback, useEffect } from 'react'
import { Keyboard } from 'lucide-react'
import { CATEGORIES, CUSTOM_CATEGORY } from '../../data/emojis'
import { useStore } from '../../store/AppStore'
import { useEmojiActions } from '../../store/useEmojiActions'
import { EmojiKeyboard } from './EmojiKeyboard'

/** App-wired keyboard + its floating launcher button. */
export function KeyboardDock() {
  const { allEmojis, favourites, recent, keyboardOpen, setKeyboardOpen, isFavourite, toggleFavourite, customEmojis, openEmoji } = useStore()
  const { send, download } = useEmojiActions()
  const close = useCallback(() => setKeyboardOpen(false), [setKeyboardOpen])

  // "K" toggles the keyboard (ignored while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key.toLowerCase() !== 'k' || e.metaKey || e.ctrlKey || e.altKey) return
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable) return
      setKeyboardOpen(!keyboardOpen)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keyboardOpen, setKeyboardOpen])

  const categories = customEmojis.length ? [...CATEGORIES, CUSTOM_CATEGORY] : CATEGORIES

  return (
    <>
      {!keyboardOpen && !openEmoji && (
        <button
          onClick={() => setKeyboardOpen(true)}
          className="fixed z-30 right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:right-6 sm:bottom-6 flex items-center gap-2 rounded-full bg-ink text-sun pl-4 pr-5 py-3 font-extrabold sticker press animate-pop"
          aria-label="Open Keyboard"
        >
          <Keyboard className="size-5" aria-hidden />
          Open Keyboard
        </button>
      )}
      <EmojiKeyboard
        open={keyboardOpen}
        onClose={close}
        emojis={allEmojis}
        categories={categories}
        favouriteIds={favourites}
        recentIds={recent}
        onSend={send}
        onDownload={(e) => download(e, 'png')}
        onToggleFavourite={toggleFavourite}
        isFavourite={isFavourite}
      />
    </>
  )
}
