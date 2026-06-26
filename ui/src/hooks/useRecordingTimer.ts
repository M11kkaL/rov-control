import { useEffect, useState } from 'react'

export function useRecordingTimer(recording: boolean): string {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!recording) {
      setElapsed(0)
      return
    }

    const start = Date.now()
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)

    return () => clearInterval(id)
  }, [recording])

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
