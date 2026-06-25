import styles from './TelemetryOverlay.module.scss'
import { headingLabel } from './hud-utils'

type TelemetryOverlayProps = {
  depth: number
  pitch: number
  roll: number
  heading: number
  connected: boolean
  lightsLevel: number
  onLightsToggle: () => void
}

export function TelemetryOverlay({
  depth,
  pitch,
  roll,
  heading,
  connected,
  lightsLevel,
  onLightsToggle,
}: TelemetryOverlayProps) {
  const lightsOn = lightsLevel > 0

  return (
    <div className={styles.overlay}>
      <div className={styles.tint} />
      <div className={styles.vignette} />
      <div className={styles.crosshairH} />
      <div className={styles.crosshairV} />
      <div className={styles.horizon} style={{ transform: `rotate(${roll}deg)` }} />

      <div className={styles.topLeft}>
        <span className={`${styles.chip} ${styles.chipActive}`}>Video</span>
        <span className={styles.chip}>Photo</span>
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
        <div className={styles.rec}>
          <span className={styles.recDot} />
          REC
        </div>
        <span className={styles.chip}>Depth {depth.toFixed(0)}m</span>
      </div>

      {!connected && <div className={styles.reconnect}>Reconnecting…</div>}
    </div>
  )
}
