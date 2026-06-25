type HeadingIndicatorProps = {
  heading: number
}

export function HeadingIndicator({ heading }: HeadingIndicatorProps) {
  const normalized = ((heading % 360) + 360) % 360

  return (
    <div>
      <span className="hud-label">Heading</span>
      <div className="mt-1 flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0">
          <svg viewBox="0 0 64 64" className="h-full w-full">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <circle cx="32" cy="32" r="2" fill="#00d4aa" />
            <g transform={`rotate(${normalized} 32 32)`}>
              <polygon points="32,8 28,22 36,22" fill="#00d4aa" />
              <polygon points="32,56 28,42 36,42" fill="rgba(255,255,255,0.25)" />
            </g>
            {[0, 90, 180, 270].map((deg) => (
              <text
                key={deg}
                x={32 + 22 * Math.sin((deg * Math.PI) / 180)}
                y={32 - 22 * Math.cos((deg * Math.PI) / 180)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.35)"
                fontSize="7"
                fontWeight="600"
              >
                {deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : 'W'}
              </text>
            ))}
          </svg>
        </div>
        <div>
          <span className="hud-value">{normalized.toFixed(0)}</span>
          <span className="ml-0.5 text-sm font-medium text-white/40">°</span>
        </div>
      </div>
    </div>
  )
}
