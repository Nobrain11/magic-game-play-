export type Rank = 'S' | 'A' | 'B' | 'C' | 'D'

export type ClassKey =
  | 'warrior'
  | 'archer'
  | 'mage'
  | 'healer'
  | 'tank'
  | 'rogue'
  | 'chrono'
  | 'draconid'
  | 'crystalforged'

export interface CharacterStats {
  hp: number
  max_hp: number
  attack: number
  defense: number
  magic: number
  speed: number
  crit: number
}

export interface Character extends CharacterStats {
  user_id: number
  username: string
  class: ClassKey
  rank: Rank
  level: number
  xp: number
  weapon_slot: number | null
  helmet_slot: number | null
  armor_slot: number | null
  guild_id: number | null
  pvp_wins: number
  pvp_losses: number
  injured: number
  daily_quests: string | null
  daily_date: string | null
  magic_balance: number
  created_at: string
}
