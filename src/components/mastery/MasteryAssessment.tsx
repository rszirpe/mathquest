import { useEffect, useState } from 'react'
import type { Problem } from '@/types'
import { MasteryProblemView } from './MasteryProblemView'

interface Props {
  problems: Problem[]
  onAllDone: () => void
}

/** Loops the mastery loop over the cold-start assessment problems. */
export function MasteryAssessment({ problems, onAllDone }: Props) {
  const [idx, setIdx] = useState(0)
  const problem = problems[idx]

  useEffect(() => {
    if (!problem) onAllDone()
  }, [problem, onAllDone])

  if (!problem) return null

  const next = () => {
    if (idx + 1 >= problems.length) onAllDone()
    else setIdx((i) => i + 1)
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-3">
      <div className="mx-auto flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
        🧠 Cold start {idx + 1} / {problems.length}
      </div>
      <MasteryProblemView key={problem.id} problem={problem} onDone={next} />
    </div>
  )
}
