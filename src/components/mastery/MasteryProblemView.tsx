import { useEffect, useState } from 'react'
import type { Problem } from '@/types'
import { explainProblem } from '@/lib/explain'
import { VisualExplainer } from '@/components/explain/VisualExplainer'
import { useMasteryAttempt } from '@/lib/mastery/useMasteryAttempt'
import { HintPanel } from './HintPanel'
import { ComprehensionBurst } from './ComprehensionBurst'

/** Summary of how a problem was resolved — used by the placement test to size its result. */
export interface MasteryOutcome {
  solved: boolean
  attemptsUsed: number
  firstTry: boolean
}

interface Props {
  problem: Problem
  onDone: (outcome: MasteryOutcome) => void
}

export function MasteryProblemView({ problem, onDone }: Props) {
  const { phase, attempts, hint, comprehensionProblems, shownWork, setShownWork, submit, finishComprehension } =
    useMasteryAttempt(problem)
  const [numberValue, setNumberValue] = useState('')
  const isChecking = phase === 'checking'

  // Passed on a cold/retried attempt — straight through, no interruption.
  useEffect(() => {
    if (phase === 'passed') onDone({ solved: true, attemptsUsed: attempts.length, firstTry: attempts.length <= 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (phase === 'passed') return null

  if (phase === 'comprehension') {
    return (
      <ComprehensionBurst
        problems={comprehensionProblems}
        onDone={() => {
          finishComprehension()
          onDone({ solved: true, attemptsUsed: attempts.length, firstTry: false })
        }}
      />
    )
  }

  if (phase === 'revealed') {
    return (
      <div className="mx-auto w-full max-w-md">
        <VisualExplainer
          steps={explainProblem(problem)}
          onDone={() => onDone({ solved: false, attemptsUsed: attempts.length, firstTry: false })}
          doneLabel="Got it, next →"
        />
      </div>
    )
  }

  const submitValue = (value: string | number) => {
    if (value === '') return
    void submit(value)
    setNumberValue('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-white px-5 py-7 text-center shadow-xl">
        {problem.prompt.split('\n').map((l, i) => (
          <div
            key={i}
            className={i === 0 ? 'font-display text-3xl font-extrabold break-words text-slate-800' : 'mt-2 text-2xl break-words text-slate-600'}
          >
            {l}
          </div>
        ))}
      </div>

      {phase === 'hint-retry' && (
        <HintPanel attemptsUsed={attempts.length} hint={hint} shownWork={shownWork} onShownWorkChange={setShownWork} />
      )}

      {problem.inputType === 'choice' ? (
        <div className={`grid gap-3 ${(problem.choices ?? []).length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {(problem.choices ?? []).map((c, i) => (
            <button
              key={i}
              disabled={isChecking}
              onClick={() => submitValue(c)}
              className="font-display rounded-2xl bg-white py-5 text-2xl font-extrabold text-slate-700 shadow-md transition hover:bg-indigo-50 active:scale-95 disabled:opacity-60"
            >
              {c}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <input
            value={numberValue}
            onChange={(e) => setNumberValue(e.target.value.replace(/[^0-9.-]/g, '').slice(0, 7))}
            disabled={isChecking}
            inputMode="decimal"
            placeholder="?"
            className="font-display w-40 rounded-2xl border-2 border-white bg-white px-4 py-3 text-center text-3xl font-extrabold text-slate-800 outline-none focus:border-indigo-300"
          />
          <button
            onClick={() => submitValue(numberValue)}
            disabled={numberValue === '' || isChecking}
            className="font-display w-40 rounded-2xl bg-indigo-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95 disabled:opacity-40"
          >
            {isChecking ? 'Checking…' : 'Check ✓'}
          </button>
        </div>
      )}
    </div>
  )
}
