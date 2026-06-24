import * as THREE from 'three'
import type { ControlCommand } from '../../types'
import { SIM_RATES, type SimTelemetry } from '../types'

export class ROVMovement {
  depth = 0.5
  heading = 0
  x = 0
  z = 0
  velocity = 0

  private lastX = 0
  private lastZ = 0
  private lastDepth = 0.5
  private lastCommand: ControlCommand = {
    throttle: 0,
    yaw: 0,
    vertical: 0,
    lateral: 0,
  }

  applyCommand(command: ControlCommand): void {
    this.lastCommand = command
  }

  syncFromBackend(depth: number, heading: number, x: number, z: number, velocity: number): void {
    this.depth = depth
    this.heading = heading
    this.x = x
    this.z = z
    this.velocity = velocity
    this.lastX = x
    this.lastZ = z
    this.lastDepth = depth
  }

  update(dt: number, rovGroup: THREE.Group): SimTelemetry {
    const cmd = this.lastCommand

    if (cmd.emergencyStop) {
      this.velocity = 0
      this.applyTransform(rovGroup)
      return this.getTelemetry()
    }

    this.lastX = this.x
    this.lastZ = this.z
    this.lastDepth = this.depth

    this.depth += cmd.vertical * SIM_RATES.depth * dt
    if (this.depth < 0) this.depth = 0

    this.heading = ((this.heading + cmd.yaw * SIM_RATES.heading * dt) % 360 + 360) % 360

    const rad = (this.heading * Math.PI) / 180
    const forward = cmd.throttle * SIM_RATES.move * dt
    const strafe = cmd.lateral * SIM_RATES.move * dt
    this.x += forward * Math.cos(rad) - strafe * Math.sin(rad)
    this.z += forward * Math.sin(rad) + strafe * Math.cos(rad)

    const dx = this.x - this.lastX
    const dz = this.z - this.lastZ
    const dy = this.depth - this.lastDepth
    if (dt > 0) {
      this.velocity = Math.sqrt(dx * dx + dz * dz + dy * dy) / dt
    }

    this.applyTransform(rovGroup)
    return this.getTelemetry()
  }

  getTelemetry(): SimTelemetry {
    return {
      depth: this.depth,
      heading: this.heading,
      velocity: this.velocity,
      x: this.x,
      z: this.z,
    }
  }

  private applyTransform(rovGroup: THREE.Group): void {
    rovGroup.position.set(this.x, -this.depth, this.z)
    rovGroup.rotation.y = (this.heading * Math.PI) / 180
  }
}
