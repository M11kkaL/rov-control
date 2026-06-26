import { forwardRef, useRef } from 'react'
import { useSimulator } from '../hooks/useSimulator'
import { BackendCommandBridge } from '../sim'

type VideoFeedProps = {
  bridge: BackendCommandBridge
}

export const VideoFeed = forwardRef<HTMLDivElement, VideoFeedProps>(function VideoFeed(
  { bridge },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  useSimulator(containerRef, bridge)

  const setRef = (node: HTMLDivElement | null) => {
    containerRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }

  return <div ref={setRef} className="video-feed" />
})

export function useSimBridge(): BackendCommandBridge {
  const bridgeRef = useRef<BackendCommandBridge | null>(null)
  if (!bridgeRef.current) {
    bridgeRef.current = new BackendCommandBridge()
  }
  return bridgeRef.current
}
