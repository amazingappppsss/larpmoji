import type { CategoryId } from '../types'
import { CATEGORIES } from '../data/emojis'

interface Props {
  value: CategoryId | 'all'
  onChange: (c: CategoryId | 'all') => void
  counts: Record<string, number>
}

export function CategoryBar({ value, onChange, counts }: Props) {
  const items = [{ id: 'all' as const, label: 'Everything', color: 'bg-white', glyph: '∞' }, ...CATEGORIES]
  return (
    <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
      <div className="flex gap-2.5 py-2 w-max" role="tablist" aria-label="Categories">
        {items.map((c, i) => {
          const active = value === c.id
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(c.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 font-extrabold text-sm whitespace-nowrap sticker-sm press ${
                active ? `${c.color} ${i % 2 ? 'rotate-2' : '-rotate-2'} scale-105` : 'bg-white/80'
              }`}
            >
              <span aria-hidden className="text-base leading-none">{c.glyph}</span>
              {c.label}
              <span className="font-mono text-[11px] opacity-60">{counts[c.id] ?? 0}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
