import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ProgressRow {
  label: string
  current: number
  target: number
  color: string
  unit?: string
  sub?: string
  currentLabel?: string
  targetLabel?: string
  /** "Menos é melhor": acima de 100% lê danger, perto lê warning. */
  invert?: boolean
  /** Mostra check ao concluir (só linhas não-invertidas). */
  check?: boolean
  badge?: string
  badgeColor?: string
}

export interface ProgressListProps {
  title: string
  sub?: string
  rows: ProgressRow[]
  className?: string
}

/** Card de barras de meta (current / target) com dots, badges e modo invert. */
export function ProgressList({ title, sub, rows, className }: ProgressListProps) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-[16px] border border-[var(--sl-border)] bg-[var(--sl-s1)] p-[22px]', className)}>
      <div className="mb-2.5 flex items-baseline justify-between">
        <h3 className="font-syne text-base font-semibold tracking-[-0.01em] text-[var(--sl-t1)]">{title}</h3>
        {sub && <span className="text-[11.5px] text-[var(--sl-t3)]">{sub}</span>}
      </div>
      {rows.map((r, i) => {
        const pct = r.target > 0 ? Math.round((r.current / r.target) * 100) : 0
        const near = r.invert ? pct >= 90 && pct < 100 : false
        const complete = r.invert ? pct < 100 : pct >= 100
        const bar = r.invert
          ? pct >= 100
            ? 'var(--sl-danger)'
            : near
              ? 'var(--sl-warning)'
              : r.color
          : pct >= 100
            ? 'var(--sl-em)'
            : r.color
        return (
          <div key={i} className={cn('py-[13px]', i > 0 && 'border-t border-[var(--sl-border)]')}>
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--sl-t1)]">
                <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: r.color }} />
                {r.label}
                {r.sub && <span className="text-[10.5px] text-[var(--sl-t4)]">· {r.sub}</span>}
                {complete && !r.invert && r.check && <Check size={13} className="text-[var(--sl-em)]" />}
                {r.badge && (
                  <span className="text-[9.5px] font-bold tracking-[0.06em]" style={{ color: r.badgeColor ?? 'var(--sl-warning)' }}>
                    {r.badge}
                  </span>
                )}
              </span>
              <span className="sl-num text-[12.5px] text-[var(--sl-t2)]">
                <span className="font-semibold text-[var(--sl-t1)]">
                  {r.currentLabel ?? `${r.current}${r.unit ?? ''}`}
                </span>
                <span className="text-[var(--sl-t4)]"> / {r.targetLabel ?? `${r.target}${r.unit ?? ''}`}</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--sl-s3)]">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: bar }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
