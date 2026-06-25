import type { Telemetry } from '../../types'

type ThrusterBarsProps = {
  thrusters: Telemetry['thrusters']
}

const THRUSTERS: { key: keyof Telemetry['thrusters']; label: string }[] = [
  { key: 'front', label: 'FWD' },
  { key: 'rear', label: 'AFT' },
  { key: 'left', label: 'PORT' },
  { key: 'right', label: 'STBD' },
  { key: 'vertical', label: 'VERT' },
]

export function ThrusterBars({ thrusters }: ThrusterBarsProps) {
  return (
    <div className="min-w-0 flex-1">
      <span className="hud-label">Thrusters</span>
      <div className="mt-2 grid grid-cols-5 gap-3">
        {THRUSTERS.map(({ key, label }) => (
          <ThrusterBar key={key} label={label} value={thrusters[key]} />
        ))}
      </div>
    </div>
  )
}

function ThrusterBar({ label, value }: { label: string; value: number }) {
  const magnitude = Math.min(Math.abs(value), 1)
  const isPositive = value >= 0

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/35">{label}</span>
      <div className="relative h-16 w-3 overflow-hidden rounded-full bg-white/10">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />
        <div
          className={`absolute left-0 right-0 rounded-full transition-all duration-75 ${
            isPositive ? 'bg-accent-teal' : 'bg-warning'
          }`}
          style={{
            height: `${magnitude * 50}%`,
            ...(isPositive ? { bottom: '50%' } : { top: '50%' }),
          }}
        />
      </div>
      <span className="font-mono text-[10px] font-semibold tabular-nums text-white/60">
        {value.toFixed(2)}
      </span>
    </div>
  )
}
