'use client'

import { TrendingUp, TrendingDown, PieChart } from 'lucide-react'
import { fmtBRL } from '@/lib/format/currency'

interface KpiStripProps {
  receitasMes: number
  totalGasto: number
  saldoMes: number
  naoAlocado: number
  taxaPoupanca: number
  loading: boolean
}

/**
 * KpiStrip v3 — 4 cards conforme prototype (FinKpiStrip).
 * Cada card: ícone em chip · eyebrow uppercase · valor Space Grotesk sl-num-strong · sub-texto.
 * Card "Taxa de poupança" recebe pill "NO RITMO" quando >= meta (30%).
 */
export function KpiStrip({
  receitasMes,
  totalGasto,
  saldoMes,
  naoAlocado,
  taxaPoupanca,
  loading,
}: KpiStripProps) {
  const items = [
    {
      label: 'Receitas',
      Icon: TrendingUp,
      value: loading ? '—' : fmtBRL(receitasMes),
      sub: 'Maio atual',
      color: 'var(--sl-em)',
      iconColor: 'var(--sl-em)',
    },
    {
      label: 'Despesas',
      Icon: TrendingDown,
      value: loading ? '—' : fmtBRL(totalGasto),
      sub: 'Maio atual',
      color: 'var(--sl-danger)',
      iconColor: 'var(--sl-danger)',
    },
    {
      label: 'Saldo do mês',
      Icon: TrendingUp,
      value: loading ? '—' : fmtBRL(saldoMes),
      sub: `Receitas menos despesas · Não alocado: ${loading ? '—' : fmtBRL(Math.max(0, naoAlocado))}`,
      color: 'var(--sl-t1)',
      iconColor: 'var(--sl-em)',
    },
    {
      label: 'Taxa de poupança',
      Icon: PieChart,
      value: loading ? '—' : `${taxaPoupanca}%`,
      sub: `Meta: 30% · ${taxaPoupanca >= 30 ? 'acima do alvo' : 'abaixo do alvo'}`,
      color: 'var(--sl-t1)',
      iconColor: 'var(--sl-em)',
      okPill: !loading && taxaPoupanca >= 30,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3.5 mb-3.5 max-sm:grid-cols-2">
      {items.map((it) => (
        <article
          key={it.label}
          className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[18px] flex flex-col gap-2.5 hover:border-[var(--sl-border-h)] transition-colors"
        >
          <header className="flex items-center justify-between">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{ background: 'var(--sl-em-soft)', color: it.iconColor }}
            >
              <it.Icon size={14} />
            </div>
            {it.okPill && (
              <span
                className="text-[10px] font-semibold tracking-[0.06em] px-2 py-[3px] rounded-full"
                style={{
                  background: 'var(--sl-em-soft)',
                  color: 'var(--sl-em)',
                  border: '1px solid var(--sl-border-em)',
                }}
              >
                NO RITMO
              </span>
            )}
          </header>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-1.5">
              {it.label}
            </p>
            <p
              className="sl-num-strong leading-none"
              style={{ fontSize: 26, color: it.color }}
            >
              {it.value}
            </p>
          </div>

          <p className="font-[DM_Sans] text-[11.5px] text-[var(--sl-t3)] leading-snug">
            {it.sub}
          </p>
        </article>
      ))}
    </div>
  )
}
