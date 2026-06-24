import type { CommandMessage } from '../types'
import type { Telemetry } from '../types'
import { getWebSocketUrl } from './config'

type TelemetryHandler = (telemetry: Telemetry) => void
type StatusHandler = (connected: boolean) => void

const MIN_RECONNECT_MS = 1000
const MAX_RECONNECT_MS = 10000

export class WebSocketService {
  private socket: WebSocket | null = null
  private onTelemetry: TelemetryHandler | null = null
  private onStatus: StatusHandler | null = null
  private shouldConnect = false
  private reconnectDelay = MIN_RECONNECT_MS
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  connect(): void {
    this.shouldConnect = true
    if (this.socket?.readyState === WebSocket.OPEN) return
    this.openSocket()
  }

  disconnect(): void {
    this.shouldConnect = false
    this.clearReconnect()
    this.socket?.close()
    this.socket = null
  }

  sendCommand(message: CommandMessage): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return
    this.socket.send(JSON.stringify(message))
  }

  setTelemetryHandler(handler: TelemetryHandler): void {
    this.onTelemetry = handler
  }

  setStatusHandler(handler: StatusHandler): void {
    this.onStatus = handler
  }

  private openSocket(): void {
    this.socket = new WebSocket(getWebSocketUrl())

    this.socket.addEventListener('open', () => {
      this.reconnectDelay = MIN_RECONNECT_MS
      this.onStatus?.(true)
    })

    this.socket.addEventListener('close', () => {
      this.socket = null
      this.onStatus?.(false)
      this.scheduleReconnect()
    })

    this.socket.addEventListener('error', () => {
      this.socket?.close()
    })

    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(String(event.data))
        if (data.type === 'telemetry') {
          this.onTelemetry?.(data.payload as Telemetry)
        }
      } catch {
        // Ignore malformed messages.
      }
    })
  }

  private scheduleReconnect(): void {
    if (!this.shouldConnect || this.reconnectTimer !== null) return

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (this.shouldConnect) {
        this.openSocket()
      }
    }, this.reconnectDelay)

    this.reconnectDelay = Math.min(this.reconnectDelay * 2, MAX_RECONNECT_MS)
  }

  private clearReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectDelay = MIN_RECONNECT_MS
  }
}
