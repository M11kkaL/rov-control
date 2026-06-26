import styles from './NavigationPanel.module.scss'

const POND_RADIUS = 38
const DEPTH_MAX = 30
const SCALE_MARKS = [0, 10, 20, 30]

type Waypoint = { x: number; z: number }

type NavigationPanelProps = {
  x: number
  z: number
  depth: number
  waypoint: Waypoint | null
  onSetWaypoint: (wp: Waypoint) => void
  onClearWaypoint: () => void
}

function distance2d(ax: number, az: number, bx: number, bz: number): number {
  return Math.hypot(bx - ax, bz - az)
}

export function NavigationPanel({
  x,
  z,
  depth,
  waypoint,
  onSetWaypoint,
  onClearWaypoint,
}: NavigationPanelProps) {
  const size = 156
  const center = size / 2
  const scale = (center - 14) / POND_RADIUS
  const dotX = center + x * scale
  const dotY = center + z * scale
  const depthPct = Math.min(depth / DEPTH_MAX, 1)
  const subTop = `${(1 - depthPct) * 82 + 8}%`

  const handleMapClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const pt = svg.createSVGPoint()
    pt.x = event.clientX
    pt.y = event.clientY
    const local = pt.matrixTransform(ctm.inverse())
    const worldX = (local.x - center) / scale
    const worldZ = (local.y - center) / scale
    const r = Math.hypot(worldX, worldZ)
    if (r > POND_RADIUS) return
    onSetWaypoint({ x: worldX, z: worldZ })
  }

  const wpDist = waypoint ? distance2d(x, z, waypoint.x, waypoint.z) : null

  return (
    <div className={styles.column}>
      <section className={styles.card}>
        <div className={styles.mapHeader}>
          <h2 className={styles.title}>Drone Location</h2>
          {waypoint && (
            <button type="button" className={styles.clearWp} onClick={onClearWaypoint}>
              Clear WP
            </button>
          )}
        </div>
        <div className={styles.mapWrap}>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width="100%"
            height={size}
            className={styles.mapSvg}
            onClick={handleMapClick}
            role="img"
            aria-label="Mission map — click to set waypoint"
          >
            <circle
              cx={center}
              cy={center}
              r={POND_RADIUS * scale}
              fill="rgba(44,232,212,0.04)"
              stroke="rgba(44,232,212,0.18)"
              strokeWidth="1"
            />
            {waypoint && (
              <>
                <path
                  d={`M ${dotX} ${dotY} L ${center + waypoint.x * scale} ${center + waypoint.z * scale}`}
                  stroke="rgba(255,107,74,0.5)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  fill="none"
                />
                <g transform={`translate(${center + waypoint.x * scale}, ${center + waypoint.z * scale})`}>
                  <rect x={-5} y={-5} width={10} height={10} fill="none" stroke="#ff6b4a" strokeWidth="1.25" transform="rotate(45)" />
                </g>
              </>
            )}
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
            {wpDist !== null && ` · WP ${wpDist.toFixed(1)}m`}
          </span>
          <span className={styles.mapHint}>Click map to set waypoint</span>
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
