'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip,
  ResponsiveContainer,
} from 'recharts'
import { CustomHistTip } from '@/components/financas/CustomHistTip'
import { DonutChart } from '@/components/financas/DonutChart'
import { fmtBRL } from '@/lib/format/currency'
import type { MonthlyAgg, CatDataItem } from '@/components/financas/helpers'

interface HistoricoChartProps {
  histData: MonthlyAgg[]
  catData: CatDataItem[]
  totalGasto: number
  alertCat: { category?: { name?: string } | null; pct: number } | null
}

/**
 * Charts side-by-side — HistoricoChart (1.4fr) + GastosCategoria (1fr).
 * Padrão 2 v3: títulos em Space Grotesk, legenda no header,
 * tooltip Recharts customizada (G-01), cores --sl-em / --sl-danger.
 */
export function HistoricoChart({ histData, catData, totalGasto, alertCat }: HistoricoChartProps) {
  return (
    <div className="grid gap-3.5 mb-3.5 max-lg:grid-cols-1" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
      {/* Histórico — Receitas vs Despesas */}
      <article className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[22px] hover:border-[var(--sl-border-h)] transition-colors">
        <header className="flex justify-between items-baseline mb-4">
          <h3 className="font-[Space_Grotesk] text-[16px] font-semibold m-0 text-[var(--sl-t1)] tracking-[-0.01em]">
            Histórico, Receitas vs Despesas
          </h3>
          <div className="flex items-center gap-3.5">
            <Legend color="var(--sl-em)" label="Receitas" />
            <Legend color="var(--sl-danger)" label="Despesas" />
          </div>
        </header>

        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histData} barCategoryGap="22%" barGap={3}>
              <CartesianGrid vertical={false} stroke="var(--sl-border)" strokeOpacity={0.5} />
              <XAxis
                dataKey="mes"
                tick={{ fill: 'var(--sl-t3)', fontSize: 11, fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <RechartsTip content={<CustomHistTip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="rec" fill="var(--sl-em)" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
              <Bar dataKey="des" fill="var(--sl-danger)" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      {/* Gastos por Categoria — donut + lista lateral */}
      <article className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[22px] hover:border-[var(--sl-border-h)] transition-colors">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="font-[Space_Grotesk] text-[16px] font-semibold m-0 text-[var(--sl-t1)] tracking-[-0.01em]">
            Gastos por categoria
          </h3>
          {alertCat && (
            <span
              className="text-[10px] font-bold tracking-[0.06em] uppercase px-2 py-[3px] rounded-full"
              style={{
                background: 'rgba(217,150,46,0.12)',
                color: 'var(--sl-warning)',
                border: '1px solid rgba(217,150,46,0.32)',
              }}
            >
              {alertCat.category?.name ?? 'Cat.'} {alertCat.pct}%
            </span>
          )}
        </header>

        <div className="flex items-center gap-[22px] max-sm:flex-col max-sm:items-start">
          <DonutChart data={catData} totalGasto={totalGasto} />
          <div className="flex-1 min-w-0 flex flex-col gap-[7px]">
            {catData.length === 0 ? (
              <p className="text-[12px] text-[var(--sl-t3)] py-4">
                Nenhum orçamento com gastos
              </p>
            ) : (
              catData.slice(0, 6).map((cat) => (
                <div
                  key={cat.nome}
                  className="flex items-center gap-2.5 min-w-0 py-[2px] px-1 -mx-1 rounded"
                >
                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ background: cat.cor }}
                  />
                  <span className="flex-1 text-[12px] text-[var(--sl-t2)] truncate min-w-0">
                    {cat.nome}
                  </span>
                  <span className="sl-num text-[11.5px] text-[var(--sl-t1)] font-medium whitespace-nowrap shrink-0">
                    {fmtBRL(cat.val)}
                  </span>
                  <span
                    className="text-[11px] text-[var(--sl-t3)] text-right shrink-0"
                    style={{ minWidth: 28 }}
                  >
                    {cat.pct}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </article>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--sl-t2)]">
      <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
      <span>{label}</span>
    </span>
  )
}
