import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { ScreenHeader } from '@/components/ScreenHeader'
import { worldsForGrade } from '@/lib/curriculum'

export function AdventureMapScreen() {
  const back = useUiStore((s) => s.back)
  const openWorld = useUiStore((s) => s.openWorld)
  const grade = usePlayerStore((s) => s.grade)
  const progress = usePlayerStore((s) => s.progress)

  if (!grade) return null
  const worlds = worldsForGrade(grade)

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-emerald-400 to-green-600 p-5">
      <ScreenHeader title="Adventure" onBack={back} />
      <p className="mx-auto mb-4 w-full max-w-5xl text-center font-semibold text-white/85">
        Pick a topic world. Each one has 7 steps that build up little by little.
      </p>

      <div className="mx-auto grid w-full max-w-5xl gap-3 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        {worlds.map((w) => {
          const passed = w.subLevels.filter((sl) => progress[sl.id]?.passed).length
          const total = w.subLevels.length
          const pct = Math.round((passed / total) * 100)
          const done = passed === total
          return (
            <button
              key={w.topic}
              onClick={() => openWorld(w.topic)}
              className={`flex items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-lg transition active:scale-95 ${
                done ? 'ring-2 ring-amber-300' : ''
              }`}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
                {w.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg font-black text-slate-800">{w.title}</div>
                <div className="text-xs font-semibold text-slate-400">
                  {done ? '🏆 All steps done!' : `${passed} / ${total} steps`}
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
