import { AlertTriangle, Check, Info, X } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { EmojiImage } from './EmojiImage'

const TONE = {
  success: { cls: 'bg-white text-ink border border-line', Icon: Check },
  error: { cls: 'bg-hot text-white', Icon: AlertTriangle },
  info: { cls: 'bg-white text-ink border border-line', Icon: Info },
} as const

export function Toasts() {
  const { toasts, dismissToast } = useStore()
  return (
    <div className="fixed z-[70] top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-[min(94vw,24rem)] pointer-events-none" aria-live="polite" role="status">
      {toasts.map((t) => {
        const { cls, Icon } = TONE[t.tone]
        return (
          <div key={t.id} className={`pointer-events-auto w-full flex items-center gap-3 rounded-2xl ${cls} pl-2 pr-2 py-2 shadow-soft animate-pop`}>
            {t.emoji ? (
              <span className="grid place-items-center size-10 rounded-xl bg-raised shrink-0">
                <EmojiImage emoji={t.emoji} compact className="size-8" />
              </span>
            ) : (
              <Icon className="size-5 shrink-0 ml-1" aria-hidden />
            )}
            <span className="flex-1 font-extrabold text-sm leading-tight">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="p-1 rounded-full hover:bg-fg/10" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
