import type { ControlState } from '../../input'
import { PanelCard } from '../layout/PanelCard'

type GamepadStatusProps = {
  control: ControlState
  gamepadConnected: boolean
  cameraTiltMode?: boolean
}

const KEY_BINDINGS = [
  { keys: 'W / S', action: 'Throttle' },
  { keys: 'A / D', action: 'Yaw' },
  { keys: '↑ / ↓', action: 'Pitch' },
  { keys: 'Q / E', action: 'Vertical' },
  { keys: '← / →', action: 'Lateral' },
  { keys: 'Space', action: 'E-Stop' },
]

export function GamepadStatus({ control, gamepadConnected, cameraTiltMode }: GamepadStatusProps) {
  return (
    <PanelCard
      title="Input"
      action={<GamepadBadge connected={gamepadConnected} />}
    >
      <div className="mb-3 space-y-1.5">
        {KEY_BINDINGS.map(({ keys, action }) => (
          <div key={action} className="flex items-center justify-between gap-2 text-[10px]">
            <kbd className="kbd-key">{keys}</kbd>
            <span className="text-white/35">
              {action === 'Pitch' && cameraTiltMode ? 'Cam Tilt' : action}
            </span>
          </div>
        ))}
      </div>

      <span className="mb-2 block hud-label">Active Axes</span>
      <div className="grid grid-cols-5 gap-1.5">
        <AxisChip label="THR" value={control.throttle} />
        <AxisChip label="YAW" value={control.yaw} />
        <AxisChip label="PIT" value={control.pitch} />
        <AxisChip label="VER" value={control.vertical} />
        <AxisChip label="LAT" value={control.lateral} />
      </div>
    </PanelCard>
  )
}

function GamepadBadge({ connected }: { connected: boolean }) {
  return (
    <span className={`text-[9px] font-semibold uppercase tracking-wider ${connected ? 'text-accent-teal' : 'text-white/30'}`}>
      {connected ? 'Gamepad' : 'Keyboard'}
    </span>
  )
}

function AxisChip({ label, value }: { label: string; value: number }) {
  const active = Math.abs(value) > 0.01
  return (
    <div
      className={`rounded-md px-1 py-1.5 text-center ${
        active ? 'bg-accent-teal/10 ring-1 ring-accent-teal/20' : 'bg-white/[0.03]'
      }`}
    >
      <div className="text-[7px] font-bold text-white/35">{label}</div>
      <div className={`font-mono text-[10px] font-semibold tabular-nums ${active ? 'text-accent-teal' : 'text-white/30'}`}>
        {value.toFixed(1)}
      </div>
    </div>
  )
}
