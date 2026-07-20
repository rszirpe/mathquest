import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AvatarConfig,
  Challenge,
  GradeLevel,
  NeedsPracticeEntry,
  PlayerStats,
  Problem,
  RedoFlag,
  Settings,
  SheetRecord,
  ShopItem,
  SubLevelProgress,
  SummerBreakState,
  TopicId,
} from '@/types'
import { challengeProgress, initialChallenges, makeChallenge, type ChallengeSnapshot } from '@/lib/challenges'
import { subLevelForDifficulty, subLevelsForTopic, topicTitle } from '@/lib/curriculum'
import type { PlacementResult } from '@/lib/ai'
import {
  coinsForLevelUp,
  levelFromXp,
  xpForAnswer,
  COINS_PER_CORRECT,
  scoreBand,
  satStarsForScore,
  worksheetCoins,
  worksheetXp,
  WORKSHEET_PASS,
  SAT_BONUS_XP,
  SAT_CONSOLATION_XP,
} from '@/lib/progression'
import { DEFAULT_AVATAR, DEFAULT_OWNED } from '@/lib/shop'

export interface SubmitResult {
  correct: boolean
  xpGained: number
  coinsGained: number
  leveledUp: boolean
  newLevel: number
  streak: number
}

export interface WorksheetResult {
  percent: number
  band: 0 | 1 | 2 | 3
  passed: boolean
  xpGained: number
  coinsGained: number
  leveledUp: boolean
  newLevel: number
}

export interface SatResult {
  xpGained: number
  leveledUp: boolean
  newLevel: number
  solved: boolean
}

export interface ClaimResult {
  xpGained: number
  leveledUp: boolean
  newLevel: number
}

export interface SatStarTestResult {
  percent: number
  correct: number
  total: number
  starsEarned: number
  newRedoFlags: RedoFlag[]
}

export interface PurchaseResult {
  ok: boolean
  message: string
}

function challengeSnapshot(state: { stats: PlayerStats; history: SheetRecord[]; progress: Record<string, SubLevelProgress> }): ChallengeSnapshot {
  return {
    totalSolved: state.stats.totalSolved,
    totalCorrect: state.stats.totalCorrect,
    worksheets: state.history.length,
    aces: state.history.filter((h) => h.percent >= 0.9).length,
    fullMarks: state.history.filter((h) => h.percent >= 1).length,
    passedLevels: Object.values(state.progress).filter((p) => p.passed).length,
  }
}

interface PlayerState {
  grade: GradeLevel | null
  xp: number
  coins: number
  streak: number
  ownedItems: string[]
  avatar: AvatarConfig
  stats: PlayerStats
  summer: SummerBreakState
  /** nodeId -> stars earned (1-3) — legacy, kept for save compatibility */
  adventure: Record<string, number>
  /** subLevelId -> best score + passed flag */
  progress: Record<string, SubLevelProgress>
  needsPractice: NeedsPracticeEntry[]
  settings: Settings
  /** Full log of every worksheet graded, newest first. */
  history: SheetRecord[]
  /** Active XP challenges. */
  challenges: Challenge[]
  /** Result of the last Premium-tier placement test, if any. */
  placement: PlacementResult | null
  /** SAT Stars — earned by solving problems (same rate as coins) or purchased, spent on SAT Star Tests. */
  satStars: number
  /** Sub-levels flagged for a redo after a missed SAT Star Test question. */
  redoLevels: RedoFlag[]

  setGrade: (grade: GradeLevel) => void
  recordSheet: (record: Omit<SheetRecord, 'id' | 'date'>) => void
  ensureChallenges: () => void
  claimChallenge: (id: string) => ClaimResult | null
  submitAnswer: (problem: Problem, correct: boolean) => SubmitResult
  gradeWorksheet: (args: {
    subLevelId?: string
    topic: TopicId
    title: string
    correct: number
    total: number
  }) => WorksheetResult
  recordSat: (solved: boolean) => SatResult
  updateSettings: (partial: Partial<Settings>) => void
  buyItem: (item: ShopItem) => boolean
  equipItem: (item: ShopItem) => void
  setAdventureStars: (nodeId: string, stars: number) => void
  startSummer: (grade: GradeLevel) => void
  completeSummerLesson: (lessonId: string, nextIndex: number) => void
  applyPlacementResult: (result: PlacementResult) => void
  spendSatStars: (amount: number) => boolean
  recordSatStarTest: (args: { grade: GradeLevel; results: { problem: Problem; correct: boolean }[] }) => SatStarTestResult
  purchaseSatStarPack: (packId: string) => PurchaseResult
  resetProgress: () => void
}

