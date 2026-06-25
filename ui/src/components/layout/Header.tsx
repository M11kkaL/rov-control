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
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-bg-panel px-4">
      <div className="flex min-w-[180px] items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-cyan/15 ring-1 ring-accent-cyan/30">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent-cyan" fill="currentColor">
            <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.2l6 3.75v7.5L12 19.2l-6-3.75v-7.5L12 4.2z" />
          </svg>
        </div>
        <span className="text-sm font-semibold tracking-wide text-white">{APP_NAME}</span>
      </div>

      <div className="flex items-center gap-4">
        <ModeBadge mode={mode} />
        <StatusPill connected={connected} />
        <span className="font-mono text-xs tabular-nums text-white/50">
          {connected && ping !== null ? `${ping} ms` : '— ms'}
        </span>
      </div>

      <div className="flex min-w-[220px] items-center justify-end gap-4">
        <button
          type="button"
          onClick={onToggleRecording}
          disabled={!connected}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/5 disabled:opacity-40"
          title={recording ? 'Stop and download recording' : 'Start telemetry recording'}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${recording ? 'animate-pulse bg-danger shadow-[0_0_8px_#ef4444]' : 'bg-white/20'}`}
          />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${recording ? 'text-danger' : 'text-white/30'}`}>
            Rec
          </span>
          {recording && (
            <span className="font-mono text-[10px] text-white/40">{recordFrames}</span>
          )}
        </button>
        <span className="font-mono text-xs tabular-nums text-white/70">{time}</span>
        <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/40">
          v{APP_VERSION}
        </span>
      </div>
    </header>
  )
}

function ModeBadge({ mode }: { mode: OperationMode }) {
  const isSim = mode === 'SIM'
  return (
    <span
      className={`rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
        isSim
          ? 'bg-accent-blue/15 text-accent-blue ring-1 ring-accent-blue/30'
          : 'bg-accent-cyan/15 text-accent-cyan ring-1 ring-accent-cyan/30'
      }`}
    >
      {mode}
    </span>
  )
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${connected ? 'bg-accent-cyan shadow-[0_0_8px_#1dd4ff]' : 'bg-danger animate-pulse'}`}
      />
      <span className="text-[11px] font-medium uppercase tracking-wider text-white/60">
        {connected ? 'Online' : 'Offline'}
      </span>
    </div>
  )
}
