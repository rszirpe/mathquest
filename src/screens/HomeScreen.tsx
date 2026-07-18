import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, ClipboardList, Palette, Play, Settings, Sparkles, Sun, Target } from 'lucide-react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { Avatar } from '@/components/Avatar'
import { CoinPill, XpBar } from '@/components/Hud'
import { getCurriculum } from '@/lib/curriculum'

export function HomeScreen() {
  const go = useUiStore((s) => s.go)
  const avatar = usePlayerStore((s) => s.avatar)
  const xp = usePlayerStore((s) => s.xp)
  const coins = usePlayerStore((s) => s.coins)
  const grade = usePlayerStore((s) => s.grade)
  const premiumEnabled = usePlayerStore((s) => s.settings.premiumEnabled)
  const cur = grade ? getCurriculum(grade) : null

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 p-5">
      <div className="mx-auto my-auto w-full max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="font-display text-2xl font-black text-white drop-shadow">MathQuest</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => go('settings')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur active:scale-95"
          >
            <Settings size={18} />
          </button>
          <CoinPill coins={coins} />
        </div>
      </div>

      <div className="mt-5 rounded-3xl bg-white/15 p-5 backdrop-blur">
        <div className="flex justify-center">
          <motion.div animate={{ y: [0, -7, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
            <div className="rounded-3xl bg-white/25 p-2 shadow-xl">
              <Avatar config={avatar} size={140} />
            </div>
          </motion.div>
        </div>
        <div className="mt-4">
          <XpBar xp={xp} />
        </div>
      </div>

      <button
        onClick={() => go('grade')}
        className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 font-bold text-white backdrop-blur active:scale-95"
      >
        <span className="text-lg">{cur?.emoji}</span> {cur?.label} · Change
      </button>

      <button
        onClick={() => go('mode')}
        className="font-display mt-5 flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 py-5 text-2xl font-black text-white shadow-xl shadow-orange-500/30 active:scale-95"
      >
        <Play fill="white" size={28} /> Play!
      </button>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MenuTile icon={<Target size={24} />} label="Challenges" onClick={() => go('challenges')} />
        <MenuTile icon={<Palette size={24} />} label="Customize" onClick={() => go('shop')} />
        <MenuTile icon={<Sun size={24} />} label="Summer" onClick={() => go('summer')} />
        <MenuTile icon={<BarChart3 size={24} />} label="My Stats" onClick={() => go('stats')} />
        {premiumEnabled && (
          <>
            <MenuTile icon={<Sparkles size={24} />} label="Placement Test" onClick={() => go('placement')} />
            <MenuTile icon={<ClipboardList size={24} />} label="Classwork Help" onClick={() => go('classwork')} />
          </>
        )}
      </div>
      </div>
    </div>
  )
}

function MenuTile({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl bg-white/90 py-4 font-bold text-indigo-600 shadow-lg transition active:scale-95"
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  )
}
