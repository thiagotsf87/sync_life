'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Goal } from '@/hooks/use-metas'
import { calcProgress } from '@/hooks/use-metas'

interface SimuladorAportesProps {
  goals: Goal[]
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

function monthsUntil(current: number, target: number, monthly: number): number | null {
  if (monthly <= 0 || current >= target) return null
  return Math.ceil((target - current) / monthly)
}

function addMonths(d: Date, months: number): Date {
  const r = new Date(d)
  r.setMonth(r.getMonth() + months)
  return r
}

interface Scenario {
  label: string
  monthly: number
  months: number | null
  date: Date | null
  color: string
  bg: string
}

export function SimuladorAportes({ goals }: SimuladorAportesProps) {
  const activeGoals = goals.filter(g => g.status === 'active')
  const [selectedId, setSelectedId] = useState<string>(activeGoals[0]?.id ?? '')
  const [slider, setSlider] = useState(500)

  const goal = activeGoals.find(g => g.id === selectedId) ?? activeGoals[0]

  const today = new Date()

  const scenarios = useMemo<Scenario[]>(() => {
    if (!goal) return []

    const current = goal.current_amount
    const target = goal.target_amount
    const currentMonthly = goal.monthly_contribution

    // Aporte para cumprir prazo
    const prazoMonths = goal.target_date
      ? Math.max(1, Math.ceil((new Date(goal.target_date + 'T00:00:00').getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : null
    const monthlyForPrazo = prazoMonths ? Math.ceil((target - current) / prazoMonths) : null

    return [
      {
        label: 'Aporte selecionado',
        monthly: slider,
        months: monthsUntil(current, target, slider),
        date: monthsUntil(current, target, slider) !== null ? addMonths(today, monthsUntil(current, target, slider)!) : null,
        color: '#10b981',
        bg: 'rgba(16,185,129,.08)',
      },
      {
        label: 'Ritmo atual',
        monthly: currentMonthly,
        months: monthsUntil(current, target, currentMonthly),
        date: monthsUntil(current, target, currentMonthly) !== null ? addMonths(today, monthsUntil(current, target, currentMonthly)!) : null,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,.08)',
      },
      {
        label: 'Para cumprir prazo',
        monthly: monthlyForPrazo ?? 0,
        months: prazoMonths,
        date: prazoMonths !== null ? addMonths(today, prazoMonths) : null,
        color: '#0055ff',
        bg: 'rgba(0,85,255,.08)',
      },
      {
        label: 'Sem aportes',
        monthly: 0,
        months: null,
        date: null,
        color: '#f43f5e',
        bg: 'rgba(244,63,94,.08)',
      },
    ]
  }, [goal, slider, today])

  if (activeGoals.length === 0) {
    return (
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 flex items-center justify-center min-h-[180px]">
        <p className="text-[13px] text-[var(--sl-t3)]">Nenhuma meta ativa para simular.</p>
      </div>
    )
  }

  const pct = goal ? calcProgress(goal.current_amount, goal.target_amount) : 0

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up">
      <h3 className="font-[Syne] font-extrabold text-[14px] text-[var(--sl-t1)] mb-4">
        🧮 Simulador de Aportes
      </h3>

      {/* Seletor de meta */}
      {activeGoals.length > 1 && (
        <div className="mb-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)] block mb-1.5">Meta</label>
          <div className="flex flex-wrap gap-1.5">
            {activeGoals.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedId(g.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[12px] font-semibold border transition-all',
                  selectedId === g.id
                    ? 'border-[#10b981] bg-[rgba(16,185,129,.08)] text-[#10b981]'
                    : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]',
                )}
              >
                <span>{g.icon}</span>
                <span>{g.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info atual */}
      {goal && (
        <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[var(--sl-s2)] mb-4">
          <span className="text-2xl">{goal.icon}</span>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-[var(--sl-t1)]">{goal.name}</p>
            <p className="text-[11px] text-[var(--sl-t3)]">
              {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)} · {pct}%
            </p>
          </div>
        </div>
      )}

      {/* Slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Aporte mensal</label>
          <span className="font-[DM_Mono] font-medium text-[15px] text-[#10b981]">
            {formatCurrency(slider)}
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={Math.max(5000, (goal?.target_amount ?? 5000) / 10)}
          step={50}
          value={slider}
          onChange={e => setSlider(Number(e.target.value))}
          className="w-full accent-[#10b981] cursor-pointer"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[var(--sl-t3)] font-[DM_Mono]">R$ 100</span>
          <span className="text-[10px] text-[var(--sl-t3)] font-[DM_Mono]">
            {formatCurrency(Math.max(5000, (goal?.target_amount ?? 5000) / 10))}
          </span>
        </div>
      </div>

      {/* Cenários */}
      <div className="flex flex-col gap-2">
        {scenarios.map((sc, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-[11px]"
            style={{ background: sc.bg, border: `1px solid ${sc.color}25` }}
          >
            <div>
              <p className="text-[12px] font-semibold" style={{ color: sc.color }}>{sc.label}</p>
              {sc.monthly > 0 && (
                <p className="text-[11px] text-[var(--sl-t3)] font-[DM_Mono]">
                  {formatCurrency(sc.monthly)}/mês
                </p>
              )}
            </div>
            <div className="text-right">
              {sc.date ? (
                <>
                  <p className="font-[DM_Mono] font-bold text-[13px]" style={{ color: sc.color }}>
                    {formatDate(sc.date)}
                  </p>
                  {sc.months !== null && (
                    <p className="text-[11px] text-[var(--sl-t3)]">{sc.months} meses</p>
                  )}
                </>
              ) : (
                <p className="font-[DM_Mono] text-[12px]" style={{ color: sc.color }}>
                  {sc.monthly === 0 ? 'Não concluirá' : 'Já concluída'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
