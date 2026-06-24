import * as THREE from 'three'

export function buildUnderwaterEnvironment(scene: THREE.Scene): void {
  scene.fog = new THREE.FogExp2(0x061830, 0.045)

  const ambient = new THREE.AmbientLight(0x1a3050, 0.9)
  scene.add(ambient)

  const sun = new THREE.DirectionalLight(0x4080b0, 0.6)
  sun.position.set(5, 20, -5)
  scene.add(sun)

  const seabed = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x1a2830, roughness: 1 }),
  )
  seabed.rotation.x = -Math.PI / 2
  seabed.position.y = 0
  scene.add(seabed)

  const grid = new THREE.GridHelper(120, 60, 0x1e4050, 0x122830)
  grid.position.y = 0.02
  scene.add(grid)

  addParticles(scene)
  addRocks(scene)
}

function addParticles(scene: THREE.Scene): void {
  const count = 400
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40
    positions[i * 3 + 1] = -Math.random() * 25
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0x6aa0c0,
    size: 0.06,
    transparent: true,
    opacity: 0.35,
  })

  scene.add(new THREE.Points(geometry, material))
}

function addRocks(scene: THREE.Scene): void {
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x2a3840, roughness: 0.95 })
  for (let i = 0; i < 12; i++) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.8, 0),
      rockMat,
    )
    rock.position.set(
      (Math.random() - 0.5) * 50,
      0.2,
      (Math.random() - 0.5) * 50,
    )
    rock.rotation.set(Math.random(), Math.random(), Math.random())
    scene.add(rock)
  }
}
