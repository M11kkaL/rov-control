import { useState } from 'react'
import type { ControlState } from '../../input'
import type { Telemetry } from '../../types'
import { ActionButtons, type UiControlFlags } from '../controls/ActionButtons'
import { TelemetryLog } from '../controls/TelemetryLog'
import { IconTab } from './IconTab'
import { ActionsIcon, LogIcon } from './icons'

type FooterProps = {
  control: ControlState
  telemetry: Telemetry
  uiFlags: UiControlFlags
  onUiFlagsChange: (flags: UiControlFlags) => void
}

const FOOTER_TABS = [
  { id: 'actions', label: 'Actions', icon: <ActionsIcon /> },
  { id: 'log', label: 'Log', icon: <LogIcon /> },
]

export function Footer({ control, telemetry, uiFlags, onUiFlagsChange }: FooterProps) {
  const [activeTab, setActiveTab] = useState('actions')
  const [expanded, setExpanded] = useState(true)

  const handleTab = (id: string) => {
    if (activeTab === id && expanded) {
      setExpanded(false)
      return
    }
    setActiveTab(id)
    setExpanded(true)
  }

  return (
    <footer className="shrink-0 border-t border-white/[0.06] bg-bg-panel">
      <div
        className="overflow-hidden transition-[height,opacity] duration-300 ease-out"
        style={{ height: expanded ? 148 : 0, opacity: expanded ? 1 : 0 }}
      >
        <div className="h-[148px] p-3">
          {activeTab === 'actions' && (
            <ActionButtons
              flags={uiFlags}
              onChange={onUiFlagsChange}
              emergencyStop={control.emergencyStop}
            />
          )}
          {activeTab === 'log' && (
            <TelemetryLog telemetry={telemetry} connected={telemetry.timestamp > 0} />
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 border-t border-white/[0.06] bg-bg-rail px-3 py-1.5">
        {FOOTER_TABS.map((tab) => (
          <IconTab
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={expanded && activeTab === tab.id}
            onClick={() => handleTab(tab.id)}
          />
        ))}
        <div className="mx-2 h-6 w-px bg-white/10" />
        <IconTab
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d={expanded ? 'M6 9l6 6 6-6' : 'M6 15l6-6 6 6'} />
            </svg>
          }
          label={expanded ? 'Collapse' : 'Expand'}
          onClick={() => setExpanded((v) => !v)}
        />
      </div>
    </footer>
  )
}
