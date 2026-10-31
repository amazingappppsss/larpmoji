import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Emoji } from '../types'
import { EMOJIS } from '../data/emojis'
import { useLocalStorage } from './useLocalStorage'

export type Route = 'explore' | 'favourites' | 'create'
export type ToastTone = 'success' | 'error' | 'info'
export interface Toast {
  id: number
  message: string
  tone: ToastTone
  image?: string
}

const MAX_RECENT = 32

interface Store {
  route: Route
  navigate: (r: Route) => void
  allEmojis: Emoji[]
  customEmojis: Emoji[]
  addCustom: (e: Emoji) => void
  removeCustom: (id: string) => void
  favourites: string[]
  isFavourite: (id: string) => boolean
  toggleFavourite: (e: Emoji) => void
  recent: string[]
  pushRecent: (id: string) => void
  openEmoji: Emoji | null
  setOpenEmoji: (e: Emoji | null) => void
  keyboardOpen: boolean
  setKeyboardOpen: (open: boolean) => void
  remixSrc: string | null
  startRemix: (e: Emoji) => void
  clearRemix: () => void
  toasts: Toast[]
  toast: (message: string, tone?: ToastTone, image?: string) => void
  dismissToast: (id: number) => void
}

const Ctx = createContext<Store | null>(null)

const readRoute = (): Route => {
  const h = window.location.hash.replace(/^#\/?/, '')
  return h === 'favourites' || h === 'create' ? h : 'explore'
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(readRoute)
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const toast = useCallback(
    (message: string, tone: ToastTone = 'success', image?: string) => {
      const id = nextId.current++
      setToasts((t) => [...t.slice(-2), { id, message, tone, image }])
      setTimeout(() => dismissToast(id), 2800)
    },
    [dismissToast],
  )

  const onStorageError = useCallback(
    () => toast('Browser storage is full — delete a few creations to save more.', 'error'),
    [toast],
  )
  const [favourites, setFavourites] = useLocalStorage<string[]>('larpmoji:favourites', [], onStorageError)
  const [customEmojis, setCustomEmojis] = useLocalStorage<Emoji[]>('larpmoji:custom', [], onStorageError)
  const [recent, setRecent] = useLocalStorage<string[]>('larpmoji:recent', [], onStorageError)
  const [openEmoji, setOpenEmoji] = useState<Emoji | null>(null)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [remixSrc, setRemixSrc] = useState<string | null>(null)

  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((r: Route) => {
    window.location.hash = `/${r}`
    setRoute(r)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const allEmojis = useMemo(() => [...customEmojis, ...EMOJIS], [customEmojis])
  const favSet = useMemo(() => new Set(favourites), [favourites])

  const value: Store = {
    route,
    navigate,
    allEmojis,
    customEmojis,
    addCustom: (e) => setCustomEmojis((list) => [e, ...list]),
    removeCustom: (id) => {
      setCustomEmojis((list) => list.filter((e) => e.id !== id))
      setFavourites((f) => f.filter((x) => x !== id))
      setRecent((r) => r.filter((x) => x !== id))
    },
    favourites,
    isFavourite: (id) => favSet.has(id),
    toggleFavourite: (e) => {
      const had = favSet.has(e.id)
      setFavourites((f) => (had ? f.filter((x) => x !== e.id) : [e.id, ...f]))
      toast(had ? `Unfavourited ${e.name}` : `${e.name} added to favourites`, 'info', e.src)
    },
    recent,
    pushRecent: (id) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, MAX_RECENT)),
    openEmoji,
    setOpenEmoji,
    keyboardOpen,
    setKeyboardOpen,
    remixSrc,
    startRemix: (e) => {
      setRemixSrc(e.src)
      setOpenEmoji(null)
      setKeyboardOpen(false)
      navigate('create')
    },
    clearRemix: () => setRemixSrc(null),
    toasts,
    toast,
    dismissToast,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside <AppStoreProvider>')
  return s
}
