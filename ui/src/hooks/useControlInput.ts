import { useEffect, useState } from 'react'
import {
  createKeyboardInput,
  hasGamepadConnected,
  readGamepadState,
  type ControlState,
  ZERO_CONTROL,
} from '../input'

export function useControlInput(): ControlState {
  const [state, setState] = useState<ControlState>(ZERO_CONTROL)

  useEffect(() => {
    const keyboard = createKeyboardInput()
    keyboard.attach()

    let frameId = 0
    const tick = () => {
      const gamepad = readGamepadState()
      setState(gamepad ?? keyboard.getState())
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
      keyboard.detach()
    }
  }, [])

  return state
}

export function useGamepadConnected(): boolean {
  const [connected, setConnected] = useState(hasGamepadConnected())

  useEffect(() => {
    const onChange = () => setConnected(hasGamepadConnected())
    window.addEventListener('gamepadconnected', onChange)
    window.addEventListener('gamepaddisconnected', onChange)
    return () => {
      window.removeEventListener('gamepadconnected', onChange)
      window.removeEventListener('gamepaddisconnected', onChange)
    }
  }, [])

  return connected
}
