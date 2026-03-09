'use client'

import { EXP_PRIMARY, EXP_PRIMARY_LIGHT, EXP_GRAD } from '@/lib/exp-colors'
import { ExpBudgetCategory } from './ExpBudgetCategory'
import { ExpCoachCard } from './ExpCoachCard'

interface ExpTabOrcamentoProps {
  totalBudget: number
  totalSaved: number
}

const MOCK_CATEGORIES = [
  { icon: '✈️', name: 'Passagens', current: 4200, total: 4200, pct: 100, isPaid: true, xpLabel: '⚡ +40 XP ganhos' },
  { icon: '🏨', name: 'Hospedagem', current: 2800, total: 4000, pct: 70, xpLabel: '⚡ +30 XP · +12 XP ao completar' },
  { icon: '🍜', name: 'Alimentação', current: 0, total: 3000, pct: 0, xpLabel: '⚡ Guardar aqui vale +30 XP' },
  { icon: '🎌', name: 'Passeios', current: 0, total: 2500, pct: 0, xpLabel: '⚡ +25 XP' },
  { icon: '🛍️', name: 'Compras', current: 0, total: 1300, pct: 0, xpLabel: '⚡ +20 XP' },
]

function formatBRL(v: number): string {
  return `R$ ${v.toLocaleString('pt-BR')}`
}

export function ExpTabOrcamento({ totalBudget: propBudget, totalSaved: propSaved }: ExpTabOrcamentoProps) {
  const accent = EXP_PRIMARY
  const totalBudget = propBudget || 15000
  const totalSaved = propSaved || 8400
  const budgetPct = Math.round((totalSaved / totalBudget) * 100)
  const remaining = totalBudget - totalSaved

  return (
    <div className="pt-3">
      {/* Hero card */}
      <div
        className="mx-4 mb-[14px] rounded-[16px] p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(236,72,153,0.08))',
          border: '1px solid rgba(139,92,246,0.28)',
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[10px]" style={{ color: EXP_PRIMARY_LIGHT }}>
          💰 Missão Financeira
        </p>
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[12px] text-[var(--sl-t2)] mb-1">Meta total</p>
            <p className="font-[DM_Mono] text-[28px] font-bold text-[var(--sl-t1)]">{formatBRL(totalBudget)}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[var(--sl-t2)] mb-1">Conquistado</p>
            <p className="font-[DM_Mono] text-[22px]" style={{ color: accent }}>{formatBRL(totalSaved)}</p>
            <p className="text-[10px] font-bold" style={{ color: EXP_PRIMARY_LIGHT }}>+160 XP acumulados</p>
          </div>
        </div>
        <div className="h-[10px] rounded-[5px] overflow-hidden mb-2" style={{ background: 'var(--sl-s3)' }}>
          <div className="h-full rounded-[5px]" style={{
            width: `${budgetPct}%`,
            background: EXP_GRAD,
          }} />
        </div>
        <div className="flex justify-between text-[12px]">
          <span style={{ color: 'var(--sl-t2)' }}>
            {budgetPct}% da missão
          </span>
          <span style={{ color: '#f59e0b' }}>Faltam {formatBRL(remaining)}</span>
        </div>
        <div className="mt-[10px] px-[10px] py-2 rounded-lg flex items-center gap-2"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <span className="text-[11px] font-semibold" style={{ color: EXP_PRIMARY_LIGHT }}>
            Life Score: <strong className="text-[var(--sl-t1)]">61 → 72 pts</strong>
          </span>
        </div>
      </div>

      {/* Coach */}
      <ExpCoachCard
        message={<>Passagens e hospedagem: <strong>feito!</strong> Foco em alimentação e passeios. <strong>R$ 825/mês</strong> fecha tudo em 8 meses.</>}
        cta="Simular aporte extra"
      />

      {/* Categories */}
      <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 pb-2 mt-1">
        CATEGORIAS DA MISSÃO
      </p>
      <div style={{ background: 'var(--sl-s1)', borderTop: '1px solid var(--sl-border)', borderBottom: '1px solid var(--sl-border)' }}>
        {MOCK_CATEGORIES.map((cat, i) => (
          <ExpBudgetCategory
            key={i}
            icon={cat.icon}
            name={cat.name}
            current={cat.current}
            total={cat.total}
            pct={cat.pct}
            isPaid={cat.isPaid}
            xpLabel={cat.xpLabel}
            formatValue={formatBRL}
          />
        ))}
      </div>

      {/* Auto savings */}
      <p className="font-[Syne] text-[12px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-5 pb-2 mt-2">
        ALIADO: FINANÇAS
      </p>
      <div className="mx-4 mb-[14px] rounded-[16px] p-[14px]"
        style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="flex justify-between items-start mb-[10px]">
          <div>
            <p className="text-[14px] font-semibold text-[var(--sl-t1)]">
              R$ 825/mês automático
            </p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-[2px]">
              8 meses restantes
            </p>
          </div>
          <div className="w-[44px] h-[24px] rounded-[12px] relative" style={{ background: '#10b981' }}>
            <div className="w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] left-[23px]" />
          </div>
        </div>
        <div className="rounded-lg px-[10px] py-2 text-[12px] text-[var(--sl-t2)]"
          style={{ background: 'var(--sl-s2)' }}>
          🔗 Envelope <span style={{ color: '#10b981' }}>"Viagem Japão"</span> · Cada aporte = <span className="font-bold" style={{ color: EXP_PRIMARY_LIGHT }}>+10 XP</span>
        </div>
      </div>
    </div>
  )
}
