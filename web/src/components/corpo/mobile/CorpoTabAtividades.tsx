'use client'

import { useMemo, useState } from 'react'
import { ACTIVITY_TYPES, type Activity } from '@/hooks/use-corpo'

const CORPO_COLOR = '#f97316'
const CORPO_BG = 'rgba(249,115,22,0.12)'

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const TYPE_FILTERS = [
  { label: 'Todos', type: null },
  { label: '🏋️ Musculação', type: 'weightlifting' },
  { label: '🏃 Cardio', type: 'running' },
  { label: '🧘 Yoga', type: 'yoga' },
]

function getActivityIcon(type: string): string {
  return ACTIVITY_TYPES.find((a) => a.type === type)?.icon ?? '🏅'
}
function getActivityLabel(type: string): string {
  return ACTIVITY_TYPES.find((a) => a.type === type)?.label ?? type
}
function formatRelDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return 'Hoje'
  const yest = new Date(now); yest.setDate(now.getDate() - 1)
  if (d.toDateString() === yest.toDateString()) return 'Ontem'
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff < 7) return `${diff === 0 ? 'Hoje' : diff + 'd atrás'}`
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function isCardioType(type: string): boolean {
  return ['running', 'cycling', 'swimming', 'walking'].includes(type)
}

interface CorpoTabAtividadesProps {
  activities: Activity[]
  weekActivities: Activity[]
  onOpenModal: () => void
}

export function CorpoTabAtividades({ activities, weekActivities, onOpenModal }: CorpoTabAtividadesProps) {
  const [filterType, setFilterType] = useState<string | null>(null)

  // Daily minutes for current week (Mon=0…Sun=6 in our array)
  const dailyMinutes = useMemo(() => {
    const result = [0, 0, 0, 0, 0, 0, 0]
    const now = new Date()
    // Monday of this week
    const dayOfWeek = now.getDay() // 0=Sun
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    activities.forEach((a) => {
      const d = new Date(a.recorded_at)
      if (d >= monday) {
        const idx = (d.getDay() + 6) % 7 // Mon=0…Sun=6
        result[idx] += a.duration_minutes
      }
    })
    return result
  }, [activities])

  const maxMin = Math.max(...dailyMinutes, 1)
  const weekGoal = 4
  const doneCount = weekActivities.length

  const filtered = filterType
    ? activities.filter((a) => {
        if (filterType === 'other') return !['weightlifting', 'running', 'cycling', 'swimming', 'walking', 'yoga'].includes(a.type)
        if (filterType === 'running') return isCardioType(a.type)
        return a.type === filterType
      })
    : activities

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3">
        <span className="text-[13px] text-[var(--sl-t2)]">{doneCount} de {weekGoal} esta semana</span>
      </div>

      {/* Week bar chart */}
      <div
        className="mx-4 mb-3 rounded-2xl p-4"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-[14px] font-semibold text-[var(--sl-t1)]">Esta semana</span>
          <span
            className="text-[11px] font-medium px-2 py-[3px] rounded-full"
            style={{ background: CORPO_BG, color: CORPO_COLOR }}
          >
            {doneCount} de {weekGoal} metas
          </span>
        </div>
        <div className="flex items-end justify-around h-[72px] gap-1">
          {WEEK_DAYS.map((day, i) => {
            const mins = dailyMinutes[i]
            const barH = mins > 0 ? Math.max((mins / maxMin) * 52, 10) : 10
            const isEmpty = mins === 0
            return (
              <div key={day} className="flex flex-col items-center gap-[3px]">
                <div
                  className="w-7 rounded-t-[5px]"
                  style={{
                    height: barH,
                    background: isEmpty ? 'var(--sl-s2)' : CORPO_COLOR,
                    border: isEmpty ? '1px dashed rgba(249,115,22,0.3)' : 'none',
                    opacity: isEmpty ? 1 : 0.9,
                  }}
                />
                <span className="text-[9px]" style={{ color: isEmpty ? 'var(--sl-t3)' : 'var(--sl-t2)' }}>
                  {day}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-[6px] px-4 pb-3 overflow-x-auto scrollbar-hide">
        {TYPE_FILTERS.map(({ label, type }) => {
          const active = filterType === type
          return (
            <button
              key={label}
              onClick={() => setFilterType(type)}
              className="px-[14px] py-[7px] rounded-full text-[13px] font-medium whitespace-nowrap flex-shrink-0"
              style={{
                background: active ? CORPO_COLOR : 'var(--sl-s1)',
                color: active ? '#000' : 'var(--sl-t2)',
                border: active ? 'none' : '1px solid var(--sl-border)',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Activity list */}
      {filtered.length === 0 ? (
        <div className="mx-4 py-8 text-center">
          <p className="text-[32px] mb-3">🏃</p>
          <p className="text-[14px] font-semibold text-[var(--sl-t1)] mb-1">Nenhuma atividade</p>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">Registre seu primeiro treino</p>
          <button
            onClick={onOpenModal}
            className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold text-black"
            style={{ background: CORPO_COLOR }}
          >
            + Registrar
          </button>
        </div>
      ) : (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pb-2">
            RECENTES
          </p>
          <div style={{ background: 'var(--sl-s1)', borderTop: '1px solid var(--sl-border)', borderBottom: '1px solid var(--sl-border)' }}>
            {filtered.slice(0, 15).map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)] last:border-b-0">
                <div
                  className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] flex-shrink-0"
                  style={{ background: CORPO_BG }}
                >
                  {getActivityIcon(a.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[var(--sl-t1)] truncate">
                    {getActivityLabel(a.type)}
                    {a.notes ? ` — ${a.notes}` : ''}
                  </p>
                  <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">
                    {formatRelDate(a.recorded_at)} · {a.duration_minutes} min
                  </p>
                  <div className="flex gap-[6px] mt-1">
                    <span
                      className="text-[11px] px-[7px] py-[2px] rounded-[8px]"
                      style={{ background: CORPO_BG, color: CORPO_COLOR }}
                    >
                      {isCardioType(a.type) ? '❤️ Cardio' : a.type === 'yoga' ? '🧘 Yoga' : '💪 Força'}
                    </span>
                    {a.calories_burned && (
                      <span
                        className="text-[11px] px-[7px] py-[2px] rounded-[8px]"
                        style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e' }}
                      >
                        🔥 {Math.round(a.calories_burned)} kcal
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
