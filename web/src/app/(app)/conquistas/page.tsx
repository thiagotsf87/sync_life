'use client'

import { useMemo, useState } from 'react'
import {
  Briefcase,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Dumbbell,
  Plane,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { AIInsightCard } from '@/components/ui/ai-insight-card'
import { PanoramaMobileShell } from '@/components/dashboard/PanoramaMobileShell'
import { useBadgeEngine } from '@/hooks/use-badge-engine'
import { useXP } from '@/hooks/use-xp'

import { HeroLevel } from '@/components/conquistas/HeroLevel'
import { ConqKpiStrip } from '@/components/conquistas/ConqKpiStrip'
import { RecentBadges } from '@/components/conquistas/RecentBadges'
import { BadgeCollection } from '@/components/conquistas/BadgeCollection'
import { CategoryProgress, type CategoryProgressItem } from '@/components/conquistas/CategoryProgress'
import { FriendsRanking, type RankingEntry } from '@/components/conquistas/FriendsRanking'
import { mapEngineRarity } from '@/components/conquistas/RarityPill'
import type { UiBadge } from '@/components/conquistas/types'

// ─── CATEGORY MAP ─────────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  string,
  { label: string; color: string; Icon: LucideIcon }
> = {
  financial:    { label: 'Finanças',     color: 'var(--sl-mod-fin,#0F766E)', Icon: DollarSign },
  goals:        { label: 'Futuro',       color: 'var(--sl-mod-fut,#8B7BD4)', Icon: Target },
  body:         { label: 'Corpo',        color: 'var(--sl-mod-crp,#D97534)', Icon: Dumbbell },
  mind:         { label: 'Mente',        color: 'var(--sl-mod-mnt,#D9962E)', Icon: Sparkles },
  consistency:  { label: 'Consistência', color: 'var(--sl-mod-mnt,#D9962E)', Icon: TrendingUp },
  career:       { label: 'Carreira',     color: 'var(--sl-mod-car,#DB6478)', Icon: Briefcase },
  patrimony:    { label: 'Patrimônio',   color: 'var(--sl-mod-ptr,#4F88D4)', Icon: Wallet },
  experiences:  { label: 'Experiências', color: 'var(--sl-mod-exp,#C76795)', Icon: Plane },
  agenda:       { label: 'Tempo',        color: 'var(--sl-mod-tmp,#3CA0B5)', Icon: Clock },
  default:      { label: 'Conquistas',   color: 'var(--sl-em)',              Icon: Trophy },
}

// Ordered category list for "Progresso por categoria" (always show all 7)
const PROGRESS_CATEGORY_IDS: ReadonlyArray<keyof typeof CATEGORY_META> = [
  'financial',
  'body',
  'mind',
  'goals',
  'patrimony',
  'experiences',
  'career',
]

function metaFor(category?: string) {
  return CATEGORY_META[category ?? 'default'] ?? CATEGORY_META.default
}

function formatPtDate(iso?: string | null): string | null {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return null
  }
}

// ─── MOCK DATA (apenas onde ainda não há dado real) ─────────────────────────────

