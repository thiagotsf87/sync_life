'use client'

import { useRouter } from 'next/navigation'

interface Appointment {
  specialty: string
  appointment_date: string
}

interface Trip {
  name: string
  destinations: string[]
  start_date: string
  status: string
}

export interface V3ModulesRowProps {
  weekActivityCount: number
  weekActivityMinutes: number
  nextAppointment: Appointment | null
  totalPatrimonio: number
  patrimonioGainPct: number
  patrimonioAssetsCount: number
  nextTrip: Trip | null
  daysUntilNextTrip: number | null
  totalTrips: number
}

export function V3ModulesRow({
  weekActivityCount,
  weekActivityMinutes,
  nextAppointment,
  totalPatrimonio,
  patrimonioGainPct,
  patrimonioAssetsCount,
  nextTrip,
  daysUntilNextTrip,
  totalTrips,
}: V3ModulesRowProps) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-3 gap-4 mt-4 max-lg:grid-cols-1">

      {/* Corpo */}
      <div
        className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors cursor-pointer"
        onClick={() => router.push('/corpo')}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">🏥 Corpo</span>
          <div className="h-0.5 w-6 rounded-full" style={{ background: '#f97316' }} />
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[var(--sl-t2)]">Atividades esta semana</span>
            <span className="font-[DM_Mono] text-[14px] font-medium" style={{ color: weekActivityCount >= 3 ? '#10b981' : '#f59e0b' }}>
              {weekActivityCount} sessões
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[var(--sl-t2)]">Minutos ativos</span>
            <span className="font-[DM_Mono] text-[14px] font-medium text-[var(--sl-t1)]">
              {weekActivityMinutes} min
            </span>
          </div>
          {nextAppointment ? (
            <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-[var(--sl-border)]">
              <span className="text-[12px] text-[var(--sl-t2)] truncate max-w-[60%]">
                📅 {nextAppointment.specialty}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[6px]"
                style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
                {new Date(nextAppointment.appointment_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ) : (
            <div className="pt-1 mt-0.5 border-t border-[var(--sl-border)]">
              <span className="text-[11px] text-[var(--sl-t3)]">Nenhuma consulta agendada</span>
            </div>
          )}
        </div>
      </div>

      {/* Patrimônio */}
      <div
        className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-1 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors cursor-pointer"
        onClick={() => router.push('/patrimonio')}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">📈 Patrimônio</span>
          <div className="h-0.5 w-6 rounded-full" style={{ background: '#10b981' }} />
        </div>
        <div className="flex flex-col gap-2.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">Carteira total</p>
            <p className="font-[DM_Mono] font-medium text-[22px] text-[var(--sl-t1)] leading-none">
              {totalPatrimonio > 0
                ? totalPatrimonio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '\u2014'}
            </p>
          </div>
          <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-[var(--sl-border)]">
            <span className="text-[12px] text-[var(--sl-t2)]">Rentabilidade</span>
            <span className="font-[DM_Mono] text-[14px] font-medium"
              style={{ color: patrimonioGainPct >= 0 ? '#10b981' : '#f43f5e' }}>
              {patrimonioGainPct >= 0 ? '+' : ''}{patrimonioGainPct}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[var(--sl-t2)]">Ativos</span>
            <span className="font-[DM_Mono] text-[14px] font-medium text-[var(--sl-t1)]">
              {patrimonioAssetsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Experiências */}
      <div
        className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-2 shadow-sm dark:shadow-none hover:border-[var(--sl-border-h)] transition-colors cursor-pointer"
        onClick={() => router.push('/experiencias')}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">✈️ Experiências</span>
          <div className="h-0.5 w-6 rounded-full" style={{ background: '#06b6d4' }} />
        </div>
        <div className="flex flex-col gap-2.5">
          {nextTrip ? (
            <>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">Próxima viagem</p>
                <p className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] truncate">{nextTrip.name}</p>
                <p className="text-[11px] text-[var(--sl-t3)]">{nextTrip.destinations[0]}</p>
              </div>
              <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-[var(--sl-border)]">
                <span className="text-[12px] text-[var(--sl-t2)]">
                  {new Date(nextTrip.start_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                </span>
                {daysUntilNextTrip != null && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[6px]"
                    style={{ background: 'rgba(6,182,212,0.10)', color: '#06b6d4' }}>
                    {daysUntilNextTrip === 0 ? 'Hoje!' : `em ${daysUntilNextTrip}d`}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">Viagens</p>
                <p className="font-[DM_Mono] font-medium text-[22px] text-[var(--sl-t1)]">{totalTrips}</p>
              </div>
              <div className="pt-1 mt-0.5 border-t border-[var(--sl-border)]">
                <span className="text-[11px] text-[var(--sl-t3)]">Nenhuma viagem planejada</span>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
