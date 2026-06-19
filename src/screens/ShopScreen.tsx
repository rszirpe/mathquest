import { useState } from 'react'
import { Check, Lock } from 'lucide-react'
import type { AvatarSlot, ShopItem } from '@/types'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { Avatar } from '@/components/Avatar'
import { CoinPill } from '@/components/Hud'
import { ScreenHeader } from '@/components/ScreenHeader'
import { SLOT_LABELS, SLOT_ORDER, itemsBySlot } from '@/lib/shop'
import { levelFromXp } from '@/lib/progression'

const FACE_EMOJI: Record<string, string> = {
  happy: '😊',
  cool: '😎',
  star: '🤩',
  wink: '😉',
  surprised: '😮',
}

export function ShopScreen() {
  const back = useUiStore((s) => s.back)
  const avatar = usePlayerStore((s) => s.avatar)
  const coins = usePlayerStore((s) => s.coins)
  const xp = usePlayerStore((s) => s.xp)
  const ownedItems = usePlayerStore((s) => s.ownedItems)
  const buyItem = usePlayerStore((s) => s.buyItem)
  const equipItem = usePlayerStore((s) => s.equipItem)
  const level = levelFromXp(xp).level

  const [slot, setSlot] = useState<AvatarSlot>('body')
  const items = itemsBySlot(slot)

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-fuchsia-400 to-purple-600 p-5">
      <ScreenHeader title="Customize" onBack={back} right={<CoinPill coins={coins} />} />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-3xl bg-white/15 p-4 backdrop-blur">
        <div className="rounded-3xl bg-white/25 p-2 shadow-lg">
          <Avatar config={avatar} size={120} />
        </div>
      </div>

      <div className="no-scrollbar mx-auto mt-4 flex w-full max-w-3xl justify-center gap-2 overflow-x-auto">
        {SLOT_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setSlot(s)}
            className={`font-display shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${
              slot === s ? 'bg-white text-purple-600' : 'bg-white/20 text-white'
            }`}
          >
            {SLOT_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-4 grid w-full max-w-5xl gap-3 pb-4 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            owned={ownedItems.includes(item.id)}
            equipped={avatar[item.slot] === item.value}
            coins={coins}
            level={level}
            onBuy={() => buyItem(item)}
            onEquip={() => equipItem(item)}
          />
        ))}
      </div>
    </div>
  )
}

function ItemPreview({ item }: { item: ShopItem }) {
  if (item.slot === 'body' || item.slot === 'background') {
    return <div className="h-12 w-12 rounded-2xl shadow-inner" style={{ background: item.value }} />
  }
  const emoji = item.slot === 'face' ? FACE_EMOJI[item.value] ?? '🙂' : item.value
  return <div className="text-4xl">{emoji}</div>
}

function ItemCard({
  item,
  owned,
  equipped,
  coins,
  level,
  onBuy,
  onEquip,
}: {
  item: ShopItem
  owned: boolean
  equipped: boolean
  coins: number
  level: number
  onBuy: () => void
  onEquip: () => void
}) {
  const lockedByLevel = !!item.requiredLevel && level < item.requiredLevel
  const canAfford = coins >= item.cost
  const removable = item.slot === 'hat' || item.slot === 'accessory'

  return (
    <div className={`flex flex-col items-center gap-2 rounded-2xl bg-white p-3 shadow-lg ${equipped ? 'ring-4 ring-emerald-300' : ''}`}>
      <div className="flex h-14 items-center justify-center">
        <ItemPreview item={item} />
      </div>
      <div className="text-center text-sm font-bold text-slate-700">{item.name}</div>

      {equipped ? (
        removable ? (
          <button onClick={onEquip} className="w-full rounded-xl bg-slate-100 py-2 text-sm font-extrabold text-slate-500 active:scale-95">
            Remove
          </button>
        ) : (
          <div className="flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-100 py-2 text-sm font-extrabold text-emerald-600">
            <Check size={16} /> Worn
          </div>
        )
      ) : owned ? (
        <button onClick={onEquip} className="w-full rounded-xl bg-indigo-500 py-2 text-sm font-extrabold text-white active:scale-95">
          Wear
        </button>
      ) : lockedByLevel ? (
        <div className="flex w-full items-center justify-center gap-1 rounded-xl bg-slate-100 py-2 text-sm font-extrabold text-slate-400">
          <Lock size={14} /> Lvl {item.requiredLevel}
        </div>
      ) : (
        <button
          onClick={onBuy}
          disabled={!canAfford}
          className={`w-full rounded-xl py-2 text-sm font-extrabold active:scale-95 ${
            canAfford ? 'bg-amber-400 text-amber-900' : 'bg-slate-100 text-slate-400'
          }`}
        >
          🪙 {item.cost}
        </button>
      )}
    </div>
  )
}
