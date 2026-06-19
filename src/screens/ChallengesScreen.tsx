import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { ScreenHeader } from '@/components/ScreenHeader'
import { CoinPill, XpBar } from '@/components/Hud'
import { LevelUpModal } from '@/components/LevelUpModal'
import { challengeProgress, type ChallengeSnapshot } from '@/lib/challenges'
import { bigCelebrate, celebrate, playCorrect, playLevelUp } from '@/lib/fx'

export function ChallengesScreen() {
  const back = useUiStore((s) => s.back)
  const challenges = usePlayerStore((s) => s.challenges)
  const ensureChallenges = usePlayerStore((s) => s.ensureChallenges)
  const claimChallenge = usePlayerStore((s) => s.claimChallenge)
  const stats = usePlayerStore((s) => s.stats)
  const history = usePlayerStore((s) => s.history)
  const progress = usePlayerStore((s) => s.progress)
  const xp = usePlayerStore((s) => s.xp)
  const coins = usePlayerStore((s) => s.coins)
  const sound = usePlayerStore((s) => s.settings.sound)
  const [levelUp, setLevelUp] = useState<number | null>(null)

  useEffect(() => {
    ensureChallenges()
  }, [ensureChallenges])

  const snap: ChallengeSnapshot = {
    totalSolved: stats.totalSolved,
    totalCorrect: stats.totalCorrect,
    worksheets: history.length,
    aces: history.filter((h) => h.percent >= 0.9).length,
    fullMarks: history.filter((h) => h.percent >= 1).length,
    passedLevels: Object.values(progress).filter((p) => p.passed).length,
  }

  const onClaim = (id: string) => {
    const r = claimChallenge(id)
    if (!r) return
    if (sound) playCorrect()
    celebrate()
    if (r.leveledUp) {
      if (sound) playLevelUp()
      bigCelebrate()
      setLevelUp(r.newLevel)
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-amber-400 to-orange-600 p-5">
      <ScreenHeader title="Challenges" onBack={back} right={<CoinPill coins={coins} />} />

      <div className="mx-auto mb-3 w-full max-w-3xl">
        <XpBar xp={xp} />
      </div>
      <p className="mx-auto mb-4 w-full max-w-3xl text-center font-semibold text-white/90">
        Complete challenges to earn bonus XP! Finish one and a fresh one appears.
      </p>

      <div className="mx-auto grid w-full max-w-3xl gap-3 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        {challenges.map((ch) => {
          const { progress: p, done } = challengeProgress(ch, snap)
          const pct = Math.round((p / ch.target) * 100)
          return (
            <motion.div key={ch.id} layout className={`rounded-3xl bg-white p-4 shadow-lg ${done ? 'ring-2 ring-emerald-300' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{ch.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-black text-slate-800">{ch.title}</div>
                  <div className="text-xs font-bold text-amber-500">Reward: +{ch.xp} XP</div>
                </div>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  {p} / {ch.target}
                </span>
                {done ? (
                  <button
                    onClick={() => onClaim(ch.id)}
                    className="font-display rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-extrabold text-white shadow active:scale-95"
                  >
                    Claim +{ch.xp} XP
                  </button>
                ) : (
                  <span className="text-xs font-bold text-slate-300">In progress</span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {levelUp !== null && <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />}
    </div>
  )
}
