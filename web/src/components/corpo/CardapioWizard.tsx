'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, Dumbbell, Utensils, Apple, Pill } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface WizardData {
  // Step 1 — Dados Físicos
  weight: number
  height: number
  age: number
  sex: 'male' | 'female'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  // Step 2 — Tipo de Dieta
  dietType: string
  // Step 3 — Proteínas Preferidas
  preferredProteins: string[]
  // Step 4 — Refeições
  mealsPerDay: number
  preWorkout: boolean
  postWorkout: boolean
  supplements: string[]
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentario (pouco ou nenhum exercicio)',
  light: 'Leve (1-3x/semana)',
  moderate: 'Moderado (3-5x/semana)',
  active: 'Ativo (6-7x/semana)',
  very_active: 'Muito ativo (2x/dia ou trabalho fisico)',
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
}

const DIET_TYPES = [
  { id: 'balanced', label: 'Balanceada', icon: '🥗' },
  { id: 'low-carb', label: 'Low Carb', icon: '🥩' },
  { id: 'ketogenic', label: 'Cetogenica', icon: '🧈' },
  { id: 'vegetarian', label: 'Vegetariana', icon: '🥬' },
  { id: 'vegan', label: 'Vegana', icon: '🌱' },
  { id: 'carnivore', label: 'Carnivora', icon: '🍖' },
  { id: 'mediterranean', label: 'Mediterranea', icon: '🫒' },
  { id: 'paleo', label: 'Paleo', icon: '🦴' },
]

const PROTEIN_OPTIONS = [
  { id: 'chicken', label: 'Frango', icon: '🍗' },
  { id: 'beef', label: 'Carne Bovina', icon: '🥩' },
  { id: 'fish', label: 'Peixe', icon: '🐟' },
  { id: 'eggs', label: 'Ovos', icon: '🥚' },
  { id: 'whey', label: 'Whey Protein', icon: '🥤' },
  { id: 'tofu', label: 'Tofu', icon: '🧈' },
  { id: 'legumes', label: 'Leguminosas', icon: '🫘' },
]

const SUPPLEMENT_OPTIONS = [
  { id: 'creatine', label: 'Creatina' },
  { id: 'whey', label: 'Whey Protein' },
  { id: 'bcaa', label: 'BCAA' },
  { id: 'glutamine', label: 'Glutamina' },
  { id: 'multivitamin', label: 'Multivitaminico' },
  { id: 'omega3', label: 'Omega 3' },
]

function calcTMB(weight: number, height: number, age: number, sex: 'male' | 'female'): number {
  // Harris-Benedict
  if (sex === 'male') return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
  return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
}

interface Props {
  initialData?: Partial<WizardData>
  onComplete: (data: WizardData & { tmb: number; tdee: number }) => void
  onCancel?: () => void
}

