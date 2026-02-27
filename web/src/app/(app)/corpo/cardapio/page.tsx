'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { useHealthProfile, WEIGHT_GOAL_LABELS } from '@/hooks/use-corpo'

interface MealItem {
  name: string
  ingredients: string[]
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

interface DayPlan {
  day: string
  meals: MealItem[]
}

const MEAL_NAMES = ['☕ Café da manhã', '🥗 Almoço', '🍎 Lanche', '🍽️ Jantar', '🥛 Lanche da noite']

const RESTRICTION_OPTIONS = [
  'Vegetariano', 'Vegano', 'Sem lactose', 'Sem glúten',
  'Sem carne vermelha', 'Diabético', 'Low carb', 'Hipertensão',
]

const DAYS_PT = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

function buildMockPlan(tdee: number, goal: string, restrictions: string[]): DayPlan[] {
  const target = goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 500 : tdee
  const perMeal = Math.round(target / 5)

  return DAYS_PT.map(day => ({
    day,
    meals: MEAL_NAMES.map((mealName, idx) => ({
      name: mealName,
      ingredients: ['Alimento 1', 'Alimento 2', 'Alimento 3'],
      calories: Math.round(perMeal * [0.25, 0.35, 0.10, 0.25, 0.05][idx]),
      protein_g: Math.round(perMeal * [0.25, 0.35, 0.10, 0.25, 0.05][idx] * 0.25 / 4),
      carbs_g: Math.round(perMeal * [0.25, 0.35, 0.10, 0.25, 0.05][idx] * 0.50 / 4),
      fat_g: Math.round(perMeal * [0.25, 0.35, 0.10, 0.25, 0.05][idx] * 0.25 / 9),
    })),
  }))
}

export default function CardapioPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { profile } = useHealthProfile()

  const [generating, setGenerating] = useState(false)
  const [plan, setPlan] = useState<DayPlan[] | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [budget, setBudget] = useState('')
  const [extraRestrictions, setExtraRestrictions] = useState<string[]>(
    profile?.dietary_restrictions ?? []
  )

  async function handleGenerate() {
    setGenerating(true)
    try {
      // TODO: Replace with real AI call to /api/ai/cardapio
      // For MVP, using deterministic mock based on profile
      await new Promise(r => setTimeout(r, 1500)) // simulate API delay
      const tdee = profile?.tdee ?? 2000
      const goal = profile?.weight_goal_type ?? 'maintain'
      const mock = buildMockPlan(tdee, goal, extraRestrictions)
      setPlan(mock)
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

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => router.push('/corpo')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Corpo
        </button>
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl flex-1',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          🍽️ Cardápio com IA
        </h1>
      </div>

      {/* Profile summary */}
      {profile && (
        <div className="flex items-center gap-3 p-4 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl mb-5 flex-wrap">
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
                <p className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-wider">Restrições</p>
                <p className="text-[12px] text-[var(--sl-t2)]">{profile.dietary_restrictions.join(', ')}</p>
              </div>
            )}
          </div>
          <div className="flex-1" />
          <button onClick={() => router.push('/corpo/peso')}
            className="text-[11px] text-[#f97316] hover:opacity-80">
            Editar perfil →
          </button>
        </div>
      )}

      {!profile?.tdee && (
        <div className="mb-5 p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl">
          <p className="text-[13px] text-[var(--sl-t2)]">
            💡 Configure seu <button onClick={() => router.push('/corpo/peso')} className="text-[#f59e0b] font-semibold hover:opacity-80">perfil de saúde</button> para que a IA gere cardápios personalizados para seu TDEE e objetivos.
          </p>
        </div>
      )}

      <div className="grid grid-cols-[1fr_280px] gap-5 max-lg:grid-cols-1">

        {/* Main */}
        <div className="flex flex-col gap-4">

          {/* Generate section */}
          {!plan ? (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🍽️</div>
              <h2 className="font-[Syne] font-bold text-[17px] text-[var(--sl-t1)] mb-2">
                Gere seu Cardápio Semanal
              </h2>
              <p className="text-[13px] text-[var(--sl-t2)] mb-6 max-w-sm mx-auto">
                A IA cria um plano alimentar de 7 dias baseado no seu perfil, restrições e objetivos.
              </p>
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
                {generating ? 'Gerando cardápio...' : 'Gerar Cardápio'}
              </button>
            </div>
          ) : (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
              {/* Day selector */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">📅 Cardápio Semanal</h2>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-semibold border border-[#f59e0b]/50 text-[#f59e0b] hover:bg-[#f59e0b]/10 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw size={12} className={generating ? 'animate-spin' : ''} />
                  Regenerar
                </button>
              </div>

              <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
                {DAYS_PT.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(idx)}
                    className={cn(
                      'px-3 py-1.5 rounded-[8px] text-[11px] font-medium border whitespace-nowrap transition-all shrink-0',
                      selectedDay === idx
                        ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[var(--sl-t1)]'
                        : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Meals */}
              {dayPlan && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">{DAYS_PT[selectedDay]}</h3>
                    <span className="font-[DM_Mono] text-[12px] text-[#f59e0b]">{dayTotalCalories} kcal total</span>
                  </div>
                  {dayPlan.meals.map((meal, idx) => (
                    <div key={idx} className="p-3 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[12px] font-semibold text-[var(--sl-t1)]">{meal.name}</p>
                        <span className="font-[DM_Mono] text-[11px] text-[#f97316]">{meal.calories} kcal</span>
                      </div>
                      <p className="text-[11px] text-[var(--sl-t3)] mb-1.5">{meal.ingredients.join(', ')}</p>
                      <div className="flex gap-3">
                        <span className="text-[10px] text-[var(--sl-t3)]">P: <span className="text-[var(--sl-t2)]">{meal.protein_g}g</span></span>
                        <span className="text-[10px] text-[var(--sl-t3)]">C: <span className="text-[var(--sl-t2)]">{meal.carbs_g}g</span></span>
                        <span className="text-[10px] text-[var(--sl-t3)]">G: <span className="text-[var(--sl-t2)]">{meal.fat_g}g</span></span>
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
              ⚠️ Este cardápio é uma sugestão gerada por IA e <strong className="text-[var(--sl-t2)]">não substitui nutricionista</strong>. Consulte um profissional de saúde para orientação personalizada.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          {/* Preferences */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
            <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">⚙️ Preferências</h3>

            <div className="mb-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Orçamento semanal (R$)</label>
              <input type="number" value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="Ex: 200"
                className="w-full px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Restrições Adicionais</label>
              <div className="flex flex-wrap gap-1.5">
                {RESTRICTION_OPTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => toggleRestriction(r)}
                    className={cn(
                      'px-2 py-1 rounded-[7px] text-[10px] border transition-all',
                      extraRestrictions.includes(r)
                        ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[var(--sl-t1)]'
                        : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
            <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">💡 Dicas</h3>
            <div className="flex flex-col gap-2">
              {[
                'Complete seu perfil de saúde para cardápios mais precisos',
                'Informe restrições alimentares para evitar ingredientes inadequados',
                'O orçamento ajuda a IA a sugerir ingredientes acessíveis',
              ].map((tip, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#f59e0b] shrink-0 text-[11px]">→</span>
                  <p className="text-[11px] text-[var(--sl-t3)]">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
