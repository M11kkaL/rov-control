import styles from './TelemetryOverlay.module.scss'
import { headingLabel } from './hud-utils'

type ExportPrompt = {
  frameCount: number
  hasVideo: boolean
  canSaveAll: boolean
}

type TelemetryOverlayProps = {
  pitch: number
  roll: number
  heading: number
  connected: boolean
  lightsLevel: number
  recording: boolean
  savingRecording: boolean
  recordElapsed: string
  recordFrames: number
  photoFlash: boolean
  captureToast: string | null
  exportPrompt: ExportPrompt | null
  onLightsToggle: () => void
  onToggleRecording: () => void
  onCapturePhoto: () => void
  onSaveTelemetryExport: () => void
  onSaveVideoExport: () => void
  onSaveAllExport: () => void
  onDismissExport: () => void
}

export function TelemetryOverlay({
  pitch,
  roll,
  heading,
  connected,
  lightsLevel,
  recording,
  savingRecording,
  recordElapsed,
  recordFrames,
  photoFlash,
  captureToast,
  exportPrompt,
  onLightsToggle,
  onToggleRecording,
  onCapturePhoto,
  onSaveTelemetryExport,
  onSaveVideoExport,
  onSaveAllExport,
  onDismissExport,
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

      <div className={styles.mediaDock}>
        <div className={styles.mediaRow}>
          <span className={`${styles.chip} ${!recording ? styles.chipActive : ''}`}>Video</span>
          <button type="button" className={styles.chip} onClick={onCapturePhoto}>
            Photo
          </button>
          <button
            type="button"
            className={`${styles.rec} ${recording ? styles.recActive : ''}`}
            onClick={onToggleRecording}
            disabled={savingRecording}
            title={recording ? 'Stop recording' : 'Start recording'}
          >
            <span className={`${styles.recDot} ${recording ? styles.recDotPulse : ''}`} />
            {recording ? recordElapsed : 'REC'}
            {recording && <span>({recordFrames})</span>}
          </button>
        </div>

        {exportPrompt && (
          <div className={styles.exportPanel}>
            <span className={styles.exportTitle}>Save recording</span>
            {exportPrompt.canSaveAll && (
              <button type="button" className={styles.exportBtnAll} onClick={onSaveAllExport}>
                Save all (.jsonl + .webm)
              </button>
            )}
            {exportPrompt.frameCount > 0 && (
              <button type="button" className={styles.exportBtn} onClick={onSaveTelemetryExport}>
                Telemetry (.jsonl) · {exportPrompt.frameCount} frames
              </button>
            )}
            {exportPrompt.hasVideo && (
              <button type="button" className={styles.exportBtnVideo} onClick={onSaveVideoExport}>
                Video (.webm)
              </button>
            )}
            <button type="button" className={styles.exportDismiss} onClick={onDismissExport}>
              Dismiss
            </button>
          </div>
        )}
      </div>

      {!connected && <div className={styles.reconnect}>Reconnecting…</div>}
    </div>
  )
}
