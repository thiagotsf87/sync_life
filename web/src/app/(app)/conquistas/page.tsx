'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { AIInsightCard } from '@/components/ui/ai-insight-card'
import { PanoramaMobileShell } from '@/components/dashboard/PanoramaMobileShell'
import { useBadgeEngine } from '@/hooks/use-badge-engine'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type BadgeCat    = 'fin' | 'meta' | 'cons' | 'agenda' | 'corpo' | 'patrimonio' | 'experiencias'
type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'legendary'

interface Badge {
  id:          number
  cat:         BadgeCat
  icon:        string
  name:        string
  desc:        string
  rarity:      BadgeRarity
  unlocked:    boolean
  date:        string | null
  criteria:    string
  progress:    number
  progressMax: number
  motivation:  string
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const CAT_COLORS: Record<BadgeCat, string> = {
  fin:         '#10b981',
  meta:        '#0055ff',
  cons:        '#f59e0b',
  agenda:      '#06b6d4',
  corpo:       '#f97316',
  patrimonio:  '#10b981',
  experiencias:'#06b6d4',
}

const CAT_LABELS: Record<string, string> = {
  all:         'Todas',
  fin:         '💰 Financeiras',
  meta:        '🎯 Metas',
  cons:        '📅 Consistência',
  agenda:      '📆 Agenda',
  corpo:       '🏥 Corpo',
  patrimonio:  '📈 Patrimônio',
  experiencias:'✈️ Experiências',
}

const RARITY_LABELS: Record<BadgeRarity, string> = {
  common:    'Comum',
  uncommon:  'Incomum',
  rare:      'Rara',
  legendary: 'Lendária',
}

const BADGES: Badge[] = []

// Dados derivados estáticos (determinísticos — sem random)
const TOTAL_UNLOCKED = 0
const TOTAL_ALL      = 0
const PCT            = 0

const LIVE_RECENT_UNLOCKED: Badge[] = []

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getRarityBorder(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'uncommon':  return 'border-[rgba(16,185,129,0.4)]'
    case 'rare':      return 'border-[rgba(139,92,246,0.5)] shadow-[0_0_20px_rgba(139,92,246,0.12)]'
    case 'legendary': return 'border-[rgba(245,158,11,0.6)] shadow-[0_0_24px_rgba(245,158,11,0.15)]'
    default:          return ''
  }
}

function getRarityPill(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'common':    return 'bg-[rgba(100,116,139,0.15)] text-[#64748b]'
    case 'uncommon':  return 'bg-[rgba(16,185,129,0.12)] text-[#10b981]'
    case 'rare':      return 'bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]'
    case 'legendary': return 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]'
  }
}

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--sl-t3)] mb-[14px] flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[var(--sl-border)]">
      {children}
    </div>
  )
}

