const ITEMS = ['tap to copy ♡', '૮ ˶ᵔ ᵕ ᵔ˶ ა', 'paste anywhere', '🎀', 'whatsapp', '₍ᐢ. .ᐢ₎', 'imessage', '✿', 'discord', 'ʕ•ᴥ•ʔ', 'instagram', '⋆˙⟡♡', 'telegram', '🍓', 'sticker packs']

export function Marquee() {
  const row = [...ITEMS, ...ITEMS]
  return (
    <div className="overflow-hidden bg-gradient-to-r from-[#ffb5d6] via-[#d9c4ff] to-[#b5dcff] text-white py-2" aria-hidden>
      <div className="flex w-max animate-marquee gap-7 font-display font-semibold text-[15px] whitespace-nowrap [text-shadow:0_1px_6px_rgb(170_80_150/0.35)]">
        {row.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  )
}
