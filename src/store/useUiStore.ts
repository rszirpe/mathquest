import { create } from 'zustand'
import type { GameMode, GradeLevel, TopicId } from '@/types'

export type Screen =
  | 'home'
  | 'grade'
  | 'mode'
  | 'adventure'
  | 'sublevel'
  | 'play'
  | 'summer'
  | 'shop'
  | 'stats'
  | 'settings'
  | 'challenges'
  | 'placement'
  | 'classwork'

export interface PlaySession {
  mode: GameMode
  title: string
  topics: TopicId[]
  difficulty: number
  /** Number of worksheet questions. */
  count: number
  /** Time Attack: countdown that auto-grades at 0. */
  timed?: boolean
  timeLimit?: number
  /** Review sheet mixes difficulty across the topic. */
  isReview?: boolean
  /** Run a 10-problem guided practice (with help) before the worksheet. */
  guided?: boolean
  /** Sub-level id, for recording progress on completion. */
  subLevelId?: string
  /** The world topic (for the SAT gate + progress). */
  topic?: TopicId
  /** Grade, for SAT gating. */
  grade?: GradeLevel
  /** Summer Break lesson id, marked complete when the session finishes. */
  lessonId?: string
  summerNextIndex?: number
  /** Where to return after the session ends. */
  returnTo: Screen
}

interface UiState {
  screen: Screen
  history: Screen[]
  session: PlaySession | null
  /** The topic "world" currently open in the sub-level screen. */
  selectedTopic: TopicId | null
  go: (screen: Screen) => void
  back: () => void
  openWorld: (topic: TopicId) => void
  startSession: (session: PlaySession) => void
  endSession: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  screen: 'home',
  history: [],
  session: null,
  selectedTopic: null,

  go: (screen) => set({ history: [...get().history, get().screen], screen }),

  back: () => {
    const history = [...get().history]
    const prev = history.pop() ?? 'home'
    set({ screen: prev, history })
  },

  openWorld: (topic) => set({ selectedTopic: topic, history: [...get().history, get().screen], screen: 'sublevel' }),

  startSession: (session) =>
    set({ history: [...get().history, get().screen], screen: 'play', session }),

  endSession: () => {
    const { session, history } = get()
    // Drop the entry startSession pushed so Back from the return screen works cleanly.
    const h = [...history]
    h.pop()
    set({ screen: session?.returnTo ?? 'home', session: null, history: h })
  },
}))
