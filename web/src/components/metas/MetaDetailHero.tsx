'use client'

import { cn } from '@/lib/utils'
import { RingProgress } from '@/components/ui/ring-progress'
import {
  calcProgress, calcRingColor, calcProjectedDate,
  type Goal, type GoalContribution,
} from '@/hooks/use-metas'

interface MetaDetailHeroProps {
  goal: Goal
  contributions: GoalContribution[]
  isJornada: boolean
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getDaysRemaining(targetDate: string | null): number | null {
  if (!targetDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(targetDate + 'T00:00:00')
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function MetaDetailHero({ goal, contributions, isJornada }: MetaDetailHeroProps) {
  const pct = calcProgress(goal.current_amount, goal.target_amount)
  const color = calcRingColor(goal)
  const useGrad = goal.status === 'active' && color === '#10b981'
  const projected = calcProjectedDate(goal.current_amount, goal.target_amount, goal.monthly_contribution)
  const daysLeft = getDaysRemaining(goal.target_date)
  const remaining = Math.max(0, goal.target_amount - goal.current_amount)
  const lastContrib = contributions[0]

  const totalContribs = contributions.reduce((s, c) => s + c.amount, 0)

  function getMotivationalText(): string {
    if (goal.status === 'completed') return `🏆 Meta concluída! Você conseguiu!`
    if (pct >= 75) return `🚀 Incrível! Você já passou dos ${pct}% — está quase lá!`
    if (pct >= 50) return `💪 Metade do caminho percorrido! Continue assim!`
    if (pct >= 25) return `⭐ Ótimo começo! ${pct}% concluído e acelerando!`
    return `🌱 Todo grande sonho começa com o primeiro passo. Você já começou!`
  }

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 sl-fade-up">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-4xl">{goal.icon}</span>
        <div className="flex-1">
          <h2 className={cn(
            'font-[Syne] font-extrabold text-xl leading-tight',
            isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]',
          )}>
            {goal.name}
          </h2>
          {goal.description && (
            <p className="text-[13px] text-[var(--sl-t3)] mt-0.5">{goal.description}</p>
          )}
        </div>
        {goal.status !== 'active' && (
          <div className={cn(
            'px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0',
            goal.status === 'completed'
              ? 'bg-[rgba(16,185,129,.15)] text-[#10b981]'
              : 'bg-[rgba(245,158,11,.15)] text-[#f59e0b]',
          )}>
            {goal.status === 'completed' ? '✓ Concluída' : '⏸ Pausada'}
          </div>
        )}
      </div>

      {/* Ring + Grid stats */}
      <div className="flex items-center gap-6 mb-5">
        <RingProgress
          value={pct}
          size={120}
          strokeWidth={9}
          color={color}
          gradient={useGrad}
        />
        <div className="grid grid-cols-2 gap-3 flex-1">
          <StatCell label="Acumulado" value={formatCurrency(goal.current_amount)} color="#10b981" />
          <StatCell label="Meta total" value={formatCurrency(goal.target_amount)} />
          <StatCell label="Faltam" value={formatCurrency(remaining)} color={remaining > 0 ? '#f59e0b' : '#10b981'} />
          <StatCell
            label="Aporte mensal"
            value={goal.monthly_contribution > 0 ? formatCurrency(goal.monthly_contribution) : '—'}
          />
        </div>
      </div>

      {/* Prazo + projeção */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
        {goal.target_date && (
          <div className="bg-[var(--sl-s2)] rounded-[12px] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Prazo</p>
            <p className="font-[DM_Mono] font-medium text-[14px] text-[var(--sl-t1)]">{formatDate(goal.target_date)}</p>
            {daysLeft !== null && (
              <p className={cn('text-[12px] mt-0.5', daysLeft < 0 ? 'text-[#f43f5e]' : daysLeft < 60 ? 'text-[#f59e0b]' : 'text-[var(--sl-t3)]')}>
                {daysLeft < 0 ? `Prazo ultrapassado há ${Math.abs(daysLeft)} dias` : `${daysLeft} dias restantes`}
              </p>
            )}
          </div>
        )}
        {projected && goal.monthly_contribution > 0 ? (
          <div className="bg-[var(--sl-s2)] rounded-[12px] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Projeção (ritmo atual)</p>
            <p className="font-[DM_Mono] font-medium text-[14px] text-[var(--sl-t1)]">
              {projected.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] mt-0.5">
              {contributions.length} aportes · {formatCurrency(totalContribs)} total
            </p>
          </div>
        ) : lastContrib ? (
          <div className="bg-[var(--sl-s2)] rounded-[12px] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Último aporte</p>
            <p className="font-[DM_Mono] font-medium text-[14px] text-[#10b981]">
              {formatCurrency(lastContrib.amount)}
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] mt-0.5">{formatDate(lastContrib.date)}</p>
          </div>
        ) : null}
      </div>

      {/* Jornada: frase motivacional */}
      {isJornada && (
        <div className="p-3.5 rounded-[12px] bg-gradient-to-br from-[#10b981]/8 to-[#0055ff]/8 border border-[#10b981]/20">
          <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed">{getMotivationalText()}</p>
        </div>
      )}
    </div>
  )
}

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[var(--sl-s2)] rounded-[10px] p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">{label}</p>
      <p
        className="font-[DM_Mono] font-medium text-[14px] leading-tight"
        style={{ color: color ?? 'var(--sl-t1)' }}
      >
        {value}
      </p>
    </div>
  )
}
