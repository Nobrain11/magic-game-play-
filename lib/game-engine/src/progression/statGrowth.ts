import type { CharacterStats, ClassKey } from '@workspace/shared'
import { CLASSES } from '@workspace/shared'

export function statGrowthPerLevel(classKey: ClassKey): Partial<CharacterStats> {
  const base = CLASSES[classKey].stats
  return {
    hp:      Math.ceil(base.max_hp * 0.05),
    max_hp:  Math.ceil(base.max_hp * 0.05),
    attack:  Math.ceil(base.attack * 0.04),
    defense: Math.ceil(base.defense * 0.04),
    magic:   Math.ceil(base.magic * 0.04),
    speed:   Math.ceil(base.speed * 0.02),
    crit:    Math.ceil(base.crit * 0.01),
  }
}

export function applyLevelUpStats(
  stats: CharacterStats,
  classKey: ClassKey,
  levelsGained: number
): CharacterStats {
  if (levelsGained === 0) return stats
  const growth = statGrowthPerLevel(classKey)
  return {
    hp:      stats.hp      + (growth.hp      ?? 0) * levelsGained,
    max_hp:  stats.max_hp  + (growth.max_hp  ?? 0) * levelsGained,
    attack:  stats.attack  + (growth.attack  ?? 0) * levelsGained,
    defense: stats.defense + (growth.defense ?? 0) * levelsGained,
    magic:   stats.magic   + (growth.magic   ?? 0) * levelsGained,
    speed:   stats.speed   + (growth.speed   ?? 0) * levelsGained,
    crit:    stats.crit    + (growth.crit    ?? 0) * levelsGained,
  }
}
