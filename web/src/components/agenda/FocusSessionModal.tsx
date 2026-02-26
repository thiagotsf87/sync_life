'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FocusSession, FocusSessionFormData } from '@/hooks/use-focus-sessions'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

const QUICK_DURATIONS = [25, 45, 60, 90]

const inputCls = cn(
  'w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)]',
  'text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none',
  'focus:border-[#06b6d4] transition-colors',
)

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">{label}</label>
      {children}
    </div>
  )
}

interface FocusSessionModalProps {
  open: boolean
  mode: 'create' | 'edit'
  session?: FocusSession | null
  goals?: { id: string; name: string; icon: string }[]
  events?: { id: string; title: string; date: string }[]
  onClose: () => void
  onSave: (data: FocusSessionFormData) => Promise<void>
}

interface FormState {
  duration_minutes: number
  customDuration: string
  date: string
  start_time: string
  goal_id: string
  event_id: string
  notes: string
}

export function FocusSessionModal({
  open,
  mode,
  session,
  goals = [],
  events = [],
  onClose,
  onSave,
}: FocusSessionModalProps) {
  const [form, setForm] = useState<FormState>({
    duration_minutes: 25,
    customDuration: '',
    date: todayStr(),
    start_time: '',
    goal_id: '',
    event_id: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && session) {
      const isQuick = QUICK_DURATIONS.includes(session.duration_minutes)
      setForm({
        duration_minutes: isQuick ? session.duration_minutes : 0,
        customDuration: isQuick ? '' : String(session.duration_minutes),
        date: session.date,
        start_time: session.start_time ?? '',
        goal_id: session.goal_id ?? '',
        event_id: session.event_id ?? '',
        notes: session.notes ?? '',
      })
    } else {
      setForm({
        duration_minutes: 25,
        customDuration: '',
        date: todayStr(),
        start_time: '',
        goal_id: '',
        event_id: '',
        notes: '',
      })
    }
  }, [open, mode, session])

  if (!open) return null

  function getEffectiveDuration(): number {
    if (form.duration_minutes === 0 && form.customDuration) {
      return parseInt(form.customDuration, 10) || 0
    }
    return form.duration_minutes
  }

  async function handleSave() {
    const duration = getEffectiveDuration()
    if (!duration || duration <= 0) return
    setSaving(true)
    try {
      await onSave({
        duration_minutes: duration,
        date: form.date,
        start_time: form.start_time || undefined,
        goal_id: form.goal_id || undefined,
        event_id: form.event_id || undefined,
        notes: form.notes.trim() || undefined,
      })
      onClose()
    } catch {
      // handled by parent
    } finally {
      setSaving(false)
    }
  }

  const effectiveDuration = getEffectiveDuration()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-[480px] flex flex-col bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center bg-[rgba(6,182,212,0.12)]">
              <span className="text-sm">🎯</span>
            </div>
            <h2 className="font-[Syne] font-extrabold text-[16px] text-[var(--sl-t1)]">
              {mode === 'create' ? 'Nova Sessão de Foco' : 'Editar Sessão'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-5">

          {/* Duração */}
          <Field label="Duração">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap">
                {QUICK_DURATIONS.map(min => (
                  <button
                    key={min}
                    onClick={() => { set('duration_minutes', min); set('customDuration', '') }}
                    className={cn(
                      'px-4 py-2.5 rounded-[10px] border text-[13px] font-bold transition-all',
                      form.duration_minutes === min && form.customDuration === ''
                        ? 'border-[#06b6d4] bg-[rgba(6,182,212,0.1)] text-[#06b6d4]'
                        : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]',
                    )}
                  >
                    <span className="font-[DM_Mono]">{min}</span>
                    <span className="text-[10px] ml-1 opacity-70">min</span>
                  </button>
                ))}
                <button
                  onClick={() => { set('duration_minutes', 0); set('customDuration', '') }}
                  className={cn(
                    'px-4 py-2.5 rounded-[10px] border text-[13px] font-bold transition-all',
                    form.duration_minutes === 0 && form.customDuration !== ''
                      ? 'border-[#06b6d4] bg-[rgba(6,182,212,0.1)] text-[#06b6d4]'
                      : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]',
                  )}
                >
                  Outro
                </button>
              </div>
              {form.duration_minutes === 0 && (
                <input
                  type="number"
                  min={1}
                  value={form.customDuration}
                  onChange={e => set('customDuration', e.target.value)}
                  placeholder="Minutos (ex: 120)"
                  className={cn(inputCls, 'font-[DM_Mono]')}
                  autoFocus
                />
              )}
            </div>
            {effectiveDuration > 0 && (
              <p className="text-[11px] text-[#06b6d4] mt-1">
                {effectiveDuration >= 60
                  ? `${Math.floor(effectiveDuration / 60)}h${effectiveDuration % 60 ? ` ${effectiveDuration % 60}min` : ''}`
                  : `${effectiveDuration} minutos`}
              </p>
            )}
          </Field>

          {/* Data + Hora */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data">
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className={cn(inputCls, 'font-[DM_Mono]')}
              />
            </Field>
            <Field label="Hora início (opcional)">
              <input
                type="time"
                value={form.start_time}
                onChange={e => set('start_time', e.target.value)}
                className={cn(inputCls, 'font-[DM_Mono]')}
              />
            </Field>
          </div>

          {/* Meta vinculada */}
          {goals.length > 0 && (
            <Field label="Meta vinculada (opcional)">
              <select
                value={form.goal_id}
                onChange={e => set('goal_id', e.target.value)}
                className={cn(inputCls, 'cursor-pointer')}
              >
                <option value="">Nenhuma</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Evento vinculado */}
          {events.length > 0 && (
            <Field label="Evento vinculado (opcional)">
              <select
                value={form.event_id}
                onChange={e => set('event_id', e.target.value)}
                className={cn(inputCls, 'cursor-pointer')}
              >
                <option value="">Nenhum</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
                ))}
              </select>
            </Field>
          )}

          {/* Notas */}
          <Field label="Notas (opcional)">
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="O que foi trabalhado nesta sessão?"
              rows={3}
              className={cn(inputCls, 'resize-none')}
            />
          </Field>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || effectiveDuration <= 0}
            className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: '#10b981' }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {mode === 'create' ? 'Registrar sessão' : 'Salvar'}
          </button>
        </div>

      </div>
    </div>
  )
}
