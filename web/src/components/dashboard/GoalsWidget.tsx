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

export function GoalsWidget({ topGoals, loading }: GoalsWidgetProps) {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-2 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-[18px]">
        <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🎯 Metas em Destaque</span>
        <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
          onClick={() => router.push('/futuro')}>Ver todas →</button>
      </div>
      {loading
        ? <div className="flex flex-col gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-[var(--sl-s2)] animate-pulse" />)}</div>
        : topGoals.length === 0
          ? <p className="text-[13px] text-[var(--sl-t3)] text-center py-6">Nenhuma meta ativa</p>
          : (
            <div className="flex flex-col gap-3.5">
              {topGoals.map(goal => {
                const pct = calcProgress(goal.current_amount, goal.target_amount)
                const isDelayed = pct < 40
                const pctColor = pct >= 50 ? '#10b981' : '#f59e0b'
                const dateLabel = goal.target_date
                  ? new Date(goal.target_date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
                  : null
                return (
                  <div key={goal.id} className="flex flex-col gap-1.5 cursor-pointer" onClick={() => router.push(`/futuro/${goal.id}`)}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[20px] flex-shrink-0">{goal.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[var(--sl-t1)] truncate">{goal.name}</div>
                        <div className="text-[11px] text-[var(--sl-t3)]">
                          {goal.goal_type === 'monetary'
                            ? `${fmt(goal.current_amount)} de ${fmt(goal.target_amount)}${dateLabel ? ` \u00b7 ${dateLabel}` : ''}`
                            : `${pct}% conclu\u00eddo${dateLabel ? ` \u00b7 ${dateLabel}` : ''}`}
                        </div>
                      </div>
                      <span className="font-[DM_Mono] text-[14px] font-medium flex-shrink-0" style={{ color: pctColor }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden bg-[var(--sl-s3)]">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #0055ff)' }} />
                    </div>
                    {isDelayed && (
                      <div className="text-[11px] px-2 py-1.5 rounded-[6px]"
                        style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        ⚠ Meta abaixo do ritmo necessário
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
      }
    </div>
  )
}
