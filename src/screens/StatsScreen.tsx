import { useState } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { ScreenHeader } from '@/components/ScreenHeader'
import { topicTitle } from '@/lib/curriculum'
import { levelFromXp } from '@/lib/progression'
import type { TopicId } from '@/types'

export function StatsScreen() {
  const back = useUiStore((s) => s.back)
  const stats = usePlayerStore((s) => s.stats)
  const xp = usePlayerStore((s) => s.xp)
  const coins = usePlayerStore((s) => s.coins)
  const resetProgress = usePlayerStore((s) => s.resetProgress)
  const needsPractice = usePlayerStore((s) => s.needsPractice)
  const history = usePlayerStore((s) => s.history)
  const [confirming, setConfirming] = useState(false)

  const level = levelFromXp(xp).level
  const accuracy = stats.totalSolved > 0 ? Math.round((stats.totalCorrect / stats.totalSolved) * 100) : 0
  const topics = Object.entries(stats.byTopic) as [TopicId, { solved: number; correct: number }][]

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-violet-500 to-indigo-700 p-5">
      <ScreenHeader title="My Stats" onBack={back} />

      <div className="mx-auto grid w-full max-w-4xl gap-3 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
        <StatCard label="Level" value={level} accent="text-amber-500" />
        <StatCard label="Coins" value={`🪙 ${coins}`} accent="text-amber-500" />
        <StatCard label="Problems solved" value={stats.totalSolved} accent="text-indigo-500" />
        <StatCard label="Accuracy" value={`${accuracy}%`} accent="text-emerald-500" />
        <StatCard label="Best streak" value={`🔥 ${stats.bestStreak}`} accent="text-orange-500" />
        <StatCard label="Correct" value={stats.totalCorrect} accent="text-emerald-500" />
      </div>

      {topics.length > 0 && (
        <div className="mx-auto mt-5 w-full max-w-4xl rounded-3xl bg-white p-4 shadow-lg">
          <div className="font-display mb-3 text-lg font-black text-slate-800">Topic mastery</div>
          <div className="flex flex-col gap-3">
            {topics.map(([id, t]) => {
              const pct = t.solved > 0 ? Math.round((t.correct / t.solved) * 100) : 0
              return (
                <div key={id}>
                  <div className="mb-1 flex justify-between text-sm font-bold text-slate-600">
                    <span>{topicTitle(id)}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {needsPractice.length > 0 && (
        <div className="mx-auto mt-5 w-full max-w-4xl rounded-3xl bg-white p-4 shadow-lg">
          <div className="font-display mb-1 text-lg font-black text-rose-500">Needs more practice</div>
          <div className="mb-3 text-xs font-semibold text-slate-400">Worksheets scored under 80% — give them another go!</div>
          <div className="flex flex-col gap-2">
            {needsPractice.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2">
                <span className="text-sm font-bold text-slate-700">{e.title}</span>
                <span className="text-sm font-extrabold text-rose-500">{Math.round(e.score * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mx-auto mt-5 w-full max-w-4xl rounded-3xl bg-white p-4 shadow-lg">
          <div className="font-display mb-3 text-lg font-black text-slate-800">Worksheet history</div>
          <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-700">{h.title}</div>
                  <div className="text-xs font-semibold text-slate-400">
                    {new Date(h.date).toLocaleDateString()} · {h.gradedBy === 'teacher' ? '👩‍🏫 Teacher' : '🤖 Auto'}
                    {h.signature ? ` · ✍️ ${h.signature}` : ' · unsigned'}
                  </div>
                </div>
                <div className={`font-display text-lg font-black ${h.percent >= 0.8 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {Math.round(h.percent * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto mt-6 w-full max-w-4xl">
        {confirming ? (
          <div className="rounded-2xl bg-white/15 p-4 text-center backdrop-blur">
            <div className="mb-3 font-bold text-white">Are you sure you want to reset your whole progress? All history will be gone.</div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl bg-white/20 py-3 font-extrabold text-white active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetProgress()
                  setConfirming(false)
                }}
                className="flex-1 rounded-xl bg-rose-500 py-3 font-extrabold text-white active:scale-95"
              >
                Yes, reset
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="w-full rounded-2xl bg-white/15 py-3 font-bold text-white/80 backdrop-blur active:scale-95"
          >
            Reset progress
          </button>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-3xl bg-white p-4 text-center shadow-lg">
      <div className={`font-display text-3xl font-black ${accent}`}>{value}</div>
      <div className="mt-0.5 text-xs font-bold text-slate-400">{label}</div>
    </div>
  )
}
