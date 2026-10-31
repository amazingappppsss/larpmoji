import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import type { Emoji } from '../types'

interface Props {
  emoji: Emoji
  className?: string
  /** eager for above-the-fold previews, lazy for big grids */
  loading?: 'lazy' | 'eager'
  compact?: boolean
}

/**
 * Renders an emoji image with its original aspect ratio (object-contain, never stretched).
 * If a file-based asset is missing, shows an explicit placeholder instead of substituting art.
 */
export function EmojiImage({ emoji, className = '', loading = 'lazy', compact }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (failedSrc === emoji.src) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink/40 text-ink/60 text-center ${className}`}
        title={`Missing file: ${emoji.src}`}
      >
        <ImageOff className={compact ? 'size-4' : 'size-6'} aria-hidden />
        {!compact && <span className="font-mono text-[10px] leading-tight px-1 break-all">missing {emoji.src.split('/').pop()}</span>}
      </div>
    )
  }
  return (
    <img
      src={emoji.src}
      alt={emoji.name}
      loading={loading}
      decoding="async"
      draggable={false}
      onError={() => setFailedSrc(emoji.src)}
      className={`object-contain select-none ${className}`}
    />
  )
}
