'use client'

import { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  HeartPulse,
  Brain,
  Briefcase,
} from 'lucide-react'
import { useLifeMap } from '@/hooks/use-life-map'
import { AIInsightCard } from '@/components/ui/ai-insight-card'

type IconCmp = React.ComponentType<{ size?: number; className?: string }>

const MODULE_META: Record<string, { icon: IconCmp; color: string; bg: string }> = {
  financas:   { icon: DollarSign,  color: '#1FA67A', bg: 'rgba(31,166,122,0.12)' },
  tempo:      { icon: Clock,       color: '#3CA0B5', bg: 'rgba(60,160,181,0.12)' },
  futuro:     { icon: Target,      color: '#8B7BD4', bg: 'rgba(139,123,212,0.12)' },
  corpo:      { icon: HeartPulse,  color: '#D97534', bg: 'rgba(217,117,52,0.12)' },
  mente:      { icon: Brain,       color: '#D9962E', bg: 'rgba(217,150,46,0.12)' },
  patrimonio: { icon: Briefcase,   color: '#4F88D4', bg: 'rgba(79,136,212,0.12)' },
}

export default function LifeScorePage() {
  const router = useRouter()
  const { dimensions, overallScore, loading } = useLifeMap()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const score = overallScore || 72

  // Build SVG arcs
  const r = 86
  const circ = 2 * Math.PI * r

  const activeModules = useMemo(() =>
    dimensions.filter(d => d.value > 0).map(d => ({
      key: d.key,
      pct: d.value,
      ...MODULE_META[d.key],
    })),
    [dimensions]
  )

  const arcs = useMemo(() => {
    if (activeModules.length === 0) {
      return [
        { color: '#1FA67A', dasharray: `${circ * 0.42} ${circ * 0.58}`, dashoffset: 0 },
        { color: '#3CA0B5', dasharray: `${circ * 0.18} ${circ * 0.82}`, dashoffset: -(circ * 0.44) },
        { color: '#8B7BD4', dasharray: `${circ * 0.13} ${circ * 0.87}`, dashoffset: -(circ * 0.64) },
      ]
    }
    const totalPct = activeModules.reduce((s, m) => s + m.pct, 0)
    const totalArc = (score / 100) * circ
    let offset = 0
    return activeModules.map(m => {
      const share = m.pct / totalPct
      const arcLen = totalArc * share
      const gap = 5
      const a = {
        color: m.color ?? '#0F766E',
        dasharray: `${Math.max(0, arcLen - gap)} ${circ - Math.max(0, arcLen - gap)}`,
        dashoffset: -offset,
      }
      offset += arcLen
      return a
    })
  }, [activeModules, score, circ])

  // Module grid data
  const moduleGrid = useMemo(() => {
    const keys = ['financas', 'tempo', 'futuro', 'corpo', 'mente', 'patrimonio']
    return keys.map(key => {
      const dim = dimensions.find(d => d.key === key)
      const meta = MODULE_META[key]
      return {
        key,
        label: dim?.fullLabel ?? key.charAt(0).toUpperCase() + key.slice(1),
        Icon: meta?.icon ?? Target,
        color: meta?.color ?? '#6F7986',
        bg: meta?.bg ?? 'rgba(111,121,134,0.1)',
        pct: dim?.value ?? 0,
        active: (dim?.value ?? 0) > 0,
      }
    })
  }, [dimensions])

  // Find weakest active module for AI insight
  const weakest = useMemo(() => {
    const active = moduleGrid.filter(m => m.active)
    if (active.length === 0) return null
    return active.reduce((min, m) => m.pct < min.pct ? m : min, active[0])
  }, [moduleGrid])

  return (
    <div className="max-w-[1400px] mx-auto px-10 py-8 max-lg:px-6 max-sm:px-4 max-sm:py-6">

      {/* TopBar */}
      <header className="flex items-end justify-between gap-6 mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5">
            PANORAMA · LIFE SYNC
          </p>
          <h1 className="font-[Syne] font-bold text-3xl tracking-tight text-[var(--sl-t1)]">
            Life Score
          </h1>
        </div>
        <button
          onClick={() => router.push('/configuracoes')}
          className="flex h-9 w-9 items-center justify-center rounded-[10px]
                     bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]
                     hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          aria-label="Configurações"
        >
          <Settings size={16} />
        </button>
      </header>

      <div className="grid grid-cols-[1fr_360px] gap-6 max-lg:grid-cols-1">

        {/* Hero ring (unico — G-05) */}
        <div className="bg-[var(--sl-s-hero)] border border-[var(--sl-border)] rounded-[16px] p-8 flex flex-col items-center">
          <div className="relative mb-5" style={{ width: 220, height: 220 }}>
            <svg viewBox="0 0 200 200" width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r={r} fill="none" stroke="var(--sl-s3)" strokeWidth="12" />
              {mounted && arcs.map((arc, i) => (
                <circle
                  key={i}
                  cx="100" cy="100" r={r}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={arc.dasharray}
                  strokeDashoffset={arc.dashoffset}
                  className="transition-all duration-1000"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[Syne] sl-num-strong text-[64px] font-extrabold text-[var(--sl-t1)] leading-none">
                {loading ? '—' : score}
              </span>
              <span className="font-[DM_Sans] text-[13px] text-[var(--sl-t2)] mt-1">de 100</span>
            </div>
          </div>

          {/* Evolution badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[20px]
                          bg-[var(--sl-em-soft)] border border-[var(--sl-border-em)]">
            <TrendingUp size={14} className="text-[var(--sl-em)]" />
            <span className="font-[DM_Sans] text-[13px] font-medium text-[var(--sl-em)]">
              +4 pontos esta semana · Melhor semana do mês
            </span>
          </div>
        </div>

        {/* Side: AI insight (Jornada) */}
        <div className="flex flex-col gap-4">
          <AIInsightCard icon="AI" label="Como melhorar">
            {weakest
              ? <>Seu módulo <strong>{weakest.label}</strong> está em {weakest.pct}%.
                 Agendar a revisão semanal toda segunda pode adicionar <strong>+8 pontos</strong>.</>
              : <>Ative módulos para receber sugestões personalizadas de como melhorar seu score.</>
            }
          </AIInsightCard>
        </div>
      </div>

      {/* Module grid */}
      <div className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-3">
          POR MÓDULO
        </p>
        <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {moduleGrid.map(m => {
            const Icon = m.Icon
            return (
              <div
                key={m.key}
                className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[12px] p-4
                           hover:border-[var(--sl-border-h)] transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: m.bg, color: m.color }}
                  >
                    <Icon size={15} />
                  </div>
                  <span className="font-[DM_Sans] text-[13px] font-medium text-[var(--sl-t1)]">{m.label}</span>
                </div>
                {m.active ? (
                  <>
                    <p className="sl-num-strong text-[22px] font-semibold" style={{ color: m.color }}>
                      {m.pct}%
                    </p>
                    <div className="h-1.5 rounded-full overflow-hidden bg-[var(--sl-s3)] mt-2">
                      <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{ width: `${m.pct}%`, background: m.color }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="sl-num-strong text-[22px] font-semibold text-[var(--sl-t3)]">—</p>
                    <p className="font-[DM_Sans] text-[11px] text-[var(--sl-t3)] mt-1">Ative no v3</p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
