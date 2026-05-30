export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

export function totalXpForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i)
  }
  return total
}

export interface LevelUpResult {
  newLevel: number
  overflow: number
  levelsGained: number
}

export function applyXp(
  currentLevel: number,
  currentXp: number,
  xpGained: number
): LevelUpResult {
  let xp = currentXp + xpGained
  let level = currentLevel
  let levelsGained = 0

  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level)
    level++
    levelsGained++
    if (level >= 100) { xp = 0; break }
  }

  return { newLevel: level, overflow: xp, levelsGained }
}
