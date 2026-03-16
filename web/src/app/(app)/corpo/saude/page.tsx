'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Activity } from 'lucide-react'
import { ModuleHeader } from '@/components/ui/module-header'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useAppointments, useSaveAppointment, useDeleteAppointment,
  SPECIALTIES,
  type SaveAppointmentData,
} from '@/hooks/use-corpo'
import { AppointmentCard } from '@/components/corpo/AppointmentCard'
import { createTransactionFromConsulta } from '@/lib/integrations/financas'
import { createEventFromConsulta } from '@/lib/integrations/agenda'
import { useUserPlan } from '@/hooks/use-user-plan'
import { checkPlanLimit } from '@/lib/plan-limits'
import { uploadCorpoFile } from '@/lib/storage/corpo'

type FilterTab = 'upcoming' | 'all' | 'completed'

const FOLLOW_UP_OPTIONS = [
  { label: 'Sem retorno', value: null },
  { label: '1 mes', value: 1 },
  { label: '2 meses', value: 2 },
  { label: '3 meses', value: 3 },
  { label: '6 meses', value: 6 },
  { label: '1 ano', value: 12 },
]

const EMPTY_FORM = {
  specialty: 'Clinico Geral',
  doctor_name: '',
  location: '',
  appointment_date: new Date().toISOString().slice(0, 16),
  cost: '',
  notes: '',
  follow_up_months: null as number | null,
  syncToFinancas: false,
  syncToAgenda: false,
}

