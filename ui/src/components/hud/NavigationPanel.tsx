import styles from './NavigationPanel.module.scss'

const POND_RADIUS = 38
const DEPTH_MAX = 30
const SCALE_MARKS = [0, 10, 20, 30]

type NavigationPanelProps = {
  x: number
  z: number
  depth: number
}

export function NavigationPanel({ x, z, depth }: NavigationPanelProps) {
  const size = 156
  const center = size / 2
  const scale = (center - 14) / POND_RADIUS
  const dotX = center + x * scale
  const dotY = center + z * scale
  const depthPct = Math.min(depth / DEPTH_MAX, 1)
  const subTop = `${(1 - depthPct) * 82 + 8}%`

  return (
    <div className={styles.column}>
      <section className={styles.card}>
        <h2 className={styles.title}>Drone Location</h2>
        <div className={styles.mapWrap}>
          <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size}>
            <circle
              cx={center}
              cy={center}
              r={POND_RADIUS * scale}
              fill="rgba(44,232,212,0.04)"
              stroke="rgba(44,232,212,0.18)"
              strokeWidth="1"
            />
            <path
              d={`M ${center} ${center - 20} L ${dotX} ${dotY}`}
              stroke="rgba(44,232,212,0.35)"
              strokeWidth="1"
              strokeDasharray="4 4"
              fill="none"
            />
            <g transform={`translate(${dotX}, ${dotY}) rotate(45)`}>
              <path d="M0,-8 L6,6 L0,2 L-6,6 Z" fill="#2ce8d4" />
            </g>
          </svg>
          <span className={styles.coords}>
            {x.toFixed(1)}m E, {z.toFixed(1)}m N
          </span>
        </div>
      </section>

      <section className={`${styles.card} ${styles.depthCard}`}>
        <h2 className={styles.title}>Depth Profile</h2>
        <div className={styles.depthBody}>
          <div className={styles.scale}>
            {SCALE_MARKS.slice()
              .reverse()
              .map((m) => (
                <span key={m}>{m}</span>
              ))}
          </div>
          <div className={styles.track}>
            <div className={styles.depthLine} style={{ top: subTop }} />
            <svg className={styles.subIcon} style={{ top: subTop }} viewBox="0 0 40 16" width="36" height="14">
              <ellipse cx="20" cy="8" rx="18" ry="6" fill="rgba(44,232,212,0.25)" stroke="#2ce8d4" strokeWidth="1" />
              <path d="M34 8 L40 8 L38 6 M40 8 L38 10" stroke="#2ce8d4" strokeWidth="1" fill="none" />
            </svg>
          </div>
          <div className={styles.depthReadout}>
            <span className={styles.depthLabel}>Depth</span>
            <div className={styles.depthValue}>{depth.toFixed(0)} m</div>
          </div>
        </div>
      </section>
    </div>
  )
}
