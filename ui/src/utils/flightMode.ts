import type { UiControlFlags } from '../components/controls/ActionButtons'
import type { FlightMode } from '../types'

export function deriveFlightMode(flags: UiControlFlags): FlightMode {
  if (flags.holdDepth) return 'hold_depth'
  if (flags.stabilized) return 'stabilized'
  return 'manual'
}
