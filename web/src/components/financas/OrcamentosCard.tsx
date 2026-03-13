'use client'

import { useRouter } from 'next/navigation'
import { fmtR$, getEnvColor } from '@/components/financas/helpers'

interface BudgetItem {
  id: string
  amount: number
  gasto: number
  pct: number
  category?: { name?: string; icon?: string; color?: string } | null
}

interface OrcamentosCardProps {
  activeBudgets: BudgetItem[]
  loadingBudgets: boolean
  naoAlocado: number
  qtdOk: number
  qtdAlert: number
  qtdOver: number
}

export function OrcamentosCard({ activeBudgets, loadingBudgets, naoAlocado, qtdOk, qtdAlert, qtdOver }: OrcamentosCardProps) {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Orçamentos do Mês</p>
        <button onClick={() => router.push('/financas/orcamentos')} className="text-[11px] text-[#10b981] hover:underline">Ver todos</button>
      </div>
      <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[var(--sl-s2)] rounded-[9px] border border-[var(--sl-border)]">
        <span className="text-[11px] text-[var(--sl-t3)] flex-1">Saúde dos envelopes</span>
        <div className="flex gap-1">
          {activeBudgets.slice(0, 5).map(b => (
            <div key={b.id} className="w-2 h-2 rounded-full" style={{ background: getEnvColor(b.pct) }} />
          ))}
        </div>
        <span className="text-[11px] font-bold text-[var(--sl-t2)]">
          {qtdOk} ok · {qtdAlert} atenção{qtdOver > 0 ? ` · ${qtdOver} ⚠` : ''}
        </span>
      </div>
      {activeBudgets.length === 0 && !loadingBudgets ? (
        <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Nenhum orçamento com gastos este mês</p>
      ) : (
        <div className="flex flex-col gap-2">
          {activeBudgets.slice(0, 5).map(b => (
            <div key={b.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-[13px]">{b.category?.icon ?? '📦'}</span>
                  <span className="text-[12px] text-[var(--sl-t2)] truncate">{b.category?.name ?? 'Categoria'}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] whitespace-nowrap">
                    <strong className="text-[var(--sl-t2)]">R$ {fmtR$(b.gasto)}</strong> / {fmtR$(b.amount)}
                  </span>
                  <span className="text-[10px] font-bold w-[26px] text-right" style={{ color: getEnvColor(b.pct) }}>{b.pct}%</span>
                </div>
              </div>
              <div className="h-1 bg-[var(--sl-s3)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(b.pct, 100)}%`, background: getEnvColor(b.pct) }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 px-2.5 py-2 rounded-[9px] flex items-center justify-between" style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.14)' }}>
        <span className="text-[11px] text-[var(--sl-t2)]">Não alocado</span>
        <span className="font-[DM_Mono] text-[13px] font-medium text-[#10b981]">
          {loadingBudgets ? '—' : `R$ ${fmtR$(Math.max(0, naoAlocado))}`}
        </span>
      </div>
    </div>
  )
}
