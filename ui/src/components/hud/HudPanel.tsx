import { BatteryIndicator } from './BatteryIndicator'
import { DepthIndicator } from './DepthIndicator'
import { HeadingIndicator } from './HeadingIndicator'
import { MissionOverlay } from './MissionOverlay'
import { PitchRollIndicator } from './PitchRollIndicator'
import { ThrusterBars } from './ThrusterBars'
import type { Telemetry } from '../../types'

type HudPanelProps = {
  telemetry: Telemetry
  connected: boolean
}

export function HudPanel({ telemetry, connected }: HudPanelProps) {
  const modes = [
    { label: 'MANUAL', active: telemetry.flightMode === 'manual' },
    { label: 'STABILIZED', active: telemetry.flightMode === 'stabilized' },
    { label: 'HOLD DEPTH', active: telemetry.flightMode === 'hold_depth' },
  ] as const

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
      {!connected && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <span className="glass-panel px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-warning">
            Reconnecting…
          </span>
        </div>
      )}

      <div className="flex flex-1 justify-between gap-3">
        <MissionOverlay x={telemetry.x} z={telemetry.z} velocity={telemetry.velocity} />
        <aside className="glass-panel flex w-44 flex-col gap-3 p-3">
          <DepthIndicator depth={telemetry.depth} holdTarget={telemetry.holdDepthTarget} />
          <div className="h-px bg-white/10" />
          <HeadingIndicator heading={telemetry.heading} />
          <div className="h-px bg-white/10" />
          <PitchRollIndicator
            pitch={telemetry.pitch}
            roll={telemetry.roll}
            cameraTilt={telemetry.cameraTilt}
          />
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
