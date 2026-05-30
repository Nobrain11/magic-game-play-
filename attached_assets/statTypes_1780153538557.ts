import type { StatType } from '../types/item'

export const STAT_TYPES: StatType[] = [
  'attack',
  'defense',
  'magic',
  'speed',
  'crit',
  'hp',
]

export const STAT_LABELS: Record<StatType, string> = {
  attack:  '⚔️ Attack',
  defense: '🛡️ Defense',
  magic:   '🔮 Magic',
  speed:   '💨 Speed',
  crit:    '🎯 Crit',
  hp:      '❤️ HP',
}

export const STAT_EMOJI: Record<StatType, string> = {
  attack:  '⚔️',
  defense: '🛡️',
  magic:   '🔮',
  speed:   '💨',
  crit:    '🎯',
  hp:      '❤️',
}