function BadgeCard({ badge: b, delay, onClick }: { badge: Badge; delay: number; onClick: () => void }) {
  const col        = CAT_COLORS[b.cat]
  const progressPct = Math.round(b.progress / b.progressMax * 100)
  const rarityBorder = b.unlocked ? getRarityBorder(b.rarity) : ''
  const isLegendaryUnlocked = b.rarity === 'legendary' && b.unlocked

  return (
    <div
      className={`bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[18px_16px] text-center relative overflow-hidden sl-fade-up transition-all
        ${b.unlocked ? `cursor-pointer hover:-translate-y-[3px] hover:border-[var(--sl-border-h)] ${rarityBorder}` : 'cursor-default'}
        ${isLegendaryUnlocked ? 'bg-gradient-to-br from-[var(--sl-s1)] to-[rgba(245,158,11,0.04)]' : ''}`}
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      {/* Lock overlay */}
      {!b.unlocked && (
        <div className="absolute top-[10px] right-[10px] w-5 h-5 rounded-[6px] bg-[var(--sl-s3)] border border-[var(--sl-border)] flex items-center justify-center text-[11px]">
          🔒
        </div>
      )}

      {/* Rarity pill */}
      <div className={`inline-flex items-center gap-[3px] text-[9px] font-bold uppercase tracking-[0.07em] px-[7px] py-[2px] rounded-[8px] mb-[6px] ${getRarityPill(b.rarity)}`}>
        {RARITY_LABELS[b.rarity]}
      </div>

      {/* Icon */}
      <div
        className={`w-[54px] h-[54px] rounded-[16px] flex items-center justify-center text-[28px] mx-auto mb-3 transition-transform
          ${b.unlocked ? 'hover:scale-[1.08]' : 'grayscale opacity-40'}
          ${isLegendaryUnlocked ? 'badge-shimmer jornada:badge-shimmer' : ''}`}
        style={{ background: b.unlocked ? `${col}22` : `${col}11` }}
      >
        {b.icon}
      </div>

      {/* Name & desc */}
      <div className="font-[Syne] font-bold text-[12px] text-[var(--sl-t1)] mb-1 leading-[1.3]">{b.name}</div>
      <div className="text-[11px] text-[var(--sl-t2)] leading-[1.5] mb-2">{b.desc}</div>

      {/* Date or progress */}
      {b.unlocked
        ? <div className="text-[10px] text-[var(--sl-t3)]">🗓 {b.date}</div>
        : (
          <div className="mt-2">
            <div className="h-1 bg-[var(--sl-s3)] rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full transition-[width] duration-1000"
                style={{ width: `${progressPct}%`, background: col }}
              />
            </div>
            <div className="text-[10px] text-[var(--sl-t3)]">{b.progress}/{b.progressMax}</div>
          </div>
        )
      }

      {/* Bottom color bar (unlocked only) */}
      {b.unlocked && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[16px]"
          style={{ background: col }}
        />
      )}
    </div>
  )
}

