import type { ReactNode } from 'react'
import type { Emoji } from '../types'
import { EmojiCard } from './EmojiCard'

export function EmojiGrid({ emojis, empty }: { emojis: Emoji[]; empty: ReactNode }) {
  if (emojis.length === 0) return <>{empty}</>
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {emojis.map((e, i) => (
        <EmojiCard key={e.id} emoji={e} index={i} />
      ))}
    </div>
  )
}

export function EmptyState({ glyph, title, children }: { glyph: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-md text-center py-16">
      <div className="text-6xl mb-4 animate-wiggle inline-block" aria-hidden>{glyph}</div>
      <h3 className="font-display text-3xl mb-2">{title}</h3>
      <div className="text-ink/70 font-semibold">{children}</div>
    </div>
  )
}
