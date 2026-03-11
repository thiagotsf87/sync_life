'use client'

import { useState, useMemo } from 'react'
import { calcIMC, IMC_LABEL, type HealthProfile } from '@/hooks/use-corpo'
import { MobileFormHeader } from '@/components/ui/mobile-form-header'

const CORPO_COLOR = '#f97316'
const CORPO_BG = 'rgba(249,115,22,0.12)'

interface CorpoWeightModalProps {
  profile: HealthProfile | null
  onClose: () => void
  onSave: (data: {
    weight: number
    body_fat_pct?: number | null
    waist_cm?: number | null
    hip_cm?: number | null
    notes?: string | null
    recorded_at: string
    progress_photo_url?: null
  }) => Promise<void>
}

export function CorpoWeightModal({ profile, onClose, onSave }: CorpoWeightModalProps) {
  const [weightStr, setWeightStr] = useState('')
  const [fatPct, setFatPct] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const weightNum = parseFloat(weightStr.replace(',', '.')) || null

  const imcInfo = useMemo(() => {
    if (!weightNum || !profile?.height_cm) return null
    const imc = calcIMC(weightNum, profile.height_cm)
    return { imc, ...IMC_LABEL(imc) }
  }, [weightNum, profile])

  const muscleMass = useMemo(() => {
    if (!weightNum || !fatPct) return null
    const fat = parseFloat(fatPct.replace(',', '.'))
    if (isNaN(fat) || fat <= 0 || fat >= 100) return null
    return (weightNum * (1 - fat / 100)).toFixed(1)
  }, [weightNum, fatPct])

  async function handleSave() {
    if (!weightNum || weightNum < 20 || weightNum > 500) return
    setSaving(true)
    try {
      await onSave({
        weight: weightNum,
        body_fat_pct: fatPct ? parseFloat(fatPct.replace(',', '.')) : null,
        waist_cm: waist ? parseFloat(waist.replace(',', '.')) : null,
        hip_cm: hip ? parseFloat(hip.replace(',', '.')) : null,
        notes: notes || null,
        recorded_at: new Date().toISOString().split('T')[0],
        progress_photo_url: null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--sl-bg)' }}>
      <MobileFormHeader
        moduleId="corpo"
        title="Registrar Medição"
        onBack={onClose}
        inModal
      />

      <div className="flex-1 overflow-y-auto pb-8 px-4">
        {/* Peso principal */}
        <div
          className="rounded-2xl p-5 text-center mb-4"
          style={{ background: CORPO_BG }}
        >
          <p className="text-[12px] text-[var(--sl-t2)] mb-2 uppercase tracking-wide">PESO (kg)</p>
          <input
            type="number"
            min={20}
            max={500}
            step={0.1}
            value={weightStr}
            onChange={(e) => setWeightStr(e.target.value)}
            placeholder="0,0"
            className="w-full text-center bg-transparent outline-none font-[DM_Mono] text-[48px] font-bold"
            style={{ color: CORPO_COLOR }}
          />
          {imcInfo && (
            <p className="text-[12px] mt-2" style={{ color: imcInfo.color }}>
              IMC calculado: {imcInfo.imc.toFixed(1)} — {imcInfo.label}
            </p>
          )}
          {weightNum && !profile?.height_cm && (
            <p className="text-[11px] mt-2 text-[var(--sl-t3)]">
              Configure sua altura no perfil para calcular o IMC
            </p>
          )}
        </div>

        {/* Composição corporal */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] mb-3">
          Composição corporal (opcional)
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-[11px] text-[var(--sl-t3)] mb-1">Gordura corporal %</p>
            <input
              type="number"
              min={1}
              max={70}
              step={0.1}
              value={fatPct}
              onChange={(e) => setFatPct(e.target.value)}
              placeholder="Ex: 21,4"
              className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />
          </div>
          <div>
            <p className="text-[11px] text-[var(--sl-t3)] mb-1">
              Massa muscular kg
              {muscleMass && <span className="text-[10px] text-[var(--sl-t3)]"> (calculado)</span>}
            </p>
            <div
              className="w-full rounded-[10px] px-3 py-3 text-[14px] text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)', color: muscleMass ? '#10b981' : 'var(--sl-t3)' }}
            >
              {muscleMass ? `${muscleMass} kg` : '—'}
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[var(--sl-t3)] mb-1">Cintura cm</p>
            <input
              type="number"
              min={40}
              max={200}
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder="Ex: 84"
              className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />
          </div>
          <div>
            <p className="text-[11px] text-[var(--sl-t3)] mb-1">Quadril cm</p>
            <input
              type="number"
              min={40}
              max={200}
              value={hip}
              onChange={(e) => setHip(e.target.value)}
              placeholder="Ex: 96"
              className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />
          </div>
        </div>

        {/* Notas */}
        <div className="mb-5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
            Notas (opcional)
          </label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Após jejum, manhã"
            className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !weightNum || weightNum < 20}
          className="w-full py-[14px] rounded-[10px] font-[Syne] text-[15px] font-bold text-black disabled:opacity-50"
          style={{ background: CORPO_COLOR }}
        >
          {saving ? 'Registrando…' : 'Registrar Pesagem ⚖️'}
        </button>
      </div>
    </div>
  )
}
