import type { ReactNode } from 'react'
import { IconTab } from './IconTab'

export type SidebarTab = {
  id: string
  label: string
  icon: ReactNode
}

type SidebarProps = {
  side: 'left' | 'right'
  expanded: boolean
  onToggleExpanded: () => void
  tabs: SidebarTab[]
  activeTab: string | null
  onTabChange: (id: string) => void
  children: ReactNode
  width?: number
}

export function Sidebar({
  side,
  expanded,
  onToggleExpanded,
  tabs,
  activeTab,
  onTabChange,
  children,
  width = 260,
}: SidebarProps) {
  const railClass = side === 'left' ? 'sidebar-rail sidebar-rail--left' : 'sidebar-rail sidebar-rail--right'
  const panelClass = side === 'left' ? 'sidebar-panel sidebar-panel--left' : 'sidebar-panel'

  const handleTab = (id: string) => {
    if (activeTab === id && expanded) {
      onToggleExpanded()
      return
    }
    onTabChange(id)
    if (!expanded) onToggleExpanded()
  }

  return (
    <div className={`flex h-full shrink-0 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className={`${railClass} flex h-full w-14 flex-col`}>
        <div className="flex flex-col gap-1">
          {tabs.map((tab) => (
            <IconTab
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={expanded && activeTab === tab.id}
              onClick={() => handleTab(tab.id)}
            />
          ))}
        </div>
        <div className="mt-auto pt-2">
          <IconTab
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                {expanded ? (
                  <path d={side === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
                ) : (
                  <path d={side === 'left' ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
                )}
              </svg>
            }
            label={expanded ? 'Hide' : 'Show'}
            onClick={onToggleExpanded}
          />
        </div>
      </div>
      <div
        className={panelClass}
        style={{ width: expanded ? width : 0, opacity: expanded ? 1 : 0 }}
      >
        <div className="h-full overflow-y-auto" style={{ width }}>
          {children}
        </div>
      </div>
    </div>
  )
}
