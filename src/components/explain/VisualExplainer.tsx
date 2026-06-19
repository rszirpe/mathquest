import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import type { ExplainStep } from '@/lib/explain'
import { usePlayerStore } from '@/store/usePlayerStore'
import { Avatar } from '@/components/Avatar'
import { VisualRenderer } from './Visuals'

interface Props {
  steps: ExplainStep[]
  onDone: () => void
  /** Label for the final button. */
  doneLabel?: string
}

export function VisualExplainer({ steps, onDone, doneLabel = 'Got it!' }: Props) {
  const avatar = usePlayerStore((s) => s.avatar)
  const [i, setI] = useState(0)
  const step = steps[i] ?? steps[0]
  const isLast = i === steps.length - 1
  const hasVisual = step.visual.kind !== 'none'

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-indigo-100">
          <Avatar config={avatar} size={44} />
        </div>
        <div className="flex-1">
          <div className="font-display text-lg font-bold text-slate-800">Show me how</div>
          <div className="text-sm text-slate-500">No worries — let's picture it.</div>
        </div>
        <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
          Step {i + 1} of {steps.length}
        </div>
      </div>

      <div className="mt-4 min-h-[150px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-lg leading-relaxed font-semibold text-slate-700">{step.text}</p>
            {hasVisual && (
              <div className="mt-4 flex justify-center rounded-2xl bg-slate-50 p-3">
                <VisualRenderer visual={step.visual} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="flex items-center gap-1 rounded-full px-4 py-2 font-bold text-slate-500 disabled:opacity-30"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex gap-1.5">
          {steps.map((_, idx) => (
            <span key={idx} className={`h-2 w-2 rounded-full ${idx === i ? 'bg-indigo-500' : 'bg-slate-200'}`} />
          ))}
        </div>

        {isLast ? (
          <button
            onClick={onDone}
            className="flex items-center gap-1 rounded-full bg-emerald-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-emerald-500/30 active:scale-95"
          >
            <Check size={18} /> {doneLabel}
          </button>
        ) : (
          <button
            onClick={() => setI((v) => Math.min(steps.length - 1, v + 1))}
            className="flex items-center gap-1 rounded-full bg-indigo-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-indigo-500/30 active:scale-95"
          >
            Next <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
