'use client'

import type { StudyTrack, TrackCategory } from '@/hooks/use-mente'
import { CATEGORY_LABELS } from '@/hooks/use-mente'

const MENTE_COLOR = '#eab308'
const MENTE_BG = 'rgba(234,179,8,0.14)'

function getBadgeStyle(progress: number): { bg: string; color: string } {
  if (progress >= 50) return { bg: 'rgba(234,179,8,0.12)', color: '#eab308' }
  if (progress >= 25) return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' }
  return { bg: 'rgba(0,85,255,0.12)', color: '#60a5fa' }
}

function getBarColor(progress: number): string {
  if (progress >= 50) return MENTE_COLOR
  if (progress >= 25) return '#f59e0b'
  return '#0055ff'
}

const CATEGORY_EMOJI: Record<TrackCategory, string> = {
  technology: '💻',
  languages: '🌍',
  management: '📊',
  marketing: '📢',
  design: '🎨',
  finance: '💰',
  health: '❤️',
  exam: '📝',
  undergraduate: '🎓',
  postgraduate: '🏫',
  certification: '🏆',
  other: '📚',
}

function getDaysAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'ontem'
  if (diff < 7) return `há ${diff} dias`
  if (diff < 14) return 'há 1 semana'
  if (diff < 30) return `há ${Math.floor(diff / 7)} semanas`
  return `há ${Math.floor(diff / 30)} meses`
}

// Strip the emoji prefix from the label (e.g. "💻 Tecnologia" → "Tecnologia")
function stripEmoji(label: string): string {
  return label.replace(/^[\p{Emoji}\s]+/u, '').trim()
}

interface MenteTrackCardMobileProps {
  track: StudyTrack
  variant?: 'compact' | 'full'
  onClick?: () => void
}

export function MenteTrackCardMobile({
  track,
  variant = 'full',
  onClick,
}: MenteTrackCardMobileProps) {
  const steps = track.steps ?? []
  const completedSteps = steps.filter((s) => s.is_completed).length
  const nextStep = steps.find((s) => !s.is_completed)
  const badge = getBadgeStyle(track.progress)
  const barColor = getBarColor(track.progress)
  const emoji = CATEGORY_EMOJI[track.category] ?? '📚'
  const categoryName = stripEmoji(CATEGORY_LABELS[track.category] ?? track.category)

  if (variant === 'compact') {
    return (
      <div
        className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-[14px] cursor-pointer hover:border-[var(--sl-border-h)] transition-colors"
        onClick={onClick}
      >
        <div className="flex items-center gap-[10px] mb-[10px]">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: MENTE_BG }}
          >
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-[var(--sl-t1)] truncate">{track.name}</div>
            <div className="text-[12px] text-[var(--sl-t2)]">
              {categoryName} · {completedSteps}/{steps.length} etapas
            </div>
          </div>
          <span
            className="text-[11px] font-medium px-2 py-[3px] rounded-full flex-shrink-0"
            style={{ background: badge.bg, color: badge.color }}
          >
            {Math.round(track.progress)}%
          </span>
        </div>
        <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--sl-s3)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(track.progress, 100)}%`, background: barColor }}
          />
        </div>
      </div>
    )
  }

  // variant === 'full'
  return (
    <div
      className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-[14px] mx-4 mb-3 cursor-pointer hover:border-[var(--sl-border-h)] transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-[13px] flex items-center justify-center text-[22px] flex-shrink-0"
          style={{ background: MENTE_BG }}
        >
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-[Syne] text-[15px] font-semibold text-[var(--sl-t1)] truncate">{track.name}</div>
          <div className="text-[12px] text-[var(--sl-t2)]">
            {categoryName} · Iniciado {getDaysAgo(track.created_at)}
          </div>
        </div>
        <span
          className="text-[11px] font-medium px-2 py-[3px] rounded-full flex-shrink-0"
          style={{ background: badge.bg, color: badge.color }}
        >
          {Math.round(track.progress)}%
        </span>
      </div>

      <div className="h-[6px] rounded-full overflow-hidden mb-2" style={{ background: 'var(--sl-s3)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(track.progress, 100)}%`, background: barColor }}
        />
      </div>

      <div className="flex justify-between text-[12px]">
        <span className="text-[var(--sl-t2)]">{completedSteps} de {steps.length} etapas</span>
        {nextStep && (
          <span style={{ color: barColor }}>Próximo: {nextStep.title} →</span>
        )}
      </div>
    </div>
  )
}
