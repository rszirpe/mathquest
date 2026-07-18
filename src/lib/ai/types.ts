import type { AnswerValue, GradeLevel, Problem, TopicId } from '@/types'

export interface MethodJudgment {
  verdict: 'correct-method' | 'wrong-method'
  confidence: number // 0..1
  rationale?: string
}

export interface HintRequest {
  problem: Problem
  studentAnswer: AnswerValue
  attemptNumber: number
  priorHints: string[]
  /** Optional free-text "how did you solve it?" — unused by the stub, real signal once a live model is wired in. */
  shownWork?: string
}

export interface PlacementResult {
  suggestedDifficulty: Partial<Record<TopicId, number>>
}

/**
 * Swap seam for the mastery loop's AI escalation. `stubClient` implements this today; a future
 * `geminiClient.ts` implementing the same interface + a one-line change in `index.ts` is the
 * entire migration to a real API — no caller elsewhere changes.
 */
export interface AiClient {
  judgeMethod(problem: Problem, studentAnswer: AnswerValue): Promise<MethodJudgment>
  generateHint(req: HintRequest): Promise<string>
  generatePlacementQuestions(grade: GradeLevel, count: number): Promise<Problem[]>
}
