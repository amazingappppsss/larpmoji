import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  /** listen for "/" to focus */
  hotkey?: boolean
  size?: 'lg' | 'sm'
  autoFocus?: boolean
}

export function SearchBar({ value, onChange, placeholder = 'Search the emoji archives…', hotkey, size = 'lg', autoFocus }: Props) {
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
    <label className={`flex items-center gap-2 bg-white rounded-2xl ${lg ? 'sticker px-4 h-14' : 'sticker-sm px-3 h-10'}`}>
      <Search className={lg ? 'size-6 shrink-0' : 'size-4 shrink-0'} aria-hidden />
      <span className="sr-only">Search emojis</span>
      <input
        ref={ref}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && value && (e.stopPropagation(), onChange(''))}
        placeholder={placeholder}
        className={`flex-1 min-w-0 bg-transparent outline-none placeholder:text-ink/40 font-semibold ${lg ? 'text-lg' : 'text-sm'} [&::-webkit-search-cancel-button]:hidden`}
      />
      {value ? (
        <button type="button" onClick={() => onChange('')} className="rounded-full p-1 hover:bg-ink/10" aria-label="Clear search">
          <X className="size-4" />
        </button>
      ) : (
        hotkey && <kbd className="hidden sm:block font-mono text-xs border-2 border-ink/30 rounded-md px-1.5 text-ink/50">/</kbd>
      )}
    </label>
  )
}
