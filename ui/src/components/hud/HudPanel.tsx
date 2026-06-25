import { BatteryIndicator } from './BatteryIndicator'
import { DepthIndicator } from './DepthIndicator'
import { HeadingIndicator } from './HeadingIndicator'
import { PitchRollIndicator } from './PitchRollIndicator'
import { ThrusterBars } from './ThrusterBars'
import { PanelCard } from '../layout/PanelCard'
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
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
      {!connected && (
        <div className="absolute left-1/2 top-12 -translate-x-1/2">
          <span className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-warning backdrop-blur-sm">
            Reconnecting…
          </span>
        </div>
      )}

      <div className="flex flex-1 justify-end">
        <div className="pointer-events-auto w-48">
          <PanelCard title="Telemetry" className="glass-panel border-accent-teal/10">
            <div className="space-y-3">
              <DepthIndicator depth={telemetry.depth} holdTarget={telemetry.holdDepthTarget} />
              <div className="h-px bg-white/[0.06]" />
              <HeadingIndicator heading={telemetry.heading} />
              <div className="h-px bg-white/[0.06]" />
              <PitchRollIndicator
                pitch={telemetry.pitch}
                roll={telemetry.roll}
                cameraTilt={telemetry.cameraTilt}
              />
              <div className="h-px bg-white/[0.06]" />
              <BatteryIndicator level={telemetry.battery} />
            </div>
          </PanelCard>
        </div>
      </div>

      <PanelCard title="Propulsion" className="glass-panel pointer-events-auto border-white/[0.08]">
        <div className="flex items-end justify-between gap-6">
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
      </PanelCard>
    </div>
  )
}
