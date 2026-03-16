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
    <div className={cn('grid grid-cols-4 gap-3 max-lg:grid-cols-2', className)}>
      {modules.map((mod, i) => {
        const Icon = mod.icon
        return (
          <div
            key={i}
            className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-[18px] py-4 relative overflow-hidden transition-all hover:border-[var(--sl-border-h)] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,.3)] sl-fade-up cursor-pointer"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-[18px] right-[18px] h-[2.5px] rounded-b"
              style={{ background: mod.color }}
            />

            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-[32px] h-[32px] rounded-[9px] flex items-center justify-center shrink-0"
                style={{ background: `${mod.color}18` }}
              >
                <Icon size={15} style={{ color: mod.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[var(--sl-t2)] leading-tight truncate">
                  {mod.name}
                </p>
              </div>
              <span className="font-[DM_Mono] font-medium text-[12px] leading-none ml-auto" style={{ color: mod.color }}>
                {mod.score}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-[4px] bg-[var(--sl-s3)] rounded-[2px] overflow-hidden mt-2.5 mb-2">
              <div
                className="h-full rounded-[2px] transition-[width] duration-700"
                style={{ width: `${Math.min(mod.progress, 100)}%`, background: mod.color }}
              />
            </div>

            <p className="text-[11px] text-[var(--sl-t3)] truncate">{mod.metric}</p>
          </div>
        )
      })}
    </div>
  )
}
