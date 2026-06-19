import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, Pencil, Printer, Timer } from 'lucide-react'
import type { AnswerValue, Problem, SatProblem, TopicId } from '@/types'
import { useUiStore } from '@/store/useUiStore'
import { usePlayerStore, type WorksheetResult } from '@/store/usePlayerStore'
import { generateWorksheet } from '@/lib/problems'
import { checkAnswer } from '@/lib/answer'
import { explainProblem } from '@/lib/explain'
import { satQuestion, satRequired } from '@/lib/sat'
import { bigCelebrate, celebrate, playCorrect, playLevelUp, playWrong } from '@/lib/fx'
import { WorksheetRow } from '@/components/worksheet/WorksheetRow'
import { GuidedPractice } from '@/components/worksheet/GuidedPractice'
import { SatChallenge } from '@/components/worksheet/SatChallenge'
import { PrintableWorksheet } from '@/components/worksheet/PrintableWorksheet'
import { TeacherScoreEntry } from '@/components/worksheet/TeacherScoreEntry'
import { SignatureStep } from '@/components/worksheet/SignatureStep'
import { VisualExplainer } from '@/components/explain/VisualExplainer'
import { LevelUpModal } from '@/components/LevelUpModal'
import { CoinPill, XpBar } from '@/components/Hud'

type Phase = 'guided' | 'intro' | 'work' | 'graded' | 'sat' | 'sign'

interface GradedInfo {
  correct: number
  total: number
  gradedBy: 'auto' | 'teacher'
}

