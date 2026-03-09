'use client'

import { useXP } from '@/hooks/use-xp'
import { EXP_PRIMARY_BORDER, EXP_GRAD } from '@/lib/exp-colors'

export function ExpXpBar() {
  const { totalXP, level, levelTitle, levelProgress, nextLevelXP, loading } = useXP()

  if (loading) return null

  return (
    <div
      className="mx-4 mb-3 rounded-[16px] p-[10px_14px]"
      style={{ background: 'var(--sl-s1)', border: `1px solid ${EXP_PRIMARY_BORDER}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-[6px]">
          <span
            className="font-[Syne] text-[10px] font-extrabold text-white rounded-lg px-2 py-[2px]"
            style={{ background: EXP_GRAD }}
          >
            Nível {level}
          </span>
          <span className="text-[11px] text-[var(--sl-t2)]">{levelTitle}</span>
        </div>
        <span className="text-[11px] font-[DM_Mono] font-medium text-[var(--sl-t2)]">
          {totalXP.toLocaleString('pt-BR')} XP
        </span>
      </div>
      <div className="h-[5px] rounded-[3px] overflow-hidden" style={{ background: 'var(--sl-s3)' }}>
        <div
          className="h-full rounded-[3px]"
          style={{ width: `${levelProgress}%`, background: EXP_GRAD }}
        />
      </div>
      <p className="text-[10px] text-[var(--sl-t2)] text-right mt-[3px]">
        {totalXP.toLocaleString('pt-BR')} / {nextLevelXP.toLocaleString('pt-BR')} XP → Nível {level + 1}
      </p>
    </div>
  )
}
