import type { AnswerValue, Problem } from '@/types'

export type MethodVerdict =
  | { kind: 'correct-method-correct-answer' }
  | { kind: 'correct-method-wrong-answer'; missedStep: string; correctAnswer: AnswerValue }
  | { kind: 'wrong-method'; confidence: 'high' | 'unsure'; message?: string }

export interface Attempt {
  n: number
  value: AnswerValue
  verdict: MethodVerdict
  hintShown: string | null
}

/** A topic-specific method checker. Returns null to fall through to the generic heuristic. */
export type MethodChecker = (problem: Problem, student: number, correct: number) => MethodVerdict | null
