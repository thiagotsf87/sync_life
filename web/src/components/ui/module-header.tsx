'use client'

import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface WeekNavProps {
  label: string          // e.g. "Sem 12 · 17–23 Mar"
  onPrev?: () => void
  onNext?: () => void
}

interface ModuleHeaderProps {
  icon: LucideIcon
  iconBg: string      // e.g. 'rgba(236,72,153,.1)'
  iconColor: string   // e.g. '#ec4899'
  title: string
  subtitle?: string
  weekNav?: WeekNavProps  // optional week/month navigator
  children?: React.ReactNode // action buttons slot
  className?: string
}

export function ModuleHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  weekNav,
  children,
  className,
}: ModuleHeaderProps) {
  return (
    <div className={cn('flex items-center gap-4 mb-9 sl-fade-up', className)}>
      <div
        className="w-[44px] h-[44px] rounded-[14px] flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={22} className="stroke-2" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="font-[Syne] font-extrabold text-[26px] leading-[1.15] text-[var(--sl-t1)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-[var(--sl-t2)] mt-[3px]">{subtitle}</p>
        )}
      </div>
      {weekNav && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={weekNav.onPrev}
            className="w-[30px] h-[30px] rounded-lg bg-[var(--sl-s2)] border border-[var(--sl-border)] flex items-center justify-center text-[var(--sl-t3)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t2)] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="text-[12px] font-semibold text-[var(--sl-t2)] min-w-[140px] text-center">
            {weekNav.label}
          </span>
          <button
            onClick={weekNav.onNext}
            className="w-[30px] h-[30px] rounded-lg bg-[var(--sl-s2)] border border-[var(--sl-border)] flex items-center justify-center text-[var(--sl-t3)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t2)] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}
      {children && (
        <div className="flex gap-[10px] items-center shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}
