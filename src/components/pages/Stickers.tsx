import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, Download, ExternalLink, Loader2, Plus, Share2, Shuffle, X } from 'lucide-react'
import type { Emoji } from '../../types'
import { useStore } from '../../store/AppStore'
import { filterEmojis } from '../../lib/search'
import { copyText } from '../../lib/emojiActions'
import {
  WA_MAX,
  WA_MIN,
  buildDiscordZip,
  buildTelegramZip,
  buildWhatsAppPack,
  canEncodeWebp,
  discordName,
  downloadBlob,
  fileSlug,
  renderSticker,
  shareAllAsImages,
  shareSticker,
  stickerEmoji,
} from '../../lib/stickers'
import { EmojiImage } from '../EmojiImage'
import { SearchBar } from '../SearchBar'

/* ---------- sticker preview (rendered with the white border, cached) */
const previewCache = new Map<string, string>()
function StickerPreview({ emoji, outline, className = '' }: { emoji: Emoji; outline: boolean; className?: string }) {
  const key = `${emoji.id}|${outline}`
  const [url, setUrl] = useState(() => previewCache.get(key) ?? '')
  useEffect(() => {
    const hit = previewCache.get(key)
    if (hit) return setUrl(hit)
    let alive = true
    renderSticker(emoji, 256, { outline })
      .then((c) => {
        const u = c.toDataURL('image/png')
        previewCache.set(key, u)
        if (alive) setUrl(u)
      })
      .catch(() => alive && setUrl(''))
    return () => {
      alive = false
    }
  }, [key, emoji, outline])
  return url ? <img src={url} alt={emoji.name} className={`object-contain ${className}`} draggable={false} /> : <div className={`animate-pulse rounded-full bg-fg/10 ${className}`} />
}

type Busy = { what: string; done: number; total: number } | null

