'use client'

import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'

interface GoalItem {
  id: string
  name: string
  icon: string
  iconBg: string
  deadline: string
  category: string
  modules: { emoji: string; label: string; color: string; bg: string }[]
  progressLabel: string
  progressPct: number
  progressColor: string
}

interface FuturoMobileProps {
  avgProgress: number
  activeCount: number
  alertText?: string
  goals: GoalItem[]
  onNewGoal: () => void
}

function getGoalBarColor(pct: number): string {
  if (pct >= 60) return '#10b981'
  if (pct >= 40) return '#f59e0b'
  return '#f43f5e'
}

export function FuturoMobile({ avgProgress, activeCount, alertText, goals, onNewGoal }: FuturoMobileProps) {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  return (
    <div className="lg:hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h1 className={`font-[Syne] text-[20px] font-bold ${isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'}`}>
            Futuro
          </h1>
          <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">Objetivos de vida</p>
        </div>
      </div>

      {/* Score hero card — Jornada only */}
      {isJornada && (
        <div className="mx-4 mb-3 rounded-[16px] p-4 flex items-center gap-4
                        bg-[linear-gradient(135deg,rgba(0,85,255,0.1),rgba(139,92,246,0.06))]
                        border border-[rgba(0,85,255,0.2)]">
          <div className="text-center shrink-0">
            <p className="font-[Syne] text-[32px] font-extrabold text-[#0055ff] leading-none">
              {avgProgress}%
            </p>
            <p className="text-[10px] text-[var(--sl-t2)] mt-1">Progresso geral</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[var(--sl-t1)] mb-1">
              {activeCount} objetivo{activeCount !== 1 ? 's' : ''} ativo{activeCount !== 1 ? 's' : ''}
            </p>
            {alertText && (
              <p className="text-[12px] text-[var(--sl-t2)] leading-[1.5]"
                 dangerouslySetInnerHTML={{ __html: alertText }} />
            )}
          </div>
        </div>
      )}

      {/* Foco: compact summary strip */}
      {!isJornada && (
        <div className="grid grid-cols-2 gap-2.5 mx-4 mb-3">
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Progresso</p>
            <p className="font-[DM_Mono] text-[18px] font-medium text-[#0055ff]">{avgProgress}%</p>
          </div>
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Ativos</p>
            <p className="font-[DM_Mono] text-[18px] font-medium text-[var(--sl-t1)]">{activeCount}</p>
          </div>
        </div>
      )}

      {/* Section title */}
      <p className="px-5 pb-2 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
        Objetivos Ativos
      </p>

      {/* Goal cards */}
      {goals.map((goal) => (
        <div
          key={goal.id}
          onClick={() => router.push(`/futuro/${goal.id}`)}
          className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-4 cursor-pointer
                     transition-colors active:bg-[var(--sl-s2)]"
        >
          {/* Header: icon + meta */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] text-[22px] shrink-0"
              style={{ background: goal.iconBg }}
            >
              {goal.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-[Syne] text-[15px] font-semibold text-[var(--sl-t1)]">{goal.name}</p>
              <p className="text-[11px] text-[var(--sl-t2)] mt-0.5">
                {goal.deadline} · {goal.category}
              </p>
              {/* Module tags — Jornada only */}
              {isJornada && goal.modules.length > 0 && (
                <div className="flex flex-wrap gap-[5px] mt-2">
                  {goal.modules.map((mod, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 px-2 py-[3px] rounded-[12px] text-[10px] font-medium"
                      style={{ background: mod.bg, color: mod.color }}
                    >
                      {mod.emoji} {mod.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Progress row */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-[var(--sl-t2)]">{goal.progressLabel}</span>
            <span className="font-[DM_Mono] text-[13px] font-medium" style={{ color: getGoalBarColor(goal.progressPct) }}>
              {goal.progressPct}%
            </span>
          </div>
          <div className="h-[5px] rounded-full overflow-hidden bg-[var(--sl-s3)]">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${Math.min(goal.progressPct, 100)}%`,
                background: goal.progressPct >= 50
                  ? 'linear-gradient(90deg, #10b981, #0055ff)'
                  : getGoalBarColor(goal.progressPct),
              }}
            />
          </div>
        </div>
      ))}

      {/* Empty state */}
      {goals.length === 0 && (
        <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-8 text-center">
          <div className="text-[36px] mb-2">🔮</div>
          <p className="text-[13px] text-[var(--sl-t2)]">Crie seu primeiro objetivo para começar.</p>
        </div>
      )}

      {/* New goal button */}
      <div className="px-4 pt-2 pb-6">
        <button
          onClick={onNewGoal}
          className="w-full flex items-center justify-center h-[44px] rounded-[20px]
                     text-[14px] font-semibold text-white transition-all active:opacity-80"
          style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
        >
          + Novo Objetivo
        </button>
      </div>
    </div>
  )
}
