'use client'

import { Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RarityPill } from './RarityPill'
import type { UiBadge } from './types'

interface BadgeCardProps {
  badge: UiBadge
  onClick?: () => void
}

export function BadgeCard({ badge: b, onClick }: BadgeCardProps) {
  const progressPct =
    b.progressMax && b.progressMax > 0
      ? Math.min(100, Math.round(((b.progress ?? 0) / b.progressMax) * 100))
      : 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center gap-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-3.5 text-center overflow-hidden transition-all',
        b.unlocked
          ? 'cursor-pointer hover:-translate-y-[2px] hover:border-[var(--sl-border-h)]'
          : 'opacity-40 grayscale cursor-default',
      )}
    >
      {/* Icon */}
      <div
        className="relative w-11 h-11 rounded-[12px] inline-flex items-center justify-center border"
        style={{
          background: b.unlocked
            ? `color-mix(in srgb, ${b.color} 16%, var(--sl-s2))`
            : 'var(--sl-s2)',
          borderColor: b.unlocked ? `${b.color}55` : 'var(--sl-border)',
          color: b.color,
        }}
      >
        <b.Icon size={20} />
        {!b.unlocked && (
          <span
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full inline-flex items-center justify-center text-[var(--sl-t3)]"
            style={{
              background: 'var(--sl-s3)',
              border: '1.5px solid var(--sl-s1)',
            }}
          >
            <X size={8} />
          </span>
        )}
      </div>

      {/* Name */}
      <div className="text-[11.5px] font-medium text-[var(--sl-t1)] leading-[1.3] line-clamp-2">
        {b.name}
      </div>

      {/* Rarity pill */}
      <RarityPill rarity={b.rarity} />

      {/* Date or progress */}
      {b.unlocked ? (
        b.unlockedAt && (
          <div className="text-[10px] text-[var(--sl-t3)] flex items-center justify-center gap-1">
            <Calendar size={9} />
            {b.unlockedAt}
          </div>
        )
      ) : (
        b.progressMax != null && (
          <div className="w-full mt-1">
            <div className="h-1 bg-[var(--sl-s3)] rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${progressPct}%`, background: b.color }}
              />
            </div>
            <div className="text-[10px] text-[var(--sl-t3)] sl-num">
              {b.progress ?? 0}/{b.progressMax}
            </div>
          </div>
        )
      )}

      {/* Bottom accent (unlocked only) */}
      {b.unlocked && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[14px]"
          style={{ background: b.color }}
        />
      )}
    </button>
  )
}
