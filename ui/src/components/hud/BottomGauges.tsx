import styles from './BottomGauges.module.scss'
import { normalizeHeading } from './hud-utils'

type BottomGaugesProps = {
  heading: number
  pitch: number
  roll: number
}

const SIZE = 72
const R = 28
const CX = SIZE / 2
const CY = SIZE / 2
const CIRC = 2 * Math.PI * R
const ARC_SWEEP = 0.75

function ArcGauge({
  label,
  valueText,
  subText,
  ratio,
  rotation = 0,
}: {
  label: string
  valueText: string
  subText?: string
  ratio: number
  rotation?: number
}) {
  const clamped = Math.max(0, Math.min(1, ratio))
  const offset = CIRC * ARC_SWEEP * (1 - clamped)

  return (
    <div className={styles.gauge}>
      <span className={styles.label}>{label}</span>
      <svg width={SIZE} height={SIZE} className={styles.svg} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          className={styles.arcBg}
          cx={CX}
          cy={CY}
          r={R}
          strokeDasharray={`${CIRC * ARC_SWEEP} ${CIRC}`}
          strokeDashoffset={CIRC * (ARC_SWEEP / 2)}
          transform={`rotate(135 ${CX} ${CY})`}
        />
        <circle
          className={styles.arcFg}
          cx={CX}
          cy={CY}
          r={R}
          strokeDasharray={`${CIRC * ARC_SWEEP} ${CIRC}`}
          strokeDashoffset={CIRC * (ARC_SWEEP / 2) + offset}
          transform={`rotate(135 ${CX} ${CY})`}
        />
        {[0, 45, 90, 135, 180, 225, 270].map((deg) => {
          const rad = ((deg + 135) * Math.PI) / 180
          const x1 = CX + (R - 4) * Math.cos(rad)
          const y1 = CY + (R - 4) * Math.sin(rad)
          const x2 = CX + (R + 2) * Math.cos(rad)
          const y2 = CY + (R + 2) * Math.sin(rad)
          return <line key={deg} className={styles.tick} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
        <g transform={`rotate(${rotation} ${CX} ${CY})`}>
          <line className={styles.needle} x1={CX} y1={CY} x2={CX} y2={CY - R + 8} />
        </g>
        <circle className={styles.centerDot} cx={CX} cy={CY} r={2.5} />
      </svg>
      <span className={styles.value}>
        {valueText}
        {subText && <span className={styles.sub}> {subText}</span>}
      </span>
    </div>
  )
}

function CompassGauge({ heading }: { heading: number }) {
  const hdg = normalizeHeading(heading)

  return (
    <div className={styles.gauge}>
      <span className={styles.label}>Compass</span>
      <svg width={SIZE} height={SIZE} className={styles.svg} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle className={styles.arcBg} cx={CX} cy={CY} r={R} />
        {['N', 'E', 'S', 'W'].map((label, i) => {
          const deg = i * 90
          const rad = ((deg - 90) * Math.PI) / 180
          const x = CX + (R - 6) * Math.cos(rad)
          const y = CY + (R - 6) * Math.sin(rad)
          return (
            <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className={styles.compassLabel}>
              {label}
            </text>
          )
        })}
        <g transform={`rotate(${hdg} ${CX} ${CY})`}>
          <line className={styles.needleRed} x1={CX} y1={CY} x2={CX} y2={CY - R + 6} />
        </g>
        <circle className={styles.centerDot} cx={CX} cy={CY} r={2.5} />
      </svg>
      <span className={styles.value}>{hdg.toFixed(0)}°</span>
    </div>
  )
}

export function BottomGauges({ heading, pitch, roll }: BottomGaugesProps) {
  const gyroRatio = Math.min(Math.hypot(pitch, roll) / 45, 1)
  const gyroNeedle = (Math.atan2(roll, pitch) * 180) / Math.PI

  return (
    <div className={styles.row}>
      <CompassGauge heading={heading} />
      <ArcGauge
        label="Gyro"
        valueText={`P ${pitch >= 0 ? '+' : ''}${pitch.toFixed(0)}°`}
        subText={`R ${roll >= 0 ? '+' : ''}${roll.toFixed(0)}°`}
        ratio={gyroRatio}
        rotation={gyroNeedle}
      />
    </div>
  )
}
