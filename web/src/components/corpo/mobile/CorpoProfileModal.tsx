'use client'

import { useState, useMemo } from 'react'
import {
  calcBMR, calcTDEE, calcCaloriesTarget,
  ACTIVITY_LEVEL_LABELS, WEIGHT_GOAL_LABELS,
  type HealthProfile, type SaveHealthProfileData,
  type ActivityLevelType, type WeightGoalType, type BiologicalSex,
} from '@/hooks/use-corpo'

const CORPO_COLOR = '#f97316'
const CORPO_BG = 'rgba(249,115,22,0.12)'

const ACTIVITY_OPTIONS: ActivityLevelType[] = ['sedentary', 'light', 'moderate', 'very_active', 'extreme']
const GOAL_OPTIONS: WeightGoalType[] = ['lose', 'maintain', 'gain']

interface CorpoProfileModalProps {
  profile: HealthProfile | null
  onClose: () => void
  onSave: (data: SaveHealthProfileData, existingId?: string) => Promise<void>
}

export function CorpoProfileModal({ profile, onClose, onSave }: CorpoProfileModalProps) {
  const [height, setHeight] = useState(String(profile?.height_cm ?? ''))
  const [weightGoal, setWeightGoal] = useState(String(profile?.weight_goal_kg ?? ''))
  const [activityLevel, setActivityLevel] = useState<ActivityLevelType>(profile?.activity_level ?? 'moderate')
  const [goalType, setGoalType] = useState<WeightGoalType>(profile?.weight_goal_type ?? 'maintain')
  const [weeklyGoal, setWeeklyGoal] = useState(String(profile?.weekly_activity_goal ?? 4))
  const [waterGoal, setWaterGoal] = useState('2500')
  const [saving, setSaving] = useState(false)

  const { bmr, tdee } = useMemo(() => {
    const h = parseFloat(height)
    const w = profile?.current_weight
    const sex = profile?.biological_sex
    const bd = profile?.birth_date
    const al = activityLevel
    if (!h || !w || !sex || !bd) return { bmr: null, tdee: null }
    const b = calcBMR(w, h, sex, bd)
    return { bmr: Math.round(b), tdee: Math.round(calcTDEE(b, al)) }
  }, [height, profile, activityLevel])

  async function handleSave() {
    setSaving(true)
    try {
      const data: SaveHealthProfileData = {
        height_cm: parseFloat(height) || undefined,
        weight_goal_kg: parseFloat(weightGoal.replace(',', '.')) || undefined,
        activity_level: activityLevel,
        weight_goal_type: goalType,
        weekly_activity_goal: parseInt(weeklyGoal) || 4,
      }
      await onSave(data, profile?.id)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--sl-bg)' }}>
      {/* Int-header */}
      <div className="flex items-center justify-between px-5 py-4 pt-14">
        <button onClick={onClose} className="text-[14px] font-medium" style={{ color: CORPO_COLOR }}>
          ← Dashboard
        </button>
        <span className="font-[Syne] text-[17px] font-bold text-[var(--sl-t1)]">Perfil de Saúde</span>
        <button onClick={handleSave} disabled={saving} className="text-[13px] font-semibold" style={{ color: CORPO_COLOR }}>
          {saving ? '…' : 'Salvar'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 px-4">
        {/* TMB / TDEE */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 rounded-[10px] p-3 text-center" style={{ background: CORPO_BG }}>
            <p className="text-[10px] text-[var(--sl-t2)]">TMB</p>
            <p className="font-[DM_Mono] text-[20px] font-bold" style={{ color: CORPO_COLOR }}>
              {bmr ?? '—'}
            </p>
            <p className="text-[10px] text-[var(--sl-t3)]">kcal/dia</p>
          </div>
          <div className="flex-1 rounded-[10px] p-3 text-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <p className="text-[10px] text-[var(--sl-t2)]">TDEE</p>
            <p className="font-[DM_Mono] text-[20px] font-bold" style={{ color: '#f59e0b' }}>
              {tdee ?? '—'}
            </p>
            <p className="text-[10px] text-[var(--sl-t3)]">kcal/dia</p>
          </div>
        </div>

        {/* Dados pessoais (leitura) */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] mb-3">
          Dados pessoais
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-[11px] text-[var(--sl-t3)] mb-1">Sexo biológico</p>
            <div className="rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}>
              {profile?.biological_sex === 'male' ? 'Masculino' : profile?.biological_sex === 'female' ? 'Feminino' : '—'}
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[var(--sl-t3)] mb-1">Idade</p>
            <div className="rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}>
              {profile?.birth_date
                ? `${Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000))} anos`
                : '—'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <p className="text-[11px] text-[var(--sl-t3)] mb-1">Altura (cm)</p>
            <input
              type="number" min={100} max={250}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Ex: 180"
              className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />
          </div>
          <div>
            <p className="text-[11px] text-[var(--sl-t3)] mb-1">Peso meta (kg)</p>
            <input
              type="number" min={30} max={300} step={0.1}
              value={weightGoal}
              onChange={(e) => setWeightGoal(e.target.value)}
              placeholder="Ex: 76"
              className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />
          </div>
        </div>

        {/* Nível de atividade */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] mb-2">
          Nível de atividade
        </p>
        <div className="space-y-2 mb-5">
          {ACTIVITY_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setActivityLevel(opt)}
              className="w-full rounded-[10px] px-3 py-3 text-left text-[14px] transition-colors"
              style={{
                background: activityLevel === opt ? CORPO_BG : 'var(--sl-s1)',
                border: activityLevel === opt ? `1.5px solid ${CORPO_COLOR}` : '1px solid var(--sl-border)',
                color: activityLevel === opt ? CORPO_COLOR : 'var(--sl-t1)',
                fontWeight: activityLevel === opt ? 600 : 400,
              }}
            >
              {activityLevel === opt ? '🏃 ' : ''}{ACTIVITY_LEVEL_LABELS[opt]}
            </button>
          ))}
        </div>

        {/* Objetivo */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] mb-2">Objetivo</p>
        <div className="flex gap-2 mb-5">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setGoalType(opt)}
              className="flex-1 py-[10px] rounded-[10px] text-[13px] transition-colors"
              style={{
                background: 'var(--sl-s1)',
                border: goalType === opt ? `1.5px solid ${CORPO_COLOR}` : '1px solid var(--sl-border)',
                color: goalType === opt ? CORPO_COLOR : 'var(--sl-t2)',
                fontWeight: goalType === opt ? 600 : 400,
              }}
            >
              {WEIGHT_GOAL_LABELS[opt]}
            </button>
          ))}
        </div>

        {/* Metas */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] mb-2">Metas</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <p className="text-[11px] text-[var(--sl-t3)] mb-1">Atividades/semana</p>
            <input
              type="number" min={1} max={14}
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(e.target.value)}
              className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />
          </div>
          <div>
            <p className="text-[11px] text-[var(--sl-t3)] mb-1">Água diária (ml)</p>
            <input
              type="number" min={500} max={6000} step={250}
              value={waterGoal}
              onChange={(e) => setWaterGoal(e.target.value)}
              className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-[14px] rounded-[10px] font-[Syne] text-[15px] font-bold text-black disabled:opacity-50"
          style={{ background: CORPO_COLOR }}
        >
          {saving ? 'Salvando…' : 'Salvar Perfil'}
        </button>
      </div>
    </div>
  )
}
