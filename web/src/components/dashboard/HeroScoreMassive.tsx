'use client'

import { ArrowUpRight, ArrowRight, Check } from 'lucide-react'
import { SparklineCurve } from './SparklineCurve'

interface HeroScoreMassiveProps {
  score: number
  delta?: number // pontos vs semana passada (positivo ou negativo)
  evolution?: number[] // últimos N pontos (ex: 6 semanas)
  rangeLabel?: string // ex: '04/abr → hoje'
  evolutionLabel?: string // ex: 'EVOLUÇÃO · 6 SEMANAS'
  status?: 'tracking' | 'attention' | 'risk'
  onHowToImprove?: () => void
}

export function HeroScoreMassive({
  score,
  delta,
  evolution = [],
  rangeLabel,
  evolutionLabel = 'EVOLUÇÃO · 6 SEMANAS',
  status = 'tracking',
  onHowToImprove,
}: HeroScoreMassiveProps) {
  const hasScore = score > 0
  const displayScore = hasScore ? Math.round(score) : 0
  const deltaPositive = (delta ?? 0) >= 0
  const statusLabel = {
    tracking: 'Acompanhando',
    attention: 'Atenção',
    risk: 'Em risco',
  }[status]

  return (
    <section
      className="relative overflow-hidden border border-[var(--sl-border)] rounded-[24px] bg-[var(--sl-s-hero)] sl-fade-up transition-colors hover:border-[var(--sl-border-h)]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(15,118,110,0.08) 0%, transparent 50%)',
      }}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-9 px-9 py-8 max-lg:grid-cols-1 max-lg:gap-6 max-lg:px-7 max-lg:py-7">
        {/* Score gigante */}
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
            Life Sync Score
          </p>
          <div className="flex items-baseline gap-3">
            <span
              className="font-[Syne] font-extrabold tabular-nums leading-[0.95] text-[var(--sl-t1)]"
              style={{ fontSize: 'clamp(80px, 11vw, 120px)', letterSpacing: '-0.035em' }}
            >
              {hasScore ? displayScore : '—'}
            </span>
            <span className="text-[14px] text-[var(--sl-t3)]">pontos</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {delta != null && hasScore && (
              <span
                className="inline-flex items-center gap-1 font-[Syne] font-medium tabular-nums text-[12px]"
                style={{ color: deltaPositive ? 'var(--sl-em)' : 'var(--sl-danger)' }}
              >
                <ArrowUpRight size={12} />
                {deltaPositive ? '+' : ''}
                {delta} vs semana passada
              </span>
            )}
            <span className="text-[var(--sl-t4)] text-[11px]">·</span>
            <span className="font-[IBM_Plex_Mono] text-[11px] text-[var(--sl-t3)]">
              Equilíbrio entre 8 áreas
            </span>
          </div>
        </div>

        {/* Sparkline + descrição */}
        <div className="self-end max-lg:order-3">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
              {evolutionLabel}
            </p>
            {rangeLabel && (
              <span className="font-[IBM_Plex_Mono] text-[10px] text-[var(--sl-t4)]">
                {rangeLabel}
              </span>
            )}
          </div>
          <SparklineCurve data={evolution} width={420} height={56} />
        </div>

        {/* Pill + CTA direita */}
        <div className="flex flex-col gap-2.5 items-end max-lg:items-start max-lg:flex-row max-lg:items-center max-lg:justify-between max-lg:w-full">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.04em] border"
            style={{
              background: 'var(--sl-em-soft)',
              borderColor: 'var(--sl-border-em)',
              color: 'var(--sl-em)',
            }}
          >
            <Check size={11} />
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={onHowToImprove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] text-[12px] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            Como melhorar
            <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </section>
  )
}
