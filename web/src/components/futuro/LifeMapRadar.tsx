'use client'

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { LifeDimension } from '@/hooks/use-life-map'

// ─── Score color helper ───────────────────────────────────────────────────────

function scoreColor(v: number): string {
  if (v >= 75) return '#10b981'
  if (v >= 50) return '#f59e0b'
  return '#f43f5e'
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: LifeDimension & { value: number } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-xl px-3 py-2 shadow-md text-center">
      <p className="text-[13px] font-bold text-[var(--sl-t1)]">{d.icon} {d.fullLabel}</p>
      <p className="font-[DM_Mono] text-xl font-bold mt-0.5" style={{ color: scoreColor(d.value) }}>
        {d.value}%
      </p>
    </div>
  )
}

// ─── Score badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ dim }: { dim: LifeDimension }) {
  const c = scoreColor(dim.value)
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)]
                    transition-colors hover:border-[var(--sl-border-h)]">
      <span className="text-[15px]">{dim.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] leading-none">{dim.label}</p>
        <div className="mt-1 h-1 rounded-full overflow-hidden bg-[var(--sl-s3)]">
          <div className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${dim.value}%`, background: c }} />
        </div>
      </div>
      <span className="font-[DM_Mono] text-[13px] font-bold shrink-0" style={{ color: c }}>
        {dim.value}
      </span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface LifeMapRadarProps {
  dimensions: LifeDimension[]
  overallScore: number
  loading?: boolean
  compact?: boolean  // for dashboard widget
  className?: string
}

export function LifeMapRadar({
  dimensions,
  overallScore,
  loading = false,
  compact = false,
  className,
}: LifeMapRadarProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', compact ? 'h-[200px]' : 'h-[300px]', className)}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#10b981 transparent transparent transparent' }} />
      </div>
    )
  }

  if (dimensions.length === 0) return null

  // recharts needs { label, value, fullLabel, icon, color } per axis
  const chartData = dimensions.map(d => ({
    label: d.label,
    value: d.value,
    icon: d.icon,
    fullLabel: d.fullLabel,
    color: d.color,
  }))

  const overallColor = scoreColor(overallScore)
  const radarSize = compact ? 200 : 280

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header with overall score */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)]">Mapa da Vida</p>
          {!compact && (
            <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
              Equilíbrio entre todas as dimensões
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-[Syne] font-extrabold text-2xl leading-none" style={{ color: overallColor }}>
            {overallScore}
          </p>
          <p className="text-[9px] uppercase tracking-widest text-[var(--sl-t3)]">score geral</p>
        </div>
      </div>

      {/* Radar */}
      <div style={{ height: radarSize }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%"
            outerRadius={compact ? 70 : 100}>
            <defs>
              <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#0055ff" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <PolarGrid
              stroke="var(--sl-border)"
              strokeOpacity={0.6}
            />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: 'var(--sl-t2)', fontSize: compact ? 9 : 11, fontWeight: 600 }}
            />
            <Radar
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#radarGrad)"
              fillOpacity={0.35}
              dot={{ fill: '#10b981', r: compact ? 3 : 4, strokeWidth: 0 }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score badges — only in full (non-compact) mode */}
      {!compact && (
        <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
          {dimensions.map(dim => (
            <ScoreBadge key={dim.key} dim={dim} />
          ))}
        </div>
      )}
    </div>
  )
}
