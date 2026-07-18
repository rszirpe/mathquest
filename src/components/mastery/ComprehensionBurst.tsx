import { useState } from 'react'
import type { AnswerValue, Problem } from '@/types'
import { checkAnswer } from '@/lib/answer'

interface Props {
  problems: Problem[]
  onDone: () => void
}

/** Non-blocking: always advances after both problems, regardless of correctness — never blocks progress. */
export function ComprehensionBurst({ problems, onDone }: Props) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<AnswerValue | null>(null)
  const [numberValue, setNumberValue] = useState('')
  const problem = problems[idx]

  if (!problem) {
    onDone()
    return null
  }

  const answered = picked !== null
  const correct = answered && checkAnswer(problem, picked)

  const submit = (value: AnswerValue) => {
    if (answered) return
    setPicked(value)
  }

  const next = () => {
    if (idx + 1 >= problems.length) {
      onDone()
      return
    }
    setIdx((i) => i + 1)
    setPicked(null)
    setNumberValue('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
        ✏️ Quick check {idx + 1} / {problems.length}
      </div>
      <div className="rounded-3xl bg-white px-5 py-7 text-center shadow-xl">
        <div className="font-display text-3xl font-extrabold break-words text-slate-800">{problem.prompt}</div>
      </div>

      {problem.inputType === 'choice' ? (
        <div className={`grid gap-3 ${(problem.choices ?? []).length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {(problem.choices ?? []).map((c, i) => {
            const isAns = String(c) === String(problem.answer)
            const isSel = picked !== null && String(c) === String(picked)
            let cls = 'bg-white text-slate-700 hover:bg-indigo-50'
            if (answered) {
              if (isAns) cls = 'bg-emerald-400 text-white ring-4 ring-emerald-200'
              else if (isSel) cls = 'bg-rose-400 text-white'
              else cls = 'bg-white/60 text-slate-400'
            }
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => submit(c)}
                className={`font-display rounded-2xl py-5 text-2xl font-extrabold shadow-md transition active:scale-95 ${cls}`}
              >
                {c}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <input
            value={answered ? String(picked ?? '') : numberValue}
            onChange={(e) => setNumberValue(e.target.value.replace(/[^0-9.-]/g, '').slice(0, 7))}
            disabled={answered}
            inputMode="decimal"
            placeholder="?"
            className={`font-display w-40 rounded-2xl border-2 px-4 py-3 text-center text-3xl font-extrabold outline-none ${
              answered
                ? correct
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-rose-300 bg-rose-50 text-rose-700'
                : 'border-white bg-white text-slate-800 focus:border-indigo-300'
            }`}
          />
          {!answered && (
            <button
              onClick={() => numberValue !== '' && submit(numberValue)}
              disabled={numberValue === ''}
              className="font-display w-40 rounded-2xl bg-indigo-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95 disabled:opacity-40"
            >
              Check ✓
            </button>
          )}
        </div>
      )}

      {answered && (
        <div className={`flex items-center justify-between rounded-2xl p-3 font-bold text-white ${correct ? 'bg-emerald-500' : 'bg-rose-500'}`}>
          <span>{correct ? 'Nice!' : `The answer is ${problem.answer}.`}</span>
          <button onClick={next} className="font-display rounded-full bg-white/20 px-3 py-1.5 text-sm active:scale-95">
            {idx + 1 >= problems.length ? 'Continue →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}
