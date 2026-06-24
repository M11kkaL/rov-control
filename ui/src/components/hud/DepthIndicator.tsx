type DepthIndicatorProps = {
  depth: number
}

export function DepthIndicator({ depth }: DepthIndicatorProps) {
  const maxDepth = 13
  const pct = Math.min((depth / maxDepth) * 100, 100)

  return (
    <div>
      <span className="hud-label">Depth</span>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="hud-value text-accent-cyan">{depth.toFixed(1)}</span>
        <span className="text-xs font-medium text-white/40">m</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
