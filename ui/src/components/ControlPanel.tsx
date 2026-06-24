import type { ControlState } from '../input'

type ControlPanelProps = {
  control: ControlState
  gamepadConnected: boolean
}

function formatAxis(value: number): string {
  return value.toFixed(2)
}

export function ControlPanel({ control, gamepadConnected }: ControlPanelProps) {
  return (
    <aside className="control-panel">
      <h2>Controls</h2>
      <p className="control-panel__hint">
        WASD · QE · RF · Space (E-stop)
        {gamepadConnected ? ' · Gamepad' : ''}
      </p>
      {control.emergencyStop && (
        <p className="control-panel__estop">EMERGENCY STOP</p>
      )}
      <dl className="control-panel__axes">
        <div>
          <dt>Throttle</dt>
          <dd>{formatAxis(control.throttle)}</dd>
        </div>
        <div>
          <dt>Yaw</dt>
          <dd>{formatAxis(control.yaw)}</dd>
        </div>
        <div>
          <dt>Vertical</dt>
          <dd>{formatAxis(control.vertical)}</dd>
        </div>
        <div>
          <dt>Lateral</dt>
          <dd>{formatAxis(control.lateral)}</dd>
        </div>
      </dl>
    </aside>
  )
}
