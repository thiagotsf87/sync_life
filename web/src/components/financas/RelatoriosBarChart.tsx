'use client'

import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { SLCard } from '@/components/ui/sl-card'
import { fmtR } from '@/components/financas/relatorios-helpers'

interface RelatoriosBarChartProps {
  barChartData: { month: string; receitas: number; despesas: number }[]
}

export function RelatoriosBarChart({ barChartData }: RelatoriosBarChartProps) {
  return (
    <SLCard>
      <div className="flex items-center justify-between mb-3">
        <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
          Receitas vs Despesas por Mês
        </p>
      </div>
      {barChartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={barChartData} barGap={2}>
              <CartesianGrid stroke="var(--sl-border)" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: 'var(--sl-t3)', fontFamily: 'IBM Plex Mono' }}
                axisLine={false} tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--sl-s3)', border: '1px solid var(--sl-border-h)', borderRadius: 9, fontSize: 11 }}
                formatter={(val: number | undefined, name: string | undefined) => [fmtR(val ?? 0), name === 'receitas' ? 'Receitas' : 'Despesas']}
              />
              <Bar dataKey="receitas" fill="#0F766E" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
              <Bar dataKey="despesas" fill="#DB6478" fillOpacity={0.6} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-[var(--sl-t3)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0F766E] opacity-70" /> Receitas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#DB6478] opacity-60" /> Despesas
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-[150px] text-[var(--sl-t3)] text-[12px]">
          Sem dados para o gráfico
        </div>
      )}
    </SLCard>
  )
}
