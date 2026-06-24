export const APP_VERSION = '0.1.0'
export const APP_NAME = 'ROV System'

export type OperationMode = 'SIM' | 'LIVE'

export function getOperationMode(): OperationMode {
  const mode = import.meta.env.VITE_ROV_MODE?.toUpperCase()
  return mode === 'LIVE' ? 'LIVE' : 'SIM'
}
