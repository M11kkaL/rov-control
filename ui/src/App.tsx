import { useEffect, useRef, useState } from 'react'
import { VideoFeed, useSimBridge } from './components'
import { StatusBar } from './components/hud/StatusBar'
import { RadarPanel } from './components/hud/RadarPanel'
import { NavigationPanel } from './components/hud/NavigationPanel'
import { TelemetryOverlay } from './components/hud/TelemetryOverlay'
import { ThrusterPanel } from './components/hud/ThrusterPanel'
import { TelemetryPanel } from './components/hud/TelemetryPanel'
import { EventsLog } from './components/hud/EventsLog'
import { BottomGauges } from './components/hud/BottomGauges'
import { ControlSliders } from './components/hud/ControlSliders'
import { KeyboardHelp } from './components/hud/KeyboardHelp'
import type { UiControlFlags } from './components/controls/ActionButtons'
import { getOperationMode } from './config/app'
import { useCommandSender, useControlInput, useWebSocket } from './hooks'
import { useClock } from './hooks/useClock'
import { useKeyboardHelp } from './hooks/useKeyboardHelp'
import { useRecordingTimer } from './hooks/useRecordingTimer'
import { useTelemetryRecorder } from './hooks/useTelemetryRecorder'
import { useVideoRecorder } from './hooks/useVideoRecorder'
import { captureViewportPhoto } from './utils/cameraCapture'
import styles from './App.module.scss'

function App() {
  const bridge = useSimBridge()
  const videoRef = useRef<HTMLDivElement>(null)
  const { connected, telemetry, service } = useWebSocket(bridge)
  const control = useControlInput()
  const time = useClock()
  const mode = getOperationMode()
  const { open: helpOpen, setOpen: setHelpOpen } = useKeyboardHelp()
  const videoRecorder = useVideoRecorder()

  const [uiFlags, setUiFlags] = useState<UiControlFlags>({
    lights: false,
    lightsLevel: 0,
    holdDepth: false,
    stabilized: false,
    cameraTilt: false,
    manualCameraTilt: 0,
  })
  const [assist, setAssist] = useState({ cruiseSpeed: 0, holdDepthTarget: 2 })
  const [waypoint, setWaypoint] = useState<{ x: number; z: number } | null>(null)
  const [recording, setRecording] = useState(false)
  const [photoFlash, setPhotoFlash] = useState(false)
  const [captureToast, setCaptureToast] = useState<string | null>(null)
  const depthSynced = useRef(false)

  const recordElapsed = useRecordingTimer(recording)
  const { frameCount, download } = useTelemetryRecorder(telemetry, recording)

  useEffect(() => {
    setUiFlags((prev) => ({
      ...prev,
      manualCameraTilt: telemetry.cameraTilt,
    }))
  }, [telemetry.cameraTilt])

  useEffect(() => {
    if (depthSynced.current || telemetry.timestamp <= 0) return
    depthSynced.current = true
    setAssist((prev) => ({ ...prev, holdDepthTarget: telemetry.depth }))
  }, [telemetry.depth, telemetry.timestamp])

  useCommandSender(service, control, uiFlags, assist)

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

  const handleToggleRecording = async () => {
    if (recording) {
      const blob = await videoRecorder.stop()
      download('jsonl')
      if (blob) {
        videoRecorder.download(blob)
        setCaptureToast('REC saved (video + telemetry)')
      } else {
        setCaptureToast('Telemetry saved')
      }
      window.setTimeout(() => setCaptureToast(null), 2200)
      setRecording(false)
      return
    }
    const started = videoRecorder.start(videoRef.current)
    if (!started) {
      setCaptureToast('Video capture unavailable')
      window.setTimeout(() => setCaptureToast(null), 1800)
    }
    setRecording(true)
  }

  const handleCapturePhoto = () => {
    const ok = captureViewportPhoto(videoRef.current)
    setPhotoFlash(true)
    setCaptureToast(ok ? 'Photo saved' : 'Capture failed')
    window.setTimeout(() => setPhotoFlash(false), 220)
    window.setTimeout(() => setCaptureToast(null), 1800)
  }

  const handleTargetDepthChange = (depth: number) => {
    setAssist((prev) => ({ ...prev, holdDepthTarget: depth }))
    setUiFlags((prev) => ({ ...prev, holdDepth: true }))
  }

  return (
    <div className={styles.shell}>
      <StatusBar connected={connected} flightMode={telemetry.flightMode} time={time} mode={mode} />
      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />

      <div className={styles.body}>
        <div className={styles.leftColumn}>
          <RadarPanel heading={telemetry.heading} x={telemetry.x} z={telemetry.z} waypoint={waypoint} />
          <NavigationPanel
            x={telemetry.x}
            z={telemetry.z}
            depth={telemetry.depth}
            waypoint={waypoint}
            onSetWaypoint={setWaypoint}
            onClearWaypoint={() => setWaypoint(null)}
          />
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
          <VideoFeed ref={videoRef} bridge={bridge} />
          <TelemetryOverlay
            depth={telemetry.depth}
            pitch={telemetry.pitch}
            roll={telemetry.roll}
            heading={telemetry.heading}
            connected={connected}
            lightsLevel={uiFlags.lightsLevel}
            recording={recording}
            recordElapsed={recordElapsed}
            recordFrames={frameCount}
            photoFlash={photoFlash}
            captureToast={captureToast}
            onLightsToggle={handleLightsToggle}
            onToggleRecording={handleToggleRecording}
            onCapturePhoto={handleCapturePhoto}
          />
          <BottomGauges
            heading={telemetry.heading}
            velocity={telemetry.velocity}
            depth={telemetry.depth}
            pitch={telemetry.pitch}
            roll={telemetry.roll}
          />
          <ControlSliders
            velocity={telemetry.velocity}
            depth={telemetry.depth}
            cruiseSpeed={assist.cruiseSpeed}
            targetDepth={assist.holdDepthTarget}
            onCruiseSpeedChange={(cruiseSpeed) => setAssist((prev) => ({ ...prev, cruiseSpeed }))}
            onTargetDepthChange={handleTargetDepthChange}
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
