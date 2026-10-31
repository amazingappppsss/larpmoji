import { useState } from 'react'
import { Heart, MoreHorizontal, Package } from 'lucide-react'
import type { Emoji } from '../types'
import { getCategory } from '../data/emojis'
import { useStore } from '../store/AppStore'
import { useEmojiActions } from '../store/useEmojiActions'
import { EmojiImage } from './EmojiImage'

/** One emoji card. Tap = copy (image, or text for text emojis). ⋯ = details. */
export function EmojiTile({ emoji, index = 0 }: { emoji: Emoji; index?: number }) {
  const { setOpenEmoji, isFavourite, toggleFavourite, togglePack, inPack } = useStore()
  const { send } = useEmojiActions()
  const [tap, setTap] = useState(0)
  const fav = isFavourite(emoji.id)
  const tint = getCategory(emoji.category).color

  const onCopy = () => {
    setTap((n) => n + 1)
    void send(emoji)
  }

  return (
    <div
      className="group relative rounded-[1.75rem] bg-white shadow-softer hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 animate-pop"
      style={{ animationDelay: `${Math.min(index, 24) * 18}ms`, animationFillMode: 'backwards', backgroundImage: `linear-gradient(165deg, ${tint}40, #ffffff 62%)` }}
    >
      <button onClick={onCopy} className="block w-full p-3 pb-2.5 rounded-[1.75rem] text-left" aria-label={`Copy ${emoji.name}`} title="Tap to copy">
        <div className={`relative aspect-square grid place-items-center ${emoji.asset || emoji.custom ? 'checker rounded-2xl' : ''}`}>
          <div key={tap} className={`size-[86%] grid place-items-center ${tap ? 'animate-squish' : ''}`}>
            <EmojiImage emoji={emoji} className={`${emoji.text ? 'size-full' : 'size-full'} transition-transform duration-300 group-hover:scale-[1.07]`} />
          </div>
          {tap > 0 && (
            <span key={`s${tap}`} className="pointer-events-none absolute left-1/2 top-1/2 rounded-full bg-hot text-white text-xs font-black px-3 py-1 shadow-pop animate-stamp whitespace-nowrap">
              copied ♡
            </span>
          )}
          {emoji.featured && <span className="absolute top-0 left-0 rounded-full bg-volt text-ink text-[10px] font-black px-2 py-0.5">★ featured</span>}
          {emoji.text && <span className="absolute bottom-0 right-0 rounded-full bg-white/90 text-[9px] font-black text-muted px-1.5 py-0.5 border border-line">TEXT</span>}
        </div>
        <div className="mt-1.5 text-[12.5px] font-bold leading-tight truncate text-fg/75 group-hover:text-fg">{emoji.name}</div>
      </button>

      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex flex-col gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
        <button
          onClick={() => toggleFavourite(emoji)}
          className={`btn hidden sm:inline-flex size-8 ${fav ? 'bg-hot text-white shadow-pop' : 'bg-white/95 text-hot shadow-softer'}`}
          aria-label={fav ? `Remove ${emoji.name} from stash` : `Save ${emoji.name} to stash`}
          aria-pressed={fav}
        >
          <Heart className={`size-3.5 ${fav ? 'fill-white' : ''}`} />
        </button>
        {!emoji.text && (
          <button
            onClick={() => togglePack(emoji)}
            className={`btn hidden sm:inline-flex size-8 ${inPack(emoji.id) ? 'bg-grape text-white' : 'bg-white/95 text-grape shadow-softer'}`}
            aria-label={inPack(emoji.id) ? `Remove ${emoji.name} from sticker pack` : `Add ${emoji.name} to sticker pack`}
            aria-pressed={inPack(emoji.id)}
            title="Sticker pack"
          >
            <Package className="size-3.5" />
          </button>
        )}
        <button onClick={() => setOpenEmoji(emoji)} className="btn size-7 sm:size-8 text-muted sm:bg-white/95 sm:shadow-softer" aria-label={`Details for ${emoji.name}`}>
          <MoreHorizontal className="size-4" />
        </button>
      </div>
      {fav && <Heart className="absolute top-3 left-3 size-4 fill-hot text-hot pointer-events-none" aria-hidden />}
    </div>
  )
}
