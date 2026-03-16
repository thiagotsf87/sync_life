'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Brain, Flame, BookOpen, Clock, Play } from 'lucide-react'
import { useMenteDashboard, useCreateTrack, CATEGORY_LABELS } from '@/hooks/use-mente'
import type { TrackCategory } from '@/hooks/use-mente'
import { ModuleHeader } from '@/components/ui/module-header'
import { MetricsStrip } from '@/components/ui/metrics-strip'
import { TrackWizard } from '@/components/mente/TrackWizard'
import { MenteMobile } from '@/components/mente/MenteMobile'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

/* ── helpers ──────────────────────────────────────────────────────── */

function getWeekNumber(d: Date): number {
  const oneJan = new Date(d.getFullYear(), 0, 1)
  const days = Math.floor((d.getTime() - oneJan.getTime()) / 86400000)
  return Math.ceil((days + oneJan.getDay() + 1) / 7)
}

function getRelativeDate(dateStr: string): string {
  const now = new Date()
  const d = new Date(dateStr)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = Math.floor((today.getTime() - target.getTime()) / 86400000)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

const CATEGORY_COLORS: Record<string, string> = {
  technology: '#eab308',
  languages: '#3b82f6',
  management: '#a855f7',
  marketing: '#f97316',
  design: '#ec4899',
  finance: '#10b981',
  health: '#f43f5e',
  exam: '#06b6d4',
  undergraduate: '#6366f1',
  postgraduate: '#8b5cf6',
  certification: '#f59e0b',
  other: '#64748b',
}

/* ── page ─────────────────────────────────────────────────────────── */

export default function MentePage() {
  const router = useRouter()

  const { activeTracks, weekHours, todaySessions, streak, recentSessions, loading, error, reload } = useMenteDashboard()
  const createTrack = useCreateTrack()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreate(data: Parameters<typeof createTrack>[0]) {
    setIsCreating(true)
    try {
      await createTrack(data)
      toast.success(`Trilha "${data.name}" criada!`)
      setWizardOpen(false)
      await reload()
    } catch {
      toast.error('Erro ao criar trilha')
    } finally {
      setIsCreating(false)
    }
  }

  /* ── compute total cycles from recent sessions ── */
  const totalCycles = useMemo(() => {
    return recentSessions.reduce((acc, s) => acc + s.cycles_completed, 0)
  }, [recentSessions])

  /* ── compute hours-per-day chart data from recent sessions ── */
  const hoursPerDay = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
    const map: Record<number, number> = {}
    for (const s of recentSessions) {
      const d = new Date(s.recorded_at).getDay()
      map[d] = (map[d] || 0) + s.focus_minutes / 60
    }
    return days.map((name, i) => ({
      name,
      hours: parseFloat((map[i] || 0).toFixed(1)),
    }))
  }, [recentSessions])

  /* ── subtitle ── */
  const now = new Date()
  const weekNum = getWeekNumber(now)
  const subtitleParts: string[] = [
    `Semana ${weekNum} de ${now.getFullYear()}`,
  ]
  if (streak.current_streak > 0) subtitleParts.push(`${streak.current_streak} dias de streak`)
  subtitleParts.push(`${activeTracks.length} trilha${activeTracks.length !== 1 ? 's' : ''} ativa${activeTracks.length !== 1 ? 's' : ''}`)

  return (
    <>
      {/* Mobile layout */}
      <MenteMobile />

      {/* Desktop layout */}
      <div className="hidden lg:block max-w-[1140px] mx-auto px-6 py-7 pb-16">

        {/* 1. ModuleHeader */}
        <ModuleHeader
          icon={Brain}
          iconBg="rgba(234,179,8,.1)"
          iconColor="#eab308"
          title="Mente"
          subtitle={subtitleParts.join(' \u00B7 ')}
        >
          <button
            onClick={() => router.push('/mente/timer')}
            className="flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                       bg-[#eab308] text-black hover:brightness-110 transition-all"
          >
            <Play size={16} />
            Timer
          </button>
        </ModuleHeader>

        {/* 2. MetricsStrip — 5 metrics */}
        <MetricsStrip
          gradient={['#eab308', '#f97316']}
          className="mb-7"
          items={[
            {
              label: 'Horas esta semana',
              value: `${weekHours}h`,
              valueColor: '#eab308',
              featured: true,
              note: weekHours > 0 ? `Meta semanal: 15h (${Math.min(Math.round((weekHours / 15) * 100), 100)}%)` : 'Comece a estudar!',
            },
            {
              label: 'Streak',
              value: `${streak.current_streak}d`,
              valueColor: '#f97316',
              icon: Flame,
              note: streak.longest_streak > 0 ? `Recorde: ${streak.longest_streak}d` : 'Comece hoje!',
            },
            {
              label: 'Trilhas ativas',
              value: String(activeTracks.length),
              note: activeTracks.length > 0 ? `${activeTracks.filter(t => t.progress >= 100).length} concluida${activeTracks.filter(t => t.progress >= 100).length !== 1 ? 's' : ''} este mes` : undefined,
            },
            {
              label: 'Sessoes hoje',
              value: String(todaySessions),
              valueColor: todaySessions > 0 ? '#10b981' : undefined,
              note: todaySessions > 0 ? 'Otimo ritmo!' : 'Vamos estudar?',
            },
            {
              label: 'Ciclos totais',
              value: String(totalCycles),
              note: `${recentSessions.length} sessoes`,
            },
          ]}
        />

        {/* 3. Bento Grid: 1fr + 380px */}
        <div className="grid grid-cols-[1fr_380px] gap-[14px] max-lg:grid-cols-1">

          {/* ── LEFT: Trilhas Ativas ── */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 sl-fade-up sl-delay-2 transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex items-center gap-[9px] mb-[18px]">
              <BookOpen size={16} className="text-[#eab308]" />
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                Trilhas Ativas
              </h2>
              <button
                onClick={() => router.push('/mente/trilhas')}
                className="ml-auto text-[12px] font-medium text-[#eab308] hover:underline"
              >
                Ver todas
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[70px] rounded-xl bg-[var(--sl-s2)] animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-[13px] text-[var(--sl-t2)] mb-2">
                  {error.includes('does not exist')
                    ? 'Execute a migration 005 no Supabase para ativar este modulo.'
                    : error}
                </p>
                <button onClick={reload} className="text-[12px] text-[#eab308] hover:opacity-80">Tentar novamente</button>
              </div>
            ) : activeTracks.length === 0 ? (
              <div className="text-center py-10">
                <Brain size={32} className="text-[#eab308] mx-auto mb-3 opacity-60" />
                <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
                  Nenhuma trilha ativa
                </h3>
                <p className="text-[13px] text-[var(--sl-t2)] max-w-sm mx-auto mb-4">
                  Crie sua primeira trilha e organize o que voce quer aprender.
                </p>
                <button
                  onClick={() => setWizardOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                             bg-[#eab308] text-black hover:brightness-110 transition-all"
                >
                  <Plus size={15} />
                  Criar Trilha
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {activeTracks.map((track, idx) => {
                  const steps = track.steps ?? []
                  const completedSteps = steps.filter(s => s.is_completed).length
                  const catColor = CATEGORY_COLORS[track.category] ?? '#eab308'
                  const catLabel = (CATEGORY_LABELS[track.category as TrackCategory] ?? '').replace(/^.+ /, '')
                  const daysLeft = track.target_date
                    ? Math.ceil((new Date(track.target_date).getTime() - Date.now()) / 86400000)
                    : null

                  const subParts: string[] = [catLabel]
                  if (track.total_hours > 0) subParts.push(`${track.total_hours.toFixed(1)}h`)
                  if (track.cost) subParts.push(track.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
                  if (daysLeft !== null && daysLeft > 0) subParts.push(`${daysLeft}d restantes`)

                  return (
                    <div
                      key={track.id}
                      className={`py-[14px] cursor-pointer ${idx < activeTracks.length - 1 ? 'border-b border-[var(--sl-border)]' : ''}`}
                      onClick={() => router.push('/mente/trilhas')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-[10px]">
                          <div
                            className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                            style={{ background: `${catColor}15` }}
                          >
                            <BookOpen size={18} style={{ color: catColor }} />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{track.name}</p>
                            <p className="text-[11px] text-[var(--sl-t3)]">{subParts.join(' \u00B7 ')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-[DM_Mono] text-[15px] font-medium text-[#eab308]">
                            {Math.round(track.progress)}%
                          </span>
                          {steps.length > 0 && (
                            <p className="text-[10px] text-[var(--sl-t3)]">{completedSteps}/{steps.length} etapas</p>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '5px' }}>
                        <div
                          className="h-full rounded-full transition-[width] duration-700"
                          style={{
                            width: `${Math.min(track.progress, 100)}%`,
                            background: '#eab308',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-[14px]">

            {/* Sessoes Recentes */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 sl-fade-up sl-delay-3 transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-[9px] mb-[18px]">
                <Clock size={16} className="text-[#eab308]" />
                <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  Sessoes Recentes
                </h2>
                <button
                  onClick={() => router.push('/mente/sessoes')}
                  className="ml-auto text-[12px] font-medium text-[#eab308] hover:underline"
                >
                  Ver todas
                </button>
              </div>

              {recentSessions.length === 0 ? (
                <p className="text-[12px] text-[var(--sl-t3)]">
                  Nenhuma sessao esta semana.{' '}
                  <button
                    onClick={() => router.push('/mente/timer')}
                    className="text-[#eab308] hover:opacity-80"
                  >
                    Iniciar timer
                  </button>
                </p>
              ) : (
                <div className="flex flex-col">
                  {recentSessions.map((session, idx) => {
                    const trackName = session.track?.name ?? 'Estudo livre'
                    const dateLabel = getRelativeDate(session.recorded_at)
                    // Assign a dot color based on track or fallback
                    const dotColors = ['#eab308', '#3b82f6', '#a855f7', '#10b981', '#f97316']
                    const dotColor = dotColors[idx % dotColors.length]

                    return (
                      <div
                        key={session.id}
                        className={`flex items-center gap-[10px] py-[10px] ${idx < recentSessions.length - 1 ? 'border-b border-[rgba(120,165,220,.04)]' : ''}`}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: dotColor }}
                        />
                        <span className="flex-1 text-[12px] font-medium text-[var(--sl-t1)] truncate">
                          {trackName}
                        </span>
                        <span className="font-[DM_Mono] text-[12px] text-[#eab308]">
                          {session.focus_minutes}m
                        </span>
                        <span className="text-[10px] text-[var(--sl-t3)] w-10 text-right">
                          {dateLabel}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Horas por dia chart */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 sl-fade-up sl-delay-4 transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-[9px] mb-[18px]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  Horas por dia
                </h2>
              </div>

              {recentSessions.length === 0 ? (
                <div className="border border-dashed border-[var(--sl-border)] rounded-xl p-5 flex items-center justify-center text-[var(--sl-t3)] text-[12px] min-h-[140px]">
                  Sem dados de sessoes esta semana
                </div>
              ) : (
                <div style={{ width: '100%', height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hoursPerDay} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fill: 'var(--sl-t3)', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'var(--sl-t3)', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={24}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--sl-s2)',
                          border: '1px solid var(--sl-border)',
                          borderRadius: '10px',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`${value}h`, 'Horas']}
                      />
                      <Bar
                        dataKey="hours"
                        fill="#eab308"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Wizard */}
        <TrackWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSave={handleCreate}
          isLoading={isCreating}
        />
      </div>
    </>
  )
}
