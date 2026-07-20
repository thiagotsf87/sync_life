import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimelineItem {
  /** Marcador da coluna esquerda (data, mês, "Q3"). */
  when: string
  title: string
  meta?: string
  /** Concluído — nó preenchido + check. */
  done?: boolean
  /** Marco ativo — nó anelado + tag "AGORA". */
  current?: boolean
  /** Cor do anel para nó pendente. */
  color?: string
}

export interface TimelineProps {
  title?: string
  items: TimelineItem[]
  className?: string
}

/** Timeline vertical de marcos com nós done/now/future. */
export function Timeline({ title, items, className }: TimelineProps) {
  return (
    <div className={cn('rounded-[16px] border border-[var(--sl-border)] bg-[var(--sl-s1)] p-[22px]', className)}>
      {title && <h3 className="mb-[18px] font-syne text-base font-semibold tracking-[-0.01em] text-[var(--sl-t1)]">{title}</h3>}
      <div className="flex flex-col">
        {items.map((it, i) => {
          const last = i === items.length - 1
          return (
            <div key={i} className="grid items-stretch gap-3" style={{ gridTemplateColumns: '90px 32px 1fr' }}>
              <div className="pt-0.5 text-right">
                <span
                  className={cn(
                    'font-ibm-plex-mono text-[11.5px]',
                    it.current ? 'font-bold text-[var(--sl-em)]' : 'font-medium text-[var(--sl-t3)]',
                  )}
                >
                  {it.when}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2"
                  style={{
                    background: it.done ? 'var(--sl-em)' : it.current ? 'var(--sl-em-soft)' : 'var(--sl-s3)',
                    borderColor: it.done || it.current ? 'var(--sl-em)' : it.color ?? 'var(--sl-border-h)',
                  }}
                >
                  {it.done && <Check size={9} className="text-white" />}
                </span>
                {!last && (
                  <span
                    className="w-0.5 flex-1"
                    style={{ minHeight: 22, background: it.done ? 'var(--sl-em)' : 'var(--sl-border)' }}
                  />
                )}
              </div>
              <div className={last ? 'pb-0' : 'pb-5'}>
                <div className="text-[13.5px] font-semibold text-[var(--sl-t1)]">
                  {it.title}
                  {it.current && <span className="ml-2 text-[9.5px] font-bold tracking-[0.06em] text-[var(--sl-em)]">AGORA</span>}
                </div>
                {it.meta && <div className="mt-0.5 text-[12px] text-[var(--sl-t3)]">{it.meta}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
