'use client'

import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FinancasMobileShell } from '@/components/financas/FinancasMobileShell'
import { fmtBRL } from '@/lib/format/currency'
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
        <button
          type="button"
          onClick={exportCSV}
          aria-label="Exportar CSV"
          className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]"
        >
          <Download size={16} />
        </button>
      }
    >
      <div className="px-4">
        {/* Period tabs */}
        <div className="relative mb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 phone-scroll scrollbar-hide">
            {PERIOD_OPTIONS.filter(o => !o.proOnly || isPro).map(opt => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key as PeriodKey)}
                className={cn(
                  'font-[DM_Sans] px-3 py-[6px] rounded-full text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors',
                  period === opt.key
                    ? 'text-white'
                    : 'bg-[var(--sl-s2)] text-[var(--sl-t2)] border border-[var(--sl-border)]'
                )}
                style={period === opt.key ? { background: 'var(--sl-em)' } : undefined}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Right fade mask */}
          <div
            className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
            style={{ background: 'linear-gradient(to left, var(--sl-bg), transparent)' }}
          />
        </div>

        {/* Period summary card — G-03: solid soft surface, no brand gradient */}
        <div
          className="rounded-2xl p-4 mb-3"
          style={{ background: 'var(--sl-em-soft)', border: '1px solid var(--sl-border-em)' }}
        >
          <div className="text-center mb-3">
            <div className="font-[DM_Sans] text-[12px] text-[var(--sl-t2)] mb-1">Saldo do período</div>
            <div
              className={cn(
                'sl-num-strong font-[Syne] text-[30px] font-bold',
                periodStats.totalBalance >= 0 ? 'text-[var(--sl-em)]' : 'text-[var(--sl-danger)]'
              )}
            >
              {periodStats.totalBalance >= 0 ? '+' : '– '}
              {fmtBRL(Math.abs(periodStats.totalBalance), { compact: true })}
            </div>
          </div>
          <div className="flex justify-around border-t border-[var(--sl-border)] pt-3">
            <div className="text-center">
              <div className="font-[DM_Sans] text-[11px] text-[var(--sl-t2)] mb-1">Receitas</div>
              <div className="sl-num font-[Syne] text-[16px] font-semibold text-[var(--sl-em)]">
                +{fmtBRL(periodStats.totalRecipes, { compact: true })}
              </div>
            </div>
            <div className="w-px bg-[var(--sl-border)]" />
            <div className="text-center">
              <div className="font-[DM_Sans] text-[11px] text-[var(--sl-t2)] mb-1">Despesas</div>
              <div className="sl-num font-[Syne] text-[16px] font-semibold text-[var(--sl-danger)]">
                – {fmtBRL(periodStats.totalExpenses, { compact: true })}
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        {mobileTopCats.length > 0 && (
          <>
            <div className="font-[Syne] text-[11px] font-bold text-[var(--sl-em)] uppercase tracking-[0.14em] px-1 pb-2 mt-1">
              Gastos por categoria
            </div>
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 mb-3">
              <div className="flex flex-col gap-[10px]">
                {mobileTopCats.map(cat => {
                  const pct = Math.round((cat.currentTotal / mobileTotalCat) * 100)
                  const barColor =
                    pct > 85 ? 'var(--sl-danger)' : pct > 70 ? 'var(--sl-warning)' : 'var(--sl-success)'
                  return (
                    <div key={cat.name} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: cat.color }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between mb-[3px]">
                          <span className="font-[DM_Sans] text-[12px] text-[var(--sl-t1)]">{cat.name}</span>
                          <span className="sl-num font-[Syne] text-[12px] text-[var(--sl-t2)]">
                            {fmtBRL(cat.currentTotal, { compact: true })}
                          </span>
                        </div>
                        <div
                          className="h-[6px] rounded-[3px] overflow-hidden"
                          style={{ background: 'var(--sl-s3)' }}
                          title={`${pct}% do total`}
                        >
                          <div
                            className="h-full rounded-[3px]"
                            style={{ width: `${pct}%`, background: barColor }}
                          />
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
            <div className="font-[Syne] text-[11px] font-bold text-[var(--sl-em)] uppercase tracking-[0.14em] px-1 pb-2">
              Comparativo
            </div>
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-[DM_Sans] text-[13px] text-[var(--sl-t2)]">vs. período anterior</span>
                {expenseDelta !== null && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 font-[Syne] text-[11px] font-semibold px-2 py-0.5 rounded-full sl-num',
                      expenseDelta <= 0
                        ? 'bg-[var(--sl-em-soft)] text-[var(--sl-em)]'
                        : 'bg-[rgba(219,100,120,0.12)] text-[var(--sl-danger)]'
                    )}
                  >
                    {expenseDelta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {fmtBRL(Math.abs(periodStats.totalExpenses - periodStats.prevTotalExpenses), { compact: true })}
                  </span>
                )}
              </div>
              {/* Mini bar chart with tooltips (G-01) */}
              <div className="flex items-end justify-around h-20 gap-1">
                {barChartData.slice(-4).map((bar, i) => {
                  const lastFour = barChartData.slice(-4)
                  const maxVal = Math.max(...lastFour.map(b => b.despesas || 1))
                  const h = Math.round(((bar.despesas || 0) / maxVal) * 72)
                  const isLast = i === lastFour.length - 1
                  return (
                    <div key={bar.month} className="flex flex-col items-center gap-1">
                      <div
                        className="w-8 rounded-t"
                        style={{
                          height: h,
                          background: isLast ? 'var(--sl-em)' : 'var(--sl-em-soft)',
                        }}
                        title={`${bar.month}: ${fmtBRL(bar.despesas, { compact: true })}`}
                      />
                      <span
                        className={cn(
                          'font-[DM_Sans] text-[10px]',
                          isLast ? 'text-[var(--sl-em)] font-semibold' : 'text-[var(--sl-t2)]'
                        )}
                      >
                        {bar.month}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
        <div className="h-5" />
      </div>
    </FinancasMobileShell>
  )
}
