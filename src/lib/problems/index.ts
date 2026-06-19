import type { Problem, TopicId } from '@/types'
import { generators } from './generators'
import { pick, rand, uid } from './helpers'

export function generateProblem(topic: TopicId, difficulty: number): Problem {
  const gen = generators[topic] ?? generators.addition
  return { id: uid(), ...gen(difficulty) }
}

/** A batch of problems drawn from one or more topics, avoiding back-to-back repeats. */
export function generateBatch(topics: TopicId[], difficulty: number, count: number): Problem[] {
  const out: Problem[] = []
  const seen = new Set<string>()
  let guard = 0
  while (out.length < count && guard++ < count * 10) {
    const topic = pick(topics)
    const p = generateProblem(topic, difficulty)
    if (seen.has(p.prompt)) continue
    seen.add(p.prompt)
    out.push(p)
  }
  return out
}

/**
 * A homework worksheet of `count` problems. Tries hard to keep every prompt unique (retries up
 * to 25× before accepting a repeat), so sheets feel fresh. Review sheets mix difficulty 1–6.
 */
export function generateWorksheet(topics: TopicId[], difficulty: number, count: number, review = false): Problem[] {
  const out: Problem[] = []
  const seen = new Set<string>()
  for (let i = 0; i < count; i++) {
    const d = () => (review ? rand(1, 6) : difficulty)
    let p = generateProblem(pick(topics), d())
    let tries = 0
    while (seen.has(p.prompt) && tries++ < 25) {
      p = generateProblem(pick(topics), d())
    }
    seen.add(p.prompt)
    out.push(p)
  }
  return out
}

export { generators } from './generators'
