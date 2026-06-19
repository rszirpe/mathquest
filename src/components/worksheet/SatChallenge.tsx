import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { AnswerValue, SatProblem } from '@/types'

const START_ATTEMPTS = 3
const MAX_REQUESTS = 5

export function SatChallenge({ problem, onFinish }: { problem: SatProblem; onFinish: (solved: boolean) => void }) {
  const [attemptsLeft, setAttemptsLeft] = useState(START_ATTEMPTS)
  const [requestsUsed, setRequestsUsed] = useState(0)
  const [won, setWon] = useState(false)
  const [wrongPick, setWrongPick] = useState<string | null>(null)

  const outOfTries = !won && attemptsLeft <= 0

  const pick = (c: AnswerValue) => {
    if (won || outOfTries) return
    if (String(c) === String(problem.answer)) {
      setWon(true)
      return
    }
    setWrongPick(String(c))
    setAttemptsLeft((a) => a - 1)
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
      <div className="flex items-center gap-2 text-amber-500">
        <Sparkles size={22} />
        <span className="font-display text-xl font-black">SAT Bonus Challenge</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-500">Nail this brain-teaser for extra XP!</p>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-center font-display text-xl font-extrabold text-slate-800">
        {problem.prompt}
      </div>

      {won ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mt-4 text-center">
          <div className="text-5xl">🌟</div>
          <div className="font-display mt-1 text-xl font-black text-emerald-500">Brilliant! +15 XP</div>
          <button
            onClick={() => onFinish(true)}
            className="font-display mt-4 w-full rounded-2xl bg-emerald-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95"
          >
            Claim bonus
          </button>
        </motion.div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {problem.choices.map((c, i) => {
              const isWrong = wrongPick === String(c)
              return (
                <button
                  key={i}
                  disabled={outOfTries}
                  onClick={() => pick(c)}
                  className={`font-display rounded-2xl py-4 text-xl font-extrabold shadow transition active:scale-95 ${
                    isWrong ? 'bg-rose-200 text-rose-600' : 'bg-slate-100 text-slate-700 hover:bg-indigo-50'
                  } ${outOfTries ? 'opacity-60' : ''}`}
                >
                  {c}
                </button>
              )
            })}
          </div>

          {!outOfTries ? (
            <div className="mt-3 text-center text-sm font-bold text-slate-400">
              {attemptsLeft} {attemptsLeft === 1 ? 'try' : 'tries'} left
              {wrongPick && <span className="ml-1 text-rose-400">· not quite, try again!</span>}
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-center text-sm font-bold text-slate-500">Out of tries on this one.</p>
              <div className="mt-3 flex flex-col gap-2">
                {requestsUsed < MAX_REQUESTS && (
                  <button
                    onClick={() => {
                      setRequestsUsed((r) => r + 1)
                      setWrongPick(null)
                      setAttemptsLeft(1)
                    }}
                    className="font-display rounded-2xl bg-indigo-500 py-3 font-extrabold text-white shadow active:scale-95"
                  >
                    Request 1 more chance ({MAX_REQUESTS - requestsUsed} left)
                  </button>
                )}
                <button
                  onClick={() => onFinish(false)}
                  className="font-display rounded-2xl bg-slate-100 py-3 font-extrabold text-slate-500 active:scale-95"
                >
                  Finish (+7 XP for trying)
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
