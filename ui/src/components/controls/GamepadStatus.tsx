import type { ControlState } from '../../input'

type GamepadStatusProps = {
  control: ControlState
  gamepadConnected: boolean
}

const KEY_BINDINGS = [
  { keys: 'W / S', action: 'Throttle' },
  { keys: 'A / D', action: 'Yaw' },
  { keys: '↑ / ↓', action: 'Pitch' },
  { keys: 'Q / E', action: 'Vertical' },
  { keys: 'R / F', action: 'Lateral' },
  { keys: 'Space', action: 'E-Stop' },
]

export function GamepadStatus({ control, gamepadConnected }: GamepadStatusProps) {
  return (
    <div className="glass-panel flex flex-col overflow-hidden p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Input</span>
        <GamepadBadge connected={gamepadConnected} />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
        {KEY_BINDINGS.map(({ keys, action }) => (
          <div key={action} className="flex items-center justify-between gap-2">
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-white/60">
              {keys}
            </kbd>
            <span className="text-white/35">{action}</span>
          </div>
        ))}
      </div>

      <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
        Active Axes
      </span>
      <div className="grid grid-cols-5 gap-1">
        <AxisChip label="THR" value={control.throttle} />
        <AxisChip label="YAW" value={control.yaw} />
        <AxisChip label="PIT" value={control.pitch} />
        <AxisChip label="VER" value={control.vertical} />
        <AxisChip label="LAT" value={control.lateral} />
      </div>
    </div>
  )
}

function GamepadBadge({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${connected ? 'text-accent-cyan' : 'text-white/25'}`} fill="currentColor">
        <path d="M6 9H4.5a2.5 2.5 0 000 5H6v-5zm12 0v5h1.5a2.5 2.5 0 000-5H18zm-8 0v5h4V9h-4zM8 6h8a4 4 0 014 4v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4a4 4 0 014-4z" />
      </svg>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${connected ? 'text-accent-cyan' : 'text-white/30'}`}>
        {connected ? 'Gamepad' : 'Keyboard'}
      </span>
    </div>
  )
}

function AxisChip({ label, value }: { label: string; value: number }) {
  const active = Math.abs(value) > 0.01
  return (
    <div
      className={`rounded px-1 py-1 text-center ${
        active ? 'bg-accent-cyan/15 ring-1 ring-accent-cyan/30' : 'bg-white/5'
      }`}
    >
      <div className="text-[8px] font-bold text-white/40">{label}</div>
      <div className={`font-mono text-[10px] font-bold tabular-nums ${active ? 'text-accent-cyan' : 'text-white/30'}`}>
        {value.toFixed(1)}
      </div>
    </div>
  )
}
