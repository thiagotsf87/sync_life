'use client'

import { useMemo } from 'react'
import { calcIMC, IMC_LABEL } from '@/hooks/use-corpo'
import type { HealthProfile, WeightEntry, MedicalAppointment, Activity, DailyWaterIntake } from '@/hooks/use-corpo'

const CORPO_COLOR = '#f97316'
const CORPO_BG = 'rgba(249,115,22,0.12)'
const WATER_COLOR = '#06b6d4'

interface CorpoTabDashboardProps {
  profile: HealthProfile | null
  latestWeight: WeightEntry | null
  entries: WeightEntry[]
  nextAppointment: MedicalAppointment | null
  weekActivities: Activity[]
  water: DailyWaterIntake | null
  onOpenProfile: () => void
  onOpenWeight: () => void
  onOpenActivity: () => void
  onAddWater: (ml: number) => void
}

function formatDaysUntil(dateStr: string): string {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  if (diff > 0) return `Em ${diff} dias`
  return 'Passado'
}

function getSpecialtyIcon(specialty: string): string {
  const map: Record<string, string> = {
    'Dentista': '🦷', 'Cardiologista': '❤️', 'Oftalmologista': '👁️',
    'Dermatologista': '🧴', 'Clínico Geral': '🩺', 'Nutricionista': '🥗',
    'Ortopedista': '🦴', 'Psicólogo': '🧠', 'Psiquiatra': '🧠',
    'Endocrinologista': '💊', 'Ginecologista': '👩', 'Urologista': '🏥',
    'Otorrino': '👂', 'Outro': '🩻',
  }
  return map[specialty] ?? '🩺'
}

