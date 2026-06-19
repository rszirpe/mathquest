import type { Challenge, ChallengeType } from '@/types'
import { pick, rand } from '@/lib/problems/helpers'

/** A snapshot of the metrics challenges track, derived from the player store. */
export interface ChallengeSnapshot {
  totalSolved: number
  totalCorrect: number
  worksheets: number
  aces: number // worksheets scored ≥ 90%
  fullMarks: number // worksheets scored 100%
  passedLevels: number // sub-levels passed
}

export function metricValue(type: ChallengeType, s: ChallengeSnapshot): number {
  switch (type) {
    case 'solve':
      return s.totalSolved
    case 'correct':
      return s.totalCorrect
    case 'worksheets':
      return s.worksheets
    case 'ace':
      return s.aces
    case 'fullmarks':
      return s.fullMarks
    case 'levels':
      return s.passedLevels
  }
}

interface TemplateOut {
  target: number
  xp: number
  title: string
  emoji: string
}

const TEMPLATES: Record<ChallengeType, () => TemplateOut> = {
  solve: () => {
    const t = rand(3, 8) * 5
    return { target: t, xp: t, title: `Solve ${t} problems`, emoji: '🧮' }
  },
  correct: () => {
    const t = rand(2, 6) * 5
    return { target: t, xp: t + 5, title: `Get ${t} answers correct`, emoji: '✅' }
  },
  worksheets: () => {
    const t = rand(2, 4)
    return { target: t, xp: t * 20, title: `Finish ${t} worksheets`, emoji: '📄' }
  },
  ace: () => {
    const t = rand(1, 3)
    return { target: t, xp: t * 25, title: `Score 90%+ on ${t} worksheet${t > 1 ? 's' : ''}`, emoji: '🌟' }
  },
  fullmarks: () => ({ target: 1, xp: 50, title: 'Get full marks on a worksheet', emoji: '💯' }),
  levels: () => {
    const t = rand(2, 3)
    return { target: t, xp: t * 20, title: `Pass ${t} new steps`, emoji: '🏆' }
  },
}

const ALL_TYPES: ChallengeType[] = ['solve', 'correct', 'worksheets', 'ace', 'fullmarks', 'levels']

function newId(): string {
  return 'ch_' + Math.random().toString(36).slice(2, 10)
}

/** Build one fresh challenge, snapshotting the current metric as its baseline. */
export function makeChallenge(snap: ChallengeSnapshot, excludeTypes: ChallengeType[] = []): Challenge {
  const avail = ALL_TYPES.filter((t) => !excludeTypes.includes(t))
  const type = pick(avail.length ? avail : ALL_TYPES)
  const t = TEMPLATES[type]()
  return { id: newId(), type, title: t.title, emoji: t.emoji, target: t.target, xp: t.xp, baseline: metricValue(type, snap) }
}

/** A starting set of distinct-typed challenges. */
export function initialChallenges(snap: ChallengeSnapshot, count = 3): Challenge[] {
  const out: Challenge[] = []
  for (let i = 0; i < count; i++) out.push(makeChallenge(snap, out.map((c) => c.type)))
  return out
}

export function challengeProgress(ch: Challenge, snap: ChallengeSnapshot): { progress: number; done: boolean } {
  const progress = Math.max(0, Math.min(ch.target, metricValue(ch.type, snap) - ch.baseline))
  return { progress, done: progress >= ch.target }
}
