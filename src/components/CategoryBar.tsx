import type { CategoryId } from '../types'
import { CATEGORIES } from '../data/emojis'

interface Props {
  value: CategoryId | 'all'
  onChange: (c: CategoryId | 'all') => void
  counts: Record<string, number>
}

export function CategoryBar({ value, onChange, counts }: Props) {
  const items = [{ id: 'all' as const, label: 'All', color: '#f4f4f0', glyph: '🌀' }, ...CATEGORIES]
  return (
    <div className="-mx-3 sm:-mx-5 px-3 sm:px-5 overflow-x-auto no-scrollbar">
      <div className="flex gap-2 py-2 w-max" role="tablist" aria-label="Categories">
        {items.map((c) => {
          const active = value === c.id
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(c.id)}
              style={active ? { background: c.color, borderColor: c.color } : undefined}
              className={`btn h-10 px-4 text-sm border whitespace-nowrap ${active ? 'text-ink' : 'border-line bg-surface text-fg/85 hover:border-fg/40'}`}
            >
              <span aria-hidden className="text-lg leading-none">{c.glyph}</span>
              {c.label}
              <span className={`text-[11px] ${active ? 'text-ink/60' : 'text-muted'}`}>{counts[c.id] ?? 0}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
