import * as THREE from 'three'
import {
  createRenderer,
  createScene,
  resizeRenderer,
} from './core/scene'
import { buildUnderwaterEnvironment } from './environment/underwater'
import { BackendCommandBridge } from './controls/backendBridge'
import { createROV } from './rov/mesh'
import { ROVMovement } from './rov/movement'
import type { SimTelemetry } from './types'

export class SimEngine {
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private camera: THREE.PerspectiveCamera
  private rovGroup: THREE.Group
  private movement: ROVMovement
  private bridge: BackendCommandBridge
  private container: HTMLElement
  private frameId = 0
  private lastTime = 0
  private onSimTelemetry: ((t: SimTelemetry) => void) | null = null
  private resizeObserver: ResizeObserver

  constructor(container: HTMLElement, bridge: BackendCommandBridge) {
    this.container = container
    this.bridge = bridge
    this.movement = new ROVMovement()

    this.scene = createScene()
    buildUnderwaterEnvironment(this.scene)

    const rov = createROV()
    this.rovGroup = rov.group
    this.camera = rov.camera
    this.scene.add(this.rovGroup)

    this.renderer = createRenderer(container)

    this.bridge.onCommand((cmd) => this.movement.applyCommand(cmd))
    this.bridge.onTelemetry((t) =>
      this.movement.syncFromBackend(t.depth, t.heading, t.x, t.z, t.velocity),
    )

    this.resizeObserver = new ResizeObserver(() => {
      resizeRenderer(this.renderer, this.container, this.camera)
    })
    this.resizeObserver.observe(container)
    resizeRenderer(this.renderer, this.container, this.camera)
  }

  setTelemetryHandler(handler: (telemetry: SimTelemetry) => void): void {
    this.onSimTelemetry = handler
  }

  start(): void {
    this.lastTime = performance.now()
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.05)
      this.lastTime = time

      const telemetry = this.movement.update(dt, this.rovGroup)
      this.onSimTelemetry?.(telemetry)

      this.renderer.render(this.scene, this.camera)
      this.frameId = requestAnimationFrame(loop)
    }
    this.frameId = requestAnimationFrame(loop)
  }

  stop(): void {
    cancelAnimationFrame(this.frameId)
  }

  dispose(): void {
    this.stop()
    this.resizeObserver.disconnect()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}

export { BackendCommandBridge } from './controls/backendBridge'
