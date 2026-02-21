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

  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expense]), 100)
  // Round up to nearest 1000 with 20% headroom
  const chartMax = Math.ceil((maxValue * 1.2) / 1000) * 1000 || 4000

  const formatAxisLabel = (value: number) => {
    if (value === 0) return 'R$ 0'
    if (value >= 1000) return `R$ ${Math.round(value / 1000)}k`
    return `R$ ${value}`
  }

  const yAxisLabels = [
    formatAxisLabel(chartMax),
    formatAxisLabel(chartMax * 0.75),
    formatAxisLabel(chartMax * 0.5),
    formatAxisLabel(chartMax * 0.25),
    'R$ 0',
  ]

  const getBarHeight = (value: number) => {
    if (chartMax === 0) return 0
    return (value / chartMax) * 100
  }

  const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null
  // Tooltip alinha à direita quando o mês hovado está na metade direita
  const tooltipAlignRight = hoveredIndex !== null && hoveredIndex >= data.length * 0.55

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

      {/* Bar chart — sem h-64 no container externo para labels X não serem cortadas pelo overflow-y forçado */}
      <div className="relative min-w-0 overflow-x-auto lg:overflow-hidden">
        <div className="relative w-full min-w-[480px]">
          {/* Área do gráfico — altura fixa */}
          <div className="relative h-56">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-slate-500 flex-shrink-0">
              {yAxisLabels.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>

            {/* Linhas de referência horizontais — alinhadas com os labels do eixo Y */}
            <div className="absolute left-14 right-2 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-slate-700/20" />
              <div className="border-t border-dashed border-slate-700/40" />
              <div className="border-t border-dashed border-slate-700/40" />
              <div className="border-t border-dashed border-slate-700/40" />
              <div /> {/* linha do zero já coberta pelo border-b das barras */}
            </div>

            {/* Tooltip — único, renderizado dentro da área do gráfico para evitar clipping */}
            {hoveredItem && (
              <div
                className={`absolute top-1 z-20 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-xl px-3 py-2.5 pointer-events-none shadow-xl text-xs transition-none ${
                  tooltipAlignRight ? 'right-2' : 'left-14'
                }`}
              >
                <div className="font-semibold text-white mb-1.5 text-[11px]">{hoveredItem.month}</div>
                <div className="flex flex-col gap-1 min-w-[140px]">
                  {(filter === 'all' || filter === 'income') && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span className="text-slate-400">Receitas</span>
                      <span className="text-emerald-400 font-semibold ml-auto">{formatCurrency(hoveredItem.income)}</span>
                    </div>
                  )}
                  {(filter === 'all' || filter === 'expense') && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                      <span className="text-slate-400">Despesas</span>
                      <span className="text-rose-400 font-semibold ml-auto">{formatCurrency(hoveredItem.expense)}</span>
                    </div>
                  )}
                  {filter === 'all' && (
                    <div className="border-t border-slate-700/50 pt-1 mt-0.5 flex items-center gap-2">
                      <span className="text-slate-500">Saldo</span>
                      <span className={`font-semibold ml-auto ${
                        hoveredItem.income - hoveredItem.expense >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {formatCurrency(hoveredItem.income - hoveredItem.expense)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Barras */}
            <div className="ml-14 h-full flex items-end gap-1.5 pb-6 border-b border-slate-800 pr-2">
              {data.map((item, index) => {
                const isHovered = hoveredIndex === index
                const isOtherHovered = hoveredIndex !== null && !isHovered

                return (
                  <div
                    key={index}
                    className={`flex-1 h-full flex items-end justify-center gap-0.5 cursor-pointer transition-opacity duration-150 ${
                      isOtherHovered ? 'opacity-35' : 'opacity-100'
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Barra de receita */}
                    {(filter === 'all' || filter === 'income') && (
                      <div
                        className={`rounded-t transition-colors duration-150 ${
                          filter === 'all' ? 'w-[42%]' : 'w-[72%]'
                        } ${
                          isHovered
                            ? 'bg-emerald-400'
                            : item.isCurrent
                            ? 'bg-emerald-500'
                            : 'bg-emerald-700'
                        }`}
                        style={{ height: `${getBarHeight(item.income)}%` }}
                      />
                    )}
                    {/* Barra de despesa */}
                    {(filter === 'all' || filter === 'expense') && (
                      <div
                        className={`rounded-t transition-colors duration-150 ${
                          filter === 'all' ? 'w-[42%]' : 'w-[72%]'
                        } ${
                          isHovered
                            ? 'bg-rose-400'
                            : item.isCurrent
                            ? 'bg-rose-500'
                            : 'bg-rose-700'
                        }`}
                        style={{ height: `${getBarHeight(item.expense)}%` }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Labels do eixo X — fora do h-56 para não ser cortado pelo overflow forçado */}
          <div className="ml-14 flex gap-1.5 mt-2 pr-2">
            {data.map((item, index) => (
              <span
                key={index}
                className={`flex-1 min-w-0 text-center text-[10px] truncate transition-colors duration-150 ${
                  hoveredIndex === index
                    ? 'text-white font-semibold'
                    : item.isCurrent
                    ? 'text-[var(--color-sync-400)] font-medium'
                    : 'text-slate-500'
                }`}
                title={item.month}
              >
                {item.shortMonth}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-sm text-slate-400">Receitas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-rose-500" />
          <span className="text-sm text-slate-400">Despesas</span>
        </div>
      </div>
    </div>
  )
}
