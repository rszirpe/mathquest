import { Lock, Star } from 'lucide-react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { ScreenHeader } from '@/components/ScreenHeader'
import { subLevelsForTopic, topicTitle } from '@/lib/curriculum'

export function SubLevelScreen() {
  const back = useUiStore((s) => s.back)
  const startSession = useUiStore((s) => s.startSession)
  const topic = useUiStore((s) => s.selectedTopic)
  const grade = usePlayerStore((s) => s.grade)
  const progress = usePlayerStore((s) => s.progress)

  if (!topic || !grade) return null
  const subs = subLevelsForTopic(grade, topic)

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-emerald-400 to-teal-600 p-5">
      <ScreenHeader title={topicTitle(topic)} onBack={back} />
      <p className="mx-auto mb-4 w-full max-w-3xl text-center font-semibold text-white/85">
        Work through each step. They get a little trickier as you go!
      </p>

      <div className="mx-auto grid w-full max-w-3xl gap-3 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
        {subs.map((sl, i) => {
          const prog = progress[sl.id]
          const unlocked = i === 0 || progress[subs[i - 1].id]?.passed
          const passed = prog?.passed
          const best = prog?.best ?? 0
          return (
            <button
              key={sl.id}
              disabled={!unlocked}
              onClick={() =>
                startSession({
                  mode: 'adventure',
                  title: `${topicTitle(topic)} · ${sl.title}`,
                  topics: [topic],
                  difficulty: sl.difficulty,
                  count: 20,
                  isReview: sl.isReview,
                  guided: !sl.isReview,
                  subLevelId: sl.id,
                  topic,
                  grade,
                  returnTo: 'sublevel',
                })
              }
              className={`flex flex-col items-center gap-2 rounded-3xl p-4 text-center shadow-lg transition ${
                !unlocked ? 'bg-white/40' : 'bg-white active:scale-95'
              } ${passed ? 'ring-2 ring-amber-300' : ''}`}
            >
              <div
                className={`font-display flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white ${
                  !unlocked ? 'bg-slate-300' : passed ? 'bg-amber-400' : sl.isReview ? 'bg-violet-500' : 'bg-emerald-500'
                }`}
              >
                {!unlocked ? <Lock size={20} /> : sl.isReview ? <Star size={22} fill="white" /> : i + 1}
              </div>
              <div className="font-display text-base font-black text-slate-800">{sl.title}</div>
              <div className="text-xs font-bold text-slate-400">
                {passed ? `Best ${Math.round(best * 100)}%` : unlocked ? '20 questions' : 'Locked'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
