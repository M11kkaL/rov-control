import { useEffect, useRef, type RefObject } from 'react'
import type { UiControlFlags } from '../components/controls/ActionButtons'
import type { ControlState } from '../input'
import type { WebSocketService } from '../services'
import type { CommandMessage } from '../types'
import { deriveFlightMode } from '../utils/flightMode'

const COMMAND_RATE_MS = 50

export function useCommandSender(
  service: RefObject<WebSocketService | null>,
  control: ControlState,
  uiFlags: UiControlFlags,
) {
  const controlRef = useRef(control)
  const uiFlagsRef = useRef(uiFlags)
  controlRef.current = control
  uiFlagsRef.current = uiFlags

  useEffect(() => {
    const send = () => {
      const c = controlRef.current
      const flags = uiFlagsRef.current
      const useCameraTilt = flags.cameraTilt
      const cameraTiltValue = useCameraTilt ? flags.manualCameraTilt : 0
      const lightsLevel = Math.max(0, Math.min(100, flags.lightsLevel))

      const message: CommandMessage = {
        type: 'command',
        payload: {
          throttle: c.throttle,
          yaw: c.yaw,
          pitch: useCameraTilt ? 0 : c.pitch,
          vertical: c.vertical,
          lateral: c.lateral,
          flightMode: deriveFlightMode(flags),
          lights: lightsLevel > 0,
          lightsLevel,
          cameraTilt: useCameraTilt ? cameraTiltValue : 0,
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
