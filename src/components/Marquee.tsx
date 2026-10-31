const ITEMS = ['TAP = COPIED', '😂', 'PASTE IN ANY CHAT', '💀', 'WHATSAPP', '🗿', 'DISCORD', '🥺', 'IMESSAGE', '👁️👄👁️', 'INSTAGRAM', '🫠', 'SLACK', '🤨📸', 'TELEGRAM', '🔥']

export function Marquee() {
  const row = [...ITEMS, ...ITEMS]
  return (
    <div className="overflow-hidden bg-acid text-black py-1.5 -rotate-1 -mx-2 my-1" aria-hidden>
      <div className="flex w-max animate-marquee gap-6 font-display text-xl tracking-wide whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  )
}
