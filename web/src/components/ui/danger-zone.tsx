import { cn } from '@/lib/utils'

interface DangerZoneProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function DangerZone({
  title = 'ZONA DE PERIGO',
  children,
  className,
}: DangerZoneProps) {
  return (
    <div
      className={cn('rounded-[16px] p-6', className)}
      style={{
        border: '1px solid rgba(219, 100, 120, 0.25)',
        background: 'rgba(219, 100, 120, 0.04)',
      }}
    >
      <p
        className="font-[Space_Grotesk] font-semibold uppercase tracking-[0.14em] mb-4"
        style={{ fontSize: '10px', color: 'var(--sl-danger)' }}
      >
        {title}
      </p>
      {children}
    </div>
  )
}
