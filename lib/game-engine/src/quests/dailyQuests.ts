import type { DailyQuest } from '@workspace/shared'
import { DAILY_QUESTS_POOL } from '@workspace/shared'

export function rollDailyQuests(count = 3): DailyQuest[] {
  const shuffled = [...DAILY_QUESTS_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(q => ({
    ...q,
    progress: 0,
    done: false,
  }))
}

export function progressQuest(
  quests: DailyQuest[],
  key: string,
  amount = 1
): DailyQuest[] {
  return quests.map(q => {
    if (q.key !== key || q.done) return q
    const newProgress = Math.min(q.progress + amount, q.target)
    return { ...q, progress: newProgress, done: newProgress >= q.target }
  })
}

export function claimableQuests(quests: DailyQuest[]): DailyQuest[] {
  return quests.filter(q => q.done)
}
