'use client'

import { useXP } from '@/hooks/use-xp'
import { CARREIRA_GRAD } from '@/lib/carreira-colors'

export function CarreiraXpBar() {
  const { totalXP, level, levelTitle, levelProgress, nextLevelXP, loading } = useXP()

  if (loading) return null

  return (
    <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[rgba(139,92,246,0.2)] rounded-2xl px-[14px] py-[10px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-[6px]">
          <span
            className="font-[Syne] text-[10px] font-extrabold text-white px-2 py-[2px] rounded-lg"
            style={{ background: CARREIRA_GRAD }}
          >
            Nível {level}
          </span>
          <span className="text-[11px] text-[var(--sl-t2)]">{levelTitle}</span>
        </div>
        <span className="text-[11px] font-[DM_Mono] font-medium text-[var(--sl-t2)]">
          {totalXP.toLocaleString('pt-BR')} XP
        </span>
      </div>
      <div className="h-[5px] bg-[var(--sl-s3)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${levelProgress}%`, background: CARREIRA_GRAD }}
        />
      </div>
      <p className="text-[10px] text-[var(--sl-t2)] text-right mt-[3px]">
        {totalXP.toLocaleString('pt-BR')} / {nextLevelXP.toLocaleString('pt-BR')} XP → Nível {level + 1}
      </p>
    </div>
  )
}
