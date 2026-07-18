import type { TopicId } from '@/types'
import { generateBatch } from '@/lib/problems'

/** A couple of plain practice problems on the same concept, one notch easier. No new problem-authoring system. */
export function pickComprehensionProblems(topic: TopicId, difficulty: number, count = 2) {
  return generateBatch([topic], Math.max(1, difficulty - 1), count)
}
