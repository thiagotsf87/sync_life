'use client'

interface CarreiraCoachCardProps {
  message: React.ReactNode
  cta?: string
  onCtaClick?: () => void
}

export function CarreiraCoachCard({ message, cta, onCtaClick }: CarreiraCoachCardProps) {
  return (
    <div className="mx-4 mb-3 flex gap-[11px] p-[13px_14px] rounded-2xl border border-[rgba(139,92,246,0.25)]"
      style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.06))' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[17px] shrink-0"
        style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}
      >
        🤖
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#c4b5fd] uppercase tracking-[0.5px] mb-[3px]">
          Coach Carreira
        </p>
        <div className="text-[12px] text-[var(--sl-t2)] leading-[1.55] [&_strong]:text-[var(--sl-t1)]">
          {message}
        </div>
        {cta && (
          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-1 mt-[6px] text-[11px] font-bold text-[#c4b5fd]"
          >
            {cta} →
          </button>
        )}
      </div>
    </div>
  )
}
