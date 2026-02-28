'use client'

import { useRouter } from 'next/navigation'
import { Crown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { usePatrimonioDashboard, ASSET_CLASS_LABELS, ASSET_CLASS_COLORS } from '@/hooks/use-patrimonio'
import { useUserPlan } from '@/hooks/use-user-plan'
import { KpiCard } from '@/components/ui/kpi-card'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { AssetCard } from '@/components/patrimonio/AssetCard'

export default function PatrimonioPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'
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

  // RN-PTR-06: comparativo PRO vs benchmarks (referência anual simplificada).
  const benchmarkPct = { cdi: 10.5, ibov: 12.0, ifix: 9.0 }

  // Class distribution
  const classTotals = assets.reduce<Record<string, number>>((acc, a) => {
    const val = a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price
    acc[a.asset_class] = (acc[a.asset_class] ?? 0) + val
    return acc
  }, {})

  const topAssets = [...assets]
    .sort((a, b) => {
      const va = a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price
      const vb = b.current_price != null ? b.quantity * b.current_price : b.quantity * b.avg_price
      return vb - va
    })
    .slice(0, 6)

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className={cn(
          'font-[Syne] font-extrabold text-2xl',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          📈 Patrimônio
        </h1>
        <div className="flex-1" />
        <button
          onClick={() => router.push('/patrimonio/carteira')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#10b981] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Adicionar Ativo
        </button>
      </div>

      {/* ② KPI Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Patrimônio Total"
          value={totalCurrent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          delta={`Investido: ${totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
          deltaType="neutral"
          accent="#10b981"
        />
        <KpiCard
          label="Resultado"
          value={profitLoss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          delta={`${profitLossPct >= 0 ? '+' : ''}${profitLossPct.toFixed(2)}%`}
          deltaType={profitLoss >= 0 ? 'up' : 'down'}
          accent={profitLoss >= 0 ? '#10b981' : '#f43f5e'}
        />
        <KpiCard
          label="Proventos (12m)"
          value={dividends12m.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          delta={assets.length > 0 ? `${assets.length} ativos` : 'Nenhum ativo'}
          deltaType="neutral"
          accent="#f59e0b"
        />
        <KpiCard
          label="Renda Passiva/mês"
          value={(dividends12m / 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          delta={dividends12m > 0 ? 'Média dos últimos 12m' : 'Adicione proventos'}
          deltaType={dividends12m > 0 ? 'up' : 'neutral'}
          accent="#0055ff"
        />
      </div>

      {/* ③ Jornada Insight */}
      <JornadaInsight
        text={
          assets.length > 0
            ? <>Seu patrimônio total é <strong className="text-[var(--sl-t1)]">{totalCurrent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              {profitLossPct !== 0 && <> com <strong style={{ color: profitLoss >= 0 ? '#10b981' : '#f43f5e' }}>{profitLossPct >= 0 ? '+' : ''}{profitLossPct.toFixed(2)}%</strong> de resultado</>}.
              {dividends12m > 0 && <> Você recebeu <strong className="text-[#f59e0b]">{dividends12m.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> em proventos nos últimos 12 meses.</>}
            </>
            : <>Adicione seus investimentos para acompanhar seu patrimônio, proventos e progresso para a independência financeira.</>
        }
      />

      {/* ④ Main grid */}
      {loading ? (
        <div className="grid grid-cols-[1fr_260px] gap-4 max-lg:grid-cols-1">
          <div className="h-64 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
          <div className="h-64 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <div className="text-5xl mb-3">📈</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Carteira vazia</h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-5">Registre seus investimentos para acompanhar seu patrimônio.</p>
          <button
            onClick={() => router.push('/patrimonio/carteira')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90"
          >
            <Plus size={15} />
            Adicionar Ativo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_260px] gap-4 max-lg:grid-cols-1">

          {/* Top assets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">💼 Maiores Posições</h2>
              <button onClick={() => router.push('/patrimonio/carteira')} className="text-[12px] text-[#10b981] hover:opacity-80">
                Ver carteira →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              {topAssets.map(a => <AssetCard key={a.id} asset={a} />)}
            </div>
          </div>

          {/* Class distribution */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 h-fit">
            <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">🥧 Distribuição</h2>
            <div className="flex flex-col gap-2">
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
                        <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t1)]">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '4px' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* RN-PTR-06: Comparativo vs benchmarks (PRO) */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 h-fit">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">📊 Benchmark 12m</h2>
              <span className="text-[10px] text-[var(--sl-t3)]">CDI · IBOV · IFIX</span>
            </div>

            {isPro ? (
              <div className="flex flex-col gap-2">
                {[
                  { key: 'cdi', label: 'CDI', color: '#10b981' },
                  { key: 'ibov', label: 'IBOVESPA', color: '#0055ff' },
                  { key: 'ifix', label: 'IFIX', color: '#f59e0b' },
                ].map((b) => {
                  const ref = benchmarkPct[b.key as keyof typeof benchmarkPct]
                  const diff = portfolioReturn12m - ref
                  return (
                    <div key={b.key} className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[var(--sl-t2)]">{b.label}</span>
                        <span className="font-[DM_Mono] text-[11px]" style={{ color: diff >= 0 ? '#10b981' : '#f43f5e' }}>
                          {diff >= 0 ? '+' : ''}{diff.toFixed(2)} p.p.
                        </span>
                      </div>
                      <div className="mt-1 text-[10px] text-[var(--sl-t3)]">
                        Carteira {portfolioReturn12m.toFixed(2)}% vs {b.label} {ref.toFixed(2)}%
                      </div>
                    </div>
                  )
                })}
                <p className="text-[10px] text-[var(--sl-t3)]">
                  Referência anual para comparação rápida de performance.
                </p>
              </div>
            ) : (
              <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl p-3 text-center">
                <Crown size={16} className="mx-auto mb-1.5 text-[#f59e0b]" />
                <p className="text-[11px] text-[var(--sl-t2)] mb-2">
                  Comparativo com benchmarks é exclusivo do plano PRO.
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
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 mt-4 max-sm:grid-cols-2">
        {[
          { label: '💼 Carteira', href: '/patrimonio/carteira', color: '#10b981' },
          { label: '💰 Proventos', href: '/patrimonio/proventos', color: '#f59e0b' },
          { label: '📊 Evolução', href: '/patrimonio/evolucao', color: '#0055ff' },
          { label: '🧮 Simulador IF', href: '/patrimonio/simulador', color: '#a855f7' },
        ].map(({ label, href, color }) => (
          <button key={href} onClick={() => router.push(href)}
            className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 text-left hover:border-[var(--sl-border-h)] transition-colors sl-fade-up"
          >
            <div className="h-0.5 w-8 rounded-full mb-2" style={{ background: color }} />
            <p className="font-medium text-[13px] text-[var(--sl-t1)]">{label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
