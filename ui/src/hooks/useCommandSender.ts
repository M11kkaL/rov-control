import { useEffect, useRef, type RefObject } from 'react'
import type { ControlState } from '../input'
import type { WebSocketService } from '../services'
import type { CommandMessage } from '../types'

const COMMAND_RATE_MS = 50

export function useCommandSender(
  service: RefObject<WebSocketService | null>,
  control: ControlState,
) {
  const controlRef = useRef(control)
  controlRef.current = control

  useEffect(() => {
    const send = () => {
      const c = controlRef.current
      const message: CommandMessage = {
        type: 'command',
        payload: {
          throttle: c.throttle,
          yaw: c.yaw,
          vertical: c.vertical,
          lateral: c.lateral,
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
