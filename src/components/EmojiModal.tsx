import { useEffect, useRef } from 'react'
import { Copy, Download, FlaskConical, Hash, Heart, Package, Trash2, X } from 'lucide-react'
import { getCategory } from '../data/emojis'
import { formatCount } from '../lib/search'
import { useStore } from '../store/AppStore'
import { useEmojiActions } from '../store/useEmojiActions'
import { EmojiImage } from './EmojiImage'

export function EmojiModal() {
  const { openEmoji: emoji, setOpenEmoji, isFavourite, toggleFavourite, allEmojis, startRemix, removeCustom, toast, togglePack, inPack } = useStore()
  const { send, copyCode, download } = useEmojiActions()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!emoji) return
    const prevFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenEmoji(null)
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus?.()
    }
  }, [emoji, setOpenEmoji])

  if (!emoji) return null
  const cat = getCategory(emoji.category)
  const fav = isFavourite(emoji.id)
  const related = allEmojis.filter((e) => e.category === emoji.category && e.id !== emoji.id).slice(0, 8)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && setOpenEmoji(null)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emoji-modal-title"
    >
      <div className="relative w-full sm:max-w-2xl max-h-[94dvh] overflow-y-auto bg-surface border border-line rounded-t-[2rem] sm:rounded-[2rem] animate-rise">
        <button ref={closeRef} onClick={() => setOpenEmoji(null)} className="btn absolute top-3 right-3 z-10 size-10 bg-raised hover:bg-line" aria-label="Close">
          <X className="size-5" />
        </button>

        <div className="grid sm:grid-cols-2 gap-5 p-5 sm:p-7">
          <div className={`relative aspect-square rounded-3xl grid place-items-center ${emoji.asset || emoji.custom ? 'checker' : 'bg-raised'}`}>
            <div className="absolute inset-0 rounded-3xl opacity-25 blur-2xl" style={{ background: `radial-gradient(circle, ${cat.color}, transparent 65%)` }} aria-hidden />
            <EmojiImage emoji={emoji} loading="eager" size={512} className="relative w-[82%] h-[82%] animate-float" />
          </div>

          <div className="flex flex-col">
            <span className="self-start rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-black" style={{ background: cat.color }}>
              {cat.glyph} {cat.label}
              {emoji.alsoIn?.map((c) => ` / ${getCategory(c).label}`)}
            </span>
            <h2 id="emoji-modal-title" className="meme text-4xl sm:text-5xl leading-[0.95] mt-3 pr-10">{emoji.name}</h2>
            <p className="mt-3 text-sm text-fg/80 leading-relaxed">{emoji.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {emoji.tags.slice(0, 6).map((t) => (
                <span key={t} className="flex items-center gap-0.5 rounded-full bg-raised px-2 py-0.5 text-[11px] text-muted">
                  <Hash className="size-3" aria-hidden />
                  {t}
                </span>
              ))}
            </div>
            {emoji.uses > 0 && <p className="mt-3 text-xs text-muted">🔥 copied {formatCount(emoji.uses)} times</p>}

            <div className="mt-auto pt-5 grid grid-cols-2 gap-2">
              <button onClick={() => send(emoji)} className="btn col-span-2 h-14 bg-acid text-black text-lg hover:brightness-110">
                <Copy className="size-5" /> Copy image
              </button>
              <button onClick={() => download(emoji, 'png')} className="btn h-11 bg-raised hover:bg-line text-sm">
                <Download className="size-4" /> Download
              </button>
              <button onClick={() => toggleFavourite(emoji)} aria-pressed={fav} className={`btn h-11 text-sm ${fav ? 'bg-hot text-white' : 'bg-raised hover:bg-line'}`}>
                <Heart className={`size-4 ${fav ? 'fill-white' : ''}`} /> {fav ? 'Stashed' : 'Stash'}
              </button>
              <button onClick={() => togglePack(emoji)} aria-pressed={inPack(emoji.id)} className={`btn col-span-2 h-11 text-sm ${inPack(emoji.id) ? 'bg-cyan text-black' : 'bg-raised hover:bg-line'}`}>
                <Package className="size-4" /> {inPack(emoji.id) ? 'In your sticker pack ✓' : 'Add to sticker pack'}
              </button>
              <button onClick={() => startRemix(emoji)} className="btn col-span-2 h-11 bg-raised hover:bg-line text-sm">
                <FlaskConical className="size-4" /> Cook a remix of this
              </button>
              <button onClick={() => copyCode(emoji)} className="col-span-2 text-xs text-muted hover:text-fg">
                or copy shortcode :{emoji.slug}:
              </button>
              {emoji.custom && (
                <button
                  onClick={() => {
                    removeCustom(emoji.id)
                    setOpenEmoji(null)
                    toast(`Deleted ${emoji.name}`, 'info')
                  }}
                  className="btn col-span-2 h-10 text-sm text-hot hover:bg-hot/10"
                >
                  <Trash2 className="size-4" /> Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="border-t border-line px-5 sm:px-7 py-4">
            <h3 className="text-xs uppercase tracking-widest text-muted mb-2">more {cat.label}</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {related.map((r) => (
                <button key={r.id} onClick={() => setOpenEmoji(r)} className="shrink-0 grid place-items-center size-16 rounded-2xl bg-raised hover:bg-line" aria-label={`Open ${r.name}`} title={r.name}>
                  <EmojiImage emoji={r} compact className="size-12" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
