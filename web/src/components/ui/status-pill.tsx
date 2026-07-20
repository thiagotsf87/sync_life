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
  success: { bg: 'rgba(15,118,110,0.10)', text: '#0F766E' },
  warning: { bg: 'rgba(217,150,46,0.10)', text: '#D9962E' },
  danger:  { bg: 'rgba(219,100,120,0.10)',  text: '#DB6478' },
  info:    { bg: 'rgba(60,160,181,0.10)',   text: '#3CA0B5' },
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
