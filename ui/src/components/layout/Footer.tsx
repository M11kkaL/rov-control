import type { ControlState } from '../../input'
import type { Telemetry } from '../../types'
import { ActionButtons, type UiControlFlags } from '../controls/ActionButtons'
import { GamepadStatus } from '../controls/GamepadStatus'
import { TelemetryLog } from '../controls/TelemetryLog'

type FooterProps = {
  control: ControlState
  telemetry: Telemetry
  gamepadConnected: boolean
  uiFlags: UiControlFlags
  onUiFlagsChange: (flags: UiControlFlags) => void
}

export function Footer({
  control,
  telemetry,
  gamepadConnected,
  uiFlags,
  onUiFlagsChange,
}: FooterProps) {
  return (
    <footer className="grid h-36 shrink-0 grid-cols-[1fr_1.2fr_1fr] gap-3 border-t border-white/10 bg-bg-panel p-3">
      <GamepadStatus
        control={control}
        gamepadConnected={gamepadConnected}
        cameraTiltMode={uiFlags.cameraTilt}
      />
      <ActionButtons flags={uiFlags} onChange={onUiFlagsChange} emergencyStop={control.emergencyStop} />
      <TelemetryLog telemetry={telemetry} connected={telemetry.timestamp > 0} />
    </footer>
  )
}
