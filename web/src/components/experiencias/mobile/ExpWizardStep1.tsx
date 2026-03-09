'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { EXP_PRIMARY, EXP_PRIMARY_LIGHT, EXP_PRIMARY_BG, EXP_PRIMARY_BORDER, EXP_PRIMARY_TAG } from '@/lib/exp-colors'

interface ExpWizardStep1Props {
  tripName: string
  setTripName: (v: string) => void
  destinations: string[]
  setDestinations: (v: string[]) => void
  tripType: string
  setTripType: (v: string) => void
}

const TRIP_TYPES = [
  { value: 'leisure', label: '🏖️ Lazer' },
  { value: 'work', label: '💼 Trabalho' },
  { value: 'study', label: '📚 Estudo' },
  { value: 'mixed', label: '🔀 Mista' },
]

export function ExpWizardStep1({
  tripName, setTripName, destinations, setDestinations, tripType, setTripType,
}: ExpWizardStep1Props) {
  const accent = EXP_PRIMARY
  const [newDest, setNewDest] = useState('')

  function addDestination() {
    const trimmed = newDest.trim()
    if (trimmed && !destinations.includes(trimmed)) {
      setDestinations([...destinations, trimmed])
      setNewDest('')
    }
  }

  function removeDestination(dest: string) {
    setDestinations(destinations.filter(d => d !== dest))
  }

  return (
    <div className="px-4">
      <div
        className="flex items-center gap-2 px-[13px] py-2 rounded-[20px] mb-3"
        style={{ background: EXP_PRIMARY_BG, border: `1px solid ${EXP_PRIMARY_BORDER}` }}
      >
        <span className="text-[14px]">⚡</span>
        <span className="text-[12px] font-semibold" style={{ color: EXP_PRIMARY_LIGHT }}>
          Criar uma missão vale <strong className="text-[var(--sl-t1)]">+50 XP</strong> imediatos
        </span>
      </div>

      <p className="text-[14px] font-semibold text-[var(--sl-t1)] mb-[14px]">
        Para onde será a aventura?
      </p>

      <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
        style={{ color: EXP_PRIMARY_LIGHT }}>
        Nome da missão
      </label>
      <input
        value={tripName}
        onChange={e => setTripName(e.target.value)}
        placeholder="Ex: Japão 2026"
        className="w-full px-[14px] py-3 rounded-[10px] text-[14px] text-[var(--sl-t1)] mb-[14px] outline-none"
        style={{
          background: 'var(--sl-s1)',
          border: `1.5px solid ${EXP_PRIMARY_BORDER}80`,
        }}
      />

      <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
        style={{ color: EXP_PRIMARY_LIGHT }}>
        Destinos da missão
      </label>
      <div className="flex gap-2 mb-2">
        <input
          value={newDest}
          onChange={e => setNewDest(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addDestination() }}
          placeholder="Adicionar cidade..."
          className="flex-1 px-[14px] py-3 rounded-[10px] text-[14px] text-[var(--sl-t1)] outline-none"
          style={{ background: 'var(--sl-s1)', border: '1.5px solid var(--sl-border)' }}
        />
        <button
          onClick={addDestination}
          className="w-10 h-11 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: accent }}
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>
      {destinations.length > 0 && (
        <div className="flex gap-[6px] flex-wrap mb-4">
          {destinations.map(d => (
            <span
              key={d}
              className="flex items-center gap-1 px-3 py-[6px] rounded-[20px] text-[12px] cursor-pointer"
              style={{ background: EXP_PRIMARY_TAG, color: EXP_PRIMARY_LIGHT }}
              onClick={() => removeDestination(d)}
            >
              {d} <X size={12} />
            </span>
          ))}
        </div>
      )}

      {destinations.length > 0 && (
        <p className="text-[10px] font-semibold mb-[14px]" style={{ color: EXP_PRIMARY_LIGHT }}>
          ⚡ Novo país = +80 XP ao retornar
        </p>
      )}

      <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
        style={{ color: EXP_PRIMARY_LIGHT }}>
        Tipo de aventura
      </label>
      <div className="flex gap-[6px] flex-wrap mb-5">
        {TRIP_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setTripType(t.value)}
            className="px-[14px] py-2 rounded-[20px] text-[12px] font-medium"
            style={
              tripType === t.value
                ? { background: accent, color: '#fff', border: `1px solid ${accent}` }
                : { background: 'var(--sl-s1)', color: 'var(--sl-t2)', border: '1px solid var(--sl-border)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
