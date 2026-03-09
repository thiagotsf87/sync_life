'use client'

import { EXP_PRIMARY, EXP_PRIMARY_LIGHT, EXP_PRIMARY_BORDER, EXP_GRAD } from '@/lib/exp-colors'
import { TRIP_XP } from '@/lib/exp-xp-mock'

interface ExpWizardStep5Props {
  tripName: string
  destinations: string[]
  tripType: string
  companion: string
  travelers: number
  startDate: Date | null
  endDate: Date | null
  budget: number
  syncFinance: boolean
  syncAgenda: boolean
}

const TRIP_TYPE_LABELS: Record<string, string> = {
  leisure: '🏖️ Lazer', work: '💼 Trabalho', study: '📚 Estudo', mixed: '🔀 Mista',
}
const COMPANION_LABELS: Record<string, string> = {
  solo: '🧳 Solo · Desbravador', couple: '💑 Casal', family: '👨‍👩‍👧‍👦 Família', friends: '👫 Amigos',
}
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function formatRange(start: Date | null, end: Date | null): string {
  if (!start || !end) return '—'
  return `${start.getDate()} — ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`
}

function calcDays(start: Date | null, end: Date | null): number {
  if (!start || !end) return 0
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export function ExpWizardStep5({
  tripName, destinations, tripType, companion, travelers,
  startDate, endDate, budget, syncFinance, syncAgenda,
}: ExpWizardStep5Props) {
  const accent = EXP_PRIMARY
  const days = calcDays(startDate, endDate)
  const totalXp = TRIP_XP.create + TRIP_XP.newCountry + TRIP_XP.budgetComplete

  return (
    <div className="px-4">
      {/* XP hero */}
      <div
        className="rounded-[16px] p-4 text-center mb-[14px]"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(236,72,153,0.08))',
          border: `1px solid rgba(139,92,246,0.28)`,
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.5px] mb-[6px]" style={{ color: EXP_PRIMARY_LIGHT }}>
          ⚡ XP TOTAL DESTA MISSÃO
        </p>
        <p className="font-[DM_Mono] text-[36px] font-bold" style={{
          background: EXP_GRAD,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          +{totalXp} XP
        </p>
        <p className="text-[11px] text-[var(--sl-t2)] mt-1">
          {TRIP_XP.create} criação + {TRIP_XP.newCountry} novo país + {TRIP_XP.budgetComplete} orçamento completo
        </p>
      </div>

      <p className="text-[14px] font-semibold text-[var(--sl-t1)] mb-4">
        Sua missão está pronta!
      </p>

      {/* Summary card */}
      <div
        className="rounded-[16px] p-4 mb-3"
        style={{
          background: 'var(--sl-s1)',
          border: `1px solid ${EXP_PRIMARY_BORDER}`,
        }}
      >
        <p className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)] mb-3">
          🗾 Missão {tripName}
        </p>
        <div className="flex flex-col gap-[10px]">
          <div className="flex justify-between">
            <span className="text-[12px] text-[var(--sl-t2)]">Destinos</span>
            <span className="text-[12px] text-[var(--sl-t1)]">{destinations.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[12px] text-[var(--sl-t2)]">Aventura</span>
            <span className="text-[12px] text-[var(--sl-t1)]">{TRIP_TYPE_LABELS[tripType] || tripType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[12px] text-[var(--sl-t2)]">Companhia</span>
            <span className="text-[12px] text-[var(--sl-t1)]">
              {COMPANION_LABELS[companion] || companion} · {travelers} viajante{travelers > 1 ? 's' : ''}
            </span>
          </div>
          <div className="h-[1px]" style={{ background: 'var(--sl-border)' }} />
          <div className="flex justify-between">
            <span className="text-[12px] text-[var(--sl-t2)]">Período</span>
            <span className="text-[12px]" style={{ color: EXP_PRIMARY_LIGHT, fontWeight: 600 }}>
              {days} dias de aventura
            </span>
          </div>
          <div className="h-[1px]" style={{ background: 'var(--sl-border)' }} />
          <div className="flex justify-between">
            <span className="text-[12px] text-[var(--sl-t2)]">Missão financeira</span>
            <span className="font-[DM_Mono] text-[13px] font-semibold text-[var(--sl-t1)]">
              R$ {budget.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="rounded-[10px] p-3 mb-3"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
        <p className="text-[11px] font-semibold mb-2" style={{ color: EXP_PRIMARY_LIGHT }}>
          ⚔️ ALIADOS ATIVADOS
        </p>
        <div className="flex gap-[6px] flex-wrap">
          {syncFinance && (
            <span className="inline-flex items-center gap-[3px] px-2 py-[3px] rounded-[10px] text-[10px] font-semibold"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
              ✓ Finanças · +10 XP/aporte
            </span>
          )}
          {syncAgenda && (
            <span className="inline-flex items-center gap-[3px] px-2 py-[3px] rounded-[10px] text-[10px] font-semibold"
              style={{ background: 'rgba(236,72,153,0.12)', color: '#f472b6' }}>
              ✓ Agenda
            </span>
          )}
          {!syncFinance && !syncAgenda && (
            <span className="text-[11px] text-[var(--sl-t3)]">Nenhuma integração ativa</span>
          )}
        </div>
      </div>
    </div>
  )
}
