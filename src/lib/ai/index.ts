import type { AiClient } from './types'
import { stubClient } from './stubClient'
import { geminiClient } from './geminiClient'

/**
 * The sole swap seam for the mastery loop's AI escalation. Uses the live Gemini client when
 * VITE_GEMINI_API_KEY is set (see .env.example), otherwise falls back to the local stub — no
 * caller elsewhere needs to know which one is active.
 */
export function getAiClient(): AiClient {
  return import.meta.env.VITE_GEMINI_API_KEY ? geminiClient : stubClient
}

export type { AiClient, HintRequest, MethodJudgment, PlacementResult } from './types'
