'use client'

import { FluxoCaixaChart } from '@/components/financas/FluxoCaixaChart'
import { fmtR$ } from '@/components/financas/helpers'
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

export function FluxoCaixaSection({ cfDays, cfSummary, saldoMes, todayD, month }: FluxoCaixaSectionProps) {
  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 mb-3 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Fluxo de Caixa — Dia a Dia</p>
      </div>
      <div className="flex gap-2.5 px-3 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[12px] text-[var(--sl-t3)] leading-relaxed mb-4">
        <span className="text-[15px] shrink-0 mt-0.5">ℹ️</span>
        <p>
          <strong className="text-[var(--sl-t1)]">Como ler:</strong> Cada coluna = 1 dia.{' '}
          <strong className="text-[var(--sl-t1)]">■ Verde</strong> = dinheiro que entrou.{' '}
          <strong className="text-[var(--sl-t1)]">■ Vermelho</strong> = quanto saiu.
          {' '}Colunas esmaecidas após {String(todayD).padStart(2, '0')}/{String(month).padStart(2, '0')} são previsões.
        </p>
      </div>
      <FluxoCaixaChart days={cfDays} />
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2 mt-3 max-sm:grid-cols-2">
        {[
          {
            lbl: 'Maior entrada',
            val: cfSummary.maxInTxn ? `R$ ${fmtR$(cfSummary.maxInTxn.amount)}` : '—',
            sub: cfSummary.maxInTxn ? `dia ${cfSummary.maxInTxn.date.slice(8)} · ${cfSummary.maxInTxn.description.slice(0, 14)}` : 'Sem receitas',
            color: '#10b981',
          },
          {
            lbl: 'Maior saída num dia',
            val: cfSummary.maxOutTxn ? `R$ ${fmtR$(cfSummary.maxOutTxn.amount)}` : '—',
            sub: cfSummary.maxOutTxn ? `dia ${cfSummary.maxOutTxn.date.slice(8)} · ${cfSummary.maxOutTxn.description.slice(0, 14)}` : 'Sem despesas',
            color: '#f43f5e',
          },
          {
            lbl: 'Saldo mais baixo',
            val: cfSummary.minBal < 0 ? `-R$ ${fmtR$(cfSummary.minBal)}` : `R$ ${fmtR$(cfSummary.minBal)}`,
            sub: cfSummary.minDay > 0 ? `dia ${cfSummary.minDay}` : '—',
            color: cfSummary.minBal < 0 ? '#f43f5e' : '#10b981',
          },
          {
            lbl: 'Saldo acumulado',
            val: `R$ ${fmtR$(saldoMes)}`,
            sub: `até dia ${String(todayD).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
            color: saldoMes >= 0 ? '#0055ff' : '#f43f5e',
          },
        ].map(s => (
          <div key={s.lbl} className="flex flex-col gap-0.5 px-3 py-2 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)]">{s.lbl}</p>
            <p className="font-[DM_Mono] text-[14px] font-medium" style={{ color: s.color }}>{s.val}</p>
            <p className="text-[10px] text-[var(--sl-t3)]">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3.5 mt-2.5 pt-2.5 border-t border-[var(--sl-border)] flex-wrap">
        {[
          { tipo: 'sq', cor: '#10b981', label: 'Entrada no dia' },
          { tipo: 'sq', cor: '#f43f5e', label: 'Saída no dia' },
          { tipo: 'line', cor: '#0055ff', label: 'Saldo na conta' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t3)]">
            {l.tipo === 'sq'
              ? <div className="w-[9px] h-[9px] rounded-sm" style={{ background: l.cor }} />
              : <div className="w-4 h-0.5 rounded" style={{ background: l.cor }} />
            }
            {l.label}
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--sl-t3)]">
          <div className="w-[9px] h-[9px] rounded-sm border border-dashed border-[var(--sl-t3)] opacity-60" />
          Dias previstos
        </div>
      </div>
    </div>
  )
}
