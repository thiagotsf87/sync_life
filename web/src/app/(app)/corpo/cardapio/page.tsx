'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, RefreshCw, Lock, Unlock, History, Utensils, Settings } from 'lucide-react'
import { CardapioWizard } from '@/components/corpo/CardapioWizard'
import { ModuleHeader } from '@/components/ui/module-header'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useHealthProfile, WEIGHT_GOAL_LABELS } from '@/hooks/use-corpo'
import { createTransactionFromCardapio } from '@/lib/integrations/financas'

function getWeekStart(): number {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(now.getFullYear(), now.getMonth(), diff).getTime()
}

// RN-CRP-21: macronutrientes por refeicao
interface MealItem {
  name: string
  calories: number
  prep_minutes?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
}

interface DayPlan {
  day: string
  meals: MealItem[]
}

// Schema retornado pela API /api/ai/cardapio
interface ApiMeal {
  name: string; calories: number; prep_minutes: number
  protein_g?: number; carbs_g?: number; fat_g?: number
}
interface ApiDayPlan {
  day: 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'
  breakfast: ApiMeal
  lunch: ApiMeal
  dinner: ApiMeal
  snacks?: { name: string; calories: number }[]
}

const DAY_MAP: Record<string, string> = {
  seg: 'Segunda', ter: 'Terca', qua: 'Quarta', qui: 'Quinta',
  sex: 'Sexta', sab: 'Sabado', dom: 'Domingo',
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Cafe',
  lunch: 'Almoco',
  dinner: 'Jantar',
}

const MEAL_ICONS: Record<string, string> = {
  breakfast: 'Cafe',
  lunch: 'Almoco',
  dinner: 'Jantar',
}

function apiToUiPlan(apiDays: ApiDayPlan[]): DayPlan[] {
  return apiDays.map(d => {
    const toMeal = (label: string, m: ApiMeal): MealItem => ({
      name: m.name,
      calories: m.calories,
      prep_minutes: m.prep_minutes,
      protein_g: m.protein_g,
      carbs_g: m.carbs_g,
      fat_g: m.fat_g,
    })
    const meals: MealItem[] = [
      { ...toMeal(MEAL_LABELS.breakfast, d.breakfast), name: d.breakfast.name },
      { ...toMeal(MEAL_LABELS.lunch, d.lunch), name: d.lunch.name },
      { ...toMeal(MEAL_LABELS.dinner, d.dinner), name: d.dinner.name },
      ...(d.snacks ?? []).map(s => ({ name: s.name, calories: s.calories })),
    ]
    return { day: DAY_MAP[d.day] ?? d.day, meals }
  })
}

const RESTRICTION_OPTIONS = [
  'Vegetariano', 'Vegano', 'Sem lactose', 'Sem gluten',
  'Sem carne vermelha', 'Diabetico', 'Low carb', 'Hipertensao',
]

const DAYS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
const DAYS_FULL = ['Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado', 'Domingo']
const MEAL_TYPE_LABELS = ['Cafe', 'Almoco', 'Jantar', 'Lanche', 'Lanche']

