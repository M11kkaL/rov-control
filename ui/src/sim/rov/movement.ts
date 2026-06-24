import * as THREE from 'three'
import type { SimTelemetry } from '../types'
import { MAX_PITCH, PITCH_RATE } from '../types'

type State = {
  depth: number
  heading: number
  pitch: number
  x: number
  z: number
  velocity: number
}

const START: State = { depth: 2, heading: 0, pitch: 0, x: 0, z: 0, velocity: 0 }

export class ROVMovement {
  private target: State = { ...START }
  private display: State = { ...START }
  private pitchInput = 0

  setPitchInput(input: number): void {
    this.pitchInput = input
  }

  syncFromBackend(
    depth: number,
    heading: number,
    pitch: number,
    x: number,
    z: number,
    velocity: number,
  ): void {
    this.target = { depth, heading, pitch, x, z, velocity }
  }

  update(dt: number, rovGroup: THREE.Group): SimTelemetry {
    const t = 1 - Math.exp(-14 * dt)

    this.display.depth += (this.target.depth - this.display.depth) * t
    this.display.x += (this.target.x - this.display.x) * t
    this.display.z += (this.target.z - this.display.z) * t

    let deltaHeading = this.target.heading - this.display.heading
    while (deltaHeading > 180) deltaHeading -= 360
    while (deltaHeading < -180) deltaHeading += 360
    this.display.heading += deltaHeading * t

    const pitchRad = (this.display.pitch * Math.PI) / 180
    const targetPitchRad = (this.target.pitch * Math.PI) / 180
    let pitchAngle = pitchRad + this.pitchInput * PITCH_RATE * dt
    pitchAngle += (targetPitchRad - pitchAngle) * Math.min(1, 8 * dt)
    pitchAngle = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitchAngle))
    this.display.pitch = (pitchAngle * 180) / Math.PI

    rovGroup.position.set(this.display.x, -this.display.depth, this.display.z)
    rovGroup.rotation.order = 'YXZ'
    rovGroup.rotation.y = (this.display.heading * Math.PI) / 180
    rovGroup.rotation.x = pitchAngle

    return {
      depth: this.display.depth,
      heading: this.display.heading,
      pitch: this.display.pitch,
      velocity: this.target.velocity,
      x: this.display.x,
      z: this.display.z,
    }
  }
}
