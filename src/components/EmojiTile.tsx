import { useState } from 'react'
import { Heart, MoreHorizontal, Package } from 'lucide-react'
import type { Emoji } from '../types'
import { useStore } from '../store/AppStore'
import { useEmojiActions } from '../store/useEmojiActions'
import { EmojiImage } from './EmojiImage'

/** One emoji in a grid. Tap = copy image. ⋯ = details. */
export function EmojiTile({ emoji, index = 0 }: { emoji: Emoji; index?: number }) {
  const { setOpenEmoji, isFavourite, toggleFavourite, togglePack, inPack } = useStore()
  const { send } = useEmojiActions()
  const [stamp, setStamp] = useState(0)
  const fav = isFavourite(emoji.id)

  const onCopy = () => {
    setStamp((n) => n + 1)
    void send(emoji)
  }

  return (
    <div
      className="group relative rounded-3xl bg-surface border border-line hover:border-fg/30 transition-colors animate-pop"
      style={{ animationDelay: `${Math.min(index, 24) * 18}ms`, animationFillMode: 'backwards' }}
    >
      <button onClick={onCopy} className="block w-full p-3 pb-2 rounded-3xl text-left" aria-label={`Copy ${emoji.name}`} title="Tap to copy">
        <div className={`relative aspect-square grid place-items-center ${emoji.asset || emoji.custom ? 'checker rounded-2xl' : ''}`}>
          <EmojiImage emoji={emoji} className="size-[86%] transition-transform duration-200 group-hover:scale-110 group-active:scale-90" />
          {stamp > 0 && (
            <span key={stamp} className="pointer-events-none absolute left-1/2 top-1/2 meme text-3xl sm:text-4xl animate-stamp whitespace-nowrap">
              COPIED
            </span>
          )}
          {emoji.featured && <span className="absolute top-0 left-0 rounded-full bg-volt text-black text-[10px] font-extrabold px-2 py-0.5">★ FEATURED</span>}
        </div>
        <div className="mt-1.5 text-[12px] leading-tight truncate text-fg/80 group-hover:text-fg">{emoji.name}</div>
      </button>

      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex flex-col gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
        <button
          onClick={() => toggleFavourite(emoji)}
          className={`btn hidden sm:inline-flex size-8 border ${fav ? 'bg-hot border-hot text-white' : 'bg-bg/80 border-line'}`}
          aria-label={fav ? `Remove ${emoji.name} from stash` : `Save ${emoji.name} to stash`}
          aria-pressed={fav}
        >
          <Heart className={`size-3.5 ${fav ? 'fill-white' : ''}`} />
        </button>
        <button
          onClick={() => togglePack(emoji)}
          className={`btn hidden sm:inline-flex size-8 border ${inPack(emoji.id) ? 'bg-cyan border-cyan text-black' : 'bg-bg/80 border-line'}`}
          aria-label={inPack(emoji.id) ? `Remove ${emoji.name} from sticker pack` : `Add ${emoji.name} to sticker pack`}
          aria-pressed={inPack(emoji.id)}
          title="Sticker pack"
        >
          <Package className="size-3.5" />
        </button>
        <button onClick={() => setOpenEmoji(emoji)} className="btn size-7 sm:size-8 text-muted sm:text-fg sm:bg-bg/80 sm:border sm:border-line" aria-label={`Details for ${emoji.name}`}>
          <MoreHorizontal className="size-4" />
        </button>
      </div>
      {fav && <Heart className="absolute top-2.5 left-2.5 size-4 fill-hot text-hot pointer-events-none" aria-hidden />}
    </div>
  )
}
