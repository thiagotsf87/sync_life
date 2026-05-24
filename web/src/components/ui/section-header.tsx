import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  sub?: string
  className?: string
}

export function SectionHeader({ eyebrow, title, sub, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {eyebrow && (
        <p
          className="font-[Space_Grotesk] font-semibold uppercase tracking-[0.14em] mb-1.5"
          style={{ fontSize: '10px', color: 'var(--sl-em)' }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="font-[Space_Grotesk] font-semibold text-[18px] leading-snug text-[var(--sl-t1)]"
      >
        {title}
      </h2>
      {sub && (
        <p className="font-[DM_Sans] text-[13px] text-[var(--sl-t2)] mt-0.5">
          {sub}
        </p>
      )}
    </div>
  )
}
