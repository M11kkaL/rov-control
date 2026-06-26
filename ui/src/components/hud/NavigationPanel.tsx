import styles from './NavigationPanel.module.scss'

const POND_RADIUS = 38

type Waypoint = { x: number; z: number }

type NavigationPanelProps = {
  heading: number
  x: number
  z: number
  waypoint: Waypoint | null
  onSetWaypoint: (wp: Waypoint) => void
  onClearWaypoint: () => void
}

function distance2d(ax: number, az: number, bx: number, bz: number): number {
  return Math.hypot(bx - ax, bz - az)
}

export function NavigationPanel({
  heading,
  x,
  z,
  waypoint,
  onSetWaypoint,
  onClearWaypoint,
}: NavigationPanelProps) {
  const size = 140
  const center = size / 2
  const pondR = POND_RADIUS * ((center - 12) / POND_RADIUS)
  const scale = pondR / POND_RADIUS
  const dotX = center + x * scale
  const dotY = center + z * scale

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
    <section className={styles.card}>
      <div className={styles.mapHeader}>
        <h2 className={styles.title}>Location</h2>
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
          <circle cx={center} cy={center} r={pondR} className={styles.pondRing} />
          <circle cx={center} cy={center} r={pondR * 0.66} className={styles.rangeRing} />
          <circle cx={center} cy={center} r={pondR * 0.33} className={styles.rangeRing} />
          <line x1={center} y1={8} x2={center} y2={size - 8} className={styles.axis} />
          <line x1={8} y1={center} x2={size - 8} y2={center} className={styles.axis} />
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
            d={`M ${center} ${center - 18} L ${dotX} ${dotY}`}
            stroke="rgba(44,232,212,0.35)"
            strokeWidth="1"
            strokeDasharray="4 4"
            fill="none"
          />
          <g transform={`translate(${dotX}, ${dotY}) rotate(${heading})`}>
            <path d="M0,-8 L6,6 L0,2 L-6,6 Z" fill="#2ce8d4" />
          </g>
        </svg>
        <span className={styles.coords}>
          HDG {heading.toFixed(0)}° · {x.toFixed(1)}m E, {z.toFixed(1)}m N
          {wpDist !== null && ` · WP ${wpDist.toFixed(1)}m`}
        </span>
        <span className={styles.mapHint}>Click map to set waypoint</span>
      </div>
    </section>
  )
}
