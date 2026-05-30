import type { Rarity } from '../types/item'

export interface RarityDefinition {
  name: Rarity
  emoji: string
  weight: number
  statMultiplier: number
  upgradeCost: number
  upgradesTo: Rarity | null
  color: string
}

export const RARITIES: RarityDefinition[] = [
  { name: 'Common',    emoji: '⚪', weight: 60, statMultiplier: 1.0, upgradeCost: 50000,   upgradesTo: 'Uncommon', color: '#AAAAAA' },
  { name: 'Uncommon',  emoji: '🟢', weight: 25, statMultiplier: 1.5, upgradeCost: 150000,  upgradesTo: 'Rare',     color: '#00AA00' },
  { name: 'Rare',      emoji: '🔵', weight: 10, statMultiplier: 2.5, upgradeCost: 400000,  upgradesTo: 'Epic',     color: '#0055FF' },
  { name: 'Epic',      emoji: '🟣', weight: 4,  statMultiplier: 4.0, upgradeCost: 1000000, upgradesTo: 'Legendary',color: '#AA00FF' },
  { name: 'Legendary', emoji: '🟡', weight: 1,  statMultiplier: 7.0, upgradeCost: 0,       upgradesTo: null,       color: '#FFD700' },
]

export const RARITY_MAP = Object.fromEntries(
  RARITIES.map(r => [r.name, r])
) as Record<Rarity, RarityDefinition>

export const ITEM_POOLS: Record<string, Rarity[]> = {
  quick:  ['Common', 'Uncommon'],
  normal: ['Common', 'Uncommon', 'Rare'],
  hard:   ['Uncommon', 'Rare', 'Epic'],
  epic:   ['Rare', 'Epic', 'Legendary'],
}
