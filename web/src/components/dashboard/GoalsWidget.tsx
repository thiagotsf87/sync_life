'use client'

import { useRouter } from 'next/navigation'
import { calcProgress } from '@/hooks/use-metas'
import { fmt } from '@/components/dashboard/dashboard-utils'

interface Goal {
  id: string
  name: string
  icon: string
  goal_type: string
  current_amount: number
  target_amount: number
  target_date?: string | null
  status: string
}

export interface GoalsWidgetProps {
  topGoals: Goal[]
  loading: boolean
}

const GOAL_COLORS = ['#10b981', '#06b6d4', '#f97316', '#a855f7', '#f43f5e', '#3b82f6']

export function GoalsWidget({ topGoals, loading }: GoalsWidgetProps) {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up sl-delay-2 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-[18px]">
        <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] flex items-center gap-[9px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
          Metas Ativas
        </span>
        <button className="text-[12px] font-medium text-[#6366f1] hover:opacity-70 transition-opacity cursor-pointer"
          onClick={() => router.push('/futuro')}>{topGoals.length} objetivos</button>
      </div>
      {loading
        ? <div className="flex flex-col gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-[var(--sl-s2)] animate-pulse" />)}</div>
        : topGoals.length === 0
          ? <p className="text-[13px] text-[var(--sl-t3)] text-center py-6">Nenhuma meta ativa</p>
          : (
            <div className="flex flex-col gap-2.5">
              {topGoals.map((goal, idx) => {
                const pct = calcProgress(goal.current_amount, goal.target_amount)
                const pctColor = pct >= 50 ? '#10b981' : '#f59e0b'
                const accentColor = GOAL_COLORS[idx % GOAL_COLORS.length]
                return (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3 py-3 px-3.5 bg-[var(--sl-s2)] rounded-xl cursor-pointer transition-colors hover:bg-[var(--sl-s3)]"
                    style={{ borderLeft: `3px solid ${accentColor}` }}
                    onClick={() => router.push(`/futuro/${goal.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">{goal.name}</div>
                      <div className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                        {goal.goal_type === 'monetary'
                          ? `${fmt(goal.current_amount)} / ${fmt(goal.target_amount)}`
                          : `${pct}% conclu\u00eddo`}
                      </div>
                    </div>
                    <div className="w-[60px] h-1 bg-[var(--sl-s3)] rounded-[2px] overflow-hidden shrink-0">
                      <div className="h-full rounded-[2px]" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #0055ff)' }} />
                    </div>
                    <span className="font-[DM_Mono] text-[14px] font-medium shrink-0" style={{ color: pctColor }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          )
      }
    </div>
  )
}
