'use client'

import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface ModuleMosaicItem {
  name: string
  score: number
  color: string
  icon: LucideIcon
  metric: string
  progress: number // 0-100
}

interface ModuleMosaicProps {
  modules: ModuleMosaicItem[]
  className?: string
}

export function ModuleMosaic({ modules, className }: ModuleMosaicProps) {
  return (
    <div className={cn('grid grid-cols-4 gap-2.5 max-lg:grid-cols-2', className)}>
      {modules.map((mod, i) => {
        const Icon = mod.icon
        return (
          <div
            key={i}
            className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up cursor-pointer"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-[14px] right-[14px] h-[2.5px] rounded-b"
              style={{ background: mod.color }}
            />

            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-[32px] h-[32px] rounded-[9px] flex items-center justify-center shrink-0"
                style={{ background: `${mod.color}18` }}
              >
                <Icon size={16} style={{ color: mod.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] leading-tight truncate">
                  {mod.name}
                </p>
              </div>
              <span className="font-[DM_Mono] font-medium text-[18px] leading-none" style={{ color: mod.color }}>
                {mod.score}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-[4px] bg-[var(--sl-s3)] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${Math.min(mod.progress, 100)}%`, background: mod.color }}
              />
            </div>

            <p className="text-[10px] text-[var(--sl-t3)] truncate">{mod.metric}</p>
          </div>
        )
      })}
    </div>
  )
}
