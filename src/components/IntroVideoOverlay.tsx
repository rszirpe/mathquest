import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { getCurriculum, worldsForGrade } from '@/lib/curriculum'
import type { GradeLevel } from '@/types'

/** Per-grade orientation clip, played when a child opens a grade with zero progress. */
const INTRO_VIDEO_BY_GRADE: Record<GradeLevel, string> = {
  K: 'Building_a_Math_Foundation_Kindergarden.mp4',
  '1': 'CA_First-Grade_Math_Framework.mp4',
  '2': 'Illusion_of_Mastery_in_Math_second_grade.mp4',
  '3': '3rd_Grade_CA_CCSSM_Explained.mp4',
  '4': '4th_Grade_Math_Blueprint.mp4',
  '5': 'CA_5th-Grade_Math_Curriculum.mp4',
}

/**
 * Shows a grade's intro video over the Home screen when the child has zero progress on that grade.
 * Replays on every zero-progress visit (dismissal is transient); it stops for good once any
 * worksheet for the grade is graded, which adds a `progress` entry.
 */
export function IntroVideoOverlay() {
  const grade = usePlayerStore((s) => s.grade)
  const progress = usePlayerStore((s) => s.progress)
  const screen = useUiStore((s) => s.screen)
  const [dismissed, setDismissed] = useState<GradeLevel | null>(null)

  // Re-arm the video whenever the selected grade changes.
  useEffect(() => {
    setDismissed(null)
  }, [grade])

  const zeroProgress = useMemo(
    () => (grade ? !worldsForGrade(grade).some((w) => w.subLevels.some((sl) => progress[sl.id])) : false),
    [grade, progress],
  )

  // Gate to Home so the overlay never covers the grade picker, mode select, or a worksheet.
  if (!grade || screen !== 'home' || !zeroProgress || dismissed === grade) return null

  const c = getCurriculum(grade)
  const src = `${import.meta.env.BASE_URL}videos/${INTRO_VIDEO_BY_GRADE[grade]}`

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="flex w-full max-w-2xl flex-col items-center"
      >
        <div className="font-display mb-3 text-center text-2xl font-black text-white drop-shadow">
          <span className="mr-2">{c.emoji}</span>
          {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`} — Let's get started!
        </div>
        <video
          key={src}
          src={src}
          controls
          autoPlay
          playsInline
          className="max-h-[70vh] w-full rounded-2xl bg-black shadow-2xl"
        />
        <button
          onClick={() => setDismissed(grade)}
          className="font-display mt-5 rounded-2xl bg-white px-8 py-3 text-lg font-extrabold text-indigo-600 shadow-lg transition active:scale-95"
        >
          Continue →
        </button>
      </motion.div>
    </div>
  )
}
