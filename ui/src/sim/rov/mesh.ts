import * as THREE from 'three'
import { createHeadlight, createNoseCamera, hideFromNoseCamera } from '../core/scene'

export type ROVParts = {
  group: THREE.Group
  camera: THREE.PerspectiveCamera
  headlight: THREE.SpotLight
}

export function createROV(): ROVParts {
  const group = new THREE.Group()

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x1e2830,
    metalness: 0.55,
    roughness: 0.45,
  })
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x3dd6c6,
    emissive: 0x0a2820,
    metalness: 0.3,
    roughness: 0.4,
  })

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.32, 0.88), hullMat)
  body.position.set(0, -0.04, 0.05)
  body.castShadow = true
  group.add(body)

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.32), accentMat)
  nose.position.set(0, -0.02, -0.48)
  nose.castShadow = true
  group.add(nose)

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0x88a0b0,
      metalness: 0.1,
      roughness: 0.15,
      transparent: true,
      opacity: 0.75,
    }),
  )
  dome.rotation.x = -Math.PI / 2
  dome.position.set(0, 0.02, -0.52)
  group.add(dome)

  const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x0a1018, metalness: 0.8, roughness: 0.3 })
  const thrusterPositions: [number, number, number][] = [
    [0, 0, 0.52],
    [0, 0, -0.62],
    [-0.38, 0, 0],
    [0.38, 0, 0],
    [0, -0.24, 0.05],
  ]
  for (const [x, y, z] of thrusterPositions) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 6, 12), thrusterMat)
    ring.rotation.y = Math.PI / 2
    ring.position.set(x, y, z)
    group.add(ring)
  }

  // Hide all ROV geometry from the nose camera — FPV shows only the world
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      hideFromNoseCamera(child)
    }
  })

  const camera = createNoseCamera()
  const headlight = createHeadlight()
  group.add(camera)
  group.add(headlight)
  group.add(headlight.target)

  group.position.set(0, -2, 0)
  return { group, camera, headlight }
}
