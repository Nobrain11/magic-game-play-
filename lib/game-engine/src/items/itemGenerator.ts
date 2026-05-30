import type { MissionDifficulty, RolledItem, ItemType, StatType } from '@workspace/shared'
import { ITEM_POOLS, RARITIES, RARITY_MAP, STAT_TYPES, ITEM_DATA } from '@workspace/shared'
import { weightedRandomFiltered } from '@workspace/shared'

export function rollItem(difficulty: MissionDifficulty): RolledItem {
  const pool = ITEM_POOLS[difficulty]
  const eligible = RARITIES.filter(r => pool.includes(r.name))
  const rarity = weightedRandomFiltered(RARITIES, r => pool.includes(r.name))
  const _ = eligible // suppress unused warning

  const types: ItemType[] = ['weapon', 'helmet', 'armor']
  const itemType = types[Math.floor(Math.random() * types.length)]!

  const itemPool = ITEM_DATA[itemType]
  const itemBase = itemPool[Math.floor(Math.random() * itemPool.length)]!

  const statType = STAT_TYPES[Math.floor(Math.random() * STAT_TYPES.length)] as StatType
  const multiplier = RARITY_MAP[rarity.name].statMultiplier
  const baseStatValue = Math.floor((5 + Math.random() * 20) * multiplier)

  const rarityEmoji: Record<string, string> = {
    Common: '⚪', Uncommon: '🟢', Rare: '🔵', Epic: '🟣', Legendary: '🟡',
  }

  return {
    item_name: itemBase.name,
    item_type: itemType,
    rarity: rarity.name,
    stat_type: statType,
    stat_value: baseStatValue,
    emoji: rarityEmoji[rarity.name] ?? '⚪',
    item_img: null,
  }
}

export function upgradeStatValue(statValue: number): number {
  return Math.floor(statValue * 1.25 + Math.random() * 5)
}
