export function HudFrame() {
  return (
    <>
      <span className="hud-frame-corner hud-frame-corner--tl" />
      <span className="hud-frame-corner hud-frame-corner--tr" />
      <span className="hud-frame-corner hud-frame-corner--bl" />
      <span className="hud-frame-corner hud-frame-corner--br" />
      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
        <span className="rounded-full border border-white/[0.06] bg-bg-dark/40 px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
          Live Feed
        </span>
      </div>
    </>
  )
}