export function CardapioWizard({ initialData, onComplete, onCancel }: Props) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<WizardData>({
    weight: initialData?.weight ?? 70,
    height: initialData?.height ?? 170,
    age: initialData?.age ?? 30,
    sex: initialData?.sex ?? 'male',
    activityLevel: initialData?.activityLevel ?? 'moderate',
    dietType: initialData?.dietType ?? 'balanced',
    preferredProteins: initialData?.preferredProteins ?? [],
    mealsPerDay: initialData?.mealsPerDay ?? 3,
    preWorkout: initialData?.preWorkout ?? false,
    postWorkout: initialData?.postWorkout ?? false,
    supplements: initialData?.supplements ?? [],
  })

  const tmb = calcTMB(data.weight, data.height, data.age, data.sex)
  const tdee = Math.round(tmb * (ACTIVITY_MULTIPLIERS[data.activityLevel] ?? 1.55))

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function toggleArray(key: 'preferredProteins' | 'supplements', value: string) {
    setData(prev => {
      const arr = prev[key]
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] }
    })
  }

  async function handleFinish() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Nao autenticado')

      await (supabase as any).from('health_profiles').upsert({
        user_id: user.id,
        current_weight: data.weight,
        height_cm: data.height,
        biological_sex: data.sex,
        activity_level: data.activityLevel,
        tdee,
        diet_type: data.dietType,
        preferred_proteins: data.preferredProteins,
        meals_per_day: data.mealsPerDay,
        pre_workout_meal: data.preWorkout,
        post_workout_meal: data.postWorkout,
        supplements: data.supplements,
        cardapio_wizard_completed: true,
      }, { onConflict: 'user_id' })

      toast.success('Preferencias salvas!')
      onComplete({ ...data, tmb: Math.round(tmb), tdee })
    } catch {
      toast.error('Erro ao salvar preferencias')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    { label: 'Dados Fisicos', icon: Dumbbell },
    { label: 'Tipo de Dieta', icon: Utensils },
    { label: 'Proteinas', icon: Apple },
    { label: 'Refeicoes', icon: Pill },
  ]

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-[600px] mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
              i <= step ? 'bg-[#10b981] text-white' : 'bg-[var(--sl-s3)] text-[var(--sl-t3)]'
            }`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 ${i < step ? 'bg-[#10b981]' : 'bg-[var(--sl-border)]'}`} />
            )}
          </div>
        ))}
      </div>
      <p className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-4">{steps[step].label}</p>

      {/* Step 1 — Dados Fisicos */}
      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Peso (kg)</span>
              <input type="number" value={data.weight} onChange={e => update('weight', +e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] text-[13px] outline-none focus:border-[#10b981]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Altura (cm)</span>
              <input type="number" value={data.height} onChange={e => update('height', +e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] text-[13px] outline-none focus:border-[#10b981]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Idade</span>
              <input type="number" value={data.age} onChange={e => update('age', +e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] text-[13px] outline-none focus:border-[#10b981]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Sexo</span>
              <select value={data.sex} onChange={e => update('sex', e.target.value as 'male' | 'female')}
                className="px-3 py-2 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] text-[13px] outline-none focus:border-[#10b981]">
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Nivel de Atividade</span>
            <select value={data.activityLevel} onChange={e => update('activityLevel', e.target.value as WizardData['activityLevel'])}
              className="px-3 py-2 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] text-[13px] outline-none focus:border-[#10b981]">
              {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <div className="p-3 rounded-xl bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.15)]">
            <p className="text-[11px] text-[var(--sl-t3)] mb-1">Calculos (Harris-Benedict)</p>
            <p className="font-[DM_Mono] text-[14px] text-[#10b981]">TMB: {Math.round(tmb)} kcal · TDEE: {tdee} kcal/dia</p>
          </div>
        </div>
      )}

      {/* Step 2 — Tipo de Dieta */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-2">
          {DIET_TYPES.map(d => (
            <button key={d.id} onClick={() => update('dietType', d.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                data.dietType === d.id
                  ? 'border-[#10b981] bg-[rgba(16,185,129,0.08)]'
                  : 'border-[var(--sl-border)] bg-[var(--sl-s2)] hover:border-[var(--sl-border-h)]'
              }`}>
              <span className="text-[20px]">{d.icon}</span>
              <span className="text-[13px] font-medium text-[var(--sl-t1)]">{d.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Step 3 — Proteinas Preferidas */}
      {step === 2 && (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-[var(--sl-t3)]">Selecione suas proteinas favoritas (multipla escolha)</p>
          <div className="flex flex-wrap gap-2">
            {PROTEIN_OPTIONS.map(p => (
              <button key={p.id} onClick={() => toggleArray('preferredProteins', p.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] font-medium transition-all ${
                  data.preferredProteins.includes(p.id)
                    ? 'border-[#10b981] bg-[rgba(16,185,129,0.08)] text-[#10b981]'
                    : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                }`}>
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4 — Refeicoes e Suplementos */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Refeicoes por dia</span>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => update('mealsPerDay', n)}
                  className={`flex-1 py-2 rounded-xl border text-[13px] font-bold transition-all ${
                    data.mealsPerDay === n
                      ? 'border-[#10b981] bg-[rgba(16,185,129,0.08)] text-[#10b981]'
                      : 'border-[var(--sl-border)] text-[var(--sl-t2)]'
                  }`}>{n}</button>
              ))}
            </div>
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 flex-1 p-3 rounded-xl border border-[var(--sl-border)] cursor-pointer">
              <input type="checkbox" checked={data.preWorkout} onChange={() => update('preWorkout', !data.preWorkout)} className="accent-[#10b981]" />
              <span className="text-[12px] text-[var(--sl-t1)]">Pre-treino</span>
            </label>
            <label className="flex items-center gap-2 flex-1 p-3 rounded-xl border border-[var(--sl-border)] cursor-pointer">
              <input type="checkbox" checked={data.postWorkout} onChange={() => update('postWorkout', !data.postWorkout)} className="accent-[#10b981]" />
              <span className="text-[12px] text-[var(--sl-t1)]">Pos-treino</span>
            </label>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-2 block">Suplementos</span>
            <div className="flex flex-wrap gap-2">
              {SUPPLEMENT_OPTIONS.map(s => (
                <button key={s.id} onClick={() => toggleArray('supplements', s.id)}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                    data.supplements.includes(s.id)
                      ? 'border-[#10b981] bg-[rgba(16,185,129,0.08)] text-[#10b981]'
                      : 'border-[var(--sl-border)] text-[var(--sl-t2)]'
                  }`}>{s.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--sl-border)]">
        <button
          onClick={() => step === 0 ? onCancel?.() : setStep(s => s - 1)}
          className="flex items-center gap-1 px-4 py-2 rounded-xl text-[12px] font-semibold text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ChevronLeft size={14} />
          {step === 0 ? 'Cancelar' : 'Voltar'}
        </button>
        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:brightness-110"
            style={{ background: '#10b981' }}>
            Proximo <ChevronRight size={14} />
          </button>
        ) : (
          <button onClick={handleFinish} disabled={saving}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}>
            <Check size={14} /> {saving ? 'Salvando...' : 'Concluir'}
          </button>
        )}
      </div>
    </div>
  )
}
