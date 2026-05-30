export function pvpWinTemplate(winner: string, loser: string, prize: number): string {
  return `⚔️ *PvP Victory!*\n\n🏆 ${winner} defeated ${loser}!\n💰 Won: *${prize.toLocaleString()} $MAGIC*`
}

export function pvpLoseTemplate(loser: string, winner: string): string {
  return `💀 *PvP Defeat*\n\n${loser} was defeated by *${winner}*.\nTrain harder and seek revenge!`
}

export function pvpInjuredTemplate(loser: string): string {
  return `🩹 *Injured!*\n\n${loser} was seriously wounded in battle.\nUse /heal to recover before fighting again!`
}
