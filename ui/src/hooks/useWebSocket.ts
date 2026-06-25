import { useEffect, useRef, useState } from 'react'
import type { Telemetry } from '../types'
import { WebSocketService } from '../services'
import type { BackendCommandBridge } from '../sim'

const DEFAULT_TELEMETRY: Telemetry = {
  depth: 2,
  heading: 0,
  pitch: 0,
  roll: 0,
  cameraTilt: 0,
  flightMode: 'manual',
  lights: false,
  battery: 100,
  x: 0,
  z: 0,
  velocity: 0,
  command: { throttle: 0, yaw: 0, pitch: 0, vertical: 0, lateral: 0 },
  thrusters: { front: 0, rear: 0, left: 0, right: 0, vertical: 0 },
  warnings: [],
  timestamp: 0,
}

export function useWebSocket(bridge: BackendCommandBridge | null) {
  const serviceRef = useRef<WebSocketService | null>(null)
  const [connected, setConnected] = useState(false)
  const [telemetry, setTelemetry] = useState<Telemetry>(DEFAULT_TELEMETRY)
  const [ping, setPing] = useState<number | null>(null)

  useEffect(() => {
    const service = new WebSocketService()
    serviceRef.current = service

    service.setStatusHandler(setConnected)
    service.setPingHandler(setPing)
    service.setTelemetryHandler((payload) => {
      setTelemetry(payload)
      bridge?.handleBackendMessage(payload)
    })
    service.connect()

    return () => {
      service.disconnect()
      serviceRef.current = null
    }
  }, [bridge])

  return { connected, telemetry, ping, service: serviceRef }
}
