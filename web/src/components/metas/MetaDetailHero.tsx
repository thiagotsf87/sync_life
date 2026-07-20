'use client'

import { Trophy, Rocket, Dumbbell, Star, Sprout, Check, Pause } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RingProgress } from '@/components/ui/ring-progress'
import {
  calcProgress, calcRingColor, calcProjectedDate,
  type Goal, type GoalContribution,
} from '@/hooks/use-metas'

interface MetaDetailHeroProps {
  goal: Goal
  contributions: GoalContribution[]
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

export function MetaDetailHero({ goal, contributions }: MetaDetailHeroProps) {
  const pct = calcProgress(goal.current_amount, goal.target_amount)
  const color = calcRingColor(goal)
  const useGrad = goal.status === 'active' && color === '#0F766E'
  const projected = calcProjectedDate(goal.current_amount, goal.target_amount, goal.monthly_contribution)
  const daysLeft = getDaysRemaining(goal.target_date)
  const remaining = Math.max(0, goal.target_amount - goal.current_amount)
  const lastContrib = contributions[0]

  const totalContribs = contributions.reduce((s, c) => s + c.amount, 0)

  function getMotivational(): { text: string; icon: LucideIcon } {
    if (goal.status === 'completed') return { text: 'Meta concluída! Você conseguiu!', icon: Trophy }
    if (pct >= 75) return { text: `Incrível! Você já passou dos ${pct}% · está quase lá!`, icon: Rocket }
    if (pct >= 50) return { text: 'Metade do caminho percorrido! Continue assim!', icon: Dumbbell }
    if (pct >= 25) return { text: `Ótimo começo! ${pct}% concluído e acelerando!`, icon: Star }
    return { text: 'Todo grande sonho começa com o primeiro passo. Você já começou!', icon: Sprout }
  }

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 sl-fade-up">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-4xl">{goal.icon}</span>
        <div className="flex-1">
          <h2 className={cn(
            'font-[Syne] font-extrabold text-xl leading-tight',
            'text-sl-grad',
          )}>
            {goal.name}
          </h2>
          {goal.description && (
            <p className="text-[13px] text-[var(--sl-t3)] mt-0.5">{goal.description}</p>
          )}
        </div>
        {goal.status !== 'active' && (
          <div className={cn(
            'px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 inline-flex items-center gap-1',
            goal.status === 'completed'
              ? 'bg-[rgba(15,118,110,.15)] text-[#0F766E]'
              : 'bg-[rgba(217,150,46,.15)] text-[#D9962E]',
          )}>
            {goal.status === 'completed' ? (
              <><Check size={11} strokeWidth={3} /> Concluída</>
            ) : (
              <><Pause size={11} /> Pausada</>
            )}
          </div>
        )}
      </div>

      {/* Ring + Grid stats */}
      <div className="flex items-center gap-6 mb-5">
        <RingProgress
          value={pct}
          size={120}
          strokeWidth={9}
        />
        <div className="grid grid-cols-2 gap-3 flex-1">
          <StatCell label="Acumulado" value={formatCurrency(goal.current_amount)} color="#0F766E" />
          <StatCell label="Meta total" value={formatCurrency(goal.target_amount)} />
          <StatCell label="Faltam" value={formatCurrency(remaining)} color={remaining > 0 ? '#D9962E' : '#0F766E'} />
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
            <p className="font-[IBM_Plex_Mono] font-medium text-[14px] text-[var(--sl-t1)]">{formatDate(goal.target_date)}</p>
            {daysLeft !== null && (
              <p className={cn('text-[12px] mt-0.5', daysLeft < 0 ? 'text-[#DB6478]' : daysLeft < 60 ? 'text-[#D9962E]' : 'text-[var(--sl-t3)]')}>
                {daysLeft < 0 ? `Prazo ultrapassado há ${Math.abs(daysLeft)} dias` : `${daysLeft} dias restantes`}
              </p>
            )}
          </div>
        )}
        {projected && goal.monthly_contribution > 0 ? (
          <div className="bg-[var(--sl-s2)] rounded-[12px] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Projeção (ritmo atual)</p>
            <p className="font-[IBM_Plex_Mono] font-medium text-[14px] text-[var(--sl-t1)]">
              {projected.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] mt-0.5">
              {contributions.length} aportes · {formatCurrency(totalContribs)} total
            </p>
          </div>
        ) : lastContrib ? (
          <div className="bg-[var(--sl-s2)] rounded-[12px] p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Último aporte</p>
            <p className="font-[IBM_Plex_Mono] font-medium text-[14px] text-[#0F766E]">
              {formatCurrency(lastContrib.amount)}
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] mt-0.5">{formatDate(lastContrib.date)}</p>
          </div>
        ) : null}
      </div>

      {/* Motivational text */}
      {(() => {
        const m = getMotivational()
        return (
          <div className="p-3.5 rounded-[12px] bg-gradient-to-br from-[#0F766E]/8 to-[#0B2D34]/8 border border-[#0F766E]/20 flex items-start gap-2.5">
            <m.icon size={16} className="text-[#0F766E] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed">{m.text}</p>
          </div>
        )
      })()}
    </div>
  )
}

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[var(--sl-s2)] rounded-[10px] p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">{label}</p>
      <p
        className="font-[IBM_Plex_Mono] font-medium text-[14px] leading-tight"
        style={{ color: color ?? 'var(--sl-t1)' }}
      >
        {value}
      </p>
    </div>
  )
}
