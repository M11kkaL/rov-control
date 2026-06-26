import styles from './ControlSliders.module.scss'

const SPEED_MAX = 3
const DEPTH_MAX = 30

type ControlSlidersProps = {
  velocity: number
  depth: number
  cruiseSpeed: number
  onCruiseSpeedChange: (speed: number) => void
}

export function ControlSliders({ velocity, depth, cruiseSpeed, onCruiseSpeedChange }: ControlSlidersProps) {
  const depthRatio = Math.min(depth / DEPTH_MAX, 1)

  return (
    <div className={styles.row}>
      <label className={styles.block}>
        <span className={styles.label}>
          Cruise speed
          <span className={styles.value}>{cruiseSpeed.toFixed(1)} m/s</span>
        </span>
        <input
          type="range"
          min={0}
          max={SPEED_MAX}
          step={0.1}
          value={cruiseSpeed}
          onChange={(e) => onCruiseSpeedChange(Number(e.target.value))}
          className={styles.range}
        />
        <span className={styles.live}>Now {velocity.toFixed(1)} m/s</span>
      </label>

      <div className={styles.block} aria-label={`Depth ${depth.toFixed(1)} metres`}>
        <span className={styles.label}>
          Depth
          <span className={styles.value}>{depth.toFixed(1)} m</span>
        </span>
        <div className={styles.depthTrack}>
          <div className={styles.depthFill} style={{ width: `${depthRatio * 100}%` }} />
        </div>
        <span className={styles.live}>0–{DEPTH_MAX} m</span>
      </div>
    </div>
  )
}
