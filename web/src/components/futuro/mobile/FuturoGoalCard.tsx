'use client'

import { FUTURO_PRIMARY_LIGHT, FUTURO_GRAD, FUTURO_PRIMARY_BG } from '@/lib/futuro-colors'
import { getObjectiveXpReward } from '@/lib/futuro-xp-mock'

interface ModuleTag {
  emoji: string
  label: string
  color: string
  bg: string
}

interface FuturoGoalCardProps {
  id: string
  name: string
  icon: string
  iconBg: string
  deadline: string
  progressLabel: string
  progressPct: number
  modules: ModuleTag[]
  isDelayed?: boolean
  narrativeHint?: string
  status?: 'active' | 'completed' | 'paused'
  onClick?: () => void
}

function getProgressColor(pct: number, isDelayed: boolean): string {
  if (isDelayed) return '#f59e0b'
  if (pct >= 60) return '#10b981'
  if (pct >= 40) return '#f59e0b'
  return '#f43f5e'
}

function getBorderLeftColor(pct: number, isDelayed: boolean, status?: string): string {
  if (status === 'completed') return '#10b981'
  if (status === 'paused') return 'var(--sl-t3)'
  if (isDelayed) return '#f59e0b'
  if (pct >= 60) return '#10b981'
  return '#8b5cf6'
}

export function FuturoGoalCard({
  id,
  name,
  icon,
  iconBg,
  deadline,
  progressLabel,
  progressPct,
  modules,
  isDelayed = false,
  narrativeHint,
  status,
  onClick,
}: FuturoGoalCardProps) {
  const pctColor = getProgressColor(progressPct, isDelayed)
  const xpReward = getObjectiveXpReward(progressPct)
  const borderLeftColor = getBorderLeftColor(progressPct, isDelayed, status)

  return (
    <div
      onClick={onClick}
      className="mx-4 mb-[10px] rounded-[16px] p-[13px_15px] cursor-pointer transition-colors active:bg-[var(--sl-s2)]"
      style={{
        background: `linear-gradient(135deg, var(--sl-s1), rgba(139,92,246,0.03))`,
        border: isDelayed
          ? `1px solid rgba(245,158,11,0.3)`
          : `1px solid rgba(139,92,246,0.22)`,
        borderLeft: `3px solid ${borderLeftColor}`,
      }}
    >
      {/* Header: icon + name + pct */}
      <div className="flex items-start gap-[11px] mb-[11px]">
        <div
          className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center text-[21px] shrink-0"
          style={{ background: isDelayed ? FUTURO_PRIMARY_BG : iconBg }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]">
            {`Missão: ${name.replace('Missão: ', '')}`}
          </p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">
            {deadline} · {progressPct}% concluída
          </p>
          {/* Module tags */}
          {modules.length > 0 && (
            <div className="flex flex-wrap gap-[5px] mt-1.5">
              {modules.map((mod, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-[3px] rounded-[10px] text-[10px] font-semibold"
                  style={{
                    background: mod.bg,
                    color: mod.color,
                    padding: '2px 5px',
                  }}
                >
                  {mod.emoji}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="font-[DM_Mono] text-[18px] font-bold shrink-0" style={{ color: pctColor }}>
          {progressPct}%
        </span>
      </div>

      {/* Progress row */}
      <div className="flex items-center justify-between mb-[5px]">
        <span className="text-[11px] text-[var(--sl-t2)]">{progressLabel}</span>
        <span className="font-[DM_Mono] text-[13px] font-semibold" style={{ color: pctColor }}>
          {progressPct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-[3px] overflow-hidden bg-[var(--sl-s3)]">
        <div
          className="h-full rounded-[3px] transition-[width] duration-700"
          style={{
            width: `${Math.min(progressPct, 100)}%`,
            background: FUTURO_GRAD,
          }}
        />
      </div>

      {/* Narrative + XP */}
      {narrativeHint && (
        <p
          className="text-[11px] text-[var(--sl-t3)] mt-1.5 leading-[1.5] italic [&_strong]:text-[var(--sl-t2)] [&_strong]:not-italic"
          dangerouslySetInnerHTML={{ __html: narrativeHint }}
        />
      )}
      <div
        className="inline-flex items-center gap-[3px] mt-[7px] px-2 py-[3px] rounded-[10px] text-[10px] font-bold"
        style={{
          background: 'rgba(139,92,246,0.12)',
          border: '1px solid rgba(139,92,246,0.2)',
          color: FUTURO_PRIMARY_LIGHT,
        }}
      >
        {progressPct >= 100 ? `Missão completa → +${xpReward} XP` : `Próximo marco → +${xpReward} XP`}
      </div>
    </div>
  )
}
