'use client'

import type { FocusSession } from '@/hooks/use-mente'

interface StudySessionCardProps {
  session: FocusSession
  compact?: boolean
}

export function StudySessionCard({ session, compact = false }: StudySessionCardProps) {
  const date = new Date(session.recorded_at)
  const dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  const timeLabel = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl p-4 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-[13px] font-semibold text-[var(--sl-t1)] leading-tight">
            {session.track?.name ?? 'Estudo livre'}
          </p>
          <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
            {dateLabel} às {timeLabel}
          </p>
        </div>
        <span className="shrink-0 font-[DM_Mono] text-[13px] font-bold text-[#0055ff]">
          {session.focus_minutes}m
        </span>
      </div>

      {!compact && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-[var(--sl-t3)]">
            🔄 {session.cycles_completed} ciclo{session.cycles_completed !== 1 ? 's' : ''}
          </span>
          {session.break_minutes > 0 && (
            <span className="text-[11px] text-[var(--sl-t3)]">
              ☕ {session.break_minutes}m pausa
            </span>
          )}
          {session.session_notes && (
            <p className="w-full text-[11px] text-[var(--sl-t2)] italic mt-1 truncate">
              "{session.session_notes}"
            </p>
          )}
        </div>
      )}
    </div>
  )
}
