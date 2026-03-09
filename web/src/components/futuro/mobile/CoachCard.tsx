'use client'

import { FUTURO_PRIMARY, FUTURO_PRIMARY_LIGHT } from '@/lib/futuro-colors'

interface CoachCardProps {
  label?: string
  message: React.ReactNode
  cta?: string
  onCtaClick?: () => void
}

export function CoachCard({ label = 'Coach Sync', message, cta, onCtaClick }: CoachCardProps) {
  return (
    <div
      className="mx-4 mb-3 rounded-[16px] p-[13px_14px] flex gap-[11px]"
      style={{
        background: `linear-gradient(135deg, rgba(139,92,246,0.12), rgba(0,85,255,0.08))`,
        border: `1px solid rgba(139,92,246,0.25)`,
      }}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[17px] shrink-0"
        style={{ background: `linear-gradient(135deg, #0055ff, ${FUTURO_PRIMARY})` }}
      >
        🤖
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[3px]"
          style={{ color: FUTURO_PRIMARY_LIGHT }}
        >
          {label}
        </p>
        <div className="text-[12px] text-[var(--sl-t2)] leading-[1.55] [&_strong]:text-[var(--sl-t1)]">
          {message}
        </div>
        {cta && (
          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold"
            style={{ color: FUTURO_PRIMARY_LIGHT }}
          >
            {cta} →
          </button>
        )}
      </div>
    </div>
  )
}
