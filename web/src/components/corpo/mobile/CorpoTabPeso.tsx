'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { calcIMC, type WeightEntry, type HealthProfile } from '@/hooks/use-corpo'

const CORPO_COLOR = '#f97316'
const CORPO_BG = 'rgba(249,115,22,0.12)'

const PERIOD_FILTERS = [
  { label: '30 dias', days: 30 },
  { label: '3 meses', days: 90 },
  { label: '6 meses', days: 180 },
  { label: '1 ano', days: 365 },
]

interface CorpoTabPesoProps {
  entries: WeightEntry[]
  profile: HealthProfile | null
  onOpenModal: () => void
}

export function CorpoTabPeso({ entries, profile, onOpenModal }: CorpoTabPesoProps) {
  const [periodDays, setPeriodDays] = useState(30)

  const cutoff = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - periodDays)
    return d
  }, [periodDays])

  const filtered = useMemo(
    () => entries.filter((e) => new Date(e.recorded_at) >= cutoff),
    [entries, cutoff]
  )

  const latest = entries[0] ?? null
  const oldest = filtered[filtered.length - 1] ?? null
  const delta = latest && oldest && latest.id !== oldest.id
    ? (latest.weight - oldest.weight).toFixed(1)
    : null

  // SVG sparkline for filtered entries (reversed to chronological)
  const chartPoints = useMemo(() => {
    const pts = [...filtered].reverse()
    if (pts.length < 2) return null
    const weights = pts.map((e) => e.weight)
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    const range = max - min || 1
    return pts.map((e, i) => ({
      x: (i / (pts.length - 1)) * 320,
      y: 80 - ((e.weight - min) / range) * 62,
    }))
  }, [filtered])

  const imc = latest && profile?.height_cm ? calcIMC(latest.weight, profile.height_cm) : null

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3">
        <span className="text-[13px] text-[var(--sl-t2)]">
          {entries.length} pesagem{entries.length !== 1 ? 's' : ''} registrada{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Period filter */}
      <div className="flex gap-[6px] px-4 pb-3 overflow-x-auto scrollbar-hide">
        {PERIOD_FILTERS.map(({ label, days }) => {
          const active = periodDays === days
          return (
            <button
              key={label}
              onClick={() => setPeriodDays(days)}
              className="px-[14px] py-[7px] rounded-full text-[13px] font-medium whitespace-nowrap flex-shrink-0"
              style={{
                background: active ? CORPO_COLOR : 'var(--sl-s1)',
                color: active ? '#000' : 'var(--sl-t2)',
                border: active ? 'none' : '1px solid var(--sl-border)',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Weight chart */}
      <div className="mx-4 mb-3 rounded-2xl p-4" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[14px] font-semibold text-[var(--sl-t1)]">Peso (kg)</span>
          {latest && (
            <div className="text-right">
              <p className="font-[DM_Mono] text-[18px]" style={{ color: CORPO_COLOR }}>{latest.weight}</p>
              {delta !== null && (
                <p className="text-[11px]" style={{ color: parseFloat(delta) < 0 ? '#10b981' : '#f43f5e' }}>
                  {parseFloat(delta) < 0 ? '↓' : '↑'} {Math.abs(parseFloat(delta))}kg no período
                </p>
              )}
            </div>
          )}
        </div>

        {chartPoints ? (
          <svg viewBox="0 0 320 90" style={{ width: '100%', height: 90 }}>
            <defs>
              <linearGradient id="w-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CORPO_COLOR} stopOpacity="0.25" />
                <stop offset="100%" stopColor={CORPO_COLOR} stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const d = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
              const area = d + ` L${chartPoints[chartPoints.length - 1].x},90 L0,90 Z`
              return (
                <>
                  <path d={area} fill="url(#w-grad)" />
                  <path d={d} fill="none" stroke={CORPO_COLOR} strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx={chartPoints[chartPoints.length - 1].x} cy={chartPoints[chartPoints.length - 1].y} r="5" fill={CORPO_COLOR} />
                  {profile?.weight_goal_kg && (
                    <line x1="0" y1="15" x2="320" y2="15" stroke="rgba(16,185,129,0.4)" strokeWidth="1.5" strokeDasharray="6,4" />
                  )}
                </>
              )
            })()}
          </svg>
        ) : (
          <div className="h-[90px] flex items-center justify-center">
            <p className="text-[13px] text-[var(--sl-t3)]">Dados insuficientes para o gráfico</p>
          </div>
        )}
      </div>

      {/* Composição corporal */}
      {latest && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pb-2">
            COMPOSIÇÃO CORPORAL
          </p>
          {(() => {
            // Entrada anterior no período para calcular deltas
            const prev = filtered.length >= 2 ? filtered[filtered.length - 1] : null
            const prevMuscle = prev?.body_fat_pct ? prev.weight * (1 - prev.body_fat_pct / 100) : null
            const latestMuscle = latest.body_fat_pct ? latest.weight * (1 - latest.body_fat_pct / 100) : null

            function deltaLabel(curr: number | null | undefined, previous: number | null | undefined, unit: string, invert = false) {
              if (!curr || !previous || curr === previous) return <span className="text-[11px] text-[var(--sl-t3)]">Estável</span>
              const diff = curr - previous
              const isPositive = diff > 0
              const isGood = invert ? !isPositive : isPositive
              return (
                <span className="text-[11px]" style={{ color: isGood ? '#10b981' : '#f43f5e' }}>
                  {isPositive ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}{unit} no período
                </span>
              )
            }

            return (
              <div className="grid grid-cols-2 gap-2 px-4 mb-3">
                <div className="rounded-[10px] p-3" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
                  <p className="text-[10px] text-[var(--sl-t2)] uppercase mb-1">Cintura</p>
                  <p className="font-[DM_Mono] text-[20px] font-bold" style={{ color: latest.waist_cm ? CORPO_COLOR : 'var(--sl-t3)' }}>
                    {latest.waist_cm ?? '—'}{latest.waist_cm ? <span className="text-[13px]">cm</span> : ''}
                  </p>
                  {deltaLabel(latest.waist_cm, prev?.waist_cm, 'cm', true)}
                </div>
                <div className="rounded-[10px] p-3" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
                  <p className="text-[10px] text-[var(--sl-t2)] uppercase mb-1">Quadril</p>
                  <p className="font-[DM_Mono] text-[20px] font-bold text-[var(--sl-t1)]">
                    {latest.hip_cm ?? '—'}{latest.hip_cm ? <span className="text-[13px]">cm</span> : ''}
                  </p>
                  {deltaLabel(latest.hip_cm, prev?.hip_cm, 'cm', true)}
                </div>
                <div className="rounded-[10px] p-3" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
                  <p className="text-[10px] text-[var(--sl-t2)] uppercase mb-1">Gordura corp.</p>
                  <p className="font-[DM_Mono] text-[20px] font-bold" style={{ color: latest.body_fat_pct ? '#f59e0b' : 'var(--sl-t3)' }}>
                    {latest.body_fat_pct ?? '—'}{latest.body_fat_pct ? <span className="text-[13px]">%</span> : ''}
                  </p>
                  {deltaLabel(latest.body_fat_pct, prev?.body_fat_pct, '%', true)}
                </div>
                <div className="rounded-[10px] p-3" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
                  <p className="text-[10px] text-[var(--sl-t2)] uppercase mb-1">Massa muscular</p>
                  <p className="font-[DM_Mono] text-[20px] font-bold" style={{ color: latestMuscle ? '#10b981' : 'var(--sl-t3)' }}>
                    {latestMuscle ? <>{latestMuscle.toFixed(1)}<span className="text-[13px]">kg</span></> : '—'}
                  </p>
                  {deltaLabel(latestMuscle, prevMuscle, 'kg', false)}
                </div>
              </div>
            )
          })()}
        </>
      )}

      {/* CTA registrar medição */}
      <div className="px-4 mb-3">
        <button
          onClick={onOpenModal}
          className="w-full rounded-[10px] p-[14px] flex items-center justify-between"
          style={{ background: `linear-gradient(135deg,${CORPO_COLOR},rgba(249,115,22,0.6))` }}
        >
          <div className="flex items-center gap-[10px]">
            <span className="text-[20px]">📏</span>
            <div className="text-left">
              <p className="text-[14px] font-semibold text-white">Registrar medição</p>
              <p className="text-[12px] text-white/70">
                {latest
                  ? `Último: ${new Date(latest.recorded_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
                  : 'Primeira pesagem'}
              </p>
            </div>
          </div>
          <Plus size={18} color="white" />
        </button>
      </div>

      {/* Histórico */}
      {filtered.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pb-2">HISTÓRICO</p>
          <div style={{ background: 'var(--sl-s1)', borderTop: '1px solid var(--sl-border)', borderBottom: '1px solid var(--sl-border)' }}>
            {filtered.slice(0, 10).map((entry, idx) => {
              const prev = filtered[idx + 1]
              const entryDelta = prev ? (entry.weight - prev.weight).toFixed(1) : null
              const entryImc = profile?.height_cm ? calcIMC(entry.weight, profile.height_cm) : null
              return (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)] last:border-b-0">
                  <div className="w-[42px] text-center flex-shrink-0">
                    <p className="font-[DM_Mono] text-[14px]" style={{ color: CORPO_COLOR }}>{entry.weight}</p>
                    <p className="text-[10px] text-[var(--sl-t3)]">kg</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--sl-t1)]">
                      {new Date(entry.recorded_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">
                      {entryImc ? `IMC ${entryImc.toFixed(1)}` : ''}
                      {entry.body_fat_pct ? ` · Gordura ${entry.body_fat_pct}%` : ''}
                    </p>
                  </div>
                  {entryDelta !== null && (
                    <span className="text-[12px] flex-shrink-0" style={{ color: parseFloat(entryDelta) < 0 ? '#10b981' : '#f43f5e' }}>
                      {parseFloat(entryDelta) < 0 ? '↓' : '↑'} {Math.abs(parseFloat(entryDelta))}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