const MOCK_FRIENDS: RankingEntry[] = [
  { position: 1, name: 'Helena Vasconcelos', level: 18, xp: 6280 },
  { position: 2, name: 'Paulo Souza',         level: 17, xp: 5920 },
  { position: 3, name: 'Mariana Alves',       level: 15, xp: 5340 },
  { position: 4, name: 'Você',                 level: 12, xp: 4280, isYou: true },
  { position: 5, name: 'Rafael Teixeira',      level: 11, xp: 3920 },
]

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ConquistasPage() {
  const {
    badges: engineBadges,
    unlockedCount,
    totalCount,
    loading: badgesLoading,
  } = useBadgeEngine()

  const {
    totalXP,
    level,
    levelTitle,
    nextLevelXP,
    currentLevelXP,
    loading: xpLoading,
  } = useXP()

  // ─── Normalize engine badges → UiBadge ───────────────────────────────────
  const uiBadges: UiBadge[] = useMemo(() => {
    return engineBadges.map((eb) => {
      const meta = metaFor(eb.badge.category)
      return {
        id:            eb.badge.id,
        name:          eb.badge.name,
        description:   eb.badge.description,
        Icon:          meta.Icon,
        category:      eb.badge.category ?? 'default',
        categoryLabel: meta.label,
        color:         meta.color,
        rarity:        mapEngineRarity(eb.badge.rarity),
        unlocked:      eb.unlocked,
        unlockedAt:    formatPtDate((eb.badge as unknown as { unlocked_at?: string }).unlocked_at),
        progress:      eb.currentValue,
        progressMax:   eb.targetValue,
      }
    })
  }, [engineBadges])

  const recentBadges = useMemo(
    () => uiBadges.filter((b) => b.unlocked).slice(0, 3),
    [uiBadges],
  )

  const nextLocked = useMemo(
    () => uiBadges.find((b) => !b.unlocked) ?? null,
    [uiBadges],
  )

  // Categories progress (derived from real badges, fallback shows 0/0)
  const categoryProgress: CategoryProgressItem[] = useMemo(() => {
    return PROGRESS_CATEGORY_IDS.map((id) => {
      const meta = CATEGORY_META[id]
      const pool = uiBadges.filter((b) => b.category === id)
      return {
        id,
        name:     meta.label,
        unlocked: pool.filter((b) => b.unlocked).length,
        total:    pool.length,
        color:    meta.color,
      }
    }).filter((c) => c.total > 0)
  }, [uiBadges])

  const [showLocked, setShowLocked] = useState(true)

  const pct =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  // ─── Loading state ──────────────────────────────────────────────────────
  if (badgesLoading && uiBadges.length === 0) {
    return (
      <div className="max-w-[1160px] mx-auto px-10 py-9 text-[13px] text-[var(--sl-t3)]">
        Carregando conquistas...
      </div>
    )
  }

  return (
    <>
      {/* ═══════ MOBILE ═══════ */}
      <PanoramaMobileShell
        title="Conquistas"
        subtitle={`${unlockedCount} de ${totalCount} desbloqueadas`}
      >
        <div className="mx-4 mb-3 rounded-[16px] p-5 bg-[var(--sl-s1)] border border-[var(--sl-border)]">
          <div className="flex items-end gap-1.5 mb-1.5">
            <span className="font-[Syne] text-[42px] font-extrabold leading-none sl-num-strong text-[var(--sl-em)]">
              {unlockedCount}
            </span>
            <span className="sl-num text-[16px] text-[var(--sl-t3)] mb-1">/ {totalCount}</span>
          </div>
          <p className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)] mb-1">
            Conquistas desbloqueadas
          </p>
          <div className="h-1.5 rounded-full overflow-hidden bg-[var(--sl-s3)] mb-1.5">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: 'var(--sl-grad)' }}
            />
          </div>
          <p className="text-[10px] text-[var(--sl-t3)]">{pct}% do total desbloqueado</p>
        </div>

        {nextLocked && (
          <div className="px-4 mb-3">
            <AIInsightCard label="Motivação">
              Você tem <strong>{unlockedCount} conquistas</strong> e contando.
              Seu próximo marco é <strong>{nextLocked.name}</strong>, continue assim.
            </AIInsightCard>
          </div>
        )}

        <div className="px-4 pb-6">
          <BadgeCollection
            badges={uiBadges}
            showLocked={showLocked}
            onShowLockedChange={setShowLocked}
          />
        </div>
      </PanoramaMobileShell>

      {/* ═══════ DESKTOP ═══════ */}
      <div className="max-w-[1400px] mx-auto px-10 py-8 pb-16 hidden lg:flex flex-col gap-6">

        {/* 1. TopBar */}
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5">
            CONQUISTAS
          </p>
          <h1 className="font-[Syne] font-bold text-3xl tracking-tight text-[var(--sl-t1)]">
            Onde você chegou.
          </h1>
        </header>

        {/* 2. Hero */}
        <HeroLevel
          level={xpLoading ? 1 : level}
          levelTitle={levelTitle}
          xp={totalXP}
          xpToNextLevel={nextLevelXP}
          currentLevelXP={currentLevelXP}
          nextBadge={nextLocked ? { name: nextLocked.name } : null}
          rankPosition="Top 8%"
          rankScope="Brasil"
          weeklyXP={320}
          superPawsThisWeek={totalXP > 0 ? Math.round(totalXP * 0.3) : undefined}
        />

        {/* 3. KPI strip */}
        <ConqKpiStrip
          totalBadges={totalCount}
          unlockedCount={unlockedCount}
          currentStreak={0}
          totalSavings={0}
          superPaws={totalXP}
          badgesDeltaWeek={3}
        />

        {/* 4. Recém-conquistadas */}
        <RecentBadges badges={recentBadges} />

        {/* 5. Grid 1.2fr / 1fr — Progresso por categoria + Amigos */}
        <section
          className="grid gap-6 max-lg:grid-cols-1"
          style={{ gridTemplateColumns: '1.2fr 1fr' }}
        >
          {categoryProgress.length > 0 ? (
            <CategoryProgress categories={categoryProgress} />
          ) : (
            <CategoryProgress
              categories={PROGRESS_CATEGORY_IDS.map((id) => ({
                id,
                name:     CATEGORY_META[id].label,
                unlocked: 0,
                total:    0,
                color:    CATEGORY_META[id].color,
              }))}
            />
          )}
          <FriendsRanking entries={MOCK_FRIENDS} />
        </section>

        {/* 6. Coleção completa */}
        <BadgeCollection
          badges={uiBadges}
          showLocked={showLocked}
          onShowLockedChange={setShowLocked}
        />
      </div>
    </>
  )
}
