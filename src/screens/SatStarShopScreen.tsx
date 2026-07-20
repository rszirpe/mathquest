import { useState } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { ScreenHeader } from '@/components/ScreenHeader'

interface StarPack {
  id: string
  stars: number
  priceLabel: string
  emoji: string
}

const PACKS: StarPack[] = [
  { id: 'pack-small', stars: 50, priceLabel: '$0.99', emoji: '🌟' },
  { id: 'pack-medium', stars: 150, priceLabel: '$2.99', emoji: '✨' },
  { id: 'pack-large', stars: 400, priceLabel: '$5.99', emoji: '💫' },
]

/** Purchase menu preview — no payment processor wired yet (usePlayerStore.purchaseSatStarPack is a stub). */
export function SatStarShopScreen() {
  const back = useUiStore((s) => s.back)
  const satStars = usePlayerStore((s) => s.satStars)
  const purchaseSatStarPack = usePlayerStore((s) => s.purchaseSatStarPack)
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-indigo-500 to-purple-700 p-5">
      <ScreenHeader title="Get more SAT Stars" onBack={back} />

      <div className="mx-auto w-full max-w-md text-center">
        <div className="rounded-2xl bg-white/15 p-3 font-bold text-white backdrop-blur">You have {satStars} 🌟</div>

        <div className="mt-4 flex flex-col gap-3">
          {PACKS.map((pack) => (
            <div key={pack.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{pack.emoji}</div>
                <div className="text-left">
                  <div className="font-display text-lg font-black text-slate-800">{pack.stars} stars</div>
                  <div className="text-xs font-semibold text-slate-400">{pack.priceLabel}</div>
                </div>
              </div>
              <button
                onClick={() => setMessage(purchaseSatStarPack(pack.id).message)}
                className="font-display rounded-2xl bg-indigo-500 px-4 py-2 font-extrabold text-white shadow active:scale-95"
              >
                Buy
              </button>
            </div>
          ))}
        </div>

        {message && (
          <div className="mt-4 rounded-2xl bg-white/15 p-3 text-sm font-bold text-white backdrop-blur">{message}</div>
        )}
      </div>
    </div>
  )
}
