import * as THREE from 'three'
import { pondDepthAt } from './pond'

const TARGET_X = 12
const TARGET_Z = -8

export type InspectionTarget = {
  group: THREE.Group
  position: { x: number; z: number }
}

export function addInspectionTarget(scene: THREE.Scene): InspectionTarget {
  const depth = pondDepthAt(TARGET_X, TARGET_Z)
  const group = new THREE.Group()
  group.position.set(TARGET_X, -depth + 0.15, TARGET_Z)

  const metal = new THREE.MeshStandardMaterial({
    color: 0x6a7888,
    metalness: 0.72,
    roughness: 0.32,
  })
  const rubber = new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.92 })
  const markerMat = new THREE.MeshStandardMaterial({
    color: 0x2ce8d4,
    emissive: 0x2ce8d4,
    emissiveIntensity: 1.1,
    metalness: 0.2,
    roughness: 0.4,
  })

  const platform = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 1.8), rubber)
  platform.position.y = 0.09
  platform.receiveShadow = true
  group.add(platform)

  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.2, 20), metal)
  pipe.rotation.z = Math.PI / 2
  pipe.position.y = 0.55
  pipe.castShadow = true
  group.add(pipe)

  const valveBody = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.35, 16), metal)
  valveBody.position.set(0.55, 0.55, 0)
  valveBody.castShadow = true
  group.add(valveBody)

  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 8, 20), markerMat)
  wheel.rotation.y = Math.PI / 2
  wheel.position.set(0.95, 0.55, 0)
  group.add(wheel)

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 8, 28), markerMat)
  ring.rotation.x = Math.PI / 2
  ring.position.set(-0.35, 0.55, 0)
  group.add(ring)

  const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), markerMat)
  post.position.set(-0.9, 0.65, 0.55)
  group.add(post)

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), markerMat)
  beacon.position.set(-0.9, 1.2, 0.55)
  group.add(beacon)

  const glow = new THREE.PointLight(0x2ce8d4, 0.55, 9)
  glow.position.set(-0.35, 0.8, 0)
  group.add(glow)

  addCableRun(group, metal)
  addSeabedRocks(scene, TARGET_X, TARGET_Z, depth)

  scene.add(group)

  return {
    group,
    position: { x: TARGET_X, z: TARGET_Z },
  }
}

function addCableRun(group: THREE.Group, material: THREE.Material): void {
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8), material)
  cable.rotation.z = Math.PI / 2
  cable.position.set(-0.2, 0.12, -0.55)
  group.add(cable)
}

function addSeabedRocks(scene: THREE.Scene, cx: number, cz: number, depth: number): void {
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a4a48, roughness: 0.96 })
  const mossMat = new THREE.MeshStandardMaterial({ color: 0x2a5840, roughness: 0.88 })

  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2
    const r = 1.2 + (i % 3) * 0.35
    const size = 0.18 + (i % 4) * 0.12
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), i % 2 === 0 ? rockMat : mossMat)
    rock.position.set(cx + Math.cos(angle) * r, -depth + size * 0.2, cz + Math.sin(angle) * r)
    rock.rotation.set(Math.random(), Math.random(), Math.random())
    rock.castShadow = true
    scene.add(rock)
  }
}
