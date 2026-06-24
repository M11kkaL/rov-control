export type ControlCommand = {
  throttle: number
  yaw: number
  vertical: number
  lateral: number
  emergencyStop?: boolean
}

export type CommandMessage = {
  type: 'command'
  payload: ControlCommand
  timestamp: number
}
