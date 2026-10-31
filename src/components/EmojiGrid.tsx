import type { ReactNode } from 'react'
import type { Emoji } from '../types'
import { EmojiTile } from './EmojiTile'

export function EmojiGrid({ emojis, empty }: { emojis: Emoji[]; empty?: ReactNode }) {
  if (emojis.length === 0) return <>{empty}</>
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
      {emojis.map((e, i) => (
        <EmojiTile key={e.id} emoji={e} index={i} />
      ))}
    </div>
  )
}

export function EmptyState({ glyph, title, children }: { glyph: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-md text-center py-16">
      <div className="text-6xl mb-4 inline-block animate-float" aria-hidden>{glyph}</div>
      <h3 className="meme text-4xl mb-2">{title}</h3>
      <div className="text-muted">{children}</div>
    </div>
  )
}
