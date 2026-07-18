import type { AnswerValue, Problem } from '@/types'
import type { MethodVerdict } from './types'
import { checkers } from './checkers'

const GENERIC_MISSED_STEP =
  'You had the right idea, but a small step slipped — double check your work and try that step again.'

/**
 * Generic numeric-distance heuristic, works off `answer`/`operands`/`operator` — fields every
 * problem already has — so it covers all topics without touching the 24 generators.
 */
function tier1(problem: Problem, student: number, correct: number): MethodVerdict {
  const slips = new Set<number>()

  // Place-value / off-by-a-bit slips.
  for (const d of [1, 10]) {
    slips.add(correct + d)
    slips.add(correct - d)
  }
  const magnitude = 10 ** Math.max(0, String(Math.abs(Math.round(correct))).length - 1)
  slips.add(correct + magnitude)
  slips.add(correct - magnitude)

  // Decimal-point slips.
  slips.add(correct * 10)
  slips.add(correct / 10)

  const [a, b] = problem.operands ?? []
  if (a !== undefined && b !== undefined) {
    // Operator-confusion result (used the wrong operation on the same operands).
    if (problem.operator === '+') slips.add(a - b)
    if (problem.operator === '-') slips.add(a + b)
    if (problem.operator === '×') slips.add(a + b)
    if (problem.operator === '÷' && b !== 0) slips.add(a - b)

    // Miscounted-group multiple: off by whole rows/groups (catches multiplication/division slips).
    const diff = student - correct
    if (diff !== 0 && ((a !== 0 && diff % a === 0) || (b !== 0 && diff % b === 0))) {
      slips.add(student)
    }
  }

  if (slips.has(student)) {
    return { kind: 'correct-method-wrong-answer', missedStep: GENERIC_MISSED_STEP, correctAnswer: correct }
  }

  const relativeError = Math.abs(student - correct) / Math.max(1, Math.abs(correct))
  if (relativeError > 0.5) {
    // Wildly off — confidently a method error, no judgment call needed, resolved locally.
    return { kind: 'wrong-method', confidence: 'high' }
  }

  // Ambiguous middle band — the only case that escalates to the AI client.
  return { kind: 'wrong-method', confidence: 'unsure' }
}

/** Local-first method check. Only the Tier-1 "unsure" branch ever needs an AI escalation. */
export function checkMethod(problem: Problem, studentAnswer: AnswerValue): MethodVerdict {
  if (problem.inputType === 'choice') {
    // Multiple-choice: no numeric slip to infer a "method" from.
    return String(studentAnswer) === String(problem.answer)
      ? { kind: 'correct-method-correct-answer' }
      : { kind: 'wrong-method', confidence: 'high' }
  }

  const correct = Number(problem.answer)
  const student = Number(studentAnswer)
  if (Number.isNaN(student)) return { kind: 'wrong-method', confidence: 'high' }
  if (student === correct) return { kind: 'correct-method-correct-answer' }

  const checker = checkers[problem.topic]
  const tier2 = checker?.(problem, student, correct)
  if (tier2) return tier2

  return tier1(problem, student, correct)
}
