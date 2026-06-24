import * as THREE from 'three'

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x061018)
  return scene
}

export function createRenderer(container: HTMLElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(0x061018)
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
  const camera = new THREE.PerspectiveCamera(70, 16 / 9, 0.05, 200)
  // First-person nose camera at the front of the ROV, looking forward (-Z).
  camera.position.set(0, 0.12, -0.45)
  camera.rotation.order = 'YXZ'
  return camera
}
