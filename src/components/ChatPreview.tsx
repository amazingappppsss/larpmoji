import { useStore } from '../store/AppStore'
import { EmojiImage } from './EmojiImage'

const REPLIES = ['💀💀💀', 'bro WHAT', 'LMAOOO', 'why is this so real', 'not the eyes 😭', 'stealing this', 'ok this one is crazy', 'i hate this (saved it)', 'HELP', '🗿']

/** A fake group chat showing what you've "sent" — makes the point of the app obvious. */
export function ChatPreview() {
  const { recent, resolveEmoji } = useStore()
  const sent = recent
    .slice(0, 4)
    .map(resolveEmoji)
    .filter((e) => !!e)
    .reverse()

  return (
    <div className="rounded-3xl bg-surface border border-line overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
        <div className="flex -space-x-2">
          {['🐸', '🗿', '🥺'].map((g) => (
            <span key={g} className="grid place-items-center size-7 rounded-full bg-raised border-2 border-surface text-sm">{g}</span>
          ))}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-extrabold truncate">the group chat 💬</div>
          <div className="text-[11px] text-muted">preview · paste for real anywhere</div>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2 min-h-56 max-h-[52vh] overflow-y-auto no-scrollbar">
        <Bubble from="them">u seen the new emojis??</Bubble>
        {sent.length === 0 ? (
          <Bubble from="them">tap one and send it here 👀</Bubble>
        ) : (
          sent.map((e, i) => (
            <div key={e.id + i} className="flex flex-col gap-2 animate-rise">
              <div className="self-end">
                <EmojiImage emoji={e} className="size-20" />
              </div>
              <Bubble from="them">{REPLIES[(e.name.length + i) % REPLIES.length]}</Bubble>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Bubble({ from, children }: { from: 'me' | 'them'; children: React.ReactNode }) {
  return (
    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${from === 'me' ? 'self-end bg-acid text-black rounded-br-sm' : 'self-start bg-raised rounded-bl-sm'}`}>
      {children}
    </div>
  )
}
