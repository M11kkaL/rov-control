import type { ControlCommand, FlightMode } from '../types'

export type SimTelemetry = {
  depth: number
  heading: number
  pitch: number
  roll: number
  cameraTilt: number
  lights: boolean
  lightsLevel: number
  flightMode: FlightMode
  velocity: number
  x: number
  z: number
}

/** Pitch rate in rad/s at full input — matches backend 30°/s */
export const PITCH_RATE = (30 * Math.PI) / 180
export const CAM_TILT_RATE = (25 * Math.PI) / 180
export const MAX_PITCH = (45 * Math.PI) / 180
export const MAX_CAM_TILT = (35 * Math.PI) / 180

export type CommandListener = (command: ControlCommand) => void
export type TelemetryListener = (telemetry: SimTelemetry) => void
