export type ItemType = 'weapon' | 'helmet' | 'armor'
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
export type StatType = 'attack' | 'defense' | 'magic' | 'speed' | 'crit' | 'hp'

export interface Item {
  id: number
  user_id: number
  item_name: string
  item_type: ItemType
  rarity: Rarity
  stat_type: StatType
  stat_value: number
  emoji: string
  item_img: string | null
  level: number
  for_sale: number
  price: number
  obtained_at: string
}

export interface RolledItem {
  item_name: string
  item_type: ItemType
  rarity: Rarity
  stat_type: StatType
  stat_value: number
  emoji: string
  item_img: string | null
}

export interface EquipmentSlots {
  weapon: Item | null
  helmet: Item | null
  armor: Item | null
}