export function Stickers() {
  const { pack, updatePack, togglePack, resolveEmoji, favourites, customEmojis, allEmojis, toast, navigate } = useStore()
  const [busy, setBusy] = useState<Busy>(null)
  const [picker, setPicker] = useState(false)
  const [webp, setWebp] = useState<boolean | null>(null)
  useEffect(() => void canEncodeWebp().then(setWebp), [])

  const stickers = useMemo(() => pack.ids.map(resolveEmoji).filter((e): e is Emoji => !!e), [pack.ids, resolveEmoji])
  const stash = useMemo(() => [...customEmojis, ...favourites.map(resolveEmoji).filter((e): e is Emoji => !!e)].filter((e, i, a) => a.findIndex((x) => x.id === e.id) === i), [customEmojis, favourites, resolveEmoji])
  const waOk = stickers.length >= WA_MIN && stickers.length <= WA_MAX

  const run = async (what: string, fn: (p: (d: number, t: number) => void) => Promise<void>) => {
    if (busy) return
    setBusy({ what, done: 0, total: stickers.length })
    try {
      await fn((done, total) => setBusy({ what, done, total }))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Export failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  const meta = { name: pack.name, author: pack.author, outline: pack.outline }
  const slug = fileSlug(pack.name)

  const addMany = (list: Emoji[]) => {
    const ids = [...pack.ids, ...list.map((e) => e.id).filter((id) => !pack.ids.includes(id))].slice(0, 120)
    updatePack({ ids })
    toast(`Pack now has ${ids.length} stickers`, 'success')
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-5 pt-6 sm:pt-8">
      <h1 className="meme text-6xl sm:text-7xl leading-none">
        sticker <span className="text-cyan">packs</span> 📦
      </h1>
      <p className="mt-2 text-sm text-muted max-w-xl">Turn your favourite cuties into real stickers for WhatsApp, Telegram and Discord. Build the pack, then pick where it goes ♡</p>

      {/* ---------------- PACK BUILDER */}
      <section className="mt-6 rounded-[2rem] bg-white/90 shadow-soft p-4 sm:p-6">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 flex-1 min-w-[180px]">
            <span className="text-xs font-black text-muted">Pack name</span>
            <input value={pack.name} onChange={(e) => updatePack({ name: e.target.value.slice(0, 64) })} className="h-11 rounded-full bg-raised border border-line focus:border-acid outline-none px-4" />
          </label>
          <label className="grid gap-1 flex-1 min-w-[140px]">
            <span className="text-xs font-black text-muted">Made by</span>
            <input value={pack.author} placeholder="your name" onChange={(e) => updatePack({ author: e.target.value.slice(0, 64) })} className="h-11 rounded-full bg-raised border border-line focus:border-acid outline-none px-4" />
          </label>
          <button onClick={() => updatePack({ outline: !pack.outline })} aria-pressed={pack.outline} className={`btn h-11 px-4 text-sm border ${pack.outline ? 'bg-fg text-white border-fg' : 'bg-raised border-line'}`}>
            {pack.outline ? <Check className="size-4" /> : <span className="size-4" />} White sticker border
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="meme text-2xl">{stickers.length} sticker{stickers.length === 1 ? '' : 's'}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs ${waOk ? 'bg-[#25D366]/20 text-[#25D366]' : 'bg-raised text-muted'}`}>
            WhatsApp {waOk ? '✓ ready' : stickers.length < WA_MIN ? `needs ${WA_MIN - stickers.length} more` : `max ${WA_MAX} — first ${WA_MAX} used`}
          </span>
          <span className="rounded-full px-2.5 py-0.5 text-xs bg-[#2AABEE]/20 text-[#2AABEE]">Telegram {stickers.length ? '✓' : '—'}</span>
          <span className="rounded-full px-2.5 py-0.5 text-xs bg-[#5865F2]/25 text-[#9aa3ff]">Discord {stickers.length ? '✓' : '—'}</span>
          {stickers.length > 0 && (
            <button onClick={() => updatePack({ ids: [] })} className="ml-auto text-xs text-muted hover:text-hot">
              clear pack
            </button>
          )}
        </div>

        {/* sticker wall — chat-wallpaper vibe */}
        <div className="mt-3 rounded-3xl p-3 bg-[#fdf0f7] bg-[radial-gradient(#e9cfe8_1px,transparent_1px)] [background-size:14px_14px]">
          {stickers.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-5xl mb-2" aria-hidden>📦</div>
              <p className="text-sm text-muted mb-4">Your pack is empty. Add some cursed stuff:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {stash.length > 0 && (
                  <button onClick={() => addMany(stash.slice(0, WA_MAX))} className="btn h-11 px-4 bg-acid text-ink text-sm">
                    <Plus className="size-4" /> Add my stash ({stash.length})
                  </button>
                )}
                <button onClick={() => addMany([...allEmojis].filter((e) => e.id.startsWith('cute-')).sort((a, b) => b.uses - a.uses).slice(0, 12))} className="btn h-11 px-4 bg-cyan text-ink text-sm">
                  <Shuffle className="size-4" /> Cute starter pack (12)
                </button>
                <button onClick={() => setPicker(true)} className="btn h-11 px-4 bg-raised border border-line text-sm">
                  <Plus className="size-4" /> Pick stickers
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
              {stickers.map((e, i) => (
                <div key={e.id} className="group relative">
                  <button
                    onClick={() =>
                      shareSticker(e, pack.outline).then((r) => r === 'downloaded' && toast('Sticker downloaded. Send it in any chat!', 'success', e))
                    }
                    className="block w-full aspect-square rounded-2xl hover:bg-white/70 p-1"
                    title={`${e.name} — tap to send just this one`}
                    aria-label={`Send ${e.name} as a sticker`}
                  >
                    <StickerPreview emoji={e} outline={pack.outline} className="size-full" />
                  </button>
                  <span className={`absolute bottom-0 left-1 text-[10px] ${i >= WA_MAX ? 'text-hot' : 'text-muted'}`}>{i + 1}</span>
                  <button onClick={() => togglePack(e)} className="btn absolute -top-1 -right-1 size-6 bg-bg border border-line sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Remove ${e.name}`}>
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <button onClick={() => setPicker(true)} className="aspect-square rounded-2xl border-2 border-dashed border-fg/15 hover:border-acid hover:text-acid grid place-items-center text-muted" aria-label="Add stickers">
                <Plus className="size-7" />
              </button>
            </div>
          )}
        </div>
        {stickers.length > 0 && <p className="mt-2 text-xs text-muted">Tip: tap a sticker to send just that one straight to WhatsApp/Telegram from your phone.</p>}
        {picker && <Picker onClose={() => setPicker(false)} />}
      </section>

      {busy && (
        <div className="fixed z-[60] inset-x-0 bottom-6 flex justify-center pointer-events-none">
          <div className="flex items-center gap-3 rounded-full bg-fg text-white px-5 py-3 font-extrabold shadow-2xl animate-pop">
            <Loader2 className="size-5 animate-spin" /> {busy.what} {busy.done}/{busy.total}
          </div>
        </div>
      )}

      {/* ---------------- EXPORTS */}
      <h2 className="meme text-4xl mt-10 mb-4">send it to…</h2>
      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <WhatsAppCard
          disabled={!waOk || !!busy}
          count={stickers.length}
          webp={webp}
          onPack={() =>
            run('Packing for WhatsApp', async (p) => {
              downloadBlob(await buildWhatsAppPack(stickers.slice(0, WA_MAX), meta, p), `${slug}.wastickers`)
              toast('WhatsApp pack downloaded!', 'success')
            })
          }
          onIphone={() =>
            run('Preparing images', async (p) => {
              const r = await shareAllAsImages(stickers.slice(0, WA_MAX), pack.outline, p)
              if (r === 'unsupported') {
                downloadBlob(await buildTelegramZip(stickers.slice(0, WA_MAX), meta), `${slug}-images.zip`)
                toast('Downloaded as a zip of images instead', 'info')
              }
            })
          }
        />
        <TelegramCard
          stickers={stickers}
          packName={pack.name}
          disabled={!stickers.length || !!busy}
          onZip={() =>
            run('Packing for Telegram', async (p) => {
              downloadBlob(await buildTelegramZip(stickers, meta, p), `${slug}-telegram.zip`)
              toast('Telegram files downloaded!', 'success')
            })
          }
        />
        <DiscordCard
          stickers={stickers}
          disabled={!stickers.length || !!busy}
          onZip={() =>
            run('Packing for Discord', async (p) => {
              downloadBlob(await buildDiscordZip(stickers, meta, p), `${slug}-discord.zip`)
              toast('Discord pack downloaded!', 'success')
            })
          }
        />
      </div>

      {stickers.length === 0 && (
        <p className="mt-6 text-sm text-muted">
          Need more? Hit 📦 <b>Add to sticker pack</b> on any emoji, or{' '}
          <button onClick={() => navigate('create')} className="text-acid underline">
            cook your own
          </button>
          .
        </p>
      )}
    </div>
  )
}

