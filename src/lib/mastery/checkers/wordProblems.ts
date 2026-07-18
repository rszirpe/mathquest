import type { MethodChecker } from '../types'
import { additionSubtractionChecker } from './additionSubtraction'

/**
 * Word problems store the exact same operands/operator shape as addition/subtraction
 * (see src/lib/problems/generators.ts). Before delegating to the carry/borrow checkers,
 * catch the single most common real word-problem mistake: picking the wrong operation.
 */
export const wordProblemsChecker: MethodChecker = (problem, student, correct) => {
  const [a, b] = problem.operands ?? []
  if (a === undefined || b === undefined) return null

  const otherOpResult = problem.operator === '+' ? a - b : a + b
  if (otherOpResult !== correct && student === otherOpResult) {
    return {
      kind: 'wrong-method',
      confidence: 'high',
      message: 'This needed a different operation — re-read the problem to see if you should add or take away.',
    }
  }

  return additionSubtractionChecker(problem, student, correct)
}
