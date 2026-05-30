export function isValidGuildName(name: string): boolean {
  return name.length >= 3 && name.length <= 30 && /^[\w\s\-]+$/.test(name)
}

export function isValidPrice(price: number, min = 1_000): boolean {
  return Number.isInteger(price) && price >= min
}

export function isValidItemName(name: string): boolean {
  return typeof name === 'string' && name.trim().length > 0
}
