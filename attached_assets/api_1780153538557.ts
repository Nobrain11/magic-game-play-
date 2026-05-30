export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface PvpResult {
  winnerId: number
  loserId: number
  attackerWon: boolean
  magicPrize: number
  loserNowInjured: boolean
}

export interface BurnSplit {
  total: number
  burned: number
  marketing: number
  buyback: number
  rewards: number
}

export interface DailyQuest {
  key: string
  desc: string
  reward: number
  target: number
  progress: number
  done: boolean
}
