import { BatteryIndicator } from './BatteryIndicator'
import { DepthIndicator } from './DepthIndicator'
import { HeadingIndicator } from './HeadingIndicator'
import { PitchRollIndicator } from './PitchRollIndicator'
import { ThrusterBars } from './ThrusterBars'
import type { Telemetry } from '../../types'

export type FlightMode = 'MANUAL' | 'STABILIZED' | 'HOLD DEPTH'

type HudPanelProps = {
  telemetry: Telemetry
  connected: boolean
  holdDepth: boolean
}

export function HudPanel({ telemetry, connected, holdDepth }: HudPanelProps) {
  const modes: { label: FlightMode; active: boolean }[] = [
    { label: 'MANUAL', active: !holdDepth },
    { label: 'STABILIZED', active: false },
    { label: 'HOLD DEPTH', active: holdDepth },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
      {!connected && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <span className="glass-panel px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-warning">
            Reconnecting…
          </span>
        </div>
      )}

      <div className="flex flex-1 justify-end">
        <aside className="glass-panel flex w-44 flex-col gap-3 p-3">
          <DepthIndicator depth={telemetry.depth} />
          <div className="h-px bg-white/10" />
          <HeadingIndicator heading={telemetry.heading} />
          <div className="h-px bg-white/10" />
          <PitchRollIndicator pitch={telemetry.pitch} roll={0} />
          <div className="h-px bg-white/10" />
          <BatteryIndicator level={telemetry.battery} />
        </aside>
      </div>

      <div className="glass-panel flex items-end justify-between gap-4 p-3">
        <ThrusterBars thrusters={telemetry.thrusters} />
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="hud-label">Flight Mode</span>
          <div className="flex flex-wrap justify-end gap-1.5">
            {modes.map(({ label, active }) => (
              <span key={label} className={`mode-tag ${active ? 'mode-tag--active' : 'mode-tag--inactive'}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