function BadgeModal({ badge: b, onClose }: { badge: Badge; onClose: () => void }) {
  const col = CAT_COLORS[b.cat]
  const pct = Math.round(b.progress / b.progressMax * 100)
  const [barWidth, setBarWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(pct), 100)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-[4px] z-[60] flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-[var(--sl-s1)] border border-[var(--sl-border-h)] rounded-[22px] p-8 max-w-[440px] w-full mx-4 relative"
        style={{ animation: 'modalUp 0.25s cubic-bezier(0.4,0,0.2,1) both' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-[30px] h-[30px] rounded-[8px] border border-[var(--sl-border)] bg-transparent cursor-pointer text-[var(--sl-t3)] flex items-center justify-center hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)] transition-all"
        >
          <X size={14} />
        </button>

        {/* Badge hero */}
        <div className="text-center mb-6">
          <span
            className="text-[64px] block mb-3"
            style={{ animation: 'bounceIn 0.4s cubic-bezier(0.4,0,0.2,1) both' }}
          >
            {b.icon}
          </span>
          <div className="font-[Syne] font-extrabold text-[20px] text-[var(--sl-t1)] mb-[6px]">{b.name}</div>
          <div className="text-[13px] text-[var(--sl-t2)] leading-[1.7]">{b.desc}</div>
          <div className="flex items-center justify-center gap-[10px] mt-[10px] flex-wrap">
            <span className={`inline-flex items-center gap-[3px] text-[9px] font-bold uppercase tracking-[0.07em] px-[7px] py-[2px] rounded-[8px] ${getRarityPill(b.rarity)}`}>
              {RARITY_LABELS[b.rarity]}
            </span>
            <span className="text-[11px] text-[var(--sl-t3)] px-2 py-0.5 rounded-[8px] bg-[var(--sl-s2)]">
              {CAT_LABELS[b.cat]}
            </span>
          </div>
        </div>

        {/* Criteria */}
        <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[12px] p-[14px_16px] mb-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mb-[6px]">
            Como desbloquear
          </div>
          <div className="text-[13px] text-[var(--sl-t2)] leading-[1.6]">{b.criteria}</div>
        </div>

        {/* Progress bar (locked) or unlocked date */}
        {!b.unlocked ? (
          <div className="mb-4">
            <div className="flex justify-between text-[12px] text-[var(--sl-t3)] mb-[6px]">
              <span>Progresso atual</span>
              <span>{b.progress}/{b.progressMax} ({pct}%)</span>
            </div>
            <div className="h-2 bg-[var(--sl-s3)] rounded-full overflow-hidden mb-[6px]">
              <div
                className="h-full rounded-full transition-[width] duration-1000"
                style={{ width: `${barWidth}%`, background: col }}
              />
            </div>
            <div className="text-[12px] text-[var(--sl-t3)]">
              {pct < 100
                ? `Faltam ${b.progressMax - b.progress} para desbloquear`
                : '✅ Critério atingido!'}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-[12px_16px] rounded-[12px] bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] mb-4 text-[13px] text-[var(--sl-t2)]">
            <span className="text-[20px]">🏆</span>
            <span>Conquistado em <strong className="text-[#10b981]">{b.date}</strong></span>
          </div>
        )}

        {/* Motivation */}
        {b.motivation && (
          <div className="p-[12px_16px] rounded-[12px] bg-gradient-to-br from-[#10b981]/7 to-[#0055ff]/6 border border-[rgba(16,185,129,0.18)] text-[13px] text-[var(--sl-t2)] italic mb-4">
            ✨ {b.motivation}
          </div>
        )}

        {/* Share button (unlocked badges only) */}
        {b.unlocked && (
          <button
            className="w-full py-[13px] rounded-[12px] font-[Syne] text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: '#6366f1' }}
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({ title: `Conquista: ${b.name}`, text: `Desbloqueei a badge "${b.name}" no SyncLife! ${b.desc}` })
              }
            }}
          >
            Compartilhar 🔗
          </button>
        )}
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function ConquistasPage() {
  // ─── Badge engine (real data from Supabase, fallback to static) ─────────
  const { badges: engineBadges, unlockedCount: engineUnlocked, totalCount: engineTotal, loading: engineLoading } = useBadgeEngine()

  // Map engine results onto the local Badge interface, merging with static fallback
  const liveBadges: Badge[] = useMemo(() => {
    if (engineLoading || engineBadges.length === 0) return BADGES

    // Build a map of engine results by badge name (since static uses numeric id, engine uses uuid)
    const engineMap = new Map<string, typeof engineBadges[0]>()
    for (const eb of engineBadges) {
      engineMap.set(eb.badge.name, eb)
    }

    return BADGES.map(staticBadge => {
      const eng = engineMap.get(staticBadge.name)
      if (!eng) return staticBadge
      return {
        ...staticBadge,
        unlocked: eng.unlocked,
        date: eng.unlocked
          ? (eng.badge as any).unlocked_at
            ? new Date((eng.badge as any).unlocked_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
            : staticBadge.date
          : null,
        progress: eng.currentValue,
        progressMax: eng.targetValue,
      }
    })
  }, [engineBadges, engineLoading])

  const LIVE_TOTAL_UNLOCKED = engineLoading ? TOTAL_UNLOCKED : (engineTotal > 0 ? engineUnlocked : TOTAL_UNLOCKED)
  const LIVE_TOTAL_ALL      = engineLoading ? TOTAL_ALL : (engineTotal > 0 ? engineTotal : TOTAL_ALL)
  const LIVE_PCT            = LIVE_TOTAL_ALL > 0 ? Math.round(LIVE_TOTAL_UNLOCKED / LIVE_TOTAL_ALL * 100) : 0

  const LIVE_LIVE_RECENT_UNLOCKED: Badge[] = useMemo(() => {
    const MONTH_IDX: Record<string, number> = {
      Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
      Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
      jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
    }
    const parseDate = (d: string) => {
      const parts = d.split(' ')
      if (parts.length === 3) {
        const [day, mon, year] = parts
        return new Date(parseInt(year), MONTH_IDX[mon] ?? 0, parseInt(day)).getTime()
      }
      // Try ISO date
      return new Date(d).getTime()
    }
    return liveBadges
      .filter(b => b.unlocked && b.date)
      .sort((a, b) => parseDate(b.date!) - parseDate(a.date!))
      .slice(0, 3)
  }, [liveBadges])

  const [curCat,     setCurCat]     = useState<string>('all')
  const [showLocked, setShowLocked] = useState(true)
  const [modalBadge, setModalBadge] = useState<Badge | null>(null)
  const [heroCount,  setHeroCount]  = useState(0)
  const [heroBarW,   setHeroBarW]   = useState(0)
  const [mobileExpandUnlocked, setMobileExpandUnlocked] = useState(false)
  const [mobileExpandLocked,   setMobileExpandLocked]   = useState(false)

  // Animated counter + bar after mount
  useEffect(() => {
    let frame = 0
    const target = LIVE_TOTAL_UNLOCKED
    const tick = () => {
      frame++
      setHeroCount(frame)
      if (frame < target) requestAnimationFrame(tick)
    }
    if (target > 0) requestAnimationFrame(tick)
    const t = setTimeout(() => setHeroBarW(LIVE_PCT), 100)
    return () => clearTimeout(t)
  }, [LIVE_TOTAL_UNLOCKED, LIVE_PCT])

  // ESC closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalBadge(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Filtered badge lists
  const filtered    = liveBadges.filter(b => curCat === 'all' || b.cat === curCat)
  const visUnlocked = filtered.filter(b => b.unlocked)
  const visLocked   = showLocked ? filtered.filter(b => !b.unlocked) : []
  const allLocked   = filtered.filter(b => !b.unlocked) // mobile: always visible

  function catCount(cat: string) {
    const pool = cat === 'all' ? liveBadges : liveBadges.filter(b => b.cat === cat)
    return { done: pool.filter(b => b.unlocked).length, total: pool.length }
  }

  const nextLocked = liveBadges.find(b => !b.unlocked)

  return (
    <>
    {/* ═══════ MOBILE ═══════ */}
    <PanoramaMobileShell
      title="Conquistas"
      subtitle={`${LIVE_TOTAL_UNLOCKED} de ${LIVE_TOTAL_ALL} desbloqueadas`}
    >
      {/* Hero card */}
      <div className="mx-4 mb-3 rounded-[16px] p-5 relative overflow-hidden bg-[var(--sl-s1)] border border-[var(--sl-border)]">
        <div className="absolute top-0 left-0 right-0 h-[3px]"
             style={{ background: 'linear-gradient(90deg, #6366f1, #0055ff)' }} />
        <div className="flex items-end gap-1.5 mb-1.5">
          <span className="font-[Syne] text-[42px] font-extrabold leading-none"
                style={{ background: 'linear-gradient(135deg, #6366f1, #0055ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {heroCount}
          </span>
          <span className="font-[DM_Mono] text-[16px] text-[var(--sl-t3)] mb-1">/ {LIVE_TOTAL_ALL}</span>
        </div>
        <p className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)] mb-1">Conquistas desbloqueadas</p>
        <p className="text-[12px] text-[var(--sl-t3)] mb-3">
          Você está no <strong className="text-[var(--sl-t1)]">Top 15%</strong> dos usuários
        </p>
        <div className="h-1.5 rounded-full overflow-hidden bg-[var(--sl-s3)] mb-1.5">
          <div className="h-full rounded-full"
               style={{
                 width: `${heroBarW}%`,
                 background: 'linear-gradient(90deg, #6366f1, #0055ff)',
                 transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
               }} />
        </div>
        <p className="text-[10px] text-[var(--sl-t3)]">{heroBarW}% do total desbloqueado</p>
      </div>

      {/* Motivational insight */}
      {nextLocked && (
        <div className="px-4 mb-3">
          <AIInsightCard icon="🤖" label="Motivação">
            Você tem <strong>{LIVE_TOTAL_UNLOCKED} conquistas</strong> e contando.
            Seu próximo marco é <strong>{nextLocked.name}</strong> — continue assim!
          </AIInsightCard>
        </div>
      )}

      {/* Recent unlocked */}
      <p className="px-5 pb-2 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
        Recentes
      </p>
      <div className="flex flex-col gap-2 px-4 mb-3">
        {LIVE_RECENT_UNLOCKED.slice(0, 2).map((b, i) => (
          <div
            key={b.id}
            onClick={() => setModalBadge(b)}
            className="flex items-center gap-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[12px] px-3.5 py-3 relative overflow-hidden cursor-pointer active:bg-[var(--sl-s2)]"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r" style={{ background: CAT_COLORS[b.cat] }} />
            <span className="text-[24px] ml-1">{b.icon}</span>
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.5px] text-[var(--sl-t3)] mb-0.5">
                {i === 0 ? 'Última conquista' : 'Recente'}
              </p>
              <p className="text-[13px] font-bold text-[var(--sl-t1)]">{b.name}</p>
              <p className="text-[11px] text-[var(--sl-t3)]">{b.date}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
        {(['all', 'fin', 'meta', 'cons', 'agenda', 'corpo', 'patrimonio', 'experiencias'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCurCat(cat)}
            className={`whitespace-nowrap px-3.5 py-[7px] rounded-[20px] text-[12px] font-medium border shrink-0 transition-colors ${
              curCat === cat
                ? 'bg-[rgba(99,102,241,0.15)] border-[rgba(99,102,241,0.35)] text-[#6366f1]'
                : 'bg-[var(--sl-s1)] border-[var(--sl-border)] text-[var(--sl-t2)]'
            }`}
          >
            {CAT_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Desbloqueadas */}
      {visUnlocked.length > 0 && (
        <>
          <p className="px-5 pb-2 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
            ✅ Desbloqueadas ({visUnlocked.length})
          </p>
          <div className="grid grid-cols-2 gap-2.5 px-4 mb-2">
            {(mobileExpandUnlocked ? visUnlocked : visUnlocked.slice(0, 4)).map(b => {
              const col = CAT_COLORS[b.cat]
              return (
                <div
                  key={b.id}
                  onClick={() => setModalBadge(b)}
                  className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-3.5 text-center relative overflow-hidden cursor-pointer active:bg-[var(--sl-s2)]"
                >
                  <div className={`inline-flex text-[9px] font-bold uppercase tracking-[0.5px] px-[7px] py-[2px] rounded-[8px] mb-1.5 ${getRarityPill(b.rarity)}`}>
                    {RARITY_LABELS[b.rarity]}
                  </div>
                  <div
                    className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center text-[24px] mx-auto mb-2"
                    style={{ background: `${col}22` }}
                  >
                    {b.icon}
                  </div>
                  <p className="font-[Syne] font-bold text-[12px] text-[var(--sl-t1)] mb-1 leading-[1.3]">{b.name}</p>
                  <p className="text-[11px] text-[var(--sl-t2)] leading-[1.4] mb-1.5">{b.desc}</p>
                  <p className="text-[10px] text-[var(--sl-t3)]">🗓 {b.date}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[14px]" style={{ background: col }} />
                </div>
              )
            })}
          </div>
          {visUnlocked.length > 4 && (
            <button
              onClick={() => setMobileExpandUnlocked(!mobileExpandUnlocked)}
              className="flex items-center justify-center gap-1.5 mx-4 mb-3 w-[calc(100%-32px)] py-2.5 rounded-[12px]
                         bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)]
                         active:bg-[var(--sl-s3)] transition-colors"
            >
              {mobileExpandUnlocked ? 'Mostrar menos' : `Ver todas (${visUnlocked.length})`}
              {mobileExpandUnlocked ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </>
      )}

      {/* Bloqueadas */}
      {allLocked.length > 0 && (
        <>
          <p className="px-5 pb-2 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
            🔒 Bloqueadas ({allLocked.length})
          </p>
          <div className="grid grid-cols-2 gap-2.5 px-4 mb-2">
            {(mobileExpandLocked ? allLocked : allLocked.slice(0, 4)).map(b => {
              const col = CAT_COLORS[b.cat]
              const progressPct = Math.round(b.progress / b.progressMax * 100)
              return (
                <div
                  key={b.id}
                  onClick={() => setModalBadge(b)}
                  className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-3.5 text-center relative overflow-hidden opacity-50 cursor-pointer active:bg-[var(--sl-s2)]"
                >
                  <div className="absolute top-2 right-2 w-[18px] h-[18px] rounded-[6px] bg-[var(--sl-s3)] border border-[var(--sl-border)] flex items-center justify-center text-[10px]">
                    🔒
                  </div>
                  <div className={`inline-flex text-[9px] font-bold uppercase tracking-[0.5px] px-[7px] py-[2px] rounded-[8px] mb-1.5 ${getRarityPill(b.rarity)}`}>
                    {RARITY_LABELS[b.rarity]}
                  </div>
                  <div
                    className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center text-[24px] mx-auto mb-2 grayscale opacity-40"
                    style={{ background: `${col}11` }}
                  >
                    {b.icon}
                  </div>
                  <p className="font-[Syne] font-bold text-[12px] text-[var(--sl-t1)] mb-1 leading-[1.3]">{b.name}</p>
                  <p className="text-[11px] text-[var(--sl-t2)] leading-[1.4] mb-1.5">{b.desc}</p>
                  <div className="h-[3px] rounded-full overflow-hidden bg-[var(--sl-s3)] mx-2 mb-1">
                    <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: col }} />
                  </div>
                  <p className="text-[10px] text-[var(--sl-t3)]">{b.progress}/{b.progressMax}</p>
                </div>
              )
            })}
          </div>
          {allLocked.length > 4 && (
            <button
              onClick={() => setMobileExpandLocked(!mobileExpandLocked)}
              className="flex items-center justify-center gap-1.5 mx-4 mb-3 w-[calc(100%-32px)] py-2.5 rounded-[12px]
                         bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)]
                         active:bg-[var(--sl-s3)] transition-colors"
            >
              {mobileExpandLocked ? 'Mostrar menos' : `Ver todas (${allLocked.length})`}
              {mobileExpandLocked ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </>
      )}

      <div className="h-4" />
    </PanoramaMobileShell>

    {/* ═══════ DESKTOP ═══════ */}
    <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16 hidden lg:block">

      {/* ① Hero Summary */}
      <div className="flex gap-5 items-stretch mb-[22px] max-sm:flex-col sl-fade-up">

        {/* Score Card */}
        <div className="flex-1 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] p-[24px_28px] relative overflow-hidden">
          {/* Rainbow top bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg, #6366f1, #0055ff)' }}
          />
          {/* Counter */}
          <div className="flex items-end gap-[6px] mb-[6px]">
            <span className="font-[Syne] font-extrabold text-[44px] leading-none bg-gradient-to-br from-[#6366f1] to-[#0055ff] text-transparent bg-clip-text">
              {heroCount}
            </span>
            <span className="font-[DM_Mono] text-[18px] text-[var(--sl-t3)] mb-1">/ {LIVE_TOTAL_ALL}</span>
          </div>
          <div className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[3px]">
            Conquistas desbloqueadas
          </div>
          <div className="text-[12px] text-[var(--sl-t3)] mb-4">
            Você está no <strong className="text-[var(--sl-t1)]">Top 15%</strong> dos usuários do SyncLife.
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-[var(--sl-s3)] rounded-full overflow-hidden mb-[10px]">
            <div
              className="h-full rounded-full"
              style={{
                width:      `${heroBarW}%`,
                background: 'linear-gradient(90deg, #6366f1, #0055ff)',
                transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
          <div className="text-[11px] text-[var(--sl-t3)]">{heroBarW}% do total desbloqueado</div>
        </div>

        {/* Recent Strip */}
        <div className="flex flex-col gap-[10px] min-w-[280px] flex-shrink-0 max-sm:min-w-0">
          {LIVE_RECENT_UNLOCKED.map((b, i) => (
            <div
              key={b.id}
              className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[14px_18px] flex items-center gap-[14px] cursor-pointer transition-all hover:border-[var(--sl-border-h)] hover:translate-x-0.5 relative overflow-hidden sl-fade-up"
              style={{ animationDelay: `${i * 0.07}s` }}
              onClick={() => setModalBadge(b)}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
                style={{ background: CAT_COLORS[b.cat] }}
              />
              <span className="text-[28px] ml-1">{b.icon}</span>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mb-[3px]">
                  Recente{i === 0 ? ' · Última conquista' : ''}
                </div>
                <div className="text-[13px] font-bold text-[var(--sl-t1)]">{b.name}</div>
                <div className="text-[11px] text-[var(--sl-t3)]">{b.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ② Jornada Motivational Phrase */}
      <div className="flex items-center gap-3 p-[14px_18px] rounded-[14px] mb-5 bg-gradient-to-br from-[#10b981]/7 to-[#0055ff]/7 border border-[rgba(16,185,129,0.18)] sl-fade-up">
        <span className="text-[22px] shrink-0">🤖</span>
        <span className="text-[13px] text-[var(--sl-t2)] leading-[1.7]">
          Você tem{' '}
          <strong className="text-[var(--sl-t1)]">{LIVE_TOTAL_UNLOCKED} conquistas desbloqueadas</strong>{' '}
          e contando.
          {nextLocked && (
            <> Seu próximo marco é{' '}
              <strong className="text-[var(--sl-t1)]">{nextLocked.name}</strong> — continue assim!
            </>
          )}
        </span>
      </div>

      {/* ③ Category Tabs */}
      <div className="flex items-center gap-2 mb-[22px] flex-wrap sl-fade-up">
        {(['all', 'fin', 'meta', 'cons', 'agenda', 'corpo', 'patrimonio', 'experiencias'] as const).map(cat => {
          const cnt      = catCount(cat)
          const isActive = curCat === cat
          return (
            <button
              key={cat}
              onClick={() => setCurCat(cat)}
              className={`inline-flex items-center gap-[6px] px-[14px] py-[7px] rounded-[20px] border text-[12px] font-medium transition-all ${
                isActive
                  ? 'border-[#6366f1] bg-[rgba(99,102,241,0.15)] text-[#6366f1]'
                  : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t2)]'
              }`}
            >
              {CAT_LABELS[cat]}
              <span className="font-[DM_Mono] text-[10px] opacity-70">{cnt.done}/{cnt.total}</span>
            </button>
          )
        })}
        <label className="ml-auto flex items-center gap-[7px] text-[12px] text-[var(--sl-t3)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showLocked}
            onChange={e => setShowLocked(e.target.checked)}
            className="accent-[#0055ff] cursor-pointer"
          />
          Mostrar bloqueadas
        </label>
      </div>

      {/* ④-A Grid View (Jornada) */}
      <div>
        {visUnlocked.length > 0 && (
          <>
            <SectionLabel>✅ Desbloqueadas ({visUnlocked.length})</SectionLabel>
            <div className="grid grid-cols-4 gap-[14px] mb-7 max-[900px]:grid-cols-3 max-sm:grid-cols-2">
              {visUnlocked.map((b, i) => (
                <BadgeCard key={b.id} badge={b} delay={i * 0.04} onClick={() => setModalBadge(b)} />
              ))}
            </div>
          </>
        )}
        {visLocked.length > 0 && (
          <>
            <SectionLabel>🔒 Bloqueadas ({visLocked.length})</SectionLabel>
            <div className="grid grid-cols-4 gap-[14px] mb-7 max-[900px]:grid-cols-3 max-sm:grid-cols-2">
              {visLocked.map((b, i) => (
                <BadgeCard
                  key={b.id}
                  badge={b}
                  delay={(visUnlocked.length + i) * 0.04}
                  onClick={() => setModalBadge(b)}
                />
              ))}
            </div>
          </>
        )}
      </div>


    </div>

    {/* Modal — shared mobile/desktop */}
    {modalBadge && (
      <BadgeModal
        badge={modalBadge}
        onClose={() => setModalBadge(null)}
      />
    )}
    </>
  )
}
