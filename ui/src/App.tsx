import { useState } from 'react'
import { VideoFeed, useSimBridge } from './components'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HudPanel } from './components/hud/HudPanel'
import { HudFrame } from './components/layout/HudFrame'
import { Sidebar } from './components/layout/Sidebar'
import { MapIcon, InputIcon } from './components/layout/icons'
import { MissionOverlay } from './components/hud/MissionOverlay'
import { GamepadStatus } from './components/controls/GamepadStatus'
import type { UiControlFlags } from './components/controls/ActionButtons'
import { getOperationMode } from './config/app'
import { useCommandSender, useControlInput, useGamepadConnected, useWebSocket } from './hooks'
import { useClock } from './hooks/useClock'
import { useTelemetryRecorder } from './hooks/useTelemetryRecorder'

const LEFT_TABS = [
  { id: 'mission', label: 'Map', icon: <MapIcon /> },
  { id: 'input', label: 'Input', icon: <InputIcon /> },
]

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

  const [leftTab, setLeftTab] = useState('mission')
  const [leftExpanded, setLeftExpanded] = useState(true)

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

      <div className="flex min-h-0 flex-1">
        <Sidebar
          side="left"
          expanded={leftExpanded}
          onToggleExpanded={() => setLeftExpanded((v) => !v)}
          tabs={LEFT_TABS}
          activeTab={leftTab}
          onTabChange={setLeftTab}
        >
          <div className="p-2">
            {leftTab === 'mission' && (
              <MissionOverlay x={telemetry.x} z={telemetry.z} velocity={telemetry.velocity} />
            )}
            {leftTab === 'input' && (
              <GamepadStatus
                control={control}
                gamepadConnected={gamepadConnected}
                cameraTiltMode={uiFlags.cameraTilt}
              />
            )}
          </div>
        </Sidebar>

        <main className="relative min-h-0 min-w-0 flex-1">
          <VideoFeed bridge={bridge} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,8,16,0.55)_100%)]" />
          <HudFrame />
          <HudPanel telemetry={telemetry} connected={connected} />
        </main>
      </div>

      <Footer
        control={control}
        telemetry={telemetry}
        uiFlags={uiFlags}
        onUiFlagsChange={setUiFlags}
      />
    </div>
  )
}

export default App
