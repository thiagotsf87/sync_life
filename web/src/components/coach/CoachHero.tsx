'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODULES } from '@/lib/modules'
import { KpiStrip } from './KpiStrip'
import { useCoachStore } from '@/stores/coach-store'
import type { ModuleId } from '@/types/shell'

export interface CoachBrief {
  eyebrow: string
  headline: { text: string; emphasis?: string }
  stats: { label: string; value: string; big?: boolean }[]
  suggestions: { id: string; label: string; prompt: string; primary?: boolean }[]
}

export interface CoachHeroProps {
  moduleId: ModuleId
  period: string
  brief: CoachBrief
  className?: string
}

/** Hero único do Coach por módulo (G-05). Fato em cor do módulo (G-06). */
export function CoachHero({ moduleId, brief, className }: CoachHeroProps) {
  const mod = MODULES[moduleId] ?? MODULES.panorama
  const openDrawerWithPrompt = useCoachStore((s) => s.openDrawerWithPrompt)
  const { headline } = brief
  const parts = headline.emphasis ? headline.text.split(headline.emphasis) : [headline.text]
  return (
    <section className={cn('relative overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-s-hero)] p-6', className)}>
      <div className="sl-hero-noise pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">{brief.eyebrow}</p>
        <h2 className="mb-4 font-syne text-2xl font-bold tracking-tight text-[var(--sl-t1)]">
          {parts[0]}
          {headline.emphasis && <span style={{ color: mod.color }}>{headline.emphasis}</span>}
          {parts[1] ?? ''}
        </h2>
        <KpiStrip items={brief.stats.map((s) => ({ label: s.label, value: s.value }))} className="mb-4" />
        <div className="flex flex-wrap gap-2">
          {brief.suggestions.map((s) => (
            <button key={s.id} type="button" onClick={() => openDrawerWithPrompt(s.prompt)}
              className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium',
                s.primary ? 'bg-[var(--sl-em)] text-white' : 'border border-[var(--sl-border-em)] text-[var(--sl-t1)]')}>
              <Sparkles size={12} className={s.primary ? 'text-white' : 'text-[var(--sl-em)]'} />{s.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
