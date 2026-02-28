'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, RefreshCw, Lock, Unlock, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import { useHealthProfile, WEIGHT_GOAL_LABELS } from '@/hooks/use-corpo'
import { useUserPlan } from '@/hooks/use-user-plan'
import { createTransactionFromCardapio } from '@/lib/integrations/financas'

// RN-CRP-22: Limite FREE de 3 gerações/semana
const REGEN_KEY = 'sl_cardapio_regen'

function getWeekStart(): number {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(now.getFullYear(), now.getMonth(), diff).getTime()
}

function getRegenCount(): number {
  try {
    const saved = localStorage.getItem(REGEN_KEY)
    if (!saved) return 0
    const parsed: { count: number; weekStart: number } = JSON.parse(saved)
    if (parsed.weekStart !== getWeekStart()) return 0
    return parsed.count
  } catch { return 0 }
}

function incrementRegenCount(): void {
  try {
    const count = getRegenCount()
    localStorage.setItem(REGEN_KEY, JSON.stringify({ count: count + 1, weekStart: getWeekStart() }))
  } catch { /* ignore */ }
}

// RN-CRP-21: macronutrientes por refeição
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
  seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta',
  sex: 'Sexta', sab: 'Sábado', dom: 'Domingo',
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: '☕ Café da manhã',
  lunch: '🥗 Almoço',
  dinner: '🍽️ Jantar',
}

function apiToUiPlan(apiDays: ApiDayPlan[]): DayPlan[] {
  return apiDays.map(d => {
    const toMeal = (label: string, m: ApiMeal): MealItem => ({
      name: `${label} — ${m.name}`,
      calories: m.calories,
      prep_minutes: m.prep_minutes,
      protein_g: m.protein_g,
      carbs_g: m.carbs_g,
      fat_g: m.fat_g,
    })
    const meals: MealItem[] = [
      toMeal(MEAL_LABELS.breakfast, d.breakfast),
      toMeal(MEAL_LABELS.lunch, d.lunch),
      toMeal(MEAL_LABELS.dinner, d.dinner),
      ...(d.snacks ?? []).map((s, i) => ({ name: `${i === 0 ? '🍎' : '🥛'} Lanche — ${s.name}`, calories: s.calories })),
    ]
    return { day: DAY_MAP[d.day] ?? d.day, meals }
  })
}

const RESTRICTION_OPTIONS = [
  'Vegetariano', 'Vegano', 'Sem lactose', 'Sem glúten',
  'Sem carne vermelha', 'Diabético', 'Low carb', 'Hipertensão',
]

