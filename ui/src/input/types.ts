export type ControlState = {
  throttle: number
  yaw: number
  pitch: number
  vertical: number
  lateral: number
  emergencyStop: boolean
}

export const ZERO_CONTROL: ControlState = {
  throttle: 0,
  yaw: 0,
  pitch: 0,
  vertical: 0,
  lateral: 0,
  emergencyStop: false,
}