/* ---------------- picker */
function Picker({ onClose }: { onClose: () => void }) {
  const { allEmojis, favourites, customEmojis, resolveEmoji, inPack, togglePack } = useStore()
  const [tab, setTab] = useState<'stash' | 'library'>(favourites.length + customEmojis.length ? 'stash' : 'library')
  const [query, setQuery] = useState('')
  const stash = useMemo(() => [...customEmojis, ...favourites.map(resolveEmoji).filter((e): e is Emoji => !!e)], [customEmojis, favourites, resolveEmoji])
  const source = tab === 'stash' ? stash : allEmojis
  const list = query.trim() ? filterEmojis(source, { query, category: 'all', sort: 'trending' }) : source

  return (
    <div className="mt-4 rounded-3xl bg-raised border border-line p-3 animate-rise">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full bg-surface border border-line p-1">
          {(
            [
              ['stash', `💾 Stash (${stash.length})`],
              ['library', '🔥 All emojis'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`btn h-8 px-3 text-xs ${tab === id ? 'bg-fg text-white' : ''}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[160px]">
          <SearchBar value={query} onChange={setQuery} size="sm" placeholder="search…" />
        </div>
        <button onClick={onClose} className="btn h-10 px-4 bg-acid text-ink text-sm">
          Done
        </button>
      </div>
      <div className="mt-3 max-h-80 overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-1.5">
        {list.length === 0 && <p className="col-span-full text-sm text-muted p-4">Nothing here yet. Heart some emojis in the feed first.</p>}
        {list.map((e) => {
          const on = inPack(e.id)
          return (
            <button key={e.id} onClick={() => togglePack(e)} aria-pressed={on} title={e.name} className={`relative aspect-square rounded-2xl grid place-items-center ${on ? 'bg-acid/20 ring-2 ring-acid' : 'bg-surface hover:bg-line'}`}>
              <EmojiImage emoji={e} compact className="size-11" />
              <span className={`absolute top-1 right-1 grid place-items-center size-5 rounded-full text-[10px] ${on ? 'bg-acid text-ink' : 'bg-bg/80 text-muted'}`}>{on ? <Check className="size-3" /> : <Plus className="size-3" />}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- platform cards */
function Card({ color, logo, title, children }: { color: string; logo: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] bg-white shadow-soft overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4" style={{ background: `${color}22`, borderBottom: `1px solid ${color}44` }}>
        <span className="grid place-items-center size-10 rounded-2xl text-xl" style={{ background: color }}>{logo}</span>
        <h3 className="font-display font-bold text-xl">{title}</h3>
      </div>
      <div className="p-5 text-sm">{children}</div>
    </section>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid place-items-center size-6 shrink-0 rounded-full bg-raised text-xs font-extrabold">{n}</span>
      <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
    </li>
  )
}

function CopyChip({ text, label }: { text: string; label?: string }) {
  const { toast } = useStore()
  return (
    <button
      onClick={() => copyText(text).then(() => toast(`Copied “${text}”`, 'success'))}
      className="inline-flex items-center gap-1.5 rounded-lg bg-raised hover:bg-line border border-line px-2 py-1 font-mono text-xs max-w-full"
    >
      <span className="truncate">{label ?? text}</span>
      <Copy className="size-3 shrink-0 text-muted" />
    </button>
  )
}

function WhatsAppCard({ disabled, count, webp, onPack, onIphone }: { disabled: boolean; count: number; webp: boolean | null; onPack: () => void; onIphone: () => void }) {
  const [os, setOs] = useState<'android' | 'iphone'>(() => (/iPhone|iPad|Macintosh/.test(navigator.userAgent) ? 'iphone' : 'android'))
  return (
    <Card color="#25D366" logo="💬" title="WhatsApp">
      <div className="flex rounded-full bg-raised p-1 mb-4">
        {(
          [
            ['android', '🤖 Android'],
            ['iphone', '🍎 iPhone'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} onClick={() => setOs(id)} className={`btn flex-1 h-8 text-xs ${os === id ? 'bg-[#25D366] text-ink' : ''}`}>
            {label}
          </button>
        ))}
      </div>
      {os === 'android' ? (
        <ol className="flex flex-col gap-3">
          <Step n={1}>
            <button onClick={onPack} disabled={disabled || webp === false} className="btn w-full h-12 bg-[#25D366] text-ink disabled:opacity-40">
              <Download className="size-4" /> Download pack (.wastickers)
            </button>
            {count < WA_MIN && <p className="text-xs text-muted mt-1">WhatsApp needs {WA_MIN}–{WA_MAX} stickers.</p>}
            {webp === false && <p className="text-xs text-hot mt-1">This browser can’t make WhatsApp stickers. Open this page in Chrome.</p>}
          </Step>
          <Step n={2}>
            Install a free importer app, e.g. <b>Sticker Maker</b>{' '}
            <a className="text-acid inline-flex items-center gap-0.5" href="https://play.google.com/store/search?q=sticker%20maker%20wastickers&c=apps" target="_blank" rel="noreferrer">
              Play Store <ExternalLink className="size-3" />
            </a>
            . WhatsApp only accepts packs through an app.
          </Step>
          <Step n={3}>Open the downloaded file → choose the sticker app → <b>Add to WhatsApp</b>. Done 🎉</Step>
        </ol>
      ) : (
        <ol className="flex flex-col gap-3">
          <Step n={1}>
            <button onClick={onIphone} disabled={disabled} className="btn w-full h-12 bg-[#25D366] text-ink disabled:opacity-40">
              <Share2 className="size-4" /> Save stickers to Photos
            </button>
            <p className="text-xs text-muted mt-1">In the share sheet, tap “Save Images”.</p>
          </Step>
          <Step n={2}>
            In WhatsApp open any chat → tap the <b>sticker</b> icon → <b>Create sticker</b> → pick one from Photos → send it.
          </Step>
          <Step n={3}>Tap the sent sticker → <b>Add to Favourites ⭐</b>. Now it lives in your sticker tray.</Step>
        </ol>
      )}
      <p className="mt-4 text-xs text-muted">Fastest for one sticker: tap it in your pack above and share straight to WhatsApp.</p>
    </Card>
  )
}

function TelegramCard({ stickers, packName, disabled, onZip }: { stickers: Emoji[]; packName: string; disabled: boolean; onZip: () => void }) {
  const short = `${fileSlug(packName).replace(/-/g, '_').slice(0, 40)}_by_larpmoji`
  const [link, setLink] = useState('')
  return (
    <Card color="#2AABEE" logo="✈️" title="Telegram">
      <ol className="flex flex-col gap-3">
        <Step n={1}>
          <button onClick={onZip} disabled={disabled} className="btn w-full h-12 bg-[#2AABEE] text-ink disabled:opacity-40">
            <Download className="size-4" /> Download sticker files
          </button>
          <p className="text-xs text-muted mt-1">512px PNGs, Telegram-ready. Unzip on your phone (Files app does it).</p>
        </Step>
        <Step n={2}>
          Open the official bot{' '}
          <a className="text-acid inline-flex items-center gap-0.5" href="https://t.me/Stickers" target="_blank" rel="noreferrer">
            @Stickers <ExternalLink className="size-3" />
          </a>{' '}
          and send: <CopyChip text="/newpack" /> then the name <CopyChip text={packName || 'LARPMOJI Pack'} />
        </Step>
        <Step n={3}>
          For each sticker, send the file <b>as a file</b> (not photo), then its emoji:
          <div className="mt-2 max-h-40 overflow-y-auto flex flex-col gap-1 pr-1">
            {stickers.length === 0 && <span className="text-xs text-muted">Add stickers to your pack first.</span>}
            {stickers.map((e, i) => (
              <div key={e.id} className="flex items-center gap-2 text-xs">
                <span className="font-mono text-muted w-12">{String(i + 1).padStart(2, '0')}.png</span>
                <EmojiImage emoji={e} compact className="size-6" />
                <span className="text-muted">→</span>
                <CopyChip text={stickerEmoji(e)} />
              </div>
            ))}
          </div>
        </Step>
        <Step n={4}>
          Send <CopyChip text="/publish" /> → <CopyChip text="/skip" /> → short name <CopyChip text={short} />
        </Step>
        <Step n={5}>
          Paste the link the bot gives you to share it:
          <div className="mt-2 flex gap-2">
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder={`t.me/addstickers/${short}`} className="flex-1 min-w-0 h-9 rounded-full bg-raised border border-line focus:border-acid outline-none px-3 text-xs" />
            {link.trim() && <CopyChip text={link.trim()} label="copy" />}
          </div>
        </Step>
      </ol>
    </Card>
  )
}

function DiscordCard({ stickers, disabled, onZip }: { stickers: Emoji[]; disabled: boolean; onZip: () => void }) {
  const names = useMemo(() => {
    const used = new Set<string>()
    return stickers.map((e) => discordName(e.name, used))
  }, [stickers])
  return (
    <Card color="#5865F2" logo="🎮" title="Discord">
      <ol className="flex flex-col gap-3">
        <Step n={1}>
          <button onClick={onZip} disabled={disabled} className="btn w-full h-12 bg-[#5865F2] text-white disabled:opacity-40">
            <Download className="size-4" /> Download Discord pack
          </button>
          <p className="text-xs text-muted mt-1">Includes server emojis (128px) + stickers (320px).</p>
        </Step>
        <Step n={2}>
          <b>Emojis:</b> Server Settings → <b>Emoji</b> → <b>Upload Emoji</b> → select everything in the <code className="text-acid">emojis</code> folder at once. Free servers get 50 slots.
        </Step>
        <Step n={3}>
          <b>Stickers:</b> Server Settings → <b>Stickers</b> → <b>Upload Sticker</b> (files in <code className="text-acid">stickers</code>). Free servers get 5 slots.
        </Step>
        <Step n={4}>
          Use them in chat:
          <div className="mt-2 flex flex-wrap gap-1">
            {names.slice(0, 8).map((n) => (
              <span key={n} className="rounded-md bg-[#5865F2]/20 text-[#c9cdff] px-1.5 py-0.5 font-mono text-[11px]">:{n}:</span>
            ))}
            {names.length > 8 && <span className="text-xs text-muted">+{names.length - 8} more</span>}
            {names.length === 0 && <span className="text-xs text-muted">Add stickers first.</span>}
          </div>
        </Step>
      </ol>
      <p className="mt-4 text-xs text-muted">No server of your own? Any server where you have “Manage Expressions” works.</p>
    </Card>
  )
}
