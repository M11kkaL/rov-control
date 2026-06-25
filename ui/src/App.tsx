import { useEffect, useState } from 'react'
import { VideoFeed, useSimBridge } from './components'
import { StatusBar } from './components/hud/StatusBar'
import { NavigationPanel } from './components/hud/NavigationPanel'
import { TelemetryOverlay } from './components/hud/TelemetryOverlay'
import { ThrusterPanel } from './components/hud/ThrusterPanel'
import { TelemetryPanel } from './components/hud/TelemetryPanel'
import { EventsLog } from './components/hud/EventsLog'
import { BottomGauges } from './components/hud/BottomGauges'
import type { UiControlFlags } from './components/controls/ActionButtons'
import { getOperationMode } from './config/app'
import { useCommandSender, useControlInput, useWebSocket } from './hooks'
import { useClock } from './hooks/useClock'
import styles from './App.module.scss'

function App() {
  const bridge = useSimBridge()
  const { connected, telemetry, service } = useWebSocket(bridge)
  const control = useControlInput()
  const time = useClock()
  const mode = getOperationMode()

  const [uiFlags, setUiFlags] = useState<UiControlFlags>({
    lights: false,
    lightsLevel: 0,
    holdDepth: false,
    stabilized: false,
    cameraTilt: false,
    manualCameraTilt: 0,
  })

  useEffect(() => {
    setUiFlags((prev) => ({
      ...prev,
      manualCameraTilt: telemetry.cameraTilt,
    }))
  }, [telemetry.cameraTilt])

  useCommandSender(service, control, uiFlags)

  const handleLightsLevel = (level: number) => {
    setUiFlags((prev) => ({
      ...prev,
      lightsLevel: level,
      lights: level > 0,
    }))
  }

  const handleLightsToggle = () => {
    setUiFlags((prev) => {
      const nextLevel = prev.lightsLevel > 0 ? 0 : 80
      return { ...prev, lightsLevel: nextLevel, lights: nextLevel > 0 }
    })
  }

  const handleCameraTilt = (tilt: number) => {
    setUiFlags((prev) => ({
      ...prev,
      manualCameraTilt: tilt,
      cameraTilt: true,
    }))
  }

  return (
    <div className={styles.shell}>
      <StatusBar connected={connected} flightMode={telemetry.flightMode} time={time} mode={mode} />

      <div className={styles.body}>
        <div className={styles.leftColumn}>
          <NavigationPanel x={telemetry.x} z={telemetry.z} depth={telemetry.depth} />
          <ThrusterPanel
            thrusters={telemetry.thrusters}
            lightsLevel={uiFlags.lightsLevel}
            cameraTilt={uiFlags.manualCameraTilt}
            uiFlags={uiFlags}
            onLightsLevel={handleLightsLevel}
            onCameraTilt={handleCameraTilt}
            onUiFlagsChange={setUiFlags}
          />
        </div>

        <main className={styles.center}>
          <VideoFeed bridge={bridge} />
          <TelemetryOverlay
            depth={telemetry.depth}
            pitch={telemetry.pitch}
            roll={telemetry.roll}
            heading={telemetry.heading}
            connected={connected}
            lightsLevel={uiFlags.lightsLevel}
            onLightsToggle={handleLightsToggle}
          />
          <BottomGauges
            heading={telemetry.heading}
            velocity={telemetry.velocity}
            depth={telemetry.depth}
            pitch={telemetry.pitch}
            roll={telemetry.roll}
          />
        </main>

        <div className={styles.rightColumn}>
          <TelemetryPanel
            battery={telemetry.battery}
            depth={telemetry.depth}
            velocity={telemetry.velocity}
            pitch={telemetry.pitch}
            roll={telemetry.roll}
            warnings={telemetry.warnings}
          />
          <EventsLog warnings={telemetry.warnings} connected={connected} depth={telemetry.depth} />
        </div>
      </div>
    </div>
  )
}

export default App
