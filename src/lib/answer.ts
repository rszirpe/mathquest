import type { AnswerValue, Problem } from '@/types'

/** True when a given answer value matches the problem's expected answer. */
export function checkAnswer(problem: Problem, value: AnswerValue | null | undefined): boolean {
  if (value === null || value === undefined || value === '') return false
  if (problem.inputType === 'number') return Number(value) === Number(problem.answer)
  return String(value) === String(problem.answer)
}
