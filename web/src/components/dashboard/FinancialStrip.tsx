'use client'

import { fmt } from '@/components/dashboard/dashboard-utils'

interface FinancialStripProps {
  balance: number
  totalIncome: number
  totalExpense: number
  savingsRate: number
  savingsTarget?: number
}

interface StripItem {
  label: string
  value: string
  delta: string
  valueColor: string
  deltaColor: string
}

export function FinancialStrip({
  balance,
  totalIncome,
  totalExpense,
  savingsRate,
  savingsTarget = 30,
}: FinancialStripProps) {
  const expenseRatio =
    totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0
  const items: StripItem[] = [
    {
      label: 'Saldo do mês',
      value: fmt(balance),
      delta: balance >= 0 ? '+ saudável' : 'negativo',
      valueColor: balance >= 0 ? 'var(--sl-em)' : 'var(--sl-danger)',
      deltaColor: balance >= 0 ? 'var(--sl-em)' : 'var(--sl-danger)',
    },
    {
      label: 'Receitas',
      value: fmt(totalIncome),
      delta: 'no mês',
      valueColor: 'var(--sl-t1)',
      deltaColor: 'var(--sl-em)',
    },
    {
      label: 'Despesas',
      value: fmt(totalExpense),
      delta: totalIncome > 0 ? `${expenseRatio}% da receita` : 'sem receita',
      valueColor: 'var(--sl-danger)',
      deltaColor: 'var(--sl-t3)',
    },
    {
      label: 'Poupança',
      value: `${savingsRate}%`,
      delta: `Meta: ${savingsTarget}%`,
      valueColor: 'var(--sl-t1)',
      deltaColor: savingsRate >= savingsTarget ? 'var(--sl-em)' : 'var(--sl-t3)',
    },
  ]

  return (
    <div className="flex bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] overflow-hidden transition-colors hover:border-[var(--sl-border-h)] max-md:grid max-md:grid-cols-2">
      {items.map((it, i) => (
        <div
          key={it.label}
          className="flex-1 px-5 py-4 flex flex-col gap-1.5"
          style={{
            borderRight:
              i < items.length - 1 ? '1px solid var(--sl-border)' : 'none',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
            {it.label}
          </p>
          <span
            className="font-[Syne] font-semibold tabular-nums text-[22px] leading-none"
            style={{ color: it.valueColor, letterSpacing: '-0.02em' }}
          >
            {it.value}
          </span>
          <span className="text-[11px]" style={{ color: it.deltaColor }}>
            {it.delta}
          </span>
        </div>
      ))}
    </div>
  )
}
