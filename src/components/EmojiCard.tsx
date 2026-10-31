import { Copy, Heart, Star } from 'lucide-react'
import type { Emoji } from '../types'
import { getCategory } from '../data/emojis'
import { formatCount } from '../lib/search'
import { useStore } from '../store/AppStore'
import { useEmojiActions } from '../store/useEmojiActions'
import { EmojiImage } from './EmojiImage'

const TILTS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0']

export function EmojiCard({ emoji, index }: { emoji: Emoji; index: number }) {
  const { setOpenEmoji, isFavourite, toggleFavourite } = useStore()
  const { send } = useEmojiActions()
  const fav = isFavourite(emoji.id)
  const cat = getCategory(emoji.category)

  return (
    <div
      className={`group relative bg-white rounded-3xl sticker press ${TILTS[index % TILTS.length]} hover:rotate-0 animate-pop`}
      style={{ animationDelay: `${Math.min(index, 20) * 25}ms`, animationFillMode: 'backwards' }}
    >
      <button
        onClick={() => setOpenEmoji(emoji)}
        className="block w-full p-3 pb-2 text-left rounded-3xl"
        aria-label={`Open ${emoji.name}`}
      >
        <div className={`relative aspect-square rounded-2xl ${emoji.asset || emoji.custom ? 'checker' : 'bg-white'} border-2 border-ink/10 grid place-items-center overflow-hidden`}>
          {!(emoji.asset || emoji.custom) && <div className={`absolute inset-0 ${cat.color} opacity-40`} aria-hidden />}
          <EmojiImage emoji={emoji} className="relative size-[78%] group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-200" />
          {emoji.featured && (
            <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-sun border-2 border-ink px-2 py-0.5 text-[10px] font-extrabold uppercase">
              <Star className="size-3 fill-ink" aria-hidden /> Featured
            </span>
          )}
        </div>
        <div className="mt-2 px-0.5">
          <div className="font-extrabold leading-tight truncate">{emoji.name}</div>
          <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-ink/60">
            <span className="truncate">:{emoji.slug}:</span>
            <span className="shrink-0">{formatCount(emoji.uses)} uses</span>
          </div>
        </div>
      </button>

      <div className="absolute top-5 right-5 flex flex-col gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
        <button
          onClick={() => toggleFavourite(emoji)}
          className={`grid place-items-center size-9 rounded-full sticker-sm ${fav ? 'bg-bubblegum' : 'bg-white'}`}
          aria-label={fav ? `Remove ${emoji.name} from favourites` : `Add ${emoji.name} to favourites`}
          aria-pressed={fav}
        >
          <Heart className={`size-4 ${fav ? 'fill-ink' : ''}`} />
        </button>
        <button
          onClick={() => send(emoji)}
          className="grid place-items-center size-9 rounded-full sticker-sm bg-white"
          aria-label={`Copy ${emoji.name} image`}
        >
          <Copy className="size-4" />
        </button>
      </div>
      {fav && <Heart className="absolute -top-2 -left-2 size-6 fill-bubblegum text-ink sm:group-hover:opacity-0" aria-hidden />}
    </div>
  )
}
