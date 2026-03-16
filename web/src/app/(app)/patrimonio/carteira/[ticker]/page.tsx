'use client'

import { useParams, useRouter } from 'next/navigation'
import { TrendingUp, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  usePortfolioAssets, usePortfolioTransactions, usePortfolioDividends,
  useDeleteAsset,
  ASSET_CLASS_LABELS, ASSET_CLASS_COLORS, DIVIDEND_TYPE_LABELS,
} from '@/hooks/use-patrimonio'
import { toast } from 'sonner'
import { ModuleHeader } from '@/components/ui/module-header'
import { MetricsStrip } from '@/components/ui/metrics-strip'

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

  const accentColor = asset ? (ASSET_CLASS_COLORS[asset.asset_class] ?? '#3b82f6') : '#3b82f6'

  if (!assetsLoading && !asset) {
    return (
      <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">
        <ModuleHeader
          icon={TrendingUp}
          iconBg="rgba(59,130,246,.08)"
          iconColor="#3b82f6"
          title={ticker}
          subtitle="Ativo nao encontrado"
        />
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-12 text-center">
          <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Ativo nao encontrado</h2>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">&quot;{ticker}&quot; nao esta na sua carteira.</p>
          <button onClick={() => router.push('/patrimonio/carteira')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#3b82f6] text-white hover:opacity-90">
            Ver Carteira
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* ModuleHeader with ticker + class/sector pills + price on the right */}
      <ModuleHeader
        icon={TrendingUp}
        iconBg={`${accentColor}14`}
        iconColor={accentColor}
        title={ticker}
        subtitle={asset ? `${asset.asset_name}${asset.sector ? ` · ${asset.sector}` : ''}` : ''}
      >
        {asset && (
          <>
            <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full"
              style={{ color: accentColor, background: accentColor + '14' }}>
              {ASSET_CLASS_LABELS[asset.asset_class]}
            </span>
            {asset.sector && (
              <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full"
                style={{ color: '#f97316', background: 'rgba(249,115,22,.10)' }}>
                {asset.sector}
              </span>
            )}
            {/* Price display on the right side of header */}
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)]">Cotacao Atual</div>
              <div className="font-[DM_Mono] text-[28px] font-medium mt-0.5 text-[var(--sl-t1)]">
                {asset.current_price != null ? formatCurrency(asset.current_price) : '--'}
              </div>
            </div>
          </>
        )}
      </ModuleHeader>

      {loading ? (
        <div className="h-[80px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse mb-5" />
      ) : asset ? (
        <>
          {/* MetricsStrip — horizontal strip with internal dividers */}
          <div className="mb-5 sl-fade-up sl-delay-1">
            <MetricsStrip
              items={[
                {
                  label: 'Posicao',
                  value: formatCurrency(currentValue),
                  note: `${asset.quantity.toLocaleString('pt-BR')} cotas`,
                },
                {
                  label: 'Preco Medio',
                  value: formatCurrency(asset.avg_price),
                  note: `Investido: ${formatCurrency(investedValue)}`,
                },
                {
                  label: 'Resultado',
                  value: `${profitLoss >= 0 ? '+' : ''}${formatCurrency(profitLoss)}`,
                  valueColor: profitLoss >= 0 ? '#10b981' : '#f43f5e',
                  note: `${profitLossPct >= 0 ? '+' : ''}${profitLossPct.toFixed(2)}%`,
                },
                {
                  label: 'Proventos 12m',
                  value: formatCurrency(totalDividends),
                  note: yoc > 0 ? `YoC: ${yoc.toFixed(1)}% a.a.` : '--',
                },
              ]}
            />
          </div>

          {/* Chart placeholder area */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 mb-3.5
                          transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-2">
            <div className="flex items-center gap-2.5 mb-[18px]">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              </svg>
              <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                Historico de Cotacao
              </span>
            </div>
            <div className="border border-dashed border-[var(--sl-border)] rounded-[12px] p-5 flex items-center justify-center text-[var(--sl-t3)] text-[12px] min-h-[240px]"
                 style={{ background: 'rgba(120,165,220,.015)' }}>
              Grafico Recharts (area: cotacao {ticker} com linha de preco medio {formatCurrency(asset.avg_price)})
            </div>
          </div>

          {/* Operacoes + Proventos side by side */}
          <div className="grid grid-cols-2 gap-3.5 max-lg:grid-cols-1 sl-fade-up sl-delay-3">

            {/* Left: Transactions */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6
                            transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-2.5 mb-[18px]">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  Historico de Operacoes
                </span>
              </div>

              {txLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-[var(--sl-s2)] animate-pulse" />)}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[13px] text-[var(--sl-t2)]">Nenhuma operacao registrada</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {transactions.map(tx => {
                    const isBuy = tx.operation === 'buy'
                    const txValue = tx.quantity * tx.price
                    return (
                      <div key={tx.id} className="flex gap-3 py-3 border-b border-[rgba(120,165,220,.04)] last:border-b-0">
                        <div
                          className="w-[3px] rounded-sm shrink-0"
                          style={{ background: isBuy ? '#10b981' : '#f43f5e' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-[var(--sl-t1)]">
                            {isBuy ? 'Compra' : 'Venda'} — {tx.quantity} cotas @ {formatCurrency(tx.price)}
                          </div>
                          <div className="text-[11px] text-[var(--sl-t3)] mt-0.5">
                            {formatDate(tx.operation_date)} · {formatCurrency(txValue)}
                            {tx.fees > 0 && ` (+ ${formatCurrency(tx.fees)} taxas)`}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: Dividends */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6
                            transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-2.5 mb-[18px]">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
                <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  Proventos Recebidos
                </span>
                {yoc > 0 && (
                  <div className="ml-auto flex items-center gap-2">
                    <div className="relative w-10 h-10">
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--sl-s3)" strokeWidth="4" />
                        <circle cx="20" cy="20" r="16" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round"
                          strokeDasharray="100" strokeDashoffset={100 - Math.min(yoc / 15 * 100, 100)} transform="rotate(-90 20 20)" />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-[DM_Mono] text-[9px] text-[#f59e0b]">
                        {yoc.toFixed(1)}%
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--sl-t3)]">YoC</span>
                  </div>
                )}
              </div>

              {assetDividends.length === 0 ? (
                <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Nenhum provento registrado</p>
              ) : (
                <div className="flex flex-col max-h-[300px] overflow-y-auto">
                  {assetDividends.map(div => (
                    <div key={div.id} className="flex gap-3 py-3 border-b border-[rgba(120,165,220,.04)] last:border-b-0">
                      <div
                        className="w-[3px] rounded-sm shrink-0"
                        style={{ background: div.type === 'jcp' ? '#a855f7' : '#10b981' }}
                      />
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-[var(--sl-t1)]">
                          {DIVIDEND_TYPE_LABELS[div.type]}{div.amount_per_unit != null ? ` — ${formatCurrency(div.amount_per_unit)}/acao` : ''}
                        </div>
                        <div className="text-[11px] text-[var(--sl-t3)] mt-0.5">
                          {formatDate(div.payment_date)}
                        </div>
                      </div>
                      <div className="font-[DM_Mono] text-[13px] text-[#10b981] shrink-0">
                        {formatCurrency(div.total_amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Delete button at bottom */}
          <div className="flex justify-end mt-5 sl-fade-up sl-delay-4">
            <button onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] border border-[#f43f5e]/40 text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-colors">
              <Trash2 size={14} /> Remover Ativo
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
