import { AlertTriangle, Check, Info, X } from 'lucide-react'
import { useStore } from '../store/AppStore'

const TONE = {
  success: { bg: 'bg-lime', Icon: Check },
  error: { bg: 'bg-tomato', Icon: AlertTriangle },
  info: { bg: 'bg-sky', Icon: Info },
} as const

export function Toasts() {
  const { toasts, dismissToast } = useStore()
  return (
    <div className="fixed z-[70] top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-[min(92vw,26rem)] pointer-events-none" aria-live="polite" role="status">
      {toasts.map((t) => {
        const { bg, Icon } = TONE[t.tone]
        return (
          <div key={t.id} className={`pointer-events-auto w-full flex items-center gap-3 rounded-2xl ${bg} px-3 py-2.5 sticker animate-pop`}>
            {t.image ? (
              <img src={t.image} alt="" className="size-9 object-contain shrink-0" />
            ) : (
              <Icon className="size-5 shrink-0" aria-hidden />
            )}
            <span className="flex-1 font-extrabold text-sm leading-tight">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="p-1 rounded-full hover:bg-ink/10" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
