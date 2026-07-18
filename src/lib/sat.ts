import type { GradeLevel, SatProblem } from '@/types'
import { pick, shuffle } from '@/lib/problems/helpers'
import { SAT_BANK, type SatBand } from '@/lib/satBank'

function bandFor(grade: GradeLevel): SatBand {
  if (grade === '3') return '3'
  if (grade === '4') return '4'
  if (grade === '5') return '5'
  return 'younger'
}

let lastPrompt = ''

export function satQuestion(grade: GradeLevel): SatProblem {
  const entries = SAT_BANK.filter((e) => e.band === bandFor(grade))
  let entry = pick(entries)
  let guard = 0
  while (entry.prompt === lastPrompt && guard++ < 6) entry = pick(entries)
  lastPrompt = entry.prompt
  return { prompt: entry.prompt, choices: shuffle(entry.choices), answer: entry.answer }
}

/** Grade 3+ must do the SAT challenge; younger grades only if enabled in settings. */
export function satRequired(grade: GradeLevel, satForYoungKids: boolean): boolean {
  return grade === '3' || grade === '4' || grade === '5' || satForYoungKids
}
