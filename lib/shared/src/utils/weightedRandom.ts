export interface Weighted {
  weight: number
}

export function weightedRandom<T extends Weighted>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * total
  for (const item of items) {
    roll -= item.weight
    if (roll <= 0) return item
  }
  return items[0]
}

export function weightedRandomFiltered<T extends Weighted>(
  items: T[],
  filter: (item: T) => boolean
): T {
  const filtered = items.filter(filter)
  return weightedRandom(filtered)
}
