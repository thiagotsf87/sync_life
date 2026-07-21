'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { COACH_OS_ENABLED } from '@/lib/flags'
import { CoachHero, type CoachBrief } from '@/components/coach/CoachHero'
import { CrossBand, type CrossSegment } from '@/components/coach/CrossBand'
import { CoachLedLayout } from '@/components/coach/CoachLedLayout'
import { CoachAgenda, type CoachAgendaItem } from '@/components/coach/CoachAgenda'
import { CoachWhisper } from '@/components/coach/CoachWhisper'
import { useCoachBrief, useCoachCross, useCoachWhisper } from '@/hooks/use-coach'
import type { ModuleId } from '@/types/shell'

/** Payload de /api/ai/coach-cross (os hooks não são genéricos: `data` chega como unknown). */
interface CrossData {
  segments: CrossSegment[]
  action: { label: string; targetModule: ModuleId; href: string }
}

/** Payload de /api/ai/coach-whisper (WhisperSchema da rota). */
interface WhisperData {
  lead: string
  recommendation: string
  action?: { label: string; href: string }
  variant: 'soft' | 'solid'
}

export interface FinancasCoachSectionProps {
  period: string
  /** Evidência primária real (chart do fluxo de caixa). */
  evidence: ReactNode
  /** Detalhe full-width real (histórico). */
  detail?: ReactNode
  /** Itens da agenda lateral (próximas recorrentes/eventos). */
  agenda: CoachAgendaItem[]
}

/** Composição P-A (Coach-led) do módulo Finanças. Anatomia v3.1 Variante B. */
export function FinancasCoachSection({ period, evidence, detail, agenda }: FinancasCoachSectionProps) {
  const router = useRouter()
  const brief = useCoachBrief('financas', period)
  const cross = useCoachCross('financas', period)
  const whisper = useCoachWhisper('financas', period)

  const aside = <CoachAgenda title="Próximos 7 dias" items={agenda} emptyLabel="Nenhuma recorrente próxima." />

  const w = whisper.data ? (whisper.data as WhisperData) : null
  // Só navega em href relativo (path interno); href externo/inválido vindo da IA vira whisper sem ação.
  const whisperAction = w?.action && w.action.href.startsWith('/') ? w.action : undefined
  // [&>article]:mb-0 neutraliza o mb-3.5 interno do FluxoCaixaSection; o gap-3 rege o espaçamento.
  const evidenceWithWhisper = (
    <div className="flex flex-col gap-3 [&>article]:mb-0">
      {evidence}
      {w && (
        <CoachWhisper
          bold={w.lead}
          text={w.recommendation}
          action={whisperAction?.label}
          onAction={whisperAction ? () => router.push(whisperAction.href) : undefined}
          variant={w.variant}
        />
      )}
    </div>
  )

  if (!COACH_OS_ENABLED) {
    // Rollback do Coach OS não pode sumir com a evidência real do módulo:
    // mantém o scaffold com fluxo/agenda/histórico, sem hero/cross/whisper
    // (com a flag off os hooks não buscam nada, então o whisper nunca aparece aqui).
    return <CoachLedLayout className="mb-3.5" hero={null} evidence={evidenceWithWhisper} aside={aside} detail={detail} />
  }

  const hero = brief.data ? (
    <CoachHero moduleId="financas" period={period} brief={brief.data as CoachBrief} />
  ) : brief.error ? (
    <button
      type="button"
      onClick={brief.regenerate}
      className="rounded-2xl border border-[var(--sl-border)] p-4 text-left text-[13px] text-[var(--sl-t3)]"
    >
      {brief.error} Tentar de novo.
    </button>
  ) : (
    <div className="h-40 animate-pulse rounded-2xl bg-[var(--sl-s2)]" />
  )

  const crossData = cross.data ? (cross.data as CrossData) : null
  const crossBand = crossData ? <CrossBand segments={crossData.segments} action={crossData.action} /> : undefined

  return (
    <CoachLedLayout
      className="mb-3.5"
      hero={hero}
      crossBand={crossBand}
      evidence={evidenceWithWhisper}
      aside={aside}
      detail={detail}
    />
  )
}
