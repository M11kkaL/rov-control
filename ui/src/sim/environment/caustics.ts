import * as THREE from 'three'
import { POND_RADIUS } from './pond'

function drawCausticPattern(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)

  for (let i = 0; i < 48; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const r = 18 + Math.random() * 42
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(180, 230, 255, 0.55)')
    g.addColorStop(0.45, 'rgba(120, 200, 230, 0.18)')
    g.addColorStop(1, 'rgba(80, 160, 200, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export type CausticsEffect = {
  update: (dt: number) => void
}

export function addCaustics(scene: THREE.Scene): CausticsEffect {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  drawCausticPattern(canvas)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 3)

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(POND_RADIUS * 1.9, POND_RADIUS * 1.9), material)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = -0.35
  scene.add(plane)

  const planeDeep = plane.clone()
  planeDeep.material = material.clone()
  ;(planeDeep.material as THREE.MeshBasicMaterial).opacity = 0.12
  planeDeep.position.y = -2.5
  planeDeep.scale.set(0.85, 0.85, 1)
  scene.add(planeDeep)

  let regenTimer = 0

  return {
    update(dt: number) {
      texture.offset.x += dt * 0.045
      texture.offset.y += dt * 0.028
      regenTimer += dt
      if (regenTimer > 6) {
        regenTimer = 0
        drawCausticPattern(canvas)
        texture.needsUpdate = true
      }
    },
  }
}
