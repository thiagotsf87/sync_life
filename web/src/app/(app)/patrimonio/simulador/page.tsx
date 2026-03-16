'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  calcMonthsToIF, buildIFProjection,
  usePortfolioAssets, usePortfolioDividends,
} from '@/hooks/use-patrimonio'
import { ModuleHeader } from '@/components/ui/module-header'
import { useUserPlan } from '@/hooks/use-user-plan'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as ReTooltip, ReferenceLine,
} from 'recharts'

export default function SimuladorPage() {
  const router = useRouter()

  const { isPro } = useUserPlan()
  const { assets } = usePortfolioAssets()
  const { dividends } = usePortfolioDividends()

  // Calculate current portfolio value from assets
  const currentPortfolioValue = assets.reduce((s, a) =>
    s + (a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price), 0)
  const dividends12m = (() => {
    const year12Ago = new Date(); year12Ago.setMonth(year12Ago.getMonth() - 12)
    return dividends.filter(d => d.status === 'received' && new Date(d.payment_date) >= year12Ago).reduce((s, d) => s + d.total_amount, 0)
  })()

  // Slider state — numeric values for sliders
  const [pvSlider, setPvSlider] = useState(currentPortfolioValue > 0 ? Math.round(currentPortfolioValue) : 100000)
  const [pmtSlider, setPmtSlider] = useState(5000)
  const [rateSlider, setRateSlider] = useState(10.5)
  const [incomeSlider, setIncomeSlider] = useState(8000)

  const pv = pvSlider
  const pmt = pmtSlider
  const rate = rateSlider
  const desiredIncome = incomeSlider

  const result = calcMonthsToIF(pv, pmt, rate, desiredIncome)
  const months = result.months
  const targetPortfolio = result.targetPortfolio

  const targetDate = new Date()
  targetDate.setMonth(targetDate.getMonth() + months)

  // Projection data
  const displayMonths = Math.min(months + 24, 360)
  const projection = buildIFProjection(pv, pmt, rate, desiredIncome, displayMonths)

  // 3 scenarios
  const conservador = calcMonthsToIF(pv, pmt, Math.max(0.1, rate - 2.5), desiredIncome)
  const moderado = result
  const arrojado = calcMonthsToIF(pv, pmt, rate + 3.5, desiredIncome)

  const conservadorDate = new Date()
  conservadorDate.setMonth(conservadorDate.getMonth() + conservador.months)
  const arrojadoDate = new Date()
  arrojadoDate.setMonth(arrojadoDate.getMonth() + arrojado.months)

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const formatYears = (m: number) => {
    if (m === 0) return 'Ja atingiu!'
    const years = Math.floor(m / 12)
    const mths = m % 12
    if (years === 0) return `${mths}m`
    if (mths === 0) return `${years}a`
    return `${years}a ${mths}m`
  }

  // RN-PTR-21: Simulador exclusivo PRO
  if (!isPro) {
    return (
      <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">
        <ModuleHeader
          icon={Target}
          iconBg="rgba(245,158,11,.10)"
          iconColor="#f59e0b"
          title="Simulador IF"
          subtitle="Projete quando voce alcanca a liberdade financeira"
        />
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-12 text-center max-w-[480px] mx-auto">
          <Crown size={40} className="mx-auto mb-4 text-[#f59e0b]" />
          <h2 className="font-[Syne] font-bold text-lg text-[var(--sl-t1)] mb-2">
            Simulador IF — Recurso PRO
          </h2>
          <p className="text-[13px] text-[var(--sl-t2)] mb-6 leading-relaxed">
            Projete quanto tempo falta para a independencia financeira com 3 cenarios, grafico de evolucao e integracao com sua carteira real.
          </p>
          <button
            onClick={() => router.push('/configuracoes/plano')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-semibold text-[13px]
                       bg-gradient-to-r from-[#10b981] to-[#0055ff] text-white hover:opacity-90 transition-opacity"
          >
            <Crown size={14} />
            Assinar PRO
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* ModuleHeader */}
      <ModuleHeader
        icon={Target}
        iconBg="rgba(245,158,11,.10)"
        iconColor="#f59e0b"
        title="Simulador de Independencia Financeira"
        subtitle="Projete quando voce alcanca a liberdade financeira"
      />

      {/* SPLIT LAYOUT: Controls left, Chart right (per prototype: sim-split 380px 1fr) */}
      <div className="grid grid-cols-[380px_1fr] gap-3.5 max-lg:grid-cols-1 sl-fade-up sl-delay-1">

        {/* LEFT: Control Panel with SLIDERS */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7
                        transition-colors hover:border-[var(--sl-border-h)]">
          <div className="flex items-center gap-2.5 mb-6">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4 1.65 1.65 0 0 0 13.91 21v.09a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9" />
            </svg>
            <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
              Parametros
            </span>
          </div>

          {/* Patrimonio Atual — Slider */}
          <div className="mb-5">
            <div className="flex justify-between mb-1">
              <label className="text-[11px] font-semibold text-[var(--sl-t2)]">Patrimonio Atual</label>
              <span className="font-[DM_Mono] text-[14px] text-[var(--sl-t1)]">{formatCurrency(pvSlider)}</span>
            </div>
            <div className="relative w-full h-[6px] bg-[var(--sl-s3)] rounded-[3px] my-2">
              <div
                className="absolute left-0 top-0 h-full rounded-[3px]"
                style={{ width: `${Math.min(pvSlider / 1000000 * 100, 100)}%`, background: 'linear-gradient(90deg, #10b981, #0055ff)' }}
              />
              <input
                type="range"
                min={0}
                max={1000000}
                step={1000}
                value={pvSlider}
                onChange={e => setPvSlider(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full border-2 border-[#10b981] bg-[var(--sl-s1)] shadow-[0_2px_6px_rgba(0,0,0,.3)] pointer-events-none"
                style={{ left: `calc(${Math.min(pvSlider / 1000000 * 100, 100)}% - 9px)` }}
              />
            </div>
          </div>

          {/* Aporte Mensal — Slider */}
          <div className="mb-5">
            <div className="flex justify-between mb-1">
              <label className="text-[11px] font-semibold text-[var(--sl-t2)]">Aporte Mensal</label>
              <span className="font-[DM_Mono] text-[14px] text-[var(--sl-t1)]">{formatCurrency(pmtSlider)}</span>
            </div>
            <div className="relative w-full h-[6px] bg-[var(--sl-s3)] rounded-[3px] my-2">
              <div
                className="absolute left-0 top-0 h-full rounded-[3px]"
                style={{ width: `${Math.min(pmtSlider / 20000 * 100, 100)}%`, background: 'linear-gradient(90deg, #3b82f6, #a855f7)' }}
              />
              <input
                type="range"
                min={0}
                max={20000}
                step={100}
                value={pmtSlider}
                onChange={e => setPmtSlider(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full border-2 border-[#3b82f6] bg-[var(--sl-s1)] shadow-[0_2px_6px_rgba(0,0,0,.3)] pointer-events-none"
                style={{ left: `calc(${Math.min(pmtSlider / 20000 * 100, 100)}% - 9px)` }}
              />
            </div>
          </div>

          {/* Rentabilidade Anual — Slider */}
          <div className="mb-5">
            <div className="flex justify-between mb-1">
              <label className="text-[11px] font-semibold text-[var(--sl-t2)]">Rentabilidade Anual</label>
              <span className="font-[DM_Mono] text-[14px] text-[var(--sl-t1)]">{rateSlider.toFixed(1)}% a.a.</span>
            </div>
            <div className="relative w-full h-[6px] bg-[var(--sl-s3)] rounded-[3px] my-2">
              <div
                className="absolute left-0 top-0 h-full rounded-[3px]"
                style={{ width: `${Math.min(rateSlider / 20 * 100, 100)}%`, background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}
              />
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={rateSlider}
                onChange={e => setRateSlider(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full border-2 border-[#f59e0b] bg-[var(--sl-s1)] shadow-[0_2px_6px_rgba(0,0,0,.3)] pointer-events-none"
                style={{ left: `calc(${Math.min(rateSlider / 20 * 100, 100)}% - 9px)` }}
              />
            </div>
          </div>

          {/* Renda Passiva Desejada — Slider */}
          <div className="mb-5">
            <div className="flex justify-between mb-1">
              <label className="text-[11px] font-semibold text-[var(--sl-t2)]">Renda Passiva Desejada</label>
              <span className="font-[DM_Mono] text-[14px] text-[var(--sl-t1)]">{formatCurrency(incomeSlider)}/mes</span>
            </div>
            <div className="relative w-full h-[6px] bg-[var(--sl-s3)] rounded-[3px] my-2">
              <div
                className="absolute left-0 top-0 h-full rounded-[3px]"
                style={{ width: `${Math.min(incomeSlider / 20000 * 100, 100)}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
              />
              <input
                type="range"
                min={1000}
                max={50000}
                step={500}
                value={incomeSlider}
                onChange={e => setIncomeSlider(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full border-2 border-[#10b981] bg-[var(--sl-s1)] shadow-[0_2px_6px_rgba(0,0,0,.3)] pointer-events-none"
                style={{ left: `calc(${Math.min(incomeSlider / 20000 * 100, 100)}% - 9px)` }}
              />
            </div>
          </div>

          {/* Result highlight */}
          <div className="p-4 rounded-[14px] mt-2"
               style={{ background: 'rgba(59,130,246,.04)', border: '1px solid rgba(59,130,246,.12)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[.06em] text-[#3b82f6] mb-1.5">
              Resultado — Cenario Moderado
            </div>
            <div className="font-[DM_Mono] text-[28px] font-medium text-[#3b82f6]">
              {formatYears(months)}
            </div>
            <div className="text-[12px] text-[var(--sl-t2)] mt-1">
              Meta: {targetDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} · {formatCurrency(targetPortfolio)}
            </div>
          </div>
        </div>

        {/* RIGHT: Scenarios + Chart */}
        <div className="flex flex-col gap-3.5">

          {/* Scenario comparison strip (HORIZONTAL per prototype) */}
          <div className="flex gap-0 sl-fade-up sl-delay-2">
            <div className={cn(
              'flex-1 py-[18px] px-4 text-center border border-[var(--sl-border)] border-r-0 rounded-l-[14px] transition-colors'
            )}>
              <div className="text-[10px] font-bold uppercase text-[#f43f5e] mb-1">Conservador</div>
              <div className="font-[DM_Mono] text-[18px] font-medium text-[var(--sl-t1)]">
                {formatYears(conservador.months)}
              </div>
              <div className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                {(rate - 2.5).toFixed(1)}% a.a. · {conservadorDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className={cn(
              'flex-1 py-[18px] px-4 text-center border transition-colors',
              'border-[rgba(59,130,246,.3)] bg-[rgba(59,130,246,.03)]'
            )}>
              <div className="text-[10px] font-bold uppercase text-[#3b82f6] mb-1">Moderado</div>
              <div className="font-[DM_Mono] text-[18px] font-medium text-[#3b82f6]">
                {formatYears(moderado.months)}
              </div>
              <div className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                {rate.toFixed(1)}% a.a. · {targetDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className={cn(
              'flex-1 py-[18px] px-4 text-center border border-[var(--sl-border)] border-l-0 rounded-r-[14px] transition-colors'
            )}>
              <div className="text-[10px] font-bold uppercase text-[#10b981] mb-1">Arrojado</div>
              <div className="font-[DM_Mono] text-[18px] font-medium text-[var(--sl-t1)]">
                {formatYears(arrojado.months)}
              </div>
              <div className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                {(rate + 3.5).toFixed(1)}% a.a. · {arrojadoDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Projection chart */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 flex-1
                          transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-3">
            <div className="flex items-center gap-2.5 mb-[18px]">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              </svg>
              <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                Projecao Patrimonial
              </span>
            </div>

            <div className="h-[280px]">
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
                    labelFormatter={(v: unknown) => `Mes ${v} (${formatYears(Number(v))})`}
                    formatter={(v: number | undefined, name: string | undefined) => [
                      formatCurrency(v ?? 0),
                      name === 'pessimistic' ? 'Conservador' : name === 'base' ? 'Moderado' : 'Arrojado',
                    ]}
                  />
                  <ReferenceLine
                    y={targetPortfolio}
                    stroke="#f59e0b"
                    strokeDasharray="6 3"
                    strokeWidth={1.5}
                    label={{ value: 'Meta IF', position: 'right', fontSize: 10, fill: '#f59e0b' }}
                  />
                  <Line type="monotone" dataKey="pessimistic" stroke="#f43f5e" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="base" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="optimistic" stroke="#10b981" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3.5 justify-center flex-wrap">
              {[
                { color: '#f43f5e', label: 'Conservador' },
                { color: '#3b82f6', label: 'Moderado' },
                { color: '#10b981', label: 'Arrojado' },
                { color: '#f59e0b', label: 'Meta IF', dashed: true },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div
                    className="w-4 rounded-sm"
                    style={{
                      height: l.dashed ? '1px' : '2px',
                      background: l.dashed ? undefined : l.color,
                      borderTop: l.dashed ? `2px dashed ${l.color}` : undefined,
                    }}
                  />
                  <span className="text-[10px] text-[var(--sl-t3)]">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="p-4 rounded-[18px] mt-3.5 sl-fade-up sl-delay-4"
           style={{ background: 'rgba(245,158,11,.04)', border: '1px solid rgba(245,158,11,.12)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0" />
          <p className="text-[13px] text-[var(--sl-t2)]">
            Com aporte de <b className="font-[DM_Mono] text-[var(--sl-t1)]">{formatCurrency(pmt)}/mes</b> e rentabilidade de <b className="font-[DM_Mono] text-[var(--sl-t1)]">{rate.toFixed(1)}% a.a.</b>, voce alcanca a independencia financeira (renda passiva de <b className="font-[DM_Mono] text-[#10b981]">{formatCurrency(desiredIncome)}/mes</b>) em <b className="font-[DM_Mono] text-[#3b82f6]">{formatYears(months)}</b>.
          </p>
        </div>
      </div>
    </div>
  )
}
