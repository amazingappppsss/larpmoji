import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Emoji } from '../types'
import { EMOJIS, generatedEmoji } from '../data/emojis'
import { generatedCutie } from '../data/cuteEmojis'
import { useLocalStorage } from './useLocalStorage'

export type Route = 'explore' | 'favourites' | 'create' | 'stickers'
export interface StickerPack { name: string; author: string; outline: boolean; ids: string[] }
export type RemixPayload = { recipe?: Emoji['recipe']; src?: string; name?: string }
export type ToastTone = 'success' | 'error' | 'info'
export interface Toast {
  id: number
  message: string
  tone: ToastTone
  emoji?: Emoji
}

const MAX_RECENT = 32

interface Store {
  route: Route
  navigate: (r: Route) => void
  allEmojis: Emoji[]
  /** look up any emoji by id, including generated (endless feed) ones */
  resolveEmoji: (id: string) => Emoji | undefined
  customEmojis: Emoji[]
  addCustom: (e: Emoji) => void
  removeCustom: (id: string) => void
  favourites: string[]
  isFavourite: (id: string) => boolean
  toggleFavourite: (e: Emoji) => void
  recent: string[]
  pushRecent: (id: string) => void
  pack: StickerPack
  updatePack: (patch: Partial<StickerPack>) => void
  togglePack: (e: Emoji) => void
  inPack: (id: string) => boolean
  openEmoji: Emoji | null
  setOpenEmoji: (e: Emoji | null) => void
  keyboardOpen: boolean
  setKeyboardOpen: (open: boolean) => void
  remix: RemixPayload | null
  startRemix: (e: Emoji) => void
  clearRemix: () => void
  toasts: Toast[]
  toast: (message: string, tone?: ToastTone, emoji?: Emoji) => void
  dismissToast: (id: number) => void
}

const Ctx = createContext<Store | null>(null)

const readRoute = (): Route => {
  const h = window.location.hash.replace(/^#\/?/, '')
  return h === 'favourites' || h === 'create' || h === 'stickers' ? h : 'explore'
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(readRoute)
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const toast = useCallback(
    (message: string, tone: ToastTone = 'success', emoji?: Emoji) => {
      const id = nextId.current++
      setToasts((t) => [...t.slice(-2), { id, message, tone, emoji }])
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
  const [pack, setPack] = useLocalStorage<StickerPack>('larpmoji:pack', { name: 'My Cute Pack', author: '', outline: true, ids: [] }, onStorageError)
  const packSet = useMemo(() => new Set(pack.ids), [pack.ids])
  const [openEmoji, setOpenEmoji] = useState<Emoji | null>(null)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [remix, setRemix] = useState<RemixPayload | null>(null)

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

  // File-based assets are only shown once their file actually exists (no broken tiles).
  const [missingAssets, setMissingAssets] = useState<Set<string>>(() => new Set(EMOJIS.filter((e) => e.asset).map((e) => e.id)))
  useEffect(() => {
    EMOJIS.filter((e) => e.asset).forEach((e) => {
      const img = new Image()
      img.onload = () =>
        setMissingAssets((m) => {
          const n = new Set(m)
          n.delete(e.id)
          return n
        })
      img.src = e.src
    })
  }, [])
  const allEmojis = useMemo(() => [...customEmojis, ...EMOJIS.filter((e) => !missingAssets.has(e.id))], [customEmojis, missingAssets])
  const favSet = useMemo(() => new Set(favourites), [favourites])
  const byId = useMemo(() => new Map(allEmojis.map((e) => [e.id, e])), [allEmojis])
  const resolveEmoji = useCallback(
    (id: string) => byId.get(id) ?? (id.startsWith('gen-') ? generatedEmoji(Number(id.slice(4))) : id.startsWith('cutie-') ? generatedCutie(Number(id.slice(6))) : undefined),
    [byId],
  )

  const value: Store = {
    route,
    navigate,
    allEmojis,
    resolveEmoji,
    customEmojis,
    addCustom: (e) => setCustomEmojis((list) => [e, ...list]),
    removeCustom: (id) => {
      setCustomEmojis((list) => list.filter((e) => e.id !== id))
      setFavourites((f) => f.filter((x) => x !== id))
      setPack((p) => ({ ...p, ids: p.ids.filter((x) => x !== id) }))
      setRecent((r) => r.filter((x) => x !== id))
    },
    favourites,
    isFavourite: (id) => favSet.has(id),
    toggleFavourite: (e) => {
      const had = favSet.has(e.id)
      setFavourites((f) => (had ? f.filter((x) => x !== e.id) : [e.id, ...f]))
      toast(had ? `Removed ${e.name} from your stash` : `${e.name} saved to your stash`, 'info', e)
    },
    pack,
    updatePack: (patch) => setPack((p) => ({ ...p, ...patch })),
    togglePack: (e) => {
      if (e.text) return toast('Text emojis paste as text, no sticker needed ♡', 'info')
      const had = packSet.has(e.id)
      if (!had && pack.ids.length >= 120) return toast('Packs max out at 120 stickers.', 'error')
      setPack((p) => ({ ...p, ids: had ? p.ids.filter((x) => x !== e.id) : [...p.ids, e.id] }))
      toast(had ? `Removed from sticker pack` : `Added to sticker pack (${pack.ids.length + 1})`, 'info', e)
    },
    inPack: (id) => packSet.has(id),
    recent,
    pushRecent: (id) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, MAX_RECENT)),
    openEmoji,
    setOpenEmoji,
    keyboardOpen,
    setKeyboardOpen,
    remix,
    startRemix: (e) => {
      setRemix(e.recipe && !e.src ? { recipe: e.recipe, name: e.name } : { src: e.src, name: e.name })
      setOpenEmoji(null)
      setKeyboardOpen(false)
      navigate('create')
    },
    clearRemix: () => setRemix(null),
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
