import { useCallback, useRef } from 'react'

export function useVideoRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const start = useCallback((container: HTMLElement | null): boolean => {
    const canvas = container?.querySelector('canvas')
    if (!canvas || typeof canvas.captureStream !== 'function') return false

    chunksRef.current = []
    const stream = canvas.captureStream(30)
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'

    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 })
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data)
    }
    recorder.start(250)
    recorderRef.current = recorder
    return true
  }, [])

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        resolve(null)
        return
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' })
        recorderRef.current = null
        chunksRef.current = []
        resolve(blob.size > 0 ? blob : null)
      }
      recorder.stop()
    })
  }, [])

  const download = useCallback((blob: Blob) => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rov-video-${stamp}.webm`
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  return { start, stop, download }
}
