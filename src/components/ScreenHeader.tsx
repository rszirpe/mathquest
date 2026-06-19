import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'

export function ScreenHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur active:scale-95"
      >
        <ChevronLeft size={22} />
      </button>
      <div className="font-display flex-1 text-xl font-black text-white drop-shadow">{title}</div>
      {right}
    </div>
  )
}