export default function CardapioPage() {
  const router = useRouter()

  const { profile } = useHealthProfile()
  const [generating, setGenerating] = useState(false)
  const [plan, setPlan] = useState<DayPlan[] | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [budget, setBudget] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [extraRestrictions, setExtraRestrictions] = useState<string[]>(
    profile?.dietary_restrictions ?? []
  )
  // RN-CRP-23: dias travados (nao regeneram)
  const [lockedDays, setLockedDays] = useState<Set<number>>(new Set())
  // RN-CRP-24: historico de cardapios gerados
  const [planHistory, setPlanHistory] = useState<DayPlan[][]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [wizardCompleted, setWizardCompleted] = useState(false)

  // Check if wizard was completed before
  useEffect(() => {
    if (profile && (profile as any).cardapio_wizard_completed) {
      setWizardCompleted(true)
    }
  }, [profile])

  useEffect(() => {
    try {
      const h = localStorage.getItem('sl_cardapio_history')
      if (h) setPlanHistory(JSON.parse(h))
    } catch { /* ignore */ }
  }, [])

  function saveToHistory(p: DayPlan[]) {
    setPlanHistory(prev => {
      const next = [p, ...prev].slice(0, 3)
      try { localStorage.setItem('sl_cardapio_history', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  function toggleLockDay(idx: number) {
    setLockedDays(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/cardapio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tdee: profile?.tdee ?? 2000,
          goal_type: profile?.weight_goal_type ?? 'maintain',
          dietary_restrictions: extraRestrictions,
          weekly_budget: budget ? Number(budget) : undefined,
          diet_type: (profile as any)?.diet_type ?? undefined,
          preferred_proteins: (profile as any)?.preferred_proteins ?? undefined,
          meals_per_day: (profile as any)?.meals_per_day ?? undefined,
          pre_workout_meal: (profile as any)?.pre_workout_meal ?? undefined,
          post_workout_meal: (profile as any)?.post_workout_meal ?? undefined,
          supplements: (profile as any)?.supplements ?? undefined,
        }),
      })
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null)
        throw new Error(errorBody?.error || `Erro ${res.status}`)
      }
      const data = await res.json()
      if (data.week) {
        const newPlan = apiToUiPlan(data.week)
        // RN-CRP-23: preserve locked days from current plan
        const merged = plan && lockedDays.size > 0
          ? newPlan.map((day, idx) => lockedDays.has(idx) ? plan[idx] : day)
          : newPlan
        setPlan(merged)
        saveToHistory(merged)
        // RN-CRP-25: offer to register budget in Financas
        if (budget) {
          const weekStart = new Date(getWeekStart()).toISOString().split('T')[0]
          toast.success('Cardapio gerado!', {
            action: {
              label: 'Registrar orcamento em Financas',
              onClick: async () => {
                await createTransactionFromCardapio({
                  weeklyBudget: Number(budget),
                  weekStart,
                }).catch(() => {})
                toast.success('Orcamento alimentar registrado!')
              },
            },
            duration: 8000,
          })
        }
      } else {
        throw new Error('Resposta inesperada da IA')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setError(msg || 'Nao foi possivel gerar o cardapio. Verifique a conexao e tente novamente.')
    } finally {
      setGenerating(false)
    }
  }

  const toggleRestriction = (r: string) => {
    setExtraRestrictions(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    )
  }

  const dayPlan = plan?.[selectedDay]
  const dayTotalCalories = dayPlan?.meals.reduce((s, m) => s + m.calories, 0) ?? 0

  // Compute day macro totals
  const dayProtein = dayPlan?.meals.reduce((s, m) => s + (m.protein_g ?? 0), 0) ?? 0
  const dayCarbs = dayPlan?.meals.reduce((s, m) => s + (m.carbs_g ?? 0), 0) ?? 0
  const dayFat = dayPlan?.meals.reduce((s, m) => s + (m.fat_g ?? 0), 0) ?? 0

  // Show wizard: first time (not completed and no plan) or user clicked edit
  if (showWizard || (!wizardCompleted && !plan)) {
    return (
      <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">
        <CardapioWizard
          initialData={profile ? {
            weight: profile.current_weight ?? 70,
            height: profile.height_cm ?? 170,
            sex: profile.biological_sex === 'female' ? 'female' : 'male',
            activityLevel: (profile.activity_level ?? 'moderate') as any,
            dietType: (profile as any).diet_type ?? 'balanced',
            preferredProteins: (profile as any).preferred_proteins ?? [],
            mealsPerDay: (profile as any).meals_per_day ?? 3,
            preWorkout: (profile as any).pre_workout_meal ?? false,
            postWorkout: (profile as any).post_workout_meal ?? false,
            supplements: (profile as any).supplements ?? [],
          } : undefined}
          onComplete={() => {
            setWizardCompleted(true)
            setShowWizard(false)
          }}
          onCancel={() => {
            setWizardCompleted(true)
            setShowWizard(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">

      <>

      {/* 1. ModuleHeader */}
      <ModuleHeader
        icon={Utensils}
        iconBg="rgba(249,115,22,.08)"
        iconColor="#f97316"
        title="Cardapio com IA"
        subtitle="Plano alimentar personalizado gerado por inteligencia artificial"
      >
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] border border-[var(--sl-border)] text-[var(--sl-t2)] text-[12px] font-medium transition-all hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)]"
        >
          <Settings size={12} />
          Editar configuracoes
        </button>
        <span className="inline-flex items-center gap-1 px-[10px] py-1 rounded-lg text-[11px] font-semibold border border-[rgba(249,115,22,.2)] bg-[rgba(249,115,22,.08)] text-[#f97316]">
          <Sparkles size={12} />
          IA
        </span>
      </ModuleHeader>

      {/* Profile summary */}
      {profile && (
        <div className="flex items-center gap-3 p-6 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] mb-5 flex-wrap sl-fade-up sl-delay-1 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center gap-4 flex-wrap">
            {profile.tdee && (
              <div>
                <p className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-wider">TDEE</p>
                <p className="font-[DM_Mono] text-[14px] font-medium text-[var(--sl-t1)]">{Math.round(profile.tdee)} kcal</p>
              </div>
            )}
            {profile.weight_goal_type && (
              <div>
                <p className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-wider">Objetivo</p>
                <p className="text-[13px] text-[var(--sl-t1)]">{WEIGHT_GOAL_LABELS[profile.weight_goal_type]}</p>
              </div>
            )}
            {profile.dietary_restrictions?.length > 0 && (
              <div>
                <p className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-wider">Restricoes</p>
                <p className="text-[12px] text-[var(--sl-t2)]">{profile.dietary_restrictions.join(', ')}</p>
              </div>
            )}
          </div>
          <div className="flex-1" />
          <button onClick={() => router.push('/corpo/peso')}
            className="text-[11px] text-[#f97316] hover:opacity-80">
            Editar perfil &rarr;
          </button>
        </div>
      )}

      {!profile?.tdee && (
        <div className="mb-5 p-6 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-[18px] sl-fade-up">
          <p className="text-[13px] text-[var(--sl-t2)]">
            Configure seu <button onClick={() => router.push('/corpo/peso')} className="text-[#f59e0b] font-semibold hover:opacity-80">perfil de saude</button> para que a IA gere cardapios personalizados para seu TDEE e objetivos.
          </p>
        </div>
      )}

      {/* Day Navigation (prototype-style with calorie counts) */}
      {plan && (
        <div className="flex gap-1 mb-5 sl-fade-up sl-delay-1">
          {DAYS_PT.map((day, idx) => {
            const dayCals = plan[idx]?.meals.reduce((s, m) => s + m.calories, 0) ?? 0
            return (
              <div key={day} className="relative flex flex-col items-center gap-0.5">
                <button
                  onClick={() => setSelectedDay(idx)}
                  className={cn(
                    'px-4 py-2 rounded-[10px] text-[12px] font-semibold border text-center transition-all min-w-[70px]',
                    selectedDay === idx
                      ? 'border-[#f59e0b] bg-[rgba(245,158,11,.08)] text-[var(--sl-t1)]'
                      : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t2)]',
                    lockedDays.has(idx) && 'opacity-70'
                  )}
                >
                  <span className="block">{day}</span>
                  <span className="block font-[DM_Mono] text-[10px] font-medium text-[#f59e0b] mt-[2px]">
                    {dayCals.toLocaleString('pt-BR')}
                  </span>
                </button>
                {/* RN-CRP-23: lock day button */}
                <button
                  onClick={() => toggleLockDay(idx)}
                  title={lockedDays.has(idx) ? 'Dia travado (clique para destravar)' : 'Travar dia'}
                  className="text-[var(--sl-t3)] hover:text-[#f59e0b] transition-colors"
                >
                  {lockedDays.has(idx)
                    ? <Lock size={10} className="text-[#f59e0b]" />
                    : <Unlock size={10} />}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Main content: Meals LEFT + Macros sidebar RIGHT */}
      <div className="grid grid-cols-[1fr_320px] gap-[14px] max-lg:grid-cols-1">

        {/* Main */}
        <div className="flex flex-col gap-4">

          {/* Generate section (no plan yet) */}
          {!plan ? (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center sl-fade-up sl-delay-2 hover:border-[var(--sl-border-h)] transition-colors">
              <div className="text-5xl mb-4"><Utensils size={48} className="mx-auto text-[#f97316] opacity-60" /></div>
              <h2 className="font-[Syne] font-bold text-[17px] text-[var(--sl-t1)] mb-2">
                Gere seu Cardapio Semanal
              </h2>
              <p className="text-[13px] text-[var(--sl-t2)] mb-6 max-w-sm mx-auto">
                A IA cria um plano alimentar de 7 dias baseado no seu perfil, restricoes e objetivos.
              </p>
              {error && (
                <p className="text-[12px] text-[#f43f5e] mb-4 max-w-sm mx-auto">{error}</p>
              )}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-[14px] font-semibold
                           bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-[#03071a] hover:opacity-90
                           disabled:opacity-60 transition-opacity"
              >
                {generating ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {generating ? 'Gerando com IA...' : 'Gerar Cardapio com IA'}
              </button>
            </div>
          ) : (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up sl-delay-2 hover:border-[var(--sl-border-h)] transition-colors">
              {/* Card title */}
              <div className="flex items-center gap-[9px] mb-5">
                <Utensils size={16} className="text-[#f59e0b]" />
                <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  {DAYS_FULL[selectedDay]}
                </h3>
                <span className="font-[DM_Mono] text-[12px] text-[#f59e0b] ml-auto">
                  {dayTotalCalories.toLocaleString('pt-BR')} kcal
                </span>
              </div>

              {/* Meals list (prototype meal layout) */}
              {dayPlan && (
                <div className="flex flex-col">
                  {dayPlan.meals.map((meal, idx) => (
                    <div key={idx} className="flex items-stretch gap-[14px] py-4 border-b border-[rgba(120,165,220,.04)] last:border-b-0">
                      {/* Meal time column */}
                      <div className="w-20 shrink-0 flex flex-col items-center justify-center p-[10px] bg-[var(--sl-s2)] rounded-xl text-center">
                        <p className="text-[9px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)]">
                          {MEAL_TYPE_LABELS[idx] ?? 'Lanche'}
                        </p>
                        <p className="font-[DM_Mono] text-[11px] text-[#f59e0b] mt-[2px]">{meal.calories} kcal</p>
                      </div>
                      {/* Meal body */}
                      <div className="flex-1">
                        <h4 className="text-[13px] font-semibold text-[var(--sl-t1)] mb-[2px]">{meal.name}</h4>
                        {meal.prep_minutes != null && (
                          <p className="text-[11px] text-[var(--sl-t3)] mb-[6px]">{meal.prep_minutes} min de preparo</p>
                        )}
                        {(meal.protein_g != null || meal.carbs_g != null || meal.fat_g != null) && (
                          <div className="flex gap-[6px]">
                            {meal.protein_g != null && (
                              <span className="inline-flex items-center gap-1 px-[10px] py-[3px] rounded-md text-[10px] font-semibold bg-[rgba(59,130,246,.1)] text-[#3b82f6]">
                                P: {meal.protein_g}g
                              </span>
                            )}
                            {meal.carbs_g != null && (
                              <span className="inline-flex items-center gap-1 px-[10px] py-[3px] rounded-md text-[10px] font-semibold bg-[rgba(16,185,129,.1)] text-[#10b981]">
                                C: {meal.carbs_g}g
                              </span>
                            )}
                            {meal.fat_g != null && (
                              <span className="inline-flex items-center gap-1 px-[10px] py-[3px] rounded-md text-[10px] font-semibold bg-[rgba(245,158,11,.1)] text-[#f59e0b]">
                                G: {meal.fat_g}g
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Legal disclaimer */}
          <div className="p-3 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl">
            <p className="text-[11px] text-[var(--sl-t3)] text-center">
              Este cardapio e uma sugestao gerada por IA e <strong className="text-[var(--sl-t2)]">nao substitui nutricionista</strong>. Consulte um profissional de saude para orientacao personalizada.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-[14px]">

          {/* Resumo Diario (macros) */}
          {plan && dayPlan && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 hover:border-[var(--sl-border-h)] transition-colors">
              <div className="flex items-center gap-[9px] mb-[18px]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  Resumo Diario
                </h3>
              </div>
              <div className="text-center mb-[14px]">
                <span className="font-[DM_Mono] text-[28px] font-medium text-[#f59e0b]">{dayTotalCalories.toLocaleString('pt-BR')}</span>
                <span className="text-[12px] text-[var(--sl-t3)]"> kcal</span>
              </div>
              <div className="flex flex-col gap-[10px]">
                {[
                  { label: 'Proteina', value: `${dayProtein}g`, color: '#3b82f6', pct: dayProtein > 0 ? Math.min(100, (dayProtein / 200) * 100) : 0 },
                  { label: 'Carboidratos', value: `${dayCarbs}g`, color: '#10b981', pct: dayCarbs > 0 ? Math.min(100, (dayCarbs / 300) * 100) : 0 },
                  { label: 'Gordura', value: `${dayFat}g`, color: '#f59e0b', pct: dayFat > 0 ? Math.min(100, (dayFat / 100) * 100) : 0 },
                ].map(macro => (
                  <div key={macro.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px]" style={{ color: macro.color }}>{macro.label}</span>
                      <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t1)]">{macro.value}</span>
                    </div>
                    <div className="h-[6px] bg-[var(--sl-s3)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${macro.pct}%`, background: macro.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 hover:border-[var(--sl-border-h)] transition-colors">
            <div className="flex items-center gap-[9px] mb-[18px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sl-t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" /><path d="M12 1v6" /><path d="M12 17v6" /><path d="m4.22 4.22 4.24 4.24" /><path d="m15.54 15.54 4.24 4.24" /><path d="M1 12h6" /><path d="M17 12h6" /><path d="m4.22 19.78 4.24-4.24" /><path d="m15.54 8.46 4.24-4.24" />
              </svg>
              <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                Preferencias
              </h3>
            </div>

            <div className="mb-3">
              <label className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-1 block">Orcamento semanal</label>
              <input type="number" value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="Ex: 200"
                className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)] mb-[6px] block">Restricoes</label>
              <div className="flex flex-wrap gap-1">
                {RESTRICTION_OPTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => toggleRestriction(r)}
                    className={cn(
                      'px-[10px] py-1 rounded-[8px] text-[10px] font-semibold border transition-all',
                      extraRestrictions.includes(r)
                        ? 'border-[#f59e0b] bg-[rgba(245,158,11,.08)] text-[var(--sl-t1)]'
                        : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Regenerate button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full inline-flex items-center justify-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                       bg-[#f97316] text-white hover:brightness-110 hover:-translate-y-px
                       transition-all shadow-[0_6px_20px_rgba(249,115,22,.15)] disabled:opacity-50"
          >
            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Gerando...' : 'Regenerar Cardapio'}
          </button>

          {/* RN-CRP-24: Historico de cardapios */}
          {planHistory.length > 0 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 hover:border-[var(--sl-border-h)] transition-colors">
              <button
                onClick={() => setShowHistory(h => !h)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] flex items-center gap-2">
                  <History size={13} />
                  Historico ({planHistory.length})
                </h3>
                <span className="text-[11px] text-[var(--sl-t3)]">{showHistory ? '\u25B2' : '\u25BC'}</span>
              </button>
              {showHistory && (
                <div className="flex flex-col gap-2 mt-3">
                  {planHistory.map((hist, hIdx) => (
                    <button
                      key={hIdx}
                      onClick={() => { setPlan(hist); setShowHistory(false) }}
                      className="text-left p-2 rounded-[8px] bg-[var(--sl-s2)] border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] transition-colors"
                    >
                      <p className="text-[11px] font-semibold text-[var(--sl-t1)]">Cardapio #{planHistory.length - hIdx}</p>
                      <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">{hist[0]?.meals?.[0]?.name ?? '7 dias'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      </>
    </div>
  )
}
