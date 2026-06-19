import { motion } from 'framer-motion'

interface Props {
  level: number
  onClose: () => void
}

export function LevelUpModal({ level, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-amber-300 to-orange-400 p-6 text-center shadow-2xl"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-7xl"
        >
          ⭐
        </motion.div>
        <div className="font-display mt-2 text-3xl font-black text-white drop-shadow">Level Up!</div>
        <div className="mt-1 text-lg font-bold text-amber-900">You reached Level {level}</div>
        <div className="mt-1 text-sm font-semibold text-amber-800/80">You earned bonus coins! 🪙</div>
        <button
          onClick={onClose}
          className="font-display mt-5 w-full rounded-2xl bg-white py-3 text-lg font-extrabold text-orange-500 shadow-lg transition active:scale-95"
        >
          Keep going!
        </button>
      </motion.div>
    </div>
  )
}
