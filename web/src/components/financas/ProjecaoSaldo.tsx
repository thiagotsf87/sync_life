'use client'

import { useRouter } from 'next/navigation'
import { ExternalLink, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fmtR$, PROJ_MESES } from '@/components/financas/helpers'

interface ProjecaoSaldoProps {
  saldoMes: number
  totalGasto: number
  naoAlocado: number
  taxaPoupanca: number
  todayD: number
  month: number
  year: number
  loading: boolean
}

export function ProjecaoSaldo({ saldoMes, totalGasto, naoAlocado, taxaPoupanca, todayD, month, year, loading }: ProjecaoSaldoProps) {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-5 mb-3 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Projeção de Saldo — Timeline</p>
        <button onClick={() => router.push('/financas/planejamento')} className="text-[11px] text-[#10b981] hover:underline flex items-center gap-1">
          Ver planejamento <ExternalLink size={9} />
        </button>
      </div>

      <div className="flex items-center gap-4 px-4 py-3 rounded-[12px] mb-4" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.08),rgba(0,85,255,.06))', border: '1px solid rgba(16,185,129,.18)' }}>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Saldo do mês (acumulado)</p>
          <p className="font-[DM_Mono] text-[28px] font-medium text-[var(--sl-t1)] leading-none">
            {loading ? '—' : `R$ ${fmtR$(saldoMes)}`}
          </p>
          <p className="text-[11px] text-[var(--sl-t3)] mt-1">
            {todayD} de {new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · receitas menos despesas
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {[
            { lbl: 'Total despesas', val: loading ? '—' : `R$ ${fmtR$(totalGasto)}`, cor: '#f43f5e' },
            { lbl: 'Não alocado', val: loading ? '—' : `R$ ${fmtR$(Math.max(0, naoAlocado))}`, cor: '#10b981' },
            { lbl: 'Taxa poupança', val: loading ? '—' : `${taxaPoupanca}%`, cor: '#0055ff' },
          ].map(p => (
            <div key={p.lbl} className="text-center px-3 py-1.5 rounded-[8px] bg-[var(--sl-s2)]">
              <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)]">{p.lbl}</p>
              <p className="font-[DM_Mono] text-[13px] font-medium" style={{ color: p.cor }}>{p.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-[var(--sl-s3)] rounded">
          <div className="h-full rounded" style={{ width: '20%', background: 'linear-gradient(90deg,#10b981,#0055ff)' }} />
        </div>
        <div className="flex gap-2">
          {PROJ_MESES.map(m => (
            <div
              key={m.mes}
              className={cn('flex-1 rounded-[9px] px-3 py-3 cursor-pointer transition-all', m.tipo === 'warn' && 'hover:brightness-105')}
              style={{
                border: m.tipo === 'current' ? '1px solid rgba(16,185,129,.30)' : m.tipo === 'warn' ? '1px solid rgba(244,63,94,.30)' : '1px solid rgba(0,85,255,.20)',
                background: m.tipo === 'current' ? 'rgba(16,185,129,.06)' : m.tipo === 'warn' ? 'rgba(244,63,94,.05)' : 'rgba(0,85,255,.04)',
              }}
            >
              <div className="flex justify-center mb-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 border-white"
                  style={{
                    background: m.tipo === 'current' ? '#10b981' : m.tipo === 'warn' ? '#f43f5e' : '#0055ff',
                    boxShadow: m.tipo === 'current' ? '0 0 8px rgba(16,185,129,.5)' : m.tipo === 'warn' ? '0 0 8px rgba(244,63,94,.5)' : '0 0 8px rgba(0,85,255,.4)',
                  }}
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-0.5">{m.mes}</p>
              <p className={cn('font-[DM_Mono] text-[16px] font-medium leading-none mb-0.5', m.tipo === 'warn' ? 'text-[#f43f5e]' : 'text-[var(--sl-t1)]')}>
                R$ {fmtR$(m.val)}
              </p>
              {m.delta && (
                <p className={cn('text-[10px] mb-0.5', m.tipo === 'warn' ? 'text-[#f43f5e]' : 'text-[#10b981]')}>
                  {m.tipo === 'warn' ? '↓' : '↑'} {m.delta}
                </p>
              )}
              <p className={cn('text-[10px]', m.tipo === 'warn' ? 'text-[#f43f5e]' : 'text-[var(--sl-t3)]')}>{m.nota}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 mt-3 px-3 py-2 rounded-[8px]" style={{ background: 'rgba(244,63,94,.06)', border: '1px solid rgba(244,63,94,.20)' }}>
        <AlertTriangle size={14} className="text-[#f43f5e] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#f43f5e]">
          <strong>Projeção ilustrativa.</strong> Em breve: projeção baseada em recorrentes + histórico real de gastos.
        </p>
      </div>
    </div>
  )
}
