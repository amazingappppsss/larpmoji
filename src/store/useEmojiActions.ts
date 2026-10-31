import { useCallback } from 'react'
import type { Emoji } from '../types'
import { copyText, downloadPng, downloadSvg, sendEmoji, shortcode } from '../lib/emojiActions'
import { useStore } from './AppStore'

/** UI-level copy/download actions with toasts + "recently used" tracking. */
export function useEmojiActions() {
  const { toast, pushRecent } = useStore()

  const send = useCallback(
    async (e: Emoji) => {
      try {
        const result = await sendEmoji(e)
        pushRecent(e.id)
        if (result === 'copied') toast(`Copied ${e.name} — paste it anywhere!`, 'success', e.src)
        else toast(`Image copy isn't supported here, so ${e.name} was downloaded instead.`, 'info', e.src)
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Could not copy that emoji', 'error')
      }
    },
    [toast, pushRecent],
  )

  const copyCode = useCallback(
    async (e: Emoji) => {
      try {
        await copyText(shortcode(e))
        toast(`Copied ${shortcode(e)}`, 'success')
      } catch {
        toast('Clipboard blocked by the browser', 'error')
      }
    },
    [toast],
  )

  const download = useCallback(
    async (e: Emoji, format: 'png' | 'svg' = 'png') => {
      try {
        if (format === 'svg') downloadSvg(e)
        else await downloadPng(e)
        pushRecent(e.id)
        toast(`Downloaded ${e.name}.${format}`, 'success', e.src)
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Download failed', 'error')
      }
    },
    [toast, pushRecent],
  )

  return { send, copyCode, download }
}
