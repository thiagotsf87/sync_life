'use client'

import { SLCard } from '@/components/ui/sl-card'
import { fmtR, formatDate } from '@/components/financas/relatorios-helpers'
import type { RawTransaction } from '@/hooks/use-relatorios'

interface RelatoriosTopExpensesProps {
  topExpenses: RawTransaction[]
}

export function RelatoriosTopExpenses({ topExpenses }: RelatoriosTopExpensesProps) {
  return (
    <SLCard className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
          🏆 Top Despesas do Período
        </p>
        <span className="text-[11px] text-[var(--sl-t3)]">maiores gastos individuais</span>
      </div>
      {topExpenses.length === 0 ? (
        <p className="text-[12px] text-[var(--sl-t3)] py-4 text-center">Nenhuma despesa no período</p>
      ) : (
        <div className="flex flex-col gap-1">
          {topExpenses.map((txn, i) => (
            <div
              key={txn.id}
              className="flex items-center gap-2.5 px-2.5 py-[9px] rounded-[9px] hover:bg-[var(--sl-s2)] transition-colors">
              <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t3)] w-3.5 text-center shrink-0">{i + 1}</span>
              <span className="text-[14px] shrink-0">{txn.categories?.icon ?? '📤'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[var(--sl-t1)] truncate">{txn.description}</p>
                <p className="text-[10px] text-[var(--sl-t3)]">{txn.categories?.name ?? '—'}</p>
              </div>
              <span className="font-[DM_Mono] text-[13px] text-[#f43f5e] shrink-0">{fmtR(txn.amount)}</span>
              <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t3)] shrink-0">{formatDate(txn.date)}</span>
            </div>
          ))}
        </div>
      )}
    </SLCard>
  )
}
