'use client'

import { useRouter } from 'next/navigation'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { fmtShort, fmt } from '@/components/dashboard/dashboard-utils'

interface SparklinePoint {
  day: string
  saldo: number
}

interface Recurrence {
  name: string
  amount: number
  daysLeft: number
}

export interface ProjectionWidgetProps {
  sparklineData: SparklinePoint[]
  balance: number
  projectedBalance: number
  nextRecurrence: Recurrence | undefined
}

export function ProjectionWidget({ sparklineData, balance, projectedBalance, nextRecurrence }: ProjectionWidgetProps) {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-1 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">📈 Projeção de Saldo</span>
        <button className="text-[11px] text-[#10b981] hover:opacity-70 transition-opacity"
          onClick={() => router.push('/financas/planejamento')}>Planejamento →</button>
      </div>
      <p className="text-[11px] text-[var(--sl-t3)] mb-3">Próximos 30 dias</p>
      <div className="h-[60px] mx-[-4px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="saldo" stroke="#10b981" strokeWidth={2} fill="url(#sparkGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between mt-2.5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">Hoje</div>
          <div className="font-[DM_Mono] text-[15px] text-[var(--sl-t2)]">{fmtShort(balance > 0 ? balance : 0)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">30 dias</div>
          <div className="font-[DM_Mono] text-[15px]" style={{ color: '#10b981' }}>{fmtShort(projectedBalance)}</div>
        </div>
      </div>
      {nextRecurrence && nextRecurrence.daysLeft <= 7 && (
        <div className="mt-2.5 p-2 rounded-[8px] text-[12px] text-[var(--sl-t3)] bg-[var(--sl-s2)]">
          ⚠ {nextRecurrence.name} {fmt(nextRecurrence.amount)} vence {nextRecurrence.daysLeft === 0 ? 'hoje' : `em ${nextRecurrence.daysLeft} ${nextRecurrence.daysLeft === 1 ? 'dia' : 'dias'}`}
        </div>
      )}
    </div>
  )
}
