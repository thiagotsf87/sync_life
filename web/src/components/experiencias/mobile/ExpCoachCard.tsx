'use client'

import { EXP_PRIMARY_LIGHT, EXP_GRAD } from '@/lib/exp-colors'

interface ExpCoachCardProps {
  label?: string
  message: React.ReactNode
  cta?: string
  onCtaClick?: () => void
}

export function ExpCoachCard({ label = 'Coach Sync', message, cta, onCtaClick }: ExpCoachCardProps) {
  return (
    <div
      className="mx-4 mb-3 rounded-[16px] p-[13px_14px] flex gap-[11px]"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.06))',
        border: '1px solid rgba(139,92,246,0.25)',
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[17px] shrink-0"
        style={{ background: EXP_GRAD }}
      >
        🤖
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[3px]" style={{ color: EXP_PRIMARY_LIGHT }}>
          {label}
        </p>
        <div className="text-[12px] text-[var(--sl-t2)] leading-[1.55]">{message}</div>
        {cta && (
          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-1 mt-[6px] text-[11px] font-bold"
            style={{ color: EXP_PRIMARY_LIGHT }}
          >
            {cta} →
          </button>
        )}
      </div>
    </div>
  )
}
