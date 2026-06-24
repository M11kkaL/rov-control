import { useCallback, useEffect, useRef, useState } from 'react'
import type { Telemetry } from '../../types'

type LogEntry = {
  id: number
  time: string
  level: 'info' | 'warning' | 'error'
  message: string
}

type TelemetryLogProps = {
  telemetry: Telemetry
  connected: boolean
}

let logId = 0

export function TelemetryLog({ telemetry, connected }: TelemetryLogProps) {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const seenWarnings = useRef(new Set<string>())
  const wasConnected = useRef(connected)
  const loggedStream = useRef(false)

  const addEntry = useCallback((level: LogEntry['level'], message: string) => {
    const time = new Date().toLocaleTimeString('fi-FI', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    setEntries((prev) => [{ id: ++logId, time, level, message }, ...prev].slice(0, 50))
  }, [])

  useEffect(() => {
    if (connected && !wasConnected.current) {
      addEntry('info', 'WebSocket connected')
    }
    if (!connected && wasConnected.current) {
      addEntry('error', 'WebSocket disconnected')
    }
    wasConnected.current = connected
  }, [connected, addEntry])

  useEffect(() => {
    if (telemetry.timestamp > 0 && !loggedStream.current) {
      loggedStream.current = true
      addEntry('info', 'Telemetry stream active')
    }
  }, [telemetry.timestamp, addEntry])

  useEffect(() => {
    for (const warning of telemetry.warnings) {
      if (seenWarnings.current.has(warning)) continue
      seenWarnings.current.add(warning)
      addEntry('warning', warning)
    }
  }, [telemetry.warnings, addEntry])

  return (
    <div className="glass-panel flex flex-col overflow-hidden p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Telemetry Log</span>
        <span className="font-mono text-[10px] text-white/30">{entries.length} events</span>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <p className="text-xs text-white/25">Waiting for events…</p>
        ) : (
          entries.map((entry) => <LogLine key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  )
}

function LogLine({ entry }: { entry: LogEntry }) {
  const levelStyles = {
    info: 'text-accent-cyan',
    warning: 'text-warning',
    error: 'text-danger',
  }

  return (
    <div className="flex gap-2 font-mono text-[10px] leading-relaxed">
      <span className="shrink-0 text-white/25">{entry.time}</span>
      <span className={`shrink-0 font-bold uppercase ${levelStyles[entry.level]}`}>
        {entry.level}
      </span>
      <span className="text-white/60">{entry.message}</span>
    </div>
  )
}
