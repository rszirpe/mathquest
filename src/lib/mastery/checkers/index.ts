import type { TopicId } from '@/types'
import type { MethodChecker } from '../types'
import { additionSubtractionChecker } from './additionSubtraction'
import { wordProblemsChecker } from './wordProblems'

/**
 * Precise Tier-2 checkers for a curated high-value subset of topics. Everything else falls
 * through to the generic Tier-1 heuristic in `methodCheck.ts`. Adding precision for another
 * topic later is one more entry here — no architecture change needed.
 */
export const checkers: Partial<Record<TopicId, MethodChecker>> = {
  addition: additionSubtractionChecker,
  subtraction: additionSubtractionChecker,
  'word-problems': wordProblemsChecker,
}
