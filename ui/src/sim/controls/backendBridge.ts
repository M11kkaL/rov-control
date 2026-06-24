import type { ControlCommand } from '../../types'
import type { Telemetry } from '../../types'
import type { CommandListener, TelemetryListener } from '../types'

export class BackendCommandBridge {
  private commandListeners = new Set<CommandListener>()
  private telemetryListeners = new Set<TelemetryListener>()

  onCommand(listener: CommandListener): () => void {
    this.commandListeners.add(listener)
    return () => this.commandListeners.delete(listener)
  }

  onTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener)
    return () => this.telemetryListeners.delete(listener)
  }

  handleBackendMessage(payload: Telemetry): void {
    const command: ControlCommand = payload.command ?? {
      throttle: payload.thrusters.front,
      yaw: payload.thrusters.left + payload.thrusters.right,
      pitch: 0,
      vertical: payload.thrusters.vertical,
      lateral: (payload.thrusters.left - payload.thrusters.right) / 2,
    }

    for (const listener of this.commandListeners) {
      listener(command)
    }

    const simTelemetry = {
      depth: payload.depth,
      heading: payload.heading,
      pitch: payload.pitch ?? 0,
      velocity: payload.velocity ?? 0,
      x: payload.x ?? 0,
      z: payload.z ?? 0,
    }

    for (const listener of this.telemetryListeners) {
      listener(simTelemetry)
    }
  }
}
