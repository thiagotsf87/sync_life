'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODULES } from '@/lib/modules'
import type { ModuleId } from '@/types/shell'

export interface CrossSegment { moduleId: ModuleId; text: string; bold?: boolean }
export interface CrossBandProps {
  segments: CrossSegment[]
  action: { label: string; targetModule: ModuleId; href: string }
  className?: string
}

/** Banda de narrativa cross-módulo — 2 segmentos coloridos + ação de navegação. */
export function CrossBand({ segments, action, className }: CrossBandProps) {
  const router = useRouter()
  return (
    <div className={cn('flex items-center gap-3 rounded-xl border border-[var(--sl-border)] bg-[var(--sl-s1)] px-4 py-3', className)}>
      <p className="flex-1 text-[13px] leading-normal text-[var(--sl-t2)]">
        {segments.map((s, i) => {
          const color = (MODULES[s.moduleId] ?? MODULES.panorama).color
          return (
            <span key={i}>
              <span className="mr-1 inline-block h-[7px] w-[7px] rounded-full align-middle" style={{ background: color }} />
              <span className={s.bold ? 'font-semibold text-[var(--sl-t1)]' : ''}>{s.text}</span>{' '}
            </span>
          )
        })}
      </p>
      <button type="button" onClick={() => router.push(action.href)}
        className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold"
        style={{ color: (MODULES[action.targetModule] ?? MODULES.panorama).color }}>
        {action.label}<ArrowRight size={13} />
      </button>
    </div>
  )
}
