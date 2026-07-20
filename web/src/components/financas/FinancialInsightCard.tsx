'use client'

import { CoachWhisper } from '@/components/coach'
import { useCoachWhisper } from '@/hooks/use-coach'

// Mesmo nome de export + mesmas props que o pai (financas/page.tsx) já importa.
export function FinancialInsightCard({ month, year }: { month: number; year: number }) {
  const period = `${year}-${String(month).padStart(2, '0')}`
  const { data, loading, error, regenerate } = useCoachWhisper('financas', period)
  if (loading) return <div className="h-16 animate-pulse rounded-xl bg-[var(--sl-s2)]" />
  if (error) return <button onClick={regenerate} className="text-[13px] text-[var(--sl-t3)]">{error} Tentar de novo.</button>
  if (!data) return null
  const w = data as { lead: string; recommendation: string; action?: { label: string; href: string }; variant: 'soft' | 'solid' }
  return <CoachWhisper bold={w.lead} text={w.recommendation} action={w.action?.label} variant={w.variant} />
}
