import type { Telemetry } from '../types'

type ThrusterBarProps = {
  label: string
  value: number
}

function ThrusterBar({ label, value }: ThrusterBarProps) {
  const magnitude = Math.min(Math.abs(value), 1) * 100

  return (
    <div className="thruster-bar">
      <span className="thruster-bar__label">{label}</span>
      <div className="thruster-bar__track">
        <div
          className="thruster-bar__fill"
          data-direction={value >= 0 ? 'pos' : 'neg'}
          style={{ width: `${magnitude}%` }}
        />
      </div>
      <span className="thruster-bar__value">{value.toFixed(2)}</span>
    </div>
  )
}

type ThrusterDisplayProps = {
  thrusters: Telemetry['thrusters']
}

export function ThrusterDisplay({ thrusters }: ThrusterDisplayProps) {
  return (
    <div className="thruster-display">
      <h3 className="thruster-display__title">Thrusters</h3>
      <ThrusterBar label="Front" value={thrusters.front} />
      <ThrusterBar label="Rear" value={thrusters.rear} />
      <ThrusterBar label="Left" value={thrusters.left} />
      <ThrusterBar label="Right" value={thrusters.right} />
      <ThrusterBar label="Vertical" value={thrusters.vertical} />
    </div>
  )
}
