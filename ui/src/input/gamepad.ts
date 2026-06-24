import type { ControlState } from './types'

const DEADZONE = 0.15

function applyDeadzone(value: number): number {
  return Math.abs(value) < DEADZONE ? 0 : value
}

function axis(axes: readonly number[], index: number): number {
  return axes.at(index) ?? 0
}

export function readGamepadState(): ControlState | null {
  const [pad] = navigator.getGamepads().filter(Boolean)
  if (!pad) return null

  let pitch = 0
  if (pad.buttons[5]?.pressed) pitch += 1
  if (pad.buttons[4]?.pressed) pitch -= 1

  return {
    throttle: applyDeadzone(-axis(pad.axes, 1)),
    yaw: applyDeadzone(axis(pad.axes, 0)),
    pitch,
    vertical: applyDeadzone(-axis(pad.axes, 3)),
    lateral: applyDeadzone(axis(pad.axes, 2)),
    emergencyStop: pad.buttons[0]?.pressed ?? false,
  }
}

export function hasGamepadConnected(): boolean {
  return navigator.getGamepads().some((pad) => pad !== null)
}
