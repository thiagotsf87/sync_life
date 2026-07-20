'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CoachWhisperProps {
  /** Fato-líder, em bold e cor primária. */
  bold: string
  /** Contexto + recomendação. */
  text: string
  /** Rótulo do botão de ação; omitir esconde o botão. */
  action?: string
  onAction?: () => void
  /** 'soft' (dashed inline) ou 'solid' (callout preenchido). */
  variant?: 'soft' | 'solid'
  className?: string
}

/** Nudge inline do Coach — fato + recomendação + ação opcional. Nunca modal. */
export function CoachWhisper({ bold, text, action, onAction, variant = 'soft', className }: CoachWhisperProps) {
  const solid = variant === 'solid'
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-[var(--sl-border-em)] px-[15px] py-[11px] text-[13px] text-[var(--sl-t2)]',
        solid ? 'border-solid' : 'border-dashed',
        className,
      )}
      style={{
        background: solid ? 'var(--sl-em-soft)' : 'linear-gradient(90deg, var(--sl-em-soft) 0%, transparent 74%)',
      }}
    >
      <span className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg border border-[var(--sl-border-em)] bg-[var(--sl-bg)] text-[var(--sl-em)]">
        <Sparkles size={13} />
      </span>
      <span className="flex-1 leading-normal">
        <strong className="text-[var(--sl-t1)]">{bold}</strong> {text}
      </span>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-full bg-[var(--sl-em)] px-[13px] py-[7px] text-[12px] font-semibold text-white"
        >
          {action}
        </button>
      )}
    </div>
  )
}
