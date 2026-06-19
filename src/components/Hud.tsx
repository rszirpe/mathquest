import { motion } from 'framer-motion'
import { levelFromXp } from '@/lib/progression'

export function XpBar({ xp }: { xp: number }) {
  const info = levelFromXp(xp)
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 font-display text-sm font-extrabold text-amber-900 shadow ring-2 ring-white/60">
        {info.level}
      </div>
      <div className="flex-1">
        <div className="h-3 w-full overflow-hidden rounded-full bg-black/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-400"
            initial={false}
            animate={{ width: `${Math.round(info.progress * 100)}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="mt-0.5 text-[10px] font-bold text-white/80">
          {info.intoLevel} / {info.needed} XP
        </div>
      </div>
    </div>
  )
}

export function CoinPill({ coins }: { coins: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-display text-sm font-extrabold text-amber-600 shadow">
      <span>🪙</span>
      {coins}
    </div>
  )
}

export function StreakPill({ streak }: { streak: number }) {
  if (streak < 2) return null
  return (
    <motion.div
      key={streak}
      initial={{ scale: 0.6 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 font-display text-sm font-extrabold text-white shadow"
    >
      <span>🔥</span>
      {streak}
    </motion.div>
  )
}
