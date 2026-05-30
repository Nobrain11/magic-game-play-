import type { Rank } from '../types/character'

export const RANK_ORDER: Record<Rank, number> = {
  S: 5,
  A: 4,
  B: 3,
  C: 2,
  D: 1,
}

export const RANK_LABELS: Record<Rank, string> = {
  S: '💠 S-Rank',
  A: '🔴 A-Rank',
  B: '🟣 B-Rank',
  C: '🔵 C-Rank',
  D: '⚪ D-Rank',
}

export const RANK_STARS: Record<Rank, string> = {
  S: '⭐⭐⭐⭐⭐',
  A: '⭐⭐⭐⭐',
  B: '⭐⭐⭐',
  C: '⭐⭐',
  D: '⭐',
}
