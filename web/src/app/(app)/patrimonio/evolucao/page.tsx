'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePortfolioAssets, usePortfolioDividends, ASSET_CLASS_LABELS, ASSET_CLASS_COLORS } from '@/hooks/use-patrimonio'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { PatrimonioMobile } from '@/components/patrimonio/PatrimonioMobile'
import { ModuleHeader } from '@/components/ui/module-header'
import { MetricsStrip } from '@/components/ui/metrics-strip'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as ReTooltip,
} from 'recharts'

type Period = '3m' | '6m' | '1a' | 'all'

export default function EvolucaoPage() {
  const router = useRouter()

  const [period, setPeriod] = useState<Period>('6m')

  const { assets, loading: assetsLoading } = usePortfolioAssets()
  const { dividends, loading: divsLoading } = usePortfolioDividends()

  const loading = assetsLoading || divsLoading

  // Current portfolio snapshot
  const totalInvested = assets.reduce((s, a) => s + a.quantity * a.avg_price, 0)
  const totalCurrent = assets.reduce((s, a) =>
    s + (a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price), 0)
  const profitLoss = totalCurrent - totalInvested
  const profitLossPct = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0

  // Total dividends received
  const totalDividends = dividends.filter(d => d.status === 'received').reduce((s, d) => s + d.total_amount, 0)
  const totalWithDividends = totalCurrent + totalDividends

  // Build simulated evolution from asset.created_at + transactions
  const now = new Date()
  const periodMonths: Record<Period, number> = { '3m': 3, '6m': 6, '1a': 12, 'all': 60 }
  const months = periodMonths[period]
  const cutoff = new Date(now)
  cutoff.setMonth(cutoff.getMonth() - months)

  // Build monthly data points
  const dataPoints = Array.from({ length: months + 1 }, (_, i) => {
    const date = new Date(cutoff)
    date.setMonth(date.getMonth() + i)
    const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

    const activeAssets = assets.filter(a => new Date(a.created_at) <= date)
    const invested = activeAssets.reduce((s, a) => s + a.quantity * a.avg_price, 0)

    const current = activeAssets.reduce((s, a) => {
      if (a.current_price == null) return s + a.quantity * a.avg_price
      const created = new Date(a.created_at).getTime()
      const now2 = Date.now()
      const t = now2 > created ? (date.getTime() - created) / (now2 - created) : 0
      const interpPrice = a.avg_price + (a.current_price - a.avg_price) * Math.max(0, Math.min(1, t))
      return s + a.quantity * interpPrice
    }, 0)

    const divs = dividends
      .filter(d => d.status === 'received' && new Date(d.payment_date) <= date)
      .reduce((s, d) => s + d.total_amount, 0)

    return { date: label, invested: Math.round(invested), current: Math.round(current), withDividends: Math.round(current + divs) }
  })

  // Class distribution chart data
  const classTotals = assets.reduce<Record<string, number>>((acc, a) => {
    const val = a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price
    acc[a.asset_class] = (acc[a.asset_class] ?? 0) + val
    return acc
  }, {})

  // Top performers
  const performers = assets
    .filter(a => a.current_price != null)
    .map(a => {
      const invested = a.quantity * a.avg_price
      const current = a.quantity * a.current_price!
      const pct = invested > 0 ? ((current - invested) / invested) * 100 : 0
      return { ...a, pct, pnl: current - invested }
    })
    .sort((a, b) => b.pct - a.pct)

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <>
      <PatrimonioMobile initialTab="evolucao" />
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* ModuleHeader */}
      <ModuleHeader
        icon={TrendingUp}
        iconBg="rgba(59,130,246,.08)"
        iconColor="#3b82f6"
        title="Evolucao Patrimonial"
        subtitle="Acompanhe o crescimento ao longo do tempo"
      >
        <div className="flex bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] p-[3px] gap-0.5">
          {(['3m', '6m', '1a', 'all'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn(
                'px-3.5 py-[6px] rounded-[8px] text-[12px] font-semibold transition-all',
                period === p
                  ? 'bg-[rgba(59,130,246,.08)] text-[#3b82f6]'
                  : 'text-[var(--sl-t3)] hover:text-[var(--sl-t1)]'
              )}
            >
              {p === 'all' ? 'Max' : p}
            </button>
          ))}
        </div>
      </ModuleHeader>

      {/* MetricsStrip — inline horizontal strip with internal dividers */}
      <div className="mb-3.5 sl-fade-up sl-delay-1">
        <MetricsStrip
          items={[
            {
              label: 'Atual',
              value: formatCurrency(totalCurrent),
            },
            {
              label: 'Investido',
              value: formatCurrency(totalInvested),
            },
            {
              label: 'Resultado',
              value: `${profitLoss >= 0 ? '+' : ''}${formatCurrency(profitLoss)}`,
              valueColor: profitLoss >= 0 ? '#10b981' : '#f43f5e',
            },
            {
              label: 'c/ Proventos',
              value: formatCurrency(totalWithDividends),
              valueColor: '#f59e0b',
            },
            {
              label: 'Rentab.',
              value: `${profitLossPct >= 0 ? '+' : ''}${profitLossPct.toFixed(2)}%`,
              valueColor: profitLossPct >= 0 ? '#10b981' : '#f43f5e',
            },
          ]}
        />
      </div>

      {/* Jornada Insight */}
      <JornadaInsight
        text={
          profitLoss !== 0
            ? <>Seu patrimonio <strong style={{ color: profitLoss >= 0 ? '#10b981' : '#f43f5e' }}>
                {profitLoss >= 0 ? 'cresceu' : 'recuou'} {formatCurrency(Math.abs(profitLoss))}
              </strong> ({profitLossPct >= 0 ? '+' : ''}{profitLossPct.toFixed(2)}%) em relacao ao custo medio.
              {totalDividends > 0 && <> Com proventos, o retorno total chega a <strong className="text-[#f59e0b]">{formatCurrency(profitLoss + totalDividends)}</strong>.</>}
            </>
            : <>Acompanhe a evolucao do seu patrimonio ao longo do tempo. Adicione cotacoes atuais nos seus ativos para ver o resultado real.</>
        }
      />

      {loading ? (
        <div className="h-80 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
      ) : assets.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-12 text-center">
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Carteira vazia</h3>
          <p className="text-[13px] text-[var(--sl-t2)]">Adicione ativos para visualizar a evolucao.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">

          {/* Evolution chart */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6
                          transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-2">
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataPoints} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0055ff" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0055ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradWithDivs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--sl-s3)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--sl-t3)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'var(--sl-t3)' }} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                  <ReTooltip
                    contentStyle={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)', borderRadius: '12px', fontSize: '11px' }}
                    labelStyle={{ color: 'var(--sl-t1)', marginBottom: 4 }}
                    formatter={(v: number | undefined, name: string | undefined) => [
                      (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                      name === 'current' ? 'Valor atual' : name === 'invested' ? 'Investido' : 'c/ proventos',
                    ]}
                  />
                  <Area type="monotone" dataKey="invested" stroke="#0055ff" strokeWidth={1.5}
                    fill="url(#gradInvested)" strokeDasharray="4 2" />
                  <Area type="monotone" dataKey="withDividends" stroke="#f59e0b" strokeWidth={1.5}
                    fill="url(#gradWithDivs)" />
                  <Area type="monotone" dataKey="current" stroke="#10b981" strokeWidth={2}
                    fill="url(#gradCurrent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 mt-3.5 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-[3px] bg-[#10b981] rounded-sm" />
                <span className="text-[10px] text-[var(--sl-t3)]">Valor atual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-px rounded-sm" style={{ borderTop: '2px dashed #0055ff' }} />
                <span className="text-[10px] text-[var(--sl-t3)]">Custo medio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-[2px] bg-[#f59e0b] rounded-sm" />
                <span className="text-[10px] text-[var(--sl-t3)]">c/ proventos</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_300px] gap-3.5 max-lg:grid-cols-1 sl-fade-up sl-delay-3">

            {/* Performers */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6
                            transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-2.5 mb-[18px]">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  Performance por Ativo
                </span>
              </div>
              {performers.length === 0 ? (
                <p className="text-[12px] text-[var(--sl-t3)]">Adicione cotacoes atuais nos ativos para ver performance.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {performers.slice(0, 10).map(a => (
                    <div key={a.id} className="flex items-center gap-3">
                      <span className="font-[DM_Mono] font-bold text-[12px] text-[var(--sl-t1)] w-20 shrink-0">{a.ticker}</span>
                      <div className="flex-1 bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '4px' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(Math.abs(a.pct), 100)}%`,
                            background: a.pct >= 0 ? '#10b981' : '#f43f5e',
                          }}
                        />
                      </div>
                      <span
                        className="font-[DM_Mono] text-[11px] font-bold w-16 text-right shrink-0"
                        style={{ color: a.pct >= 0 ? '#10b981' : '#f43f5e' }}
                      >
                        {a.pct >= 0 ? '+' : ''}{a.pct.toFixed(2)}%
                      </span>
                      <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] w-24 text-right shrink-0">
                        {a.pnl >= 0 ? '+' : ''}{formatCurrency(a.pnl)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Class distribution */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 h-fit
                            transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-2.5 mb-[18px]">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
                <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  Distribuicao
                </span>
              </div>
              {/* Stacked bar */}
              <div className="h-5 rounded-[10px] overflow-hidden flex mb-3.5">
                {Object.entries(classTotals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cls, val]) => {
                    const pct = totalCurrent > 0 ? (val / totalCurrent) * 100 : 0
                    const color = ASSET_CLASS_COLORS[cls as keyof typeof ASSET_CLASS_COLORS] ?? '#6e90b8'
                    return (
                      <div key={cls} style={{ width: `${pct}%`, background: color }} />
                    )
                  })}
              </div>
              <div className="flex flex-col gap-[5px]">
                {Object.entries(classTotals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cls, val]) => {
                    const pct = totalCurrent > 0 ? (val / totalCurrent) * 100 : 0
                    const color = ASSET_CLASS_COLORS[cls as keyof typeof ASSET_CLASS_COLORS] ?? '#6e90b8'
                    return (
                      <div key={cls} className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: color }} />
                        <span className="flex-1 text-[var(--sl-t2)]">
                          {ASSET_CLASS_LABELS[cls as keyof typeof ASSET_CLASS_LABELS] ?? cls}
                        </span>
                        <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t3)]">{pct.toFixed(0)}%</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
