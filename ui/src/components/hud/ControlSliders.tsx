import styles from './ControlSliders.module.scss'

const SPEED_MAX = 3
const DEPTH_MAX = 30

type ControlSlidersProps = {
  velocity: number
  depth: number
  cruiseSpeed: number
  targetDepth: number
  onCruiseSpeedChange: (speed: number) => void
  onTargetDepthChange: (depth: number) => void
}

export function ControlSliders({
  velocity,
  depth,
  cruiseSpeed,
  targetDepth,
  onCruiseSpeedChange,
  onTargetDepthChange,
}: ControlSlidersProps) {
  return (
    <div className={styles.row}>
      <label className={styles.sliderBlock}>
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

      <label className={styles.sliderBlock}>
        <span className={styles.label}>
          Hold depth
          <span className={styles.value}>{targetDepth.toFixed(1)} m</span>
        </span>
        <input
          type="range"
          min={0}
          max={DEPTH_MAX}
          step={0.5}
          value={targetDepth}
          onChange={(e) => onTargetDepthChange(Number(e.target.value))}
          className={styles.range}
        />
        <span className={styles.live}>Now {depth.toFixed(1)} m</span>
      </label>
    </div>
  )
}
