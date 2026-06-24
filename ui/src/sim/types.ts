import type { ControlCommand } from '../types'

export type SimTelemetry = {
  depth: number
  heading: number
  velocity: number
  x: number
  z: number
}

export const SIM_RATES = {
  depth: 2.0,
  heading: 45.0,
  move: 1.5,
} as const

export type CommandListener = (command: ControlCommand) => void
export type TelemetryListener = (telemetry: SimTelemetry) => void
