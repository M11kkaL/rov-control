import styles from './KeyboardHelp.module.scss'

const BINDINGS = [
  { keys: 'W / S', action: 'Forward / backward' },
  { keys: 'A / D', action: 'Yaw left / right' },
  { keys: 'Q / E', action: 'Ascend / descend' },
  { keys: '← / →', action: 'Strafe left / right' },
  { keys: '↑ / ↓', action: 'Pitch (or camera tilt when Cam Tilt on)' },
  { keys: 'Space (hold)', action: 'Emergency stop' },
  { keys: 'H / ?', action: 'Toggle this help' },
]

type KeyboardHelpProps = {
  open: boolean
  onClose: () => void
}

export function KeyboardHelp({ open, onClose }: KeyboardHelpProps) {
  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div className={styles.panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Keyboard shortcuts">
        <header className={styles.header}>
          <h2>Controls</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <ul className={styles.list}>
          {BINDINGS.map((row) => (
            <li key={row.keys}>
              <kbd>{row.keys}</kbd>
              <span>{row.action}</span>
            </li>
          ))}
        </ul>
        <p className={styles.hint}>Cruise speed slider sets forward thrust when W/S is idle. HOLD locks depth; Q/E override.</p>
      </div>
    </div>
  )
}
