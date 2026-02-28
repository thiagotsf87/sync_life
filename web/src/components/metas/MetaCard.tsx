'use client'

import { cn } from '@/lib/utils'
import { RingProgress } from '@/components/ui/ring-progress'
import { calcProgress, calcRingColor, calcProjectedDate, type Goal } from '@/hooks/use-metas'

interface MetaCardProps {
  goal: Goal
  onClick?: () => void
  onAddContribution?: () => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getDaysRemaining(targetDate: string | null): number | null {
  if (!targetDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(targetDate + 'T00:00:00')
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getTip(goal: Goal, pct: number): { text: string; color: string; bg: string } | null {
  if (goal.status === 'completed') {
    return { text: '🏆 Meta concluída! Parabéns!', color: '#10b981', bg: 'rgba(16,185,129,.08)' }
  }
  if (goal.status === 'paused') {
    return { text: '⏸️ Meta pausada. Retome quando puder!', color: '#f59e0b', bg: 'rgba(245,158,11,.08)' }
  }
  const days = getDaysRemaining(goal.target_date)
  if (days !== null && days < 0) {
    return { text: '⚠️ Prazo ultrapassado. Revise sua estratégia.', color: '#f43f5e', bg: 'rgba(244,63,94,.08)' }
  }
  if (pct >= 75) {
    return { text: `🚀 ${pct}% concluído! Você está quase lá!`, color: '#10b981', bg: 'rgba(16,185,129,.08)' }
  }
  if (days !== null && days < 60 && pct < 80) {
    return { text: `⚡ Menos de 2 meses para o prazo. Considere aumentar o aporte.`, color: '#f59e0b', bg: 'rgba(245,158,11,.08)' }
  }
  return { text: `💪 Continue assim! ${pct}% concluído.`, color: '#10b981', bg: 'rgba(16,185,129,.08)' }
}

export function MetaCard({ goal, onClick, onAddContribution }: MetaCardProps) {
  const pct = calcProgress(goal.current_amount, goal.target_amount)
  const color = calcRingColor(goal)
  const useGrad = goal.status === 'active' && color === '#10b981'
  const projected = calcProjectedDate(goal.current_amount, goal.target_amount, goal.monthly_contribution)
  const daysLeft = getDaysRemaining(goal.target_date)
  const tip = getTip(goal, pct)

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5',
        'transition-colors hover:border-[var(--sl-border-h)] sl-fade-up',
        onClick && 'cursor-pointer',
      )}
    >
      {/* Status badge */}
      {goal.status === 'completed' && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{ background: 'rgba(16,185,129,.15)', color: '#10b981' }}>
          ✓ Concluída
        </div>
      )}
      {goal.status === 'paused' && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{ background: 'rgba(245,158,11,.15)', color: '#f59e0b' }}>
          ⏸ Pausada
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl shrink-0 leading-none mt-0.5">{goal.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-[Syne] font-extrabold text-[15px] text-[var(--sl-t1)] leading-tight truncate">
            {goal.name}
          </h3>
          {goal.description && (
            <p className="text-[12px] text-[var(--sl-t3)] mt-0.5 line-clamp-1">{goal.description}</p>
          )}
        </div>
      </div>

      {/* Ring + stats */}
      <div className="flex items-center gap-4 mb-4">
        <RingProgress
          value={pct}
          size={88}
          strokeWidth={7}
          color={color}
          gradient={useGrad}
        />
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)]">Acumulado</p>
            <p className="font-[DM_Mono] font-medium text-[16px] text-[var(--sl-t1)] leading-tight">
              {formatCurrency(goal.current_amount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)]">Meta</p>
            <p className="font-[DM_Mono] text-[13px] text-[var(--sl-t2)]">
              {formatCurrency(goal.target_amount)}
            </p>
          </div>
        </div>
      </div>

      {/* Deadline + projeção */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {goal.target_date && (
          <div className="bg-[var(--sl-s2)] rounded-[10px] p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">Prazo</p>
            <p className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">{formatDate(goal.target_date)}</p>
            {daysLeft !== null && (
              <p className={cn('text-[11px] mt-0.5', daysLeft < 0 ? 'text-[#f43f5e]' : daysLeft < 60 ? 'text-[#f59e0b]' : 'text-[var(--sl-t3)]')}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)}d atrás` : `${daysLeft}d restantes`}
              </p>
            )}
          </div>
        )}
        {projected && goal.monthly_contribution > 0 && (
          <div className="bg-[var(--sl-s2)] rounded-[10px] p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">Projeção</p>
            <p className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">{formatDate(projected.toISOString().split('T')[0])}</p>
            <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
              {formatCurrency(goal.monthly_contribution)}/mês
            </p>
          </div>
        )}
      </div>

      {/* Tip Jornada */}
      {tip && (
        <div
          className="jornada-only flex items-start gap-2 p-2.5 rounded-[10px] text-[12px] mb-3"
          style={{ background: tip.bg, border: `1px solid ${tip.color}30` }}
        >
          <p style={{ color: tip.color }} className="leading-snug">{tip.text}</p>
        </div>
      )}

      {/* Aporte rápido */}
      {goal.status === 'active' && onAddContribution && (
        <button
          onClick={e => { e.stopPropagation(); onAddContribution() }}
          className="w-full py-2 rounded-[10px] text-[12px] font-bold transition-all hover:brightness-110"
          style={{ background: 'rgba(16,185,129,.12)', color: '#10b981', border: '1px solid rgba(16,185,129,.25)' }}
        >
          + Registrar Aporte
        </button>
      )}
    </div>
  )
}
