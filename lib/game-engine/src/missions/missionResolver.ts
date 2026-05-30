import type { MissionDifficulty } from '@workspace/shared'
import type { MissionReward } from '@workspace/shared'
import { MISSIONS } from '@workspace/shared'
import { rollItem } from '../items/itemGenerator.js'

export function resolveMission(difficulty: MissionDifficulty): MissionReward {
  const def = MISSIONS[difficulty]
  const [minXp, maxXp] = def.xp
  const xpGained = Math.floor(minXp + Math.random() * (maxXp - minXp))

  // Magic earned from rewards pool — base on difficulty
  const magicMultiplier: Record<MissionDifficulty, number> = {
    quick:  0.5,
    normal: 1.0,
    hard:   2.5,
    epic:   6.0,
  }
  const magicEarned = Math.floor(def.burn * magicMultiplier[difficulty] * (0.8 + Math.random() * 0.4))

  // Item drop chance: 30% quick, 50% normal, 70% hard, 90% epic
  const dropChance: Record<MissionDifficulty, number> = {
    quick:  0.30,
    normal: 0.50,
    hard:   0.70,
    epic:   0.90,
  }
  const item = Math.random() < dropChance[difficulty] ? rollItem(difficulty) : null

  return {
    xpGained,
    magicEarned,
    item,
    levelUpMessage: '',
  }
}
