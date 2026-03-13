'use client'

import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FinancasMobileShell } from '@/components/financas/FinancasMobileShell'
import { fmtR } from '@/components/financas/relatorios-helpers'
import {
  PERIOD_OPTIONS,
  type PeriodKey,
  type PeriodStats,
  type CategoryComparison,
} from '@/hooks/use-relatorios'

interface RelatoriosMobileViewProps {
  period: PeriodKey
  setPeriod: (p: PeriodKey) => void
  isPro: boolean
  periodStats: PeriodStats
  catCompData: CategoryComparison[]
  barChartData: { month: string; receitas: number; despesas: number }[]
  expenseDelta: number | null
  exportCSV: () => void
}

export function RelatoriosMobileView({
  period,
  setPeriod,
  isPro,
  periodStats,
  catCompData,
  barChartData,
  expenseDelta,
  exportCSV,
}: RelatoriosMobileViewProps) {
  const mobileTopCats = catCompData.slice(0, 4)
  const mobileTotalCat = mobileTopCats.reduce((s, c) => s + c.currentTotal, 0) || 1

  return (
    <FinancasMobileShell
      subtitle="Análise e comparativos"
      rightAction={
        <button onClick={exportCSV} className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]">
          <Download size={16} />
        </button>
      }
    >
      {/* Period tabs */}
      <div className="relative mb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {PERIOD_OPTIONS.filter(o => !o.proOnly || isPro).map(opt => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key as PeriodKey)}
              className={cn(
                'px-3 py-[6px] rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors',
                period === opt.key
                  ? 'bg-[#10b981] text-black'
                  : 'bg-[var(--sl-s2)] text-[var(--sl-t2)] border border-[var(--sl-border)]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Right fade mask */}
        <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--sl-bg), transparent)' }} />
      </div>

      {/* Month summary card */}
      <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,85,255,0.06))', border: '1px solid var(--sl-border)' }}>
        <div className="text-center mb-3">
          <div className="text-[12px] text-[var(--sl-t2)] mb-1">Saldo do período</div>
          <div className={cn(
            'font-[DM_Mono] text-[30px] font-extrabold',
            periodStats.totalBalance >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
          )}>
            {periodStats.totalBalance >= 0 ? '+' : ''}{fmtR(periodStats.totalBalance)}
          </div>
        </div>
        <div className="flex justify-around border-t border-[var(--sl-border)] pt-3">
          <div className="text-center">
            <div className="text-[11px] text-[var(--sl-t2)] mb-1">Receitas</div>
            <div className="font-[DM_Mono] text-[16px] text-[#10b981]">+{fmtR(periodStats.totalRecipes)}</div>
          </div>
          <div className="w-px bg-[var(--sl-border)]" />
          <div className="text-center">
            <div className="text-[11px] text-[var(--sl-t2)] mb-1">Despesas</div>
            <div className="font-[DM_Mono] text-[16px] text-[#f43f5e]">-{fmtR(periodStats.totalExpenses)}</div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {mobileTopCats.length > 0 && (
        <>
          <div className="font-[Syne] text-[13px] font-semibold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-1 pb-2 mt-1">Gastos por categoria</div>
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 mb-3">
            <div className="flex flex-col gap-[10px]">
              {mobileTopCats.map(cat => {
                const pct = Math.round((cat.currentTotal / mobileTotalCat) * 100)
                return (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between mb-[3px]">
                        <span className="text-[12px] text-[var(--sl-t1)]">{cat.name}</span>
                        <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t2)]">{fmtR(cat.currentTotal)}</span>
                      </div>
                      <div className="h-[6px] bg-[var(--sl-s3)] rounded-[3px] overflow-hidden">
                        <div className="h-full rounded-[3px]" style={{ width: `${pct}%`, background: pct > 50 ? '#f43f5e' : pct > 30 ? '#f59e0b' : '#10b981' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Comparison card */}
      {barChartData.length > 1 && (
        <>
          <div className="font-[Syne] text-[13px] font-semibold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-1 pb-2">Comparativo</div>
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 mb-3">
            <div className="flex justify-between mb-3">
              <span className="text-[13px] text-[var(--sl-t2)]">vs. período anterior</span>
              {expenseDelta !== null && (
                <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', expenseDelta <= 0 ? 'bg-[rgba(16,185,129,0.12)] text-[#10b981]' : 'bg-[rgba(244,63,94,0.12)] text-[#f43f5e]')}>
                  {expenseDelta > 0 ? '↑' : '↓'} {fmtR(Math.abs(periodStats.totalExpenses - periodStats.prevTotalExpenses))}
                </span>
              )}
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end justify-around h-20 gap-1">
              {barChartData.slice(-4).map((bar, i) => {
                const maxVal = Math.max(...barChartData.slice(-4).map(b => b.despesas || 1))
                const h = Math.round(((bar.despesas || 0) / maxVal) * 72)
                const isLast = i === barChartData.slice(-4).length - 1
                return (
                  <div key={bar.month} className="flex flex-col items-center gap-1">
                    <div className="w-8 rounded-t" style={{
                      height: h,
                      background: isLast ? '#10b981' : 'rgba(16,185,129,0.3)',
                    }} />
                    <span className={cn('text-[10px]', isLast ? 'text-[#10b981] font-semibold' : 'text-[var(--sl-t2)]')}>{bar.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
      <div className="h-5" />
    </FinancasMobileShell>
  )
}
