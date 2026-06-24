type BatteryIndicatorProps = {
  level: number
}

export function BatteryIndicator({ level }: BatteryIndicatorProps) {
  const pct = Math.max(0, Math.min(100, level))
  const color =
    pct > 50 ? 'text-accent-cyan' : pct > 20 ? 'text-warning' : 'text-danger'
  const barColor =
    pct > 50 ? 'from-accent-cyan to-accent-blue' : pct > 20 ? 'from-warning to-warning' : 'from-danger to-danger'

  return (
    <div>
      <span className="hud-label">Battery</span>
      <div className="mt-1 flex items-center gap-2">
        <svg viewBox="0 0 24 14" className={`h-4 w-7 ${color}`} fill="currentColor">
          <rect x="0" y="2" width="20" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="20" y="5" width="2" height="4" rx="0.5" opacity="0.6" />
          <rect x="2" y="4" width={`${(pct / 100) * 16}`} height="6" rx="1" className="fill-current opacity-80" />
        </svg>
        <span className={`hud-value text-lg ${color}`}>{pct.toFixed(0)}</span>
        <span className="text-xs font-medium text-white/40">%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
