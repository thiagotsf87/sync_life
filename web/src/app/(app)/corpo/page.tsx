'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Droplets, Activity, Scale, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useCorpoDashboard, useWaterIntake, useUpdateWater, calcIMC, IMC_LABEL } from '@/hooks/use-corpo'
import { ModuleHeader } from '@/components/ui/module-header'
import { ScoreHero } from '@/components/ui/score-hero'
import { MetricsStrip } from '@/components/ui/metrics-strip'
import { ActivityHeatmap } from '@/components/ui/activity-heatmap'
import { CorpoMobile } from '@/components/corpo/CorpoMobile'

export default function CorpoPage() {
  const router = useRouter()

  const { profile, latestWeight, nextAppointment, weekActivities, loading, error } = useCorpoDashboard()

  const todayStr = new Date().toISOString().split('T')[0]
  const { water, reload: reloadWater } = useWaterIntake(todayStr)
  const updateWater = useUpdateWater()

  const waterIntake = water?.intake_ml ?? 0
  const waterGoal = water?.goal_ml ?? 2500
  const waterPct = waterGoal > 0 ? Math.min(100, Math.round((waterIntake / waterGoal) * 100)) : 0

  const handleAddWater = useCallback(async (ml: number) => {
    if (ml <= 0) return
    try {
      await updateWater(todayStr, waterIntake + ml, waterGoal)
      await reloadWater()
      toast.success(`+${ml}ml registrado!`)
    } catch {
      toast.error('Erro ao registrar hidratacao')
    }
  }, [waterIntake, waterGoal, todayStr, updateWater, reloadWater])

  const imc = latestWeight && profile?.height_cm
    ? calcIMC(latestWeight.weight, profile.height_cm)
    : null
  const imcInfo = imc ? IMC_LABEL(imc) : null

  const weekCalories = weekActivities.reduce((s, a) => s + (a.calories_burned ?? 0), 0)
  const weekMinutes = weekActivities.reduce((s, a) => s + a.duration_minutes, 0)

  const nextApptDate = nextAppointment
    ? new Date(nextAppointment.appointment_date)
    : null
  const daysUntil = nextApptDate
    ? Math.ceil((nextApptDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  // Build subtitle for ModuleHeader
  const subtitleParts: string[] = []
  if (latestWeight) subtitleParts.push(`${latestWeight.weight} kg`)
  if (weekActivities.length > 0) subtitleParts.push(`${weekActivities.length} atividade${weekActivities.length !== 1 ? 's' : ''} esta semana`)
  if (imc) subtitleParts.push(`IMC ${imc.toFixed(1)}`)
  const headerSubtitle = subtitleParts.length > 0 ? subtitleParts.join(' \u00B7 ') : 'Configure seu perfil de saude'

  // Build a rough corpo score (0-100) from available data
  const corpoScore = useMemo(() => {
    let score = 50
    if (weekActivities.length >= (profile?.weekly_activity_goal ?? 3)) score += 15
    else if (weekActivities.length > 0) score += 8
    if (waterPct >= 100) score += 10
    else if (waterPct >= 50) score += 5
    if (imc && imc >= 18.5 && imc < 25) score += 15
    else if (imc && imc >= 25 && imc < 30) score += 5
    if (latestWeight) score += 5
    if (profile?.bmr) score += 5
    return Math.min(100, score)
  }, [weekActivities, profile, waterPct, imc, latestWeight])

  // Score description
  const scoreDescription = useMemo(() => {
    if (!latestWeight) return 'Registre seu peso para acompanhar sua evolucao.'
    const parts: string[] = []
    parts.push(`Seu peso atual e ${latestWeight.weight} kg.`)
    if (weekActivities.length > 0) {
      parts.push(`${weekActivities.length} atividade${weekActivities.length !== 1 ? 's' : ''} esta semana.`)
    }
    return parts.join(' ')
  }, [latestWeight, weekActivities])

  // Build heatmap data from weekActivities (last 28 days)
  const heatmapDays = useMemo(() => {
    const days: { date: string; level: 0 | 1 | 2 | 3 | 4; minutes?: number }[] = []
    const today = new Date()
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayActivities = weekActivities.filter(a => a.recorded_at.startsWith(dateStr))
      const totalMinutes = dayActivities.reduce((s, a) => s + a.duration_minutes, 0)
      let level: 0 | 1 | 2 | 3 | 4 = 0
      if (totalMinutes >= 60) level = 4
      else if (totalMinutes >= 40) level = 3
      else if (totalMinutes >= 20) level = 2
      else if (totalMinutes > 0) level = 1
      days.push({ date: dateStr, level, minutes: totalMinutes })
    }
    return days
  }, [weekActivities])

  return (
    <>
      {/* Mobile */}
      <CorpoMobile />

      {/* Desktop */}
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

        {/* 1. ModuleHeader */}
        <ModuleHeader
          icon={Activity}
          iconBg="rgba(249,115,22,.08)"
          iconColor="#f97316"
          title="Corpo"
          subtitle={headerSubtitle}
        >
          <button
            onClick={() => router.push('/corpo/peso')}
            className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                       bg-[#f97316] text-white hover:brightness-110 hover:-translate-y-px
                       transition-all shadow-[0_6px_20px_rgba(249,115,22,.15)]"
          >
            <Plus size={16} />
            Registrar Peso
          </button>
        </ModuleHeader>

        {/* 2. ScoreHero */}
        <ScoreHero
          score={corpoScore}
          label="Score Corporal"
          title={corpoScore >= 70 ? 'Corpo em evolucao' : corpoScore >= 40 ? 'Progresso constante' : 'Comece hoje'}
          description={scoreDescription}
          accentColor="#f97316"
          stats={[
            {
              label: 'TMB',
              value: profile?.bmr ? Math.round(profile.bmr).toLocaleString('pt-BR') : '--',
            },
            {
              label: 'TDEE',
              value: profile?.tdee ? Math.round(profile.tdee).toLocaleString('pt-BR') : '--',
            },
          ]}
          className="mb-[14px]"
        />

        {/* 3. Vitals Strip */}
        <MetricsStrip
          className="mb-7"
          items={[
            {
              label: 'Peso Atual',
              value: latestWeight ? `${latestWeight.weight}` : '--',
              note: imc && imcInfo
                ? `${imc > 0 ? (latestWeight?.weight ?? 0) < (profile?.current_weight ?? 999) ? '-' : '' : ''}vs semana`
                : undefined,
              accent: '#f97316',
              valueColor: undefined,
            },
            {
              label: 'IMC',
              value: imc ? imc.toFixed(1) : '--',
              note: imcInfo?.label ?? undefined,
              accent: '#10b981',
              valueColor: imcInfo?.color ?? undefined,
            },
            {
              label: 'Atividades',
              value: String(weekActivities.length),
              note: weekMinutes > 0 ? `${weekMinutes} min \u00B7 ${Math.round(weekCalories)} kcal` : 'Nenhuma esta semana',
              accent: '#10b981',
            },
            {
              label: 'Hidratacao',
              value: `${(waterIntake / 1000).toFixed(1)}`,
              note: `${waterPct}% da meta`,
              accent: '#06b6d4',
              valueColor: '#06b6d4',
            },
            {
              label: 'Streak',
              value: weekActivities.length > 0 ? `${weekActivities.length}` : '0',
              note: 'dias',
              accent: '#f59e0b',
            },
          ]}
        />

        {/* 4. Main Bento Grid */}
        {loading ? (
          <div className="grid grid-cols-[1fr_380px] gap-[14px] max-lg:grid-cols-1">
            <div className="flex flex-col gap-[14px]">
              <div className="h-48 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
              <div className="h-48 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
            </div>
            <div className="flex flex-col gap-[14px]">
              <div className="h-48 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
              <div className="h-48 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
            <p className="text-[13px] text-[var(--sl-t2)]">
              {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_380px] gap-[14px] max-lg:grid-cols-1 sl-fade-up sl-delay-3">

            {/* LEFT: Heatmap + Weight Trend stacked */}
            <div className="flex flex-col gap-[14px]">

              {/* Activity Heatmap */}
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6
                              hover:border-[var(--sl-border-h)] transition-colors sl-fade-up">
                <div className="flex items-center gap-[9px] mb-[18px]">
                  <Calendar size={16} className="text-[#f97316]" />
                  <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                    Mapa de Atividades
                  </h3>
                  <span className="ml-auto text-[11px] text-[var(--sl-t3)]">Ultimas 4 semanas</span>
                </div>
                <ActivityHeatmap days={heatmapDays} accentColor="#f97316" />
              </div>

              {/* Weight Trend mini */}
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 flex-1
                              hover:border-[var(--sl-border-h)] transition-colors sl-fade-up">
                <div className="flex items-center gap-[9px] mb-[18px]">
                  <Scale size={16} className="text-[#f97316]" />
                  <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                    Tendencia
                  </h3>
                  <button
                    onClick={() => router.push('/corpo/peso')}
                    className="ml-auto text-[12px] font-medium text-[#f97316] hover:opacity-80 transition-opacity"
                  >
                    Detalhes &rarr;
                  </button>
                </div>

                {/* Weight value + delta pill */}
                <div className="flex items-center gap-4 mb-3">
                  <span className="font-[DM_Mono] font-medium text-[26px] text-[var(--sl-t1)] leading-none">
                    {latestWeight ? latestWeight.weight : '--'}
                    <span className="text-[12px] text-[var(--sl-t3)] ml-1">kg</span>
                  </span>
                  {latestWeight && (
                    <span className="inline-flex items-center gap-1 px-[10px] py-1 rounded-lg text-[11px] font-semibold
                                     bg-[rgba(16,185,129,.1)] text-[#10b981]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 15 6-6 6 6"/>
                      </svg>
                      Ultimos 30d
                    </span>
                  )}
                </div>

                {/* Chart placeholder */}
                <div className="w-full border border-dashed border-[var(--sl-border)] rounded-xl
                                flex items-center justify-center text-[var(--sl-t3)] text-[12px] italic p-4"
                     style={{ minHeight: 100 }}
                >
                  Recharts: LineChart &mdash; peso ultimos 30 dias
                </div>
              </div>
            </div>

            {/* RIGHT: Hydration + Appointments stacked */}
            <div className="flex flex-col gap-[14px]">

              {/* Hydration card */}
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6
                              hover:border-[var(--sl-border-h)] transition-colors sl-fade-up">
                <div className="flex items-center gap-[9px] mb-[18px]">
                  <Droplets size={16} className="text-[#06b6d4]" />
                  <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                    Hidratacao
                  </h3>
                </div>

                {/* Hydration value row */}
                <div className="flex items-center gap-[14px] mb-3">
                  <span className="font-[DM_Mono] font-medium text-[24px] text-[#06b6d4] leading-none">
                    {(waterIntake / 1000).toFixed(1)}
                  </span>
                  <span className="text-[12px] text-[var(--sl-t3)]">
                    / {(waterGoal / 1000).toFixed(1)}L
                  </span>
                  <span className="font-[DM_Mono] text-[12px] text-[#06b6d4] ml-auto">
                    {waterPct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="h-[10px] bg-[var(--sl-s3)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${waterPct}%`,
                        background: waterPct >= 100 ? '#10b981' : '#06b6d4',
                      }}
                    />
                  </div>
                </div>

                {/* Quick-add buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddWater(250)}
                    className="flex-1 flex items-center justify-center px-2 py-2 rounded-[11px] text-[12px] font-semibold
                               border border-[var(--sl-border)] text-[var(--sl-t2)]
                               hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
                  >
                    +250ml
                  </button>
                  <button
                    onClick={() => handleAddWater(500)}
                    className="flex-1 flex items-center justify-center px-2 py-2 rounded-[11px] text-[12px] font-semibold
                               bg-[#06b6d4] text-white hover:opacity-90 transition-opacity"
                  >
                    +500ml
                  </button>
                </div>
              </div>

              {/* Appointments card */}
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 flex-1
                              hover:border-[var(--sl-border-h)] transition-colors sl-fade-up">
                <div className="flex items-center gap-[9px] mb-[18px]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2"/>
                    <path d="M16 2v4"/>
                    <path d="M8 2v4"/>
                    <path d="M3 10h18"/>
                  </svg>
                  <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                    Proximas Consultas
                  </h3>
                  <button
                    onClick={() => router.push('/corpo/saude')}
                    className="ml-auto text-[12px] font-medium text-[#f97316] hover:opacity-80 transition-opacity"
                  >
                    Ver todas &rarr;
                  </button>
                </div>

                {!nextAppointment ? (
                  <p className="text-[12px] text-[var(--sl-t3)]">Nenhuma consulta agendada.</p>
                ) : (
                  <div className="flex flex-col gap-[10px]">
                    {/* Appointment row - matching prototype style */}
                    <div className="flex items-center gap-3 p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
                      <div className="text-center min-w-[40px]">
                        <div className="font-[DM_Mono] text-[18px] font-medium leading-none text-[var(--sl-t1)]">
                          {nextApptDate ? nextApptDate.getDate().toString().padStart(2, '0') : '--'}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-[.08em] text-[#06b6d4] mt-0.5">
                          {nextApptDate ? nextApptDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '') : ''}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[var(--sl-t1)]">
                          {nextAppointment.specialty}
                        </div>
                        {nextAppointment.doctor_name && (
                          <div className="text-[11px] text-[var(--sl-t3)]">
                            Dr(a). {nextAppointment.doctor_name}
                          </div>
                        )}
                      </div>
                      <span
                        className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                        style={{
                          background: daysUntil !== null && daysUntil <= 7
                            ? 'rgba(6,182,212,.1)'
                            : daysUntil !== null && daysUntil <= 21
                              ? 'rgba(245,158,11,.1)'
                              : 'var(--sl-s3)',
                          color: daysUntil !== null && daysUntil <= 7
                            ? '#06b6d4'
                            : daysUntil !== null && daysUntil <= 21
                              ? '#f59e0b'
                              : 'var(--sl-t3)',
                        }}
                      >
                        {daysUntil !== null
                          ? daysUntil === 0 ? 'Hoje'
                          : daysUntil === 1 ? 'Amanha'
                          : `${daysUntil} dias`
                          : '--'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
