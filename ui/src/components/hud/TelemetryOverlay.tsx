import styles from './TelemetryOverlay.module.scss'
import { headingLabel } from './hud-utils'

type TelemetryOverlayProps = {
  depth: number
  pitch: number
  roll: number
  heading: number
  connected: boolean
  lightsLevel: number
  recording: boolean
  recordElapsed: string
  recordFrames: number
  photoFlash: boolean
  captureToast: string | null
  onLightsToggle: () => void
  onToggleRecording: () => void
  onCapturePhoto: () => void
}

export function TelemetryOverlay({
  depth,
  pitch,
  roll,
  heading,
  connected,
  lightsLevel,
  recording,
  recordElapsed,
  recordFrames,
  photoFlash,
  captureToast,
  onLightsToggle,
  onToggleRecording,
  onCapturePhoto,
}: TelemetryOverlayProps) {
  const lightsOn = lightsLevel > 0

  return (
    <div className={styles.overlay}>
      {photoFlash && <div className={styles.flash} />}
      {captureToast && <div className={styles.toast}>{captureToast}</div>}

      <div className={styles.tint} />
      <div className={styles.vignette} />
      <div className={styles.crosshairH} />
      <div className={styles.crosshairV} />
      <div className={styles.horizon} style={{ transform: `rotate(${roll}deg)` }} />

      <div className={styles.topLeft}>
        <span className={`${styles.chip} ${!recording ? styles.chipActive : ''}`}>Video</span>
        <button type="button" className={styles.chip} onClick={onCapturePhoto}>
          Photo
        </button>
      </div>

      <div className={styles.topRight}>
        <button
          type="button"
          className={`${styles.chip} ${lightsOn ? styles.chipActive : ''}`}
          onClick={onLightsToggle}
        >
          Light {lightsOn ? `${lightsLevel}%` : ''}
        </button>
      </div>

      <div className={styles.readouts}>
        <div className={styles.readout}>
          <span className={styles.readoutLabel}>Pitch</span>
          <span className={styles.readoutValue}>
            {pitch >= 0 ? '+' : ''}
            {pitch.toFixed(0)}°
          </span>
        </div>
        <div className={styles.readout}>
          <span className={styles.readoutLabel}>Heading</span>
          <span className={styles.headingChip}>{headingLabel(heading)}</span>
        </div>
        <div className={styles.readout}>
          <span className={styles.readoutLabel}>Roll</span>
          <span className={styles.readoutValue}>
            {roll >= 0 ? '+' : ''}
            {roll.toFixed(0)}°
          </span>
        </div>
      </div>

      <div className={styles.bottomLeft}>
        <span className={styles.chip}>HDR</span>
      </div>

      <div className={styles.bottomRight}>
        <button
          type="button"
          className={`${styles.rec} ${recording ? styles.recActive : ''}`}
          onClick={onToggleRecording}
          title={recording ? 'Stop recording and download telemetry' : 'Start telemetry recording'}
        >
          <span className={`${styles.recDot} ${recording ? styles.recDotPulse : ''}`} />
          {recording ? recordElapsed : 'REC'}
          {recording && <span>({recordFrames})</span>}
        </button>
        <span className={styles.chip}>Depth {depth.toFixed(0)}m</span>
      </div>

      {!connected && <div className={styles.reconnect}>Reconnecting…</div>}
    </div>
  )
}
