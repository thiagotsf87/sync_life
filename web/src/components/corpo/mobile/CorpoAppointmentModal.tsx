'use client'

import { useState } from 'react'
import { SPECIALTIES, type SaveAppointmentData } from '@/hooks/use-corpo'

const CORPO_COLOR = '#f97316'
const CORPO_BG = 'rgba(249,115,22,0.12)'

const FOLLOW_UP_OPTIONS = [
  { label: 'Sem retorno', value: null },
  { label: '1 mês', value: 1 },
  { label: '3 meses', value: 3 },
  { label: '6 meses', value: 6 },
  { label: '12 meses', value: 12 },
]

const SPECIALTY_ICONS: Record<string, string> = {
  'Clínico Geral': '🩺', 'Cardiologista': '❤️', 'Dermatologista': '🧴',
  'Endocrinologista': '💊', 'Ginecologista': '👩', 'Nutricionista': '🥗',
  'Oftalmologista': '👁️', 'Ortopedista': '🦴', 'Otorrino': '👂',
  'Psicólogo': '🧠', 'Psiquiatra': '🧠', 'Urologista': '🏥',
  'Dentista': '🦷', 'Outro': '🩻',
}

interface CorpoAppointmentModalProps {
  onClose: () => void
  onSave: (data: SaveAppointmentData) => Promise<void>
}

export function CorpoAppointmentModal({ onClose, onSave }: CorpoAppointmentModalProps) {
  const [specialty, setSpecialty] = useState('Clínico Geral')
  const [doctorName, setDoctorName] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [cost, setCost] = useState('')
  const [followUp, setFollowUp] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!date) return
    setSaving(true)
    try {
      const dateTime = time ? `${date}T${time}:00` : `${date}T09:00:00`
      const followUpDate = followUp
        ? (() => {
            const d = new Date(dateTime)
            d.setMonth(d.getMonth() + followUp)
            return d.toISOString().split('T')[0]
          })()
        : null

      await onSave({
        specialty,
        doctor_name: doctorName || null,
        location: location || null,
        appointment_date: dateTime,
        cost: cost ? parseFloat(cost.replace(',', '.')) : null,
        status: 'scheduled',
        follow_up_months: followUp,
        follow_up_status: followUp ? 'pending' : null,
        follow_up_reminder_date: followUpDate,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--sl-bg)' }}>
      {/* Int-header */}
      <div className="flex items-center justify-between px-5 py-4 pt-14">
        <button onClick={onClose} className="text-[14px] font-medium" style={{ color: CORPO_COLOR }}>
          ← Saúde
        </button>
        <span className="font-[Syne] text-[17px] font-bold text-[var(--sl-t1)]">Nova Consulta</span>
        <div style={{ width: 50 }} />
      </div>

      <div className="flex-1 overflow-y-auto pb-8 px-4 space-y-4">
        {/* Especialidade */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
            Especialidade *
          </label>
          <div
            className="rounded-[10px] px-3 py-3 flex items-center justify-between"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
          >
            <span className="text-[14px] text-[var(--sl-t1)]">
              {SPECIALTY_ICONS[specialty] ?? '🩺'} {specialty}
            </span>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="absolute opacity-0 inset-0 w-full cursor-pointer"
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-[12px] text-[var(--sl-t3)]">▼</span>
          </div>
        </div>

        {/* Médico */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
            Nome do médico
          </label>
          <input
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="Ex: Dra. Silva"
            className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
          />
        </div>

        {/* Local */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
            Local
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Clínica, hospital..."
            className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
          />
        </div>

        {/* Data + Horário */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
              Data *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
              Horário
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none text-center"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />
          </div>
        </div>

        {/* Custo + Retorno */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
              Custo estimado (R$)
            </label>
            <input
              type="number"
              min={0}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none text-center font-[DM_Mono]"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.3px] text-[var(--sl-t2)] block mb-2">
              Retorno
            </label>
            <div className="relative rounded-[10px]" style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}>
              <select
                value={followUp ?? ''}
                onChange={(e) => setFollowUp(e.target.value === '' ? null : Number(e.target.value))}
                className="w-full px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none bg-transparent"
              >
                {FOLLOW_UP_OPTIONS.map((opt) => (
                  <option key={String(opt.value)} value={opt.value ?? ''}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Integrações */}
        <div
          className="rounded-[10px] p-3"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
        >
          <p className="text-[11px] text-[var(--sl-t2)] uppercase tracking-[0.3px] mb-2">INTEGRAÇÕES</p>
          <div className="flex justify-between items-center">
            <span className="text-[13px] text-[var(--sl-t1)]">📅 Criar evento na Agenda</span>
            <div className="text-[11px] text-[var(--sl-t3)]">Em breve</div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[13px] text-[var(--sl-t1)]">💰 Registrar despesa em Finanças</span>
            <div className="text-[11px] text-[var(--sl-t3)]">Em breve</div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !date}
          className="w-full py-[14px] rounded-[10px] font-[Syne] text-[15px] font-bold text-black disabled:opacity-50"
          style={{ background: CORPO_COLOR }}
        >
          {saving ? 'Agendando…' : 'Agendar Consulta 📅'}
        </button>
      </div>
    </div>
  )
}
