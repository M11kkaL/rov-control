import { useCallback, useEffect, useRef, useState } from 'react'
import type { Telemetry } from '../types'

const MAX_RECORDED_FRAMES = 12_000

export function useTelemetryRecorder(telemetry: Telemetry, recording: boolean) {
  const bufferRef = useRef<Telemetry[]>([])
  const [frameCount, setFrameCount] = useState(0)

  useEffect(() => {
    if (!recording || telemetry.timestamp <= 0) return
    bufferRef.current.push(telemetry)
    if (bufferRef.current.length > MAX_RECORDED_FRAMES) {
      bufferRef.current.shift()
    }
    setFrameCount(bufferRef.current.length)
  }, [recording, telemetry])

  const clearBuffer = useCallback(() => {
    bufferRef.current = []
    setFrameCount(0)
  }, [])

  const snapshotFrames = useCallback((): Telemetry[] => [...bufferRef.current], [])

  const downloadFrames = useCallback((frames: Telemetry[], format: 'jsonl' | 'csv' = 'jsonl'): string | null => {
    if (frames.length === 0) return null

    if (format === 'csv') {
      const header = 'timestamp,depth,heading,pitch,roll,x,z,velocity,battery,flightMode,lights'
      const rows = frames.map((f) =>
        [
          f.timestamp,
          f.depth,
          f.heading,
          f.pitch,
          f.roll,
          f.x,
          f.z,
          f.velocity,
          f.battery,
          f.flightMode,
          f.lights,
        ].join(','),
      )
      return [header, ...rows].join('\n')
    }

    return frames.map((f) => JSON.stringify(f)).join('\n')
  }, [])

  const download = useCallback((format: 'jsonl' | 'csv' = 'jsonl') => {
    const body = downloadFrames(bufferRef.current, format)
    if (!body) return false

    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const ext = format === 'csv' ? 'csv' : 'jsonl'
    const mime = format === 'csv' ? 'text/csv' : 'application/jsonl'
    triggerDownload(`rov-telemetry-${stamp}.${ext}`, body, mime)
    return true
  }, [downloadFrames])

  return { frameCount, download, clearBuffer, snapshotFrames, downloadFrames }
}

function triggerDownload(filename: string, body: string, mime: string): void {
  const blob = new Blob([body], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
