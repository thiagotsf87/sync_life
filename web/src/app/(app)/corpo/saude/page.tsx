'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
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
  { label: '1 mês', value: 1 },
  { label: '2 meses', value: 2 },
  { label: '3 meses', value: 3 },
  { label: '6 meses', value: 6 },
  { label: '1 ano', value: 12 },
]

const EMPTY_FORM = {
  specialty: 'Clínico Geral',
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
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { appointments, loading, error, reload } = useAppointments()
  const saveAppointment = useSaveAppointment()
  const deleteAppointment = useDeleteAppointment()
  const { isPro } = useUserPlan()

  const [tab, setTab] = useState<FilterTab>('upcoming')
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  async function handleSave() {
    if (!form.specialty || !form.appointment_date) {
      toast.error('Informe especialidade e data')
      return
    }
    // RN-CRP-08: limite FREE de 3 consultas ativas/mês
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
      // RN-CRP-07: sincronizar custo com Finanças
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
    // RN-CRP-39: avisar sobre itens vinculados (evento na Agenda, transação em Finanças)
    if (!confirm('Excluir esta consulta?\n\n⚠️ Eventos criados automaticamente na Agenda e transações em Finanças vinculadas a esta consulta não serão removidos automaticamente.')) return
    try {
      await deleteAppointment(id)
      toast.success('Consulta excluída')
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

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => router.push('/corpo')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Corpo
        </button>
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl flex-1',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          🏥 Saúde Preventiva
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Agendar Consulta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5 max-sm:grid-cols-1">
        {[
          { label: 'Próximas', value: String(upcomingCount), color: '#f59e0b' },
          { label: 'Realizadas', value: String(completedCount), color: '#10b981' },
          { label: 'Total', value: String(appointments.length), color: '#06b6d4' },
        ].map(stat => (
          <div key={stat.label} className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: stat.color }} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">{stat.label}</p>
            <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {([
          { id: 'upcoming', label: 'Próximas' },
          { id: 'all', label: 'Todas' },
          { id: 'completed', label: 'Realizadas' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-1.5 rounded-[8px] text-[12px] font-medium border transition-all',
              tab === t.id
                ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[var(--sl-t1)]'
                : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🏥</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            {tab === 'upcoming' ? 'Nenhuma consulta agendada' : 'Nenhuma consulta'}
          </h3>
          {tab === 'upcoming' && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90 mt-3"
            >
              <Plus size={15} />
              Agendar
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(a => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">🏥 Agendar Consulta</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">

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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Médico(a)</label>
                  <input type="text" value={form.doctor_name}
                    onChange={e => setForm(f => ({ ...f, doctor_name: e.target.value }))}
                    placeholder="Nome do médico"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Local</label>
                  <input type="text" value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Clínica, hospital..."
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
                  <p className="text-[13px] font-medium text-[var(--sl-t1)]">Adicionar à Agenda</p>
                  <p className="text-[11px] text-[var(--sl-t3)]">Cria evento automático na Agenda</p>
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
                    <p className="text-[13px] font-medium text-[var(--sl-t1)]">Registrar em Finanças</p>
                    <p className="text-[11px] text-[var(--sl-t3)]">Cria despesa de saúde automaticamente</p>
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
