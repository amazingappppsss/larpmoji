import { useStore } from '../store/AppStore'
import { EmojiImage } from './EmojiImage'

const REPLIES = ['omg cuteee 😭', 'STOP that’s adorable', 'where did u get this??', 'i need this pack', 'ʕ•ᴥ•ʔ♡', 'saving this rn', 'my heart 🥹', 'okay this is elite', 'HELP so cute', '🫶🏻🫶🏻']

/** A mini group chat showing what you've "sent", so the point of the app is obvious. */
export function ChatPreview() {
  const { recent, resolveEmoji } = useStore()
  const sent = recent
    .slice(0, 4)
    .map(resolveEmoji)
    .filter((e) => !!e)
    .reverse()

  return (
    <div className="rounded-[1.75rem] bg-white shadow-soft overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-gradient-to-r from-[#fff0f7] to-[#f3eeff]">
        <div className="flex -space-x-2">
          {['🐰', '🐻', '🐸'].map((g) => (
            <span key={g} className="grid place-items-center size-7 rounded-full bg-white border-2 border-white shadow-softer text-sm">{g}</span>
          ))}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black truncate">besties 💬</div>
          <div className="text-[11px] text-muted font-semibold">preview · paste for real anywhere</div>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2 min-h-56 max-h-[46vh] overflow-y-auto no-scrollbar">
        <Bubble from="them">did u see the new emojis 👀</Bubble>
        {sent.length === 0 ? (
          <Bubble from="them">tap one and send it here!!</Bubble>
        ) : (
          sent.map((e, i) => (
            <div key={e.id + i} className="flex flex-col gap-2 animate-rise">
              {e.text ? (
                <Bubble from="me">{e.text}</Bubble>
              ) : (
                <div className="self-end">
                  <EmojiImage emoji={e} className="size-20 drop-shadow-[0_6px_10px_rgb(160_90_170/0.25)]" />
                </div>
              )}
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
    <div
      className={`max-w-[82%] rounded-[1.1rem] px-3 py-2 text-sm font-semibold font-emoji ${
        from === 'me' ? 'self-end bg-gradient-to-br from-[#ff8cc3] to-[#c69bff] text-white rounded-br-md' : 'self-start bg-raised rounded-bl-md'
      }`}
    >
      {children}
    </div>
  )
}
