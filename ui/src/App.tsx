import { useState } from 'react'
import { VideoFeed, useSimBridge } from './components'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HudPanel } from './components/hud/HudPanel'
import type { UiControlFlags } from './components/controls/ActionButtons'
import { getOperationMode } from './config/app'
import { useCommandSender, useControlInput, useGamepadConnected, useWebSocket } from './hooks'
import { useClock } from './hooks/useClock'
import { useTelemetryRecorder } from './hooks/useTelemetryRecorder'

function App() {
  const bridge = useSimBridge()
  const { connected, telemetry, ping, service } = useWebSocket(bridge)
  const control = useControlInput()
  const gamepadConnected = useGamepadConnected()
  const time = useClock()
  const mode = getOperationMode()

  const [uiFlags, setUiFlags] = useState<UiControlFlags>({
    lights: false,
    holdDepth: false,
    stabilized: false,
    cameraTilt: false,
  })
  const [recording, setRecording] = useState(false)
  const { frameCount, download } = useTelemetryRecorder(telemetry, recording)

  useCommandSender(service, control, uiFlags)

  const handleToggleRecording = () => {
    if (recording) {
      download('jsonl')
      setRecording(false)
      return
    }
    setRecording(true)
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-bg-dark">
      <Header
        mode={mode}
        connected={connected}
        ping={ping}
        time={time}
        recording={recording}
        recordFrames={frameCount}
        onToggleRecording={handleToggleRecording}
      />

      <main className="relative min-h-0 flex-1">
        <VideoFeed bridge={bridge} />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,8,16,0.8)]" />
        <HudPanel telemetry={telemetry} connected={connected} />
      </main>

      <Footer
        control={control}
        telemetry={telemetry}
        gamepadConnected={gamepadConnected}
        uiFlags={uiFlags}
        onUiFlagsChange={setUiFlags}
      />
    </div>
  )
}

export default App
