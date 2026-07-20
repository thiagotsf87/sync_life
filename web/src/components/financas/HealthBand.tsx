'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { fmtBRL } from '@/lib/format/currency'

interface HealthBandProps {
  receitasMes: number
  totalGasto: number
  saldoMes: number
  taxaPoupanca: number
  qtdOk: number
  qtdAlert: number
  qtdOver: number
  alertCat?: { name: string; pct: number; spent: number; limit: number } | null
}

/**
 * SaudeAlerta v3 — alerta horizontal compacto.
 * Border-left warning · eyebrow vertical "SAÚDE FIN." · mensagem · CTA "Ver análise →".
 * Cor da borda muda conforme severidade: over → danger, alert → warning, ok → em.
 */
export function HealthBand({
  receitasMes,
  totalGasto,
  saldoMes,
  taxaPoupanca,
  qtdOk,
  qtdAlert,
  qtdOver,
  alertCat,
}: HealthBandProps) {
  const router = useRouter()

  const severity: 'danger' | 'warning' | 'ok' =
    qtdOver > 0 ? 'danger' : qtdAlert > 0 || taxaPoupanca < 30 ? 'warning' : 'ok'

  const accentColor =
    severity === 'danger' ? 'var(--sl-danger)' :
    severity === 'warning' ? 'var(--sl-warning)' :
    'var(--sl-em)'

  // Build message — sem em-dash, usa vírgula/dois-pontos
  const { title, message } = buildMessage({
    receitasMes,
    totalGasto,
    saldoMes,
    taxaPoupanca,
    qtdOk,
    qtdAlert,
    qtdOver,
    alertCat,
  })

  return (
    <div
      className="flex items-center gap-[18px] px-5 py-[14px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] mb-3.5"
      style={{ borderLeft: `2px solid ${accentColor}` }}
    >
      <div
        className="text-[9.5px] font-bold uppercase tracking-[0.14em] shrink-0"
        style={{ color: accentColor }}
      >
        SAÚDE FIN.
      </div>
      <div className="w-px h-8 bg-[var(--sl-border)] shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">
          {title}
        </div>
        <div className="text-[12px] text-[var(--sl-t3)]">
          {message}
        </div>
      </div>
      <button
        onClick={() => router.push('/financas/relatorios')}
        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-transparent border border-[var(--sl-border)] rounded-full text-[var(--sl-t1)] text-[12px] font-semibold hover:border-[var(--sl-border-h)] transition-colors"
      >
        Ver análise <ArrowRight size={11} />
      </button>
    </div>
  )
}

function buildMessage(p: {
  receitasMes: number
  totalGasto: number
  saldoMes: number
  taxaPoupanca: number
  qtdOk: number
  qtdAlert: number
  qtdOver: number
  alertCat?: { name: string; pct: number; spent: number; limit: number } | null
}): { title: string; message: React.ReactNode } {
  if (p.qtdOver > 0) {
    return {
      title: `${p.qtdOver} orçamento${p.qtdOver > 1 ? 's' : ''} estourado${p.qtdOver > 1 ? 's' : ''}`,
      message: (
        <>
          Revise as despesas para fechar o mês equilibrado.
        </>
      ),
    }
  }
  if (p.alertCat) {
    return {
      title: `${p.alertCat.name} em atenção`,
      message: (
        <>
          Você usou{' '}
          <span style={{ color: 'var(--sl-warning)', fontWeight: 600 }}>
            {p.alertCat.pct}%
          </span>{' '}
          do orçamento de {p.alertCat.name} ({fmtBRL(p.alertCat.spent)} de {fmtBRL(p.alertCat.limit)}).
        </>
      ),
    }
  }
  if (p.qtdAlert > 0) {
    return {
      title: `${p.qtdAlert} orçamento${p.qtdAlert > 1 ? 's' : ''} em atenção`,
      message: <>Acompanhe os gastos da semana para evitar estouros.</>,
    }
  }
  if (p.receitasMes === 0 && p.totalGasto === 0) {
    return {
      title: 'Sem transações neste mês',
      message: <>Registre suas entradas e saídas para ver a saúde financeira.</>,
    }
  }
  return {
    title: p.saldoMes > 0 ? 'Mês positivo até aqui' : 'Atenção ao saldo mensal',
    message: (
      <>
        Receitas de{' '}
        <span className="sl-num" style={{ color: 'var(--sl-em)', fontWeight: 600 }}>
          {fmtBRL(p.receitasMes)}
        </span>{' '}
        com{' '}
        <span className="sl-num" style={{ color: 'var(--sl-danger)', fontWeight: 600 }}>
          {fmtBRL(p.totalGasto)}
        </span>{' '}
        em despesas.{' '}
        {p.taxaPoupanca >= 30 ? 'Poupança acima da meta.' : 'Mantenha as despesas sob controle.'}
      </>
    ),
  }
}
