import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import type { Emoji } from '../types'
import { getCachedCursed, requestCursed } from '../lib/cursed'

/** Resolve the displayable URL for an emoji (renders cursed recipes on demand, cached). */
export function useEmojiSrc(emoji: Emoji, size = 256): string {
  const needsRender = !!emoji.recipe && !emoji.src
  const cached = needsRender ? getCachedCursed(emoji.recipe!, size) : undefined
  const [rendered, setRendered] = useState<{ key: string; url: string } | null>(null)
  const key = emoji.id + size

  useEffect(() => {
    if (!needsRender || cached !== undefined) return
    let alive = true
    requestCursed(emoji.recipe!, size).then((url) => alive && setRendered({ key, url }))
    return () => {
      alive = false
    }
  }, [needsRender, cached, emoji.recipe, size, key])

  if (!needsRender) return emoji.src
  return cached ?? (rendered?.key === key ? rendered.url : '')
}

interface Props {
  emoji: Emoji
  className?: string
  loading?: 'lazy' | 'eager'
  compact?: boolean
  size?: number
}

/**
 * Renders an emoji at its original aspect ratio (object-contain, never stretched).
 * Missing file-based assets show an explicit placeholder instead of substitute art.
 */
export function EmojiImage(props: Props) {
  if (props.emoji.text) return <TextGlyph text={props.emoji.text} className={props.className} />
  return <RasterEmoji {...props} />
}

/** Estimate rendered width (in em) so text emojis fill their tile without overflowing. */
const seg = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter() : null
function fitSize(text: string): number {
  const parts = seg ? [...seg.segment(text)].map((x) => x.segment) : [...text]
  let em = 0
  for (const g of parts) {
    if (/\p{Extended_Pictographic}/u.test(g)) em += 1.22
    else if (/\s/.test(g)) em += 0.28
    else if (/[\u3000-\uffef]/.test(g)) em += 0.8
    else em += 0.55
  }
  return Math.max(9, Math.min(58, 90 / Math.max(em, 0.1)))
}

/** Text emojis render as real text, auto-sized to fit their box. */
function TextGlyph({ text, className = '' }: { text: string; className?: string }) {
  const size = fitSize(text)
  return (
    <div className={`grid place-items-center [container-type:size] overflow-hidden ${className}`}>
      <span className="font-emoji whitespace-nowrap leading-none text-fg select-none" style={{ fontSize: `${size}cqw` }}>
        {text}
      </span>
    </div>
  )
}

function RasterEmoji({ emoji, className = '', loading = 'lazy', compact, size = 256 }: Props) {
  const src = useEmojiSrc(emoji, size)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src) return <div className={`animate-pulse rounded-full bg-fg/5 ${className}`} aria-label={emoji.name} />
  if (failedSrc === src) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-fg/30 text-muted text-center ${className}`} title={`Missing file: ${src}`}>
        <ImageOff className={compact ? 'size-4' : 'size-6'} aria-hidden />
        {!compact && <span className="font-mono text-[10px] leading-tight px-1 break-all">upload {src.split('/').pop()}</span>}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={emoji.name}
      loading={loading}
      decoding="async"
      draggable={false}
      onError={() => setFailedSrc(src)}
      className={`object-contain select-none ${className}`}
    />
  )
}
