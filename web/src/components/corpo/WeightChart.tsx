'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { WeightEntry } from '@/hooks/use-corpo'

interface WeightChartProps {
  entries: WeightEntry[]
  goalWeight?: number | null
  months?: 3 | 6 | 12
}

interface ChartPoint {
  date: string
  weight: number
  label: string
}

export function WeightChart({ entries, goalWeight, months = 3 }: WeightChartProps) {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)

  const data: ChartPoint[] = entries
    .filter(e => new Date(e.recorded_at) >= cutoff)
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map(e => ({
      date: e.recorded_at,
      weight: e.weight,
      label: new Date(e.recorded_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    }))

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-[12px] text-[var(--sl-t3)]">
        {data.length === 0
          ? 'Nenhum registro de peso neste período.'
          : 'Adicione mais registros para ver o gráfico.'}
      </div>
    )
  }

  const weights = data.map(d => d.weight)
  const minW = Math.floor(Math.min(...weights, goalWeight ?? Infinity) - 1)
  const maxW = Math.ceil(Math.max(...weights, goalWeight ?? -Infinity) + 1)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--sl-border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: 'var(--sl-t3)' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minW, maxW]}
          tick={{ fontSize: 10, fill: 'var(--sl-t3)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v}kg`}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--sl-s2)',
            border: '1px solid var(--sl-border)',
            borderRadius: '10px',
            fontSize: '12px',
            color: 'var(--sl-t1)',
          }}
          formatter={(v: number | undefined) => [`${v ?? ''} kg`, 'Peso']}
          labelFormatter={l => l}
        />
        {goalWeight && (
          <ReferenceLine
            y={goalWeight}
            stroke="#10b981"
            strokeDasharray="6 3"
            label={{ value: `Meta ${goalWeight}kg`, fill: '#10b981', fontSize: 9, position: 'insideTopRight' }}
          />
        )}
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#f97316"
          strokeWidth={2}
          dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
