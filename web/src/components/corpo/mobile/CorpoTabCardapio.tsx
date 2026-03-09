'use client'

import { useMemo } from 'react'
import {
  MEAL_SLOT_CONFIG, calcCaloriesTarget,
  type Meal, type MealSlot, type HealthProfile,
} from '@/hooks/use-corpo'

const CORPO_COLOR = '#f97316'
const CORPO_BG = 'rgba(249,115,22,0.12)'

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'snack', 'dinner']

const RING_R = 46
const RING_DASHARRAY = 2 * Math.PI * RING_R // ≈ 289

interface CorpoTabCardapioProps {
  meals: Meal[]
  profile: HealthProfile | null
  onOpenMealModal: (slot: MealSlot) => void
}

export function CorpoTabCardapio({ meals, profile, onOpenMealModal }: CorpoTabCardapioProps) {
  const tdee = profile?.tdee ? Math.round(profile.tdee) : null
  const calorieTarget = tdee && profile?.weight_goal_type
    ? Math.round(calcCaloriesTarget(tdee, profile.weight_goal_type))
    : tdee ?? 2000

  const totalConsumed = useMemo(
    () => meals.reduce((s, m) => s + m.calories_kcal, 0),
    [meals]
  )
  const remaining = calorieTarget - totalConsumed
  const pct = Math.min((totalConsumed / calorieTarget) * 100, 100)
  const dashOffset = RING_DASHARRAY * (1 - pct / 100)

  const totalProtein = meals.reduce((s, m) => s + (m.protein_g ?? 0), 0)
  const totalCarbs = meals.reduce((s, m) => s + (m.carbs_g ?? 0), 0)
  const totalFat = meals.reduce((s, m) => s + (m.fat_g ?? 0), 0)
  const macroSum = totalProtein + totalCarbs + totalFat

  const mealBySlot = useMemo(() => {
    const map: Partial<Record<MealSlot, Meal>> = {}
    meals.forEach((m) => { map[m.meal_slot] = m })
    return map
  }, [meals])

  return (
    <div className="pb-6">
      {/* Calorie ring card */}
      <div className="mx-4 mb-3 rounded-2xl p-4" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
        <div className="flex items-center justify-around mb-4">
          {/* META */}
          <div className="text-center">
            <p className="text-[11px] text-[var(--sl-t2)] mb-1">META</p>
            <p className="font-[DM_Mono] text-[18px] font-bold text-[var(--sl-t1)]">{calorieTarget}</p>
            <p className="text-[10px] text-[var(--sl-t3)]">kcal</p>
          </div>

          {/* SVG Ring */}
          <div className="relative" style={{ width: 110, height: 110 }}>
            <svg viewBox="0 0 110 110" style={{ width: 110, height: 110, transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r={RING_R} fill="none" stroke="var(--sl-s3)" strokeWidth="10" />
              <circle
                cx="55" cy="55" r={RING_R} fill="none"
                stroke={CORPO_COLOR} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={RING_DASHARRAY}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-[DM_Mono] text-[22px] font-bold" style={{ color: CORPO_COLOR }}>{totalConsumed}</p>
              <p className="text-[10px] text-[var(--sl-t2)]">kcal</p>
            </div>
          </div>

          {/* RESTANTE */}
          <div className="text-center">
            <p className="text-[11px] text-[var(--sl-t2)] mb-1">RESTANTE</p>
            <p className="font-[DM_Mono] text-[18px] font-bold" style={{ color: remaining >= 0 ? '#10b981' : '#f43f5e' }}>
              {Math.abs(remaining)}
            </p>
            <p className="text-[10px] text-[var(--sl-t3)]">kcal</p>
          </div>
        </div>

        {/* Macros bar */}
        {macroSum > 0 && (
          <>
            <p className="text-[11px] text-[var(--sl-t2)] mb-1.5">Macronutrientes</p>
            <div className="flex h-[10px] rounded-full overflow-hidden mb-2">
              <div style={{ width: `${(totalCarbs / macroSum) * 100}%`, background: '#0055ff' }} />
              <div style={{ width: `${(totalProtein / macroSum) * 100}%`, background: '#10b981' }} />
              <div style={{ width: `${(totalFat / macroSum) * 100}%`, background: '#f59e0b' }} />
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: `Carbos ${totalCarbs.toFixed(0)}g`, color: '#0055ff' },
                { label: `Proteína ${totalProtein.toFixed(0)}g`, color: '#10b981' },
                { label: `Gordura ${totalFat.toFixed(0)}g`, color: '#f59e0b' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[11px] text-[var(--sl-t2)]">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Meal slots */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pb-2">
        REFEIÇÕES DE HOJE
      </p>
      <div style={{ background: 'var(--sl-s1)', borderTop: '1px solid var(--sl-border)', borderBottom: '1px solid var(--sl-border)' }}>
        {SLOTS.map((slot) => {
          const cfg = MEAL_SLOT_CONFIG[slot]
          const meal = mealBySlot[slot]
          return (
            <button
              key={slot}
              onClick={() => onOpenMealModal(slot)}
              className="w-full flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)] last:border-b-0 text-left transition-colors hover:bg-[var(--sl-s2)]"
              style={!meal ? { opacity: 0.55 } : undefined}
            >
              <div
                className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[18px] flex-shrink-0"
                style={{ background: meal ? cfg.bg : 'var(--sl-s2)' }}
              >
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-[var(--sl-t1)]">
                  {cfg.label}
                  {meal?.meal_time && <span className="text-[var(--sl-t2)]"> · {meal.meal_time}</span>}
                </p>
                {meal ? (
                  <p className="text-[12px] text-[var(--sl-t2)] mt-[1px] truncate">{meal.description}</p>
                ) : (
                  <p className="text-[12px] text-[var(--sl-t3)] mt-[1px]">Toque para adicionar</p>
                )}
              </div>
              {meal ? (
                <p className="font-[DM_Mono] text-[13px] text-[var(--sl-t2)] flex-shrink-0">
                  {meal.calories_kcal} kcal
                </p>
              ) : (
                <span className="text-[18px] text-[var(--sl-t3)]">+</span>
              )}
            </button>
          )
        })}
      </div>

      {/* AI suggestion — PRO */}
      <div
        className="mx-4 mt-3 rounded-2xl p-4"
        style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}
      >
        <div className="flex gap-[10px] mb-2.5">
          <span className="text-[18px]">🤖</span>
          <div>
            <p className="text-[13px] font-semibold text-[var(--sl-t1)]">Sugestão do Coach IA</p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-[2px]">
              {remaining > 0
                ? `${remaining} kcal e ${Math.round(remaining * 0.25 / 4)}g proteína disponíveis`
                : 'Meta calórica atingida!'}
            </p>
          </div>
        </div>
        {remaining > 50 ? (
          <div
            className="rounded-[10px] p-[10px] flex items-center gap-[10px]"
            style={{ background: 'var(--sl-s2)' }}
          >
            <span className="text-[20px]">🥗</span>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[var(--sl-t1)]">Salada + Filé de frango</p>
              <p className="text-[12px] text-[var(--sl-t2)]">~340 kcal · 35g proteína</p>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-[var(--sl-t2)]">Você está dentro da meta calórica hoje! 🎉</p>
        )}
        <p className="text-[10px] text-[var(--sl-t3)] text-right mt-1.5">PRO · Coach IA</p>
      </div>
    </div>
  )
}
