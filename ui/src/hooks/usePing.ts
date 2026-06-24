import { useEffect, useState } from 'react'

export function usePing(connected: boolean, telemetryTimestamp: number): number | null {
  const [ping, setPing] = useState<number | null>(null)

  useEffect(() => {
    if (!connected || telemetryTimestamp <= 0) {
      setPing(null)
      return
    }
    setPing(Math.min(Math.abs(Date.now() - telemetryTimestamp), 999))
  }, [connected, telemetryTimestamp])

  return ping
}
