import { useMemo, useState } from 'react'
import type { AnswerValue, Problem } from '@/types'
import { checkAnswer } from '@/lib/answer'
import { getAiClient } from '@/lib/ai'
import { checkMethod } from './methodCheck'
import { pickComprehensionProblems } from './comprehension'
import type { Attempt, MethodVerdict } from './types'

export const MAX_ATTEMPTS = 5
const COMPREHENSION_COUNT = 2

export type MasteryPhase = 'cold' | 'checking' | 'hint-retry' | 'comprehension' | 'revealed' | 'passed'

/**
 * The shared attempt/hint/comprehension state machine described in the design doc's "mastery
 * over answers" loop. Reused verbatim by guided-practice assessment and the premium-tier
 * placement test / classwork-help screens — it has no dependency on where the `Problem` came from.
 */
export function useMasteryAttempt(problem: Problem) {
  const [phase, setPhase] = useState<MasteryPhase>('cold')
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [hint, setHint] = useState<string | null>(null)
  const [missedStep, setMissedStep] = useState<string | null>(null)
  const [shownWork, setShownWork] = useState('')

  const comprehensionProblems = useMemo(
    () => pickComprehensionProblems(problem.topic, problem.difficulty, COMPREHENSION_COUNT),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.id],
  )

  const resolveVerdict = async (value: AnswerValue): Promise<MethodVerdict> => {
    if (checkAnswer(problem, value)) return { kind: 'correct-method-correct-answer' }

    const local = checkMethod(problem, value)
    if (local.kind !== 'wrong-method' || local.confidence !== 'unsure') return local

    // Only the ambiguous middle band ever reaches here — keeps AI usage low.
    const judgment = await getAiClient().judgeMethod(problem, value)
    if (judgment.verdict === 'correct-method') {
      return {
        kind: 'correct-method-wrong-answer',
        missedStep: judgment.rationale ?? 'Check your work on the last step.',
        correctAnswer: problem.answer,
      }
    }
    return { kind: 'wrong-method', confidence: 'high', message: judgment.rationale }
  }

  const submit = async (value: AnswerValue) => {
    if (phase !== 'cold' && phase !== 'hint-retry') return
    setPhase('checking')

    const priorHints = attempts.map((a) => a.hintShown).filter((h): h is string => !!h)
    const verdict = await resolveVerdict(value)
    const n = attempts.length + 1
    setAttempts((prev) => [...prev, { n, value, verdict, hintShown: hint }])

    if (verdict.kind === 'correct-method-correct-answer') {
      setPhase('passed')
      return
    }
    if (verdict.kind === 'correct-method-wrong-answer') {
      setMissedStep(verdict.missedStep)
      setPhase('comprehension')
      return
    }
    // wrong-method
    if (n >= MAX_ATTEMPTS) {
      setPhase('revealed')
      return
    }
    const nextHint = await getAiClient().generateHint({
      problem,
      studentAnswer: value,
      attemptNumber: n,
      priorHints,
      shownWork: shownWork || undefined,
    })
    setHint(nextHint)
    setPhase('hint-retry')
  }

  const finishComprehension = () => setPhase('passed')

  return {
    phase,
    attempts,
    hint,
    missedStep,
    comprehensionProblems,
    shownWork,
    setShownWork,
    submit,
    finishComprehension,
  }
}
