'use client'

import { useRouter } from 'next/navigation'
import { TrendingUp, Plus, RefreshCw, Crown } from 'lucide-react'
import { usePatrimonioDashboard, ASSET_CLASS_LABELS, ASSET_CLASS_COLORS } from '@/hooks/use-patrimonio'
import { useUserPlan } from '@/hooks/use-user-plan'
import { ModuleHeader } from '@/components/ui/module-header'
import { HealthAIRow } from '@/components/ui/health-ai-row'
import { Treemap } from '@/components/patrimonio/Treemap'
import { PatrimonioMobile } from '@/components/patrimonio/PatrimonioMobile'

export default function PatrimonioPage() {
  const router = useRouter()
  const { isPro } = useUserPlan()

  const { assets, dividends, loading, error } = usePatrimonioDashboard()

  // Calculations
  const totalInvested = assets.reduce((s, a) => s + a.quantity * a.avg_price, 0)
  const totalCurrent = assets.reduce((s, a) => {
    return s + (a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price)
  }, 0)
  const profitLoss = totalCurrent - totalInvested
  const profitLossPct = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0

  const year12Ago = new Date()
  year12Ago.setMonth(year12Ago.getMonth() - 12)
  const dividends12m = dividends
    .filter(d => new Date(d.payment_date) >= year12Ago)
    .reduce((s, d) => s + d.total_amount, 0)
  const portfolioReturn12m = totalInvested > 0
    ? ((totalCurrent + dividends12m - totalInvested) / totalInvested) * 100
    : 0

  // RN-PTR-06: comparativo PRO vs benchmarks (referencia anual simplificada).
  const benchmarkPct = { cdi: 10.5, ibov: 12.0, ifix: 9.0 }

  // Class distribution
  const classTotals = assets.reduce<Record<string, number>>((acc, a) => {
    const val = a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price
    acc[a.asset_class] = (acc[a.asset_class] ?? 0) + val
    return acc
  }, {})

  const classCount = Object.keys(classTotals).length

  // Treemap items
  const treemapItems = Object.entries(classTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([cls, val]) => ({
      label: ASSET_CLASS_LABELS[cls as keyof typeof ASSET_CLASS_LABELS] ?? cls,
      percent: totalCurrent > 0 ? (val / totalCurrent) * 100 : 0,
      value: val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      color: ASSET_CLASS_COLORS[cls as keyof typeof ASSET_CLASS_COLORS] ?? '#6e90b8',
    }))

  const topAssets = [...assets]
    .sort((a, b) => {
      const va = a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price
      const vb = b.current_price != null ? b.quantity * b.current_price : b.quantity * b.avg_price
      return vb - va
    })
    .slice(0, 5)

  // Dividend per asset for the table
  const assetDividends12m = dividends
    .filter(d => new Date(d.payment_date) >= year12Ago)
    .reduce<Record<string, number>>((acc, d) => {
      acc[d.asset_id] = (acc[d.asset_id] ?? 0) + d.total_amount
      return acc
    }, {})

  // YoC medio
  const yocMedio = totalInvested > 0 ? (dividends12m / totalInvested) * 100 : 0

  // Meta IF (renda passiva mensal / despesa mensal estimada)
  const rendaPassivaMes = dividends12m / 12
  const metaIFDespesa = 6200 // valor de referencia - em producao viraria de financas
  const metaIFPct = metaIFDespesa > 0 ? (rendaPassivaMes / metaIFDespesa) * 100 : 0

  // Health score
  const healthScore = (() => {
    let score = 60
    if (portfolioReturn12m > benchmarkPct.cdi) score += 15
    if (classCount >= 3) score += 15
    if (assets.length > 0) score += 10
    return Math.min(score, 100)
  })()

  // Health pills
  const healthPills = (() => {
    const pills: Array<{ label: string; type: 'success' | 'warning' | 'danger' | 'info' }> = []
    if (portfolioReturn12m > benchmarkPct.cdi) {
      pills.push({ label: 'Acima CDI', type: 'success' })
    }
    if (classCount >= 3) {
      pills.push({ label: 'Diversificada', type: 'success' })
    }
    const staleAssets = assets.filter(a => {
      if (!a.last_price_update) return true
      const diff = Date.now() - new Date(a.last_price_update).getTime()
      return diff > 7 * 24 * 60 * 60 * 1000
    })
    if (staleAssets.length > 0) {
      pills.push({ label: `${staleAssets.length} cotacao antiga`, type: 'warning' })
    }
    return pills
  })()

  // Alerts
  const alerts = (() => {
    const list: Array<{ type: 'warning' | 'success' | 'info'; label: string; text: string; color: string }> = []
    const staleAssets = assets.filter(a => {
      if (!a.last_price_update) return false
      const diff = Date.now() - new Date(a.last_price_update).getTime()
      return diff > 7 * 24 * 60 * 60 * 1000
    })
    if (staleAssets.length > 0) {
      list.push({
        type: 'warning',
        label: 'Atencao',
        text: `${staleAssets[0]?.ticker ?? 'Ativo'} cotacao desatualizada (7+ dias)`,
        color: '#f59e0b',
      })
    }
    const thisMonthDivs = dividends.filter(d => {
      const pd = new Date(d.payment_date)
      const now = new Date()
      return pd.getMonth() === now.getMonth() && pd.getFullYear() === now.getFullYear()
    })
    if (thisMonthDivs.length > 0) {
      const totalThisMonth = thisMonthDivs.reduce((s, d) => s + d.total_amount, 0)
      list.push({
        type: 'success',
        label: 'Proventos',
        text: `${thisMonthDivs.length} pagamento${thisMonthDivs.length > 1 ? 's' : ''} este mes (${totalThisMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`,
        color: '#10b981',
      })
    }
    list.push({
      type: 'info',
      label: 'Meta IF',
      text: `${metaIFPct.toFixed(0)}% concluida`,
      color: '#3b82f6',
    })
    return list
  })()

  const fmtCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const now = new Date()
  const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  return (
    <>
      <PatrimonioMobile initialTab="dashboard" />
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

        {/* S1 ModuleHeader */}
        <ModuleHeader
          icon={TrendingUp}
          iconBg="rgba(59,130,246,.08)"
          iconColor="#3b82f6"
          title="Patrimonio"
          subtitle={`${monthNames[now.getMonth()]} ${now.getFullYear()} · ${assets.length} ativo${assets.length !== 1 ? 's' : ''} · ${classCount} classe${classCount !== 1 ? 's' : ''}`}
        >
          <button
            className="inline-flex items-center gap-[7px] px-[14px] py-[7px] rounded-[9px] text-[12px] font-semibold
                       text-[var(--sl-t2)] bg-transparent border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
          <button
            onClick={() => router.push('/patrimonio/carteira')}
            className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                       bg-[#3b82f6] text-white hover:brightness-110 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(59,130,246,.25)] transition-all"
          >
            <Plus size={16} strokeWidth={2.5} />
            Adicionar Ativo
          </button>
        </ModuleHeader>

        {loading ? (
          <div className="space-y-3.5">
            <div className="h-[120px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
            <div className="grid grid-cols-2 gap-3.5">
              <div className="h-[100px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
              <div className="h-[100px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
            <p className="text-[13px] text-[var(--sl-t2)]">
              {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
            </p>
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-12 text-center">
            <div className="text-5xl mb-3">📈</div>
            <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Carteira vazia</h3>
            <p className="text-[13px] text-[var(--sl-t2)] mb-5">Registre seus investimentos para acompanhar seu patrimonio.</p>
            <button
              onClick={() => router.push('/patrimonio/carteira')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#3b82f6] text-white hover:opacity-90"
            >
              <Plus size={15} />
              Adicionar Ativo
            </button>
          </div>
        ) : (
          <>
            {/* S1 HERO — Full-width patrimonio card */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7 mb-3.5 relative overflow-hidden
                            transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-1">
              {/* Top gradient accent */}
              <div
                className="absolute top-0 left-7 right-7 h-[2.5px] rounded-b"
                style={{ background: 'linear-gradient(90deg, #10b981, #3b82f6, #a855f7)' }}
              />
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-10 items-center">
                {/* Total */}
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[.09em] text-[var(--sl-t3)] mb-2">
                    Patrimonio Total
                  </p>
                  <p className="font-[DM_Mono] font-medium text-[38px] leading-none text-[var(--sl-t1)]">
                    {fmtCurrency(totalCurrent)}
                  </p>
                  <div className="flex gap-2 mt-2.5 items-center flex-wrap">
                    {profitLossPct !== 0 && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-md text-[11px] font-semibold"
                        style={{
                          background: profitLossPct >= 0 ? 'rgba(16,185,129,.10)' : 'rgba(244,63,94,.10)',
                          color: profitLossPct >= 0 ? '#10b981' : '#f43f5e',
                        }}
                      >
                        {profitLossPct >= 0 ? '+' : ''}{profitLossPct.toFixed(1)}% 12m
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-md text-[11px] font-semibold"
                      style={{ background: 'rgba(59,130,246,.08)', color: '#3b82f6' }}
                    >
                      {assets.length} ativo{assets.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[12px] text-[var(--sl-t3)] pt-0.5">
                      Investido: <span className="font-[DM_Mono] text-[var(--sl-t2)]">{fmtCurrency(totalInvested)}</span>
                    </span>
                  </div>
                </div>

                {/* Resultado */}
                <div className="text-center px-5 border-l border-[var(--sl-border)]">
                  <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5">
                    Resultado
                  </p>
                  <p className="font-[DM_Mono] text-[22px] font-medium" style={{ color: profitLoss >= 0 ? '#10b981' : '#f43f5e' }}>
                    {profitLoss >= 0 ? '+' : ''}{fmtCurrency(profitLoss)}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: profitLoss >= 0 ? '#10b981' : '#f43f5e' }}>
                    {profitLossPct >= 0 ? '+' : ''}{profitLossPct.toFixed(2)}%
                  </p>
                </div>

                {/* Proventos 12m */}
                <div className="text-center px-5 border-l border-[var(--sl-border)]">
                  <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5">
                    Proventos 12m
                  </p>
                  <p className="font-[DM_Mono] text-[22px] font-medium text-[var(--sl-t1)]">
                    {fmtCurrency(dividends12m)}
                  </p>
                  <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
                    {dividends.filter(d => new Date(d.payment_date) >= year12Ago).length} pagamentos
                  </p>
                </div>

                {/* Renda Passiva/Mes */}
                <div className="text-center px-5 border-l border-[var(--sl-border)]">
                  <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5">
                    Renda Passiva/Mes
                  </p>
                  <p className="font-[DM_Mono] text-[22px] font-medium text-[#3b82f6]">
                    {fmtCurrency(rendaPassivaMes)}
                  </p>
                  <p className="text-[11px] text-[#10b981] mt-0.5">
                    {dividends12m > 0 ? 'Media 12m' : 'Adicione proventos'}
                  </p>
                </div>
              </div>
            </div>

            {/* S2 Health + AI Row */}
            <div className="mb-3.5 sl-fade-up sl-delay-2">
              <HealthAIRow
                score={healthScore}
                title="Carteira saudavel"
                pills={healthPills}
                accentColor="#3b82f6"
                insights={[
                  {
                    title: 'Rebalanceamento',
                    description: assets.length > 0
                      ? `${topAssets[0]?.ticker ?? 'Ativo'} representa ${totalCurrent > 0 ? ((topAssets[0] ? (topAssets[0].current_price != null ? topAssets[0].quantity * topAssets[0].current_price : topAssets[0].quantity * topAssets[0].avg_price) : 0) / totalCurrent * 100).toFixed(0) : 0}% da carteira.`
                      : 'Adicione ativos para receber insights.',
                  },
                  {
                    title: 'Yield on Cost',
                    description: yocMedio > 0
                      ? `Seu YoC medio de ${yocMedio.toFixed(1)}% esta ${yocMedio > 5 ? 'solido' : 'em construcao'}.`
                      : 'Registre proventos para acompanhar o YoC.',
                  },
                ]}
              />
            </div>

            {/* S3 Treemap (2/3) + Benchmark (1/3) */}
            <div className="grid grid-cols-[2fr_1fr] gap-3.5 mb-3.5 max-lg:grid-cols-1 sl-fade-up sl-delay-3">
              {/* Treemap card */}
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
                <div className="flex items-center gap-2.5 mb-[18px]">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                  </svg>
                  <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                    Distribuicao por Classe
                  </span>
                  <span className="ml-auto text-[10px] font-semibold px-2.5 py-[3px] rounded-[7px] bg-[rgba(59,130,246,.08)] text-[#3b82f6]">
                    {classCount} classe{classCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <Treemap items={treemapItems} />
              </div>

              {/* Benchmark + Mini KPIs */}
              <div className="flex flex-col gap-3.5">
                {/* Benchmark 12m */}
                <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 flex-1 transition-colors hover:border-[var(--sl-border-h)]">
                  <div className="flex items-center gap-2.5 mb-[18px]">
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                      Benchmark 12m
                    </span>
                  </div>

                  {isPro ? (
                    <div className="flex flex-col gap-2.5">
                      {[
                        { key: 'cdi', label: 'vs CDI', color: '#10b981' },
                        { key: 'ibov', label: 'vs IBOV', color: '#0055ff' },
                        { key: 'ifix', label: 'vs IFIX', color: '#f59e0b' },
                      ].map((b) => {
                        const ref = benchmarkPct[b.key as keyof typeof benchmarkPct]
                        const diff = portfolioReturn12m - ref
                        const barPct = Math.min(Math.abs(diff) / 10 * 100, 100)
                        return (
                          <div key={b.key} className="bg-[var(--sl-s2)] rounded-[10px] px-3 py-2.5">
                            <div className="flex justify-between text-[12px]">
                              <span className="text-[var(--sl-t2)]">{b.label}</span>
                              <span className="font-[DM_Mono] text-[12px]" style={{ color: diff >= 0 ? '#10b981' : '#f43f5e' }}>
                                {diff >= 0 ? '+' : ''}{diff.toFixed(2)} p.p.
                              </span>
                            </div>
                            <div className="h-1 bg-[var(--sl-s3)] rounded-sm mt-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-sm transition-[width] duration-700"
                                style={{ width: `${barPct}%`, background: b.color }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[14px] p-3 text-center">
                      <Crown size={16} className="mx-auto mb-1.5 text-[#f59e0b]" />
                      <p className="text-[11px] text-[var(--sl-t2)] mb-2">
                        Comparativo com benchmarks e exclusivo do plano PRO.
                      </p>
                      <button
                        onClick={() => router.push('/configuracoes/plano')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-semibold
                                   bg-gradient-to-r from-[#10b981] to-[#0055ff] text-white hover:opacity-90"
                      >
                        <Crown size={12} />
                        Ver plano PRO
                      </button>
                    </div>
                  )}
                </div>

                {/* Mini KPI grid: Meta IF + YoC Medio */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[var(--sl-s2)] rounded-[11px] px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5">
                      Meta IF
                    </p>
                    <p className="font-[DM_Mono] text-[16px] font-medium text-[#3b82f6]">
                      {metaIFPct.toFixed(0)}%
                    </p>
                    <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                      {fmtCurrency(rendaPassivaMes)} / {fmtCurrency(metaIFDespesa)}
                    </p>
                  </div>
                  <div className="bg-[var(--sl-s2)] rounded-[11px] px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1.5">
                      YoC Medio
                    </p>
                    <p className="font-[DM_Mono] text-[16px] font-medium text-[#f59e0b]">
                      {yocMedio.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                      a.a.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* S4 Top Posicoes (full-width compact table) */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] overflow-hidden mb-3.5
                            transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-4"
                 style={{ padding: '18px 0' }}
            >
              <div className="flex items-center gap-2.5 px-[18px] mb-[18px]">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  Maiores Posicoes
                </span>
                <button
                  onClick={() => router.push('/patrimonio/carteira')}
                  className="ml-auto text-[12px] font-medium text-[#3b82f6] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Ver carteira completa →
                </button>
              </div>

              {/* Table header */}
              <div className="grid gap-3 px-[18px] py-2 text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] border-b border-[var(--sl-border)]"
                   style={{ gridTemplateColumns: '130px 1fr 80px 80px 80px 60px' }}>
                <span>Ativo</span>
                <span>Nome</span>
                <span className="text-right">Posicao</span>
                <span className="text-right">Resultado</span>
                <span className="text-right">Proventos</span>
                <span className="text-right">Peso</span>
              </div>

              {/* Table rows */}
              {topAssets.map((a) => {
                const invested = a.quantity * a.avg_price
                const currentVal = a.current_price != null ? a.quantity * a.current_price : invested
                const pl = currentVal - invested
                const plPct = invested > 0 ? (pl / invested) * 100 : 0
                const weight = totalCurrent > 0 ? (currentVal / totalCurrent) * 100 : 0
                const divs = assetDividends12m[a.id] ?? 0

                return (
                  <div
                    key={a.id}
                    className="grid gap-3 px-[18px] py-[13px] items-center border-b border-[rgba(120,165,220,.04)] last:border-b-0
                               cursor-pointer transition-colors hover:bg-[var(--sl-s2)]"
                    style={{ gridTemplateColumns: '130px 1fr 80px 80px 80px 60px' }}
                  >
                    <span className="font-[DM_Mono] font-medium text-[var(--sl-t1)]">{a.ticker}</span>
                    <span className="text-[12px] text-[var(--sl-t2)] truncate">{a.asset_name}</span>
                    <span className="font-[DM_Mono] text-[12px] text-right text-[var(--sl-t1)]">
                      {fmtCurrency(currentVal)}
                    </span>
                    <span
                      className="font-[DM_Mono] text-[12px] text-right"
                      style={{ color: pl >= 0 ? '#10b981' : '#f43f5e' }}
                    >
                      {pl >= 0 ? '+' : ''}{plPct.toFixed(1)}%
                    </span>
                    <span className="font-[DM_Mono] text-[12px] text-right text-[var(--sl-t1)]">
                      {fmtCurrency(divs)}
                    </span>
                    <span className="font-[DM_Mono] text-[12px] text-right text-[var(--sl-t2)]">
                      {weight.toFixed(0)}%
                    </span>
                  </div>
                )
              })}
            </div>

            {/* S5 Alerts strip */}
            <div className="grid grid-cols-3 gap-2.5 sl-fade-up sl-delay-4 max-lg:grid-cols-1">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className="px-4 py-3 rounded-[14px]"
                  style={{
                    background: `${alert.color}0a`,
                    border: `1px solid ${alert.color}1f`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: alert.color }}
                    />
                    <span
                      className="text-[10px] font-bold uppercase"
                      style={{ color: alert.color }}
                    >
                      {alert.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--sl-t2)]">{alert.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
