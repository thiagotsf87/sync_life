'use client'

import { COACH_OS_ENABLED } from '@/lib/flags'
import { CoachHero, type CoachBrief } from '@/components/coach/CoachHero'
import { CrossBand, type CrossSegment } from '@/components/coach/CrossBand'
import { useCoachBrief, useCoachCross } from '@/hooks/use-coach'
import type { ModuleId } from '@/types/shell'

export function FinancasCoachSection({ period }: { period: string }) {
  const brief = useCoachBrief('financas', period)
  const cross = useCoachCross('financas', period)
  if (!COACH_OS_ENABLED) return null
  return (
    <div className="mb-5 flex flex-col gap-4">
      {brief.loading && <div className="h-40 animate-pulse rounded-2xl bg-[var(--sl-s2)]" />}
      {brief.error && (
        <button
          onClick={brief.regenerate}
          className="rounded-2xl border border-[var(--sl-border)] p-4 text-left text-[13px] text-[var(--sl-t3)]"
        >
          {brief.error} Tentar de novo.
        </button>
      )}
      {!!brief.data && <CoachHero moduleId="financas" period={period} brief={brief.data as CoachBrief} />}
      {!!cross.data && (
        <CrossBand
          segments={(cross.data as { segments: CrossSegment[] }).segments}
          action={(cross.data as { action: { label: string; targetModule: ModuleId; href: string } }).action}
        />
      )}
    </div>
  )
}
