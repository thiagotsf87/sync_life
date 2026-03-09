'use client'

import { FUTURO_PRIMARY, FUTURO_PRIMARY_LIGHT } from '@/lib/futuro-colors'
import { XpBar } from '@/components/futuro/mobile/XpBar'
import { CoachCard } from '@/components/futuro/mobile/CoachCard'
import { ContribMonthBand } from '@/components/futuro/mobile/ContribMonthBand'

interface FuturoHistoricoMobileProps {
  objectiveName: string
  objectiveIcon: string
  open: boolean
  onClose: () => void
}

export function FuturoHistoricoMobile({ objectiveName, objectiveIcon, open, onClose }: FuturoHistoricoMobileProps) {
  const accent = FUTURO_PRIMARY

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[var(--sl-bg)] flex flex-col overflow-y-auto lg:hidden">
      {/* XP Bar */}
      <div className="pt-2"><XpBar /></div>

      {/* Title */}
      <div className="px-5 pt-3 pb-3">
        <h1 className="font-[Syne] text-[17px] font-bold text-[var(--sl-t1)]">Contribuições</h1>
        <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">{objectiveIcon} {objectiveName}</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-[14px]">
        <div
          className="bg-[var(--sl-s1)] rounded-[10px] p-[10px_12px] text-center"
          style={{ border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <p className="text-[9px] text-[var(--sl-t2)] uppercase tracking-[1px] mb-1">Total</p>
          <p className="font-[DM_Mono] text-[14px]" style={{ color: accent }}>R$ 34.800</p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-[10px_12px] text-center">
          <p className="text-[9px] text-[var(--sl-t2)] uppercase tracking-[1px] mb-1">
            XP Ganhos
          </p>
          <p className="font-[DM_Mono] text-[14px]" style={{ color: FUTURO_PRIMARY_LIGHT }}>
            2.480
          </p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-[10px_12px] text-center">
          <p className="text-[9px] text-[var(--sl-t2)] uppercase tracking-[1px] mb-1">
            Streak
          </p>
          <p className="font-[DM_Mono] text-[14px]" style={{ color: '#fb923c' }}>
            🔥 14
          </p>
        </div>
      </div>

      {/* Contribution bands */}
      <ContribMonthBand
        month="Fevereiro 2026"
        total="R$ 1.000"
        totalColor={accent}
        entries={[
          { id: 'c1', name: 'Contribuição automática', date: '01 Fev · Débito automático', value: '+R$ 800', color: accent, dotColor: accent },
          { id: 'c2', name: 'Excedente direcionado', date: '28 Fev · Sugestão IA aceita', value: '+R$ 200', color: '#10b981', dotColor: '#10b981' },
          {
            id: 'c3', name: 'XP — disciplina mensal', date: '28 Fev · 14 dias de streak ativo', value: '+40 XP', color: FUTURO_PRIMARY_LIGHT, dotColor: FUTURO_PRIMARY_LIGHT, isXpEvent: true,
          },
        ]}
      />

      {/* November band (empty month) */}
      <ContribMonthBand
        month="Novembro 2025"
        total="R$ 0"
        totalColor="#f43f5e"
        entries={[
          { id: 'n1', name: 'Mês sem contribuição', date: 'Saldo insuficiente — IPVA', value: 'R$ 0', color: '#f43f5e', dotColor: '#f43f5e' },
          {
            id: 'n2', name: 'Streak quebrado', date: 'Nov 2025 · Penalidade mínima', value: '−5 XP', color: '#f43f5e', dotColor: '#f43f5e', isXpEvent: true,
          },
        ]}
      />

      {/* Coach resilience note */}
      <div className="mt-2">
        <CoachCard
          message={
            <>Em Nov/25 você perdeu o streak, mas <strong>recuperou em 3 meses</strong>. Essa resiliência é o que separa quem realiza sonhos.</>
          }
        />
      </div>

      {/* Back button at bottom */}
      <div className="px-4 pb-6 pt-4">
        <button
          onClick={onClose}
          className="w-full h-[44px] rounded-[14px] text-[13px] font-semibold text-[var(--sl-t1)] bg-[var(--sl-s2)] border border-[var(--sl-border-h)]"
        >
          ← Voltar
        </button>
      </div>
    </div>
  )
}
