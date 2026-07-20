'use client'

import { Sparkles } from 'lucide-react'
import { RarityPill } from './RarityPill'
import type { UiBadge } from './types'

interface RecentBadgesProps {
  badges: UiBadge[]
  onBadgeClick?: (badge: UiBadge) => void
}

export function RecentBadges({ badges, onBadgeClick }: RecentBadgesProps) {
  if (badges.length === 0) return null

  return (
    <section className="flex flex-col gap-3.5">
      <header className="flex justify-between items-baseline">
        <h2 className="font-[Syne] font-semibold text-[18px] tracking-tight text-[var(--sl-t1)] m-0">
          Recém-conquistadas
        </h2>
      </header>
      <div className="grid grid-cols-3 gap-3.5 max-md:grid-cols-1">
        {badges.slice(0, 3).map((b) => (
          <article
            key={b.id}
            onClick={() => onBadgeClick?.(b)}
            className="relative overflow-hidden bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-[18px] flex flex-col gap-3 cursor-pointer transition-colors hover:border-[var(--sl-border-h)]"
          >
            {/* Radial glow */}
            <div
              className="absolute -top-10 -right-10 w-[140px] h-[140px] pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${b.color}22 0%, transparent 70%)`,
              }}
            />
            <div className="relative flex items-start justify-between">
              <div
                className="w-12 h-12 rounded-[14px] inline-flex items-center justify-center border"
                style={{
                  background: `color-mix(in srgb, ${b.color} 16%, var(--sl-s2))`,
                  borderColor: `${b.color}55`,
                  color: b.color,
                }}
              >
                <b.Icon size={22} />
              </div>
              <RarityPill rarity={b.rarity} />
            </div>
            <div className="relative">
              <div className="font-[Syne] font-semibold text-[15px] text-[var(--sl-t1)] tracking-tight">
                {b.name}
              </div>
              <div className="text-[12px] text-[var(--sl-t3)] mt-1 leading-relaxed">
                {b.description}
              </div>
            </div>
            <div className="relative flex justify-between items-center pt-2 border-t border-[var(--sl-border)]">
              <span className="text-[11px] text-[var(--sl-t3)]">
                {b.unlockedAt ?? 'Recente'}
              </span>
              <span className="text-[11px] text-[var(--sl-em)] font-semibold inline-flex items-center gap-1">
                <Sparkles size={10} />
                Desbloqueada
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