export function WorksheetScreen() {
  const session = useUiStore((s) => s.session)
  const endSession = useUiStore((s) => s.endSession)
  const gradeWorksheet = usePlayerStore((s) => s.gradeWorksheet)
  const recordSat = usePlayerStore((s) => s.recordSat)
  const recordSheet = usePlayerStore((s) => s.recordSheet)
  const completeSummerLesson = usePlayerStore((s) => s.completeSummerLesson)
  const playerGrade = usePlayerStore((s) => s.grade)
  const settings = usePlayerStore((s) => s.settings)
  const xp = usePlayerStore((s) => s.xp)
  const coins = usePlayerStore((s) => s.coins)

  const grade = session?.grade ?? playerGrade
  const teacherGrading = settings.teacherGrading

  const problems = useMemo<Problem[]>(
    () => (session ? generateWorksheet(session.topics, session.difficulty, session.count, session.isReview) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const satForPrint = useMemo<SatProblem | null>(
    () => (grade ? satQuestion(grade) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [phase, setPhase] = useState<Phase>(session?.guided && !teacherGrading ? 'guided' : 'intro')
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({})
  const [hintUsed, setHintUsed] = useState(false)
  const [hintRow, setHintRow] = useState<number | null>(null)
  const [result, setResult] = useState<WorksheetResult | null>(null)
  const [gradedInfo, setGradedInfo] = useState<GradedInfo | null>(null)
  const [explainTarget, setExplainTarget] = useState<Problem | null>(null)
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null)
  const [satProblem, setSatProblem] = useState<SatProblem | null>(null)
  const [showTeacherScore, setShowTeacherScore] = useState(false)
  const [timeLeft, setTimeLeft] = useState(session?.timeLimit ?? 90)

  const answeredCount = problems.filter((_, i) => answers[i] !== undefined && answers[i] !== '').length
  const allAnswered = answeredCount === problems.length

  // Time Attack countdown
  useEffect(() => {
    if (!session?.timed || phase !== 'work') return
    if (timeLeft <= 0) {
      doGrade()
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.timed, phase, timeLeft])

  if (!session) return null

  const sound = settings.sound
  const topic: TopicId = (session.topic ?? problems[0]?.topic) as TopicId

  const doGrade = (correctOverride?: number) => {
    const autoCorrect = problems.reduce((n, p, i) => n + (checkAnswer(p, answers[i] ?? null) ? 1 : 0), 0)
    const correct = correctOverride ?? autoCorrect
    const gradedBy: 'auto' | 'teacher' = correctOverride != null ? 'teacher' : 'auto'
    setGradedInfo({ correct, total: problems.length, gradedBy })
    const res = gradeWorksheet({ subLevelId: session.subLevelId, topic, title: session.title, correct, total: problems.length })
    setResult(res)
    setPhase('graded')
    if (res.band >= 1) {
      if (sound) playCorrect()
      celebrate()
    } else if (sound) {
      playWrong()
    }
    if (res.leveledUp) {
      setTimeout(() => {
        if (sound) playLevelUp()
        bigCelebrate()
        setLevelUpLevel(res.newLevel)
      }, 500)
    }
  }

  const finalize = (signature: string | null) => {
    if (gradedInfo && result) {
      recordSheet({
        title: session.title,
        topic,
        correct: gradedInfo.correct,
        total: gradedInfo.total,
        percent: result.percent,
        gradedBy: gradedInfo.gradedBy,
        signature,
      })
    }
    if (session.mode === 'summer' && session.lessonId) {
      completeSummerLesson(session.lessonId, session.summerNextIndex ?? 0)
    }
    endSession()
  }

  const afterGraded = () => {
    if (settings.requireSignature) setPhase('sign')
    else finalize(null)
  }

  const onContinueFromGraded = () => {
    const eligible = result !== null && result.percent >= 0.9 && grade !== null && satRequired(grade, settings.satForYoungKids)
    if (eligible && grade) {
      setSatProblem(satQuestion(grade))
      setPhase('sat')
    } else {
      afterGraded()
    }
  }

  const onSatFinish = (solved: boolean) => {
    const res = recordSat(solved)
    if (res.leveledUp) {
      bigCelebrate()
      if (sound) playLevelUp()
    }
    afterGraded()
  }

  const printArea = (
    <div id="print-area">
      <PrintableWorksheet title={session.title} problems={problems} sat={satForPrint} />
    </div>
  )

  // ---------- GUIDED PRACTICE ----------
  if (phase === 'guided') {
    return (
      <GuidedPractice
        topics={session.topics}
        difficulty={session.difficulty}
        title={session.title}
        onExit={endSession}
        onDone={() => setPhase('intro')}
      />
    )
  }

  // ---------- INTRO ----------
  if (phase === 'intro') {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-indigo-500 p-6">
        {printArea}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl"
        >
          <div className="text-6xl">✏️</div>
          <h2 className="font-display mt-3 text-2xl font-black text-slate-800">{session.title}</h2>
          <p className="mt-3 font-semibold text-slate-500">
            Grab a <b className="text-slate-700">pencil and paper</b>! Work out all{' '}
            <b className="text-slate-700">{problems.length}</b> problems
            {teacherGrading ? ' — your teacher will enter the score.' : ', then type your answers here and press '}
            {!teacherGrading && <b className="text-slate-700">Grade</b>}
            {!teacherGrading && '.'}
          </p>
          {session.timed && (
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-600">
              <Timer size={16} /> {session.timeLimit}s on the clock!
            </div>
          )}
          {!teacherGrading && (
            <p className="mt-2 text-xs font-semibold text-slate-400">You get just one hint, so do your best on your own.</p>
          )}
          <button
            onClick={() => window.print()}
            className="mx-auto mt-4 flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 active:scale-95"
          >
            <Printer size={16} /> Print worksheet
          </button>
          <div className="mt-4 flex gap-3">
            <button
              onClick={endSession}
              className="font-display flex-1 rounded-2xl bg-slate-100 py-3 font-extrabold text-slate-500 active:scale-95"
            >
              Back
            </button>
            <button
              onClick={() => setPhase('work')}
              className="font-display flex-[2] rounded-2xl bg-indigo-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95"
            >
              Start worksheet
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const graded = phase === 'graded' || phase === 'sat' || phase === 'sign'
  const showQuestions = phase === 'work' || (graded && gradedInfo?.gradedBy === 'auto')

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-sky-400 to-indigo-500 p-4">
      {printArea}
      {/* HUD */}
      <div className="mx-auto mb-3 flex w-full max-w-2xl items-center gap-3">
        <button
          onClick={endSession}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur active:scale-95"
        >
          <Home size={20} />
        </button>
        <div className="flex-1">
          <XpBar xp={xp} />
        </div>
        {phase === 'work' && (
          <button
            onClick={() => window.print()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur active:scale-95"
          >
            <Printer size={18} />
          </button>
        )}
        <CoinPill coins={coins} />
      </div>

      <div className="mx-auto mb-3 flex w-full max-w-2xl items-center justify-between">
        <div className="font-display font-black text-white drop-shadow">{session.title}</div>
        {session.timed && phase === 'work' ? (
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold text-white ${
              timeLeft <= 15 ? 'bg-rose-500' : 'bg-white/20'
            }`}
          >
            <Timer size={16} /> {timeLeft}s
          </span>
        ) : (
          phase === 'work' &&
          !teacherGrading && (
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold text-white">
              {answeredCount}/{problems.length}
            </span>
          )
        )}
      </div>

      {/* Graded score header */}
      {graded && result && <ScoreHeader result={result} total={gradedInfo?.total ?? problems.length} />}
      {graded && gradedInfo?.gradedBy === 'teacher' && (
        <div className="mx-auto mb-4 w-full max-w-2xl rounded-2xl bg-white/15 p-3 text-center font-bold text-white backdrop-blur">
          ✏️ Graded by your teacher
        </div>
      )}

      {/* Teacher-grading note in work phase */}
      {phase === 'work' && teacherGrading && (
        <div className="mx-auto mb-3 w-full max-w-2xl rounded-2xl bg-white/15 p-3 text-center text-sm font-bold text-white backdrop-blur">
          Students answer on the printed sheet. Tap Print, then enter the score when they're done.
        </div>
      )}

      {/* Questions */}
      {showQuestions && (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2.5">
          {problems.map((p, i) => (
            <WorksheetRow
              key={p.id}
              index={i}
              problem={p}
              value={answers[i] ?? null}
              onChange={(v) => setAnswers((a) => ({ ...a, [i]: v }))}
              graded={graded}
              canHint={!hintUsed}
              hintShown={hintRow === i}
              onHint={() => {
                if (hintUsed) return
                setHintUsed(true)
                setHintRow(i)
              }}
              onExplain={() => setExplainTarget(p)}
            />
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="mx-auto mt-4 w-full max-w-2xl pb-6">
        {phase === 'work' &&
          (teacherGrading ? (
            <button
              onClick={() => setShowTeacherScore(true)}
              className="font-display w-full rounded-2xl bg-emerald-500 py-4 text-xl font-black text-white shadow-lg transition active:scale-95"
            >
              Enter score &amp; grade ✓
            </button>
          ) : (
            <>
              {!allAnswered && !session.timed && (
                <div className="mb-2 rounded-xl bg-white/20 px-3 py-2 text-center text-sm font-bold text-white">
                  Finish all {problems.length} questions first — {problems.length - answeredCount} to go.
                </div>
              )}
              <button
                onClick={() => {
                  if (allAnswered || session.timed) doGrade()
                }}
                disabled={!allAnswered && !session.timed}
                className={`font-display w-full rounded-2xl py-4 text-xl font-black shadow-lg transition active:scale-95 ${
                  allAnswered || session.timed ? 'bg-emerald-500 text-white' : 'bg-white/40 text-white/70'
                }`}
              >
                {session.timed ? 'Grade now ✓' : 'Grade ✓'}
              </button>
            </>
          ))}

        {phase === 'graded' && (
          <button
            onClick={onContinueFromGraded}
            className="font-display w-full rounded-2xl bg-indigo-500 py-4 text-xl font-black text-white shadow-lg active:scale-95"
          >
            Continue →
          </button>
        )}
      </div>

      {/* Teacher score modal */}
      <AnimatePresence>
        {showTeacherScore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-5"
          >
            <TeacherScoreEntry
              total={problems.length}
              onCancel={() => setShowTeacherScore(false)}
              onSubmit={(c) => {
                setShowTeacherScore(false)
                doGrade(c)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signature step */}
      <AnimatePresence>
        {phase === 'sign' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-5"
          >
            <SignatureStep onSign={(name) => finalize(name)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAT modal */}
      <AnimatePresence>
        {phase === 'sat' && satProblem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-5"
          >
            <SatChallenge problem={satProblem} onFinish={onSatFinish} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explain modal */}
      <AnimatePresence>
        {explainTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-5"
            onClick={() => setExplainTarget(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <VisualExplainer steps={explainProblem(explainTarget)} onDone={() => setExplainTarget(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {levelUpLevel !== null && <LevelUpModal level={levelUpLevel} onClose={() => setLevelUpLevel(null)} />}
    </div>
  )
}

function ScoreHeader({ result, total }: { result: WorksheetResult; total: number }) {
  const correct = Math.round(result.percent * total)
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="mx-auto mb-4 w-full max-w-2xl rounded-3xl bg-white p-5 text-center shadow-xl"
    >
      <div className="flex justify-center gap-1 text-3xl">
        {[0, 1, 2].map((i) => (
          <span key={i}>{i < result.band ? '⭐' : '☆'}</span>
        ))}
      </div>
      <div className="font-display mt-2 text-3xl font-black text-slate-800">
        {correct} / {total}
        <span className="ml-2 text-xl text-slate-400">({Math.round(result.percent * 100)}%)</span>
      </div>
      {result.xpGained > 0 ? (
        <div className="font-display mt-1 text-lg font-extrabold text-emerald-500">
          +{result.xpGained} XP{result.coinsGained > 0 ? ` · +${result.coinsGained} 🪙` : ''}
          {result.percent >= 1 && <span className="ml-1">· full marks bonus! 🎉</span>}
        </div>
      ) : (
        <div className="mt-1 text-sm font-bold text-rose-500">
          Below 80% — no XP yet. Added to “Needs more practice” so you can try again!
        </div>
      )}
    </motion.div>
  )
}
