'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  usePortfolioAssets, usePortfolioTransactions, usePortfolioDividends,
  useDeleteAsset,
  ASSET_CLASS_LABELS, ASSET_CLASS_COLORS, DIVIDEND_TYPE_LABELS,
} from '@/hooks/use-patrimonio'
import { toast } from 'sonner'

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-')
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(day)).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function TickerDetailPage() {
  const params = useParams()
  const ticker = decodeURIComponent(params.ticker as string).toUpperCase()
  const router = useRouter()

  const { assets, loading: assetsLoading } = usePortfolioAssets()
  const asset = assets.find(a => a.ticker.toUpperCase() === ticker)
  const { transactions, loading: txLoading } = usePortfolioTransactions(asset?.id)
  const { dividends, loading: divsLoading } = usePortfolioDividends()
  const deleteAsset = useDeleteAsset()

  const loading = assetsLoading || txLoading || divsLoading

  const assetDividends = asset
    ? dividends.filter(d => d.asset_id === asset.id)
    : []

  // Calculations
  const currentValue = asset
    ? asset.quantity * (asset.current_price ?? asset.avg_price)
    : 0
  const investedValue = asset ? asset.quantity * asset.avg_price : 0
  const profitLoss = currentValue - investedValue
  const profitLossPct = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0
  const totalDividends = assetDividends
    .filter(d => d.status === 'received')
    .reduce((s, d) => s + d.total_amount, 0)

  const yoc = investedValue > 0 ? (totalDividends / investedValue) * 100 : 0

  async function handleDelete() {
    if (!asset) return
    if (!confirm(`Excluir ${ticker} da carteira? Isso não pode ser desfeito.`)) return
    try {
      await deleteAsset(asset.id)
      toast.success('Ativo removido da carteira')
      router.push('/patrimonio/carteira')
    } catch {
      toast.error('Erro ao remover ativo')
    }
  }

  const accentColor = asset ? (ASSET_CLASS_COLORS[asset.asset_class] ?? '#10b981') : '#10b981'

  if (!assetsLoading && !asset) {
    return (
      <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/patrimonio/carteira')}
            className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors">
            <ArrowLeft size={16} /> Carteira
          </button>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Ativo não encontrado</h2>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">"{ticker}" não está na sua carteira.</p>
          <button onClick={() => router.push('/patrimonio/carteira')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90">
            Ver Carteira
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button onClick={() => router.push('/patrimonio/carteira')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors">
          <ArrowLeft size={16} /> Carteira
        </button>
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <h1 className="font-[Syne] font-extrabold text-xl text-sl-grad">
            {ticker}
          </h1>
          {asset && (
            <>
              <span className="text-[12px] text-[var(--sl-t2)]">{asset.asset_name}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ color: accentColor, background: accentColor + '20' }}>
                {ASSET_CLASS_LABELS[asset.asset_class]}
              </span>
            </>
          )}
        </div>
        <button onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] border border-[#f43f5e]/40 text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors">
          <Trash2 size={14} /> Remover
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : asset ? (
        <>
          {/* KPI Strip */}
          <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
            {[
              {
                label: 'Quantidade',
                value: asset.quantity.toLocaleString('pt-BR'),
                delta: `PM: ${formatCurrency(asset.avg_price)}`,
                accent: accentColor,
              },
              {
                label: 'Valor Investido',
                value: formatCurrency(investedValue),
                delta: `${asset.quantity} × ${formatCurrency(asset.avg_price)}`,
                accent: '#0055ff',
              },
              {
                label: 'Valor Atual',
                value: formatCurrency(currentValue),
                delta: asset.current_price ? `Cotação: ${formatCurrency(asset.current_price)}` : 'Sem cotação',
                accent: '#10b981',
              },
              {
                label: 'P/L',
                value: `${profitLossPct >= 0 ? '+' : ''}${profitLossPct.toFixed(2)}%`,
                delta: `${profitLoss >= 0 ? '+' : ''}${formatCurrency(profitLoss)}`,
                accent: profitLoss >= 0 ? '#10b981' : '#f43f5e',
              },
            ].map(kpi => (
              <div key={kpi.label} className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 overflow-hidden sl-fade-up">
                <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: kpi.accent }} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">{kpi.label}</p>
                <p className="font-[DM_Mono] font-medium text-xl leading-none" style={{ color: kpi.accent }}>{kpi.value}</p>
                {kpi.delta && <p className="text-[11px] text-[var(--sl-t3)] mt-1">{kpi.delta}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_340px] gap-4 max-lg:grid-cols-1">

            {/* Left: Transactions */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-4">
                🔄 Operações ({transactions.length})
              </h2>

              {txLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-[var(--sl-s2)] animate-pulse" />)}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-[13px] text-[var(--sl-t2)]">Nenhuma operação registrada</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {transactions.map(tx => {
                    const isBuy = tx.operation === 'buy'
                    const txValue = tx.quantity * tx.price
                    return (
                      <div key={tx.id} className="flex items-center gap-3 p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0',
                          isBuy ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#f43f5e]/20 text-[#f43f5e]'
                        )}>
                          {isBuy ? '↑' : '↓'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-[11px] font-bold uppercase tracking-wider',
                              isBuy ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                              {isBuy ? 'Compra' : 'Venda'}
                            </span>
                            <span className="text-[11px] text-[var(--sl-t3)]">{formatDate(tx.operation_date)}</span>
                          </div>
                          <p className="text-[12px] text-[var(--sl-t2)]">
                            {tx.quantity} × {formatCurrency(tx.price)}
                            {tx.fees > 0 && <span className="text-[var(--sl-t3)]"> (+ {formatCurrency(tx.fees)} taxas)</span>}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn('font-[DM_Mono] font-bold text-[13px]',
                            isBuy ? 'text-[#f43f5e]' : 'text-[#10b981]')}>
                            {isBuy ? '-' : '+'}{formatCurrency(txValue)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: Dividends + asset info */}
            <div className="flex flex-col gap-4">

              {/* Asset info */}
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up">
                <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">📋 Detalhes</h2>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Classe', value: ASSET_CLASS_LABELS[asset.asset_class] },
                    { label: 'Setor', value: asset.sector ?? '—' },
                    { label: 'Yield on Cost', value: yoc > 0 ? `${yoc.toFixed(2)}% a.a.` : '—' },
                    { label: 'Total Proventos', value: totalDividends > 0 ? formatCurrency(totalDividends) : '—' },
                    { label: 'Última cotação', value: asset.last_price_update ? formatDate(asset.last_price_update) : '—' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-[var(--sl-border)] last:border-0">
                      <span className="text-[11px] text-[var(--sl-t3)]">{item.label}</span>
                      <span className={cn('text-[12px] font-medium text-[var(--sl-t1)]',
                        item.label === 'Yield on Cost' || item.label === 'Total Proventos' ? 'font-[DM_Mono] text-[#10b981]' : '')}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                  {asset.notes && (
                    <p className="text-[11px] text-[var(--sl-t3)] pt-2 italic">{asset.notes}</p>
                  )}
                </div>
              </div>

              {/* Dividends */}
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up">
                <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">
                  💰 Proventos ({assetDividends.length})
                </h2>

                {assetDividends.length === 0 ? (
                  <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Nenhum provento registrado</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
                    {assetDividends.map(div => (
                      <div key={div.id} className="flex items-center justify-between p-2.5 bg-[var(--sl-s2)] rounded-xl">
                        <div>
                          <p className="text-[11px] font-medium text-[var(--sl-t1)]">
                            {DIVIDEND_TYPE_LABELS[div.type]}
                          </p>
                          <p className="text-[10px] text-[var(--sl-t3)]">{formatDate(div.payment_date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-[DM_Mono] font-bold text-[12px] text-[#10b981]">
                            {formatCurrency(div.total_amount)}
                          </p>
                          <span className={cn(
                            'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full',
                            div.status === 'received'
                              ? 'bg-[#10b981]/10 text-[#10b981]'
                              : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                          )}>
                            {div.status === 'received' ? 'Recebido' : 'Anunciado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
