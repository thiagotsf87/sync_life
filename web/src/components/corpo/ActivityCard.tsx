'use client'

import { Trash2 } from 'lucide-react'
import type { Activity } from '@/hooks/use-corpo'
import { ACTIVITY_TYPES } from '@/hooks/use-corpo'

interface ActivityCardProps {
  activity: Activity
  onDelete?: (id: string) => Promise<void>
}

export function ActivityCard({ activity, onDelete }: ActivityCardProps) {
  const meta = ACTIVITY_TYPES.find(a => a.type === activity.type)
  const icon = meta?.icon ?? '🏅'
  const label = meta?.label ?? activity.type

  return (
    <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl p-4 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="text-xl">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{label}</p>
            <p className="text-[11px] text-[var(--sl-t3)]">
              {new Date(activity.recorded_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(activity.id)}
            className="p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.1)] transition-colors shrink-0"
          >
            <Trash2 size={12} className="text-[var(--sl-t3)]" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[var(--sl-t3)]">⏱</span>
          <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">{activity.duration_minutes}min</span>
        </div>
        {activity.calories_burned != null && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[var(--sl-t3)]">🔥</span>
            <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">{Math.round(activity.calories_burned)}kcal</span>
          </div>
        )}
        {activity.distance_km != null && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[var(--sl-t3)]">📍</span>
            <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">{activity.distance_km}km</span>
          </div>
        )}
        {/* Intensity dots */}
        <div className="flex items-center gap-0.5 ml-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: i < activity.intensity ? '#f97316' : 'var(--sl-s3)' }}
            />
          ))}
        </div>
      </div>

      {activity.notes && (
        <p className="text-[11px] text-[var(--sl-t3)] mt-1.5 italic line-clamp-1">{activity.notes}</p>
      )}
    </div>
  )
}
