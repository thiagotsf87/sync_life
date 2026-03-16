'use client'

import { cn } from '@/lib/utils'
import { type LucideIcon, Flame } from 'lucide-react'

interface Milestone {
  value: number
  label: string
}

interface StreakBannerProps {
  count: number
  milestones?: Milestone[]
  icon?: LucideIcon
  accentColor?: string
  className?: string
}

export function StreakBanner({
  count,
  milestones = [],
  icon: Icon = Flame,
  accentColor = '#f97316',
  className,
}: StreakBannerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-5 px-6 py-[18px] rounded-2xl',
        'sl-fade-up',
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${accentColor}1A, rgba(245,158,11,.06))`,
        border: `1px solid ${accentColor}33`,
      }}
    >
      {/* Icon */}
      <Icon size={32} style={{ color: accentColor }} className="shrink-0" />

      {/* Count + label */}
      <div className="flex-1 min-w-0">
        <span
          className="font-[Syne] font-extrabold text-[36px] leading-none"
          style={{ color: accentColor }}
        >
          {count}
        </span>
        <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">
          dias consecutivos de atividade
        </p>
      </div>

      {/* Milestones — 34x34 square boxes */}
      {milestones.length > 0 && (
        <div className="flex items-center gap-[6px] shrink-0">
          {milestones.map((m) => {
            const done = count >= m.value
            const current = !done && milestones.findIndex(ms => count < ms.value) === milestones.indexOf(m)

            return (
              <div
                key={m.value}
                className={cn(
                  'w-[34px] h-[34px] rounded-[9px] flex items-center justify-center',
                  'text-[11px] font-bold',
                )}
                style={{
                  ...(done ? {
                    borderColor: accentColor,
                    background: `${accentColor}14`,
                    color: accentColor,
                    border: `1px solid ${accentColor}`,
                  } : current ? {
                    border: `1px solid ${accentColor}`,
                    color: accentColor,
                    boxShadow: `0 0 10px ${accentColor}4D`,
                  } : {
                    border: '1px solid var(--sl-border)',
                    color: 'var(--sl-t3)',
                  }),
                }}
              >
                {m.value}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
