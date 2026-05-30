import type { Rank } from '@workspace/shared'
import { RANK_ORDER } from '@workspace/shared'

export function rankFromLevel(level: number): Rank {
  if (level >= 80) return 'S'
  if (level >= 60) return 'A'
  if (level >= 40) return 'B'
  if (level >= 20) return 'C'
  return 'D'
}

export function canUnlockClass(classRank: Rank, playerRank: Rank): boolean {
  return RANK_ORDER[playerRank] >= RANK_ORDER[classRank]
}
