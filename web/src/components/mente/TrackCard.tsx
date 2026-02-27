'use client'

import { cn } from '@/lib/utils'
import type { StudyTrack, TrackCategory, TrackStatus } from '@/hooks/use-mente'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/hooks/use-mente'

interface TrackCardProps {
  track: StudyTrack
  onClick?: () => void
  compact?: boolean
}

const STATUS_COLORS: Record<TrackStatus, string> = {
  in_progress: '#10b981',
  paused: '#f59e0b',
  completed: '#0055ff',
  abandoned: '#6e90b8',
}

function getCategoryEmoji(cat: TrackCategory): string {
  const map: Record<TrackCategory, string> = {
    technology: '💻', languages: '🌍', management: '📊', marketing: '📢',
    design: '🎨', finance: '💰', health: '❤️', exam: '📝',
    undergraduate: '🎓', postgraduate: '🏫', certification: '🏆', other: '📚',
  }
  return map[cat] ?? '📚'
}

export function TrackCard({ track, onClick, compact = false }: TrackCardProps) {
  const steps = track.steps ?? []
  const completedSteps = steps.filter(s => s.is_completed).length
  const statusColor = STATUS_COLORS[track.status]
  const isCompleted = track.status === 'completed'

  const daysLeft = track.target_date
    ? Math.ceil((new Date(track.target_date).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden',
        'transition-all sl-fade-up',
        onClick && 'cursor-pointer hover:border-[var(--sl-border-h)]',
        isCompleted && 'opacity-75',
        compact ? 'p-4' : 'p-5',
      )}
    >
      {/* Accent bar at top */}
      <div
        className="absolute top-0 left-5 right-5 h-0.5 rounded-b"
        style={{ background: 'linear-gradient(90deg, #a855f7, #0055ff)' }}
      />

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl shrink-0">{getCategoryEmoji(track.category as TrackCategory)}</span>
        <div className="flex-1 min-w-0">
          <p className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)] leading-tight truncate">
            {track.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: statusColor }}>
              {STATUS_LABELS[track.status]}
            </span>
            <span className="text-[10px] text-[var(--sl-t3)]">·</span>
            <span className="text-[10px] text-[var(--sl-t3)]">
              {CATEGORY_LABELS[track.category as TrackCategory].replace(/^.+ /, '')}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          {steps.length > 0 ? (
            <span className="text-[11px] text-[var(--sl-t3)]">{completedSteps}/{steps.length} etapas</span>
          ) : (
            <span className="text-[11px] text-[var(--sl-t3)]">Sem etapas</span>
          )}
          <span className="font-[DM_Mono] text-[13px] font-bold" style={{ color: statusColor }}>
            {Math.round(track.progress)}%
          </span>
        </div>
        <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '5px' }}>
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{
              width: `${Math.min(track.progress, 100)}%`,
              background: isCompleted ? '#10b981' : 'linear-gradient(90deg, #a855f7, #0055ff)',
            }}
          />
        </div>
      </div>

      {/* Footer stats */}
      {!compact && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-[var(--sl-t3)]">
            ⏱ {track.total_hours > 0 ? `${track.total_hours.toFixed(1)}h` : '0h'}
          </span>
          {daysLeft !== null && (
            <span className={cn(
              'text-[11px]',
              daysLeft < 0 ? 'text-[#f43f5e]' : daysLeft <= 7 ? 'text-[#f59e0b]' : 'text-[var(--sl-t3)]'
            )}>
              📅 {daysLeft < 0 ? `${Math.abs(daysLeft)}d atrasada` : daysLeft === 0 ? 'Hoje' : `${daysLeft}d`}
            </span>
          )}
          {track.cost && (
            <span className="text-[11px] text-[var(--sl-t3)]">
              💰 {track.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
