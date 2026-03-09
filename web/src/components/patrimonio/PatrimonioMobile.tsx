'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { jornadaLabel } from '@/lib/jornada-labels'
import {
  usePatrimonioDashboard,
  usePortfolioAssets,
  usePortfolioDividends,
  ASSET_CLASS_LABELS,
  ASSET_CLASS_COLORS,
} from '@/hooks/use-patrimonio'

const TABS: { id: 'dashboard' | 'carteira' | 'proventos' | 'evolucao'; label: string; key: string }[] = [
  { id: 'dashboard', label: 'Dashboard', key: 'dashboard' },
  { id: 'carteira', label: 'Carteira', key: 'carteira' },
  { id: 'proventos', label: 'Proventos', key: 'proventos' },
  { id: 'evolucao', label: 'Evolução', key: 'evolucao' },
]

type TabId = 'dashboard' | 'carteira' | 'proventos' | 'evolucao'

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface PatrimonioMobileProps {
  initialTab?: TabId
  onAddAsset?: () => void
}

export function PatrimonioMobile({ initialTab = 'dashboard', onAddAsset }: PatrimonioMobileProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)

  const { assets: dashAssets, dividends: dashDivs, loading } = usePatrimonioDashboard()
  const { assets } = usePortfolioAssets()
  const { dividends } = usePortfolioDividends()

  // Build asset map for ticker resolution (dividends only have asset_id)
  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]))
  const dashAssetMap = Object.fromEntries(dashAssets.map(a => [a.id, a]))

  // Calculations
  const totalInvested = dashAssets.reduce((s, a) => s + a.quantity * a.avg_price, 0)
  const totalCurrent = dashAssets.reduce((s, a) => {
    return s + (a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price)
  }, 0)
  const profitLoss = totalCurrent - totalInvested
  const profitLossPct = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0

  const year12Ago = new Date()
  year12Ago.setMonth(year12Ago.getMonth() - 12)
  const dividends12m = dashDivs
    .filter(d => new Date(d.payment_date) >= year12Ago)
    .reduce((s, d) => s + d.total_amount, 0)

  const topAssets = [...dashAssets]
    .sort((a, b) => {
      const va = a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price
      const vb = b.current_price != null ? b.quantity * b.current_price : b.quantity * b.avg_price
      return vb - va
    })
    .slice(0, 5)

  // Class distribution
  const classTotals = dashAssets.reduce<Record<string, number>>((acc, a) => {
    const val = a.current_price != null ? a.quantity * a.current_price : a.quantity * a.avg_price
    acc[a.asset_class] = (acc[a.asset_class] ?? 0) + val
    return acc
  }, {})

  return (
    <div className="lg:hidden min-h-screen bg-[var(--sl-bg)]">

      {/* Module Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <p className="text-[12px] font-medium text-[#3b82f6]">
            ✦ {jornadaLabel('patrimonio', 'module', 'Patrimônio')}
          </p>
          <h1 className="font-[Syne] font-extrabold text-[20px] text-[var(--sl-t1)]">
            {(() => {
              const tab = TABS.find(t => t.id === activeTab)
              return tab ? jornadaLabel('patrimonio', tab.key, tab.label) : 'Dashboard'
            })()}
          </h1>
        </div>
        <button
          onClick={onAddAsset ?? (() => router.push('/patrimonio/carteira'))}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-semibold text-white"
          style={{ background: '#3b82f6' }}
        >
          <Plus size={14} />
          Ativo
        </button>
      </div>

      {/* Sub-nav tabs (underline) */}
      <div className="flex border-b border-[var(--sl-border)] px-2 mb-3">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative flex-1 py-2.5 text-[12px] transition-colors text-center',
              activeTab === tab.id ? 'text-[#3b82f6] font-semibold' : 'text-[var(--sl-t2)]'
            )}
          >
            {jornadaLabel('patrimonio', tab.key, tab.label)}
            {activeTab === tab.id && (
              <span className="absolute bottom-[-1px] left-1 right-1 h-[3px] rounded-t bg-[#3b82f6]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pb-24">

        {/* === DASHBOARD TAB === */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Hero Card */}
            <div
              className="mx-4 mb-3 p-5 rounded-2xl text-center border border-[rgba(59,130,246,0.2)]"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04))' }}
            >
              <p className="text-[12px] text-[var(--sl-t2)] mb-1.5">Patrimônio líquido total</p>
              <p className="font-[DM_Mono] font-extrabold text-[34px] text-[var(--sl-t1)] leading-none mb-2">
                {formatCurrency(totalCurrent)}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className={cn(
                  'text-[11px] font-medium px-2 py-0.5 rounded-full',
                  profitLoss >= 0
                    ? 'bg-[rgba(16,185,129,0.12)] text-[#10b981]'
                    : 'bg-[rgba(244,63,94,0.12)] text-[#f43f5e]'
                )}>
                  {profitLoss >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(profitLoss))}
                </span>
                <span className={cn('text-[12px]', profitLossPct >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                  {profitLossPct >= 0 ? '+' : ''}{profitLossPct.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-2 mx-4 mb-3">
              {[
                { label: 'Investido', value: formatCurrency(totalInvested), color: '#3b82f6' },
                { label: 'Proventos 12m', value: formatCurrency(dividends12m), color: '#10b981' },
                {
                  label: 'P/L Total',
                  value: `${profitLossPct >= 0 ? '+' : ''}${profitLossPct.toFixed(1)}%`,
                  color: profitLossPct >= 0 ? '#10b981' : '#f43f5e',
                },
                { label: 'Ativos', value: String(dashAssets.length), color: '#f59e0b' },
              ].map(kpi => (
                <div
                  key={kpi.label}
                  className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3 overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-3 right-3 h-[2px] rounded-b"
                    style={{ background: kpi.color }}
                  />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t2)] mb-1">
                    {kpi.label}
                  </p>
                  <p
                    className="font-[DM_Mono] font-bold text-[18px] leading-none"
                    style={{ color: kpi.color }}
                  >
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Asset allocation by class */}
            {Object.keys(classTotals).length > 0 && (
              <div className="mx-4 mb-3 p-4 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl">
                <p className="text-[12px] font-semibold text-[var(--sl-t1)] mb-3">Alocação por classe</p>
                <div className="flex flex-col gap-2">
                  {Object.entries(classTotals)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cls, val]) => {
                      const pct = totalCurrent > 0 ? (val / totalCurrent) * 100 : 0
                      const color = ASSET_CLASS_COLORS[cls as keyof typeof ASSET_CLASS_COLORS] ?? '#3b82f6'
                      return (
                        <div key={cls} className="flex items-center gap-2">
                          <span className="text-[11px] text-[var(--sl-t2)] w-24 shrink-0">
                            {ASSET_CLASS_LABELS[cls as keyof typeof ASSET_CLASS_LABELS] ?? cls}
                          </span>
                          <div className="flex-1 h-3 bg-[var(--sl-s3)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: color }}
                            />
                          </div>
                          <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t2)] w-8 text-right">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Top Assets */}
            {topAssets.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)] px-4 mb-2">
                  TOP ATIVOS
                </p>
                <div className="bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
                  {topAssets.map(asset => {
                    const val = asset.current_price != null
                      ? asset.quantity * asset.current_price
                      : asset.quantity * asset.avg_price
                    const invested = asset.quantity * asset.avg_price
                    const pl = val - invested
                    const plPct = invested > 0 ? (pl / invested) * 100 : 0
                    const color = ASSET_CLASS_COLORS[asset.asset_class] ?? '#3b82f6'
                    return (
                      <button
                        key={asset.id}
                        onClick={() => router.push(`/patrimonio/carteira/${asset.ticker}`)}
                        className="w-full flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)] last:border-0 hover:bg-[var(--sl-s2)] transition-colors"
                      >
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[13px] font-medium text-[var(--sl-t1)]">{asset.ticker}</p>
                          <p className="text-[11px] text-[var(--sl-t2)]">
                            {ASSET_CLASS_LABELS[asset.asset_class]}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t1)]">
                            {formatCurrency(val)}
                          </p>
                          <p className={cn('text-[11px]', plPct >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                            {plPct >= 0 ? '+' : ''}{plPct.toFixed(1)}%
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && dashAssets.length === 0 && (
              <div className="mx-4 p-8 text-center bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl">
                <p className="text-4xl mb-3">📈</p>
                <p className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
                  Sua carteira está vazia
                </p>
                <p className="text-[13px] text-[var(--sl-t2)] mb-4">
                  Adicione seu primeiro ativo para começar a acompanhar seu patrimônio.
                </p>
                <button
                  onClick={onAddAsset ?? (() => router.push('/patrimonio/carteira'))}
                  className="px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white"
                  style={{ background: '#3b82f6' }}
                >
                  + Adicionar Ativo
                </button>
              </div>
            )}
          </div>
        )}

        {/* === CARTEIRA TAB === */}
        {activeTab === 'carteira' && (
          <div>
            {/* Summary card */}
            <div className="mx-4 mb-3 p-4 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] text-[var(--sl-t2)]">Total investido</span>
                <span className={cn(
                  'text-[11px] font-medium px-2 py-0.5 rounded-full',
                  profitLossPct >= 0
                    ? 'bg-[rgba(16,185,129,0.12)] text-[#10b981]'
                    : 'bg-[rgba(244,63,94,0.12)] text-[#f43f5e]'
                )}>
                  {profitLossPct >= 0 ? '↑' : '↓'} {Math.abs(profitLossPct).toFixed(2)}%
                </span>
              </div>
              <p className="font-[DM_Mono] font-bold text-[22px] text-[var(--sl-t1)]">
                {formatCurrency(totalCurrent)}
              </p>
              {profitLoss !== 0 && (
                <p className={cn('text-[12px] mt-1', profitLoss >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                  {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)} de rendimento total
                </p>
              )}
            </div>

            {/* Grouped by class */}
            {Object.entries(
              assets.reduce<Record<string, typeof assets>>((acc, a) => {
                acc[a.asset_class] = [...(acc[a.asset_class] ?? []), a]
                return acc
              }, {})
            ).map(([cls, classAssets]) => (
              <div key={cls} className="mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)] px-4 mb-1.5">
                  {ASSET_CLASS_LABELS[cls as keyof typeof ASSET_CLASS_LABELS] ?? cls}
                </p>
                <div className="bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
                  {classAssets.map(asset => {
                    const val = asset.current_price != null
                      ? asset.quantity * asset.current_price
                      : asset.quantity * asset.avg_price
                    const invested = asset.quantity * asset.avg_price
                    const pl = val - invested
                    const plPct = invested > 0 ? (pl / invested) * 100 : 0
                    return (
                      <button
                        key={asset.id}
                        onClick={() => router.push(`/patrimonio/carteira/${asset.ticker}`)}
                        className="w-full flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)] last:border-0 hover:bg-[var(--sl-s2)] transition-colors"
                      >
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[13px] font-medium text-[var(--sl-t1)]">{asset.ticker}</p>
                          <p className="text-[11px] text-[var(--sl-t2)]">
                            {asset.quantity} × {formatCurrency(asset.avg_price)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t1)]">
                            {formatCurrency(val)}
                          </p>
                          <p className={cn('text-[11px]', plPct >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                            {plPct >= 0 ? '+' : ''}{plPct.toFixed(1)}%
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {assets.length === 0 && !loading && (
              <div className="mx-4 p-8 text-center bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-[13px] text-[var(--sl-t2)]">Nenhum ativo na carteira</p>
              </div>
            )}
          </div>
        )}

        {/* === PROVENTOS TAB === */}
        {activeTab === 'proventos' && (
          <div>
            {/* Hero */}
            <div
              className="mx-4 mb-3 p-5 rounded-2xl text-center border border-[rgba(59,130,246,0.2)]"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.10), rgba(16,185,129,0.06))' }}
            >
              <p className="text-[12px] text-[var(--sl-t2)] mb-1.5">Proventos acumulados 12m</p>
              <p className="font-[DM_Mono] font-extrabold text-[30px] text-[#3b82f6] leading-none mb-2">
                {formatCurrency(dividends12m)}
              </p>
              {dividends12m > 0 && (
                <p className="text-[12px] text-[var(--sl-t2)]">
                  Média mensal: {formatCurrency(dividends12m / 12)}/mês
                </p>
              )}
            </div>

            {/* Próximos pagamentos */}
            {dividends.filter(d => d.status === 'announced').length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)] px-4 mb-2">
                  PRÓXIMOS PAGAMENTOS
                </p>
                <div className="bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
                  {dividends.filter(d => d.status === 'announced').slice(0, 5).map(div => {
                    const ticker = assetMap[div.asset_id]?.ticker ?? div.asset_id.slice(0, 8)
                    return (
                      <div
                        key={div.id}
                        className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)] last:border-0"
                      >
                        <div className="w-9 h-9 rounded-[11px] bg-[rgba(59,130,246,0.14)] flex items-center justify-center text-[16px] shrink-0">
                          🏢
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-[var(--sl-t1)]">
                            {ticker} — Rendimento
                          </p>
                          <p className="text-[11px] text-[var(--sl-t2)]">
                            Pgto: {new Date(div.payment_date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </p>
                        </div>
                        <p className="font-[DM_Mono] font-bold text-[14px] text-[#10b981] shrink-0">
                          +{formatCurrency(div.total_amount)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Histórico */}
            <div className="mb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)] px-4 mb-2">
                HISTÓRICO
              </p>
              <div className="bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
                {dividends.filter(d => d.status === 'received').slice(0, 10).map(div => {
                  const ticker = assetMap[div.asset_id]?.ticker
                    ?? dashAssetMap[div.asset_id]?.ticker
                    ?? '???'
                  return (
                    <div
                      key={div.id}
                      className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)] last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--sl-t1)]">{ticker}</p>
                        <p className="text-[11px] text-[var(--sl-t2)]">
                          {new Date(div.payment_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <p className="font-[DM_Mono] font-bold text-[13px] text-[#10b981] shrink-0">
                        +{formatCurrency(div.total_amount)}
                      </p>
                    </div>
                  )
                })}
                {dividends.filter(d => d.status === 'received').length === 0 && (
                  <div className="px-5 py-8 text-center">
                    <p className="text-3xl mb-2">💰</p>
                    <p className="text-[13px] text-[var(--sl-t2)]">Nenhum provento recebido ainda</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === EVOLUÇÃO TAB === */}
        {activeTab === 'evolucao' && (
          <div>
            <div className="mx-4 mb-3 p-4 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[12px] text-[var(--sl-t2)]">Patrimônio hoje</p>
                  <p className="font-[DM_Mono] font-bold text-[22px] text-[var(--sl-t1)]">
                    {formatCurrency(totalCurrent)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[var(--sl-t2)]">P/L Total</p>
                  <p className={cn(
                    'font-[DM_Mono] font-bold text-[16px]',
                    profitLoss >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
                  )}>
                    {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                  </p>
                  <p className={cn('text-[11px]', profitLossPct >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                    {profitLossPct >= 0 ? '+' : ''}{profitLossPct.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Growth by class */}
            {Object.entries(classTotals).length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)] px-4 mb-2">
                  CRESCIMENTO POR CLASSE
                </p>
                <div className="bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
                  {Object.entries(classTotals)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cls, val]) => {
                      const invested = dashAssets
                        .filter(a => a.asset_class === cls)
                        .reduce((s, a) => s + a.quantity * a.avg_price, 0)
                      const pl = val - invested
                      const plPct = invested > 0 ? (pl / invested) * 100 : 0
                      const color = ASSET_CLASS_COLORS[cls as keyof typeof ASSET_CLASS_COLORS] ?? '#3b82f6'
                      return (
                        <div
                          key={cls}
                          className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)] last:border-0"
                        >
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[var(--sl-t1)]">
                              {ASSET_CLASS_LABELS[cls as keyof typeof ASSET_CLASS_LABELS] ?? cls}
                            </p>
                            <p className="text-[11px] text-[var(--sl-t2)]">{formatCurrency(val)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={cn(
                              'font-[DM_Mono] text-[13px] font-medium',
                              plPct >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
                            )}>
                              {plPct >= 0 ? '+' : ''}{formatCurrency(pl)}
                            </p>
                            <p className={cn(
                              'text-[11px]',
                              plPct >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
                            )}>
                              {plPct >= 0 ? '+' : ''}{plPct.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {dashAssets.length === 0 && !loading && (
              <div className="mx-4 p-8 text-center bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl">
                <p className="text-3xl mb-2">📈</p>
                <p className="text-[13px] text-[var(--sl-t2)]">Adicione ativos para ver a evolução</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
