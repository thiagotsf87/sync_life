'use client'

import { useRouter } from 'next/navigation'
import { fmt, getBudgetColor } from '@/components/dashboard/dashboard-utils'

interface BudgetItem {
  id: string
  category: { icon?: string; name?: string } | null
  amount: number
  gasto: number
  pct: number
}

export interface BudgetsWidgetProps {
  budgets: BudgetItem[]
  loading: boolean
}

export function BudgetsWidget({ budgets, loading }: BudgetsWidgetProps) {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-2 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-[18px]">
        <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">💼 Orçamentos do Mês</span>
        <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
          onClick={() => router.push('/financas/orcamentos')}>Ver todos →</button>
      </div>
      {loading
        ? <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-[var(--sl-s2)] animate-pulse" />)}</div>
        : budgets.length === 0
          ? <p className="text-[13px] text-[var(--sl-t3)] text-center py-6">Nenhum orçamento configurado</p>
          : (
            <div className="flex flex-col gap-2.5">
              {budgets.slice(0, 5).map(b => {
                const color = getBudgetColor(b.pct)
                return (
                  <div key={b.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[var(--sl-t2)]">{b.category?.icon} {b.category?.name ?? 'Categoria'}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t3)]">
                          <span className="text-[var(--sl-t2)]">{fmt(b.gasto)}</span> / {fmt(b.amount)}
                        </span>
                        <span className="text-[11px] font-semibold" style={{ color }}>{b.pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden bg-[var(--sl-s3)]">
                      <div className="h-full rounded-full transition-[width] duration-700"
                        style={{ width: `${Math.min(b.pct, 100)}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )
      }
    </div>
  )
}
