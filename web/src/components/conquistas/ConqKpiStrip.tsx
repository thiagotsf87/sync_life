import { Flame, Sparkles, Trophy, Wallet } from 'lucide-react'
import { fmtBRL } from '@/lib/format/currency'

interface ConqKpiStripProps {
  totalBadges: number
  unlockedCount: number
  currentStreak: number
  totalSavings?: number      // economizado (R$)
  superPaws?: number         // SuperPaws total
  badgesDeltaWeek?: number   // +N esta semana
  streakBest?: number        // recorde de streak
}

export function ConqKpiStrip({
  totalBadges,
  unlockedCount,
  currentStreak,
  totalSavings = 0,
  superPaws,
  badgesDeltaWeek = 0,
  streakBest,
}: ConqKpiStripProps) {
  const items = [
    {
      label: 'Badges',
      value: `${unlockedCount}/${totalBadges}`,
      sub:
        badgesDeltaWeek > 0
          ? `+${badgesDeltaWeek} esta semana`
          : `${Math.round((unlockedCount / Math.max(1, totalBadges)) * 100)}% desbloqueadas`,
      Icon: Trophy,
      color: 'var(--sl-em)',
    },
    {
      label: 'Streak',
      value: `${currentStreak}d`,
      sub: streakBest ? `recorde: ${streakBest}d` : 'dias consecutivos',
      Icon: Flame,
      color: 'var(--sl-mod-crp,#D97534)',
    },
    {
      label: 'Economizado',
      value: fmtBRL(totalSavings, { compact: totalSavings >= 10000 }),
      sub: 'rumo a metas',
      Icon: Wallet,
      color: 'var(--sl-mod-fin,#0F766E)',
    },
    {
      label: 'SuperPaws',
      value: superPaws != null ? superPaws.toLocaleString('pt-BR') : '—',
      sub: superPaws != null ? 'experiência acumulada' : 'sem registros',
      Icon: Sparkles,
      color: 'var(--sl-mod-mnt,#D9962E)',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3.5 max-md:grid-cols-2">
      {items.map((it) => (
        <article
          key={it.label}
          className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-[18px] flex flex-col gap-2.5"
        >
          <div
            className="w-[30px] h-[30px] rounded-[9px] inline-flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, ${it.color} 14%, transparent)`,
              color: it.color,
            }}
          >
            <it.Icon size={15} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[var(--sl-t3)] tracking-[0.06em] uppercase mb-1">
              {it.label}
            </div>
            <div className="sl-num-strong text-[26px] text-[var(--sl-t1)] leading-none">
              {it.value}
            </div>
          </div>
          <div className="text-[11.5px] text-[var(--sl-t3)]">{it.sub}</div>
        </article>
      ))}
    </div>
  )
}
