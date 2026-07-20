import { useMemo, useState } from 'react'
import type { AnswerValue, Problem } from '@/types'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { checkAnswer } from '@/lib/answer'
import { buildSatStarTest, SAT_STAR_TEST_COST, SAT_STAR_TEST_MAX_ATTEMPTS } from '@/lib/satStar'
import { ScreenHeader } from '@/components/ScreenHeader'

interface QuestionResult {
  problem: Problem
  correct: boolean
  explanation: string
}

export function SatStarTestScreen() {
  const back = useUiStore((s) => s.back)
  const go = useUiStore((s) => s.go)
  const grade = usePlayerStore((s) => s.grade)
  const satStars = usePlayerStore((s) => s.satStars)
  const progress = usePlayerStore((s) => s.progress)
  const spendSatStars = usePlayerStore((s) => s.spendSatStars)
  const recordSatStarTest = usePlayerStore((s) => s.recordSatStarTest)

  const problems = useMemo<Problem[]>(
    () => (grade ? buildSatStarTest(grade, progress) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [phase, setPhase] = useState<'intro' | 'test' | 'results'>('intro')
  const [idx, setIdx] = useState(0)
  const [attempt, setAttempt] = useState(1)
  const [numberValue, setNumberValue] = useState('')
  const [wrongOnce, setWrongOnce] = useState(false)
  const [explainText, setExplainText] = useState('')
  const [results, setResults] = useState<QuestionResult[]>([])
  const [testResult, setTestResult] = useState<ReturnType<typeof recordSatStarTest> | null>(null)

  if (!grade) return null

  const current = problems[idx]
  const canAfford = satStars >= SAT_STAR_TEST_COST

  const unlock = () => {
    if (!spendSatStars(SAT_STAR_TEST_COST)) return
    setPhase('test')
  }

  const advance = (correct: boolean) => {
    const nextResults = [...results, { problem: current, correct, explanation: explainText.trim() }]
    setResults(nextResults)
    setNumberValue('')
    setAttempt(1)
    setWrongOnce(false)
    setExplainText('')
    if (idx + 1 >= problems.length) {
      const result = recordSatStarTest({ grade, results: nextResults.map((r) => ({ problem: r.problem, correct: r.correct })) })
      setTestResult(result)
      setPhase('results')
    } else {
      setIdx((i) => i + 1)
    }
  }

  const submit = (value: AnswerValue) => {
    if (checkAnswer(current, value)) {
      advance(true)
      return
    }
    if (attempt < SAT_STAR_TEST_MAX_ATTEMPTS) {
      setWrongOnce(true)
      setAttempt((a) => a + 1)
      setNumberValue('')
      return
    }
    advance(false)
  }

  if (phase === 'intro') {
    return (
      <div className="flex min-h-full flex-col bg-gradient-to-b from-amber-400 to-orange-600 p-5">
        <ScreenHeader title="SAT Star Test" onBack={back} />
        <div className="mx-auto my-auto w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
          <div className="text-6xl">🌟</div>
          <h2 className="font-display mt-3 text-2xl font-black text-slate-800">Ready for a real challenge?</h2>
          <p className="mt-3 font-semibold text-slate-500">
            This test mixes topics you've <b className="text-slate-700">already learned</b> — not the same
            practice. You get <b className="text-slate-700">2 tries</b> per question, graded right away. Miss one
            and you'll be asked to redo that topic — fundamentals matter!
          </p>
          <div className="mt-4 rounded-2xl bg-amber-50 p-3 font-bold text-amber-700">
            You have {satStars} 🌟 · costs {SAT_STAR_TEST_COST} 🌟
          </div>
          {problems.length === 0 ? (
            <p className="mt-3 text-sm font-bold text-rose-500">Play a few more problems first to unlock this!</p>
          ) : canAfford ? (
            <button
              onClick={unlock}
              className="font-display mt-5 w-full rounded-2xl bg-amber-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95"
            >
              Unlock test →
            </button>
          ) : (
            <button
              onClick={() => go('satstarshop')}
              className="font-display mt-5 w-full rounded-2xl bg-indigo-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95"
            >
              Get more stars →
            </button>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'test' && current) {
    return (
      <div className="flex min-h-full flex-col bg-gradient-to-b from-amber-400 to-orange-600 p-4">
        <div className="mx-auto mb-3 flex w-full max-w-xl items-center justify-between font-display text-sm font-bold text-white/90">
          <span className="rounded-full bg-white/20 px-3 py-1">🌟 Question {idx + 1} / {problems.length}</span>
          {attempt > 1 && <span className="rounded-full bg-rose-500/80 px-3 py-1">Attempt {attempt} of {SAT_STAR_TEST_MAX_ATTEMPTS}</span>}
        </div>

        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4">
          <div className="rounded-3xl bg-white px-5 py-7 text-center shadow-xl">
            {current.prompt.split('\n').map((l, i) => (
              <div
                key={i}
                className={i === 0 ? 'font-display text-3xl font-extrabold break-words text-slate-800' : 'mt-2 text-2xl break-words text-slate-600'}
              >
                {l}
              </div>
            ))}
          </div>

          {wrongOnce && (
            <div className="rounded-2xl bg-rose-100 p-3 text-center font-bold text-rose-600">Not quite — try again!</div>
          )}

          {current.inputType === 'choice' ? (
            <div className={`grid gap-3 ${(current.choices ?? []).length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {(current.choices ?? []).map((c, i) => (
                <button
                  key={i}
                  onClick={() => submit(c)}
                  className="font-display rounded-2xl bg-white py-5 text-2xl font-extrabold text-slate-700 shadow-md transition hover:bg-amber-50 active:scale-95"
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
                inputMode="decimal"
                placeholder="?"
                className="font-display w-40 rounded-2xl border-2 border-white bg-white px-4 py-3 text-center text-3xl font-extrabold text-slate-800 outline-none focus:border-amber-400"
              />
              <button
                onClick={() => numberValue !== '' && submit(numberValue)}
                disabled={numberValue === ''}
                className="font-display w-40 rounded-2xl bg-amber-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95 disabled:opacity-40"
              >
                Check ✓
              </button>
            </div>
          )}

          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
            <label className="mb-1 block text-xs font-bold text-white/80">
              Explain how you got this answer (optional — just for parents/teachers to see, not graded!)
            </label>
            <textarea
              value={explainText}
              onChange={(e) => setExplainText(e.target.value)}
              rows={2}
              placeholder="How did you solve it?"
              className="w-full rounded-xl border border-white/40 bg-white/90 p-2 text-sm text-slate-700 outline-none"
            />
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'results' && testResult) {
    return (
      <div className="flex min-h-full flex-col bg-gradient-to-b from-amber-400 to-orange-600 p-5">
        <ScreenHeader title="SAT Star Test — Results" onBack={back} />
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="text-5xl">{testResult.percent >= 0.8 ? '🎉' : '💪'}</div>
            <div className="font-display mt-2 text-3xl font-black text-slate-800">
              {testResult.correct} / {testResult.total}
              <span className="ml-2 text-xl text-slate-400">({Math.round(testResult.percent * 100)}%)</span>
            </div>
            <div className="font-display mt-1 text-lg font-extrabold text-amber-500">+{testResult.starsEarned} 🌟</div>

            {testResult.newRedoFlags.length > 0 && (
              <div className="mt-4 rounded-2xl bg-rose-50 p-3 text-left">
                <div className="mb-1 font-display font-black text-rose-500">Redo these to lock in the fundamentals:</div>
                <div className="flex flex-col gap-1">
                  {testResult.newRedoFlags.map((f) => (
                    <div key={f.id} className="text-sm font-bold text-slate-700">
                      {f.title}
                    </div>
                  ))}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-400">Find these anytime on the Stats screen.</div>
              </div>
            )}

            {results.some((r) => r.explanation) && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-left">
                <div className="mb-2 font-display font-black text-slate-700">How they explained it</div>
                <div className="flex flex-col gap-2">
                  {results
                    .filter((r) => r.explanation)
                    .map((r, i) => (
                      <div key={i} className="rounded-xl bg-white p-2 text-sm">
                        <div className="font-bold text-slate-700">{r.problem.prompt.split('\n')[0]}</div>
                        <div className="mt-0.5 text-slate-500">{r.explanation}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <button
              onClick={back}
              className="font-display mt-5 w-full rounded-2xl bg-amber-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
