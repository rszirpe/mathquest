import { useState } from 'react'
import type { ReactNode } from 'react'
import { Map, Sun, Timer, Zap } from 'lucide-react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { ScreenHeader } from '@/components/ScreenHeader'
import { difficultyForGrade, topicsForGrade } from '@/lib/curriculum'

export function ModeSelectScreen() {
  const go = useUiStore((s) => s.go)
  const back = useUiStore((s) => s.back)
  const startSession = useUiStore((s) => s.startSession)
  const grade = usePlayerStore((s) => s.grade)
  const [picking, setPicking] = useState(false)

  if (!grade) return null
  const difficulty = difficultyForGrade(grade)
  const topics = topicsForGrade(grade)

  if (picking) {
    return (
      <div className="flex min-h-full flex-col bg-gradient-to-b from-cyan-400 to-blue-600 p-5">
        <ScreenHeader title="Quick Play — pick a topic" onBack={() => setPicking(false)} />
        <div className="mx-auto my-auto grid w-full max-w-4xl gap-3 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() =>
                startSession({
                  mode: 'quickplay',
                  topics: [t.id],
                  difficulty,
                  count: 20,
                  topic: t.id,
                  grade,
                  returnTo: 'mode',
                  title: t.title,
                })
              }
              className="font-display rounded-2xl bg-white py-5 text-lg font-extrabold text-slate-700 shadow-lg transition active:scale-95"
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-cyan-400 to-blue-600 p-5">
      <ScreenHeader title="Choose a mode" onBack={back} />
      <div className="mx-auto my-auto grid w-full max-w-5xl gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        <ModeCard
          icon={<Map size={30} />}
          title="Adventure"
          desc="Climb the level path and unlock new challenges."
          color="from-emerald-400 to-green-600"
          onClick={() => go('adventure')}
        />
        <ModeCard
          icon={<Zap size={30} />}
          title="Quick Play"
          desc="Endless practice on a topic you pick."
          color="from-amber-400 to-orange-500"
          onClick={() => setPicking(true)}
        />
        <ModeCard
          icon={<Timer size={30} />}
          title="Time Attack"
          desc="Solve as many as you can in 60 seconds!"
          color="from-rose-400 to-pink-600"
          onClick={() =>
            startSession({
              mode: 'timeattack',
              topics: topics.map((t) => t.id),
              difficulty,
              count: 20,
              timed: true,
              timeLimit: 120,
              grade,
              returnTo: 'mode',
              title: 'Time Attack',
            })
          }
        />
        <ModeCard
          icon={<Sun size={30} />}
          title="Summer Break"
          desc="Learn the whole next year, lesson by lesson."
          color="from-sky-400 to-indigo-500"
          onClick={() => go('summer')}
        />
      </div>
    </div>
  )
}

function ModeCard({
  icon,
  title,
  desc,
  color,
  onClick,
}: {
  icon: ReactNode
  title: string
  desc: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 rounded-3xl bg-gradient-to-r ${color} p-5 text-left text-white shadow-xl transition active:scale-95`}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/25">{icon}</div>
      <div>
        <div className="font-display text-xl font-black">{title}</div>
        <div className="text-sm font-semibold text-white/85">{desc}</div>
      </div>
    </button>
  )
}
