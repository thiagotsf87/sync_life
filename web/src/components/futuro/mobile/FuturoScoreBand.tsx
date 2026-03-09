'use client'

import { FUTURO_PRIMARY_LIGHT } from '@/lib/futuro-colors'

interface GoalChip {
  icon: string
  pct: number
  color: string
  borderColor: string
  bgColor: string
}

interface FuturoScoreBandProps {
  score: number
  onTrackCount: number
  delayedCount: number
  deltaPoints?: number
  narrativeText?: React.ReactNode
  goalChips?: GoalChip[]
}

function JornadaScoreRing({ score, size }: { score: number; size: number }) {
  const strokeWidth = 7
  const r = (size / 2) - strokeWidth
  const circumference = 2 * Math.PI * r
  const purplePct = score * 0.6
  const bluePct = score * 0.4
  const purpleArc = (circumference * purplePct) / 100
  const blueArc = (circumference * bluePct) / 100

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
        <circle fill="none" stroke="var(--sl-s3)" strokeWidth={strokeWidth} cx={size / 2} cy={size / 2} r={r} />
        <circle fill="none" stroke="#8b5cf6" strokeWidth={strokeWidth} cx={size / 2} cy={size / 2} r={r}
          strokeDasharray={`${purpleArc} ${circumference - purpleArc}`} strokeLinecap="round" />
        <circle fill="none" stroke="#0055ff" strokeWidth={strokeWidth} cx={size / 2} cy={size / 2} r={r}
          strokeDasharray={`${blueArc} ${circumference - blueArc}`} strokeLinecap="round"
          strokeDashoffset={`${-purpleArc}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[Syne] text-[24px] font-extrabold leading-none text-[var(--sl-t1)]">
          {score}
        </span>
        <span className="text-[9px]" style={{ color: FUTURO_PRIMARY_LIGHT }}>pontos</span>
      </div>
    </div>
  )
}

export function FuturoScoreBand({
  score,
  onTrackCount,
  delayedCount,
  deltaPoints,
  narrativeText,
  goalChips,
}: FuturoScoreBandProps) {
  return (
    <div
      className="mx-4 mb-[14px] rounded-[16px] p-4"
      style={{
        background: `linear-gradient(135deg, rgba(139,92,246,0.14), rgba(0,85,255,0.08))`,
        border: `1px solid rgba(139,92,246,0.3)`,
      }}
    >
      <div className="flex gap-[14px] mb-[10px]">
        <JornadaScoreRing score={score} size={76} />
        <div className="flex-1">
          <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)] mb-[5px]">Sua jornada</p>
          {narrativeText && (
            <p className="text-[12px] text-[var(--sl-t2)] leading-[1.55] italic [&_em]:text-[var(--sl-t1)] [&_em]:not-italic [&_em]:font-semibold">
              {narrativeText}
            </p>
          )}
        </div>
      </div>

      {goalChips && goalChips.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {goalChips.map((chip, i) => (
            <span
              key={i}
              className="py-[3px] px-[9px] rounded-[20px] text-[10px] font-bold"
              style={{
                background: chip.bgColor,
                color: chip.color,
                border: `1px solid ${chip.borderColor}`,
              }}
            >
              {chip.icon} {chip.pct}%
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
