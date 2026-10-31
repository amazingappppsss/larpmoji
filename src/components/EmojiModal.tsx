import { useEffect, useRef } from 'react'
import { Calendar, Copy, Download, FileCode2, Hash, Heart, TrendingUp, Trash2, User, WandSparkles, X } from 'lucide-react'
import { getCategory } from '../data/emojis'
import { formatCount, timeAgo } from '../lib/search'
import { useStore } from '../store/AppStore'
import { useEmojiActions } from '../store/useEmojiActions'
import { EmojiImage } from './EmojiImage'

export function EmojiModal() {
  const { openEmoji: emoji, setOpenEmoji, isFavourite, toggleFavourite, allEmojis, startRemix, removeCustom, toast } = useStore()
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
  const related = allEmojis.filter((e) => e.category === emoji.category && e.id !== emoji.id).slice(0, 6)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/60 backdrop-blur-sm p-0 sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && setOpenEmoji(null)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emoji-modal-title"
    >
      <div className="relative w-full sm:max-w-3xl max-h-[92dvh] overflow-y-auto bg-paper rounded-t-[2rem] sm:rounded-[2rem] sticker shadow-hard-lg animate-rise">
        <button
          ref={closeRef}
          onClick={() => setOpenEmoji(null)}
          className="absolute top-4 right-4 z-10 grid place-items-center size-10 rounded-full bg-white sticker-sm press"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-5 sm:p-8">
          {/* preview */}
          <div className="relative">
            <div className={`relative aspect-square rounded-3xl sticker -rotate-2 grid place-items-center overflow-hidden ${emoji.asset || emoji.custom ? 'checker' : 'bg-white'}`}>
              {!(emoji.asset || emoji.custom) && <div className={`absolute inset-0 ${cat.color} opacity-50`} aria-hidden />}
              <EmojiImage emoji={emoji} loading="eager" className="relative w-[80%] h-[80%] drop-shadow-[6px_6px_0_rgba(0,0,0,0.15)]" />
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              {([[16, 'size-4'], [32, 'size-8'], [64, 'size-16']] as const).map(([s, cls]) => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <div className="grid place-items-center size-20 rounded-xl bg-white border-2 border-ink/15">
                    <EmojiImage emoji={emoji} compact className={cls} />
                  </div>
                  <span className="font-mono text-[10px] text-ink/50">{s}px</span>
                </div>
              ))}
            </div>
          </div>

          {/* details */}
          <div className="flex flex-col">
            <span className={`self-start rounded-full border-2 border-ink px-3 py-0.5 text-xs font-extrabold uppercase ${cat.color}`}>
              {cat.glyph} {cat.label}
              {emoji.alsoIn?.map((c) => ` / ${getCategory(c).label}`)}
            </span>
            <h2 id="emoji-modal-title" className="font-display text-4xl sm:text-5xl leading-none mt-3 pr-10">{emoji.name}</h2>
            <button
              onClick={() => copyCode(emoji)}
              className="self-start mt-2 font-mono text-sm bg-ink text-lime rounded-lg px-2 py-1 hover:bg-ink/80"
              title="Copy shortcode"
            >
              :{emoji.slug}:
            </button>
            <p className="mt-4 text-lg font-semibold leading-snug">{emoji.description}</p>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <Stat icon={<TrendingUp className="size-4" />} label="uses" value={formatCount(emoji.uses)} />
              <Stat icon={<User className="size-4" />} label="by" value={`@${emoji.author}`} />
              <Stat icon={<Calendar className="size-4" />} label="added" value={timeAgo(emoji.createdAt)} />
            </dl>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {emoji.tags.map((t) => (
                <span key={t} className="flex items-center gap-0.5 rounded-full bg-white border-2 border-ink/20 px-2 py-0.5 text-xs font-bold">
                  <Hash className="size-3" aria-hidden />
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button onClick={() => send(emoji)} className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-lime px-4 py-3.5 font-extrabold text-lg sticker press">
                <Copy className="size-5" /> Copy image
              </button>
              <button onClick={() => download(emoji, 'png')} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2.5 font-extrabold sticker-sm press">
                <Download className="size-4" /> PNG
              </button>
              {emoji.svg ? (
                <button onClick={() => download(emoji, 'svg')} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2.5 font-extrabold sticker-sm press">
                  <FileCode2 className="size-4" /> SVG
                </button>
              ) : (
                <button onClick={() => copyCode(emoji)} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2.5 font-extrabold sticker-sm press">
                  <Hash className="size-4" /> Shortcode
                </button>
              )}
              <button
                onClick={() => toggleFavourite(emoji)}
                aria-pressed={fav}
                className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 font-extrabold sticker-sm press ${fav ? 'bg-bubblegum' : 'bg-white'}`}
              >
                <Heart className={`size-4 ${fav ? 'fill-ink' : ''}`} /> {fav ? 'Faved' : 'Fave'}
              </button>
              <button onClick={() => startRemix(emoji)} className="flex items-center justify-center gap-2 rounded-2xl bg-lilac px-3 py-2.5 font-extrabold sticker-sm press">
                <WandSparkles className="size-4" /> Remix
              </button>
              {emoji.custom && (
                <button
                  onClick={() => {
                    removeCustom(emoji.id)
                    setOpenEmoji(null)
                    toast(`Deleted ${emoji.name}`, 'info')
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-tomato px-3 py-2.5 font-extrabold sticker-sm press"
                >
                  <Trash2 className="size-4" /> Delete creation
                </button>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="border-t-3 border-ink border-dashed px-5 sm:px-8 py-5">
            <h3 className="font-display text-xl mb-3">more {cat.label.toLowerCase()} energy</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setOpenEmoji(r)}
                  className="shrink-0 grid place-items-center size-20 rounded-2xl bg-white sticker-sm press"
                  aria-label={`Open ${r.name}`}
                  title={r.name}
                >
                  <EmojiImage emoji={r} compact className="size-14" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white border-2 border-ink/15 px-2 py-1.5 min-w-0">
      <dt className="flex items-center gap-1 text-[11px] font-bold text-ink/50 uppercase">
        {icon}
        {label}
      </dt>
      <dd className="font-extrabold truncate">{value}</dd>
    </div>
  )
}
