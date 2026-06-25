const POND_RADIUS = 38

type MissionOverlayProps = {
  x: number
  z: number
  velocity: number
}

export function MissionOverlay({ x, z, velocity }: MissionOverlayProps) {
  const size = 132
  const center = size / 2
  const scale = (center - 10) / POND_RADIUS
  const dotX = center + x * scale
  const dotY = center + z * scale

  return (
    <div className="glass-panel w-44 p-3">
      <span className="hud-label">Mission</span>
      <div className="relative mx-auto mt-2" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
          <circle
            cx={center}
            cy={center}
            r={POND_RADIUS * scale}
            fill="rgba(29,212,255,0.06)"
            stroke="rgba(29,212,255,0.25)"
            strokeWidth="1"
          />
          <line
            x1={center}
            y1={center - POND_RADIUS * scale}
            x2={center}
            y2={center + POND_RADIUS * scale}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          <line
            x1={center - POND_RADIUS * scale}
            y1={center}
            x2={center + POND_RADIUS * scale}
            y2={center}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          <circle cx={dotX} cy={dotY} r="4" fill="#1dd4ff" className="drop-shadow-[0_0_6px_#1dd4ff]" />
        </svg>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
        <div>
          <dt className="uppercase tracking-wider text-white/35">X</dt>
          <dd className="font-mono text-sm font-bold text-white">{x.toFixed(1)} m</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wider text-white/35">Z</dt>
          <dd className="font-mono text-sm font-bold text-white">{z.toFixed(1)} m</dd>
        </div>
        <div className="col-span-2">
          <dt className="uppercase tracking-wider text-white/35">Speed</dt>
          <dd className="font-mono text-sm font-bold text-accent-cyan">{velocity.toFixed(2)} m/s</dd>
        </div>
      </dl>
    </div>
  )
}
