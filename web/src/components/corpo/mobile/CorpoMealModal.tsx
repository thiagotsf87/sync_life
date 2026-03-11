'use client'

import { useState, useMemo } from 'react'
import { MEAL_SLOT_CONFIG, type MealSlot, type SaveMealData, type HealthProfile } from '@/hooks/use-corpo'
import { MobileFormHeader } from '@/components/ui/mobile-form-header'

const CORPO_COLOR = '#f97316'

interface CorpoMealModalProps {
  slot: MealSlot
  profile: HealthProfile | null
  totalConsumedKcal: number
  onClose: () => void
  onSave: (data: SaveMealData) => Promise<void>
}

export function CorpoMealModal({ slot, profile, totalConsumedKcal, onClose, onSave }: CorpoMealModalProps) {
  const cfg = MEAL_SLOT_CONFIG[slot]
  const [description, setDescription] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [mealTime, setMealTime] = useState(cfg.defaultTime)
  const [saving, setSaving] = useState(false)

  const caloriesNum = parseInt(calories) || 0
  const tdee = profile?.tdee ? Math.round(profile.tdee) : null

  const impactTotal = totalConsumedKcal + caloriesNum
  const remaining = tdee ? tdee - impactTotal : null

  async function handleSave() {
    if (!description.trim() || caloriesNum < 1) return
    setSaving(true)
    try {
      await onSave({
        meal_slot: slot,
        description: description.trim(),
        calories_kcal: caloriesNum,
        protein_g: protein ? parseFloat(protein) : null,
        carbs_g: carbs ? parseFloat(carbs) : null,
        fat_g: fat ? parseFloat(fat) : null,
        meal_time: mealTime || null,
        recorded_at: new Date().toISOString().split('T')[0],
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--sl-bg)' }}>
      <MobileFormHeader
        moduleId="corpo"
        title={`${cfg.icon} ${cfg.label}`}
        onBack={onClose}
        inModal
      />

      <div className="flex-1 overflow-y-auto pb-8 px-4 space-y-4">
        {/* Descrição */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
            O que você comeu?
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Salada, frango grelhado, arroz"
            autoFocus
            className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
          />
        </div>

        {/* Horário */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
            Horário
          </label>
          <input
            type="time"
            value={mealTime}
            onChange={(e) => setMealTime(e.target.value)}
            className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none text-center"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
          />
        </div>

        {/* Calorias */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
            Calorias (kcal) *
          </label>
          <input
            type="number"
            min={1}
            max={5000}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Ex: 340"
            className="w-full rounded-[10px] px-3 py-3 text-[20px] font-[DM_Mono] font-bold outline-none text-center"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)', color: CORPO_COLOR }}
          />
        </div>

        {/* Macros */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
            Macronutrientes (opcional)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Proteína (g)', val: protein, set: setProtein, color: '#10b981' },
              { label: 'Carbos (g)', val: carbs, set: setCarbs, color: '#0055ff' },
              { label: 'Gordura (g)', val: fat, set: setFat, color: '#f59e0b' },
            ].map(({ label, val, set, color }) => (
              <div key={label}>
                <p className="text-[10px] text-[var(--sl-t3)] mb-1 text-center">{label}</p>
                <input
                  type="number"
                  min={0}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-[10px] px-2 py-2.5 text-[14px] outline-none text-center"
                  style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)', color }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Impacto no dia */}
        {tdee !== null && caloriesNum > 0 && (
          <div
            className="rounded-[10px] p-3"
            style={{ background: 'rgba(249,115,22,0.12)' }}
          >
            <p className="text-[11px] text-[var(--sl-t2)] mb-2 uppercase tracking-wide">IMPACTO NO DIA</p>
            <div className="flex justify-between">
              <div>
                <span className="text-[12px] text-[var(--sl-t2)]">Total: </span>
                <span className="font-[DM_Mono] text-[14px]" style={{ color: CORPO_COLOR }}>
                  {impactTotal} kcal
                </span>
              </div>
              <div>
                <span className="text-[12px] text-[var(--sl-t2)]">Restante: </span>
                <span
                  className="font-[DM_Mono] text-[14px]"
                  style={{ color: remaining !== null && remaining >= 0 ? '#10b981' : '#f43f5e' }}
                >
                  {remaining !== null ? `${remaining} kcal` : '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !description.trim() || caloriesNum < 1}
          className="w-full py-[14px] rounded-[10px] font-[Syne] text-[15px] font-bold text-black disabled:opacity-50"
          style={{ background: CORPO_COLOR }}
        >
          {saving ? 'Registrando…' : 'Registrar Refeição 🍽️'}
        </button>
      </div>
    </div>
  )
}
