import { useState } from 'react'
import { VideoFeed, useSimBridge } from './components'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HudPanel } from './components/hud/HudPanel'
import type { UiControlFlags } from './components/controls/ActionButtons'
import { getOperationMode } from './config/app'
import { useCommandSender, useControlInput, useGamepadConnected, useWebSocket } from './hooks'
import { useClock } from './hooks/useClock'
import { usePing } from './hooks/usePing'

function App() {
  const bridge = useSimBridge()
  const { connected, telemetry, service } = useWebSocket(bridge)
  const control = useControlInput()
  const gamepadConnected = useGamepadConnected()
  const time = useClock()
  const ping = usePing(connected, telemetry.timestamp)
  const mode = getOperationMode()

  const [uiFlags, setUiFlags] = useState<UiControlFlags>({
    lights: false,
    holdDepth: false,
    cameraTilt: false,
  })

  useCommandSender(service, control)

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-bg-dark">
      <Header
        mode={mode}
        connected={connected}
        ping={ping}
        time={time}
        recording={connected}
      />

      <main className="relative min-h-0 flex-1">
        <VideoFeed bridge={bridge} />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,8,16,0.8)]" />
        <HudPanel telemetry={telemetry} connected={connected} holdDepth={uiFlags.holdDepth} />
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
