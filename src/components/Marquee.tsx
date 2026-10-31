const ITEMS = ['no cap', '★', 'chronically online', '☠', 'certified lore', '✦', 'emoji crimes', '‼', 'touch grass (optional)', '⚡', 'ratio + L', '♥']

export function Marquee() {
  const row = [...ITEMS, ...ITEMS]
  return (
    <div className="overflow-hidden border-y-3 border-ink bg-ink text-sun py-2" aria-hidden>
      <div className="flex w-max animate-marquee gap-8 font-display text-lg uppercase tracking-wide whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className={i % 2 ? 'text-bubblegum' : ''}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
