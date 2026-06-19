import { HelpCircle, Lightbulb } from 'lucide-react'
import type { AnswerValue, Problem } from '@/types'
import { checkAnswer } from '@/lib/answer'

interface Props {
  index: number
  problem: Problem
  value: AnswerValue | null
  onChange: (value: AnswerValue) => void
  graded?: boolean
  hintShown?: boolean
  canHint?: boolean
  onHint?: () => void
  onExplain?: () => void
}

const sanitize = (s: string) => s.replace(/[^0-9.]/g, '').slice(0, 7)

export function WorksheetRow({ index, problem, value, onChange, graded, hintShown, canHint, onHint, onExplain }: Props) {
  const lines = problem.prompt.split('\n')
  const correct = graded ? checkAnswer(problem, value) : false

  return (
    <div className={`rounded-2xl bg-white p-3 shadow-sm ${graded ? (correct ? 'ring-2 ring-emerald-300' : 'ring-2 ring-rose-300') : ''}`}>
      <div className="flex gap-3">
        <div
          className={`font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
            graded ? (correct ? 'bg-emerald-400 text-white' : 'bg-rose-400 text-white') : 'bg-indigo-100 text-indigo-600'
          }`}
        >
          {graded ? (correct ? '✓' : '✗') : index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-display text-lg leading-snug font-bold break-words text-slate-800">
            {lines.map((l, i) => (
              <div key={i} className={i === 0 ? '' : 'text-base font-semibold text-slate-500'}>
                {l}
              </div>
            ))}
          </div>

          {/* Input */}
          {problem.inputType === 'choice' ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {(problem.choices ?? []).map((c, i) => {
                const isSel = value !== null && String(c) === String(value)
                const isAns = String(c) === String(problem.answer)
                let cls = 'bg-slate-100 text-slate-700'
                if (graded) {
                  if (isAns) cls = 'bg-emerald-400 text-white'
                  else if (isSel) cls = 'bg-rose-400 text-white'
                  else cls = 'bg-slate-100 text-slate-400'
                } else if (isSel) {
                  cls = 'bg-indigo-500 text-white'
                }
                return (
                  <button
                    key={i}
                    disabled={graded}
                    onClick={() => onChange(c)}
                    className={`font-display min-w-[44px] rounded-xl px-3 py-2 text-lg font-extrabold transition active:scale-95 ${cls}`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <input
                value={value === null || value === undefined ? '' : String(value)}
                onChange={(e) => onChange(sanitize(e.target.value))}
                disabled={graded}
                inputMode="decimal"
                placeholder="answer"
                className={`font-display w-28 rounded-xl border-2 px-3 py-2 text-lg font-extrabold outline-none ${
                  graded
                    ? correct
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-rose-300 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-400'
                }`}
              />
              {graded && !correct && (
                <span className="text-sm font-bold text-emerald-600">= {problem.answer}</span>
              )}
            </div>
          )}

          {/* Hint (during work) */}
          {!graded && (
            <div className="mt-2">
              {hintShown ? (
                <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                  💡 {problem.hint}
                </div>
              ) : (
                canHint && (
                  <button onClick={onHint} className="flex items-center gap-1 text-xs font-bold text-indigo-400">
                    <Lightbulb size={14} /> Use hint
                  </button>
                )
              )}
            </div>
          )}

          {/* Graded: show me how on wrong */}
          {graded && !correct && onExplain && (
            <button
              onClick={onExplain}
              className="mt-2 flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 active:scale-95"
            >
              <HelpCircle size={14} /> Show me how
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
