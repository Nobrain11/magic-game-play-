export interface Guild {
  id: number
  name: string
  leader_id: number
  level: number
  xp: number
  raid_boss: string | null
  raid_hp: number
  raid_max_hp: number
  raid_ends_at: string | null
  created_at: string
}

export interface BossDefinition {
  name: string
  emoji: string
  hp: number
  reward_xp: number
  reward_magic: number
}

export interface RaidHitResult {
  damage: number
  newHp: number
  bossDefeated: boolean
  boss: BossDefinition | null
}
