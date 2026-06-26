import styles from './EventsLog.module.scss'
import { hasLeakAlert } from './hud-utils'

type EventKind = 'danger' | 'warning' | 'success' | 'info'

type LogEvent = {
  kind: EventKind
  category: string
  message: string
}

type EventsLogProps = {
  warnings: string[]
  connected: boolean
  depth: number
}

const KIND_CLASS: Record<EventKind, string> = {
  danger: styles.kindDanger,
  warning: styles.kindWarning,
  success: styles.kindSuccess,
  info: styles.kindInfo,
}

const DOT_CLASS: Record<EventKind, string> = {
  danger: styles.danger,
  warning: styles.warning,
  success: styles.success,
  info: styles.info,
}

function buildEvents(warnings: string[], connected: boolean, depth: number): LogEvent[] {
  const events: LogEvent[] = []

  if (hasLeakAlert(warnings)) {
    events.push({ kind: 'danger', category: 'Danger', message: 'Hull leak detected' })
  }

  if (depth > 25) {
    events.push({ kind: 'warning', category: 'Warning', message: 'High depth — monitor pressure' })
  }

  warnings
    .filter((w) => !/leak|water|hull/i.test(w))
    .forEach((w) => events.push({ kind: 'warning', category: 'Warning', message: w }))

  if (connected) {
    events.push({ kind: 'success', category: 'System Check', message: 'All systems nominal' })
  } else {
    events.push({ kind: 'warning', category: 'Warning', message: 'Telemetry link offline' })
  }

  events.push({ kind: 'info', category: 'Info', message: 'Inspection site: 12m E, 8m S (neon valve)' })
  events.push({ kind: 'info', category: 'Info', message: 'Pilot mode active — manual control' })

  return events
}

export function EventsLog({ warnings, connected, depth }: EventsLogProps) {
  const events = buildEvents(warnings, connected, depth)

  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>Events Log</h2>
      <div className={styles.list}>
        {events.map((event) => (
          <div key={`${event.kind}-${event.message}`} className={styles.item}>
            <span className={`${styles.dot} ${DOT_CLASS[event.kind]}`} />
            <div className={styles.body}>
              <span className={`${styles.kind} ${KIND_CLASS[event.kind]}`}>{event.category}</span>
              <span className={styles.message}>{event.message}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
