import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Lock, Play, Sun } from 'lucide-react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { ScreenHeader } from '@/components/ScreenHeader'
import { VisualExplainer } from '@/components/explain/VisualExplainer'
import { difficultyForGrade, getCurriculum } from '@/lib/curriculum'
import { generateProblem } from '@/lib/problems'
import { explainProblem, type ExplainStep } from '@/lib/explain'

export function SummerBreakScreen() {
  const back = useUiStore((s) => s.back)
  const startSession = useUiStore((s) => s.startSession)
  const grade = usePlayerStore((s) => s.grade)
  const summer = usePlayerStore((s) => s.summer)
  const startSummer = usePlayerStore((s) => s.startSummer)

  const [teach, setTeach] = useState<{ index: number; steps: ExplainStep[] } | null>(null)

  if (!grade) return null
  const cur = getCurriculum(grade)
  const lessons = cur.lessons
  const difficulty = difficultyForGrade(grade)

  const onThisGrade = summer.grade === grade
  const started = summer.active && onThisGrade
  const currentIndex = onThisGrade ? summer.currentIndex : 0
  const allDone = started && currentIndex >= lessons.length

  const openLessonCard = (i: number) => {
    const lesson = lessons[i]
    const sample = generateProblem(lesson.topic, difficulty)
    setTeach({
      index: i,
      steps: [{ text: lesson.teach, visual: { kind: 'none' } }, ...explainProblem(sample)],
    })
  }

  const startPractice = () => {
    if (!teach) return
    const i = teach.index
    const lesson = lessons[i]
    setTeach(null)
    startSession({
      mode: 'summer',
      topics: [lesson.topic],
      difficulty,
      count: 20,
      guided: true,
      topic: lesson.topic,
      grade,
      subLevelId: lesson.id,
      lessonId: lesson.id,
      summerNextIndex: i + 1,
      returnTo: 'summer',
      title: lesson.title,
    })
  }

  if (!started) {
    return (
      <div className="flex min-h-full flex-col bg-gradient-to-b from-sky-400 to-indigo-500 p-5">
        <ScreenHeader title="Summer Break" onBack={back} />
        <div className="mx-auto my-auto mt-6 flex w-full max-w-lg flex-col items-center rounded-3xl bg-white p-7 text-center shadow-2xl">
          <motion.div animate={{ rotate: [0, 12, -12, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="text-6xl">
            ☀️
          </motion.div>
          <h2 className="font-display mt-3 text-2xl font-black text-slate-800">Summer Break Mode</h2>
          <p className="mt-2 font-semibold text-slate-500">
            Just turn it on! We'll walk you through everything you'll learn next year — one lesson at a time, each with a
            picture demonstration before you practice.
          </p>
          <button
            onClick={() => startSummer(grade)}
            className="font-display mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 text-lg font-black text-white shadow-lg active:scale-95"
          >
            <Sun size={22} /> Start Summer Break
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-sky-400 to-indigo-500 p-5">
      <ScreenHeader title={`${cur.label} Prep`} onBack={back} />

      <div className="mx-auto mb-4 w-full max-w-5xl rounded-2xl bg-white/15 p-3 text-center font-bold text-white backdrop-blur">
        {allDone ? '🎉 You finished the whole year — amazing!' : `${currentIndex} of ${lessons.length} lessons done`}
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-3 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        {lessons.map((lesson, i) => {
          const done = i < currentIndex
          const isCurrent = i === currentIndex
          const locked = i > currentIndex
          return (
            <button
              key={lesson.id}
              disabled={locked}
              onClick={() => openLessonCard(i)}
              className={`flex items-center gap-4 rounded-3xl p-4 text-left shadow-lg transition ${
                locked ? 'bg-white/40' : 'bg-white active:scale-95'
              } ${isCurrent ? 'ring-4 ring-amber-300' : ''}`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${
                  done ? 'bg-emerald-500' : isCurrent ? 'bg-amber-400' : 'bg-slate-300'
                }`}
              >
                {done ? <Check size={22} /> : locked ? <Lock size={18} /> : <Play size={20} fill="white" />}
              </div>
              <div className="flex-1">
                <div className="font-display text-lg font-black text-slate-800">{lesson.title}</div>
                <div className="text-xs font-semibold text-slate-400">
                  {done ? 'Done — tap to review' : isCurrent ? 'Learn this next' : 'Locked'}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {teach && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-5"
            onClick={() => setTeach(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <VisualExplainer steps={teach.steps} onDone={startPractice} doneLabel="Start practice →" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
