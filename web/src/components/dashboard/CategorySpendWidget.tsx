'use client'

import { useRouter } from 'next/navigation'

interface CategoryItem {
  name: string
  color: string
  total: number
}

export interface CategorySpendWidgetProps {
  categorySpend: CategoryItem[]
  maxCatSpend: number
  totalExpense: number
  loading: boolean
}

export function CategorySpendWidget({ categorySpend, maxCatSpend, totalExpense, loading }: CategorySpendWidgetProps) {
  const router = useRouter()

  return (
    <div className="flex-1 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-3 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-[18px]">
        <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">📊 Gastos por Categoria</span>
        <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
          onClick={() => router.push('/financas/relatorios')}>Relatório →</button>
      </div>
      {loading || categorySpend.length === 0
        ? <div className="h-[160px] flex items-center justify-center text-[13px] text-[var(--sl-t3)]">
            {loading ? 'Carregando...' : 'Sem transações este mês'}
          </div>
        : (
          <div className="flex flex-col">
            <div className="flex items-end gap-1.5 h-[160px]">
              {categorySpend.map((cat, i) => {
                const heightPct = (cat.total / maxCatSpend) * 100
                const pct = totalExpense > 0 ? Math.round((cat.total / totalExpense) * 100) : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                    <span className="font-[DM_Mono] text-[9px] font-semibold mb-0.5 text-[var(--sl-t2)]">{pct}%</span>
                    <div className="w-full rounded-t-[4px] min-h-[4px] transition-[height] duration-[900ms]"
                      style={{ height: `${heightPct}%`, background: cat.color, opacity: 0.8 }} />
                  </div>
                )
              })}
            </div>
            <div className="h-px bg-[var(--sl-border)] mt-1.5" />
            <div className="flex gap-1.5 mt-1.5">
              {categorySpend.map((cat, i) => (
                <div key={i} className="flex-1 text-[9px] text-[var(--sl-t3)] text-center truncate">{cat.name.slice(0, 6)}</div>
              ))}
            </div>
          </div>
        )
      }
    </div>
  )
}
