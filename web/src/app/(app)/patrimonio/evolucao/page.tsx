'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { usePortfolioAssets, usePortfolioDividends, ASSET_CLASS_LABELS, ASSET_CLASS_COLORS } from '@/hooks/use-patrimonio'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as ReTooltip,
} from 'recharts'

type Period = '3m' | '6m' | '1a' | 'all'

export default function EvolucaoPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const [period, setPeriod] = useState<Period>('1a')

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
  // Since we don't have historical price snapshots, simulate based on avg_price and created_at
  // Group assets by creation month to simulate portfolio buildup
  const now = new Date()
  const periodMonths: Record<Period, number> = { '3m': 3, '6m': 6, '1a': 12, 'all': 60 }
  const months = periodMonths[period]
  const cutoff = new Date(now)
  cutoff.setMonth(cutoff.getMonth() - months)

  // Build monthly data points (invested value accumulation proxy)
  const dataPoints = Array.from({ length: months + 1 }, (_, i) => {
    const date = new Date(cutoff)
    date.setMonth(date.getMonth() + i)
    const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

    // Assets created before or at this point
    const activeAssets = assets.filter(a => new Date(a.created_at) <= date)
    const invested = activeAssets.reduce((s, a) => s + a.quantity * a.avg_price, 0)

    // Simulate market value: apply a linear interpolation between avg_price and current_price
    // based on elapsed time since asset creation
    const current = activeAssets.reduce((s, a) => {
      if (a.current_price == null) return s + a.quantity * a.avg_price
      const created = new Date(a.created_at).getTime()
      const now2 = Date.now()
      const t = now2 > created ? (date.getTime() - created) / (now2 - created) : 0
      const interpPrice = a.avg_price + (a.current_price - a.avg_price) * Math.max(0, Math.min(1, t))
      return s + a.quantity * interpPrice
    }, 0)

    // Dividends received up to this point
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
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => router.push('/patrimonio')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Patrimônio
        </button>
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl flex-1',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          📊 Evolução do Patrimônio
        </h1>
        <div className="flex gap-1 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] p-0.5">
          {(['3m', '6m', '1a', 'all'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all',
                period === p
                  ? 'bg-[var(--sl-s1)] text-[var(--sl-t1)] shadow-sm'
                  : 'text-[var(--sl-t2)] hover:text-[var(--sl-t1)]'
              )}
            >
              {p === 'all' ? 'Max' : p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        {[
          {
            label: 'Patrimônio Atual',
            value: formatCurrency(totalCurrent),
            delta: `Investido: ${formatCurrency(totalInvested)}`,
            deltaType: 'neutral' as const,
            color: '#10b981',
          },
          {
            label: 'Resultado',
            value: formatCurrency(profitLoss),
            delta: `${profitLossPct >= 0 ? '+' : ''}${profitLossPct.toFixed(2)}%`,
            deltaType: profitLoss >= 0 ? 'up' as const : 'down' as const,
            color: profitLoss >= 0 ? '#10b981' : '#f43f5e',
          },
          {
            label: 'Total c/ Proventos',
            value: formatCurrency(totalWithDividends),
            delta: `Proventos: ${formatCurrency(totalDividends)}`,
            deltaType: 'up' as const,
            color: '#f59e0b',
          },
          {
            label: 'Ativos',
            value: String(assets.length),
            delta: `${Object.keys(classTotals).length} classes`,
            deltaType: 'neutral' as const,
            color: '#0055ff',
          },
        ].map(kpi => (
          <div key={kpi.label} className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 overflow-hidden">
            <div className="absolute top-0 left-5 right-5 h-0.5 rounded-b" style={{ background: kpi.color }} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">{kpi.label}</p>
            <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)] leading-none">{kpi.value}</p>
            <p className={cn('text-[11px] mt-1', {
              'text-[#10b981]': kpi.deltaType === 'up',
              'text-[#f43f5e]': kpi.deltaType === 'down',
              'text-[var(--sl-t3)]': kpi.deltaType === 'neutral',
            })}>
              {kpi.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Jornada Insight */}
      <JornadaInsight
        text={
          profitLoss !== 0
            ? <>Seu patrimônio <strong style={{ color: profitLoss >= 0 ? '#10b981' : '#f43f5e' }}>
                {profitLoss >= 0 ? 'cresceu' : 'recuou'} {formatCurrency(Math.abs(profitLoss))}
              </strong> ({profitLossPct >= 0 ? '+' : ''}{profitLossPct.toFixed(2)}%) em relação ao custo médio.
              {totalDividends > 0 && <> Com proventos, o retorno total chega a <strong className="text-[#f59e0b]">{formatCurrency(profitLoss + totalDividends)}</strong>.</>}
            </>
            : <>Acompanhe a evolução do seu patrimônio ao longo do tempo. Adicione cotações atuais nos seus ativos para ver o resultado real.</>
        }
      />

      {loading ? (
        <div className="h-80 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
      ) : assets.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <div className="text-5xl mb-3">📊</div>
          <h3 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)] mb-2">Carteira vazia</h3>
          <p className="text-[13px] text-[var(--sl-t2)]">Adicione ativos para visualizar a evolução.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">

          {/* Evolution chart */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
            <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-4">📈 Evolução patrimonial</h2>
            <div className="h-72">
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
                      name === 'current' ? 'Valor atual' : name === 'invested' ? 'Investido' : 'Total c/ proventos',
                    ]}
                  />
                  <Area type="monotone" dataKey="invested" stroke="#0055ff" strokeWidth={1.5}
                    fill="url(#gradInvested)" strokeDasharray="4 2" />
                  <Area type="monotone" dataKey="current" stroke="#10b981" strokeWidth={2}
                    fill="url(#gradCurrent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 bg-[#10b981] rounded-full" />
                <span className="text-[10px] text-[var(--sl-t3)]">Valor atual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-px bg-[#0055ff] rounded-full" style={{ borderTop: '1px dashed #0055ff' }} />
                <span className="text-[10px] text-[var(--sl-t3)]">Custo médio</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_280px] gap-4 max-lg:grid-cols-1">

            {/* Performers */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">🏆 Performance por ativo</h2>
              {performers.length === 0 ? (
                <p className="text-[12px] text-[var(--sl-t3)]">Adicione cotações atuais nos ativos para ver performance.</p>
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
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 h-fit">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">🥧 Distribuição</h2>
              <div className="flex flex-col gap-2.5">
                {Object.entries(classTotals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cls, val]) => {
                    const pct = totalCurrent > 0 ? (val / totalCurrent) * 100 : 0
                    const color = ASSET_CLASS_COLORS[cls as keyof typeof ASSET_CLASS_COLORS] ?? '#6e90b8'
                    return (
                      <div key={cls}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] text-[var(--sl-t2)]">
                            {ASSET_CLASS_LABELS[cls as keyof typeof ASSET_CLASS_LABELS] ?? cls}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-[DM_Mono] text-[10px] text-[var(--sl-t3)]">{formatCurrency(val)}</span>
                            <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t1)]">{pct.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '4px' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
