export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function todayDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000)
}

export function isPast(isoString: string): boolean {
  return Date.now() > new Date(isoString).getTime()
}

export function secondsUntil(isoString: string): number {
  return Math.ceil((new Date(isoString).getTime() - Date.now()) / 1000)
}
