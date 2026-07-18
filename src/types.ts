export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5'

export type TopicId =
  | 'counting'
  | 'compare'
  | 'shapes'
  | 'addition'
  | 'subtraction'
  | 'place-value'
  | 'word-problems'
  | 'multiplication'
  | 'division'
  | 'money'
  | 'time'
  | 'fractions'
  | 'rounding'
  | 'area-perimeter'
  | 'multi-digit-mult'
  | 'long-division'
  | 'fraction-add'
  | 'decimals'
  | 'factors'
  | 'decimal-ops'
  | 'fraction-mult'
  | 'order-of-operations'
  | 'volume'
  | 'coordinates'

export type Operator = '+' | '-' | '×' | '÷'

export type InputType = 'choice' | 'number'

export type AnswerValue = number | string

export interface Problem {
  id: string
  topic: TopicId
  prompt: string
  answer: AnswerValue
  choices?: AnswerValue[]
  inputType: InputType
  difficulty: number
  hint?: string
  /** Raw numbers behind the problem, used to drive the visual explainer. */
  operands?: number[]
  operator?: Operator
}

export type GameMode = 'adventure' | 'quickplay' | 'timeattack' | 'summer'

export type AvatarSlot = 'body' | 'face' | 'hat' | 'accessory' | 'background'

export interface AvatarConfig {
  body: string
  face: string
  hat: string | null
  accessory: string | null
  background: string
}

export interface ShopItem {
  id: string
  slot: AvatarSlot
  name: string
  cost: number
  /** The value written into AvatarConfig when equipped (hex color, emoji, or face key). */
  value: string
  requiredLevel?: number
}

export interface TopicStat {
  solved: number
  correct: number
}

export interface PlayerStats {
  totalSolved: number
  totalCorrect: number
  bestStreak: number
  byTopic: Partial<Record<TopicId, TopicStat>>
}

export interface SummerBreakState {
  active: boolean
  grade: GradeLevel | null
  currentIndex: number
  completedLessons: string[]
}

export interface SubLevel {
  id: string
  topic: TopicId
  index: number
  title: string
  isReview: boolean
  difficulty: number
}

export interface SubLevelProgress {
  best: number // best percent 0..1
  passed: boolean
}

export interface NeedsPracticeEntry {
  id: string
  topic: TopicId
  title: string
  score: number // percent 0..1
}

export interface Settings {
  satForYoungKids: boolean
  sound: boolean
  /** Teacher enters the final score by hand instead of the auto-grader. */
  teacherGrading: boolean
  /** A graded sheet must be signed by the teacher before it's finished. */
  requireSignature: boolean
  /** Unlocks the Premium tier (placement test + classwork help) on the home screen. */
  premiumEnabled: boolean
}

export interface SheetRecord {
  id: string
  /** epoch ms */
  date: number
  title: string
  topic: TopicId
  correct: number
  total: number
  /** 0..1 */
  percent: number
  gradedBy: 'auto' | 'teacher'
  signature: string | null
}

export interface SatProblem {
  prompt: string
  choices: AnswerValue[]
  answer: AnswerValue
}

export type ChallengeType = 'solve' | 'correct' | 'worksheets' | 'ace' | 'fullmarks' | 'levels'

export interface Challenge {
  id: string
  type: ChallengeType
  title: string
  emoji: string
  target: number
  /** Metric value snapshotted when the challenge was issued (progress = current − baseline). */
  baseline: number
  xp: number
}
