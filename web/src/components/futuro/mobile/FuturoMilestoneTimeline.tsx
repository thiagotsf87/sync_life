'use client'

import { FUTURO_PRIMARY, FUTURO_PRIMARY_LIGHT } from '@/lib/futuro-colors'
import { MILESTONE_XP } from '@/lib/futuro-xp-mock'

type MilestoneStatus = 'done' | 'current' | 'future'

interface Milestone {
  id: string
  name: string
  date: string
  status: MilestoneStatus
  value?: string
  xp?: number
}

interface FuturoMilestoneTimelineProps {
  milestones: Milestone[]
}

function getDotStyle(status: MilestoneStatus) {
  if (status === 'done') {
    return {
      bg: 'rgba(16,185,129,0.15)',
      border: 'rgba(16,185,129,0.5)',
      content: '✓',
      color: '#10b981',
    }
  }
  if (status === 'current') {
    return {
      bg: `${FUTURO_PRIMARY}33`,
      border: `${FUTURO_PRIMARY}80`,
      content: '📍',
      color: FUTURO_PRIMARY,
    }
  }
  return {
    bg: 'var(--sl-s2)',
    border: 'var(--sl-border)',
    content: '○',
    color: 'var(--sl-t3)',
  }
}

export function FuturoMilestoneTimeline({ milestones }: FuturoMilestoneTimelineProps) {
  if (milestones.length === 0) return null

  return (
    <div className="px-4 pb-[14px]">
      {milestones.map((m, i) => {
        const dot = getDotStyle(m.status)
        const isLast = i === milestones.length - 1
        const xpAmt = m.xp ?? MILESTONE_XP[m.status]
        const xpLabel = m.status === 'done'
          ? `+${xpAmt} XP ✓`
          : m.status === 'current'
            ? `⚡ +${xpAmt} XP`
            : `+${xpAmt} XP`

        return (
          <div key={m.id} className="flex gap-[13px] pb-[13px] relative" style={isLast ? { paddingBottom: 0 } : undefined}>
            {/* Vertical line */}
            {!isLast && (
              <div
                className="absolute left-[15px] top-[30px] w-[2px] bottom-0"
                style={{ background: 'var(--sl-border)' }}
              />
            )}

            {/* Dot */}
            <div
              className="w-[30px] h-[30px] rounded-full shrink-0 flex items-center justify-center text-[12px] relative z-[1]"
              style={{
                background: dot.bg,
                border: `2px solid ${dot.border}`,
                color: dot.color,
              }}
            >
              {dot.content}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <p
                className="text-[13px] font-semibold"
                style={{
                  color: m.status === 'done'
                    ? 'var(--sl-t2)'
                    : m.status === 'current'
                      ? FUTURO_PRIMARY
                      : 'var(--sl-t3)',
                  textDecoration: m.status === 'done' ? 'line-through' : 'none',
                }}
              >
                {m.name}
              </p>
              <p
                className="text-[11px] mt-[2px]"
                style={{
                  color: m.status === 'current'
                    ? FUTURO_PRIMARY
                    : 'var(--sl-t2)',
                }}
              >
                {m.date}{m.value ? ` · ${m.value}` : ''}
              </p>
              {xpLabel && (
                <p
                  className="text-[10px] font-bold mt-[2px]"
                  style={{ color: m.status === 'future' ? 'var(--sl-t3)' : FUTURO_PRIMARY_LIGHT }}
                >
                  {xpLabel}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
