export function captureViewportPhoto(container: HTMLElement | null): boolean {
  const canvas = container?.querySelector('canvas')
  if (!canvas) return false

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const link = document.createElement('a')
  link.download = `rov-photo-${stamp}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
  return true
}
