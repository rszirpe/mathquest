import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HelpCircle, Home } from 'lucide-react'
import type { AnswerValue, Problem, TopicId } from '@/types'
import { usePlayerStore } from '@/store/usePlayerStore'
import { generateWorksheet } from '@/lib/problems'
import { checkAnswer } from '@/lib/answer'
import { explainProblem } from '@/lib/explain'
import { celebrate, playCorrect, playWrong } from '@/lib/fx'
import { VisualExplainer } from '@/components/explain/VisualExplainer'
import { CoinPill, XpBar } from '@/components/Hud'

const GUIDED_COUNT = 10

interface Props {
  topics: TopicId[]
  difficulty: number
  title: string
  onExit: () => void
  onDone: () => void
}

export function GuidedPractice({ topics, difficulty, title, onExit, onDone }: Props) {
  const xp = usePlayerStore((s) => s.xp)
  const coins = usePlayerStore((s) => s.coins)
  const sound = usePlayerStore((s) => s.settings.sound)

  const problems = useMemo<Problem[]>(
    () => generateWorksheet(topics, difficulty, GUIDED_COUNT),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [started, setStarted] = useState(false)
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<'answer' | 'feedback'>('answer')
  const [picked, setPicked] = useState<AnswerValue | null>(null)
  const [numberValue, setNumberValue] = useState('')
  const [explainOpen, setExplainOpen] = useState(false)

  const current = problems[idx]
  const isLast = idx === problems.length - 1
  const correct = phase === 'feedback' && checkAnswer(current, picked)

  const submit = (value: AnswerValue) => {
    if (phase !== 'answer') return
    setPicked(value)
    setPhase('feedback')
    if (checkAnswer(current, value)) {
      if (sound) playCorrect()
      celebrate()
    } else {
      if (sound) playWrong()
      setExplainOpen(true) // auto-offer help when wrong
    }
  }

  const next = () => {
    if (isLast) {
      onDone()
      return
    }
    setIdx((i) => i + 1)
    setPhase('answer')
    setPicked(null)
    setNumberValue('')
    setExplainOpen(false)
  }

  // ---- Intro ----
  if (!started) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-violet-400 to-indigo-600 p-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl"
        >
          <div className="text-6xl">👩‍🏫</div>
          <h2 className="font-display mt-3 text-2xl font-black text-slate-800">Let's learn together</h2>
          <p className="mt-3 font-semibold text-slate-500">
            First we'll do <b className="text-slate-700">{GUIDED_COUNT} practice problems together</b> — with all the help
            you want. Tap <b className="text-slate-700">"Show me how"</b> any time. Then you'll be ready for your worksheet!
          </p>
          <div className="mt-5 flex gap-3">
            <button onClick={onExit} className="font-display flex-1 rounded-2xl bg-slate-100 py-3 font-extrabold text-slate-500 active:scale-95">
              Back
            </button>
            <button
              onClick={() => setStarted(true)}
              className="font-display flex-[2] rounded-2xl bg-indigo-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95"
            >
              Let's go!
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-violet-400 to-indigo-600 p-4">
      {/* HUD */}
      <div className="mx-auto mb-3 flex w-full max-w-xl items-center gap-3">
        <button
          onClick={onExit}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur active:scale-95"
        >
          <Home size={20} />
        </button>
        <div className="flex-1">
          <XpBar xp={xp} />
        </div>
        <CoinPill coins={coins} />
      </div>

      <div className="mx-auto mb-3 flex w-full max-w-xl items-center justify-between font-display text-sm font-bold text-white/90">
        <span className="rounded-full bg-white/20 px-3 py-1">📚 {title}</span>
        <span className="rounded-full bg-white/20 px-3 py-1">Practice {idx + 1} / {problems.length}</span>
      </div>

      {/* Problem */}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
        <div className="rounded-3xl bg-white px-5 py-7 text-center shadow-xl">
          {current.prompt.split('\n').map((l, i) => (
            <div key={i} className={i === 0 ? 'font-display text-3xl font-extrabold break-words text-slate-800' : 'mt-2 text-2xl break-words text-slate-600'}>
              {l}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="mt-4">
          {current.inputType === 'choice' ? (
            <div className={`grid gap-3 ${(current.choices ?? []).length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {(current.choices ?? []).map((c, i) => {
                const isAns = String(c) === String(current.answer)
                const isSel = picked !== null && String(c) === String(picked)
                let cls = 'bg-white text-slate-700 hover:bg-indigo-50'
                if (phase === 'feedback') {
                  if (isAns) cls = 'bg-emerald-400 text-white ring-4 ring-emerald-200'
                  else if (isSel) cls = 'bg-rose-400 text-white'
                  else cls = 'bg-white/60 text-slate-400'
                }
                return (
                  <button
                    key={i}
                    disabled={phase === 'feedback'}
                    onClick={() => submit(c)}
                    className={`font-display rounded-2xl py-5 text-2xl font-extrabold shadow-md transition active:scale-95 ${cls}`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <input
                value={phase === 'feedback' ? String(picked ?? '') : numberValue}
                onChange={(e) => setNumberValue(e.target.value.replace(/[^0-9.]/g, '').slice(0, 7))}
                disabled={phase === 'feedback'}
                inputMode="decimal"
                placeholder="?"
                className={`font-display w-40 rounded-2xl border-2 px-4 py-3 text-center text-3xl font-extrabold outline-none ${
                  phase === 'feedback'
                    ? correct
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-rose-300 bg-rose-50 text-rose-700'
                    : 'border-white bg-white text-slate-800 focus:border-indigo-300'
                }`}
              />
              {phase === 'answer' && (
                <button
                  onClick={() => numberValue !== '' && submit(numberValue)}
                  disabled={numberValue === ''}
                  className="font-display w-40 rounded-2xl bg-indigo-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95 disabled:opacity-40"
                >
                  Check ✓
                </button>
              )}
            </div>
          )}
        </div>

        {phase === 'answer' && (
          <button
            onClick={() => setExplainOpen(true)}
            className="mx-auto mt-5 flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur active:scale-95"
          >
            <HelpCircle size={16} /> Show me how
          </button>
        )}
      </div>

      {/* Feedback */}
      <div className="mx-auto w-full max-w-xl">
        <AnimatePresence>
          {phase === 'feedback' && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`rounded-3xl p-4 shadow-xl ${correct ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl">{correct ? '🎉' : '💪'}</div>
                <div className="flex-1">
                  <div className="font-display text-xl font-extrabold">{correct ? 'You got it!' : 'Let me help'}</div>
                  <div className="text-sm font-semibold text-white/90">
                    {correct ? 'Nice — keep going!' : `The answer is ${current.answer}. Tap "Show me how" to see why.`}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setExplainOpen(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white/20 py-3 font-bold backdrop-blur active:scale-95"
                >
                  <HelpCircle size={18} /> Show me how
                </button>
                <button onClick={next} className="font-display flex-1 rounded-2xl bg-white py-3 text-lg font-extrabold text-slate-800 shadow active:scale-95">
                  {isLast ? 'Start worksheet →' : 'Next →'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Explain modal */}
      <AnimatePresence>
        {explainOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-5"
            onClick={() => setExplainOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <VisualExplainer steps={explainProblem(current)} onDone={() => setExplainOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
