const DEFAULT_WS_URL = 'ws://localhost:8080/ws'

export function getWebSocketUrl(): string {
  return import.meta.env.VITE_WS_URL ?? DEFAULT_WS_URL
}
