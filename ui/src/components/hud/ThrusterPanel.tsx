import type { Telemetry } from '../../types'
import type { UiControlFlags } from '../controls/ActionButtons'
import styles from './ThrusterPanel.module.scss'
import { thrusterPercent } from './hud-utils'

const THRUSTERS: { key: keyof Telemetry['thrusters']; label: string }[] = [
  { key: 'front', label: 'FWD' },
  { key: 'rear', label: 'AFT' },
  { key: 'left', label: 'P' },
  { key: 'right', label: 'S' },
]

type ThrusterPanelProps = {
  thrusters: Telemetry['thrusters']
  lightsLevel: number
  cameraTilt: number
  uiFlags: UiControlFlags
  onLightsLevel: (level: number) => void
  onCameraTilt: (tilt: number) => void
  onUiFlagsChange: (flags: UiControlFlags) => void
}

export function ThrusterPanel({
  thrusters,
  lightsLevel,
  cameraTilt,
  uiFlags,
  onLightsLevel,
  onCameraTilt,
  onUiFlagsChange,
}: ThrusterPanelProps) {
  const adjustTilt = (delta: number) => {
    const next = Math.max(-35, Math.min(35, cameraTilt + delta))
    onCameraTilt(next)
    onUiFlagsChange({ ...uiFlags, cameraTilt: true })
  }

  const toggleMode = (key: 'stabilized' | 'holdDepth') => {
    const next = { ...uiFlags, [key]: !uiFlags[key] }
    if (key === 'holdDepth' && next.holdDepth) next.stabilized = false
    if (key === 'stabilized' && next.stabilized) next.holdDepth = false
    onUiFlagsChange(next)
  }

  return (
    <aside className={styles.panel}>
      <section className={styles.section}>
        <h2 className={styles.title}>Thrusters</h2>
        <div className={styles.bars}>
          {THRUSTERS.map(({ key, label }) => {
            const value = thrusters[key]
            const pct = thrusterPercent(value)
            const positive = value >= 0
            return (
              <div key={key} className={styles.barCol}>
                <span className={styles.barLabel}>{label}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barMid} />
                  <div
                    className={styles.barFill}
                    style={{
                      height: `${pct / 2}%`,
                      ...(positive ? { bottom: '50%' } : { top: '50%' }),
                    }}
                  />
                </div>
                <span className={styles.barPct}>{pct}%</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sliderRow}>
          <div className={styles.sliderHeader}>
            <h2 className={styles.title}>Lights</h2>
            <span className={styles.sliderValue}>{lightsLevel}%</span>
          </div>
          <div className={styles.sliderTrack}>
            <div className={styles.sliderFill} style={{ width: `${lightsLevel}%` }} />
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={lightsLevel}
              className={styles.slider}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                background: 'transparent',
              }}
              onChange={(e) => onLightsLevel(Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.title}>Camera Tilt</h2>
        <div className={styles.tiltRow}>
          <button type="button" className={styles.tiltBtn} onClick={() => adjustTilt(-5)} aria-label="Tilt down">
            ▼
          </button>
          <span className={styles.tiltValue}>
            {cameraTilt >= 0 ? '+' : ''}
            {cameraTilt.toFixed(0)}°
          </span>
          <button type="button" className={styles.tiltBtn} onClick={() => adjustTilt(5)} aria-label="Tilt up">
            ▲
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.title}>Flight</h2>
        <div className={styles.modeRow}>
          <button
            type="button"
            className={`${styles.modeBtn} ${uiFlags.stabilized ? styles.modeBtnActive : ''}`}
            onClick={() => toggleMode('stabilized')}
          >
            STAB
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${uiFlags.holdDepth ? styles.modeBtnActive : ''}`}
            onClick={() => toggleMode('holdDepth')}
          >
            HOLD
          </button>
        </div>
      </section>
    </aside>
  )
}
