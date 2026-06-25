import styles from './StatusBar.module.scss'
import { flightModeLabel } from './hud-utils'

type StatusBarProps = {
  connected: boolean
  flightMode: string
  time: string
  mode: 'SIM' | 'LIVE'
}

export function StatusBar({ connected, flightMode, time, mode }: StatusBarProps) {
  const status = connected ? 'ONLINE' : 'OFFLINE'

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <button type="button" className={styles.menuBtn} aria-label="Menu">
          <MenuIcon />
        </button>
        <span className={styles.brand}>ORION</span>
      </div>

      <p className={styles.center}>
        MISSION ALPHA • {flightModeLabel(flightMode)} • {mode} MODE • STATUS:{' '}
        <span className={connected ? styles.online : styles.offline}>{status}</span>
      </p>

      <div className={styles.right}>
        <button type="button" className={styles.settingsBtn} aria-label="Settings">
          <SettingsIcon />
        </button>
        <span className={styles.clock}>{time}</span>
      </div>
    </header>
  )
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
