'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/format'

interface CategoryData {
  name: string
  value: number
  color: string
  percent: number
}

interface CategoryChartProps {
  data: CategoryData[]
  totalCategories: number
}

export function CategoryChart({ data, totalCategories }: CategoryChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const total = data.reduce((sum, d) => sum + d.value, 0)

  // Calculate stroke-dasharray values for the donut chart
  const circumference = 2 * Math.PI * 38 // radius = 38
  let offset = 0

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-6 min-w-0">
        <h2 className="text-lg font-semibold text-white">Despesas por categoria</h2>
        <button type="button" className="text-sm text-slate-400 hover:text-white transition-colors">
          Ver todas
        </button>
      </div>

      {/* Gráfico à esquerda, legenda à direita — sem espaço vazio à esquerda */}
      <div className="flex flex-col lg:flex-row flex-wrap lg:flex-nowrap items-center lg:items-stretch justify-start gap-8 lg:gap-10 min-h-0 min-w-0 w-full overflow-hidden">
        {/* Coluna do donut: alinhada ao início (esquerda), ocupa até 45% para o gráfico preencher */}
        <div className="flex flex-shrink-0 lg:w-[45%] min-w-0 justify-start items-center">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[400px] aspect-square flex-shrink-0">
          <svg
            className="transform -rotate-90 w-full h-full"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
            />
            {data.map((item) => {
              const dashLength = (item.percent / 100) * circumference
              const currentOffset = offset
              offset += dashLength

              return (
                <circle
                  key={item.name}
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="14"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={-currentOffset}
                  className={`transition-all duration-200 cursor-pointer ${
                    hoveredCategory === item.name ? 'brightness-125' : ''
                  }`}
                  onMouseEnter={() => setHoveredCategory(item.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              )
            })}
          </svg>
          {/* Centro: valor grande + label (como no protótipo) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              {hoveredCategory ? (
                <>
                  <p className="text-2xl lg:text-4xl font-bold text-white">
                    {data.find(d => d.name === hoveredCategory)?.percent}%
                  </p>
                  <p className="text-xs lg:text-base text-slate-400">{hoveredCategory}</p>
                </>
              ) : (
                <>
                  <p className="text-3xl lg:text-5xl font-bold text-white">{totalCategories}</p>
                  <p className="text-sm lg:text-base text-slate-400">categorias</p>
                </>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Legenda — ocupa o restante à direita */}
        <div className="flex-1 min-w-0 w-full lg:w-auto space-y-1 flex flex-col justify-center">
          {data.map((item) => (
            <div
              key={item.name}
              className={`flex items-center gap-2 text-sm cursor-pointer ${
                hoveredCategory === item.name ? 'bg-slate-800/50 rounded px-1 -mx-1' : ''
              }`}
              onMouseEnter={() => setHoveredCategory(item.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300 w-24 flex-shrink-0">{item.name}</span>
              <span className="font-semibold text-white w-20 text-right flex-shrink-0">
                {formatCurrency(item.value)}
              </span>
              <span className="text-xs text-slate-500 w-8 text-right flex-shrink-0">
                {item.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
