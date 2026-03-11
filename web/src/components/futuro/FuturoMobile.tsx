'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { FUTURO_PRIMARY, FUTURO_PRIMARY_LIGHT, FUTURO_PRIMARY_BG, FUTURO_GRAD } from '@/lib/futuro-colors'
import { jornadaLabel } from '@/lib/jornada-labels'

const CHECKIN_KEY = 'sl_futuro_checkin'
import { useXP } from '@/hooks/use-xp'
import { XpBar } from '@/components/futuro/mobile/XpBar'
import { CoachCard } from '@/components/futuro/mobile/CoachCard'
import { FuturoScoreBand } from '@/components/futuro/mobile/FuturoScoreBand'
import { FuturoGoalCard } from '@/components/futuro/mobile/FuturoGoalCard'
import { FuturoArquivoTab } from '@/components/futuro/mobile/FuturoArquivoTab'
import { FuturoTimelineTab } from '@/components/futuro/mobile/FuturoTimelineTab'

interface GoalItem {
  id: string
  name: string
  icon: string
  iconBg: string
  deadline: string
  category: string
  modules: { emoji: string; label: string; color: string; bg: string }[]
  progressLabel: string
  progressPct: number
  progressColor: string
  isDelayed?: boolean
  narrativeHint?: string
  status?: 'active' | 'completed' | 'paused'
}

interface FuturoMobileProps {
  avgProgress: number
  activeCount: number
  alertText?: string
  goals: GoalItem[]
  onNewGoal: () => void
  onTrackCount?: number
  delayedCount?: number
}

type TabId = 'dashboard' | 'objetivos' | 'timeline' | 'arquivo'

