'use client'

import { cn } from '@/lib/utils'
import type { PeriodStats } from '@/hooks/use-relatorios'
import { fmtR, getDeltaColor } from '@/components/financas/relatorios-helpers'

interface RelatoriosKpiStripProps {
  periodStats: PeriodStats
  periodLabel: string
  recipeDelta: number | null
  expenseDelta: number | null
  balanceDelta: number | null
  savingsDelta: number | null
}

export function RelatoriosKpiStrip({
  periodStats,
  periodLabel,
  recipeDelta,
  expenseDelta,
  balanceDelta,
  savingsDelta,
}: RelatoriosKpiStripProps) {
  return (
    <div className="grid grid-cols-4 gap-2.5 mb-3 max-lg:grid-cols-2">

      {/* Receitas */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-[17px] py-[15px] relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up">
        <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b bg-[#10b981]" />
        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[14px] mb-2.5 bg-[rgba(16,185,129,0.12)]">💰</div>
        <p className="text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-0.5">Receitas Totais</p>
        <p className="text-[9px] text-[var(--sl-t3)] italic mb-1.5">Período: {periodLabel}</p>
        <p className="font-[DM_Mono] text-[20px] font-medium leading-none mb-1.5 text-[#10b981]">
          {fmtR(periodStats.totalRecipes)}
        </p>
        <div className={cn('text-[11px]', getDeltaColor('recipes', recipeDelta))}>
          {recipeDelta !== null && (
            <>{recipeDelta > 0 ? '↑' : '↓'} {Math.abs(recipeDelta).toFixed(1)}%</>
          )}
        </div>
        <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
          vs anterior: {fmtR(periodStats.prevTotalRecipes)}
        </p>
      </div>

      {/* Despesas */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-[17px] py-[15px] relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-1">
        <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b bg-[#f43f5e]" />
        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[14px] mb-2.5 bg-[rgba(244,63,94,0.12)]">💸</div>
        <p className="text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-0.5">Despesas Totais</p>
        <p className="text-[9px] text-[var(--sl-t3)] italic mb-1.5">Período: {periodLabel}</p>
        <p className="font-[DM_Mono] text-[20px] font-medium leading-none mb-1.5 text-[#f43f5e]">
          {fmtR(periodStats.totalExpenses)}
        </p>
        <div className={cn('text-[11px]', getDeltaColor('expenses', expenseDelta))}>
          {expenseDelta !== null && (
            <>{expenseDelta > 0 ? '↑' : '↓'} {Math.abs(expenseDelta).toFixed(1)}%
            {expenseDelta > 5 ? ' ⚠' : ''}</>
          )}
        </div>
        <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
          vs anterior: {fmtR(periodStats.prevTotalExpenses)}
        </p>
      </div>

      {/* Saldo */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-[17px] py-[15px] relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-2">
        <div
          className="absolute top-0 left-4 right-4 h-0.5 rounded-b"
          style={{ background: periodStats.totalBalance >= 0 ? '#10b981' : '#f43f5e' }}
        />
        <div
          className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[14px] mb-2.5"
          style={{ background: periodStats.totalBalance >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)' }}>
          📈
        </div>
        <p className="text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-0.5">Saldo Acumulado</p>
        <p className="text-[9px] text-[var(--sl-t3)] italic mb-1.5">Período: {periodLabel}</p>
        <p
          className="font-[DM_Mono] text-[20px] font-medium leading-none mb-1.5"
          style={{ color: periodStats.totalBalance >= 0 ? '#10b981' : '#f43f5e' }}>
          {fmtR(periodStats.totalBalance)}
        </p>
        <div className={cn('text-[11px]', getDeltaColor('balance', balanceDelta))}>
          {balanceDelta !== null && (
            <>{balanceDelta > 0 ? '↑' : '↓'} {Math.abs(balanceDelta).toFixed(1)}%</>
          )}
        </div>
        <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
          vs anterior: {fmtR(periodStats.prevTotalBalance)}
        </p>
      </div>

      {/* Taxa de Poupança */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-[17px] py-[15px] relative overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-3">
        <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b bg-[#f59e0b]" />
        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[14px] mb-2.5 bg-[rgba(245,158,11,0.12)]">💹</div>
        <p className="text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-0.5">Taxa de Poupança</p>
        <p className="text-[9px] text-[var(--sl-t3)] italic mb-1.5">Média mensal</p>
        <p className="font-[DM_Mono] text-[20px] font-medium leading-none mb-1.5 text-[#f59e0b]">
          {periodStats.avgSavingsRate.toFixed(1)}%
        </p>
        <div className={cn('text-[11px]', getDeltaColor('savings', savingsDelta))}>
          {savingsDelta !== null && (
            <>{savingsDelta > 0 ? '↑' : '↓'} {Math.abs(savingsDelta).toFixed(1)}%</>
          )}
        </div>
        <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
          vs anterior: {periodStats.prevAvgSavingsRate.toFixed(1)}%
        </p>
      </div>
    </div>
  )
}
