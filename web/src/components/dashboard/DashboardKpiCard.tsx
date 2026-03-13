'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface KpiCardProps {
  label: string
  value: string
  delta?: string
  deltaType?: 'up' | 'down' | 'warn' | 'neutral'
  accent: string
  icon: string
  iconBg: string
  barPct?: number
  barBg?: string
  delay?: string
}

export function DashboardKpiCard({ label, value, delta, deltaType = 'neutral', accent, icon, iconBg, barPct, barBg, delay }: KpiCardProps) {
  const [barWidth, setBarWidth] = useState(0)
  useEffect(() => {
    if (barPct === undefined) return
    const t = setTimeout(() => setBarWidth(Math.min(barPct, 100)), 250)
    return () => clearTimeout(t)
  }, [barPct])

  const deltaColor = {
    up:      'text-[#10b981]',
    down:    'text-[#f43f5e]',
    warn:    'text-[#f59e0b]',
    neutral: 'text-[var(--sl-t3)]',
  }[deltaType]

  return (
    <div className={cn(
      'relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 overflow-hidden',
      'transition-all hover:border-[var(--sl-border-h)] hover:-translate-y-px sl-fade-up shadow-sm dark:shadow-none',
      delay
    )}>
      <div className="absolute top-0 left-5 right-5 h-0.5 rounded-b" style={{ background: accent }} />
      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center mb-3.5 text-base" style={{ background: iconBg }}>
        {icon}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1.5">{label}</p>
      <p className="font-[DM_Mono] font-medium text-[26px] text-[var(--sl-t1)] leading-none mb-1.5">{value}</p>
      {delta && <p className={cn('text-[12px] flex items-center gap-1', deltaColor)}>{delta}</p>}
      {barPct !== undefined && (
        <div className="mt-2.5 h-1 bg-[var(--sl-s3)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ width: `${barWidth}%`, background: barBg ?? accent }}
          />
        </div>
      )}
    </div>
  )
}
