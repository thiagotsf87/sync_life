'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/format'

interface MonthData {
  month: string
  shortMonth: string
  income: number
  expense: number
  isCurrent?: boolean
}

interface ExpenseChartProps {
  data: MonthData[]
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expense]))
  const yAxisLabels = ['R$ 8k', 'R$ 6k', 'R$ 4k', 'R$ 2k', 'R$ 0']

  const getBarHeight = (value: number) => {
    return (value / 8000) * 100 // Assuming max 8k for visualization
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6 min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 min-w-0">
        <div>
          <h2 className="text-lg font-semibold text-white">Receitas vs Despesas</h2>
          <p className="text-sm text-slate-400">Comparativo dos últimos 12 meses</p>
        </div>
        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
              filter === 'all'
                ? 'bg-[var(--color-sync-500)]/20 text-[var(--color-sync-400)] border-[var(--color-sync-500)]/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
            }`}
          >
            Ambos
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
              filter === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400'
            }`}
          >
            Receitas
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
              filter === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-rose-500/50 hover:text-rose-400'
            }`}
          >
            Despesas
          </button>
        </div>
      </div>

      {/* Bar chart — scroll horizontal em telas estreitas para não ultrapassar o layout */}
      <div className="relative h-64 min-w-0 overflow-x-auto lg:overflow-hidden overflow-y-visible">
        <div className="relative h-64 w-full min-w-[480px]">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-500 flex-shrink-0">
            {yAxisLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>

          {/* Chart area */}
          <div className="ml-14 h-full flex items-end gap-1 sm:gap-2 pb-8 border-b border-slate-800 pr-2">
          {data.map((item, index) => {
            const isHovered = hoveredIndex === index

            return (
              <div
                key={index}
                className="flex-1 h-full flex items-end justify-center gap-0.5 cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm z-10 whitespace-nowrap shadow-lg">
                    <div className="font-semibold text-white mb-2">{item.month}</div>
                    <div className="flex flex-col gap-1">
                      <div>
                        <span className="text-emerald-400 font-semibold">{formatCurrency(item.income)}</span>
                        <span className="text-slate-400"> receitas</span>
                      </div>
                      <div>
                        <span className="text-rose-400 font-semibold">{formatCurrency(item.expense)}</span>
                        <span className="text-slate-400"> despesas</span>
                      </div>
                      <div className="border-t border-slate-700 pt-1 mt-1">
                        Saldo:{' '}
                        <span className={item.income - item.expense >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {formatCurrency(item.income - item.expense)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bars */}
                {(filter === 'all' || filter === 'income') && (
                  <div
                    className={`${filter === 'all' ? 'w-3' : 'w-5'} rounded-t transition-all duration-300 ${
                      item.isCurrent
                        ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                        : 'bg-emerald-500 group-hover:brightness-110'
                    }`}
                    style={{ height: `${getBarHeight(item.income)}%` }}
                  />
                )}
                {(filter === 'all' || filter === 'expense') && (
                  <div
                    className={`${filter === 'all' ? 'w-3' : 'w-5'} rounded-t transition-all duration-300 ${
                      item.isCurrent
                        ? 'bg-rose-400 ring-2 ring-rose-400/30'
                        : 'bg-rose-500 group-hover:brightness-110'
                    }`}
                    style={{ height: `${getBarHeight(item.expense)}%` }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* X-axis labels */}
        <div className="ml-14 flex gap-1 sm:gap-2 mt-2 pr-2">
          {data.map((item, index) => (
            <span
              key={index}
              className={`flex-1 min-w-0 text-center text-[10px] truncate ${
                item.isCurrent ? 'text-[var(--color-sync-400)] font-medium' : 'text-slate-500'
              }`}
              title={item.month}
            >
              {item.shortMonth}
            </span>
          ))}
        </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
          <span className="text-sm text-slate-400">Receitas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-rose-500"></div>
          <span className="text-sm text-slate-400">Despesas</span>
        </div>
      </div>
    </div>
  )
}
