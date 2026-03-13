'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip,
  ResponsiveContainer
} from 'recharts'
import { CustomHistTip } from '@/components/financas/CustomHistTip'
import { DonutChart } from '@/components/financas/DonutChart'
import { fmtR$ } from '@/components/financas/helpers'
import type { MonthlyAgg, CatDataItem } from '@/components/financas/helpers'

interface HistoricoChartProps {
  histData: MonthlyAgg[]
  catData: CatDataItem[]
  totalGasto: number
  alertCat: { category?: { name?: string } | null; pct: number } | null
}

export function HistoricoChart({ histData, catData, totalGasto, alertCat }: HistoricoChartProps) {
  return (
    <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '1fr 400px' }}>
      {/* Histórico */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Histórico — Receitas vs Despesas</p>
        </div>
        <div className="flex gap-1.5 items-start">
          <div className="flex flex-col justify-between text-right" style={{ height: 130, paddingBottom: 24 }}>
            {['7k', '5k', '3k', '1k'].map(v => (
              <span key={v} className="font-[DM_Mono] text-[9px] text-[var(--sl-t3)] leading-none">{v}</span>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={histData} barCategoryGap="20%" barGap={2}>
                <CartesianGrid vertical={false} stroke="var(--sl-border)" strokeOpacity={0.5} />
                <XAxis dataKey="mes" tick={{ fill: 'var(--sl-t3)', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <RechartsTip content={<CustomHistTip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="rec" fill="#10b981" fillOpacity={0.75} radius={[3, 3, 0, 0]} />
                <Bar dataKey="des" fill="#f43f5e" fillOpacity={0.65} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex gap-3 mt-2 pt-2 border-t border-[var(--sl-border)]">
          {[{ cor: '#10b981', label: 'Receitas' }, { cor: '#f43f5e', label: 'Despesas' }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t3)]">
              <div className="w-[7px] h-[7px] rounded-sm" style={{ background: l.cor }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Gastos por Categoria */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Gastos por Categoria</p>
          {alertCat && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.12)] text-[#f59e0b]">
              ⚠ {alertCat.category?.name ?? 'Cat.'} {alertCat.pct}%
            </span>
          )}
        </div>
        <div className="flex gap-4 items-start">
          <DonutChart data={catData} totalGasto={totalGasto} />
          <div className="flex-1 min-w-0">
            {catData.length === 0 ? (
              <p className="text-[12px] text-[var(--sl-t3)] py-4">Nenhum orçamento com gastos</p>
            ) : (
              catData.map(cat => (
                <div key={cat.nome} className="flex items-center gap-2 py-1.5 border-b border-[var(--sl-border)] last:border-b-0">
                  <div className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: cat.cor }} />
                  <span className="flex-1 min-w-0 text-[12px] text-[var(--sl-t2)] truncate">{cat.nome}</span>
                  <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)]">R$ {fmtR$(cat.val)}</span>
                  <span className="font-bold text-[13px] text-[var(--sl-t1)] shrink-0">{cat.pct}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
