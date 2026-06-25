const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const

export function normalizeHeading(heading: number): number {
  return ((heading % 360) + 360) % 360
}

export function headingLabel(heading: number): string {
  const deg = normalizeHeading(heading)
  const idx = Math.round(deg / 45) % 8
  return `${CARDINALS[idx]} ${deg.toFixed(0)}°`
}

export function flightModeLabel(mode: string): string {
  switch (mode) {
    case 'stabilized':
      return 'STABILIZED'
    case 'hold_depth':
      return 'HOLD DEPTH'
    default:
      return 'MANUAL'
  }
}

export function pressureBar(depth: number): number {
  return 1.0 + depth * 0.1
}

export function temperatureC(depth: number): number {
  return 18 + depth * 0.35
}

export function batteryEstimateMinutes(battery: number, velocity: number): number {
  const drain = 0.4 + velocity * 0.25
  return Math.max(0, (battery / 100) * 180 / drain)
}

export function hasLeakAlert(warnings: string[]): boolean {
  return warnings.some((w) => /leak|water|hull/i.test(w))
}

export function thrusterPercent(value: number): number {
  return Math.round(Math.min(Math.abs(value), 1) * 100)
}
