'use client'

import type { MedicalAppointment } from '@/hooks/use-corpo'

const CORPO_COLOR = '#f97316'
const CORPO_BG = 'rgba(249,115,22,0.12)'

const SPECIALTY_ICONS: Record<string, string> = {
  'Dentista': '🦷', 'Cardiologista': '❤️', 'Oftalmologista': '👁️',
  'Dermatologista': '🧴', 'Clínico Geral': '🩺', 'Nutricionista': '🥗',
  'Ortopedista': '🦴', 'Psicólogo': '🧠', 'Psiquiatra': '🧠',
  'Endocrinologista': '💊', 'Ginecologista': '👩', 'Urologista': '🏥',
  'Otorrino': '👂', 'Outro': '🩻',
}

function getDaysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function getBadge(days: number): { label: string; color: string; bg: string } {
  if (days < 0) return { label: 'Passado', color: 'var(--sl-t3)', bg: 'var(--sl-s2)' }
  if (days === 0) return { label: 'Hoje!', color: '#10b981', bg: 'rgba(16,185,129,0.12)' }
  if (days <= 3) return { label: `${days} dias`, color: CORPO_COLOR, bg: CORPO_BG }
  if (days <= 14) return { label: `${days} dias`, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
  return { label: `${days} dias`, color: 'var(--sl-t2)', bg: 'var(--sl-s2)' }
}

interface CorpoTabSaudeProps {
  appointments: MedicalAppointment[]
  onOpenModal: () => void
}

export function CorpoTabSaude({ appointments, onOpenModal }: CorpoTabSaudeProps) {
  const upcoming = appointments
    .filter((a) => a.status === 'scheduled' && new Date(a.appointment_date) >= new Date())
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())

  const past = appointments
    .filter((a) => a.status === 'completed' || new Date(a.appointment_date) < new Date())
    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())

  const followUpAlerts = appointments.filter(
    (a) => a.follow_up_status === 'pending' && a.follow_up_reminder_date
  )

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3">
        <span className="text-[13px] text-[var(--sl-t2)]">{upcoming.length} consulta{upcoming.length !== 1 ? 's' : ''} agendada{upcoming.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Próximas consultas */}
      {upcoming.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pb-2">PRÓXIMAS CONSULTAS</p>
          {upcoming.map((appt, idx) => {
            const dt = new Date(appt.appointment_date)
            const days = getDaysUntil(appt.appointment_date)
            const badge = getBadge(days)
            const isFirst = idx === 0
            return isFirst ? (
              /* Primeiro appointment — card expandido com 3 mini-cards */
              <div
                key={appt.id}
                className="mx-4 mb-3 rounded-2xl p-4"
                style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.25)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center text-[22px] flex-shrink-0" style={{ background: CORPO_BG }}>
                    {SPECIALTY_ICONS[appt.specialty] ?? '🩺'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[var(--sl-t1)]">{appt.specialty}</p>
                    {appt.doctor_name && (
                      <p className="text-[12px] text-[var(--sl-t2)]">
                        {appt.doctor_name}{appt.location && ` — ${appt.location}`}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-[11px] font-medium px-2 py-[3px] rounded-full flex-shrink-0"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {badge.label}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-[10px] p-2 text-center" style={{ background: 'var(--sl-s2)' }}>
                    <p className="text-[10px] text-[var(--sl-t2)] mb-1">DATA</p>
                    <p className="text-[13px] font-semibold text-[var(--sl-t1)]">
                      {dt.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1 rounded-[10px] p-2 text-center" style={{ background: 'var(--sl-s2)' }}>
                    <p className="text-[10px] text-[var(--sl-t2)] mb-1">HORÁRIO</p>
                    <p className="text-[13px] font-semibold text-[var(--sl-t1)]">
                      {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex-1 rounded-[10px] p-2 text-center" style={{ background: 'var(--sl-s2)' }}>
                    <p className="text-[10px] text-[var(--sl-t2)] mb-1">CUSTO</p>
                    <p className="text-[13px] font-semibold" style={{ color: appt.cost ? '#f59e0b' : 'var(--sl-t3)' }}>
                      {appt.cost ? `R$ ${appt.cost.toFixed(0)}` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Demais appointments — linha compacta */
              <div
                key={appt.id}
                className="mx-4 mb-2 rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
              >
                <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] flex-shrink-0" style={{ background: CORPO_BG }}>
                  {SPECIALTY_ICONS[appt.specialty] ?? '🩺'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[var(--sl-t1)]">{appt.specialty}</p>
                  <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">
                    {appt.doctor_name ? `${appt.doctor_name} · ` : ''}
                    {dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    {appt.cost ? ` · R$ ${appt.cost.toFixed(0)}` : ''}
                  </p>
                </div>
                <span
                  className="text-[11px] font-medium px-2 py-[3px] rounded-full flex-shrink-0"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              </div>
            )
          })}
        </>
      )}

      {/* CTA agendar nova consulta */}
      <div className="px-4 mb-3">
        <button
          onClick={onOpenModal}
          className="w-full rounded-[10px] p-4 text-center transition-colors"
          style={{
            background: 'rgba(249,115,22,0.06)',
            border: '1.5px dashed rgba(249,115,22,0.35)',
          }}
        >
          <p className="text-[22px] mb-1.5">📅</p>
          <p className="text-[14px] font-medium" style={{ color: CORPO_COLOR }}>Agendar nova consulta</p>
          <p className="text-[12px] text-[var(--sl-t2)] mt-1">Sincroniza com Tempo e Finanças</p>
        </button>
      </div>

      {/* Alertas de retorno */}
      {followUpAlerts.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pb-2 mt-1">
            ALERTAS DE RETORNO
          </p>
          {followUpAlerts.map((appt) => {
            const reminderDate = new Date(appt.follow_up_reminder_date!)
            const daysLeft = Math.ceil((reminderDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return (
              <div
                key={`fu-${appt.id}`}
                className="mx-4 mb-2 rounded-2xl p-4"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <div className="flex gap-[10px] items-center">
                  <span className="text-[20px]">⚠️</span>
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--sl-t1)]">Retorno {appt.specialty}</p>
                    <p className="text-[12px] text-[var(--sl-t2)]">
                      Vence em {reminderDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {daysLeft > 0 ? ` · Faltam ${daysLeft} dias` : ' · Vencido!'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* Histórico */}
      {past.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pb-2 mt-1">HISTÓRICO</p>
          <div style={{ background: 'var(--sl-s1)', borderTop: '1px solid var(--sl-border)', borderBottom: '1px solid var(--sl-border)' }}>
            {past.slice(0, 8).map((appt) => {
              const dt = new Date(appt.appointment_date)
              return (
                <div key={appt.id} className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)] last:border-b-0">
                  <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] flex-shrink-0" style={{ background: CORPO_BG }}>
                    {SPECIALTY_ICONS[appt.specialty] ?? '🩺'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--sl-t1)]">{appt.specialty}</p>
                    <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">
                      {dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {appt.doctor_name ? ` · ${appt.doctor_name}` : ''}
                      {appt.cost ? ` · R$ ${appt.cost.toFixed(0)}` : ''}
                    </p>
                    {appt.follow_up_status === 'pending' && appt.follow_up_reminder_date && (
                      <div className="mt-1">
                        <span
                          className="text-[11px] px-2 py-[2px] rounded-[10px]"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                        >
                          ↩ Retorno {new Date(appt.follow_up_reminder_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Empty state */}
      {appointments.length === 0 && (
        <div className="mx-4 py-8 text-center">
          <p className="text-[32px] mb-3">🏥</p>
          <p className="text-[14px] font-semibold text-[var(--sl-t1)] mb-1">Nenhuma consulta registrada</p>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">Agende sua primeira consulta médica</p>
          <button
            onClick={onOpenModal}
            className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold text-black"
            style={{ background: CORPO_COLOR }}
          >
            + Agendar consulta
          </button>
        </div>
      )}
    </div>
  )
}
