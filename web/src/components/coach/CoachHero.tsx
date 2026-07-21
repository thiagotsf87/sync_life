'use client'

import { Sparkles, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODULES } from '@/lib/modules'
import { MicroStatRail, type MicroStat } from './MicroStatRail'
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

/**
 * Hero unico do Coach (G-05) na anatomia P-A Variante B:
 * grid [1fr_280px] — headline editorial + pilulas de acao (esq.) e MicroStatRail (dir.).
 * A frase E a tela. KPIs sao evidencia inline, nao strip (P-01/P-02/P-03).
 */
export function CoachHero({ moduleId, brief, className }: CoachHeroProps) {
  const mod = MODULES[moduleId] ?? MODULES.panorama
  const openDrawerWithPrompt = useCoachStore((s) => s.openDrawerWithPrompt)
  const { headline } = brief
  // Emphasis por indexOf: so a 1a ocorrencia vira span; se ausente do texto, renderiza tudo plain.
  const emphasis = headline.emphasis
  const emIdx = emphasis ? headline.text.indexOf(emphasis) : -1
  // Exatamente 1 stat ancora (P-02): a 1a marcada big; senao a de indice 1 (saldo), senao a 0.
  const firstBig = brief.stats.findIndex((s) => s.big)
  const bigIndex = firstBig >= 0 ? firstBig : Math.min(1, brief.stats.length - 1)
  const stats: MicroStat[] = brief.stats.map((s, i) => ({ label: s.label, value: s.value, big: i === bigIndex }))
  // P-05: sempre ha uma proxima acao — se o modelo nao marcar nenhuma primary, a 1a pilula assume.
  const suggestions = brief.suggestions.some((s) => s.primary)
    ? brief.suggestions
    : brief.suggestions.map((s, i) => (i === 0 ? { ...s, primary: true } : s))

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-s-hero)] px-6 py-7',
        'grid grid-cols-[1fr_280px] gap-10 items-end max-lg:grid-cols-1 max-lg:gap-6',
        className,
      )}
    >
      <div className="sl-hero-noise pointer-events-none absolute inset-0 opacity-60" />

      {/* Esquerda: conversacao do Coach */}
      <div className="relative min-w-0">
        <div className="mb-4 inline-flex items-center gap-2">
          <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[var(--sl-border-em)] bg-[var(--sl-em-soft)] text-[var(--sl-em)]">
            <Sparkles size={13} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-em)]">
            {brief.eyebrow}
          </span>
        </div>

        <h2 className="max-w-[22ch] font-syne text-[clamp(24px,3.4vw,38px)] font-medium leading-[1.15] tracking-tight text-[var(--sl-t1)]">
          {emphasis && emIdx >= 0 ? (
            <>
              {headline.text.slice(0, emIdx)}
              <span className="font-semibold" style={{ color: mod.color }}>{emphasis}</span>
              {headline.text.slice(emIdx + emphasis.length)}
            </>
          ) : (
            headline.text
          )}
        </h2>

        {/* Pilulas de acao (P-05): 1a primaria = proxima acao, resto ghost */}
        <div className="mt-6 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s.id} type="button" onClick={() => openDrawerWithPrompt(s.prompt)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full text-[13px] font-medium',
                s.primary
                  ? 'bg-[var(--sl-em)] px-[18px] py-[11px] font-semibold text-white'
                  : 'border border-[var(--sl-border-h)] px-4 py-2.5 text-[var(--sl-t2)] hover:border-[var(--sl-em)]',
              )}>
              {s.primary && <Check size={14} />}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Direita: KPIs como evidencia inline (sem card) */}
      <MicroStatRail items={stats} className="relative pb-1.5 max-lg:flex-row max-lg:flex-wrap max-lg:gap-8" />
    </section>
  )
}
