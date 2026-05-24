'use client'

import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fmtR$ } from '@/components/financas/helpers'

interface KpiStripProps {
  receitasMes: number
  totalGasto: number
  saldoMes: number
  naoAlocado: number
  taxaPoupanca: number
  loading: boolean
}

export function KpiStrip({ receitasMes, totalGasto, saldoMes, naoAlocado, taxaPoupanca, loading }: KpiStripProps) {
  return (
    <div className="grid grid-cols-4 gap-2.5 mb-3 max-sm:grid-cols-2">
      {/* Receitas */}
      <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
        <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#0F766E' }} />
        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(15,118,110,0.12)' }}>💰</div>
        <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Receitas</p>
        <p className="font-[IBM_Plex_Mono] text-[21px] font-medium leading-none text-[#0F766E] mb-1">
          {loading ? '—' : `R$ ${fmtR$(receitasMes)}`}
        </p>
        <p className="text-[11px] text-[var(--sl-t2)] flex items-center gap-1">
          <TrendingUp size={11} />Mês atual
        </p>
      </div>
      {/* Despesas */}
      <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
        <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#DB6478' }} />
        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(219,100,120,0.12)' }}>📤</div>
        <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Despesas</p>
        <p className="font-[IBM_Plex_Mono] text-[21px] font-medium leading-none text-[#DB6478] mb-1">
          {loading ? '—' : `R$ ${fmtR$(totalGasto)}`}
        </p>
        <p className="text-[11px] text-[var(--sl-t2)] flex items-center gap-1">
          <TrendingUp size={11} />Mês atual
        </p>
      </div>
      {/* Saldo */}
      <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
        <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: saldoMes >= 0 ? '#0F766E' : '#DB6478' }} />
        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(15,118,110,0.12)' }}>💚</div>
        <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Saldo do Mês</p>
        <p className={cn('font-[IBM_Plex_Mono] text-[21px] font-medium leading-none mb-1', saldoMes >= 0 ? 'text-[var(--sl-t1)]' : 'text-[#DB6478]')}>
          {loading ? '—' : `R$ ${fmtR$(saldoMes)}`}
        </p>
        <p className="text-[11px] text-[var(--sl-t2)]">Receitas menos despesas</p>
        <div className="mt-2 px-1.5 py-1 rounded-[6px] bg-[var(--sl-s2)] text-[11px] text-[var(--sl-t3)]">
          Não alocado: <strong className="text-[#0F766E]">{loading ? '—' : `R$ ${fmtR$(Math.max(0, naoAlocado))}`}</strong>
        </div>
      </div>
      {/* Taxa Poupança */}
      <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
        <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#0B2D34' }} />
        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(0,85,255,0.12)' }}>📊</div>
        <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Taxa de Poupança</p>
        <p className="font-[IBM_Plex_Mono] text-[21px] font-medium leading-none mb-1" style={{ color: '#0B2D34' }}>
          {loading ? '—' : `${taxaPoupanca}%`}
        </p>
        <p className="text-[11px] text-[var(--sl-t2)]">Do total recebido</p>
        <div className="mt-2 px-1.5 py-1 rounded-[6px] bg-[var(--sl-s2)] text-[11px] text-[var(--sl-t3)]">
          Meta: <strong className="text-[var(--sl-t1)]">30%</strong>
          {' · '}
          <span className={taxaPoupanca >= 30 ? 'text-[#0F766E]' : 'text-[#D9962E]'}>
            {taxaPoupanca >= 30 ? '✓ acima' : '⚠ abaixo'}
          </span>
        </div>
      </div>
    </div>
  )
}
