'use client'

import { useState, useMemo } from 'react'
import {
  ACTIVITY_TYPES, calcCaloriesBurned,
  type SaveActivityData,
} from '@/hooks/use-corpo'
import { MobileFormHeader } from '@/components/ui/mobile-form-header'

const CORPO_COLOR = '#f97316'
const CORPO_BG = 'rgba(249,115,22,0.12)'

interface CorpoActivityModalProps {
  weightKg: number | null
  onClose: () => void
  onSave: (data: SaveActivityData) => Promise<void>
}

export function CorpoActivityModal({ weightKg, onClose, onSave }: CorpoActivityModalProps) {
  const [selectedType, setSelectedType] = useState(ACTIVITY_TYPES[2]) // Musculação default
  const [description, setDescription] = useState('')
  const [durationMin, setDurationMin] = useState(45)
  const [intensity, setIntensity] = useState(3)
  const [saving, setSaving] = useState(false)

  const estimatedKcal = useMemo(() => {
    if (!weightKg) return null
    return Math.round(calcCaloriesBurned(selectedType.met, weightKg, durationMin))
  }, [selectedType.met, weightKg, durationMin])

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({
        type: selectedType.type,
        duration_minutes: durationMin,
        intensity,
        calories_burned: estimatedKcal ?? undefined,
        met_value: selectedType.met,
        recorded_at: new Date().toISOString(),
        notes: description || null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--sl-bg)' }}>
      <MobileFormHeader
        moduleId="corpo"
        title="Nova Atividade"
        onBack={onClose}
        inModal
      />

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Tipo de atividade */}
        <div className="px-4 mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] mb-3">
            Tipo de atividade
          </p>
          <div className="grid grid-cols-5 gap-2">
            {ACTIVITY_TYPES.map((act) => (
              <button
                key={act.type}
                onClick={() => setSelectedType(act)}
                className="rounded-[10px] py-2.5 px-1 flex flex-col items-center gap-1 text-center transition-colors"
                style={{
                  background: selectedType.type === act.type ? CORPO_BG : 'var(--sl-s1)',
                  border: selectedType.type === act.type ? `1.5px solid ${CORPO_COLOR}` : '1.5px solid var(--sl-border)',
                }}
              >
                <span className="text-[22px] leading-none">{act.icon}</span>
                <span className="text-[10px] font-medium text-[var(--sl-t1)] leading-tight">{act.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <div className="px-4 mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
            Descrição (opcional)
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Ex: ${selectedType.label} — pernas`}
            className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
          />
        </div>

        {/* Duração + Intensidade */}
        <div className="px-4 mb-4 flex gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
              Duração (min)
            </label>
            <input
              type="number"
              min={5}
              max={300}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value) || 30)}
              className="w-full rounded-[10px] px-3 py-3 text-[16px] font-[DM_Mono] font-bold text-[var(--sl-t1)] outline-none text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />
          </div>

          <div className="flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
              Intensidade
            </label>
            <div className="flex gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setIntensity(lvl)}
                  className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center text-[12px] transition-colors"
                  style={{
                    background: lvl <= intensity ? CORPO_COLOR : 'var(--sl-s3)',
                    color: lvl <= intensity ? '#000' : 'var(--sl-t3)',
                  }}
                >
                  ⚡
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview calorias */}
        {estimatedKcal !== null && (
          <div
            className="mx-4 rounded-[10px] p-3 text-center mb-5"
            style={{ background: CORPO_BG }}
          >
            <p className="text-[11px] text-[var(--sl-t2)] mb-1">CALORIAS ESTIMADAS</p>
            <p className="font-[DM_Mono] text-[24px] font-bold" style={{ color: CORPO_COLOR }}>
              ~{estimatedKcal} kcal
            </p>
            <p className="text-[11px] text-[var(--sl-t3)] mt-1">
              MET {selectedType.met} × {weightKg}kg × {(durationMin / 60).toFixed(2)}h
            </p>
          </div>
        )}

        {/* Botão */}
        <div className="px-4">
          <button
            onClick={handleSave}
            disabled={saving || durationMin < 1}
            className="w-full py-[14px] rounded-[10px] font-[Syne] text-[15px] font-bold text-black disabled:opacity-50 transition-opacity"
            style={{ background: CORPO_COLOR }}
          >
            {saving ? 'Registrando…' : `Registrar Atividade ${selectedType.icon}`}
          </button>
        </div>
      </div>
    </div>
  )
}
