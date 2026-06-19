export const XP_CORRECT = 12
export const XP_WRONG = 3
export const COINS_PER_CORRECT = 2

/** XP awarded for an answer, with a small streak bonus for consecutive correct ones. */
export function xpForAnswer(correct: boolean, streak: number): number {
  if (!correct) return XP_WRONG
  const bonus = Math.min(Math.max(streak - 1, 0), 5) * 3 // up to +15 at a streak of 6
  return XP_CORRECT + bonus
}

/** XP needed to advance from `level` to the next level (grows each level). */
export function xpToNext(level: number): number {
  return 40 + (level - 1) * 25
}

export interface LevelInfo {
  level: number
  intoLevel: number
  needed: number
  progress: number
}

/** Convert a total accumulated XP into a level + progress toward the next. */
export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1
  let rem = Math.max(0, totalXp)
  while (rem >= xpToNext(level)) {
    rem -= xpToNext(level)
    level++
  }
  const needed = xpToNext(level)
  return { level, intoLevel: rem, needed, progress: needed === 0 ? 0 : rem / needed }
}

/** Coins granted when reaching a new level. */
export function coinsForLevelUp(level: number): number {
  return 15 + level * 3
}

// ---- Worksheet (homework) scoring ----

export const WORKSHEET_PASS = 0.8
export const SAT_BONUS_XP = 15
export const SAT_CONSOLATION_XP = 7

/** Stars / tier for a worksheet percent: 0 = fail, 1 = 80s, 2 = 90s, 3 = full marks. */
export function scoreBand(percent: number): 0 | 1 | 2 | 3 {
  if (percent >= 1) return 3
  if (percent >= 0.9) return 2
  if (percent >= 0.8) return 1
  return 0
}

/** XP for a worksheet by score band (0 below 80%, +20 bonus at full marks). */
export function worksheetXp(percent: number): number {
  if (percent >= 1) return 60 // 40 + 20 bonus
  if (percent >= 0.9) return 40
  if (percent >= 0.8) return 25
  return 0
}

/** Coins for a worksheet by score band. */
export function worksheetCoins(percent: number): number {
  if (percent >= 1) return 15
  if (percent >= 0.9) return 10
  if (percent >= 0.8) return 5
  return 0
}