const initialSettings: Settings = {
  satForYoungKids: false,
  sound: true,
  teacherGrading: false,
  requireSignature: true,
  premiumEnabled: false,
}

const initialStats: PlayerStats = {
  totalSolved: 0,
  totalCorrect: 0,
  bestStreak: 0,
  byTopic: {},
}

const initialSummer: SummerBreakState = {
  active: false,
  grade: null,
  currentIndex: 0,
  completedLessons: [],
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      grade: null,
      xp: 0,
      coins: 0,
      streak: 0,
      ownedItems: [...DEFAULT_OWNED],
      avatar: { ...DEFAULT_AVATAR },
      stats: initialStats,
      summer: initialSummer,
      adventure: {},
      progress: {},
      needsPractice: [],
      settings: initialSettings,
      history: [],
      challenges: [],
      placement: null,
      satStars: 0,
      redoLevels: [],

      setGrade: (grade) => set({ grade }),

      recordSheet: (record) => {
        const entry: SheetRecord = { ...record, id: Math.random().toString(36).slice(2, 10), date: Date.now() }
        set({ history: [entry, ...get().history].slice(0, 200) })
      },

      ensureChallenges: () => {
        if (get().challenges.length === 0) {
          set({ challenges: initialChallenges(challengeSnapshot(get())) })
        }
      },

      claimChallenge: (id) => {
        const state = get()
        const ch = state.challenges.find((c) => c.id === id)
        if (!ch) return null
        const snap = challengeSnapshot(state)
        if (!challengeProgress(ch, snap).done) return null

        const prevLevel = levelFromXp(state.xp).level
        const newXp = state.xp + ch.xp
        const after = levelFromXp(newXp)
        const leveledUp = after.level > prevLevel
        const coinsGained = leveledUp ? coinsForLevelUp(after.level) : 0

        const remaining = state.challenges.filter((c) => c.id !== id)
        const replacement = makeChallenge(snap, remaining.map((c) => c.type))
        set({ xp: newXp, coins: state.coins + coinsGained, challenges: [...remaining, replacement] })
        return { xpGained: ch.xp, leveledUp, newLevel: after.level }
      },

      submitAnswer: (problem, correct) => {
        const state = get()
        const prevLevel = levelFromXp(state.xp).level
        const newStreak = correct ? state.streak + 1 : 0
        const xpGained = xpForAnswer(correct, newStreak)
        const newXp = state.xp + xpGained
        const after = levelFromXp(newXp)
        const leveledUp = after.level > prevLevel
        const coinsGained = (correct ? COINS_PER_CORRECT : 0) + (leveledUp ? coinsForLevelUp(after.level) : 0)
        const satStarsGained = correct ? COINS_PER_CORRECT : 0

        const prevTopic = state.stats.byTopic[problem.topic] ?? { solved: 0, correct: 0 }
        const newStats: PlayerStats = {
          totalSolved: state.stats.totalSolved + 1,
          totalCorrect: state.stats.totalCorrect + (correct ? 1 : 0),
          bestStreak: Math.max(state.stats.bestStreak, newStreak),
          byTopic: {
            ...state.stats.byTopic,
            [problem.topic]: {
              solved: prevTopic.solved + 1,
              correct: prevTopic.correct + (correct ? 1 : 0),
            },
          },
        }

        set({
          xp: newXp,
          coins: state.coins + coinsGained,
          satStars: state.satStars + satStarsGained,
          streak: newStreak,
          stats: newStats,
        })

        return { correct, xpGained, coinsGained, leveledUp, newLevel: after.level, streak: newStreak }
      },

      gradeWorksheet: ({ subLevelId, topic, title, correct, total }) => {
        const state = get()
        const percent = total > 0 ? correct / total : 0
        const band = scoreBand(percent)
        const passed = percent >= WORKSHEET_PASS
        const baseXp = worksheetXp(percent)
        const coinsBase = worksheetCoins(percent)

        const prevLevel = levelFromXp(state.xp).level
        const newXp = state.xp + baseXp
        const after = levelFromXp(newXp)
        const leveledUp = after.level > prevLevel
        const coinsGained = coinsBase + (leveledUp ? coinsForLevelUp(after.level) : 0)

        const prevTopic = state.stats.byTopic[topic] ?? { solved: 0, correct: 0 }
        const newStats: PlayerStats = {
          ...state.stats,
          totalSolved: state.stats.totalSolved + total,
          totalCorrect: state.stats.totalCorrect + correct,
          byTopic: {
            ...state.stats.byTopic,
            [topic]: { solved: prevTopic.solved + total, correct: prevTopic.correct + correct },
          },
        }

        const progress = { ...state.progress }
        let needsPractice = state.needsPractice
        let redoLevels = state.redoLevels
        if (subLevelId) {
          const prev = progress[subLevelId] ?? { best: 0, passed: false }
          progress[subLevelId] = { best: Math.max(prev.best, percent), passed: prev.passed || passed }
          if (passed) {
            needsPractice = needsPractice.filter((e) => e.id !== subLevelId)
            redoLevels = redoLevels.filter((f) => f.id !== subLevelId)
          } else {
            needsPractice = [...needsPractice.filter((e) => e.id !== subLevelId), { id: subLevelId, topic, title, score: percent }]
          }
        }

        set({
          xp: newXp,
          coins: state.coins + coinsGained,
          satStars: state.satStars + worksheetCoins(percent),
          stats: newStats,
          progress,
          needsPractice,
          redoLevels,
        })
        return { percent, band, passed, xpGained: baseXp, coinsGained, leveledUp, newLevel: after.level }
      },

      recordSat: (solved) => {
        const state = get()
        const gain = solved ? SAT_BONUS_XP : SAT_CONSOLATION_XP
        const prevLevel = levelFromXp(state.xp).level
        const newXp = state.xp + gain
        const after = levelFromXp(newXp)
        const leveledUp = after.level > prevLevel
        const coinsGained = leveledUp ? coinsForLevelUp(after.level) : 0
        set({ xp: newXp, coins: state.coins + coinsGained })
        return { xpGained: gain, leveledUp, newLevel: after.level, solved }
      },

      updateSettings: (partial) => set({ settings: { ...get().settings, ...partial } }),

      buyItem: (item) => {
        const state = get()
        if (state.ownedItems.includes(item.id)) return false
        if (state.coins < item.cost) return false
        const level = levelFromXp(state.xp).level
        if (item.requiredLevel && level < item.requiredLevel) return false
        set({
          coins: state.coins - item.cost,
          ownedItems: [...state.ownedItems, item.id],
        })
        return true
      },

      equipItem: (item) => {
        const state = get()
        if (!state.ownedItems.includes(item.id)) return
        const avatar = { ...state.avatar }
        if (item.slot === 'hat' || item.slot === 'accessory') {
          // Toggle off if the same item is already worn.
          avatar[item.slot] = avatar[item.slot] === item.value ? null : item.value
        } else {
          avatar[item.slot] = item.value
        }
        set({ avatar })
      },

      setAdventureStars: (nodeId, stars) => {
        const state = get()
        const prev = state.adventure[nodeId] ?? 0
        if (stars <= prev) return
        set({ adventure: { ...state.adventure, [nodeId]: stars } })
      },

      startSummer: (grade) => {
        const state = get()
        // Keep progress if resuming the same grade, otherwise start fresh.
        if (state.summer.grade === grade) {
          set({ summer: { ...state.summer, active: true } })
        } else {
          set({ summer: { active: true, grade, currentIndex: 0, completedLessons: [] } })
        }
      },

      completeSummerLesson: (lessonId, nextIndex) => {
        const state = get()
        const completed = state.summer.completedLessons.includes(lessonId)
          ? state.summer.completedLessons
          : [...state.summer.completedLessons, lessonId]
        set({
          summer: {
            ...state.summer,
            completedLessons: completed,
            currentIndex: Math.max(state.summer.currentIndex, nextIndex),
          },
        })
      },

      applyPlacementResult: (result) => {
        const state = get()
        const grade = state.grade
        if (!grade) {
          set({ placement: result })
          return
        }
        const progress = { ...state.progress }
        for (const [topic, difficulty] of Object.entries(result.suggestedDifficulty) as [TopicId, number][]) {
          const subLevels = subLevelsForTopic(grade, topic)
          // Seed everything below the suggested step as passed; never auto-pass the trailing Review level.
          const seedIndex = Math.max(0, Math.min(difficulty - 1, subLevels.length - 2))
          for (const sl of subLevels) {
            if (sl.index < seedIndex && !progress[sl.id]?.passed) {
              progress[sl.id] = { best: Math.max(progress[sl.id]?.best ?? 0, WORKSHEET_PASS + 0.05), passed: true }
            }
          }
        }
        set({ placement: result, progress })
      },

      spendSatStars: (amount) => {
        const state = get()
        if (state.satStars < amount) return false
        set({ satStars: state.satStars - amount })
        return true
      },

      recordSatStarTest: ({ grade, results }) => {
        const state = get()
        const total = results.length
        const correct = results.filter((r) => r.correct).length
        const percent = total > 0 ? correct / total : 0
        const starsEarned = satStarsForScore(percent)

        const redoLevels = [...state.redoLevels]
        const newRedoFlags: RedoFlag[] = []
        for (const r of results) {
          if (r.correct) continue
          const sl = subLevelForDifficulty(grade, r.problem.topic, r.problem.difficulty)
          if (redoLevels.some((f) => f.id === sl.id)) continue
          const flag: RedoFlag = { id: sl.id, topic: sl.topic, title: `${topicTitle(sl.topic)} · ${sl.title}`, flaggedAt: Date.now() }
          redoLevels.push(flag)
          newRedoFlags.push(flag)
        }

        set({ satStars: state.satStars + starsEarned, redoLevels })
        return { percent, correct, total, starsEarned, newRedoFlags }
      },

      purchaseSatStarPack: () => {
        // Stub — no payment processor wired yet. This is the seam for a future integration.
        return { ok: false, message: 'Payments are coming soon — this is just a preview of the store.' }
      },

      resetProgress: () =>
        set({
          grade: get().grade,
          xp: 0,
          coins: 0,
          streak: 0,
          ownedItems: [...DEFAULT_OWNED],
          avatar: { ...DEFAULT_AVATAR },
          stats: initialStats,
          summer: initialSummer,
          adventure: {},
          progress: {},
          needsPractice: [],
          history: [],
          challenges: [],
          placement: null,
          satStars: 0,
          redoLevels: [],
        }),
    }),
    {
      name: 'mathquest-save',
      version: 6,
      // Preserve existing saves (xp/coins/avatar) across model upgrades.
      migrate: (persisted: unknown) => {
        const p = (persisted ?? {}) as Record<string, unknown>
        return {
          ...p,
          progress: p.progress ?? {},
          needsPractice: p.needsPractice ?? [],
          history: p.history ?? [],
          challenges: p.challenges ?? [],
          settings: { ...initialSettings, ...((p.settings as object) ?? {}) },
          placement: p.placement ?? null,
          satStars: p.satStars ?? 0,
          redoLevels: p.redoLevels ?? [],
        }
      },
      partialize: (s) => ({
        grade: s.grade,
        xp: s.xp,
        coins: s.coins,
        streak: s.streak,
        ownedItems: s.ownedItems,
        avatar: s.avatar,
        stats: s.stats,
        summer: s.summer,
        adventure: s.adventure,
        progress: s.progress,
        needsPractice: s.needsPractice,
        settings: s.settings,
        history: s.history,
        challenges: s.challenges,
        placement: s.placement,
        satStars: s.satStars,
        redoLevels: s.redoLevels,
      }),
    },
  ),
)
