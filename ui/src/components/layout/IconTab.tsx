import type { ReactNode } from 'react'

type IconTabProps = {
  icon: ReactNode
  label: string
  active?: boolean
  onClick: () => void
  title?: string
}

export function IconTab({ icon, label, active = false, onClick, title }: IconTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className={`icon-tab w-11 ${active ? 'icon-tab--active' : ''}`}
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      <span className="icon-tab__label">{label}</span>
    </button>
  )
}
