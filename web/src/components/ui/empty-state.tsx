import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  accent?: string
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  accent = '#0055ff',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-10 px-6 text-center', className)}>
      <div
        className="flex items-center justify-center rounded-full mb-4"
        style={{
          width: 80,
          height: 80,
          background: `rgba(${hexToRgb(accent)}, 0.08)`,
        }}
      >
        <Icon size={48} style={{ color: accent }} strokeWidth={1.5} />
      </div>
      <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-[var(--sl-t2)] max-w-sm mx-auto mb-4">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#0055ff] text-white hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r},${g},${b}`
}
