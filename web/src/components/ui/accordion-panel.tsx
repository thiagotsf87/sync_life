'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface AccordionPanelProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  statusLabel?: string
  statusColor?: string
  progress?: number
  defaultOpen?: boolean
  accentColor?: string
  dimmed?: boolean
  children: React.ReactNode
  className?: string
}

export function AccordionPanel({
  icon,
  title,
  subtitle,
  statusLabel,
  statusColor = '#10b981',
  progress,
  defaultOpen = false,
  accentColor,
  dimmed = false,
  children,
  className,
}: AccordionPanelProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className={cn(
        'bg-[var(--sl-s1)] border rounded-2xl overflow-hidden transition-colors',
        'hover:border-[var(--sl-border-h)]',
        dimmed ? 'opacity-60' : '',
        className
      )}
      style={{
        borderColor: accentColor
          ? `${accentColor}40`
          : 'var(--sl-border)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${statusColor}18` }}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[var(--sl-t1)] truncate">
              {title}
            </span>
            {statusLabel && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                style={{
                  color: statusColor,
                  background: `${statusColor}18`,
                }}
              >
                {statusLabel}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-[var(--sl-t3)] mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {typeof progress === 'number' && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-20 h-[5px] bg-[var(--sl-s3)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background: statusColor,
                }}
              />
            </div>
            <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)]">
              {Math.round(progress)}%
            </span>
          </div>
        )}

        <ChevronDown
          className={cn(
            'w-4 h-4 text-[var(--sl-t3)] transition-transform duration-200 shrink-0',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Content */}
      {open && (
        <div className="px-5 pb-5 border-t border-[var(--sl-border)]">
          {children}
        </div>
      )}
    </div>
  )
}
