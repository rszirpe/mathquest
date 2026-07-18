import type { AnswerValue, GradeLevel, Problem, TopicId } from '@/types'
import { generateBatch } from '@/lib/problems'
import { difficultyForGrade, topicsForGrade } from '@/lib/curriculum'
import { checkMethod } from '@/lib/mastery/methodCheck'
import type { AiClient, HintRequest, MethodJudgment } from './types'

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const REWORD_PREFIXES = [
  "Let's try that step again:",
  "Here's another way to think about it:",
  'One more clue:',
  'Look closely at this part:',
]

/**
 * Stand-in for a real Gemini call. `judgeMethod` wraps the local heuristic behind a Promise +
 * simulated latency so the mastery loop's async UI states are exercised today; `generateHint`
 * templates off each generator's authored `hint` text. No network call happens here — swapping
 * in `geminiClient.ts` later (same `AiClient` shape) plus one line in `./index.ts` is the entire
 * migration.
 */
export const stubClient: AiClient = {
  async judgeMethod(problem: Problem, studentAnswer: AnswerValue): Promise<MethodJudgment> {
    const verdict = checkMethod(problem, studentAnswer)
    const judgment: MethodJudgment =
      verdict.kind === 'correct-method-wrong-answer'
        ? { verdict: 'correct-method', confidence: 0.6, rationale: verdict.missedStep }
        : { verdict: 'wrong-method', confidence: 0.6, rationale: verdict.kind === 'wrong-method' ? verdict.message : undefined }
    return delay(judgment)
  },

  async generateHint(req: HintRequest): Promise<string> {
    const prefix = REWORD_PREFIXES[Math.min(req.attemptNumber - 1, REWORD_PREFIXES.length - 1)]
    const base = req.problem.hint ?? `Look again at the numbers in "${req.problem.prompt}".`
    return delay(`${prefix} ${base}`)
  },

  async generatePlacementQuestions(grade: GradeLevel, count: number): Promise<Problem[]> {
    const topics = topicsForGrade(grade).map((t) => t.id) as TopicId[]
    return delay(generateBatch(topics, difficultyForGrade(grade), count))
  },
}
