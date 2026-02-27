'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import {
  calcMonthsToIF, buildIFProjection,
  usePortfolioAssets, usePortfolioDividends,
} from '@/hooks/use-patrimonio'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as ReTooltip, ReferenceLine,
} from 'recharts'

interface SimForm {
  currentPortfolio: string
  monthlyContribution: string
  annualRate: string
  desiredIncome: string
}

const PRESET_RATES = [
  { label: 'Selic ~10%', rate: '10' },
  { label: 'Mixta ~12%', rate: '12' },
  { label: 'Real ~14%', rate: '14' },
]

const PRESET_INCOMES = [
  { label: 'R$ 5k', value: '5000' },
  { label: 'R$ 10k', value: '10000' },
  { label: 'R$ 20k', value: '20000' },
  { label: 'R$ 50k', value: '50000' },
]

export default function SimuladorPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { assets } = usePortfolioAssets()
  const { dividends } = usePortfolioDividends()

  // Calculate current portfolio value from assets
  const currentPortfolioValue = assets.reduce((s, a) =>
    s + (a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price), 0)
  const dividends12m = (() => {
    const year12Ago = new Date(); year12Ago.setMonth(year12Ago.getMonth() - 12)
    return dividends.filter(d => d.status === 'received' && new Date(d.payment_date) >= year12Ago).reduce((s, d) => s + d.total_amount, 0)
  })()

  const [form, setForm] = useState<SimForm>({
    currentPortfolio: currentPortfolioValue > 0 ? Math.round(currentPortfolioValue).toString() : '',
    monthlyContribution: '1000',
    annualRate: '12',
    desiredIncome: '10000',
  })

  const pv = parseFloat(form.currentPortfolio) || 0
  const pmt = parseFloat(form.monthlyContribution) || 0
  const rate = parseFloat(form.annualRate) || 12
  const desiredIncome = parseFloat(form.desiredIncome) || 10000

  const result = calcMonthsToIF(pv, pmt, rate, desiredIncome)
  const months = result.months
  const targetPortfolio = result.targetPortfolio

  const targetDate = new Date()
  targetDate.setMonth(targetDate.getMonth() + months)

  // Projection data — limit to sensible display
  const displayMonths = Math.min(months + 24, 360)
  const projection = buildIFProjection(pv, pmt, rate, desiredIncome, displayMonths)

  // Progress toward target
  const progressPct = targetPortfolio > 0 ? Math.min((pv / targetPortfolio) * 100, 100) : 0

  // Year points for X axis
  const xData = projection.filter(p => p.month % 12 === 0 || p.month === months).slice(0, 30)

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const formatYears = (m: number) => {
    if (m === 0) return 'Já atingiu!'
    const years = Math.floor(m / 12)
    const mths = m % 12
    if (years === 0) return `${mths} meses`
    if (mths === 0) return `${years} anos`
    return `${years}a ${mths}m`
  }

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
          🧮 Simulador de Independência Financeira
        </h1>
      </div>

      {/* KPI results */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 left-5 right-5 h-0.5 rounded-b bg-[#10b981]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Tempo para IF</p>
          <p className={cn('font-[Syne] font-extrabold text-xl leading-none', months === 0 ? 'text-[#10b981]' : 'text-[var(--sl-t1)]')}>
            {formatYears(months)}
          </p>
          {months > 0 && (
            <p className="text-[11px] mt-1 text-[var(--sl-t3)]">
              {targetDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 left-5 right-5 h-0.5 rounded-b bg-[#a855f7]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Patrimônio alvo</p>
          <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)] leading-none">
            {formatCurrency(targetPortfolio)}
          </p>
          <p className="text-[11px] mt-1 text-[var(--sl-t3)]">Regra dos 4%</p>
        </div>
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 left-5 right-5 h-0.5 rounded-b bg-[#0055ff]" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Progresso atual</p>
          <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)] leading-none">
            {progressPct.toFixed(1)}%
          </p>
          <div className="w-full bg-[var(--sl-s3)] rounded-full mt-2 overflow-hidden" style={{ height: '4px' }}>
            <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#10b981,#0055ff)' }} />
          </div>
        </div>
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 left-5 right-5 h-0.5 rounded-b bg-[#f59e0b]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Proventos/mês (12m)</p>
          <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)] leading-none">
            {formatCurrency(dividends12m / 12)}
          </p>
          <p className="text-[11px] mt-1 text-[var(--sl-t3)]">Média últimos 12m</p>
        </div>
      </div>

      {/* Jornada Insight */}
      <JornadaInsight
        text={
          months === 0
            ? <>🎉 Parabéns! Com o patrimônio atual, você já pode gerar uma renda passiva de <strong className="text-[#10b981]">{formatCurrency(desiredIncome)}/mês</strong> usando a regra dos 4%.</>
            : <>Em <strong className="text-[#10b981]">{formatYears(months)}</strong> você atinge seu objetivo de <strong className="text-[var(--sl-t1)]">{formatCurrency(desiredIncome)}/mês</strong> de renda passiva.
              O segredo está na consistência dos aportes mensais de <strong className="text-[#0055ff]">{formatCurrency(pmt)}</strong>.</>
        }
      />

      <div className="grid grid-cols-[340px_1fr] gap-4 max-lg:grid-cols-1">

        {/* Left: Inputs */}
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
            <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-4">⚙️ Parâmetros</h2>
            <div className="flex flex-col gap-4">

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                  Patrimônio atual (R$)
                </label>
                <input
                  type="number"
                  value={form.currentPortfolio}
                  onChange={e => setForm(f => ({ ...f, currentPortfolio: e.target.value }))}
                  placeholder="Ex: 100000"
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                />
                {currentPortfolioValue > 0 && (
                  <button
                    onClick={() => setForm(f => ({ ...f, currentPortfolio: Math.round(currentPortfolioValue).toString() }))}
                    className="text-[11px] text-[#10b981] mt-1 hover:opacity-80"
                  >
                    Usar valor da carteira ({formatCurrency(currentPortfolioValue)})
                  </button>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                  Aporte mensal (R$)
                </label>
                <input
                  type="number"
                  value={form.monthlyContribution}
                  onChange={e => setForm(f => ({ ...f, monthlyContribution: e.target.value }))}
                  placeholder="Ex: 1000"
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                  Taxa anual (%) — cenário base
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.annualRate}
                  onChange={e => setForm(f => ({ ...f, annualRate: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                />
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {PRESET_RATES.map(r => (
                    <button key={r.rate} onClick={() => setForm(f => ({ ...f, annualRate: r.rate }))}
                      className={cn(
                        'px-2 py-1 rounded-[6px] text-[10px] border transition-all',
                        form.annualRate === r.rate
                          ? 'border-[#10b981] bg-[#10b981]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t3)]'
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                  Renda passiva desejada/mês (R$)
                </label>
                <input
                  type="number"
                  value={form.desiredIncome}
                  onChange={e => setForm(f => ({ ...f, desiredIncome: e.target.value }))}
                  placeholder="Ex: 10000"
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {PRESET_INCOMES.map(i => (
                    <button key={i.value} onClick={() => setForm(f => ({ ...f, desiredIncome: i.value }))}
                      className={cn(
                        'px-2 py-1 rounded-[6px] text-[10px] border transition-all',
                        form.desiredIncome === i.value
                          ? 'border-[#10b981] bg-[#10b981]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t3)]'
                      )}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3 cenários */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
            <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">🎲 3 Cenários</h2>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Pessimista', rate: rate - 2, color: '#f43f5e' },
                { label: 'Base', rate, color: '#10b981' },
                { label: 'Otimista', rate: rate + 2, color: '#0055ff' },
              ].map(scenario => {
                const r = calcMonthsToIF(pv, pmt, Math.max(0.1, scenario.rate), desiredIncome)
                return (
                  <div key={scenario.label} className="flex items-center justify-between p-3 bg-[var(--sl-s2)] rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: scenario.color }} />
                      <span className="text-[12px] text-[var(--sl-t2)]">{scenario.label}</span>
                      <span className="text-[10px] text-[var(--sl-t3)]">{scenario.rate.toFixed(1)}%/a</span>
                    </div>
                    <span className="font-[DM_Mono] font-bold text-[12px]" style={{ color: scenario.color }}>
                      {formatYears(r.months)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
          <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-4">
            📈 Projeção patrimonial — {formatYears(displayMonths)}
          </h2>

          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={projection.filter((_, i) => i % Math.max(1, Math.floor(projection.length / 60)) === 0 || i === projection.length - 1)}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sl-s3)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: 'var(--sl-t3)' }}
                  tickLine={false}
                  tickFormatter={(v: number) => v % 12 === 0 ? `${v / 12}a` : ''}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: 'var(--sl-t3)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => {
                    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
                    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
                    return String(v)
                  }}
                />
                <ReTooltip
                  contentStyle={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)', borderRadius: '12px', fontSize: '11px' }}
                  labelFormatter={(v: unknown) => `Mês ${v} (${formatYears(Number(v))})`}
                  formatter={(v: number | undefined, name: string | undefined) => [
                    formatCurrency(v ?? 0),
                    name === 'pessimistic' ? 'Pessimista' : name === 'base' ? 'Base' : 'Otimista',
                  ]}
                />
                <ReferenceLine
                  y={targetPortfolio}
                  stroke="#a855f7"
                  strokeDasharray="6 3"
                  strokeWidth={1.5}
                  label={{ value: 'Meta IF', position: 'right', fontSize: 10, fill: '#a855f7' }}
                />
                <Line type="monotone" dataKey="pessimistic" stroke="#f43f5e" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="base" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="optimistic" stroke="#0055ff" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 justify-center flex-wrap">
            {[
              { color: '#f43f5e', label: 'Pessimista' },
              { color: '#10b981', label: 'Base' },
              { color: '#0055ff', label: 'Otimista' },
              { color: '#a855f7', label: 'Meta IF', dashed: true },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div
                  className="w-6 rounded-full"
                  style={{
                    height: '2px',
                    background: l.color,
                    borderTop: l.dashed ? `2px dashed ${l.color}` : undefined,
                  }}
                />
                <span className="text-[10px] text-[var(--sl-t3)]">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-[var(--sl-t3)] text-center mt-3">
            Simulação educativa baseada na Regra dos 4%. Retornos passados não garantem resultados futuros.
          </p>
        </div>
      </div>
    </div>
  )
}
