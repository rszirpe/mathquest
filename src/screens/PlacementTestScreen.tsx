import { useEffect, useRef, useState } from 'react'
import type { Problem, TopicId } from '@/types'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { getAiClient } from '@/lib/ai'
import { ScreenHeader } from '@/components/ScreenHeader'
import { MasteryProblemView, type MasteryOutcome } from '@/components/mastery/MasteryProblemView'

const QUESTION_COUNT = 6

/** Premium tier: a few Gemini-driven (stubbed) questions auto-place the student's starting level. */
export function PlacementTestScreen() {
  const back = useUiStore((s) => s.back)
  const grade = usePlayerStore((s) => s.grade)
  const applyPlacementResult = usePlayerStore((s) => s.applyPlacementResult)

  const [problems, setProblems] = useState<Problem[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)
  const suggested = useRef<Partial<Record<TopicId, number>>>({})

  useEffect(() => {
    if (!grade) return
    let cancelled = false
    getAiClient()
      .generatePlacementQuestions(grade, QUESTION_COUNT)
      .then((qs) => {
        if (!cancelled) setProblems(qs)
      })
    return () => {
      cancelled = true
    }
  }, [grade])

  if (!grade) return null
  const problem = problems?.[idx]

  const handleOutcome = (outcome: MasteryOutcome) => {
    if (problem) {
      const bump = outcome.solved ? (outcome.firstTry ? 1 : 0) : -1
      suggested.current = {
        ...suggested.current,
        [problem.topic]: Math.max(1, Math.min(7, problem.difficulty + bump)),
      }
    }
    if (problems && idx + 1 >= problems.length) {
      applyPlacementResult({ suggestedDifficulty: suggested.current })
      setDone(true)
    } else {
      setIdx((i) => i + 1)
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-fuchsia-500 to-indigo-600 p-5">
      <ScreenHeader title="Placement Test" onBack={back} />

      {done ? (
        <div className="mx-auto mt-10 w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
          <div className="text-6xl">🎯</div>
          <h2 className="font-display mt-3 text-2xl font-black text-slate-800">You're placed!</h2>
          <p className="mt-3 font-semibold text-slate-500">
            We used your answers to unlock the right starting point in each topic — Adventure will pick up from there.
          </p>
          <button
            onClick={back}
            className="font-display mt-5 w-full rounded-2xl bg-indigo-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95"
          >
            Done
          </button>
        </div>
      ) : !problem ? (
        <div className="mx-auto mt-10 text-center font-bold text-white">Building your placement questions…</div>
      ) : (
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-3">
          <div className="mx-auto rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
            Question {idx + 1} / {problems?.length ?? QUESTION_COUNT}
          </div>
          <MasteryProblemView key={problem.id} problem={problem} onDone={handleOutcome} />
        </div>
      )}
    </div>
  )
}
