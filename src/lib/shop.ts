import type { AvatarConfig, AvatarSlot, ShopItem } from '@/types'

export const SHOP_ITEMS: ShopItem[] = [
  // Body colors
  { id: 'body-sun', slot: 'body', name: 'Sunny', value: '#fbbf24', cost: 0 },
  { id: 'body-sky', slot: 'body', name: 'Sky Blue', value: '#38bdf8', cost: 20 },
  { id: 'body-mint', slot: 'body', name: 'Minty', value: '#34d399', cost: 20 },
  { id: 'body-coral', slot: 'body', name: 'Coral', value: '#fb7185', cost: 30 },
  { id: 'body-grape', slot: 'body', name: 'Grape', value: '#a78bfa', cost: 40 },
  { id: 'body-bubble', slot: 'body', name: 'Bubblegum', value: '#f472b6', cost: 40 },

  // Faces / expressions
  { id: 'face-happy', slot: 'face', name: 'Happy', value: 'happy', cost: 0 },
  { id: 'face-cool', slot: 'face', name: 'Cool', value: 'cool', cost: 25 },
  { id: 'face-star', slot: 'face', name: 'Star Eyes', value: 'star', cost: 30, requiredLevel: 2 },
  { id: 'face-wink', slot: 'face', name: 'Wink', value: 'wink', cost: 25 },
  { id: 'face-surprised', slot: 'face', name: 'Wow', value: 'surprised', cost: 20 },

  // Hats
  { id: 'hat-cap', slot: 'hat', name: 'Cap', value: '🧢', cost: 30 },
  { id: 'hat-party', slot: 'hat', name: 'Party Hat', value: '🎉', cost: 40 },
  { id: 'hat-graduate', slot: 'hat', name: 'Grad Cap', value: '🎓', cost: 80, requiredLevel: 4 },
  { id: 'hat-crown', slot: 'hat', name: 'Crown', value: '👑', cost: 120, requiredLevel: 5 },
  { id: 'hat-wizard', slot: 'hat', name: 'Wizard Hat', value: '🧙', cost: 150, requiredLevel: 7 },

  // Accessories
  { id: 'acc-glasses', slot: 'accessory', name: 'Glasses', value: '👓', cost: 35 },
  { id: 'acc-bowtie', slot: 'accessory', name: 'Bow', value: '🎀', cost: 35 },
  { id: 'acc-star', slot: 'accessory', name: 'Star Badge', value: '⭐', cost: 30 },
  { id: 'acc-medal', slot: 'accessory', name: 'Medal', value: '🏅', cost: 90, requiredLevel: 5 },

  // Backgrounds
  { id: 'bg-sky', slot: 'background', name: 'Sky', value: '#bae6fd', cost: 0 },
  { id: 'bg-sunset', slot: 'background', name: 'Sunset', value: '#fed7aa', cost: 25 },
  { id: 'bg-mint', slot: 'background', name: 'Meadow', value: '#bbf7d0', cost: 25 },
  { id: 'bg-grape', slot: 'background', name: 'Lavender', value: '#ddd6fe', cost: 30 },
  { id: 'bg-night', slot: 'background', name: 'Starry Night', value: '#1e293b', cost: 60, requiredLevel: 3 },
]

export const DEFAULT_OWNED = ['body-sun', 'face-happy', 'bg-sky']

export const DEFAULT_AVATAR: AvatarConfig = {
  body: '#fbbf24',
  face: 'happy',
  hat: null,
  accessory: null,
  background: '#bae6fd',
}

export function getItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id)
}

export function itemsBySlot(slot: AvatarSlot): ShopItem[] {
  return SHOP_ITEMS.filter((i) => i.slot === slot)
}

export const SLOT_LABELS: Record<AvatarSlot, string> = {
  body: 'Color',
  face: 'Face',
  hat: 'Hat',
  accessory: 'Accessory',
  background: 'Background',
}

export const SLOT_ORDER: AvatarSlot[] = ['body', 'face', 'hat', 'accessory', 'background']
