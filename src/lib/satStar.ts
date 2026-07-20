import type { GradeLevel, Problem, SubLevelProgress } from '@/types'
import { topicsForGrade, topicsPassed } from '@/lib/curriculum'
import { generateWorksheet } from '@/lib/problems'

export const SAT_STAR_TEST_COUNT = 8
export const SAT_STAR_TEST_COST = 20
export const SAT_STAR_TEST_MAX_ATTEMPTS = 2

/**
 * Builds a SAT Star Test: questions mixed across every topic the student has already passed at
 * least one sub-level in (falls back to all of the grade's topics if nothing's passed yet, so the
 * feature never hard-blocks a brand-new student). Reuses `generateWorksheet`'s existing
 * `review=true` path, which already randomizes difficulty 1-6 per problem — the same mechanism
 * that makes the Review sub-level feel mixed rather than a repeat of any single practice session.
 */
export function buildSatStarTest(grade: GradeLevel, progress: Record<string, SubLevelProgress>): Problem[] {
  const learned = topicsPassed(grade, progress)
  const topics = learned.length > 0 ? learned : topicsForGrade(grade).map((t) => t.id)
  return generateWorksheet(topics, 0, SAT_STAR_TEST_COUNT, /* review */ true)
}
