import * as THREE from 'three'

/** Water surface radius (metres) — keep in sync with backend/internal/sim/pond.go */
export const POND_RADIUS = 38
/** Outer shore / land radius */
export const SHORE_RADIUS = 52
/** Max depth at pond centre (metres) */
export const MAX_DEPTH = 13
/** Stay this far from the shore boundary */
export const POND_MARGIN = 2

/** Depth in metres at horizontal position (0 on land beyond pond edge) */
export function pondDepthAt(x: number, z: number): number {
  const r = Math.hypot(x, z)
  if (r >= POND_RADIUS) return 0
  const t = 1 - r / POND_RADIUS
  return MAX_DEPTH * t * t
}

export function isInWater(x: number, z: number): boolean {
  return Math.hypot(x, z) < POND_RADIUS - POND_MARGIN
}

export function isOnShore(x: number, z: number): boolean {
  const r = Math.hypot(x, z)
  return r >= POND_RADIUS - 0.5 && r < SHORE_RADIUS
}

export type PondEnvironment = {
  update: (dt: number) => void
}

export function buildPondEnvironment(scene: THREE.Scene): PondEnvironment {
  scene.fog = new THREE.FogExp2(0x0e3858, 0.011)
  scene.background = new THREE.Color(0x0a2848)

  addLighting(scene)
  addTerrain(scene)
  addWaterSurface(scene)
  addShoreDetails(scene)
  addUnderwaterDetails(scene)
  addMarineSnow(scene)
  addLandVegetation(scene)

  return { update: () => {} }
}

function addLighting(scene: THREE.Scene): void {
  scene.add(new THREE.HemisphereLight(0x5098b8, 0x284838, 0.85))
  scene.add(new THREE.AmbientLight(0x284050, 0.55))

  const sun = new THREE.DirectionalLight(0xa8cce8, 0.78)
  sun.position.set(20, 35, 15)
  sun.castShadow = true
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 90
  sun.shadow.camera.left = -40
  sun.shadow.camera.right = 40
  sun.shadow.camera.top = 40
  sun.shadow.camera.bottom = -40
  sun.shadow.mapSize.set(1024, 1024)
  scene.add(sun)
}

function addTerrain(scene: THREE.Scene): void {
  const size = SHORE_RADIUS * 2 + 20
  const segments = 64
  const geo = new THREE.PlaneGeometry(size, size, segments, segments)
  geo.rotateX(-Math.PI / 2)

  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)

  const mud = new THREE.Color(0x3a3530)
  const sand = new THREE.Color(0xc8b090)
  const wetSand = new THREE.Color(0x8a7860)
  const grass = new THREE.Color(0x3a6838)
  const darkGrass = new THREE.Color(0x2a5028)

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const r = Math.hypot(x, z)
    let height: number
    let color: THREE.Color

    if (r < POND_RADIUS) {
      const depth = pondDepthAt(x, z)
      height = -depth
      color = depth > 6 ? mud : depth > 2 ? wetSand.clone().lerp(mud, (depth - 2) / 4) : sand
    } else if (r < SHORE_RADIUS) {
      const shoreT = (r - POND_RADIUS) / (SHORE_RADIUS - POND_RADIUS)
      height = 0.12 + shoreT * 0.25 + Math.sin(x * 0.4) * Math.cos(z * 0.35) * 0.08
      color = sand.clone().lerp(grass, shoreT * 0.6)
    } else {
      const landT = Math.min((r - SHORE_RADIUS) / 15, 1)
      height = 0.4 + landT * 1.2 + Math.sin(x * 0.15) * Math.cos(z * 0.12) * 0.5
      color = grass.clone().lerp(darkGrass, landT * 0.4)
    }

    pos.setY(i, height)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  pos.needsUpdate = true
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()

  const terrain = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0 }),
  )
  terrain.receiveShadow = true
  terrain.castShadow = true
  scene.add(terrain)
}

function addWaterSurface(scene: THREE.Scene): void {
  const surface = new THREE.Mesh(
    new THREE.CircleGeometry(POND_RADIUS, 48),
    new THREE.MeshStandardMaterial({
      color: 0x1a5070,
      transparent: true,
      opacity: 0.35,
      roughness: 0.15,
      metalness: 0.1,
    }),
  )
  surface.rotation.x = -Math.PI / 2
  surface.position.y = -0.02
  scene.add(surface)
}

function addShoreDetails(scene: THREE.Scene): void {
  addReeds(scene)
  addLilyPads(scene)
  addPier(scene)
  addShoreRocks(scene)
  addBoundaryMarkers(scene)
}

