import { useEffect, useRef, type RefObject } from 'react'
import type { UiControlFlags } from '../components/controls/ActionButtons'
import type { ControlState } from '../input'
import type { WebSocketService } from '../services'
import type { CommandMessage } from '../types'
import { deriveFlightMode } from '../utils/flightMode'

const COMMAND_RATE_MS = 50
const CRUISE_MAX_MPS = 1.5

export type CommandAssist = {
  cruiseSpeed: number
  holdDepthTarget: number
}

export function useCommandSender(
  service: RefObject<WebSocketService | null>,
  control: ControlState,
  uiFlags: UiControlFlags,
  assist: CommandAssist,
) {
  const controlRef = useRef(control)
  const uiFlagsRef = useRef(uiFlags)
  const assistRef = useRef(assist)
  controlRef.current = control
  uiFlagsRef.current = uiFlags
  assistRef.current = assist

  useEffect(() => {
    const send = () => {
      const c = controlRef.current
      const flags = uiFlagsRef.current
      const assistState = assistRef.current
      const useCameraTilt = flags.cameraTilt
      const cameraTiltValue = useCameraTilt ? flags.manualCameraTilt : 0
      const lightsLevel = Math.max(0, Math.min(100, flags.lightsLevel))
      const flightMode = deriveFlightMode(flags)

      let throttle = c.throttle
      if (Math.abs(throttle) < 0.05 && assistState.cruiseSpeed > 0.05) {
        throttle = Math.min(1, assistState.cruiseSpeed / CRUISE_MAX_MPS)
      }

      const holdDepthTarget =
        flightMode === 'hold_depth' && assistState.holdDepthTarget > 0 ? assistState.holdDepthTarget : undefined

      const message: CommandMessage = {
        type: 'command',
        payload: {
          throttle,
          yaw: c.yaw,
          pitch: useCameraTilt ? 0 : c.pitch,
          vertical: c.vertical,
          lateral: c.lateral,
          flightMode,
          lights: lightsLevel > 0,
          lightsLevel,
          cameraTilt: useCameraTilt ? cameraTiltValue : 0,
          holdDepthTarget,
          emergencyStop: c.emergencyStop || undefined,
        },
        timestamp: Date.now(),
      }
      service.current?.sendCommand(message)
    }

    send()
    const interval = setInterval(send, COMMAND_RATE_MS)
    return () => clearInterval(interval)
  }, [service])
}
