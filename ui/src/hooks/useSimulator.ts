import { useEffect, useRef, type RefObject } from 'react'
import { SimEngine, type BackendCommandBridge } from '../sim'

export function useSimulator(
  containerRef: RefObject<HTMLDivElement | null>,
  bridge: BackendCommandBridge,
) {
  const engineRef = useRef<SimEngine | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const engine = new SimEngine(container, bridge)
    engineRef.current = engine
    engine.start()

    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, [containerRef, bridge])
}
