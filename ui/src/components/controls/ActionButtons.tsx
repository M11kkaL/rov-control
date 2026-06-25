import type { ReactNode } from 'react'
import { PanelCard } from '../layout/PanelCard'

export type UiControlFlags = {
  lights: boolean
  lightsLevel: number
  holdDepth: boolean
  stabilized: boolean
  cameraTilt: boolean
  manualCameraTilt: number
}

type ActionButtonsProps = {
  flags: UiControlFlags
  onChange: (flags: UiControlFlags) => void
  emergencyStop: boolean
}

const ACTIONS: {
  key: 'lights' | 'stabilized' | 'holdDepth' | 'cameraTilt'
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
    key: 'stabilized',
    label: 'Stabilize',
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l7 4v5c0 4-3 7-7 9-4-2-7-5-7-9V7l7-4z" />
      </svg>
    ),
  },
  {
    key: 'holdDepth',
    label: 'Hold',
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v18M7 8l5 5 5-5" />
      </svg>
    ),
  },
  {
    key: 'cameraTilt',
    label: 'Gimbal',
    Icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 7h4l2-2h4l2 2h4v12H4V7z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
  },
]

export function ActionButtons({ flags, onChange, emergencyStop }: ActionButtonsProps) {
  const toggle = (key: 'lights' | 'stabilized' | 'holdDepth' | 'cameraTilt') => {
    const next = { ...flags, [key]: !flags[key] }
    if (key === 'holdDepth' && next.holdDepth) next.stabilized = false
    if (key === 'stabilized' && next.stabilized) next.holdDepth = false
    if (key === 'lights') {
      next.lightsLevel = next.lights ? 100 : 0
    }
    onChange(next)
  }

  return (
    <PanelCard title="Vehicle Actions" className="h-full">
      {emergencyStop && (
        <div className="mb-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-danger">
          Emergency Stop Active
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {ACTIONS.map(({ key, label, Icon }) => {
          const active = flags[key]
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`flex flex-col items-center gap-2 rounded-xl px-3 py-3 transition-all ${
                active
                  ? 'bg-accent-teal/10 text-accent-teal ring-1 ring-accent-teal/30'
                  : 'bg-white/[0.03] text-white/45 ring-1 ring-white/[0.06] hover:bg-white/[0.06] hover:text-white/65'
              }`}
            >
              <Icon />
              <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
            </button>
          )
        })}
      </div>
    </PanelCard>
  )
}
