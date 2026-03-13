'use client'

import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { SLCard } from '@/components/ui/sl-card'
import { fmtR } from '@/components/financas/relatorios-helpers'
import type { MonthlyChartPoint } from '@/hooks/use-relatorios'

interface RelatoriosTrendChartProps {
  lineChartData: MonthlyChartPoint[]
  lineChartCats: { name: string; color: string }[]
}

export function RelatoriosTrendChart({ lineChartData, lineChartCats }: RelatoriosTrendChartProps) {
  return (
    <SLCard className="flex flex-col">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)] flex items-center gap-1.5">
          <TrendingUp size={15} />
          Tendência de Gastos por Categoria
        </p>
        <span className="text-[11px] text-[var(--sl-t3)]">mês a mês no período</span>
      </div>
      {lineChartData.length > 0 && lineChartCats.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineChartData}>
              <CartesianGrid stroke="var(--sl-border)" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: 'var(--sl-t3)', fontFamily: 'DM Mono' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: 'var(--sl-t3)', fontFamily: 'DM Mono' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip
                contentStyle={{ background: 'var(--sl-s3)', border: '1px solid var(--sl-border-h)', borderRadius: 9, fontSize: 11 }}
                formatter={(val: number | undefined, name: string | undefined) => [fmtR(val ?? 0), name ?? '']}
              />
              {lineChartCats.map(cat => (
                <Line
                  key={cat.name}
                  type="monotone"
                  dataKey={cat.name}
                  stroke={cat.color}
                  strokeWidth={2}
                  dot={{ r: 3.5, fill: cat.color }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-3.5 flex-wrap mt-2 shrink-0">
            {lineChartCats.map(cat => (
              <span key={cat.name} className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t2)]">
                <span className="w-3 h-[3px] rounded-[2px] inline-block" style={{ background: cat.color }} />
                {cat.name}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[180px] text-[var(--sl-t3)] text-[12px]">
          Sem dados suficientes para o gráfico
        </div>
      )}
    </SLCard>
  )
}
