import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type PillStatus = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'

interface StatusPillProps {
  status: PillStatus
  label: string
  icon?: LucideIcon
  className?: string
}

const PILL_COLORS: Record<PillStatus, { bg: string; text: string }> = {
  success: { bg: 'rgba(16,185,129,0.10)', text: '#10b981' },
  warning: { bg: 'rgba(245,158,11,0.10)', text: '#f59e0b' },
  danger:  { bg: 'rgba(244,63,94,0.10)',  text: '#f43f5e' },
  info:    { bg: 'rgba(6,182,212,0.10)',   text: '#06b6d4' },
  purple:  { bg: 'rgba(168,85,247,0.10)',  text: '#a855f7' },
  neutral: { bg: 'rgba(100,116,139,0.10)', text: 'var(--sl-t2)' },
}

export function StatusPill({ status, label, icon: Icon, className }: StatusPillProps) {
  const colors = PILL_COLORS[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-[10px] py-1 rounded-lg text-[11px] font-semibold leading-none',
        className
      )}
      style={{ background: colors.bg, color: colors.text }}
    >
      {Icon && <Icon size={12} />}
      {label}
    </span>
  )
}
