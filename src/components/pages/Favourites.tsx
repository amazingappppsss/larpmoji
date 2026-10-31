import { useMemo, useState } from 'react'
import type { Emoji } from '../../types'
import { useStore } from '../../store/AppStore'
import { filterEmojis } from '../../lib/search'
import { EmojiGrid, EmptyState } from '../EmojiGrid'
import { SearchBar } from '../SearchBar'

export function Favourites() {
  const { resolveEmoji, favourites, navigate, customEmojis, updatePack, pack } = useStore()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'faves' | 'lab'>('faves')

  const favEmojis = useMemo(() => favourites.map(resolveEmoji).filter((e): e is Emoji => !!e), [favourites, resolveEmoji])
  const source = tab === 'faves' ? favEmojis : customEmojis
  const shown = query.trim() ? filterEmojis(source, { query, category: 'all', sort: 'trending' }) : source

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-5 pt-8">
      <h1 className="meme text-6xl sm:text-7xl leading-none">
        your <span className="text-hot">stash</span>
      </h1>
      <p className="mt-2 text-sm text-muted">Saved on this device only. Tap any emoji to copy it.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-full bg-surface border border-line p-1" role="tablist">
          {(
            [
              ['faves', `❤️ Saved (${favEmojis.length})`],
              ['lab', `🧪 My cooks (${customEmojis.length})`],
            ] as const
          ).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`btn h-9 px-4 text-sm ${tab === id ? 'bg-fg text-black' : 'text-fg/80'}`}>
              {label}
            </button>
          ))}
        </div>
        {source.length > 0 && (
          <button
            onClick={() => {
              updatePack({ ids: [...new Set([...pack.ids, ...source.map((e) => e.id)])].slice(0, 120) })
              navigate('stickers')
            }}
            className="btn h-10 px-4 bg-cyan text-black text-sm"
          >
            📦 Make a sticker pack
          </button>
        )}
        <div className="flex-1 min-w-[200px] max-w-sm">
          <SearchBar value={query} onChange={setQuery} size="sm" placeholder="search your stash…" />
        </div>
      </div>

      <div className="mt-6">
        <EmojiGrid
          emojis={shown}
          empty={
            query.trim() ? (
              <EmptyState glyph="🔍" title="no matches">Nothing in your stash matches “{query}”.</EmptyState>
            ) : tab === 'faves' ? (
              <EmptyState glyph="💔" title="stash is empty">
                Hit the ❤️ on any emoji to keep it here.{' '}
                <button onClick={() => navigate('explore')} className="text-acid underline">
                  Go to the feed →
                </button>
              </EmptyState>
            ) : (
              <EmptyState glyph="🧪" title="nothing cooked yet">
                Make your first cursed emoji in 10 seconds.{' '}
                <button onClick={() => navigate('create')} className="text-acid underline">
                  Start cooking →
                </button>
              </EmptyState>
            )
          }
        />
      </div>
    </div>
  )
}
