import type { Telemetry } from '../types'
import { ThrusterDisplay } from './ThrusterDisplay'

type HUDProps = {
  telemetry: Telemetry
  connected: boolean
}

export function HUD({ telemetry, connected }: HUDProps) {
  return (
    <div className="hud">
      <div className="hud__status" data-connected={connected}>
        {connected ? 'Connected' : 'Reconnecting…'}
      </div>
      <dl className="hud__metrics">
        <div>
          <dt>Depth</dt>
          <dd>{telemetry.depth.toFixed(1)} m</dd>
        </div>
        <div>
          <dt>Heading</dt>
          <dd>{telemetry.heading.toFixed(0)}°</dd>
        </div>
        <div>
          <dt>Battery</dt>
          <dd>{telemetry.battery.toFixed(0)}%</dd>
        </div>
        <div>
          <dt>Velocity</dt>
          <dd>{telemetry.velocity.toFixed(2)} m/s</dd>
        </div>
      </dl>
      <ThrusterDisplay thrusters={telemetry.thrusters} />
      {telemetry.warnings.length > 0 && (
        <ul className="hud__warnings">
          {telemetry.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
