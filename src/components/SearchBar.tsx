import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hotkey?: boolean
  size?: 'lg' | 'sm'
  autoFocus?: boolean
}

export function SearchBar({ value, onChange, placeholder = 'search: crying, skull, sus, rizz…', hotkey, size = 'lg', autoFocus }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!hotkey) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(t.tagName)) {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hotkey])

  const lg = size === 'lg'
  return (
    <label className={`flex items-center gap-2 rounded-full bg-surface border border-line focus-within:border-acid transition-colors ${lg ? 'px-5 h-14' : 'px-3.5 h-10'}`}>
      <Search className={`${lg ? 'size-5' : 'size-4'} shrink-0 text-muted`} aria-hidden />
      <span className="sr-only">Search emojis</span>
      <input
        ref={ref}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && value && (e.stopPropagation(), onChange(''))}
        placeholder={placeholder}
        className={`flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted/70 ${lg ? 'text-base' : 'text-sm'} [&::-webkit-search-cancel-button]:hidden`}
      />
      {value ? (
        <button type="button" onClick={() => onChange('')} className="rounded-full p-1 hover:bg-raised" aria-label="Clear search">
          <X className="size-4" />
        </button>
      ) : (
        hotkey && <kbd className="hidden sm:block text-xs border border-line rounded px-1.5 text-muted">/</kbd>
      )}
    </label>
  )
}
