type PitchRollIndicatorProps = {
  pitch: number
  roll: number
  cameraTilt?: number
}

export function PitchRollIndicator({ pitch, roll, cameraTilt = 0 }: PitchRollIndicatorProps) {
  const pitchClamped = Math.max(-45, Math.min(45, pitch))
  const rollClamped = Math.max(-45, Math.min(45, roll))
  const camClamped = Math.max(-35, Math.min(35, cameraTilt))

  return (
    <div>
      <span className="hud-label">Attitude</span>
      <div className="mt-2 flex gap-2">
        <AttitudeMini label="Pitch" value={pitchClamped} />
        <AttitudeMini label="Roll" value={rollClamped} />
        <AttitudeMini label="Cam" value={camClamped} accent />
      </div>
      <div className="relative mx-auto mt-2 h-16 w-16 overflow-hidden rounded-full border border-white/15 bg-black/40">
        <div
          className="absolute inset-0 transition-transform duration-100"
          style={{ transform: `rotate(${rollClamped}deg)` }}
        >
          <div
            className="absolute left-0 right-0 h-1/2 bg-accent-blue/30"
            style={{ top: `${50 - pitchClamped - camClamped * 0.5}%` }}
          />
          <div
            className="absolute left-0 right-0 h-1/2 bg-bg-dark/80"
            style={{ top: `${50 - pitchClamped - camClamped * 0.5 + 50}%` }}
          />
          <div className="absolute left-1/2 top-1/2 h-px w-full -translate-y-1/2 bg-accent-cyan/60" />
        </div>
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-cyan shadow-[0_0_6px_#1dd4ff]" />
      </div>
    </div>
  )
}

function AttitudeMini({
  label,
  value,
  accent = false,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className="flex-1">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-white/35">{label}</span>
      <div
        className={`font-mono text-sm font-bold tabular-nums ${accent ? 'text-accent-cyan' : 'text-white'}`}
      >
        {value >= 0 ? '+' : ''}
        {value.toFixed(0)}°
      </div>
    </div>
  )
}
