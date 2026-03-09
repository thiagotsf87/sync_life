'use client'

import { useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings } from 'lucide-react'
import { useLifeMap } from '@/hooks/use-life-map'
import { AIInsightCard } from '@/components/ui/ai-insight-card'

const MODULE_META: Record<string, { emoji: string; color: string; bg: string }> = {
  financas:   { emoji: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  tempo:      { emoji: '⏳', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  futuro:     { emoji: '🔮', color: '#0055ff', bg: 'rgba(0,85,255,0.15)' },
  corpo:      { emoji: '🏃', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  mente:      { emoji: '🧠', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  patrimonio: { emoji: '📈', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
}

function getProgressColor(pct: number): string {
  if (pct >= 70) return '#10b981'
  if (pct >= 40) return '#f59e0b'
  return '#f43f5e'
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
      // Default mock arcs
      return [
        { color: '#10b981', dasharray: `${circ * 0.42} ${circ * 0.58}`, dashoffset: 0 },
        { color: '#06b6d4', dasharray: `${circ * 0.18} ${circ * 0.82}`, dashoffset: -(circ * 0.44) },
        { color: '#0055ff', dasharray: `${circ * 0.13} ${circ * 0.87}`, dashoffset: -(circ * 0.64) },
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
        color: m.color ?? '#10b981',
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
        emoji: meta?.emoji ?? '📊',
        color: meta?.color ?? '#64748b',
        bg: meta?.bg ?? 'rgba(100,116,139,0.1)',
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
    <div className="max-w-[600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 lg:px-0">
        <h1 className="font-[Syne] text-[20px] font-bold text-sl-grad">Life Score</h1>
        <button
          onClick={() => router.push('/configuracoes')}
          className="flex h-9 w-9 items-center justify-center rounded-[10px]
                     bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Hero ring */}
      <div className="flex flex-col items-center py-5 px-4">
        <div className="relative mb-4" style={{ width: 200, height: 200 }}>
          <svg viewBox="0 0 200 200" width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
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
            <span className="font-[Syne] text-[56px] font-extrabold text-[var(--sl-t1)] leading-none">
              {loading ? '—' : score}
            </span>
            <span className="text-[13px] text-[var(--sl-t2)] mt-1">de 100</span>
          </div>
        </div>

        {/* Evolution badge — Jornada only */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[20px]
                        bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" width="14" height="14">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          </svg>
          <span className="text-[13px] font-medium text-[#10b981]">
            +4 pontos esta semana · Melhor semana do mês!
          </span>
        </div>
      </div>

      {/* Module grid */}
      <p className="px-5 pb-2 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
        Por Módulo
      </p>
      <div className="grid grid-cols-2 gap-2 px-4 lg:px-0">
        {moduleGrid.map(m => (
          <div
            key={m.key}
            className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[14px]"
                style={{ background: m.bg }}
              >
                {m.emoji}
              </div>
              <span className="text-[12px] font-medium text-[var(--sl-t1)]">{m.label}</span>
            </div>
            {m.active ? (
              <>
                <p className="font-[DM_Mono] text-[18px] font-semibold" style={{ color: m.color }}>
                  {m.pct}%
                </p>
                <div className="h-1.5 rounded-full overflow-hidden bg-[var(--sl-s3)] mt-1.5">
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${m.pct}%`, background: m.color }}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="font-[DM_Mono] text-[18px] font-semibold text-[var(--sl-t3)]">—</p>
                <p className="text-[10px] text-[var(--sl-t3)] mt-1">Ative no v3</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* AI Insight — Jornada only */}
      <div className="px-4 mt-3 pb-6 lg:px-0">
        <AIInsightCard icon="🎯" label="Como melhorar">
          {weakest
            ? <>Seu módulo <strong>{weakest.label}</strong> está em {weakest.pct}%.
               Agendar a revisão semanal toda segunda pode adicionar <strong>+8 pontos</strong>.</>
            : <>Ative módulos para receber sugestões personalizadas de como melhorar seu score.</>
          }
        </AIInsightCard>
      </div>
    </div>
  )
}