export function CorpoTabDashboard({
  profile, latestWeight, entries, nextAppointment,
  weekActivities, water, onOpenProfile, onOpenWeight, onOpenActivity, onAddWater,
}: CorpoTabDashboardProps) {
  const imc = latestWeight && profile?.height_cm
    ? calcIMC(latestWeight.weight, profile.height_cm)
    : null
  const imcInfo = imc ? IMC_LABEL(imc) : null

  const waterIntakeMl = water?.intake_ml ?? 0
  const waterGoalMl = water?.goal_ml ?? (profile as any)?.daily_water_goal_ml ?? 2500
  const waterPct = Math.min((waterIntakeMl / waterGoalMl) * 100, 100)
  const waterL = (waterIntakeMl / 1000).toFixed(1)
  const waterGoalL = (waterGoalMl / 1000).toFixed(1)

  const weekGoal = profile?.weekly_activity_goal ?? 4
  const actCount = weekActivities.length

  // Weight sparkline (last 30 entries reversed to chronological)
  const sparkPoints = useMemo(() => {
    const pts = [...entries].reverse().slice(-10)
    if (pts.length < 2) return null
    const weights = pts.map((e) => e.weight)
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    const range = max - min || 1
    return pts.map((e, i) => ({
      x: (i / (pts.length - 1)) * 320,
      y: 60 - ((e.weight - min) / range) * 46,
    }))
  }, [entries])

  const weightDelta = entries.length >= 2
    ? (entries[0].weight - entries[entries.length > 5 ? 4 : entries.length - 1].weight).toFixed(1)
    : null

  const nextApptDate = nextAppointment
    ? new Date(nextAppointment.appointment_date)
    : null

  return (
    <div className="pb-6">
      {/* KPI 2×2 */}
      <div className="grid grid-cols-2 gap-2 px-4 mb-3">
        {/* Peso */}
        <div className="rounded-[10px] p-3" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">Peso atual</p>
          <p className="font-[DM_Mono] text-[20px] font-bold" style={{ color: CORPO_COLOR }}>
            {latestWeight ? <>{latestWeight.weight}<span className="text-[13px]">kg</span></> : <span className="text-[var(--sl-t3)]">—</span>}
          </p>
          <div className="text-[11px] text-[var(--sl-t2)] mt-[2px]">
            {imc && imcInfo ? `IMC ${imc.toFixed(1)} · ${imcInfo.label}` : (
              <button onClick={onOpenProfile} className="text-[var(--corpo)] font-medium">Configurar perfil →</button>
            )}
          </div>
        </div>

        {/* TMB/TDEE */}
        <div className="rounded-[10px] p-3" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">TMB / TDEE</p>
          <p className="font-[DM_Mono] text-[20px] font-bold" style={{ color: profile?.bmr ? '#f59e0b' : 'var(--sl-t3)' }}>
            {profile?.bmr ? <>{Math.round(profile.bmr)}<span className="text-[13px]">kcal</span></> : <span>—</span>}
          </p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">
            {profile?.tdee ? `TDEE: ${Math.round(profile.tdee)} kcal` : 'Configure perfil'}
          </p>
        </div>

        {/* Atividades */}
        <div className="rounded-[10px] p-3" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">Atividades (semana)</p>
          <p className="font-[DM_Mono] text-[20px] font-bold text-[var(--sl-t1)]">
            {actCount}<span className="text-[13px] text-[var(--sl-t3)]">/{weekGoal}</span>
          </p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">Meta: {weekGoal}/semana</p>
        </div>

        {/* Próxima consulta */}
        <div className="rounded-[10px] p-3" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
          <p className="text-[10px] text-[var(--sl-t2)] uppercase tracking-[0.4px] mb-1">Próxima consulta</p>
          <p className="font-[DM_Mono] text-[20px] font-bold" style={{ color: nextApptDate ? WATER_COLOR : 'var(--sl-t3)' }}>
            {nextApptDate
              ? nextApptDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
              : '—'}
          </p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">
            {nextAppointment
              ? `${nextAppointment.specialty} · ${formatDaysUntil(nextAppointment.appointment_date)}`
              : 'Sem consultas'}
          </p>
        </div>
      </div>

      {/* Weight sparkline */}
      {sparkPoints && entries.length >= 2 && (
        <div
          className="mx-4 mb-3 rounded-2xl p-4"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
        >
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[14px] font-semibold text-[var(--sl-t1)]">Evolução do peso</span>
            {weightDelta !== null && (
              <span
                className="text-[11px] font-medium px-2 py-[3px] rounded-full"
                style={{
                  background: parseFloat(weightDelta) < 0 ? 'rgba(16,185,129,0.12)' : 'rgba(249,115,22,0.12)',
                  color: parseFloat(weightDelta) < 0 ? '#10b981' : CORPO_COLOR,
                }}
              >
                {parseFloat(weightDelta) < 0 ? '↓' : '↑'} {Math.abs(parseFloat(weightDelta))}kg no período
              </span>
            )}
          </div>
          <svg viewBox="0 0 320 70" style={{ width: '100%', height: 70 }}>
            <defs>
              <linearGradient id="spk-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CORPO_COLOR} stopOpacity="0.3" />
                <stop offset="100%" stopColor={CORPO_COLOR} stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const pathD = sparkPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
              const areaD = pathD + ` L${sparkPoints[sparkPoints.length - 1].x},70 L0,70 Z`
              return (
                <>
                  <path d={areaD} fill="url(#spk-grad)" />
                  <path d={pathD} fill="none" stroke={CORPO_COLOR} strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx={sparkPoints[sparkPoints.length - 1].x} cy={sparkPoints[sparkPoints.length - 1].y} r="5" fill={CORPO_COLOR} />
                  {profile?.weight_goal_kg && (
                    <line x1="0" y1="10" x2="320" y2="10" stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" strokeDasharray="5,4" />
                  )}
                </>
              )
            })()}
          </svg>
          <div className="flex justify-between mt-1 text-[10px] text-[var(--sl-t3)]">
            <span>{new Date(entries[entries.length - 1]?.recorded_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
            <span>Hoje · {latestWeight?.weight}kg</span>
          </div>
        </div>
      )}

      {/* Hydration tracker */}
      <div
        className="mx-4 mb-3 rounded-2xl p-4"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-[13px] font-semibold text-[var(--sl-t1)]">💧 Hidratação</span>
          <span>
            <span className="font-[DM_Mono] text-[14px]" style={{ color: WATER_COLOR }}>{waterL}L</span>
            <span className="text-[var(--sl-t3)] text-[12px]"> / {waterGoalL}L</span>
          </span>
        </div>
        <div className="h-[10px] rounded-full overflow-hidden mb-3" style={{ background: 'var(--sl-s3)' }}>
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${waterPct}%`, background: WATER_COLOR }}
          />
        </div>
        <div className="flex gap-2">
          {[250, 500].map((ml) => (
            <button
              key={ml}
              onClick={() => onAddWater(ml)}
              className="flex-1 py-2 rounded-[8px] text-[12px] font-medium transition-colors"
              style={{ background: 'var(--sl-s2)', color: WATER_COLOR }}
            >
              +{ml}ml
            </button>
          ))}
          <button
            onClick={() => {
              const v = prompt('Quantidade em ml:')
              if (v) onAddWater(parseInt(v) || 0)
            }}
            className="flex-1 py-2 rounded-[8px] text-[12px] font-medium transition-colors"
            style={{ background: 'var(--sl-s2)', color: 'var(--sl-t3)' }}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Next appointment */}
      {nextAppointment && nextApptDate && (
        <div
          className="mx-4 mb-3 rounded-2xl p-4"
          style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}
        >
          <div className="flex gap-3 items-center">
            <div
              className="w-11 h-11 rounded-[12px] flex items-center justify-center text-[22px] flex-shrink-0"
              style={{ background: CORPO_BG }}
            >
              {getSpecialtyIcon(nextAppointment.specialty)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[var(--sl-t1)]">
                {nextAppointment.specialty}
                {nextAppointment.doctor_name && ` — ${nextAppointment.doctor_name}`}
              </p>
              <p className="text-[12px] text-[var(--sl-t2)]">
                {nextApptDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                {' · '}
                {nextApptDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {nextAppointment.cost && (
                <p className="text-[12px] mt-[2px]" style={{ color: '#f59e0b' }}>
                  💰 R$ {nextAppointment.cost.toFixed(0)} em Saúde
                </p>
              )}
            </div>
            <span
              className="text-[11px] font-medium px-2 py-[3px] rounded-full flex-shrink-0"
              style={{ background: 'rgba(249,115,22,0.12)', color: CORPO_COLOR }}
            >
              {formatDaysUntil(nextAppointment.appointment_date)}
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!latestWeight && (
        <>
          <div
            className="mx-4 mb-3 rounded-2xl p-6 text-center"
            style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.1),rgba(249,115,22,0.05))', border: '1px solid rgba(249,115,22,0.2)' }}
          >
            <p className="text-[40px] mb-3">🏃</p>
            <p className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)] mb-2">Configure seu Corpo</p>
            <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed mb-4">
              Para calcular TMB, TDEE e metas personalizadas, precisamos de alguns dados básicos.
            </p>
            <button
              onClick={onOpenProfile}
              className="px-6 py-3 rounded-[10px] font-[Syne] text-[14px] font-bold text-black"
              style={{ background: CORPO_COLOR }}
            >
              Configurar Perfil de Saúde →
            </button>
          </div>

          {/* COMEÇAR POR */}
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pb-2">COMEÇAR POR</p>
          <div style={{ background: 'var(--sl-s1)', borderTop: '1px solid var(--sl-border)', borderBottom: '1px solid var(--sl-border)' }}>
            {[
              { icon: '⚖️', title: 'Registrar primeiro peso', sub: 'Ponto de partida da sua jornada', action: onOpenWeight },
              { icon: '🏋️', title: 'Registrar primeira atividade', sub: 'Comece com qualquer exercício', action: onOpenActivity },
            ].map(({ icon, title, sub, action }) => (
              <button
                key={title}
                onClick={action}
                className="w-full flex items-center gap-3 px-5 py-4 border-b border-[var(--sl-border)] last:border-b-0 text-left"
              >
                <div
                  className="w-10 h-10 rounded-[11px] flex items-center justify-center text-[20px] flex-shrink-0"
                  style={{ background: CORPO_BG }}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[var(--sl-t1)]">{title}</p>
                  <p className="text-[12px] text-[var(--sl-t2)] mt-[2px]">{sub}</p>
                </div>
                <span className="text-[16px] text-[var(--sl-t3)]">→</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* AI insight */}
      {profile && latestWeight && (
        <div
          className="mx-4 mt-1 rounded-2xl p-4 flex items-start gap-[10px]"
          style={{ background: 'rgba(0,85,255,0.06)', border: '1px solid rgba(0,85,255,0.15)' }}
        >
          <span className="text-[18px]">🤖</span>
          <div className="text-[13px] text-[var(--sl-t2)] leading-relaxed">
            {profile.weight_goal_kg && latestWeight.weight > profile.weight_goal_kg
              ? <>Você está no ritmo certo para atingir{' '}
                <span style={{ color: CORPO_COLOR, fontWeight: 600 }}>{profile.weight_goal_kg}kg</span>.{' '}
                {waterPct < 80 && <><span style={{ color: WATER_COLOR }}>Beba mais {Math.round((waterGoalMl - waterIntakeMl) / 1000 * 10) / 10}L</span> para a meta de hidratação.</>}
              </>
              : <>Continue mantendo seus hábitos saudáveis. {actCount >= weekGoal ? '🏆 Você atingiu a meta de atividades da semana!' : `Faltam ${weekGoal - actCount} atividade${weekGoal - actCount > 1 ? 's' : ''} para a meta semanal.`}</>
            }
          </div>
        </div>
      )}
    </div>
  )
}
