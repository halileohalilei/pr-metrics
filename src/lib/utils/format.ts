export function formatHours(hours: number): string {
  if (hours === 0) return '0 hours'
  if (hours < 1) return `${Math.round(hours * 60)} minutes`
  if (hours < 24) return `${hours.toFixed(1)} hours`
  const days = Math.floor(hours / 24)
  const remainingHours = Math.round(hours % 24)
  return `${days}d ${remainingHours}h`
}

