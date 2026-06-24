import * as THREE from 'three'
import { buildPondEnvironment, type PondEnvironment } from './pond'

export type UnderwaterEnvironment = PondEnvironment

export function buildUnderwaterEnvironment(scene: THREE.Scene): UnderwaterEnvironment {
  return buildPondEnvironment(scene)
}

export { POND_RADIUS, MAX_DEPTH, pondDepthAt, isInWater, isOnShore } from './pond'
