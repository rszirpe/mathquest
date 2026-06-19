import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { GRADES, getCurriculum } from '@/lib/curriculum'

export function GradeSelectScreen() {
  const setGrade = usePlayerStore((s) => s.setGrade)
  const grade = usePlayerStore((s) => s.grade)
  const back = useUiStore((s) => s.back)

  return (
    <div className="flex min-h-full flex-col justify-center bg-gradient-to-b from-sky-400 to-indigo-500 p-6">
      <h1 className="font-display text-center text-3xl font-black text-white drop-shadow">Pick your grade</h1>
      <p className="mt-1 text-center font-semibold text-white/80">We'll match the math to you.</p>

      <div className="mx-auto mt-7 grid w-full max-w-4xl gap-4 grid-cols-[repeat(auto-fit,minmax(130px,1fr))]">
        {GRADES.map((g) => {
          const c = getCurriculum(g)
          const active = g === grade
          return (
            <button
              key={g}
              onClick={() => {
                setGrade(g)
                back()
              }}
              className={`flex flex-col items-center gap-1 rounded-3xl py-6 shadow-lg transition active:scale-95 ${
                active ? 'bg-amber-400 ring-4 ring-white' : 'bg-white'
              }`}
            >
              <span className="text-5xl">{c.emoji}</span>
              <span className="font-display text-xl font-black text-slate-800">{g === 'K' ? 'K' : `Grade ${g}`}</span>
              <span className="text-xs font-semibold text-slate-500">{c.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
