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
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Despesas por categoria</h2>
        <button className="text-sm text-slate-400 hover:text-white transition-colors">
          Ver todas
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Donut chart */}
        <div className="relative flex-shrink-0">
          <svg
            className="transform -rotate-90"
            width="200"
            height="200"
            viewBox="0 0 100 100"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
            />
            
            {/* Segments */}
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
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              {hoveredCategory ? (
                <>
                  <p className="text-2xl font-bold text-white">
                    {data.find(d => d.name === hoveredCategory)?.percent}%
                  </p>
                  <p className="text-sm text-slate-400">{hoveredCategory}</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-white">{totalCategories}</p>
                  <p className="text-sm text-slate-400">categorias</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((item) => (
            <div
              key={item.name}
              className={`flex items-center gap-2 text-sm p-2 rounded-lg transition-colors cursor-pointer ${
                hoveredCategory === item.name ? 'bg-slate-800' : ''
              }`}
              onMouseEnter={() => setHoveredCategory(item.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300 w-24">{item.name}</span>
              <span className="font-semibold text-white w-24 text-right">
                {formatCurrency(item.value)}
              </span>
              <span className="text-xs text-slate-500 w-10 text-right">
                {item.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
