'use client'

import { useState } from 'react'
import { FUTURO_PRIMARY_LIGHT, FUTURO_PRIMARY_BG } from '@/lib/futuro-colors'

// ── Types ──────────────────────────────────────────────────────

interface TimelineMilestone {
  id: string
  name: string
  date: string
  status: 'done' | 'current' | 'future'
  value?: string
  xpEarned?: number
  xpReward?: number
}

interface TimelineGroup {
  id: string
  icon: string
  iconBg: string
  name: string
  progressPct: number
  deadline: string
  totalXp?: number
  milestones: TimelineMilestone[]
}

// ── Mock Data ──────────────────────────────────────────────────

const MOCK_GROUPS: TimelineGroup[] = [
  {
    id: 'apt',
    icon: '🏠',
    iconBg: FUTURO_PRIMARY_BG,
    name: 'Comprar apartamento',
    progressPct: 43,
    deadline: 'Dez 2028',
    totalXp: 520,
    milestones: [
      { id: 'm1', name: 'R$ 10.000 — Primeira marca', date: 'Mar 2024', status: 'done', value: 'R$ 10.000 atingido', xpEarned: 80 },
      { id: 'm2', name: 'R$ 25.000 — Primeiro quarto', date: 'Nov 2024', status: 'done', value: 'R$ 25.000 atingido', xpEarned: 120 },
      { id: 'm3', name: 'R$ 40.000 — Metade do caminho', date: 'Projetado: Jun 2026', status: 'current', value: 'R$ 34.800 atual', xpReward: 120 },
      { id: 'm4', name: 'R$ 80.000 — Meta final', date: 'Projetado: Fev 2029', status: 'future', xpReward: 200 },
    ],
  },
  {
    id: 'europa',
    icon: '✈️',
    iconBg: 'rgba(6,182,212,0.15)',
    name: 'Viagem Europa',
    progressPct: 65,
    deadline: 'Jul 2026',
    totalXp: 200,
    milestones: [
      { id: 'e1', name: 'R$ 3.000 — Passagens garantidas', date: 'Set 2025', status: 'done', xpEarned: 50 },
      { id: 'e2', name: 'R$ 6.000 — Hospedagem coberta', date: 'Projetado: Abr 2026', status: 'current', value: 'R$ 5.200 atual', xpReward: 50 },
      { id: 'e3', name: 'R$ 8.000 — Pronto para voar', date: 'Projetado: Jun 2026', status: 'future', xpReward: 100 },
    ],
  },
  {
    id: 'mba',
    icon: '🎓',
    iconBg: 'rgba(234,179,8,0.15)',
    name: 'MBA Internacional',
    progressPct: 40,
    deadline: 'Jan 2027',
    totalXp: 180,
    milestones: [
      { id: 'mb1', name: 'Módulo 1 — Finanças Corporativas', date: 'Jun 2025', status: 'done', xpEarned: 60 },
      { id: 'mb2', name: 'Módulo 2 — Marketing Estratégico', date: 'Nov 2025', status: 'done', xpEarned: 60 },
      { id: 'mb3', name: 'Módulo 3 — Liderança', date: 'Em andamento', status: 'current', xpReward: 60 },
    ],
  },
]

// ── Component ──────────────────────────────────────────────────

export function FuturoTimelineTab() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filters = [
    { id: 'all', label: 'Todas missões' },
    { id: 'apt', label: '🏠 Apartamento' },
    { id: 'europa', label: '✈️ Europa' },
  ]

  const visibleGroups = activeFilter === 'all'
    ? MOCK_GROUPS
    : MOCK_GROUPS.filter(g => g.id === activeFilter)

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-1.5 px-4 mb-[14px] flex-wrap">
        {filters.map(f => {
          const isActive = activeFilter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className="px-3 py-[5px] rounded-[20px] text-[11px] font-medium transition-colors"
              style={{
                background: isActive ? FUTURO_PRIMARY_BG : 'var(--sl-s2)',
                border: isActive
                  ? `1px solid rgba(139,92,246,0.3)`
                  : '1px solid var(--sl-border)',
                color: isActive ? FUTURO_PRIMARY_LIGHT : 'var(--sl-t2)',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Timeline groups */}
      {visibleGroups.map(group => (
        <div key={group.id} className="px-4 mb-5">
          {/* Group header */}
          <div className="flex items-center gap-[10px] mb-3">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] shrink-0"
              style={{ background: group.iconBg }}
            >
              {group.icon}
            </div>
            <div>
              <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
                {`Missão: ${group.name.replace('Comprar ', '').replace('Viagem ', '')}`}
              </p>
              <p className="text-[11px] text-[var(--sl-t2)] mt-[1px]">
                {group.progressPct}% · {group.deadline}
                {group.totalXp ? ` · +${group.totalXp} XP total` : ''}
              </p>
            </div>
          </div>

          {/* Milestone items */}
          {group.milestones.map((ms, idx) => {
            const isLast = idx === group.milestones.length - 1
            const showTodayBefore = ms.status === 'current' && (idx === 0 || group.milestones[idx - 1].status === 'done')

            return (
              <div key={ms.id}>
                {/* Today marker */}
                {showTodayBefore && (
                  <div className="flex items-center gap-2 my-2 pl-1">
                    <span className="text-[9px] font-bold uppercase tracking-[1px] text-[#06b6d4]">
                      Hoje — Mar 2026
                    </span>
                    <div className="flex-1 h-px bg-[#06b6d4] opacity-40" />
                  </div>
                )}

                {/* Item */}
                <div className="flex gap-3 pb-3 relative">
                  {/* Vertical line */}
                  {!isLast && (
                    <div className="absolute left-[14px] top-[28px] w-[2px] bottom-0 bg-[var(--sl-border)]" />
                  )}

                  {/* Dot */}
                  <div
                    className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] relative z-[1]"
                    style={
                      ms.status === 'done'
                        ? { background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }
                        : ms.status === 'current'
                          ? { background: 'rgba(139,92,246,0.2)', border: '2px solid rgba(139,92,246,0.5)' }
                          : { background: 'var(--sl-s2)', border: '2px solid var(--sl-border)' }
                    }
                  >
                    {ms.status === 'done' ? '✓' : ms.status === 'current' ? '📍' : '🔒'}
                  </div>

                  {/* Body */}
                  <div className="flex-1 pt-[3px]">
                    <p
                      className="text-[12px] font-semibold"
                      style={{
                        color: ms.status === 'future' ? 'var(--sl-t3)' : ms.status === 'done' ? 'var(--sl-t2)' : 'var(--sl-t1)',
                        textDecoration: ms.status === 'done' ? 'line-through' : 'none',
                      }}
                    >
                      {ms.name}
                    </p>
                    <p
                      className="text-[10px] mt-[2px]"
                      style={{ color: 'var(--sl-t3)' }}
                    >
                      {ms.date}
                    </p>

                    {/* XP */}
                    <p
                      className="text-[10px] font-bold mt-[2px]"
                      style={{
                        color: FUTURO_PRIMARY_LIGHT,
                        opacity: ms.status === 'future' ? 0.5 : 1,
                      }}
                    >
                      {ms.status === 'done' && ms.xpEarned
                        ? `+${ms.xpEarned} XP ganhos ✓`
                        : ms.status === 'current' && ms.xpReward
                          ? `⚡ +${ms.xpReward} XP ao concluir`
                          : ms.xpReward
                            ? `+${ms.xpReward} XP ao concluir`
                            : null
                      }
                      {ms.status === 'future' && group.milestones.indexOf(ms) === group.milestones.length - 1
                        ? ` · Missão completa!`
                        : ''
                      }
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
