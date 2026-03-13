'use client'

import { cn } from '@/lib/utils'
import { SLCard } from '@/components/ui/sl-card'
import type { SavingsRatePoint } from '@/hooks/use-relatorios'

interface RelatoriosSavingsRateProps {
  savingsRateData: SavingsRatePoint[]
  goalRate: number
  maxSavingsRate: number
  avgSavingsRate: number
  bestMonthSavings: SavingsRatePoint | null
  worstMonthSavings: SavingsRatePoint | null
}

export function RelatoriosSavingsRate({
  savingsRateData,
  goalRate,
  maxSavingsRate,
  avgSavingsRate,
  bestMonthSavings,
  worstMonthSavings,
}: RelatoriosSavingsRateProps) {
  return (
    <SLCard>
      <div className="flex items-center justify-between mb-3">
        <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
          Taxa de Poupança Mensal
        </p>
        <span className="text-[11px] text-[var(--sl-t3)]">Meta: {goalRate}%</span>
      </div>

      {savingsRateData.length === 0 ? (
        <div className="flex items-center justify-center h-[120px] text-[var(--sl-t3)] text-[12px]">
          Sem dados para o período
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            {savingsRateData.map(m => (
              <div key={m.monthShort} className="flex items-center gap-2">
                <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t3)] w-12 shrink-0 truncate">{m.month}</span>
                <div className="flex-1 relative">
                  <div className="w-full h-[10px] bg-[var(--sl-s2)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${Math.min((m.rate / maxSavingsRate) * 100, 100)}%`,
                        background: m.rate >= goalRate ? '#10b981' : m.rate >= goalRate * 0.75 ? '#f59e0b' : '#f43f5e',
                      }}
                    />
                  </div>
                  <div
                    className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-[rgba(244,63,94,0.7)] rounded-[1px] z-[2] pointer-events-none"
                    style={{ left: `${Math.min((goalRate / maxSavingsRate) * 100, 99)}%` }}
                  />
                </div>
                <span className={cn(
                  'font-[DM_Mono] text-[11px] min-w-[36px] text-right shrink-0',
                  m.rate >= goalRate ? 'text-[#10b981]' : 'text-[#f43f5e]'
                )}>
                  {m.rate.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center pl-12 pr-11 mt-0.5">
            <span className="font-[DM_Mono] text-[9px] text-[var(--sl-t3)]">0%</span>
            <span className="ml-auto font-[DM_Mono] text-[9px] text-[rgba(244,63,94,0.5)]">Meta {goalRate}%</span>
          </div>

          <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-[var(--sl-border)]">
            <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
              <span
                className="font-[DM_Mono] text-[13px] font-medium"
                style={{ color: avgSavingsRate >= goalRate ? '#10b981' : '#f43f5e' }}>
                {avgSavingsRate.toFixed(1)}%
              </span>
              <span className="text-[9px] text-[var(--sl-t3)] text-center leading-tight">Média do período</span>
            </div>
            <div className="w-px h-7 bg-[var(--sl-border)] shrink-0" />
            <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
              <span className="font-[DM_Mono] text-[13px] font-medium text-[#10b981] truncate w-full text-center">
                {bestMonthSavings ? `${bestMonthSavings.month} (${bestMonthSavings.rate.toFixed(0)}%)` : '—'}
              </span>
              <span className="text-[9px] text-[var(--sl-t3)] text-center leading-tight">Melhor mês</span>
            </div>
            <div className="w-px h-7 bg-[var(--sl-border)] shrink-0" />
            <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
              <span className="font-[DM_Mono] text-[13px] font-medium text-[#f43f5e] truncate w-full text-center">
                {worstMonthSavings ? `${worstMonthSavings.month} (${worstMonthSavings.rate.toFixed(0)}%)` : '—'}
              </span>
              <span className="text-[9px] text-[var(--sl-t3)] text-center leading-tight">Pior mês</span>
            </div>
          </div>
        </>
      )}
    </SLCard>
  )
}
