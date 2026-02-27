'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { useCorpoDashboard, calcIMC, IMC_LABEL } from '@/hooks/use-corpo'
import { KpiCard } from '@/components/ui/kpi-card'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { ActivityCard } from '@/components/corpo/ActivityCard'
import { AppointmentCard } from '@/components/corpo/AppointmentCard'

export default function CorpoPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { profile, latestWeight, nextAppointment, weekActivities, loading, error } = useCorpoDashboard()

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

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className={cn(
          'font-[Syne] font-extrabold text-2xl',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          🏃 Corpo
        </h1>
        <div className="flex-1" />
        <button
          onClick={() => router.push('/corpo/peso')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#f97316] text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Registrar Peso
        </button>
      </div>

      {/* ② KPI Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Peso Atual"
          value={latestWeight ? `${latestWeight.weight} kg` : '—'}
          delta={imc && imcInfo ? `IMC ${imc.toFixed(1)} · ${imcInfo.label}` : 'Registre seu peso'}
          deltaType="neutral"
          accent="#f97316"
        />
        <KpiCard
          label="TMB"
          value={profile?.bmr ? `${Math.round(profile.bmr)} kcal` : '—'}
          delta={profile?.tdee ? `TDEE: ${Math.round(profile.tdee)} kcal` : 'Configure perfil'}
          deltaType="neutral"
          accent="#f59e0b"
        />
        <KpiCard
          label="Atividades (semana)"
          value={String(weekActivities.length)}
          delta={weekMinutes > 0 ? `${weekMinutes} min · ${Math.round(weekCalories)} kcal` : 'Nenhuma este semana'}
          deltaType={weekActivities.length >= (profile?.weekly_activity_goal ?? 3) ? 'up' : 'neutral'}
          accent="#10b981"
        />
        <KpiCard
          label="Próxima Consulta"
          value={nextApptDate ? nextApptDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'}
          delta={
            daysUntil !== null
              ? daysUntil === 0 ? 'Hoje!'
              : daysUntil === 1 ? 'Amanhã'
              : `em ${daysUntil} dias`
              : 'Sem consultas'
          }
          deltaType={daysUntil !== null && daysUntil <= 7 ? 'warn' : 'neutral'}
          accent="#06b6d4"
        />
      </div>

      {/* ③ Jornada Insight */}
      <JornadaInsight
        text={
          profile && latestWeight
            ? <>Seu peso atual é <strong className="text-[var(--sl-t1)]">{latestWeight.weight} kg</strong>
              {imc && imcInfo && <> (IMC <strong style={{ color: imcInfo.color }}>{imc.toFixed(1)} — {imcInfo.label}</strong>)</>}.
              {weekActivities.length > 0 && <> Você fez <strong className="text-[#10b981]">{weekActivities.length} atividade{weekActivities.length !== 1 ? 's' : ''}</strong> essa semana.</>}
            </>
            : <>Configure seu perfil de saúde para habilitar o cálculo de TMB, TDEE e acompanhamento personalizado.</>
        }
      />

      {/* ④ Main grid */}
      {loading ? (
        <div className="grid grid-cols-[1fr_300px] gap-4 max-lg:grid-cols-1">
          <div className="h-64 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
          <div className="h-64 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_300px] gap-4 max-lg:grid-cols-1">

          {/* Atividades */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">🏋️ Atividades Recentes</h2>
              <button onClick={() => router.push('/corpo/atividades')} className="text-[12px] text-[#f97316] hover:opacity-80">
                Ver todas →
              </button>
            </div>

            {weekActivities.length === 0 ? (
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">🏃</div>
                <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Nenhuma atividade essa semana</h3>
                <button
                  onClick={() => router.push('/corpo/atividades')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#f97316] text-white hover:opacity-90"
                >
                  <Plus size={15} />
                  Registrar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                {weekActivities.slice(0, 6).map(a => <ActivityCard key={a.id} activity={a} />)}
              </div>
            )}
          </div>

          {/* Próximas consultas */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 h-fit">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🏥 Próximas Consultas</h2>
              <button onClick={() => router.push('/corpo/saude')} className="text-[11px] text-[#f97316] hover:opacity-80">
                Gerenciar →
              </button>
            </div>
            {!nextAppointment ? (
              <p className="text-[12px] text-[var(--sl-t3)]">Nenhuma consulta agendada.</p>
            ) : (
              <AppointmentCard appointment={nextAppointment} />
            )}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 mt-4 max-sm:grid-cols-2">
        {[
          { label: '⚖️ Peso', href: '/corpo/peso', color: '#f97316' },
          { label: '🏋️ Atividades', href: '/corpo/atividades', color: '#10b981' },
          { label: '🍽️ Cardápio', href: '/corpo/cardapio', color: '#f59e0b' },
          { label: '🏥 Saúde', href: '/corpo/saude', color: '#06b6d4' },
        ].map(({ label, href, color }) => (
          <button key={href} onClick={() => router.push(href)}
            className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 text-left hover:border-[var(--sl-border-h)] transition-colors sl-fade-up"
          >
            <div className="h-0.5 w-8 rounded-full mb-2" style={{ background: color }} />
            <p className="font-medium text-[13px] text-[var(--sl-t1)]">{label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
