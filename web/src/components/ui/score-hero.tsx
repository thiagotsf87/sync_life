'use client'

import { cn } from '@/lib/utils'

interface ScoreHeroStat {
  label: string
  value: string
  unit?: string
}

interface ScoreHeroProps {
  score: number        // 0-100
  label: string        // e.g. "Score Corporal"
  subtext?: string     // e.g. "Bom"
  /** Rich descriptive title shown next to ring — e.g. "Corpo em evolucao" */
  title?: string
  /** Description line below title — e.g. "Voce perdeu 1.3 kg nos ultimos 30 dias." */
  description?: string
  stats?: ScoreHeroStat[]
  accentColor?: string // gradient start
  className?: string
}

export function ScoreHero({
  score,
  label,
  subtext,
  title,
  description,
  stats,
  accentColor = '#f97316',
  className,
}: ScoreHeroProps) {
  const size = 86
  const strokeWidth = 7
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  // Unique gradient ID per instance
  const gradId = `score-grad-${score}`

  return (
    <div
      className={cn(
        'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl',
        'flex items-center gap-5 p-6',
        'relative overflow-hidden sl-fade-up',
        'transition-colors hover:border-[var(--sl-border-h)]',
        className,
      )}
    >
      {/* Top accent bar — gradient orange → yellow */}
      <div
        className="absolute top-0 left-[22px] right-[22px] h-[2.5px] rounded-b"
        style={{ background: `linear-gradient(90deg, ${accentColor}, #f59e0b)` }}
      />

      {/* Radial glow effect */}
      <div
        className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accentColor}0F, transparent 70%)` }}
      />

      {/* Ring */}
      <div className="shrink-0 relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--sl-s3)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-[DM_Mono] font-medium text-[22px] leading-none text-[var(--sl-t1)]">
            {score}
          </span>
          <span className="text-[9px] text-[var(--sl-t3)] uppercase tracking-[.08em] mt-0.5">
            Score
          </span>
        </div>
      </div>

      {/* Info — center */}
      <div className="flex-1 min-w-0">
        {title ? (
          <>
            <p className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-[3px]">
              {title}
            </p>
            {description && (
              <p className="text-[12px] text-[var(--sl-t2)] leading-relaxed">
                {description}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">
              {label}
            </p>
            {subtext && (
              <p className="text-[14px] font-semibold text-[var(--sl-t1)]">{subtext}</p>
            )}
          </>
        )}
      </div>

      {/* Stats — far right with divider */}
      {stats && stats.length > 0 && (
        <div className="flex items-center gap-5 shrink-0">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-5">
              {i > 0 && (
                <div className="w-px h-7 bg-[var(--sl-border)]" />
              )}
              <div className="text-center">
                <span className="font-[DM_Mono] font-medium text-[18px] text-[var(--sl-t1)]">
                  {s.value}
                </span>
                {s.unit && (
                  <span className="text-[11px] text-[var(--sl-t3)] ml-1">{s.unit}</span>
                )}
                <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-[.06em] mt-0.5">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
