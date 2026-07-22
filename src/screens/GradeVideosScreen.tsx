import { useUiStore } from '@/store/useUiStore'
import { ScreenHeader } from '@/components/ScreenHeader'
import { GRADES, getCurriculum } from '@/lib/curriculum'

/** Picker to re-watch any grade's intro video on demand (plays in IntroVideoOverlay). */
export function GradeVideosScreen() {
  const back = useUiStore((s) => s.back)
  const setReviewVideoGrade = useUiStore((s) => s.setReviewVideoGrade)

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-sky-500 to-indigo-700 p-5">
      <ScreenHeader title="Grade Videos" onBack={back} />
      <p className="mb-5 font-semibold text-white/80">Watch any grade's intro video.</p>

      <div className="mx-auto grid w-full max-w-4xl gap-4 grid-cols-[repeat(auto-fit,minmax(130px,1fr))]">
        {GRADES.map((g) => {
          const c = getCurriculum(g)
          return (
            <button
              key={g}
              onClick={() => setReviewVideoGrade(g)}
              className="flex flex-col items-center gap-1 rounded-3xl bg-white py-6 shadow-lg transition active:scale-95"
            >
              <span className="text-5xl">{c.emoji}</span>
              <span className="font-display text-xl font-black text-slate-800">
                {g === 'K' ? 'K' : `Grade ${g}`}
              </span>
              <span className="text-xs font-semibold text-slate-500">{c.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
