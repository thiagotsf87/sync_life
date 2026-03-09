'use client'

import { FUTURO_PRIMARY, FUTURO_PRIMARY_LIGHT, FUTURO_GRAD } from '@/lib/futuro-colors'
import { FUTURO_ACHIEVEMENTS } from '@/lib/futuro-xp-mock'
import { CoachCard } from '@/components/futuro/mobile/CoachCard'
import { AchievementGrid } from '@/components/futuro/mobile/AchievementGrid'

interface FuturoCelebracaoMobileProps {
  objectiveName: string
  objectiveIcon: string
  accumulated: number
  duration: number // months
  achievedPct: number
  open: boolean
  onClose: () => void
  onNewObjective?: () => void
  onViewArchive?: () => void
}

export function FuturoCelebracaoMobile({
  objectiveName,
  objectiveIcon,
  accumulated,
  duration,
  achievedPct,
  open,
  onClose,
  onNewObjective,
  onViewArchive,
}: FuturoCelebracaoMobileProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[var(--sl-bg)] flex flex-col overflow-y-auto lg:hidden">
      {/* Hero */}
      <div className="text-center pt-[26px] px-5 pb-[18px]">
        <div className="text-[54px] mb-[10px]">🏆</div>
        <h1 className="font-[Syne] text-[24px] font-extrabold text-[var(--sl-t1)] leading-[1.2] mb-[7px]">
          Missão Concluída!
        </h1>
        <p className="text-[13px] text-[var(--sl-t2)] leading-[1.6]">
          Thiago, você é incrível! <strong className="text-[#10b981]">R$ {accumulated.toLocaleString('pt-BR')}</strong><br />em {duration} meses de disciplina pura. 🚀
        </p>
      </div>

      {/* XP Explosion */}
      <div
        className="mx-4 mb-3 rounded-[16px] p-[14px_15px] flex items-center gap-[14px]"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(0,85,255,0.12))',
          border: '1px solid rgba(139,92,246,0.4)',
        }}
      >
        <div className="text-center px-2">
          <p className="font-[Syne] text-[28px] font-extrabold leading-none" style={{ color: FUTURO_PRIMARY }}>
            +350
          </p>
          <p className="text-[10px] mt-[2px]" style={{ color: FUTURO_PRIMARY_LIGHT }}>XP GANHOS</p>
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-[var(--sl-t1)] mb-1">🎯 Nível 5 desbloqueado!</p>
          <div className="h-[5px] rounded-full overflow-hidden bg-[var(--sl-s3)] mb-[5px]">
            <div className="h-full rounded-full" style={{ width: '100%', background: `linear-gradient(90deg, ${FUTURO_PRIMARY}, #ec4899)` }} />
          </div>
          <p className="text-[11px] text-[var(--sl-t2)]">
            Life Score Futuro: <strong className="text-[#10b981]">58 → 70 pts</strong> ↑
          </p>
        </div>
      </div>

      {/* Achievements */}
      <AchievementGrid achievements={FUTURO_ACHIEVEMENTS} />

      {/* Coach celebrating */}
      <CoachCard
        label="Coach Sync — Parabéns!"
        message={
          <>Você provou para si mesmo que consegue. Agora quer <strong>acelerar o apartamento</strong> com esses R$ 800/mês? Calculei o impacto.</>
        }
        cta="Ver próxima missão"
        onCtaClick={onNewObjective}
      />

      {/* Action pills */}
      <div className="flex gap-[10px] px-4 pb-6 pt-2">
        <button
          onClick={onNewObjective}
          className="flex-1 flex items-center justify-center gap-1.5 h-[46px] rounded-[20px] text-[13px] font-semibold text-white"
          style={{ background: FUTURO_GRAD }}
        >
          🚀 Nova missão
        </button>
        <button
          onClick={onViewArchive}
          className="flex-1 flex items-center justify-center gap-1.5 h-[46px] rounded-[20px] text-[13px] font-semibold text-[var(--sl-t1)]
                     bg-[var(--sl-s2)] border border-[var(--sl-border-h)]"
        >
          Ver arquivo
        </button>
      </div>
    </div>
  )
}
