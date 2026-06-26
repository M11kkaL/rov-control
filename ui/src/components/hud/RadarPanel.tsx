import styles from './RadarPanel.module.scss'

type RadarPanelProps = {
  heading: number
  x: number
  z: number
  waypoint: { x: number; z: number } | null
}

const POND_RADIUS = 38

export function RadarPanel({ heading, x, z, waypoint }: RadarPanelProps) {
  const size = 120
  const center = size / 2
  const scale = (center - 10) / POND_RADIUS
  const dotX = center + x * scale
  const dotY = center + z * scale

  const blips = [
    { x: 12, z: -18, label: 'obj' },
    { x: -22, z: 8, label: 'obj' },
    { x: 28, z: 22, label: 'obj' },
  ]

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Sonar</h2>
      <div className={styles.radarWrap}>
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size} className={styles.svg}>
          <circle cx={center} cy={center} r={center - 4} className={styles.ring} />
          <circle cx={center} cy={center} r={(center - 4) * 0.66} className={styles.ringInner} />
          <circle cx={center} cy={center} r={(center - 4) * 0.33} className={styles.ringInner} />
          <line x1={center} y1={4} x2={center} y2={size - 4} className={styles.axis} />
          <line x1={4} y1={center} x2={size - 4} y2={center} className={styles.axis} />
          <g className={styles.sweep} style={{ transformOrigin: `${center}px ${center}px` }}>
            <path
              d={`M ${center} ${center} L ${center} 6 A ${center - 6} ${center - 6} 0 0 1 ${size - 6} ${center} Z`}
              className={styles.wedge}
            />
          </g>
          {blips.map((b) => (
            <circle
              key={`${b.x}-${b.z}`}
              cx={center + b.x * scale}
              cy={center + b.z * scale}
              r={2.5}
              className={styles.blip}
            />
          ))}
          {waypoint && (
            <g transform={`translate(${center + waypoint.x * scale}, ${center + waypoint.z * scale})`}>
              <rect x={-4} y={-4} width={8} height={8} className={styles.waypoint} transform="rotate(45)" />
            </g>
          )}
          <g transform={`translate(${dotX}, ${dotY}) rotate(${heading})`}>
            <path d="M0,-7 L5,5 L0,2 L-5,5 Z" className={styles.rov} />
          </g>
        </svg>
        <span className={styles.caption}>HDG {heading.toFixed(0)}° · cosmetic</span>
      </div>
    </section>
  )
}
