import type { MissionDefinition, MissionDifficulty } from '../types/mission'

export const MISSIONS: Record<MissionDifficulty, MissionDefinition> = {
  quick: {
    emoji: '⚡',
    label: 'Quick',
    duration: 15 * 60,
    xp: [25, 35],
    burn: 100_000,
    scene: 'mission_quick',
  },
  normal: {
    emoji: '⚔️',
    label: 'Normal',
    duration: 60 * 60,
    xp: [75, 100],
    burn: 100_000,
    scene: 'mission_normal',
  },
  hard: {
    emoji: '🔥',
    label: 'Hard',
    duration: 4 * 60 * 60,
    xp: [230, 300],
    burn: 100_000,
    scene: 'mission_hard',
  },
  epic: {
    emoji: '🌌',
    label: 'Epic',
    duration: 12 * 60 * 60,
    xp: [750, 950],
    burn: 100_000,
    scene: 'mission_epic',
  },
}

export const MAGIC_BURN_AMOUNT = 100_000

export const TOKEN_SPLIT = {
  burn:      0.30,
  marketing: 0.20,
  buyback:   0.10,
  rewards:   0.40,
}
