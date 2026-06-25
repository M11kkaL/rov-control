import type { CommandMessage } from '../types'
import type { Telemetry } from '../types'
import { getWebSocketUrl } from './config'

type TelemetryHandler = (telemetry: Telemetry) => void
type StatusHandler = (connected: boolean) => void
type PingHandler = (rttMs: number) => void

const MIN_RECONNECT_MS = 1000
const MAX_RECONNECT_MS = 10000
const APP_PING_INTERVAL_MS = 2000

export class WebSocketService {
  private socket: WebSocket | null = null
  private onTelemetry: TelemetryHandler | null = null
  private onStatus: StatusHandler | null = null
  private onPing: PingHandler | null = null
  private shouldConnect = false
  private reconnectDelay = MIN_RECONNECT_MS
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private appPingTimer: ReturnType<typeof setInterval> | null = null
  private pingId = 0
  private pendingPings = new Map<number, number>()

  connect(): void {
    this.shouldConnect = true
    if (this.socket?.readyState === WebSocket.OPEN) return
    this.openSocket()
  }

  disconnect(): void {
    this.shouldConnect = false
    this.clearReconnect()
    this.stopAppPing()
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

  setPingHandler(handler: PingHandler): void {
    this.onPing = handler
  }

  private openSocket(): void {
    this.socket = new WebSocket(getWebSocketUrl())

    this.socket.addEventListener('open', () => {
      this.reconnectDelay = MIN_RECONNECT_MS
      this.onStatus?.(true)
      this.startAppPing()
    })

    this.socket.addEventListener('close', () => {
      this.socket = null
      this.onStatus?.(false)
      this.stopAppPing()
      this.pendingPings.clear()
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
          return
        }
        if (data.type === 'pong') {
          const sentAt = this.pendingPings.get(data.id)
          if (sentAt !== undefined) {
            this.onPing?.(Date.now() - sentAt)
            this.pendingPings.delete(data.id)
          }
        }
      } catch {
        // Ignore malformed messages.
      }
    })
  }

  private startAppPing(): void {
    this.stopAppPing()
    this.sendAppPing()
    this.appPingTimer = setInterval(() => this.sendAppPing(), APP_PING_INTERVAL_MS)
  }

  private stopAppPing(): void {
    if (this.appPingTimer !== null) {
      clearInterval(this.appPingTimer)
      this.appPingTimer = null
    }
  }

  private sendAppPing(): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return
    const id = ++this.pingId
    const timestamp = Date.now()
    this.pendingPings.set(id, timestamp)
    this.socket.send(JSON.stringify({ type: 'ping', id, timestamp }))
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
