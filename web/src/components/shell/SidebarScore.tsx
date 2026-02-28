'use client'

export function SidebarScore() {
  // Hardcoded score for now — will be connected to API later
  const score = 74
  const delta = '+3 semana'

  return (
    <div className="sl-sb-score jornada-only mx-3 mb-3 p-3 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">
        Life Sync Score
      </p>
      <div className="flex items-baseline gap-2">
        <span className="font-[Syne] font-extrabold text-2xl text-sl-grad">{score}</span>
        <span className="text-[11px] text-[#10b981]">{delta}</span>
      </div>
      {/* Progress bar */}
      <div className="mt-2 h-[5px] w-full rounded-full bg-[var(--sl-s3)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: 'linear-gradient(90deg, #10b981, #0055ff)',
            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  )
}
