import { useState } from 'react'
import type { AnswerValue, Problem, TopicId } from '@/types'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { difficultyForGrade, topicsForGrade } from '@/lib/curriculum'
import { ScreenHeader } from '@/components/ScreenHeader'
import { MasteryProblemView } from '@/components/mastery/MasteryProblemView'

/**
 * Premium tier: "help with my classwork". Typed entry only (no OCR/photo pipeline) — builds an
 * ad-hoc `Problem` and hands it straight to the same mastery-loop hook guided practice uses, so
 * there's no separate hint/check machinery to maintain.
 */
export function ClassworkHelpScreen() {
  const back = useUiStore((s) => s.back)
  const grade = usePlayerStore((s) => s.grade)
  const topics = grade ? topicsForGrade(grade) : []

  const [topic, setTopic] = useState<TopicId | null>(topics[0]?.id ?? null)
  const [promptText, setPromptText] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [problem, setProblem] = useState<Problem | null>(null)

  if (!grade) return null

  const start = () => {
    if (!topic || !promptText.trim() || !answerText.trim()) return
    const numericAnswer = Number(answerText)
    const answer: AnswerValue = Number.isNaN(numericAnswer) ? answerText.trim() : numericAnswer
    setProblem({
      id: `classwork-${Date.now()}`,
      topic,
      prompt: promptText.trim(),
      answer,
      inputType: 'number',
      difficulty: difficultyForGrade(grade),
    })
  }

  const reset = () => {
    setProblem(null)
    setPromptText('')
    setAnswerText('')
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-teal-500 to-emerald-600 p-5">
      <ScreenHeader title="Help With My Classwork" onBack={back} />

      {problem ? (
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-3">
          <MasteryProblemView key={problem.id} problem={problem} onDone={reset} />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <p className="mb-4 text-sm font-semibold text-slate-500">
            Type in a problem from your classwork — we'll help you work through it the same way as your practice.
          </p>

          <label className="mb-1 block text-xs font-bold text-slate-500">Topic</label>
          <select
            value={topic ?? ''}
            onChange={(e) => setTopic(e.target.value as TopicId)}
            className="mb-3 w-full rounded-xl border border-slate-200 p-2 font-semibold text-slate-700"
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          <label className="mb-1 block text-xs font-bold text-slate-500">The problem</label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={3}
            placeholder="e.g. 47 + 38 = ?"
            className="mb-3 w-full rounded-xl border border-slate-200 p-2 text-slate-700"
          />

          <label className="mb-1 block text-xs font-bold text-slate-500">The correct answer (from your answer key)</label>
          <input
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="e.g. 85"
            className="mb-4 w-full rounded-xl border border-slate-200 p-2 text-slate-700"
          />

          <button
            onClick={start}
            disabled={!topic || !promptText.trim() || !answerText.trim()}
            className="font-display w-full rounded-2xl bg-emerald-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95 disabled:opacity-40"
          >
            Get help →
          </button>
        </div>
      )}
    </div>
  )
}
