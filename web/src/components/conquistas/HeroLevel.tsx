'use client'

import { Flame, Sparkles, TrendingUp, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface HeroLevelProps {
  level: number
  levelTitle?: string
  xp: number
  xpToNextLevel: number
  currentLevelXP?: number
  nextBadge?: { name: string; xpRemaining?: number } | null
  rankPosition?: string       // e.g. "Top 8%"
  rankScope?: string          // e.g. "Brasil"
  weeklyXP?: number           // gained this week
  superPawsThisWeek?: number  // for "DESTA SEMANA · 1.245 SuperPaws · +330"
}

export function HeroLevel({
  level,
  levelTitle = 'Equilibrista',
  xp,
  xpToNextLevel,
  currentLevelXP = 0,
  nextBadge,
  rankPosition = 'Top 8%',
  rankScope = 'Brasil',
  weeklyXP = 320,
  superPawsThisWeek,
}: HeroLevelProps) {
  const span = Math.max(1, xpToNextLevel - currentLevelXP)
  const progress = Math.max(0, Math.min(1, (xp - currentLevelXP) / span))
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)
  const remaining = Math.max(0, xpToNextLevel - xp)

  return (
    <article
      className="relative bg-[var(--sl-s-hero,var(--sl-s1))] border border-[var(--sl-border)] rounded-[24px] p-8 grid items-center gap-9 max-lg:grid-cols-1 max-lg:gap-6"
      style={{
        gridTemplateColumns: 'auto 1fr auto',
        backgroundImage:
          'radial-gradient(circle at 30% 0%, var(--sl-em-soft) 0%, transparent 55%)',
      }}
    >
      {/* Ring + nível (gradient — exceção G-03) */}
      <div className="relative w-[150px] h-[150px] shrink-0 mx-auto">
        <svg width={150} height={150} className="-rotate-90">
          <defs>
            <linearGradient id="hero-lvl-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F766E" />
              <stop offset="100%" stopColor="#0B2D34" />
            </linearGradient>
          </defs>
          <circle cx={75} cy={75} r={radius} fill="none" stroke="var(--sl-s3)" strokeWidth={6} />
          <circle
            cx={75}
            cy={75}
            r={radius}
            fill="none"
            stroke="url(#hero-lvl-grad)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold tracking-[0.16em] text-[var(--sl-t3)] uppercase">
            Nível
          </span>
          <span className="font-[Syne] font-bold text-[64px] leading-none mt-0.5 sl-num-strong text-[var(--sl-t1)]">
            {level}
          </span>
        </div>
      </div>

      {/* Texto principal */}
      <div className="flex flex-col gap-2 min-w-0">
        <div className="text-[10px] font-bold tracking-[0.14em] text-[var(--sl-em)] uppercase">
          {levelTitle}
        </div>
        <h1 className="font-[Syne] font-semibold text-3xl tracking-tight m-0 text-[var(--sl-t1)]">
          Você está em ritmo.
        </h1>
        <p className="text-[14px] text-[var(--sl-t2)] leading-relaxed">
          <span className="sl-num">{xp.toLocaleString('pt-BR')}</span> de{' '}
          <span className="sl-num">{xpToNextLevel.toLocaleString('pt-BR')}</span> XP até o próximo nível.{' '}
          <span className="text-[var(--sl-t3)] ml-1">
            Falta <span className="sl-num">{remaining.toLocaleString('pt-BR')}</span> XP.
          </span>
        </p>

        {/* Próxima conquista */}
        {nextBadge && (
          <div className="mt-2 p-[10px_14px] rounded-[12px] bg-[var(--sl-s1)] border border-[var(--sl-border)] flex items-center gap-3 max-w-[480px]">
            <div
              className="w-9 h-9 rounded-[8px] inline-flex items-center justify-center shrink-0 border"
              style={{
                background: 'var(--sl-em-soft)',
                color: 'var(--sl-em)',
                borderColor: 'var(--sl-border-em)',
              }}
            >
              <Trophy size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-[var(--sl-t3)]">Próximo desbloqueio</p>
              <p className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">
                {nextBadge.name}
              </p>
            </div>
            {nextBadge.xpRemaining != null && (
              <span className="sl-num text-[11.5px] text-[var(--sl-em)] flex items-center gap-1 shrink-0">
                <Flame size={11} />
                {nextBadge.xpRemaining} XP
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats laterais (right rail) */}
      <div className="flex flex-col gap-3.5 min-w-[160px] max-lg:flex-row max-lg:flex-wrap max-lg:min-w-0">
        <SideStat
          label="RANKING GLOBAL"
          value={rankPosition}
          sub={rankScope}
          Icon={TrendingUp}
          iconColor="var(--sl-mod-pan)"
        />
        {superPawsThisWeek != null ? (
          <SideStat
            label="DESTA SEMANA"
            value={`${superPawsThisWeek.toLocaleString('pt-BR')} SuperPaws`}
            sub={`+${weeklyXP} XP`}
            Icon={Sparkles}
            iconColor="var(--sl-em)"
          />
        ) : (
          <SideStat
            label="DESTA SEMANA"
            value={`+${weeklyXP}`}
            sub="XP ganhos"
            Icon={Sparkles}
            iconColor="var(--sl-em)"
          />
        )}
      </div>
    </article>
  )
}

interface SideStatProps {
  label: string
  value: string
  sub?: string
  Icon: LucideIcon
  iconColor?: string
}

function SideStat({ label, value, sub, Icon, iconColor }: SideStatProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded-[8px] inline-flex items-center justify-center border shrink-0"
        style={{
          background: 'var(--sl-s1)',
          borderColor: 'var(--sl-border)',
          color: iconColor ?? 'var(--sl-t2)',
        }}
      >
        <Icon size={13} />
      </div>
      <div className="min-w-0">
        <div className="text-[9.5px] font-bold tracking-[0.12em] text-[var(--sl-t3)] uppercase">
          {label}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="sl-num-strong text-[17px] text-[var(--sl-t1)]">{value}</span>
          {sub && <span className="text-[10px] text-[var(--sl-t3)]">{sub}</span>}
        </div>
      </div>
    </div>
  )
}
