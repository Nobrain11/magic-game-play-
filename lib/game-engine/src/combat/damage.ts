import type { CharacterStats } from '@workspace/shared'
import { clamp } from '@workspace/shared'

export function calculateDamage(
  attacker: CharacterStats,
  defender: CharacterStats,
  isCrit: boolean
): number {
  const base = attacker.attack - defender.defense * 0.5
  const clampedBase = clamp(base, 1, 9999)
  const magicBonus = attacker.magic * 0.1
  const raw = clampedBase + magicBonus
  return isCrit ? Math.floor(raw * 1.8) : Math.floor(raw)
}

export function rollCrit(crit: number): boolean {
  return Math.random() * 100 < crit
}
