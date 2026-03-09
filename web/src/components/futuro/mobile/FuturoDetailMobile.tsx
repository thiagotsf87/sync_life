'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import {
  FUTURO_PRIMARY,
  FUTURO_PRIMARY_LIGHT,
  FUTURO_GRAD,
} from '@/lib/futuro-colors'
import { FuturoMilestoneTimeline } from '@/components/futuro/mobile/FuturoMilestoneTimeline'
import { FuturoSimuladorMobile } from '@/components/futuro/mobile/FuturoSimuladorMobile'
import { FuturoEditarMobile } from '@/components/futuro/mobile/FuturoEditarMobile'
import { FuturoHistoricoMobile } from '@/components/futuro/mobile/FuturoHistoricoMobile'
import { FuturoCelebracaoMobile } from '@/components/futuro/mobile/FuturoCelebracaoMobile'
import type { Objective } from '@/hooks/use-futuro'
import { calcObjectiveProgress } from '@/hooks/use-futuro'

interface FuturoDetailMobileProps {
  objective: Objective
}

export function FuturoDetailMobile({ objective }: FuturoDetailMobileProps) {
  const router = useRouter()

  const [showSimulador, setShowSimulador] = useState(false)
  const [showEditar, setShowEditar] = useState(false)
  const [showHistorico, setShowHistorico] = useState(false)
  const [showCelebracao, setShowCelebracao] = useState(false)

  const goals = objective.goals ?? []
  // Use objective.progress (pré-calculado no DB) se disponível; fallback para cálculo local
  const progress = (objective as any).progress > 0
    ? Math.round((objective as any).progress)
    : (() => {
        const firstGoal = goals[0]
        if (firstGoal?.target_value && firstGoal.target_value > 0) {
          return Math.round((firstGoal.current_value / firstGoal.target_value) * 100)
        }
        return calcObjectiveProgress(goals)
      })()
  const firstGoal = goals[0]

  // KPI values
  const accumulated = firstGoal?.current_value ?? 0
  const target = firstGoal?.target_value ?? 0
  const remaining = Math.max(0, target - accumulated)

  // Module config for goal rows
  const MODULE_CFG: Record<string, { emoji: string; color: string; label: string }> = {
    financas:     { emoji: '💰', color: '#10b981', label: 'Finanças' },
    patrimonio:   { emoji: '📈', color: '#3b82f6', label: 'Patrimônio' },
    carreira:     { emoji: '💼', color: '#f59e0b', label: 'Carreira' },
    tempo:        { emoji: '⏳', color: '#06b6d4', label: 'Tempo' },
    corpo:        { emoji: '🏃', color: '#f97316', label: 'Corpo' },
    mente:        { emoji: '🧠', color: '#8b5cf6', label: 'Mente' },
    experiencias: { emoji: '✈️', color: '#ec4899', label: 'Experiências' },
  }

  const INDICATOR_LABELS: Record<string, string> = {
    monetary:   'Valor acumulado',
    weight:     'Indicador de saúde',
    task:       'Tarefa com deadline',
    frequency:  'Frequência de hábito',
    percentage: 'Indicador percentual',
    quantity:   'Quantidade atingida',
    linked:     'Vinculado ao módulo',
  }

  // Is delayed?
  const isDelayed = objective.target_date
    ? new Date(objective.target_date).getTime() < Date.now() && progress < 100
    : false
  // Ring dimensions
  const ringSize = 78
  const strokeWidth = 8
  const r = (ringSize / 2) - strokeWidth / 2
  const circumference = 2 * Math.PI * r
  const dasharray = `${(circumference * progress) / 100} ${circumference - (circumference * progress) / 100}`

  // Mock milestones for timeline
  const timelineMilestones = [
    { id: 'm1', name: 'R$ 10.000 — Primeira marca', date: 'Mar 2024 · Concluído', status: 'done' as const, xp: 80 },
    { id: 'm2', name: 'R$ 25.000 — Primeiro quarto', date: 'Nov 2024 · Concluído', status: 'done' as const, xp: 120 },
    { id: 'm3', name: 'R$ 40.000 — Metade do caminho', date: 'Projetado: Jun 2026', status: 'current' as const, xp: 120 },
    { id: 'm4', name: 'R$ 80.000 — Meta final', date: 'Projetado: Fev 2029', status: 'future' as const, xp: 200 },
  ]

  const CATEGORY_LABELS: Record<string, string> = {
    financial: 'Aquisição',
    experience: 'Experiência',
    educational: 'Desenvolvimento',
    health: 'Segurança',
    professional: 'Liberdade',
    other: 'Personalizado',
  }
  const categoryDisplay = objective.target_date
    ? `${CATEGORY_LABELS[objective.category] ?? objective.category} · ${new Date(objective.target_date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
    : ''

  return (
    <div className="lg:hidden pb-[calc(68px+16px)]">
      {/* Back header */}
      <div className="flex items-center gap-2 px-5 pt-[10px] pb-[10px]">
        <button
          onClick={() => router.push('/futuro')}
          className="flex items-center gap-[5px] text-[13px] font-semibold"
          style={{ color: FUTURO_PRIMARY_LIGHT }}
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          Missões
        </button>
      </div>

      {/* Hero card */}
      <div
        className="mx-4 mb-[14px] rounded-[16px] p-[15px]"
        style={{
          background: `linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))`,
          border: `1px solid rgba(139,92,246,0.3)`,
        }}
      >
        {/* Mission label */}
        <p className="text-[10px] font-bold uppercase tracking-[0.5px] mb-2" style={{ color: FUTURO_PRIMARY_LIGHT }}>
          Missão Principal
        </p>

        {/* Icon + name */}
        <div className="flex items-center gap-[11px] mb-[13px]">
          <div
            className="w-[45px] h-[45px] rounded-[12px] flex items-center justify-center text-[22px]"
            style={{ background: 'rgba(139,92,246,0.15)' }}
          >
            {objective.icon}
          </div>
          <div>
            <p className="font-[Syne] text-[17px] font-extrabold text-[var(--sl-t1)]">
              {`Missão: ${objective.name.replace('Comprar ', '')}`}
            </p>
            <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">
              {categoryDisplay}
              {isDelayed && (
                <span className="inline-flex items-center gap-1 ml-1 px-2 py-[2px] rounded-[10px] text-[10px] font-semibold bg-[rgba(245,158,11,0.12)] text-[#f59e0b]">
                  ⚠ Atrasado
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Narrative */}
        <p className="text-[12px] text-[var(--sl-t2)] italic leading-[1.5] mb-[13px] [&_strong]:text-[var(--sl-t1)] [&_strong]:not-italic">
          Seu lar próprio está a <strong>{100 - progress}%</strong> de distância. Cada mês te aproxima.
        </p>

        {/* Ring + KPIs */}
        <div className="flex gap-[14px] items-center">
          {/* Progress ring */}
          <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
            <svg viewBox={`0 0 ${ringSize + 2} ${ringSize + 2}`} className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
              <circle fill="none" stroke="var(--sl-s3)" strokeWidth={strokeWidth}
                cx={(ringSize + 2) / 2} cy={(ringSize + 2) / 2} r={r} />
              <circle fill="none" stroke={FUTURO_PRIMARY} strokeWidth={strokeWidth}
                cx={(ringSize + 2) / 2} cy={(ringSize + 2) / 2} r={r}
                strokeDasharray={dasharray} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[Syne] text-[20px] font-extrabold leading-none" style={{ color: FUTURO_PRIMARY_LIGHT }}>
                {progress}%
              </span>
              <span className="text-[9px] text-[var(--sl-t2)]">
                concluída
              </span>
            </div>
          </div>

          {/* KPI grid */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-[11px] text-[var(--sl-t2)]">Acumulado</span>
              <span className="font-[DM_Mono] text-[12px]" style={{ color: FUTURO_PRIMARY_LIGHT }}>
                R$ {accumulated.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-[var(--sl-t2)]">Meta</span>
              <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t1)]">
                R$ {target.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-[var(--sl-t2)]">Restante</span>
              <span className="font-[DM_Mono] text-[12px] text-[#f59e0b]">
                R$ {remaining.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-[var(--sl-t2)]">Prazo projetado</span>
              <span className="font-[DM_Mono] text-[12px] text-[#f43f5e]">
                Fev 2029
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals list */}
      <div
        className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] overflow-hidden"
        style={{ borderColor: 'rgba(139,92,246,0.2)' }}
      >
        <div className="flex items-center justify-between px-[14px] py-[11px] border-b border-[var(--sl-border)]">
          <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
            Aliados desta missão
          </p>
          <button className="text-[11px] font-semibold" style={{ color: FUTURO_PRIMARY }}>
            + Meta
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="px-[14px] py-[14px] text-center">
            <p className="text-[12px] text-[var(--sl-t2)]">Nenhuma meta vinculada ainda</p>
          </div>
        ) : (
          goals.map((g: any, i: number) => {
            const modCfg = MODULE_CFG[g.target_module as string] ?? { emoji: '🎯', color: FUTURO_PRIMARY, label: g.target_module }
            const goalProgress = g.progress > 0
              ? Math.round(g.progress)
              : g.target_value && g.target_value > 0
                ? Math.round((g.current_value / g.target_value) * 100)
                : 0
            const isLastGoal = i === goals.length - 1
            const indicatorLabel = INDICATOR_LABELS[g.indicator_type as string] ?? 'Meta vinculada'
            const linkText = 'Ir ao módulo →'

            return (
              <div
                key={g.id}
                className="px-[14px] pt-[10px] pb-0"
                style={!isLastGoal ? { borderBottom: '1px solid var(--sl-border)' } : undefined}
              >
                <div className="flex items-center gap-[10px] pb-[8px]">
                  {/* Module icon */}
                  <div
                    className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[18px] shrink-0"
                    style={{ background: `${modCfg.color}22` }}
                  >
                    {modCfg.emoji}
                  </div>
                  {/* Goal info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--sl-t1)] leading-tight truncate">
                      {g.name}
                    </p>
                    <p className="text-[10px] text-[var(--sl-t2)] mt-[1px]">
                      {modCfg.label} · {indicatorLabel}
                    </p>
                  </div>
                  {/* Progress % + link */}
                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className="font-[DM_Mono] text-[12px] font-bold"
                      style={{ color: goalProgress > 0 ? FUTURO_PRIMARY : 'var(--sl-t3)' }}
                    >
                      {goalProgress}%
                    </span>
                    <span className="text-[10px] mt-[1px]" style={{ color: 'var(--sl-t2)' }}>
                      {linkText}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-[3px] bg-[var(--sl-s3)] rounded-full mb-[10px]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(goalProgress, 100)}%`,
                      background: modCfg.color,
                    }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Milestones section */}
      <div className="flex items-center justify-between px-5 mb-1">
        <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]">
          Marcos da Missão
        </p>
      </div>

      <FuturoMilestoneTimeline milestones={timelineMilestones} />

      {/* Action CTAs */}
      <div className="flex gap-[10px] px-4 pt-2 pb-4">
        <button
          onClick={() => setShowSimulador(true)}
          className="flex-1 flex items-center justify-center gap-1.5 h-[46px] rounded-[14px] text-[13px] font-semibold text-white"
          style={{ background: FUTURO_GRAD }}
        >
          Simular cenários
        </button>
        <button
          onClick={() => setShowEditar(true)}
          className="flex-1 flex items-center justify-center gap-1.5 h-[46px] rounded-[14px] text-[13px] font-semibold text-[var(--sl-t1)]
                     bg-[var(--sl-s2)] border border-[var(--sl-border-h)]"
        >
          Editar missão
        </button>
      </div>

      {/* Overlay screens */}
      <FuturoSimuladorMobile
        objectiveName={objective.name}
        open={showSimulador}
        onClose={() => setShowSimulador(false)}
      />

      <FuturoEditarMobile
        objectiveName={objective.name}
        objectiveIcon={objective.icon}
        category={objective.category === 'financial' ? 'Aquisição' : objective.category}
        targetValue={target}
        contribution={800}
        deadlineMonth={objective.target_date ? new Date(objective.target_date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long' }) : ''}
        deadlineYear={objective.target_date ? new Date(objective.target_date + 'T00:00:00').getFullYear().toString() : ''}
        priority={(objective as any).priority ?? 'medium'}
        goals={(objective.goals ?? []).map((g: any) => ({
          id: g.id,
          name: g.name,
          target_module: g.target_module,
          target_value: g.target_value,
          indicator_type: g.indicator_type,
        }))}
        open={showEditar}
        onClose={() => setShowEditar(false)}
      />

      <FuturoHistoricoMobile
        objectiveName={objective.name}
        objectiveIcon={objective.icon}
        open={showHistorico}
        onClose={() => setShowHistorico(false)}
      />

      <FuturoCelebracaoMobile
        objectiveName={objective.name}
        objectiveIcon={objective.icon}
        accumulated={accumulated}
        duration={44}
        achievedPct={progress}
        open={showCelebracao}
        onClose={() => setShowCelebracao(false)}
        onNewObjective={() => {
          setShowCelebracao(false)
          router.push('/futuro')
        }}
      />
    </div>
  )
}
