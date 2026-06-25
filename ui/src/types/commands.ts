export type FlightMode = 'manual' | 'stabilized' | 'hold_depth'

export type ControlCommand = {
  throttle: number
  yaw: number
  pitch: number
  vertical: number
  lateral: number
  flightMode?: FlightMode
  lights?: boolean
  cameraTilt?: number
  emergencyStop?: boolean
}

export type CommandMessage = {
  type: 'command'
  payload: ControlCommand
  timestamp: number
}

export type PingMessage = {
  type: 'ping'
  id: number
  timestamp: number
}

export type PongMessage = {
  type: 'pong'
  id: number
  timestamp: number
}
