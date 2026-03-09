'use client'

import { useXP } from '@/hooks/use-xp'
import { FUTURO_PRIMARY_BORDER, FUTURO_GRAD } from '@/lib/futuro-colors'

export function XpBar() {
  const { totalXP, level, levelTitle, levelProgress, nextLevelXP, loading } = useXP()

  if (loading) return null

  return (
    <div
      className="mx-4 mb-3 rounded-[16px] p-[10px_14px]"
      style={{
        background: 'var(--sl-s1)',
        border: `1px solid ${FUTURO_PRIMARY_BORDER}`,
      }}
    >
      {/* Top row: level + title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className="font-[Syne] text-[10px] font-extrabold text-white px-2 py-[2px] rounded-lg"
            style={{ background: FUTURO_GRAD }}
          >
            Nível {level}
          </span>
          <span className="text-[11px] text-[var(--sl-t2)]">{levelTitle}</span>
        </div>
        <span className="text-[11px] font-[DM_Mono] font-medium text-[var(--sl-t2)]">
          {totalXP.toLocaleString('pt-BR')} XP
        </span>
      </div>

      {/* XP progress bar */}
      <div className="h-[5px] rounded-[3px] overflow-hidden bg-[var(--sl-s3)]">
        <div
          className="h-full rounded-[3px]"
          style={{
            width: `${levelProgress}%`,
            background: FUTURO_GRAD,
          }}
        />
      </div>

      {/* XP label */}
      <p className="text-[10px] text-[var(--sl-t2)] text-right mt-[3px]">
        <span className="font-[DM_Mono]">{totalXP.toLocaleString('pt-BR')}</span>
        {' / '}
        <span className="font-[DM_Mono]">{nextLevelXP.toLocaleString('pt-BR')}</span>
        {' XP para Nível '}
        {level + 1}
      </p>
    </div>
  )
}
