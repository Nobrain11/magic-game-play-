import type { Character } from '@workspace/shared'
import type { PvpResult } from '@workspace/shared'
import { PVP_PRIZE, PVP_INJURY_EVERY } from '@workspace/shared'
import { calculateDamage, rollCrit } from './damage.js'

export function resolveBattle(
  attacker: Character,
  defender: Character
): PvpResult {
  let attackerHp = attacker.hp
  let defenderHp = defender.hp
  let turn = 0

  // Determine who goes first by speed
  let aFirst = attacker.speed >= defender.speed

  while (attackerHp > 0 && defenderHp > 0) {
    if (aFirst) {
      const isCrit = rollCrit(attacker.crit)
      const dmg = calculateDamage(attacker, defender, isCrit)
      defenderHp -= dmg
      if (defenderHp <= 0) break
      const dCrit = rollCrit(defender.crit)
      const dDmg = calculateDamage(defender, attacker, dCrit)
      attackerHp -= dDmg
    } else {
      const dCrit = rollCrit(defender.crit)
      const dDmg = calculateDamage(defender, attacker, dCrit)
      attackerHp -= dDmg
      if (attackerHp <= 0) break
      const isCrit = rollCrit(attacker.crit)
      const dmg = calculateDamage(attacker, defender, isCrit)
      defenderHp -= dmg
    }
    turn++
    if (turn > 50) break // safety valve — higher speed wins ties
  }

  const attackerWon = attackerHp > defenderHp
  const winnerId = attackerWon ? attacker.user_id : defender.user_id
  const loserId = attackerWon ? defender.user_id : attacker.user_id
  const loserLosses = attackerWon ? defender.pvp_losses + 1 : attacker.pvp_losses + 1

  return {
    winnerId,
    loserId,
    attackerWon,
    magicPrize: PVP_PRIZE,
    loserNowInjured: loserLosses % PVP_INJURY_EVERY === 0,
  }
}
