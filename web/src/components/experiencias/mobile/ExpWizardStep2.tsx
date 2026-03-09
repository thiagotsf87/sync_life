'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EXP_PRIMARY, EXP_PRIMARY_LIGHT, EXP_PRIMARY_BORDER, EXP_PRIMARY_BG } from '@/lib/exp-colors'

type CompanionType = 'solo' | 'couple' | 'family' | 'friends'

interface ExpWizardStep2Props {
  tripName: string
  destinations: string[]
  companion: CompanionType
  setCompanion: (v: CompanionType) => void
  travelers: number
  setTravelers: (v: number) => void
}

const COMPANIONS: { value: CompanionType; icon: string; label: string; sub: string; xpBonus?: string }[] = [
  { value: 'solo', icon: '🧳', label: 'Solo — Desbravador', sub: 'A maior aventura é consigo mesmo', xpBonus: '⚡ +20 XP bônus coragem' },
  { value: 'couple', icon: '💑', label: 'Casal — Romântica', sub: 'Aventura a dois' },
  { value: 'family', icon: '👨‍👩‍👧‍👦', label: 'Família — Expedição', sub: 'Memórias em grupo' },
  { value: 'friends', icon: '👫', label: 'Amigos — Tribo', sub: 'Squad de aventura' },
]

export function ExpWizardStep2({
  tripName, destinations, companion, setCompanion, travelers, setTravelers,
}: ExpWizardStep2Props) {
  const accent = EXP_PRIMARY

  return (
    <div className="px-4">
      <div
        className="flex items-center gap-2 px-[13px] py-2 rounded-[20px] mb-3"
        style={{ background: EXP_PRIMARY_BG, border: `1px solid ${EXP_PRIMARY_BORDER}` }}
      >
        <span className="text-[14px]">🤝</span>
        <span className="text-[12px] font-semibold" style={{ color: EXP_PRIMARY_LIGHT }}>
          Viagens solo dão <strong className="text-[var(--sl-t1)]">+20 XP extra</strong> — coragem recompensada!
        </span>
      </div>

      {/* Trip summary */}
      <div
        className="flex gap-[10px] items-center rounded-[10px] p-3 mb-4"
        style={{
          background: 'linear-gradient(135deg, var(--sl-s1), rgba(139,92,246,0.04))',
          border: `1px solid ${EXP_PRIMARY_BORDER}`,
        }}
      >
        <span className="text-[22px]">🗾</span>
        <div>
          <p className="text-[14px] font-semibold text-[var(--sl-t1)]">{tripName || 'Viagem'}</p>
          <p className="text-[12px] text-[var(--sl-t2)]">{destinations.join(' · ') || 'Destinos'}</p>
        </div>
      </div>

      <p className="text-[14px] font-semibold text-[var(--sl-t1)] mb-[14px]">
        Com quem vai viver essa aventura?
      </p>

      <div className="flex flex-col gap-2 mb-5">
        {COMPANIONS.map(c => {
          const selected = companion === c.value
          return (
            <button
              key={c.value}
              onClick={() => setCompanion(c.value)}
              className="flex items-center gap-3 p-[14px] rounded-[10px] text-left"
              style={
                selected
                  ? {
                      background: 'linear-gradient(135deg, var(--sl-s1), rgba(139,92,246,0.04))',
                      border: `1.5px solid ${accent}`,
                    }
                  : { background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }
              }
            >
              <span className="text-[22px]">{c.icon}</span>
              <div className="flex-1">
                <p className={cn('text-[14px] text-[var(--sl-t1)]', selected ? 'font-semibold' : 'font-medium')}>
                  {c.label}
                </p>
                <p className="text-[12px] text-[var(--sl-t2)]">{c.sub}</p>
                {c.xpBonus && selected && (
                  <p className="text-[10px] font-bold mt-[2px]" style={{ color: EXP_PRIMARY_LIGHT }}>{c.xpBonus}</p>
                )}
              </div>
              {selected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: accent }}>
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
        style={{ color: EXP_PRIMARY_LIGHT }}>
        Viajantes na missão
      </label>
      <div className="flex items-center gap-4 mb-5">
        <button
          onClick={() => setTravelers(Math.max(1, travelers - 1))}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] text-[var(--sl-t2)]"
          style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
        >
          −
        </button>
        <span className="font-[DM_Mono] text-[28px] font-bold text-[var(--sl-t1)]">{travelers}</span>
        <button
          onClick={() => setTravelers(travelers + 1)}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] text-white"
          style={{ background: accent }}
        >
          +
        </button>
      </div>
    </div>
  )
}
