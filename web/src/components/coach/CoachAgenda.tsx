'use client'

import { cn } from '@/lib/utils'

export interface CoachAgendaItem {
  id: string
  /** Número do dia (grande, sl-num-strong). */
  day: string
  /** Rótulo curto do dia da semana (mono, G-02). */
  weekday: string
  label: string
  /** Valor já formatado (fmtBRL). */
  amount?: string
  /** Verde quando entrada/positivo. */
  positive?: boolean
  /** Cor de identificação do módulo de origem (G-06). */
  moduleColor?: string
}

export interface CoachAgendaProps {
  title: string
  items: CoachAgendaItem[]
  emptyLabel?: string
  className?: string
}

/** Coluna-evidência lateral do P-A: agenda "próximos N dias". */
export function CoachAgenda({ title, items, emptyLabel = 'Nada nos próximos dias.', className }: CoachAgendaProps) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <header className="flex items-baseline justify-between px-1">
        <h3 className="font-syne text-base font-semibold tracking-tight text-[var(--sl-t1)]">{title}</h3>
        <span className="text-[11px] text-[var(--sl-t3)]">{items.length} eventos</span>
      </header>
      {items.length === 0 ? (
        <p className="px-1 text-[13px] text-[var(--sl-t3)]">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((it) => (
            <div key={it.id}
              className="grid grid-cols-[38px_1fr_auto] items-center gap-2.5 rounded-[10px] border border-[var(--sl-border)] px-3 py-2.5">
              <div className="border-r border-[var(--sl-border)] pr-2 text-center">
                <div className="sl-num-strong text-base leading-none text-[var(--sl-t1)]">{it.day}</div>
                <div className="font-ibm-plex-mono text-[9px] text-[var(--sl-t4)]">{it.weekday}</div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12.5px] font-medium text-[var(--sl-t1)]">{it.label}</div>
                {it.moduleColor && (
                  <span className="mt-0.5 inline-block h-[5px] w-[5px] rounded-full align-middle" style={{ background: it.moduleColor }} />
                )}
              </div>
              {it.amount && (
                <span className="sl-num text-[13px] font-semibold"
                  style={{ color: it.positive ? 'var(--sl-em)' : 'var(--sl-t1)' }}>
                  {it.amount}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
