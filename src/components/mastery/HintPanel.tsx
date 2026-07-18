import { MAX_ATTEMPTS } from '@/lib/mastery/useMasteryAttempt'

interface Props {
  attemptsUsed: number
  hint: string | null
  shownWork: string
  onShownWorkChange: (v: string) => void
}

export function HintPanel({ attemptsUsed, hint, shownWork, onShownWorkChange }: Props) {
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attemptsUsed)
  return (
    <div className="rounded-3xl bg-amber-50 p-4 shadow-inner">
      <div className="flex items-center justify-between text-sm font-bold text-amber-700">
        <span>💡 Hint</span>
        <span>
          {attemptsLeft} {attemptsLeft === 1 ? 'try' : 'tries'} left
        </span>
      </div>
      {hint && <p className="mt-1 text-sm font-semibold text-amber-800">{hint}</p>}
      <textarea
        value={shownWork}
        onChange={(e) => onShownWorkChange(e.target.value)}
        placeholder="Optional: how did you try to solve it?"
        rows={2}
        className="mt-2 w-full rounded-xl border border-amber-200 bg-white p-2 text-sm text-slate-700 outline-none focus:border-amber-400"
      />
    </div>
  )
}
