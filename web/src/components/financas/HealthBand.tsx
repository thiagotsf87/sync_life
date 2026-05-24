'use client'

import { useRouter } from 'next/navigation'
import { fmtR$ } from '@/components/financas/helpers'

interface HealthBandProps {
  receitasMes: number
  totalGasto: number
  saldoMes: number
  taxaPoupanca: number
  qtdOk: number
  qtdAlert: number
  qtdOver: number
}

export function HealthBand({ receitasMes, totalGasto, saldoMes, taxaPoupanca, qtdOk, qtdAlert, qtdOver }: HealthBandProps) {
  const router = useRouter()

  return (
    <div
      className="flex items-center gap-4 rounded-[14px] px-4 py-3 mb-3"
      style={{ background: 'linear-gradient(135deg,rgba(15,118,110,.07),rgba(0,85,255,.07))', border: '1px solid rgba(15,118,110,.18)' }}
    >
      <div className="shrink-0 text-center">
        <p className="font-[Space_Grotesk] font-extrabold text-[42px] leading-none" style={{ background: 'linear-gradient(135deg,#0F766E,#0B2D34)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {taxaPoupanca > 0 ? Math.min(Math.round(50 + taxaPoupanca), 99) : '—'}
        </p>
        <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mt-0.5">Saúde Fin.</p>
      </div>
      <div className="w-px h-11 bg-[var(--sl-border)] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-[Space_Grotesk] font-bold text-[13px] text-[var(--sl-t1)] mb-0.5">
          {saldoMes > 0 ? 'Mês positivo até aqui! 🎉' : 'Atenção ao saldo mensal'}
        </p>
        <p className="text-[12px] text-[var(--sl-t3)] italic leading-snug">
          {receitasMes > 0
            ? `Receitas de R$ ${fmtR$(receitasMes)} com R$ ${fmtR$(totalGasto)} em despesas. ${taxaPoupanca >= 30 ? 'Poupança acima da meta!' : 'Mantenha as despesas sob controle.'}`
            : 'Nenhuma transação registrada este mês ainda.'}
        </p>
        <div className="flex gap-1.5 flex-wrap mt-2">
          {qtdOk > 0 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(15,118,110,0.12)] text-[#0F766E]">✓ {qtdOk} orçamento{qtdOk > 1 ? 's' : ''} no ritmo</span>}
          {taxaPoupanca >= 30 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(15,118,110,0.12)] text-[#0F766E]">✓ Poupança acima da meta</span>}
          {qtdAlert > 0 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(217,150,46,0.12)] text-[#D9962E]">⚠ {qtdAlert} em atenção</span>}
          {qtdOver > 0 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(219,100,120,0.12)] text-[#DB6478]">⚠ {qtdOver} estourado{qtdOver > 1 ? 's' : ''}</span>}
        </div>
      </div>
      <button
        onClick={() => router.push('/financas/relatorios')}
        className="shrink-0 px-3 py-1.5 rounded-[9px] border-none text-white text-[11px] font-bold"
        style={{ background: 'linear-gradient(135deg,#0F766E,#0B2D34)' }}
      >
        Ver análise
      </button>
    </div>
  )
}
