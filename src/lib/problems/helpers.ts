import type { AnswerValue } from '@/types'

export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

/** Numeric multiple-choice options: the answer plus nearby plausible distractors. */
export function makeChoices(
  answer: number,
  opts: { count?: number; spread?: number; min?: number } = {},
): number[] {
  const count = opts.count ?? 4
  const spread = opts.spread ?? Math.max(2, Math.round(Math.abs(answer) * 0.25) + 2)
  const min = opts.min ?? 0
  const set = new Set<number>([answer])
  let guard = 0
  while (set.size < count && guard++ < 60) {
    const delta = rand(1, spread) * (Math.random() < 0.5 ? -1 : 1)
    const cand = answer + delta
    if (cand >= min) set.add(cand)
  }
  let extra = answer + 1
  while (set.size < count) {
    if (extra >= min) set.add(extra)
    extra++
  }
  return shuffle([...set])
}

/** Generic choices for non-numeric answers (strings, comparators, etc.). */
export function uniqueChoices<T extends AnswerValue>(answer: T, distractors: T[], count = 4): T[] {
  const out: T[] = [answer]
  for (const d of distractors) {
    if (out.length >= count) break
    if (!out.includes(d)) out.push(d)
  }
  return shuffle(out)
}

/** Clamp/round a difficulty into the 1–7 range used by the sub-level ramp. */
export function clampDifficulty(d: number): number {
  return Math.min(Math.max(Math.round(d), 1), 7)
}

/** Difficulty (1-7) → upper bound for addition/subtraction operands; grows smoothly each step. */
export function maxByDifficulty(d: number): number {
  return [5, 10, 20, 40, 80, 150, 300][clampDifficulty(d) - 1]
}
