import type { AnswerValue, GradeLevel, Problem } from '@/types'
import { generateBatch } from '@/lib/problems'
import { difficultyForGrade, topicsForGrade } from '@/lib/curriculum'
import type { AiClient, HintRequest, MethodJudgment } from './types'

const MODEL = 'gemini-flash-latest'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

async function callGemini(body: Record<string, unknown>): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (typeof text !== 'string') throw new Error('Gemini returned no text')
  return text
}

const JUDGMENT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    verdict: { type: 'STRING', enum: ['correct-method', 'wrong-method'] },
    confidence: { type: 'NUMBER' },
    rationale: { type: 'STRING' },
  },
  required: ['verdict', 'confidence'],
}

/**
 * Live Gemini implementation of the AiClient seam (src/lib/ai/index.ts swaps this in when
 * VITE_GEMINI_API_KEY is set). Problem *content* for the placement test still comes from the
 * deterministic curriculum generator — an LLM can misfire on raw arithmetic and these need
 * guaranteed-correct answers. Gemini's real job in this app is judgment and hinting, both
 * qualitative tasks it's well suited for.
 */
export const geminiClient: AiClient = {
  async judgeMethod(problem: Problem, studentAnswer: AnswerValue): Promise<MethodJudgment> {
    const prompt = `A K-5 student was asked: "${problem.prompt}"
The correct final answer is ${problem.answer}.
The student answered: ${studentAnswer}.
Decide whether the student's answer reflects a correct solving method with a small slip (like a
calculation or counting error), or a fundamentally wrong method/approach. If it's a correct-method
slip, the rationale should name the specific step they likely missed, in one short kid-friendly
sentence. If it's a wrong method, the rationale should briefly say what went wrong conceptually.`

    const text = await callGemini({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: JUDGMENT_SCHEMA,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 }, // hint/judgment calls should stay fast and cheap
      },
    })
    const parsed = JSON.parse(text) as { verdict?: string; confidence?: number; rationale?: string }
    return {
      verdict: parsed.verdict === 'correct-method' ? 'correct-method' : 'wrong-method',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      rationale: typeof parsed.rationale === 'string' ? parsed.rationale : undefined,
    }
  },

  async generateHint(req: HintRequest): Promise<string> {
    const prompt = `You are a friendly K-5 math tutor helping a student who is stuck.
Problem: "${req.problem.prompt}"
This is attempt ${req.attemptNumber} of 5 — they've gotten it wrong every time so far.
Prior hints already given: ${req.priorHints.length ? req.priorHints.join(' | ') : '(none yet)'}
${req.shownWork ? `The student described how they tried to solve it: "${req.shownWork}"` : ''}
Give ONE short, encouraging hint (max 2 sentences) that nudges them toward the right method WITHOUT
revealing the final answer. Do not repeat a prior hint word-for-word — build on it or try a
different angle.`

    const text = await callGemini({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 120, thinkingConfig: { thinkingBudget: 0 } },
    })
    return text.trim()
  },

  async generatePlacementQuestions(grade: GradeLevel, count: number): Promise<Problem[]> {
    const topics = topicsForGrade(grade).map((t) => t.id)
    return generateBatch(topics, difficultyForGrade(grade), count)
  },
}
