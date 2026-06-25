import styles from './TelemetryPanel.module.scss'
import {
  batteryEstimateMinutes,
  hasLeakAlert,
  pressureBar,
  temperatureC,
} from './hud-utils'

type TelemetryPanelProps = {
  battery: number
  depth: number
  velocity: number
  pitch: number
  roll: number
  warnings: string[]
}

function formatEta(minutes: number): string {
  if (minutes < 60) return `about ${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `about ${h}h ${m}m`
}

function HealthBar({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.healthRow}>
      <div className={styles.healthHeader}>
        <span className={styles.healthLabel}>{label}</span>
        <span className={styles.healthPct}>{Math.round(value)}%</span>
      </div>
      <div className={styles.healthTrack}>
        <div className={styles.healthFill} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export function TelemetryPanel({ battery, depth, velocity, pitch, roll, warnings }: TelemetryPanelProps) {
  const leak = hasLeakAlert(warnings)
  const eta = batteryEstimateMinutes(battery, velocity)
  const temp = temperatureC(depth)
  const pressure = pressureBar(depth) * 14.5 // bar → PSI approx for display

  const engine = Math.min(100, battery + 8)
  const hull = leak ? 62 : Math.min(100, 70 + battery * 0.25)
  const stability = Math.max(0, 100 - Math.abs(roll) * 2.2 - Math.abs(pitch) * 1.5)

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <SubIcon />
        <div>
          <h2 className={styles.vehicleName}>ROV Probe</h2>
          <span className={styles.vehicleSub}>Water baby pro class</span>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.batteryRow}>
          <BatteryIcon level={battery} />
          <div>
            <span className={styles.batteryPct}>{battery.toFixed(0)}%</span>
            <span className={styles.batteryEta}>Remaining time {formatEta(eta)}</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <HealthBar label="Engine" value={engine} />
        <HealthBar label="Hull" value={hull} />
        <HealthBar label="Stability" value={stability} />
      </section>

      <section className={styles.envSection}>
        <div className={styles.envRow}>
          <span className={styles.envLabel}>Pressure</span>
          <span className={styles.envValue}>{pressure.toFixed(1)} PSI</span>
        </div>
        <div className={styles.envRow}>
          <span className={styles.envLabel}>Outside temperature</span>
          <span className={styles.envValue}>{temp.toFixed(0)}°C</span>
        </div>
      </section>
    </aside>
  )
}

function BatteryIcon({ level }: { level: number }) {
  const color = level > 40 ? '#3dd68c' : level > 20 ? '#f5a623' : '#ff4d6d'
  return (
    <svg viewBox="0 0 28 16" width="28" height="16" aria-hidden>
      <rect x="1" y="3" width="22" height="10" rx="2" fill="none" stroke={color} strokeWidth="1.5" />
      <rect x="23" y="6" width="2" height="4" rx="0.5" fill={color} />
      <rect x="3" y="5" width={(level / 100) * 18} height="6" rx="1" fill={color} opacity="0.85" />
    </svg>
  )
}

function SubIcon() {
  return (
    <div className={styles.vehicleIcon}>
      <svg viewBox="0 0 32 20" width="32" height="20" aria-hidden>
        <ellipse cx="16" cy="10" rx="14" ry="7" fill="rgba(44,232,212,0.15)" stroke="#2ce8d4" strokeWidth="1.2" />
        <path d="M28 10 L32 10" stroke="#2ce8d4" strokeWidth="1.2" />
      </svg>
    </div>
  )
}
