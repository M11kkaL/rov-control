import type { ReactNode } from 'react'

type PanelCardProps = {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function PanelCard({ title, action, children, className = '', bodyClassName = '' }: PanelCardProps) {
  return (
    <div className={`panel-card ${className}`}>
      {title && (
        <div className="panel-card__header">
          <span className="panel-card__title">{title}</span>
          {action}
        </div>
      )}
      <div className={`panel-card__body ${bodyClassName}`}>{children}</div>
    </div>
  )
}
