'use client'

import { cn } from '@/lib/utils'

interface ExplorerStat {
  value: number | string
  label: string
  subtext?: string
  color: string
  progress?: { current: number; total: number }
  onClick?: () => void
}

interface ExplorerBannerProps {
  stats: ExplorerStat[]
  className?: string
}

export function ExplorerBanner({ stats, className }: ExplorerBannerProps) {
  return (
    <div
      className={cn(
        'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden relative sl-fade-up sl-delay-1',
        className,
      )}
    >
      {/* Top gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, #ec4899, #a855f7, #06b6d4)' }}
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(
              'relative py-6 px-5 text-center',
              i > 0 && 'before:absolute before:left-0 before:top-[20%] before:h-[60%] before:w-px before:bg-[var(--sl-border)]',
              stat.onClick && 'cursor-pointer',
            )}
            onClick={stat.onClick}
          >
            <div
              className="font-[Syne] font-extrabold text-[32px] leading-none mb-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="text-[12px] text-[var(--sl-t2)] font-medium mb-[10px]">
              {stat.label}
            </div>

            {stat.progress && (
              <>
                <div className="w-[60px] h-1 rounded-sm bg-[var(--sl-s3)] mx-auto overflow-hidden">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${(stat.progress.current / stat.progress.total) * 100}%`,
                      background: `linear-gradient(90deg, ${stat.color}, #a855f7)`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-[var(--sl-t3)] mt-1.5">
                  de {stat.progress.total}
                </div>
              </>
            )}

            {stat.subtext && !stat.progress && (
              <div className="text-[10px] text-[var(--sl-t3)] mt-1.5">
                {stat.subtext}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
