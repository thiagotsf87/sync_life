'use client'

import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PortfolioAsset } from '@/hooks/use-patrimonio'
import { ASSET_CLASS_LABELS, ASSET_CLASS_COLORS } from '@/hooks/use-patrimonio'

interface AssetCardProps {
  asset: PortfolioAsset
  onDelete?: (id: string) => Promise<void>
  onUpdatePrice?: (id: string) => void
}

export function AssetCard({ asset, onDelete, onUpdatePrice }: AssetCardProps) {
  const color = ASSET_CLASS_COLORS[asset.asset_class]
  const invested = asset.quantity * asset.avg_price
  const currentValue = asset.current_price != null
    ? asset.quantity * asset.current_price
    : null
  const profitLoss = currentValue != null ? currentValue - invested : null
  const profitLossPct = profitLoss != null && invested > 0
    ? (profitLoss / invested) * 100
    : null

  return (
    <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl p-4 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-[DM_Mono] font-bold text-[14px] text-[var(--sl-t1)]">
              {asset.ticker}
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{ color, background: color + '20' }}
            >
              {ASSET_CLASS_LABELS[asset.asset_class]}
            </span>
          </div>
          <p className="text-[11px] text-[var(--sl-t3)] truncate">{asset.asset_name}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onUpdatePrice && (
            <button onClick={() => onUpdatePrice(asset.id)}
              className="p-1.5 rounded-lg hover:bg-[var(--sl-s3)] transition-colors text-[10px] font-semibold text-[var(--sl-t3)] hover:text-[var(--sl-t1)]"
              title="Atualizar cotação"
            >
              💲
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(asset.id)}
              className="p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.1)] transition-colors"
            >
              <Trash2 size={12} className="text-[var(--sl-t3)]" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>
          <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Qtde</p>
          <p className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">
            {asset.quantity % 1 === 0 ? asset.quantity.toFixed(0) : asset.quantity.toFixed(4)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">PM</p>
          <p className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">
            {asset.avg_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Investido</p>
          <p className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">
            {invested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        {currentValue != null ? (
          <div>
            <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Atual</p>
            <p className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">
              {currentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Cotação</p>
            <p className="text-[11px] text-[var(--sl-t3)] italic">Não definida</p>
          </div>
        )}
      </div>

      {profitLoss != null && profitLossPct != null && (
        <div className={cn(
          'flex items-center gap-1.5 mt-2 pt-2 border-t border-[var(--sl-border)]',
          profitLoss >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
        )}>
          {profitLoss >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span className="font-[DM_Mono] text-[11px] font-semibold">
            {profitLoss >= 0 ? '+' : ''}{profitLoss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-[10px] opacity-80">
            ({profitLossPct >= 0 ? '+' : ''}{profitLossPct.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  )
}
