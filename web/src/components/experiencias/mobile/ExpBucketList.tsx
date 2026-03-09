'use client'

import {
  EXP_PRIMARY_DIM, EXP_PRIMARY_LIGHT,
} from '@/lib/exp-colors'

interface BucketItem {
  icon: string
  name: string
  sub: string
  badge: string
  badgeType: 'soon' | 'pending' | 'visited' | 'mission' | 'dream'
  xpLabel?: string
}

interface ExpBucketListProps {
  title: string
  items: BucketItem[]
}

const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  soon: { bg: 'rgba(236,72,153,0.12)', color: '#f472b6' },
  pending: { bg: 'var(--sl-s2)', color: 'var(--sl-t3)' },
  visited: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  mission: { bg: 'rgba(139,92,246,0.12)', color: '#c4b5fd' },
  dream: { bg: 'var(--sl-s2)', color: 'var(--sl-t3)' },
}

export function ExpBucketList({ title, items }: ExpBucketListProps) {
  return (
    <div>
      <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 pb-2 mt-1">
        {title}
      </p>
      <div style={{ background: 'var(--sl-s1)', borderTop: '1px solid var(--sl-border)', borderBottom: '1px solid var(--sl-border)' }}>
        {items.map((item, i) => {
          const badge = BADGE_STYLES[item.badgeType] ?? BADGE_STYLES.pending
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3"
              style={i < items.length - 1 ? { borderBottom: '1px solid var(--sl-border)' } : undefined}
            >
              <div
                className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0 text-[18px]"
                style={{ background: EXP_PRIMARY_DIM }}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[var(--sl-t1)]">{item.name}</p>
                <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">{item.sub}</p>
                {item.xpLabel && (
                  <p className="text-[10px] font-bold mt-[2px]" style={{ color: EXP_PRIMARY_LIGHT }}>
                    {item.xpLabel}
                  </p>
                )}
              </div>
              <span
                className="inline-flex items-center gap-[3px] px-2 py-[3px] rounded-[10px] text-[10px] font-semibold shrink-0"
                style={{ background: badge.bg, color: badge.color }}
              >
                {item.badge}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
