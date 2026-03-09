'use client'

import { FUTURO_PRIMARY_LIGHT } from '@/lib/futuro-colors'
import type { FuturoAchievement } from '@/lib/futuro-xp-mock'

interface AchievementGridProps {
  achievements: FuturoAchievement[]
  title?: string
}

export function AchievementGrid({ achievements, title = '🏅 Conquistas desbloqueadas' }: AchievementGridProps) {
  if (achievements.length === 0) return null

  return (
    <div
      className="mx-4 mb-3 rounded-[16px] p-[14px_15px]"
      style={{
        background: `linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.06))`,
        border: `1px solid rgba(139,92,246,0.3)`,
      }}
    >
      <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)] mb-[11px]">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        {achievements.map(ach => (
          <div
            key={ach.id}
            className="rounded-[10px] p-[10px] text-center"
            style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <div className="text-[20px] mb-1">{ach.icon}</div>
            <p className="text-[10px] font-bold" style={{ color: FUTURO_PRIMARY_LIGHT }}>
              {ach.name}
            </p>
            <p className="text-[9px] text-[var(--sl-t3)] mt-[2px]">{ach.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
