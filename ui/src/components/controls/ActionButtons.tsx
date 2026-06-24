import type { ReactNode } from 'react'

export type UiControlFlags = {
  lights: boolean
  holdDepth: boolean
  cameraTilt: boolean
}

type ActionButtonsProps = {
  flags: UiControlFlags
  onChange: (flags: UiControlFlags) => void
  emergencyStop: boolean
}

const ACTIONS: {
  key: keyof UiControlFlags
  label: string
  Icon: () => ReactNode
}[] = [
  {
    key: 'lights',
    label: 'Lights',
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.5 4.5-3 6H8c-1.5-1.5-3-3.5-3-6a7 7 0 017-7z" />
      </svg>
    ),
  },
  {
    key: 'holdDepth',
    label: 'Hold Depth',
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v18M7 8l5 5 5-5" />
      </svg>
    ),
  },
  {
    key: 'cameraTilt',
    label: 'Cam Tilt',
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 7h4l2-2h4l2 2h4v12H4V7z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
  },
]

export function ActionButtons({ flags, onChange, emergencyStop }: ActionButtonsProps) {
  const toggle = (key: keyof UiControlFlags) => {
    onChange({ ...flags, [key]: !flags[key] })
  }

  return (
    <div className="glass-panel flex flex-col items-center justify-center p-3">
      <span className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/50">Actions</span>

      {emergencyStop && (
        <div className="mb-3 w-full rounded-md bg-danger/20 px-3 py-1.5 text-center text-xs font-bold uppercase tracking-widest text-danger ring-1 ring-danger/40">
          Emergency Stop
        </div>
      )}

      <div className="flex gap-2">
        {ACTIONS.map(({ key, label, Icon }) => {
          const active = flags[key]
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`flex flex-col items-center gap-1.5 rounded-lg px-4 py-2.5 transition-all ${
                active
                  ? 'bg-accent-cyan/15 text-accent-cyan ring-1 ring-accent-cyan/40'
                  : 'bg-white/5 text-white/50 ring-1 ring-white/10 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              <Icon />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