export function FuturoMobile({
  avgProgress,
  activeCount,
  alertText,
  goals,
  onNewGoal,
  onTrackCount,
  delayedCount,
}: FuturoMobileProps) {
  const router = useRouter()
  const accent = FUTURO_PRIMARY
  const { totalXP, level } = useXP()

  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [checkinDismissed, setCheckinDismissed] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'concluidos' | 'pausados'>('todos')

  // Check-in card visibility
  const showCheckin = useMemo(() => {
    if (checkinDismissed) return false
    try {
      const last = localStorage.getItem(CHECKIN_KEY)
      if (!last) return true
      const daysSince = (Date.now() - new Date(last).getTime()) / 86400000
      // FREE: 28 days, PRO: 7 days (using 28 as default — FREE)
      return daysSince >= 28
    } catch {
      return true
    }
  }, [checkinDismissed])

  const tabs: { id: TabId; label: string; key: string }[] = [
    { id: 'dashboard', label: 'Dashboard', key: 'dashboard' },
    { id: 'objetivos', label: 'Objetivos', key: 'objetivos' },
    { id: 'timeline', label: 'Timeline', key: 'timeline' },
    { id: 'arquivo', label: 'Arquivo', key: 'arquivo' },
  ]

  // Derive counts from goals if not provided
  const delayed = delayedCount ?? goals.filter(g => g.isDelayed).length
  const onTrack = onTrackCount ?? (goals.length - delayed)

  // Build goal chips for score band
  const goalChips = goals.slice(0, 3).map(g => {
    const color = g.progressPct >= 60 ? '#10b981' : g.progressPct >= 40 ? '#f59e0b' : '#f43f5e'
    return {
      icon: g.icon,
      pct: g.progressPct,
      color,
      borderColor: `${color}33`,
      bgColor: `${color}1a`,
    }
  })

  return (
    <div className="lg:hidden pb-[calc(68px+16px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[14px] pb-3">
        <div>
          <p className="text-[12px] font-semibold mb-[2px]" style={{ color: FUTURO_PRIMARY_LIGHT }}>
            ✦ {jornadaLabel('futuro', 'module', 'Futuro')}
          </p>
          <h1 className="font-[Syne] text-[20px] font-bold text-[var(--sl-t1)]">
            Arquiteto do Futuro
          </h1>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-[3px] rounded-[20px]"
          style={{
            background: FUTURO_PRIMARY_BG,
            color: FUTURO_PRIMARY_LIGHT,
          }}
        >
          {`${totalXP.toLocaleString('pt-BR')} XP`}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 px-4 border-b border-[var(--sl-border)] mb-3 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 py-2 text-[12px] font-medium whitespace-nowrap border-b-2 shrink-0 transition-colors"
              style={{
                color: isActive ? FUTURO_PRIMARY_LIGHT : 'var(--sl-t3)',
                borderBottomColor: isActive ? FUTURO_PRIMARY : 'transparent',
              }}
            >
              {jornadaLabel('futuro', tab.key, tab.label)}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <>
            {/* XP Bar */}
            <XpBar />

            {/* Mapa da Vida (radar 8 dimensões) */}
            {(() => {
              const cx = 100, cy = 100, R = 76
              const toRad = (deg: number) => (deg * Math.PI) / 180
              const dims = [
                { emoji: '💰', value: 75, color: '#10b981', angle: -90,  anchor: 'middle' as const, lx: 100, ly: 13 },
                { emoji: '🔮', value: 58, color: '#8b5cf6', angle: -45,  anchor: 'start'  as const, lx: 164, ly: 46 },
                { emoji: '🏃', value: 45, color: '#f97316', angle: 0,    anchor: 'start'  as const, lx: 168, ly: 103 },
                { emoji: '🧠', value: 70, color: '#a855f7', angle: 45,   anchor: 'start'  as const, lx: 158, ly: 158 },
                { emoji: '📈', value: 40, color: '#3b82f6', angle: 90,   anchor: 'middle' as const, lx: 100, ly: 193 },
                { emoji: '💼', value: 35, color: '#f59e0b', angle: 135,  anchor: 'end'    as const, lx: 36,  ly: 158 },
                { emoji: '⏳', value: 60, color: '#06b6d4', angle: 180,  anchor: 'end'    as const, lx: 26,  ly: 103 },
                { emoji: '✈️', value: 80, color: '#ec4899', angle: 225,  anchor: 'end'    as const, lx: 34,  ly: 46 },
              ]
              const polygonPoints = dims.map(d => {
                const a = toRad(d.angle), dist = (d.value / 100) * R
                return `${(cx + dist * Math.cos(a)).toFixed(1)},${(cy + dist * Math.sin(a)).toFixed(1)}`
              }).join(' ')
              return (
                <div
                  className="mx-4 mb-3 rounded-[14px] p-[14px] text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(0,85,255,0.06))',
                    border: '1px solid rgba(139,92,246,0.2)',
                  }}
                >
                  <p className="font-[Syne] text-[12px] font-bold mb-2" style={{ color: FUTURO_PRIMARY_LIGHT }}>
                    🗺️ Mapa da Vida
                  </p>
                  <svg width="200" height="200" viewBox="0 0 200 200" style={{ margin: '0 auto', display: 'block' }}>
                    {/* Grid circles */}
                    <circle cx={cx} cy={cy} r={R}        fill="none" stroke="var(--sl-s3)" strokeWidth=".5" opacity=".5" />
                    <circle cx={cx} cy={cy} r={R * .75}  fill="none" stroke="var(--sl-s3)" strokeWidth=".5" opacity=".3" />
                    <circle cx={cx} cy={cy} r={R * .5}   fill="none" stroke="var(--sl-s3)" strokeWidth=".5" opacity=".2" />
                    {/* Axis lines */}
                    {dims.map((d, i) => {
                      const a = toRad(d.angle)
                      return <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} stroke="var(--sl-s3)" strokeWidth=".3" />
                    })}
                    {/* Data polygon */}
                    <polygon points={polygonPoints} fill="rgba(139,92,246,0.15)" stroke={FUTURO_PRIMARY} strokeWidth="1.5" />
                    {/* Dots + labels */}
                    {dims.map((d, i) => {
                      const a = toRad(d.angle), dist = (d.value / 100) * R
                      return (
                        <g key={i}>
                          <circle cx={cx + dist * Math.cos(a)} cy={cy + dist * Math.sin(a)} r={3} fill={d.color} />
                          <text x={d.lx} y={d.ly} textAnchor={d.anchor} fontSize="7.5" fill="var(--sl-t2)" fontFamily="DM Sans">
                            {d.emoji} {d.value}%
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                  <p className="text-[11px] italic leading-[1.5] mt-2" style={{ color: 'var(--sl-t2)' }}>
                    <strong style={{ color: 'var(--sl-t1)', fontStyle: 'normal' }}>Corpo</strong>{' '}e{' '}
                    <strong style={{ color: 'var(--sl-t1)', fontStyle: 'normal' }}>Carreira</strong>{' '}
                    abaixo de 50%. Equilibrar aumentaria Life Score em{' '}
                    <strong style={{ color: 'var(--sl-t1)', fontStyle: 'normal' }}>+8 pts</strong>.
                  </p>
                </div>
              )
            })()}

            {/* Score Band */}
            <FuturoScoreBand
              score={avgProgress}
              onTrackCount={onTrack}
              delayedCount={delayed}
              deltaPoints={4}
              narrativeText={
                <>Você <em>avançou 4 pontos</em> e está a <em>12 pts</em> do seu recorde histórico de 70.</>
              }
              goalChips={goalChips}
            />

            {/* Coach card */}
            <CoachCard
              message={
                <>Thiago, você economizou <strong>R$ 340 a mais</strong> este mês. Direcionando para o apartamento te coloca <strong>3 semanas à frente</strong>.</>
              }
              cta="Ver simulador"
            />

            {/* Check-in Card */}
            {showCheckin && (
              <div
                className="mx-4 mb-3 rounded-[14px] p-[12px_14px]"
                style={{
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-[10px] flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[14px] shrink-0"
                      style={{ background: 'rgba(139,92,246,0.15)' }}
                    >
                      📋
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-[var(--sl-t1)]">Check-in Pendente</p>
                      <p className="text-[11px] text-[var(--sl-t2)] mt-[2px] leading-[1.4]">
                        Como você está indo esta semana?
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCheckinDismissed(true)}
                    className="w-6 h-6 rounded-full bg-[var(--sl-s2)] flex items-center justify-center shrink-0 mt-[-2px]"
                  >
                    <X size={12} className="text-[var(--sl-t3)]" />
                  </button>
                </div>
                <button
                  onClick={() => router.push('/futuro/checkin')}
                  className="w-full mt-3 h-[36px] rounded-[10px] text-[12px] font-semibold text-white"
                  style={{ background: FUTURO_GRAD }}
                >
                  Fazer check-in →
                </button>
              </div>
            )}

            {/* Section title */}
            <div className="flex items-center justify-between px-5 mb-1">
              <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]">
                Missões Ativas
              </p>
              <button
                onClick={onNewGoal}
                className="text-[11px] font-semibold"
                style={{ color: FUTURO_PRIMARY_LIGHT }}
              >
                + Nova missão
              </button>
            </div>

            {/* Goal cards */}
            {goals.map((goal) => (
              <FuturoGoalCard
                key={goal.id}
                id={goal.id}
                name={goal.name}
                icon={goal.icon}
                iconBg={goal.iconBg}
                deadline={goal.deadline}
                progressLabel={goal.progressLabel}
                progressPct={goal.progressPct}
                modules={goal.modules}
                isDelayed={goal.isDelayed}
                narrativeHint={goal.narrativeHint}
                onClick={() => router.push(`/futuro/${goal.id}`)}
              />
            ))}

            {/* Empty state */}
            {goals.length === 0 && (
              <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-8 text-center">
                <div className="text-[36px] mb-2">🎯</div>
                <p className="text-[13px] text-[var(--sl-t2)]">
                  Crie sua primeira missão para começar.
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-[10px] px-4 pt-2">
              <button
                onClick={onNewGoal}
                className="flex-1 flex items-center justify-center gap-1.5 h-[46px] rounded-[14px] text-[13px] font-semibold text-white"
                style={{ background: FUTURO_GRAD }}
              >
                🚀 Nova missão
              </button>
              <button
                onClick={() => setActiveTab('arquivo')}
                className="flex-1 flex items-center justify-center gap-1.5 h-[46px] rounded-[14px] text-[13px] font-semibold text-[var(--sl-t1)]
                           bg-[var(--sl-s2)] border border-[var(--sl-border-h)]"
              >
                Ver arquivo
              </button>
            </div>
          </>
        )}

        {/* ── OBJETIVOS TAB ── */}
        {activeTab === 'objetivos' && (() => {
          const countAll = goals.length
          const countAtivos = goals.filter(g => !g.status || g.status === 'active').length
          const countConcluidos = goals.filter(g => g.status === 'completed').length
          const countPausados = goals.filter(g => g.status === 'paused').length
          const filteredGoals = filterStatus === 'todos' ? goals
            : filterStatus === 'ativos' ? goals.filter(g => !g.status || g.status === 'active')
            : filterStatus === 'concluidos' ? goals.filter(g => g.status === 'completed')
            : goals.filter(g => g.status === 'paused')
          const FILTERS = [
            { key: 'todos' as const, label: 'Todas', count: countAll },
            { key: 'ativos' as const, label: 'Ativas', count: countAtivos },
            { key: 'concluidos' as const, label: 'Concluídos', count: countConcluidos },
            { key: 'pausados' as const, label: 'Pausados', count: countPausados },
          ]
          return (
            <>
              {/* Filter pills */}
              <div className="flex gap-[6px] px-4 pb-3 overflow-x-auto scrollbar-hide">
                {FILTERS.map(({ key, label, count }) => {
                  const isActive = filterStatus === key
                  return (
                    <button
                      key={key}
                      onClick={() => setFilterStatus(key)}
                      className="px-3 py-[5px] rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors"
                      style={{
                        background: isActive ? FUTURO_PRIMARY_BG : 'var(--sl-s1)',
                        color: isActive ? FUTURO_PRIMARY : 'var(--sl-t2)',
                        border: isActive ? `1px solid rgba(139,92,246,0.3)` : '1px solid var(--sl-border)',
                      }}
                    >
                      {label} ({count})
                    </button>
                  )
                })}
                <button
                  onClick={onNewGoal}
                  className="ml-auto px-3 py-[5px] rounded-full text-[11px] font-semibold shrink-0 text-white"
                  style={{ background: FUTURO_PRIMARY }}
                >
                  + Nova missão
                </button>
              </div>

              {/* Goal cards */}
              {filteredGoals.map((goal) => (
                <FuturoGoalCard
                  key={goal.id}
                  id={goal.id}
                  name={goal.name}
                  icon={goal.icon}
                  iconBg={goal.iconBg}
                  deadline={goal.deadline}
                  progressLabel={goal.progressLabel}
                  progressPct={goal.progressPct}
                  modules={goal.modules}
                  isDelayed={goal.isDelayed}
                  narrativeHint={goal.narrativeHint}
                  status={goal.status}
                  onClick={() => router.push(`/futuro/${goal.id}`)}
                />
              ))}

              {filteredGoals.length === 0 && (
                <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-8 text-center">
                  <div className="text-[36px] mb-2">🎯</div>
                  <p className="text-[13px] text-[var(--sl-t2)]">
                    Nenhuma missão neste filtro.
                  </p>
                </div>
              )}
            </>
          )
        })()}

        {/* ── TIMELINE TAB ── */}
        {activeTab === 'timeline' && (
          <FuturoTimelineTab />
        )}

        {/* ── ARQUIVO TAB ── */}
        {activeTab === 'arquivo' && (
          <FuturoArquivoTab />
        )}
      </div>
    </div>
  )
}
