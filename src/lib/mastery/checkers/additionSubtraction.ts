import type { MethodChecker } from '../types'

/** Simulates adding each column correctly but forgetting to carry into the next column. */
function droppedCarry(a: number, b: number): number {
  const as = String(a).split('').reverse().map(Number)
  const bs = String(b).split('').reverse().map(Number)
  const len = Math.max(as.length, bs.length)
  let result = ''
  for (let i = 0; i < len; i++) {
    const sum = (as[i] ?? 0) + (bs[i] ?? 0)
    result = String(sum % 10) + result
  }
  return Number(result)
}

/** Simulates subtracting top-from-bottom per column instead of borrowing (assumes a >= b). */
function noBorrow(a: number, b: number): number {
  const as = String(a).split('').reverse().map(Number)
  const bs = String(b).split('').reverse().map(Number)
  let result = ''
  for (let i = 0; i < as.length; i++) {
    result = String(Math.abs((as[i] ?? 0) - (bs[i] ?? 0))) + result
  }
  return Number(result)
}

export const additionSubtractionChecker: MethodChecker = (problem, student, correct) => {
  const [a, b] = problem.operands ?? []
  if (a === undefined || b === undefined) return null

  if (problem.operator === '+') {
    const slip = droppedCarry(a, b)
    if (slip !== correct && student === slip) {
      return {
        kind: 'correct-method-wrong-answer',
        missedStep: 'You added each column right but forgot to carry the 1 into the next column.',
        correctAnswer: correct,
      }
    }
  }

  if (problem.operator === '-') {
    const slip = noBorrow(a, b)
    if (slip !== correct && student === slip) {
      return {
        kind: 'correct-method-wrong-answer',
        missedStep: 'You subtracted each column on its own, but when the top digit is smaller you need to borrow from the next column.',
        correctAnswer: correct,
      }
    }
  }

  return null
}
