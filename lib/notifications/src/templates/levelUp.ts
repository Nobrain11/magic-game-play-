export function levelUpTemplate(username: string, newLevel: number, newRank?: string): string {
  return `🎉 *Level Up!*\n\n⚔️ ${username} reached *Level ${newLevel}*!${newRank ? `\n🏆 New Rank: *${newRank}*` : ''}\n\nYour power grows...`
}
