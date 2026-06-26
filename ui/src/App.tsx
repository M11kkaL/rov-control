import { useEffect, useRef, useState } from 'react'
import { VideoFeed, useSimBridge } from './components'
import { StatusBar } from './components/hud/StatusBar'
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
import type { Telemetry } from './types'
import { captureViewportPhoto } from './utils/cameraCapture'
import {
  messageForSaveResult,
  saveRecordingBundle,
  saveTelemetryFrames,
  saveVideoBlob,
  shouldClearAfterSave,
} from './utils/recordingExport'
import styles from './App.module.scss'

type PendingExport = {
  frames: Telemetry[]
  video: Blob | null
}

function applyExportRemoval(
  prev: PendingExport | null,
  remove: { telemetry?: boolean; video?: boolean },
): PendingExport | null {
  if (!prev) return null
  const next: PendingExport = {
    frames: remove.telemetry ? [] : prev.frames,
    video: remove.video ? null : prev.video,
  }
  return next.frames.length > 0 || next.video ? next : null
}

function App() {
  const bridge = useSimBridge()
  const videoRef = useRef<HTMLDivElement>(null)
  const { connected, telemetry, service } = useWebSocket(bridge)
  const control = useControlInput()
  const time = useClock()
  const mode = getOperationMode()
  const { open: helpOpen, setOpen: setHelpOpen } = useKeyboardHelp()
  const videoRecorder = useVideoRecorder()
  const toastTimerRef = useRef(0)

  const [uiFlags, setUiFlags] = useState<UiControlFlags>({
    lights: false,
    lightsLevel: 0,
    holdDepth: false,
    stabilized: false,
    cameraTilt: false,
    manualCameraTilt: 0,
  })
  const [assist, setAssist] = useState({ cruiseSpeed: 0 })
  const [waypoint, setWaypoint] = useState<{ x: number; z: number } | null>(null)
  const [recording, setRecording] = useState(false)
  const [photoFlash, setPhotoFlash] = useState(false)
  const [captureToast, setCaptureToast] = useState<string | null>(null)
  const [pendingExport, setPendingExport] = useState<PendingExport | null>(null)
  const [savingRecording, setSavingRecording] = useState(false)
  const stopRecordingRef = useRef(false)

  const recordElapsed = useRecordingTimer(recording)
  const { frameCount, clearBuffer, snapshotFrames, downloadFrames } = useTelemetryRecorder(telemetry, recording)

  const showToast = (message: string, durationMs = 2200) => {
    window.clearTimeout(toastTimerRef.current)
    setCaptureToast(message)
    toastTimerRef.current = window.setTimeout(() => setCaptureToast(null), durationMs)
  }

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current)
  }, [])

  useEffect(() => {
    setUiFlags((prev) => ({
      ...prev,
      manualCameraTilt: telemetry.cameraTilt,
    }))
  }, [telemetry.cameraTilt])

  useCommandSender(service, control, uiFlags, assist)

  const exportPrompt =
    pendingExport && (pendingExport.frames.length > 0 || pendingExport.video)
      ? {
          frameCount: pendingExport.frames.length,
          hasVideo: pendingExport.video !== null,
          canSaveAll: pendingExport.frames.length > 0 && pendingExport.video !== null,
        }
      : null

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
    if (savingRecording) return
    if (recording) {
      if (stopRecordingRef.current) return
      stopRecordingRef.current = true
      setSavingRecording(true)
      setRecording(false)

      const video = await videoRecorder.stop()
      const frames = snapshotFrames()
      clearBuffer()

      if (frames.length === 0 && !video) {
        showToast('Nothing recorded')
      } else {
        setPendingExport({ frames, video })
        showToast('Recording ready — save files below REC')
      }

      setSavingRecording(false)
      stopRecordingRef.current = false
      return
    }

    clearBuffer()
    setPendingExport(null)
    const started = videoRecorder.start(videoRef.current)
    if (!started) {
      showToast('Video capture unavailable', 1800)
      return
    }
    setRecording(true)
  }

  const handleSaveTelemetryExport = async () => {
    if (!pendingExport?.frames.length) return
    const body = downloadFrames(pendingExport.frames, 'jsonl')
    if (!body) return

    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const result = await saveTelemetryFrames(pendingExport.frames, body, stamp)
    if (!result) return

    showToast(messageForSaveResult(result, 'Telemetry saved'))

    if (shouldClearAfterSave(result)) {
      setPendingExport((prev) => applyExportRemoval(prev, { telemetry: true }))
    }
  }

  const handleSaveVideoExport = async () => {
    if (!pendingExport?.video) return
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const result = await saveVideoBlob(pendingExport.video, stamp)
    showToast(messageForSaveResult(result, 'Video saved'))

    if (shouldClearAfterSave(result)) {
      setPendingExport((prev) => applyExportRemoval(prev, { video: true }))
    }
  }

  const handleSaveAllExport = async () => {
    if (!pendingExport) return
    const body = pendingExport.frames.length > 0 ? downloadFrames(pendingExport.frames, 'jsonl') : null
    const outcome = await saveRecordingBundle(pendingExport.frames, body, pendingExport.video)
    showToast(outcome.message)

    if (!outcome.cancelled && outcome.results.length > 0) {
      setPendingExport((prev) =>
        applyExportRemoval(prev, {
          telemetry: outcome.results.includes('telemetry'),
          video: outcome.results.includes('video'),
        }),
      )
    }
  }

  const handleDismissExport = () => {
    setPendingExport(null)
  }

  const handleCapturePhoto = () => {
    const ok = captureViewportPhoto(videoRef.current)
    setPhotoFlash(true)
    showToast(ok ? 'Choose save location in dialog' : 'Capture failed', 1800)
    window.setTimeout(() => setPhotoFlash(false), 220)
  }

  return (
    <div className={styles.shell}>
      <StatusBar
        connected={connected}
        flightMode={telemetry.flightMode}
        time={time}
        mode={mode}
      />
      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />

      <div className={styles.body}>
        <div className={styles.leftColumn}>
          <NavigationPanel
            heading={telemetry.heading}
            x={telemetry.x}
            z={telemetry.z}
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
            pitch={telemetry.pitch}
            roll={telemetry.roll}
            heading={telemetry.heading}
            connected={connected}
            lightsLevel={uiFlags.lightsLevel}
            recording={recording}
            savingRecording={savingRecording}
            recordElapsed={recordElapsed}
            recordFrames={frameCount}
            photoFlash={photoFlash}
            captureToast={captureToast}
            exportPrompt={exportPrompt}
            onLightsToggle={handleLightsToggle}
            onToggleRecording={handleToggleRecording}
            onCapturePhoto={handleCapturePhoto}
            onSaveTelemetryExport={handleSaveTelemetryExport}
            onSaveVideoExport={handleSaveVideoExport}
            onSaveAllExport={handleSaveAllExport}
            onDismissExport={handleDismissExport}
          />
          <BottomGauges heading={telemetry.heading} pitch={telemetry.pitch} roll={telemetry.roll} />
          <ControlSliders
            velocity={telemetry.velocity}
            depth={telemetry.depth}
            cruiseSpeed={assist.cruiseSpeed}
            onCruiseSpeedChange={(cruiseSpeed) => setAssist((prev) => ({ ...prev, cruiseSpeed }))}
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
