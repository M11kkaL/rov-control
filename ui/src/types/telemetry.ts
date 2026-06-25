import type { ControlCommand, FlightMode } from './commands'

export type Telemetry = {
  depth: number
  heading: number
  pitch: number
  roll: number
  cameraTilt: number
  flightMode: FlightMode
  lights: boolean
  holdDepthTarget?: number
  battery: number
  x: number
  z: number
  velocity: number
  command: ControlCommand
  thrusters: {
    front: number
    rear: number
    left: number
    right: number
    vertical: number
  }
  warnings: string[]
  timestamp: number
}

export type TelemetryMessage = {
  type: 'telemetry'
  payload: Telemetry
}
