import { APP_NAME, APP_VERSION, type OperationMode } from '../../config/app'

type HeaderProps = {
  mode: OperationMode
  connected: boolean
  ping: number | null
  time: string
  recording: boolean
  recordFrames: number
  onToggleRecording: () => void
}

export function Header({
  mode,
  connected,
  ping,
  time,
  recording,
  recordFrames,
  onToggleRecording,
}: HeaderProps) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.06] bg-bg-panel px-4 shadow-[0_1px_0_rgba(0,212,170,0.06)]">
      <div className="flex min-w-[200px] items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-teal/20 to-accent-cyan/10 ring-1 ring-accent-teal/25">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent-teal" fill="currentColor">
            <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.2l6 3.75v7.5L12 19.2l-6-3.75v-7.5L12 4.2z" />
          </svg>
        </div>
        <div>
          <span className="block text-sm font-semibold tracking-wide text-white">{APP_NAME}</span>
          <span className="block text-[9px] uppercase tracking-[0.2em] text-white/30">Control Station</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ModeBadge mode={mode} />
        <StatusPill connected={connected} />
        <span className="tech-chip">
          <span className="text-white/30">PING</span>
          {connected && ping !== null ? `${ping} ms` : '—'}
        </span>
      </div>

      <div className="flex min-w-[240px] items-center justify-end gap-3">
        <button
          type="button"
          onClick={onToggleRecording}
          disabled={!connected}
          className={`tech-chip transition-colors hover:border-white/15 disabled:opacity-40 ${
            recording ? 'border-danger/40 text-danger' : ''
          }`}
          title={recording ? 'Stop and download recording' : 'Start telemetry recording'}
        >
          <span
            className={`h-2 w-2 rounded-full ${recording ? 'animate-pulse bg-danger' : 'bg-white/25'}`}
          />
          REC
          {recording && <span>{recordFrames}</span>}
        </button>
        <span className="tech-chip text-white/70">{time}</span>
        <span className="tech-chip text-white/40">v{APP_VERSION}</span>
      </div>
    </header>
  )
}

function ModeBadge({ mode }: { mode: OperationMode }) {
  const isSim = mode === 'SIM'
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${
        isSim
          ? 'bg-accent-blue/10 text-accent-blue ring-1 ring-accent-blue/25'
          : 'bg-accent-teal/10 text-accent-teal ring-1 ring-accent-teal/25'
      }`}
    >
      {mode}
    </span>
  )
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <div className="tech-chip">
      <span
        className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-accent-teal shadow-[0_0_6px_#00d4aa]' : 'animate-pulse bg-danger'}`}
      />
      {connected ? 'Online' : 'Offline'}
    </div>
  )
}
