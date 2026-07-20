'use client'

import { Trash2, CheckCircle2, X, Stethoscope, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fmtBRL } from '@/lib/format/currency'
import type { MedicalAppointment } from '@/hooks/use-corpo'

interface AppointmentCardProps {
  appointment: MedicalAppointment
  onComplete?: (id: string) => Promise<void>
  onCancel?: (id: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#D9962E',
  completed: '#0F766E',
  cancelled: '#6e90b8',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendada',
  completed: 'Realizada',
  cancelled: 'Cancelada',
}

export function AppointmentCard({ appointment, onComplete, onCancel, onDelete }: AppointmentCardProps) {
  const color = STATUS_COLORS[appointment.status] ?? '#6e90b8'
  const date = new Date(appointment.appointment_date)
  const isPast = date < new Date()
  const isScheduled = appointment.status === 'scheduled'

  const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className={cn(
      'bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl p-4 hover:border-[var(--sl-border-h)] transition-colors',
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-[13px] font-semibold text-[var(--sl-t1)] flex items-center gap-1.5">
              <Stethoscope size={13} className="text-[#3CA0B5]" />
              {appointment.specialty}
            </p>
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
              style={{ color, background: color + '20' }}
            >
              {STATUS_LABELS[appointment.status]}
            </span>
          </div>
          {appointment.doctor_name && (
            <p className="text-[12px] text-[var(--sl-t2)]">Dr(a). {appointment.doctor_name}</p>
          )}
          <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
            {date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' })}
            {appointment.location && ` · ${appointment.location}`}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isScheduled && !isPast && onComplete && (
            <button
              onClick={() => onComplete(appointment.id)}
              className="p-1.5 rounded-lg hover:bg-[rgba(15,118,110,0.1)] transition-colors"
              title="Marcar como realizada"
            >
              <CheckCircle2 size={14} className="text-[#0F766E]" />
            </button>
          )}
          {isScheduled && onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="p-1.5 rounded-lg hover:bg-[rgba(219,100,120,0.1)] transition-colors"
              title="Cancelar consulta"
            >
              <X size={14} className="text-[var(--sl-t3)]" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(appointment.id)}
              className="p-1.5 rounded-lg hover:bg-[rgba(219,100,120,0.1)] transition-colors"
            >
              <Trash2 size={12} className="text-[var(--sl-t3)]" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {isScheduled && !isPast && (
          <span className={cn(
            'text-[11px] font-semibold',
            daysUntil <= 7 ? 'text-[#D9962E]' : 'text-[var(--sl-t3)]'
          )}>
            {daysUntil === 0 ? 'Hoje' : daysUntil === 1 ? 'Amanha' : `em ${daysUntil} dias`}
          </span>
        )}
        {appointment.cost != null && (
          <span className="sl-num text-[11px] text-[var(--sl-t3)]">
            {fmtBRL(appointment.cost)}
          </span>
        )}
      </div>

      {appointment.notes && (
        <p className="text-[11px] text-[var(--sl-t3)] mt-2 italic line-clamp-2 border-t border-[var(--sl-border)] pt-2">
          {appointment.notes}
        </p>
      )}
      {appointment.attachment_url && (
        <a
          href={appointment.attachment_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-[#3CA0B5] mt-2 hover:opacity-80"
        >
          <Paperclip size={11} />
          Ver anexo
        </a>
      )}
    </div>
  )
}
