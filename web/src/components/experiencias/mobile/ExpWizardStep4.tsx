'use client'

import { useState } from 'react'
import { EXP_PRIMARY, EXP_PRIMARY_LIGHT, EXP_PRIMARY_BG, EXP_PRIMARY_BORDER, EXP_GRAD } from '@/lib/exp-colors'

export interface WizardObjective {
  id: string
  name: string
  icon: string
}

interface ExpWizardStep4Props {
  budget: number
  setBudget: (v: number) => void
  currency: string
  setCurrency: (v: string) => void
  syncFinance: boolean
  setSyncFinance: (v: boolean) => void
  syncAgenda: boolean
  setSyncAgenda: (v: boolean) => void
  syncFuturo: boolean
  setSyncFuturo: (v: boolean) => void
  linkedObjectiveId: string | null
  setLinkedObjectiveId: (v: string | null) => void
  objectives: WizardObjective[]
  tripDays: number
  travelers: number
}

function Toggle({ value, onChange, color = '#10b981' }: { value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-[40px] h-[22px] rounded-[11px] relative shrink-0 transition-colors"
      style={{ background: value ? color : 'var(--sl-s3)' }}
    >
      <div
        className="w-4 h-4 rounded-full bg-white absolute top-[3px] transition-[left]"
        style={{ left: value ? 21 : 3 }}
      />
    </button>
  )
}

export function ExpWizardStep4({
  budget, setBudget, currency, setCurrency,
  syncFinance, setSyncFinance, syncAgenda, setSyncAgenda,
  syncFuturo, setSyncFuturo, linkedObjectiveId, setLinkedObjectiveId, objectives,
  tripDays, travelers,
}: ExpWizardStep4Props) {
  const accent = EXP_PRIMARY
  const perDay = tripDays > 0 ? Math.round(budget / tripDays) : 0
  const perDayPerPerson = travelers > 0 ? Math.round(perDay / travelers) : perDay

  return (
    <div className="px-4">
      <p className="text-[14px] font-semibold text-[var(--sl-t1)] mb-1">
        Investimento na aventura
      </p>
      <p className="text-[12px] text-[var(--sl-t2)] mb-4">
        Quanto vale essa experiência pra você?
      </p>

      <div className="flex gap-2 mb-[14px]">
        <div className="flex-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
            style={{ color: EXP_PRIMARY_LIGHT }}>
            Meta financeira
          </label>
          <input
            type="number"
            value={budget || ''}
            onChange={e => setBudget(Number(e.target.value))}
            placeholder="15000"
            className="w-full px-[14px] py-3 rounded-[10px] text-[14px] text-[var(--sl-t1)] outline-none"
            style={{
              background: 'var(--sl-s1)',
              border: '1.5px solid rgba(139,92,246,0.3)',
            }}
          />
        </div>
        <div className="w-[90px]">
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
            style={{ color: EXP_PRIMARY_LIGHT }}>
            Moeda
          </label>
          <div className="px-[10px] py-3 rounded-[10px] text-[14px] text-[var(--sl-t1)] text-center"
            style={{ background: 'var(--sl-s1)', border: '1.5px solid var(--sl-border)' }}>
            {currency}
          </div>
        </div>
      </div>

      {/* Daily estimate */}
      {budget > 0 && (
        <div
          className="rounded-[16px] p-[14px] mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.06))',
            border: `1px solid ${EXP_PRIMARY_BORDER}`,
          }}
        >
          <p className="text-[11px] font-bold mb-1 uppercase tracking-[0.5px]" style={{ color: EXP_PRIMARY_LIGHT }}>
            💰 MISSÃO FINANCEIRA
          </p>
          <p className="font-[DM_Mono] text-[22px] font-bold" style={{ color: accent }}>
            R$ {perDay.toLocaleString('pt-BR')}/dia
          </p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-1">
            por viajante: R$ {perDayPerPerson.toLocaleString('pt-BR')}/dia · {tripDays} dias
          </p>
          <p className="text-[10px] font-bold mt-[6px]" style={{ color: EXP_PRIMARY_LIGHT }}>
            ⚡ Cada aporte = +10 XP
          </p>
        </div>
      )}

      {/* Integrations */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between p-3 rounded-[10px]"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
          <div className="flex items-center gap-[10px]">
            <span className="text-[16px]">💰</span>
            <div>
              <p className="text-[13px] text-[var(--sl-t1)]">Aliado: Finanças</p>
              <p className="text-[11px]" style={{ color: EXP_PRIMARY_LIGHT }}>
                Cria envelope auto · +10 XP/aporte
              </p>
            </div>
          </div>
          <Toggle value={syncFinance} onChange={setSyncFinance} />
        </div>
        <div className="flex items-center justify-between p-3 rounded-[10px]"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
          <div className="flex items-center gap-[10px]">
            <span className="text-[16px]">📅</span>
            <div>
              <p className="text-[13px] text-[var(--sl-t1)]">Aliado: Tempo</p>
              <p className="text-[11px]" style={{ color: EXP_PRIMARY_LIGHT }}>
                Bloqueia agenda · visual de aventura
              </p>
            </div>
          </div>
          <Toggle value={syncAgenda} onChange={setSyncAgenda} />
        </div>
        <div className="flex items-center justify-between p-3 rounded-[10px]"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
          <div className="flex items-center gap-[10px]">
            <span className="text-[16px]">🔮</span>
            <div>
              <p className="text-[13px] text-[var(--sl-t1)]">Aliado: Futuro</p>
              <p className="text-[11px]" style={{ color: EXP_PRIMARY_LIGHT }}>
                Registra na missão de vida · +20 XP
              </p>
            </div>
          </div>
          <Toggle value={syncFuturo} onChange={setSyncFuturo} color="#8b5cf6" />
        </div>
      </div>

      {/* Objective selector — shown when Futuro toggle is on */}
      {syncFuturo && (
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.5px] mb-[8px]"
            style={{ color: EXP_PRIMARY_LIGHT }}>
            Missão de Vida
          </p>
          {objectives.length > 0 ? (
            <div className="flex flex-col gap-[6px]">
              {objectives.map(obj => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => setLinkedObjectiveId(linkedObjectiveId === obj.id ? null : obj.id)}
                  className="flex items-center gap-[10px] p-[10px] rounded-[10px] text-left transition-colors w-full"
                  style={{
                    background: linkedObjectiveId === obj.id
                      ? 'rgba(139,92,246,0.15)'
                      : 'var(--sl-s2)',
                    border: `1.5px solid ${linkedObjectiveId === obj.id
                      ? '#8b5cf6'
                      : 'var(--sl-border)'}`,
                  }}
                >
                  <span className="text-[18px] shrink-0">{obj.icon}</span>
                  <span className="text-[13px] font-medium text-[var(--sl-t1)] truncate flex-1">{obj.name}</span>
                  {linkedObjectiveId === obj.id && (
                    <span className="text-[11px] font-bold shrink-0" style={{ color: '#c4b5fd' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-[10px] text-[12px] text-[var(--sl-t2)]"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}>
              ⚠️ Nenhuma missão de vida ativa. Crie um Objetivo no módulo Futuro primeiro.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