export default function SaudePage() {
  const router = useRouter()

  const { appointments, loading, error, reload } = useAppointments()
  const saveAppointment = useSaveAppointment()
  const deleteAppointment = useDeleteAppointment()
  const { isPro } = useUserPlan()

  const [tab, setTab] = useState<FilterTab>('all')
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  async function handleSave() {
    if (!form.specialty || !form.appointment_date) {
      toast.error('Informe especialidade e data')
      return
    }
    // RN-CRP-08: limite FREE de 3 consultas ativas/mes
    const now = new Date()
    const scheduledThisMonth = appointments.filter(a => {
      const d = new Date(a.appointment_date)
      return a.status === 'scheduled' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const limitCheck = checkPlanLimit(isPro, 'consultations_per_month', scheduledThisMonth.length)
    if (!limitCheck.allowed) {
      toast.error(limitCheck.upsellMessage)
      return
    }
    setIsSaving(true)
    try {
      const data: SaveAppointmentData = {
        specialty: form.specialty,
        doctor_name: form.doctor_name || null,
        location: form.location || null,
        appointment_date: new Date(form.appointment_date).toISOString(),
        cost: form.cost ? parseFloat(form.cost) : null,
        notes: form.notes || null,
        attachment_url: attachmentFile ? await uploadCorpoFile(attachmentFile, 'appointments') : null,
        status: 'scheduled',
        follow_up_months: form.follow_up_months,
      }
      await saveAppointment(data)
      // RN-CRP-01: criar evento na Agenda
      if (form.syncToAgenda) {
        await createEventFromConsulta({
          specialty: form.specialty,
          doctorName: form.doctor_name || null,
          location: form.location || null,
          appointmentDate: form.appointment_date,
        })
      }
      // RN-CRP-07: sincronizar custo com Financas
      if (form.cost && form.syncToFinancas) {
        await createTransactionFromConsulta({
          specialty: form.specialty,
          cost: parseFloat(form.cost),
          appointmentDate: form.appointment_date,
        })
      }
      toast.success('Consulta agendada!')
      setShowModal(false)
      setForm(EMPTY_FORM)
      setAttachmentFile(null)
      await reload()
    } catch {
      toast.error('Erro ao agendar consulta')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleComplete(id: string) {
    try {
      await saveAppointment({ specialty: '', appointment_date: '', status: 'completed' }, id)
      toast.success('Consulta marcada como realizada')
      await reload()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  async function handleCancel(id: string) {
    try {
      await saveAppointment({ specialty: '', appointment_date: '', status: 'cancelled' }, id)
      toast.success('Consulta cancelada')
      await reload()
    } catch {
      toast.error('Erro ao cancelar')
    }
  }

  async function handleDelete(id: string) {
    // RN-CRP-39: avisar sobre itens vinculados (evento na Agenda, transacao em Financas)
    if (!confirm('Excluir esta consulta?\n\nEventos criados automaticamente na Agenda e transacoes em Financas vinculadas a esta consulta nao serao removidos automaticamente.')) return
    try {
      await deleteAppointment(id)
      toast.success('Consulta excluida')
      await reload()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  const now = new Date()
  const filtered = appointments.filter(a => {
    const date = new Date(a.appointment_date)
    if (tab === 'upcoming') return a.status === 'scheduled' && date >= now
    if (tab === 'completed') return a.status === 'completed'
    return true
  }).sort((a, b) => {
    if (tab === 'upcoming') return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
    return new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
  })

  const upcomingCount = appointments.filter(a => a.status === 'scheduled' && new Date(a.appointment_date) >= now).length
  const completedCount = appointments.filter(a => a.status === 'completed').length
  const totalCost = appointments.filter(a => a.cost).reduce((s, a) => s + (a.cost ?? 0), 0)

  // Next upcoming appointment
  const nextAppointment = appointments
    .filter(a => a.status === 'scheduled' && new Date(a.appointment_date) >= now)
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0]

  const nextApptDate = nextAppointment ? new Date(nextAppointment.appointment_date) : null
  const daysUntilNext = nextApptDate ? Math.ceil((nextApptDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

  function getStatusPill(status: string) {
    if (status === 'scheduled') return { bg: 'rgba(6,182,212,.1)', color: '#06b6d4', label: 'Agendada' }
    if (status === 'completed') return { bg: 'rgba(16,185,129,.1)', color: '#10b981', label: 'Realizada' }
    if (status === 'cancelled') return { bg: 'rgba(244,63,94,.1)', color: '#f43f5e', label: 'Cancelada' }
    return { bg: 'var(--sl-s3)', color: 'var(--sl-t3)', label: status }
  }

  return (
    <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* 1. ModuleHeader */}
      <ModuleHeader
        icon={Activity}
        iconBg="rgba(249,115,22,.08)"
        iconColor="#f97316"
        title="Saude Preventiva"
        subtitle="Consultas, exames e acompanhamento medico"
      >
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                     bg-[#f97316] text-white hover:brightness-110 hover:-translate-y-px
                     transition-all shadow-[0_6px_20px_rgba(249,115,22,.15)]"
        >
          <Plus size={16} />
          Agendar Consulta
        </button>
      </ModuleHeader>

      {/* 2. Next Appointment Hero */}
      {nextAppointment && (
        <div className="flex items-center gap-6 px-8 py-7 bg-[var(--sl-s1)] border border-[rgba(249,115,22,.2)] rounded-[18px] mb-7 relative overflow-hidden sl-fade-up sl-delay-1 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="absolute top-0 left-6 right-6 h-[2.5px] rounded-b bg-[#f97316]" />
          <div className="text-center min-w-[64px]">
            <div className="text-[11px] font-bold uppercase tracking-[.08em] text-[#f97316]">
              {nextApptDate?.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '') ?? ''}
            </div>
            <div className="font-[DM_Mono] text-[32px] font-medium leading-none text-[var(--sl-t1)]">
              {nextApptDate ? nextApptDate.getDate().toString().padStart(2, '0') : '--'}
            </div>
          </div>
          <div className="w-px h-10 bg-[var(--sl-border)]" />
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-semibold text-[var(--sl-t1)] mb-[2px]">{nextAppointment.specialty}</h3>
            <p className="text-[12px] text-[var(--sl-t2)]">
              {nextAppointment.doctor_name ? `Dr(a). ${nextAppointment.doctor_name}` : ''}
              {nextAppointment.location ? ` \u00B7 ${nextAppointment.location}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCancel(nextAppointment.id)}
              className="inline-flex items-center gap-[7px] px-4 py-2 rounded-[11px] text-[12px] font-semibold
                         border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-colors"
            >
              Cancelar
            </button>
          </div>
          <span
            className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
            style={{ background: 'rgba(249,115,22,.08)', color: '#f97316' }}
          >
            {daysUntilNext !== null
              ? daysUntilNext === 0 ? 'Hoje'
              : daysUntilNext === 1 ? 'Amanha'
              : `em ${daysUntilNext} dias`
              : '--'}
          </span>
        </div>
      )}

      {/* 3. Stats Grid (4 columns) */}
      <div className="grid grid-cols-4 gap-[14px] mb-7 max-sm:grid-cols-2 sl-fade-up sl-delay-2">
        {[
          { label: 'Proximas', value: String(upcomingCount), color: '#f59e0b' },
          { label: 'Realizadas', value: String(completedCount), color: '#10b981' },
          { label: 'Total', value: String(appointments.length), color: '#06b6d4' },
          { label: 'Custo Total', value: totalCost > 0 ? `R$ ${totalCost.toLocaleString('pt-BR')}` : 'R$ 0', color: '#f43f5e' },
        ].map(stat => (
          <div key={stat.label} className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] px-[18px] py-4 overflow-hidden text-center hover:border-[var(--sl-border-h)] transition-colors">
            <div className="absolute top-0 left-4 right-4 h-[2.5px] rounded-b" style={{ background: stat.color }} />
            <p className="text-[10px] font-bold uppercase tracking-[.08em] text-[var(--sl-t3)] mb-1">{stat.label}</p>
            <p className="font-[DM_Mono] font-medium text-[22px] text-[var(--sl-t1)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 4. Filter tabs */}
      <div className="flex gap-[6px] mb-5 sl-fade-up sl-delay-3">
        {([
          { id: 'all' as const, label: 'Todas' },
          { id: 'upcoming' as const, label: 'Proximas' },
          { id: 'completed' as const, label: 'Realizadas' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-[6px] rounded-[8px] text-[12px] font-semibold border transition-all',
              tab === t.id
                ? 'border-[#f97316] bg-[rgba(249,115,22,.08)] text-[var(--sl-t1)]'
                : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 5. Data Table */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-12 text-center sl-fade-up sl-delay-4">
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            {tab === 'upcoming' ? 'Nenhuma consulta agendada' : 'Nenhuma consulta'}
          </h3>
          {tab === 'upcoming' && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#f97316] text-white hover:opacity-90 mt-3"
            >
              <Plus size={15} />
              Agendar
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up sl-delay-4 hover:border-[var(--sl-border-h)] transition-colors">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] text-left py-[10px] px-[14px] border-b border-[var(--sl-border)]">Data</th>
                <th className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] text-left py-[10px] px-[14px] border-b border-[var(--sl-border)]">Especialidade</th>
                <th className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] text-left py-[10px] px-[14px] border-b border-[var(--sl-border)]">Profissional</th>
                <th className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] text-left py-[10px] px-[14px] border-b border-[var(--sl-border)]">Local</th>
                <th className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] text-left py-[10px] px-[14px] border-b border-[var(--sl-border)]">Custo</th>
                <th className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] text-left py-[10px] px-[14px] border-b border-[var(--sl-border)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const statusPill = getStatusPill(a.status)
                return (
                  <tr key={a.id} className="group hover:bg-[var(--sl-s2)] transition-colors cursor-pointer">
                    <td className="font-[DM_Mono] text-[13px] text-[var(--sl-t2)] py-[14px] px-[14px] border-b border-[rgba(120,165,220,.04)]">
                      {new Date(a.appointment_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="text-[13px] font-semibold text-[var(--sl-t1)] py-[14px] px-[14px] border-b border-[rgba(120,165,220,.04)]">
                      {a.specialty}
                    </td>
                    <td className="text-[13px] text-[var(--sl-t1)] py-[14px] px-[14px] border-b border-[rgba(120,165,220,.04)]">
                      {a.doctor_name ? `Dr(a). ${a.doctor_name}` : '--'}
                    </td>
                    <td className="text-[13px] text-[var(--sl-t3)] py-[14px] px-[14px] border-b border-[rgba(120,165,220,.04)]">
                      {a.location ?? '--'}
                    </td>
                    <td className="font-[DM_Mono] text-[13px] text-[var(--sl-t1)] py-[14px] px-[14px] border-b border-[rgba(120,165,220,.04)]">
                      {a.cost ? `R$ ${a.cost.toLocaleString('pt-BR')}` : '--'}
                    </td>
                    <td className="py-[14px] px-[14px] border-b border-[rgba(120,165,220,.04)]">
                      <span
                        className="inline-flex px-[10px] py-[3px] rounded-md text-[10px] font-bold"
                        style={{ background: statusPill.bg, color: statusPill.color }}
                      >
                        {statusPill.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {totalCost > 0 && (
            <div className="flex items-center justify-between pt-3 px-[14px] border-t border-[var(--sl-border)] mt-1">
              <span className="text-[11px] text-[var(--sl-t3)]">
                Media: R$ {appointments.length > 0 ? Math.round(totalCost / appointments.filter(a => a.cost).length).toLocaleString('pt-BR') : 0}/consulta
              </span>
              <span className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t1)]">
                Total: R$ {totalCost.toLocaleString('pt-BR')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[18px] text-[var(--sl-t1)] flex items-center gap-[10px]">
                <Activity size={20} className="text-[#f97316]" />
                Agendar Consulta
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 flex flex-col gap-4">

              {/* Specialties */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Especialidade</label>
                <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                  {SPECIALTIES.map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, specialty: s }))}
                      className={cn(
                        'px-2 py-1.5 rounded-[8px] text-[11px] border transition-all text-left truncate',
                        form.specialty === s
                          ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Medico(a)</label>
                  <input type="text" value={form.doctor_name}
                    onChange={e => setForm(f => ({ ...f, doctor_name: e.target.value }))}
                    placeholder="Nome do medico"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Local</label>
                  <input type="text" value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Clinica, hospital..."
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Data e Hora</label>
                  <input type="datetime-local" value={form.appointment_date}
                    onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Custo (R$)</label>
                  <input type="number" value={form.cost}
                    onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                    placeholder="Opcional"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                  />
                </div>
              </div>

              {/* Follow up */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Retorno previsto</label>
                <div className="flex flex-wrap gap-1.5">
                  {FOLLOW_UP_OPTIONS.map(opt => (
                    <button key={String(opt.value)} onClick={() => setForm(f => ({ ...f, follow_up_months: opt.value }))}
                      className={cn(
                        'px-3 py-1.5 rounded-[8px] text-[11px] border transition-all',
                        form.follow_up_months === opt.value
                          ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Notas / Motivo</label>
                <textarea value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Motivo da consulta, sintomas..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4] resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Anexo (opcional)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => setAttachmentFile(e.target.files?.[0] ?? null)}
                  className="w-full text-[12px] text-[var(--sl-t2)]"
                />
                {attachmentFile && (
                  <p className="text-[10px] text-[var(--sl-t3)] mt-1">{attachmentFile.name}</p>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
                <div>
                  <p className="text-[13px] font-medium text-[var(--sl-t1)]">Adicionar a Agenda</p>
                  <p className="text-[11px] text-[var(--sl-t3)]">Cria evento automatico na Agenda</p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, syncToAgenda: !f.syncToAgenda }))}
                  className={cn('w-10 h-6 rounded-full transition-all relative shrink-0', form.syncToAgenda ? 'bg-[#06b6d4]' : 'bg-[var(--sl-s3)]')}
                >
                  <div className={cn('w-4 h-4 rounded-full bg-white absolute top-1 transition-all', form.syncToAgenda ? 'left-5' : 'left-1')} />
                </button>
              </div>

              {form.cost && parseFloat(form.cost) > 0 && (
                <div className="flex items-center justify-between p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--sl-t1)]">Registrar em Financas</p>
                    <p className="text-[11px] text-[var(--sl-t3)]">Cria despesa de saude automaticamente</p>
                  </div>
                  <button
                    onClick={() => setForm(f => ({ ...f, syncToFinancas: !f.syncToFinancas }))}
                    className={cn('w-10 h-6 rounded-full transition-all relative shrink-0', form.syncToFinancas ? 'bg-[#06b6d4]' : 'bg-[var(--sl-s3)]')}
                  >
                    <div className={cn('w-4 h-4 rounded-full bg-white absolute top-1 transition-all', form.syncToFinancas ? 'left-5' : 'left-1')} />
                  </button>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90 disabled:opacity-50">
                  {isSaving ? 'Agendando...' : 'Agendar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
