import { useRef } from 'react'
import { useSimulator } from '../hooks/useSimulator'
import { BackendCommandBridge } from '../sim'

type VideoFeedProps = {
  bridge: BackendCommandBridge
}

export function VideoFeed({ bridge }: VideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useSimulator(containerRef, bridge)

  return <div ref={containerRef} className="video-feed" />
}

export function useSimBridge(): BackendCommandBridge {
  const bridgeRef = useRef<BackendCommandBridge | null>(null)
  if (!bridgeRef.current) {
    bridgeRef.current = new BackendCommandBridge()
  }
  return bridgeRef.current
}
