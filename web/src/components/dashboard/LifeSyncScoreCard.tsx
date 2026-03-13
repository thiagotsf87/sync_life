'use client'

import { useState, useEffect } from 'react'
import type { LifeDimension } from '@/hooks/use-life-map'

export interface LifeSyncScoreCardProps {
  realScore: number
  scoreLabel?: string
  lifeDimensions: LifeDimension[]
  lifeLoading: boolean
}

export function LifeSyncScoreCard({ realScore, scoreLabel, lifeDimensions, lifeLoading }: LifeSyncScoreCardProps) {
  const [scoreBarWidth, setScoreBarWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setScoreBarWidth(realScore || 74), 450)
    return () => clearTimeout(t)
  }, [realScore])

  return (
    <div className="flex items-center gap-7 p-[24px_28px] rounded-[20px] mb-5 sl-fade-up relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(0,85,255,0.10))', border: '1px solid rgba(99,102,241,0.20)' }}>
      <div className="absolute -left-14 -top-14 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)' }} />

      <div className="flex-shrink-0 relative z-10">
        <div className="font-[Syne] font-extrabold text-[80px] leading-none text-sl-grad">
          {realScore > 0 ? Math.round(realScore) : '\u2014'}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mt-0.5">Life Sync Score</div>
      </div>

      <div className="flex-1 min-w-0 relative z-10">
        <p className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-1">
          {scoreLabel ?? (realScore >= 75 ? 'Excelente equil\u00edbrio!' : realScore >= 50 ? 'Evolu\u00e7\u00e3o consistente' : realScore > 0 ? 'H\u00e1 espa\u00e7o para crescer' : 'Registre dados para calcular')}
        </p>
        <p className="text-[13px] text-[var(--sl-t3)] italic mb-3">
          {lifeDimensions.length > 0
            ? (() => {
                const weakest = [...lifeDimensions].sort((a, b) => a.value - b.value)[0]
                const strongest = [...lifeDimensions].sort((a, b) => b.value - a.value)[0]
                return `${strongest?.icon} ${strongest?.fullLabel} em alta. Fortale\u00e7a ${weakest?.icon} ${weakest?.fullLabel} para subir o score.`
              })()
            : 'Use os m\u00f3dulos diariamente para calcular seu score real.'}
        </p>
        <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full transition-[width] duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ width: `${scoreBarWidth}%`, background: 'linear-gradient(90deg, #6366f1, #0055ff)' }} />
        </div>
        <div className="grid grid-cols-4 gap-x-5 gap-y-2">
          {lifeLoading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="h-2.5 w-16 rounded bg-[var(--sl-s3)] animate-pulse" />
                  <div className="h-4 w-8 rounded bg-[var(--sl-s3)] animate-pulse mt-0.5" />
                </div>
              ))
            : lifeDimensions.map(d => {
                const c = d.value >= 75 ? '#10b981' : d.value >= 50 ? '#f59e0b' : '#f43f5e'
                return (
                  <div key={d.key} className="flex flex-col gap-0.5">
                    <div className="text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)]">{d.icon} {d.label}</div>
                    <div className="font-[DM_Mono] text-[16px] font-medium" style={{ color: c }}>{d.value}</div>
                  </div>
                )
              })
          }
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col gap-2 items-end relative z-10">
        <button className="px-4 py-2 rounded-[10px] text-[12px] font-semibold text-white cursor-pointer transition-opacity hover:opacity-85 whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #6366f1, #0055ff)', border: 'none' }}>
          Ver an\u00e1lise completa
        </button>
        <span className="text-[11px]" style={{ color: '#6366f1' }}>\u2191 +3 vs. semana passada</span>
      </div>
    </div>
  )
}
