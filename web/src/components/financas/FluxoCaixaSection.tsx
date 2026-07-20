'use client'

import { FluxoCaixaChart } from '@/components/financas/FluxoCaixaChart'
import { fmtBRL } from '@/lib/format/currency'
import type { CfDay } from '@/components/financas/helpers'

interface CfSummary {
  maxInTxn: { amount: number; date: string; description: string } | null
  maxOutTxn: { amount: number; date: string; description: string } | null
  saldoHoje: number
  minBal: number
  minDay: number
}

interface FluxoCaixaSectionProps {
  cfDays: CfDay[]
  cfSummary: CfSummary
  saldoMes: number
  todayD: number
  month: number
}

/**
 * Fluxo de caixa dia a dia v3 — full-width.
 * Eyebrow "FLUXO DE CAIXA" · h3 "Saldo dia a dia" · legenda inline.
 * Charts já têm tooltip hover (G-01) e cor por status.
 */
export function FluxoCaixaSection({
  cfDays,
  cfSummary,
  saldoMes,
  todayD,
  month,
}: FluxoCaixaSectionProps) {
  return (
    <article className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[22px] mb-3.5 hover:border-[var(--sl-border-h)] transition-colors">
      <header className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5">
            FLUXO DE CAIXA
          </p>
          <h3 className="font-[Space_Grotesk] text-[16px] font-semibold m-0 text-[var(--sl-t1)] tracking-[-0.01em]">
            Saldo dia a dia
          </h3>
          <p className="text-[11.5px] text-[var(--sl-t3)] mt-1.5 leading-snug">
            Cada coluna = 1 dia.{' '}
            <span style={{ color: 'var(--sl-em)', fontWeight: 600 }}>Verde</span>{' '}
            = entrou,{' '}
            <span style={{ color: 'var(--sl-danger)', fontWeight: 600 }}>vermelho</span>{' '}
            = saiu. Colunas claras após dia {String(todayD).padStart(2, '0')}/{String(month).padStart(2, '0')} são previsões.
          </p>
        </div>
      </header>

      <FluxoCaixaChart days={cfDays} />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2 mt-4 max-sm:grid-cols-2">
        {[
          {
            lbl: 'Maior entrada',
            val: cfSummary.maxInTxn ? fmtBRL(cfSummary.maxInTxn.amount) : '—',
            sub: cfSummary.maxInTxn
              ? `dia ${cfSummary.maxInTxn.date.slice(8)} · ${cfSummary.maxInTxn.description.slice(0, 14)}`
              : 'Sem receitas',
            color: 'var(--sl-em)',
          },
          {
            lbl: 'Maior saída',
            val: cfSummary.maxOutTxn ? fmtBRL(cfSummary.maxOutTxn.amount) : '—',
            sub: cfSummary.maxOutTxn
              ? `dia ${cfSummary.maxOutTxn.date.slice(8)} · ${cfSummary.maxOutTxn.description.slice(0, 14)}`
              : 'Sem despesas',
            color: 'var(--sl-danger)',
          },
          {
            lbl: 'Saldo mais baixo',
            val:
              cfSummary.minBal < 0
                ? `– ${fmtBRL(Math.abs(cfSummary.minBal))}`
                : fmtBRL(cfSummary.minBal),
            sub: cfSummary.minDay > 0 ? `dia ${cfSummary.minDay}` : '—',
            color: cfSummary.minBal < 0 ? 'var(--sl-danger)' : 'var(--sl-em)',
          },
          {
            lbl: 'Saldo acumulado',
            val: fmtBRL(saldoMes),
            sub: `até dia ${String(todayD).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
            color: saldoMes >= 0 ? 'var(--sl-t1)' : 'var(--sl-danger)',
          },
        ].map((s) => (
          <div
            key={s.lbl}
            className="flex flex-col gap-1 px-3 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)]">
              {s.lbl}
            </p>
            <p
              className="sl-num text-[14px] font-medium"
              style={{ color: s.color }}
            >
              {s.val}
            </p>
            <p className="text-[10px] text-[var(--sl-t3)]">{s.sub}</p>
          </div>
        ))}
      </div>
    </article>
  )
}
