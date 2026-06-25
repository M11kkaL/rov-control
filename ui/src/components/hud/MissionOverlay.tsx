import { PanelCard } from '../layout/PanelCard'

const POND_RADIUS = 38

type MissionOverlayProps = {
  x: number
  z: number
  velocity: number
}

export function MissionOverlay({ x, z, velocity }: MissionOverlayProps) {
  const size = 120
  const center = size / 2
  const scale = (center - 10) / POND_RADIUS
  const dotX = center + x * scale
  const dotY = center + z * scale

  return (
    <PanelCard title="Mission Map">
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
          <circle
            cx={center}
            cy={center}
            r={POND_RADIUS * scale}
            fill="rgba(0,212,170,0.05)"
            stroke="rgba(0,212,170,0.22)"
            strokeWidth="1"
          />
          <line
            x1={center}
            y1={center - POND_RADIUS * scale}
            x2={center}
            y2={center + POND_RADIUS * scale}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
          <line
            x1={center - POND_RADIUS * scale}
            y1={center}
            x2={center + POND_RADIUS * scale}
            y2={center}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
          <circle cx={dotX} cy={dotY} r="3.5" fill="#00d4aa" className="drop-shadow-[0_0_6px_#00d4aa]" />
        </svg>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        <Metric label="X" value={`${x.toFixed(1)} m`} />
        <Metric label="Z" value={`${z.toFixed(1)} m`} />
        <div className="col-span-2">
          <Metric label="Speed" value={`${velocity.toFixed(2)} m/s`} accent />
        </div>
      </dl>
    </PanelCard>
  )
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dt className="hud-label">{label}</dt>
      <dd className={`mt-0.5 font-mono text-sm font-semibold tabular-nums ${accent ? 'text-accent-teal' : 'text-white'}`}>
        {value}
      </dd>
    </div>
  )
}
