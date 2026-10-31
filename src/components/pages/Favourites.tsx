import { useMemo, useState } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { useEmojiActions } from '../../store/useEmojiActions'
import { filterEmojis } from '../../lib/search'
import { EmojiGrid, EmptyState } from '../EmojiGrid'
import { SearchBar } from '../SearchBar'

export function Favourites() {
  const { allEmojis, favourites, navigate, customEmojis } = useStore()
  const { download } = useEmojiActions()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'faves' | 'lab'>('faves')

  const favEmojis = useMemo(() => {
    const byId = new Map(allEmojis.map((e) => [e.id, e]))
    return favourites.map((id) => byId.get(id)).filter((e): e is NonNullable<typeof e> => !!e)
  }, [allEmojis, favourites])

  const source = tab === 'faves' ? favEmojis : customEmojis
  const shown = query.trim() ? filterEmojis(source, { query, category: 'all', sort: 'trending' }) : source

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="font-display text-5xl sm:text-6xl leading-none">
        your <span className="text-bubblegum [-webkit-text-stroke:2px_#111]">stash</span>
      </h1>
      <p className="mt-2 font-semibold text-ink/60">Saved in this browser. Your faves never leave your device.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-full bg-white sticker-sm p-1" role="tablist">
          {(
            [
              ['faves', `♥ Favourites (${favEmojis.length})`],
              ['lab', `⚗ My creations (${customEmojis.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-1.5 text-sm font-extrabold ${tab === id ? 'bg-ink text-white' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px] max-w-sm">
          <SearchBar value={query} onChange={setQuery} size="sm" placeholder="Search your stash…" />
        </div>
        {tab === 'faves' && favEmojis.length > 0 && (
          <button
            onClick={async () => {
              for (const e of favEmojis.slice(0, 20)) await download(e, 'png')
            }}
            className="flex items-center gap-1.5 rounded-full bg-sun px-3 py-2 text-sm font-extrabold sticker-sm press"
          >
            <Download className="size-4" /> Download all
          </button>
        )}
      </div>

      <div className="mt-8">
        <EmojiGrid
          emojis={shown}
          empty={
            query.trim() ? (
              <EmptyState glyph="🔍" title="no matches">Nothing in your stash matches “{query}”.</EmptyState>
            ) : tab === 'faves' ? (
              <EmptyState glyph="💔" title="no faves yet">
                Tap the heart on any emoji to keep it here.{' '}
                <button onClick={() => navigate('explore')} className="underline decoration-2 decoration-bubblegum">
                  Go explore
                </button>
              </EmptyState>
            ) : (
              <EmptyState glyph="⚗" title="the lab is empty">
                Upload an image and turn it into an emoji.{' '}
                <button onClick={() => navigate('create')} className="underline decoration-2 decoration-lime">
                  Open the creator
                </button>
              </EmptyState>
            )
          }
        />
      </div>
      {tab === 'lab' && customEmojis.length > 0 && (
        <p className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-ink/50">
          <Trash2 className="size-4" /> Open a creation to delete it.
        </p>
      )}
    </div>
  )
}