function addReeds(scene: THREE.Scene): void {
  const reedMat = new THREE.MeshStandardMaterial({ color: 0x4a6830, roughness: 0.85 })
  const reedDark = new THREE.MeshStandardMaterial({ color: 0x3a5028, roughness: 0.9 })

  for (let i = 0; i < 160; i++) {
    const angle = (i / 160) * Math.PI * 2 + (Math.random() - 0.5) * 0.15
    const r = POND_RADIUS - 0.3 + (Math.random() - 0.5) * 1.2
    const h = 0.6 + Math.random() * 1.4
    const reed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.04, h, 4),
      Math.random() > 0.5 ? reedMat : reedDark,
    )
    reed.position.set(Math.cos(angle) * r, h / 2 - 0.15, Math.sin(angle) * r)
    reed.rotation.z = (Math.random() - 0.5) * 0.2
    reed.rotation.x = (Math.random() - 0.5) * 0.15
    reed.castShadow = true
    scene.add(reed)
  }
}

function addLilyPads(scene: THREE.Scene): void {
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x2a6840,
    roughness: 0.7,
    side: THREE.DoubleSide,
  })
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = 10 + Math.random() * (POND_RADIUS - 12)
    const size = 0.25 + Math.random() * 0.35
    const pad = new THREE.Mesh(new THREE.CircleGeometry(size, 8), padMat)
    pad.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.1
    pad.position.set(Math.cos(angle) * r, -0.04, Math.sin(angle) * r)
    scene.add(pad)
  }
}

function addPier(scene: THREE.Scene): void {
  const wood = new THREE.MeshStandardMaterial({ color: 0x6a5038, roughness: 0.85 })
  const postMat = new THREE.MeshStandardMaterial({ color: 0x4a3828, roughness: 0.9 })

  const pierX = 0
  const pierStartZ = -SHORE_RADIUS + 2
  const pierEndZ = -POND_RADIUS + 3
  const plankCount = 14

  for (let i = 0; i < plankCount; i++) {
    const t = i / (plankCount - 1)
    const z = pierStartZ + t * (pierEndZ - pierStartZ)
    const plank = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.35), wood)
    plank.position.set(pierX, 0.18, z)
    plank.castShadow = true
    plank.receiveShadow = true
    scene.add(plank)

    if (i % 2 === 0) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.6, 6), postMat)
      post.position.set(pierX + (i % 4 === 0 ? 0.9 : -0.9), -0.5, z)
      post.castShadow = true
      scene.add(post)
    }
  }

  // Mooring bollard at pier end
  const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.35, 8), postMat)
  bollard.position.set(pierX, 0.35, pierEndZ)
  scene.add(bollard)
}

function addShoreRocks(scene: THREE.Scene): void {
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a5a58, roughness: 0.95 })
  for (let i = 0; i < 45; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = POND_RADIUS + 0.5 + Math.random() * (SHORE_RADIUS - POND_RADIUS - 1)
    const size = 0.15 + Math.random() * 0.55
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), rockMat)
    rock.position.set(
      Math.cos(angle) * r,
      0.12 + size * 0.3,
      Math.sin(angle) * r,
    )
    rock.rotation.set(Math.random(), Math.random(), Math.random())
    rock.castShadow = true
    scene.add(rock)
  }
}

function addBoundaryMarkers(scene: THREE.Scene): void {
  // Small posts marking the shore path around the pond
  const postMat = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.9 })
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2
    const r = SHORE_RADIUS - 1.5
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.9, 5), postMat)
    post.position.set(Math.cos(angle) * r, 0.45, Math.sin(angle) * r)
    post.castShadow = true
    scene.add(post)
  }
}

function addUnderwaterDetails(scene: THREE.Scene): void {
  addSubmergedRocks(scene)
  addAquaticPlants(scene)
  addSubmergedLogs(scene)
  addSunkenObjects(scene)
  addCenterFeature(scene)
}

function addSubmergedRocks(scene: THREE.Scene): void {
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a4845, roughness: 0.95 })
  for (let i = 0; i < 70; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = 2 + Math.random() * (POND_RADIUS - 3)
    const x = Math.cos(angle) * r
    const z = Math.sin(angle) * r
    const depth = pondDepthAt(x, z)
    if (depth < 0.4) continue

    const size = 0.2 + Math.random() * 1.1
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), rockMat)
    rock.position.set(x, -depth + size * 0.25, z)
    rock.rotation.set(Math.random(), Math.random(), Math.random())
    rock.castShadow = true
    scene.add(rock)
  }
}

