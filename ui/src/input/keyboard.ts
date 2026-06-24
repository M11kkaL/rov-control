import type { ControlState } from './types'
import { ZERO_CONTROL } from './types'

const KEY_BINDINGS: Record<string, Partial<ControlState>> = {
  KeyW: { throttle: 1 },
  KeyS: { throttle: -1 },
  KeyA: { yaw: -1 },
  KeyD: { yaw: 1 },
  KeyQ: { vertical: 1 },
  KeyE: { vertical: -1 },
  KeyR: { lateral: 1 },
  KeyF: { lateral: -1 },
}

export function createKeyboardInput(): {
  attach: () => void
  detach: () => void
  getState: () => ControlState
} {
  const pressed = new Set<string>()

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault()
      pressed.add(event.code)
      return
    }
    if (event.code in KEY_BINDINGS) {
      event.preventDefault()
      pressed.add(event.code)
    }
  }

  const onKeyUp = (event: KeyboardEvent) => {
    pressed.delete(event.code)
  }

  const onBlur = () => {
    pressed.clear()
  }

  const getState = (): ControlState => {
    if (pressed.has('Space')) {
      return { ...ZERO_CONTROL, emergencyStop: true }
    }

    const state = { ...ZERO_CONTROL }

    for (const code of pressed) {
      const binding = KEY_BINDINGS[code]
      if (!binding) continue
      if (binding.throttle !== undefined) state.throttle = binding.throttle
      if (binding.yaw !== undefined) state.yaw = binding.yaw
      if (binding.vertical !== undefined) state.vertical = binding.vertical
      if (binding.lateral !== undefined) state.lateral = binding.lateral
    }

    return state
  }

  return {
    attach: () => {
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      window.addEventListener('blur', onBlur)
    },
    detach: () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      pressed.clear()
    },
    getState,
  }
}
