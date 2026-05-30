export function raidHitTemplate(username: string, boss: string, damage: number, hpLeft: number): string {
  return `⚔️ *Raid Hit!*\n\n${username} hit *${boss}* for *${damage} damage*!\n❤️ Boss HP: ${hpLeft.toLocaleString()}`
}

export function raidVictoryTemplate(guildName: string, boss: string, xpReward: number, magicReward: number): string {
  return `🏆 *RAID VICTORY!*\n\n⚔️ Guild *${guildName}* slayed *${boss}*!\n\n🎉 All members receive:\n⭐ ${xpReward.toLocaleString()} XP\n💰 ${magicReward.toLocaleString()} $MAGIC`
}
