import * as THREE from 'three'
import type { SimTelemetry } from '../types'
import { CAM_TILT_RATE, MAX_CAM_TILT, MAX_PITCH, PITCH_RATE } from '../types'

type State = {
  depth: number
  heading: number
  pitch: number
  roll: number
  cameraTilt: number
  lights: boolean
  flightMode: SimTelemetry['flightMode']
  x: number
  z: number
  velocity: number
}

const START: State = {
  depth: 2,
  heading: 0,
  pitch: 0,
  roll: 0,
  cameraTilt: 0,
  lights: false,
  flightMode: 'manual',
  x: 0,
  z: 0,
  velocity: 0,
}

const HEADLIGHT_ON = 28
const HEADLIGHT_OFF = 0

export class ROVMovement {
  private target: State = { ...START }
  private display: State = { ...START }
  private vehiclePitchInput = 0
  private cameraTiltInput = 0

  setVehiclePitchInput(input: number): void {
    this.vehiclePitchInput = input
  }

  setCameraTiltInput(input: number): void {
    this.cameraTiltInput = input
  }

  syncFromBackend(
    depth: number,
    heading: number,
    pitch: number,
    roll: number,
    cameraTilt: number,
    lights: boolean,
    flightMode: SimTelemetry['flightMode'],
    x: number,
    z: number,
    velocity: number,
  ): void {
    this.target = { ...this.target, depth, heading, pitch, roll, cameraTilt, lights, flightMode, x, z, velocity }
  }

  update(
    dt: number,
    rovGroup: THREE.Group,
    camera: THREE.PerspectiveCamera,
    headlight: THREE.SpotLight,
  ): SimTelemetry {
    const t = 1 - Math.exp(-14 * dt)

    this.display.depth += (this.target.depth - this.display.depth) * t
    this.display.x += (this.target.x - this.display.x) * t
    this.display.z += (this.target.z - this.display.z) * t
    this.display.roll += (this.target.roll - this.display.roll) * t
    this.display.lights = this.target.lights

    let deltaHeading = this.target.heading - this.display.heading
    while (deltaHeading > 180) deltaHeading -= 360
    while (deltaHeading < -180) deltaHeading += 360
    this.display.heading += deltaHeading * t

    const pitchRad = (this.display.pitch * Math.PI) / 180
    const targetPitchRad = (this.target.pitch * Math.PI) / 180
    let pitchAngle = pitchRad + this.vehiclePitchInput * PITCH_RATE * dt
    pitchAngle += (targetPitchRad - pitchAngle) * Math.min(1, 8 * dt)
    pitchAngle = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitchAngle))
    this.display.pitch = (pitchAngle * 180) / Math.PI

    let camTiltRad = (this.display.cameraTilt * Math.PI) / 180
    const targetCamTiltRad = (this.target.cameraTilt * Math.PI) / 180
    camTiltRad += this.cameraTiltInput * CAM_TILT_RATE * dt
    camTiltRad += (targetCamTiltRad - camTiltRad) * Math.min(1, 8 * dt)
    camTiltRad = Math.max(-MAX_CAM_TILT, Math.min(MAX_CAM_TILT, camTiltRad))
    this.display.cameraTilt = (camTiltRad * 180) / Math.PI

    rovGroup.position.set(this.display.x, -this.display.depth, this.display.z)
    rovGroup.rotation.order = 'YXZ'
    rovGroup.rotation.y = (this.display.heading * Math.PI) / 180
    rovGroup.rotation.x = pitchAngle
    rovGroup.rotation.z = (this.display.roll * Math.PI) / 180

    camera.rotation.order = 'YXZ'
    camera.rotation.x = camTiltRad

    headlight.intensity = this.display.lights ? HEADLIGHT_ON : HEADLIGHT_OFF
    headlight.visible = this.display.lights

    return {
      depth: this.display.depth,
      heading: this.display.heading,
      pitch: this.display.pitch,
      roll: this.display.roll,
      cameraTilt: this.display.cameraTilt,
      lights: this.display.lights,
      flightMode: this.target.flightMode,
      velocity: this.target.velocity,
      x: this.display.x,
      z: this.display.z,
    }
  }
}
