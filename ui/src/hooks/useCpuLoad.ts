import { useEffect, useState } from 'react'

export function useCpuLoad(fps: number): number {
  const [cpu, setCpu] = useState(32)

  useEffect(() => {
    const target = Math.min(95, Math.max(18, 28 + (60 - Math.min(fps, 60)) * 1.2))
    setCpu((prev) => Math.round(prev * 0.85 + target * 0.15))
  }, [fps])

  return cpu
}
