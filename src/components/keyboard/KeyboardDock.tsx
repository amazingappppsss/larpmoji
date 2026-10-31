import { useCallback, useEffect, useMemo } from 'react'
import { Keyboard } from 'lucide-react'
import { CATEGORIES, CUSTOM_CATEGORY } from '../../data/emojis'
import { useStore } from '../../store/AppStore'
import { useEmojiActions } from '../../store/useEmojiActions'
import { EmojiKeyboard } from './EmojiKeyboard'

/** App-wired keyboard + its floating launcher button. */
export function KeyboardDock() {
  const { allEmojis, favourites, recent, keyboardOpen, setKeyboardOpen, isFavourite, toggleFavourite, customEmojis, openEmoji, resolveEmoji, route } = useStore()
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

  // include generated (endless) emojis that were favourited / recently used
  const emojis = useMemo(() => {
    const known = new Set(allEmojis.map((e) => e.id))
    const extra = [...new Set([...recent, ...favourites])].filter((id) => !known.has(id)).map(resolveEmoji).filter((e) => !!e)
    return [...allEmojis, ...extra]
  }, [allEmojis, recent, favourites, resolveEmoji])

  const categories = customEmojis.length ? [...CATEGORIES, CUSTOM_CATEGORY] : CATEGORIES

  return (
    <>
      {!keyboardOpen && !openEmoji && route !== 'create' && (
        <button
          onClick={() => setKeyboardOpen(true)}
          className="btn lg:hidden fixed z-30 right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:right-6 sm:bottom-6 h-14 pl-4 pr-5 bg-acid text-black shadow-2xl shadow-black/70 animate-pop hover:brightness-110"
          aria-label="Open Keyboard"
        >
          <Keyboard className="size-5" aria-hidden />
          Open Keyboard
        </button>
      )}
      <EmojiKeyboard
        open={keyboardOpen}
        onClose={close}
        emojis={emojis}
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
