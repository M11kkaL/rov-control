import * as THREE from 'three'

/** Layer visible to the nose camera */
export const WORLD_LAYER = 0
/** ROV body — hidden from FPV camera */
export const ROV_BODY_LAYER = 1

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020810)
  return scene
}

export function createRenderer(container: HTMLElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(0x020810)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.38
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)
  return renderer
}

export function resizeRenderer(
  renderer: THREE.WebGLRenderer,
  container: HTMLElement,
  camera: THREE.PerspectiveCamera,
): void {
  const { clientWidth, clientHeight } = container
  if (clientWidth === 0 || clientHeight === 0) return
  camera.aspect = clientWidth / clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(clientWidth, clientHeight)
}

export function createNoseCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(68, 16 / 9, 0.08, 120)
  camera.position.set(0, 0.08, -0.55)
  camera.rotation.order = 'YXZ'
  camera.layers.set(WORLD_LAYER)
  return camera
}

export function createHeadlight(): THREE.SpotLight {
  const light = new THREE.SpotLight(0xd8f0ff, 48, 30, Math.PI / 4.5, 0.4, 1.1)
  light.position.set(0, 0.04, -0.48)
  light.target.position.set(0, -0.5, -8)
  light.castShadow = true
  light.shadow.mapSize.set(512, 512)
  return light
}

export function hideFromNoseCamera(object: THREE.Object3D): void {
  object.layers.set(ROV_BODY_LAYER)
}
