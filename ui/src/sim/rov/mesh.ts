import * as THREE from 'three'
import { createNoseCamera } from '../core/scene'

export type ROVParts = {
  group: THREE.Group
  camera: THREE.PerspectiveCamera
}

export function createROV(): ROVParts {
  const group = new THREE.Group()

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a3540, metalness: 0.4, roughness: 0.6 })
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x3dd6c6, emissive: 0x0a3028 })

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 1.0), bodyMat)
  body.position.set(0, -0.05, 0)
  group.add(body)

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.25), accentMat)
  nose.position.set(0, -0.02, -0.55)
  group.add(nose)

  const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x111820 })
  const thrusterPositions: [number, number, number][] = [
    [0, 0, 0.55],
    [0, 0, -0.55],
    [-0.42, 0, 0],
    [0.42, 0, 0],
    [0, -0.28, 0],
  ]
  for (const [x, y, z] of thrusterPositions) {
    const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8), thrusterMat)
    thruster.rotation.x = Math.PI / 2
    thruster.position.set(x, y, z)
    group.add(thruster)
  }

  const camera = createNoseCamera()
  group.add(camera)

  group.position.set(0, -0.5, 0)
  return { group, camera }
}