function addAquaticPlants(scene: THREE.Scene): void {
  const plantMat = new THREE.MeshStandardMaterial({ color: 0x1a5838, roughness: 0.8 })
  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = 3 + Math.random() * (POND_RADIUS - 4)
    const x = Math.cos(angle) * r
    const z = Math.sin(angle) * r
    const depth = pondDepthAt(x, z)
    if (depth < 0.8 || depth > 7) continue

    const h = 0.5 + Math.random() * 1.8
    const plant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.06, h, 4), plantMat)
    plant.position.set(x, -depth + h / 2, z)
    plant.rotation.z = (Math.random() - 0.5) * 0.4
    plant.rotation.x = (Math.random() - 0.5) * 0.4
    scene.add(plant)
  }
}

function addSubmergedLogs(scene: THREE.Scene): void {
  const logMat = new THREE.MeshStandardMaterial({ color: 0x4a3828, roughness: 0.95 })
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = POND_RADIUS - 2 - Math.random() * 5
    const x = Math.cos(angle) * r
    const z = Math.sin(angle) * r
    const depth = pondDepthAt(x, z)
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.5 + Math.random(), 6), logMat)
    log.rotation.z = Math.PI / 2
    log.rotation.y = Math.random() * Math.PI
    log.position.set(x, -depth + 0.15, z)
    log.castShadow = true
    scene.add(log)
  }
}

function addSunkenObjects(scene: THREE.Scene): void {
  // Bucket
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.18, 0.35, 10, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x8a4040, roughness: 0.7, side: THREE.DoubleSide }),
  )
  bucket.position.set(8, -2.2, 5)
  bucket.rotation.z = 0.4
  bucket.rotation.x = 0.2
  scene.add(bucket)

  // Old bicycle wheel
  const tire = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.06, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }),
  )
  tire.position.set(-6, -3.5, -4)
  tire.rotation.x = Math.PI / 2
  tire.rotation.y = 0.5
  scene.add(tire)

  // Clay pot
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.14, 0.3, 10),
    new THREE.MeshStandardMaterial({ color: 0x9a6848, roughness: 0.85 }),
  )
  pot.position.set(4, -1.4, -10)
  pot.rotation.z = -0.3
  scene.add(pot)
}

function addCenterFeature(scene: THREE.Scene): void {
  // Stone cairn / rock pile at deepest point
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x606058, roughness: 0.9 })
  const positions: [number, number, number][] = [
    [0, 0, 0],
    [0.5, 0.35, 0.2],
    [-0.4, 0.55, -0.3],
    [0.2, 0.85, -0.4],
    [-0.3, 0.7, 0.5],
    [0, 1.05, 0.1],
  ]
  for (const [x, y, z] of positions) {
    const size = 0.5 + Math.random() * 0.4
    const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), stoneMat)
    stone.position.set(x, -MAX_DEPTH + y, z)
    stone.castShadow = true
    scene.add(stone)
  }
}

function addMarineSnow(scene: THREE.Scene): void {
  const count = 400
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = Math.random() * (POND_RADIUS - 1)
    const x = Math.cos(angle) * r
    const z = Math.sin(angle) * r
    const maxD = pondDepthAt(x, z)
    positions[i * 3] = x
    positions[i * 3 + 1] = -0.3 - Math.random() * Math.max(maxD - 0.3, 0.5)
    positions[i * 3 + 2] = z
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  scene.add(
    new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0x90b0c8,
        size: 0.03,
        transparent: true,
        opacity: 0.25,
        sizeAttenuation: true,
      }),
    ),
  )
}

function addLandVegetation(scene: THREE.Scene): void {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.9 })
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2a6830, roughness: 0.85 })

  for (let i = 0; i < 22; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = SHORE_RADIUS + 3 + Math.random() * 12
    const x = Math.cos(angle) * r
    const z = Math.sin(angle) * r

    const trunkH = 1.5 + Math.random() * 2
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, trunkH, 6), trunkMat)
    trunk.position.set(x, 0.4 + trunkH / 2, z)
    trunk.castShadow = true
    scene.add(trunk)

    const crown = new THREE.Mesh(new THREE.ConeGeometry(1.2 + Math.random(), 2.5 + Math.random(), 7), leafMat)
    crown.position.set(x, 0.4 + trunkH + 1, z)
    crown.castShadow = true
    scene.add(crown)
  }

  // Bushes on shore
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x3a5828, roughness: 0.9 })
  for (let i = 0; i < 35; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = POND_RADIUS + 1 + Math.random() * (SHORE_RADIUS - POND_RADIUS - 2)
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.35 + Math.random() * 0.45, 6, 5), bushMat)
    bush.position.set(Math.cos(angle) * r, 0.35, Math.sin(angle) * r)
    bush.scale.y = 0.7
    bush.castShadow = true
    scene.add(bush)
  }
}