const DAYS_PT = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export default function CardapioPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { profile } = useHealthProfile()
  const { isPro } = useUserPlan()

  const [generating, setGenerating] = useState(false)
  const [plan, setPlan] = useState<DayPlan[] | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [budget, setBudget] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [extraRestrictions, setExtraRestrictions] = useState<string[]>(
    profile?.dietary_restrictions ?? []
  )
  // RN-CRP-23: dias travados (não regeneram)
  const [lockedDays, setLockedDays] = useState<Set<number>>(new Set())
  // RN-CRP-24: histórico de cardápios gerados
  const [planHistory, setPlanHistory] = useState<DayPlan[][]>([])
  const [showHistory, setShowHistory] = useState(false)

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
    // RN-CRP-22: limite FREE 3 gerações/semana
    if (!isPro) {
      const count = getRegenCount()
      if (count >= 3) {
        toast.error('Limite de 3 gerações/semana no plano FREE. Assine o PRO para ilimitado.', {
          action: { label: 'Ver Planos', onClick: () => router.push('/configuracoes/plano') },
        })
        return
      }
      incrementRegenCount()
    }
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
        }),
      })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json()
      if (data.week) {
        const newPlan = apiToUiPlan(data.week)
        // RN-CRP-23: preserve locked days from current plan
        const merged = plan && lockedDays.size > 0
          ? newPlan.map((day, idx) => lockedDays.has(idx) ? plan[idx] : day)
          : newPlan
        setPlan(merged)
        saveToHistory(merged)
        // RN-CRP-25: offer to register budget in Finanças
        if (budget) {
          const weekStart = new Date(getWeekStart()).toISOString().split('T')[0]
          toast.success('Cardápio gerado!', {
            action: {
              label: 'Registrar orçamento em Finanças',
              onClick: async () => {
                await createTransactionFromCardapio({
                  weeklyBudget: Number(budget),
                  weekStart,
                }).catch(() => {})
                toast.success('Orçamento alimentar registrado!')
              },
            },
            duration: 8000,
          })
        }
      } else {
        throw new Error('Resposta inesperada da IA')
      }
    } catch (e) {
      setError('Não foi possível gerar o cardápio. Verifique a conexão e tente novamente.')
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
                {generating ? 'Gerando com IA...' : 'Gerar Cardápio com IA'}
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
                  <div key={day} className="relative shrink-0 flex flex-col items-center gap-0.5">
                    <button
                      onClick={() => setSelectedDay(idx)}
                      className={cn(
                        'px-3 py-1.5 rounded-[8px] text-[11px] font-medium border whitespace-nowrap transition-all',
                        selectedDay === idx
                          ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]',
                        lockedDays.has(idx) && 'opacity-70'
                      )}
                    >
                      {day}
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
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[12px] font-semibold text-[var(--sl-t1)] leading-snug">{meal.name}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          {meal.prep_minutes != null && (
                            <span className="text-[10px] text-[var(--sl-t3)]">⏱ {meal.prep_minutes}m</span>
                          )}
                          <span className="font-[DM_Mono] text-[11px] text-[#f97316]">{meal.calories} kcal</span>
                        </div>
                      </div>
                      {/* RN-CRP-21: macros */}
                      {(meal.protein_g != null || meal.carbs_g != null || meal.fat_g != null) && (
                        <div className="flex gap-3 mt-1">
                          {meal.protein_g != null && (
                            <span className="text-[10px] text-[#10b981]">P: <strong className="font-[DM_Mono]">{meal.protein_g}g</strong></span>
                          )}
                          {meal.carbs_g != null && (
                            <span className="text-[10px] text-[#f59e0b]">C: <strong className="font-[DM_Mono]">{meal.carbs_g}g</strong></span>
                          )}
                          {meal.fat_g != null && (
                            <span className="text-[10px] text-[#f97316]">G: <strong className="font-[DM_Mono]">{meal.fat_g}g</strong></span>
                          )}
                        </div>
                      )}
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
                'Trave dias bons com o 🔒 para preservar ao regenerar',
              ].map((tip, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#f59e0b] shrink-0 text-[11px]">→</span>
                  <p className="text-[11px] text-[var(--sl-t3)]">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RN-CRP-24: Histórico de cardápios */}
          {planHistory.length > 0 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
              <button
                onClick={() => setShowHistory(h => !h)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] flex items-center gap-2">
                  <History size={13} />
                  Histórico ({planHistory.length})
                </h3>
                <span className="text-[11px] text-[var(--sl-t3)]">{showHistory ? '▲' : '▼'}</span>
              </button>
              {showHistory && (
                <div className="flex flex-col gap-2 mt-3">
                  {planHistory.map((hist, hIdx) => (
                    <button
                      key={hIdx}
                      onClick={() => { setPlan(hist); setShowHistory(false) }}
                      className="text-left p-2 rounded-[8px] bg-[var(--sl-s2)] border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] transition-colors"
                    >
                      <p className="text-[11px] font-semibold text-[var(--sl-t1)]">Cardápio #{planHistory.length - hIdx}</p>
                      <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">{hist[0]?.meals?.[0]?.name?.split('—')[1]?.trim() ?? '7 dias'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
