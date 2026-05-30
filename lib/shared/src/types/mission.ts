export type MissionDifficulty = 'quick' | 'normal' | 'hard' | 'epic'

export interface Mission {
  id: number
  user_id: number
  difficulty: MissionDifficulty
  started_at: string
  ends_at: string
  collected: number
}

export interface MissionDefinition {
  emoji: string
  label: string
  duration: number
  xp: [number, number]
  burn: number
  scene: string
}

export interface MissionReward {
  xpGained: number
  magicEarned: number
  item: import('./item').RolledItem | null
  levelUpMessage: string
}
