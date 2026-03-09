'use client'

import { FUTURO_PRIMARY, FUTURO_PRIMARY_LIGHT } from '@/lib/futuro-colors'

interface ScenarioStat {
  label: string
  value: string
  color?: string
}

interface ScenarioCardProps {
  icon: string
  iconBg: string
  name: string
  tag: string
  tagColor: string
  description: string
  stats: ScenarioStat[]
  selected: boolean
  isRecommended?: boolean
  lifeScoreImpact?: string
  onSelect: () => void
}

export function ScenarioCard({
  icon,
  iconBg,
  name,
  tag,
  tagColor,
  description,
  stats,
  selected,
  isRecommended,
  lifeScoreImpact,
  onSelect,
}: ScenarioCardProps) {
  const accent = FUTURO_PRIMARY

  return (
    <button
      onClick={onSelect}
      className="w-full mx-4 mb-[10px] rounded-[16px] p-[13px_15px] text-left transition-colors"
      style={{
        background: selected
          ? 'rgba(139,92,246,0.06)'
          : 'var(--sl-s1)',
        border: selected
          ? '1px solid rgba(139,92,246,0.45)'
          : '1px solid var(--sl-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-[10px] mb-[9px]">
        <div
          className="w-[33px] h-[33px] rounded-[10px] flex items-center justify-center text-[16px]"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">{name}</span>
            {isRecommended && (
              <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-[10px] text-[10px] font-semibold bg-[rgba(16,185,129,0.12)] text-[#10b981]">
                ⭐ Recomendado
              </span>
            )}
          </div>
          <p className="text-[10px] font-semibold mt-[1px]" style={{ color: tagColor }}>{tag}</p>
        </div>
        {/* Selection circle */}
        <div
          className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0"
          style={{
            background: selected ? accent : 'transparent',
            border: selected ? `2px solid ${accent}` : '2px solid var(--sl-border-h)',
          }}
        >
          {selected && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-[var(--sl-t2)] leading-[1.5] mb-[9px] [&_strong]:text-[var(--sl-t1)]">
        {description}
      </p>

      {/* Stats row */}
      <div className="flex gap-[7px]">
        {stats.map((stat, i) => (
          <div key={i} className="flex-1 bg-[var(--sl-s2)] rounded-lg p-[7px_8px]">
            <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-[0.5px] mb-[2px]">{stat.label}</p>
            <p className="font-[DM_Mono] text-[12px] font-medium" style={{ color: stat.color ?? 'var(--sl-t1)' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Life Score impact */}
      {lifeScoreImpact && (
        <div className="flex items-center gap-[5px] mt-[7px] text-[11px] font-semibold" style={{ color: FUTURO_PRIMARY_LIGHT }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={FUTURO_PRIMARY_LIGHT} strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          {lifeScoreImpact}
        </div>
      )}
    </button>
  )
}
