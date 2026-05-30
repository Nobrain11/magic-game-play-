import type { CharacterStats, ClassKey, Rank } from './character'

export interface ClassDefinition {
  key: ClassKey
  emoji: string
  label: string
  rank: Rank
  startMagic: number
  desc: string
  lore: string
  stats: CharacterStats
  image: string // placeholder key — replaced with real image buffer at runtime
}
