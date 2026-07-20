'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TextField } from '@/components/ui/text-field'
import { SelectField } from '@/components/ui/select-field'
import type { FocusSession, FocusSessionFormData } from '@/hooks/use-focus-sessions'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

const QUICK_DURATIONS = [25, 45, 60, 90]

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
      {children}
    </span>
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

  const goalSelectOptions = [
    { value: '', label: 'Nenhuma' },
    ...goals.map(g => ({ value: g.id, label: `${g.icon} ${g.name}` })),
  ]

  const eventSelectOptions = [
    { value: '', label: 'Nenhum' },
    ...events.map(ev => ({ value: ev.id, label: `${ev.title} (${ev.date})` })),
  ]

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-[480px] flex flex-col bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center bg-[rgba(60,160,181,0.12)]">
              <Target size={15} className="text-[#3CA0B5]" />
            </div>
            <h2 className="font-[Syne] font-extrabold text-[16px] text-[var(--sl-t1)]">
              {mode === 'create' ? 'Nova sessão de foco' : 'Editar sessão'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-5">

          {/* Duração */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Duração</FieldLabel>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap">
                {QUICK_DURATIONS.map(min => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => { set('duration_minutes', min); set('customDuration', '') }}
                    className={cn(
                      'px-4 py-2.5 rounded-[10px] border text-[13px] font-bold transition-all',
                      form.duration_minutes === min && form.customDuration === ''
                        ? 'border-[#3CA0B5] bg-[rgba(60,160,181,0.1)] text-[#3CA0B5]'
                        : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]',
                    )}
                  >
                    <span className="sl-num-strong">{min}</span>
                    <span className="text-[10px] ml-1 opacity-70">min</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { set('duration_minutes', 0); set('customDuration', '') }}
                  className={cn(
                    'px-4 py-2.5 rounded-[10px] border text-[13px] font-bold transition-all',
                    form.duration_minutes === 0 && form.customDuration !== ''
                      ? 'border-[#3CA0B5] bg-[rgba(60,160,181,0.1)] text-[#3CA0B5]'
                      : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]',
                  )}
                >
                  Outro
                </button>
              </div>
              {form.duration_minutes === 0 && (
                <TextField
                  type="number"
                  min={1}
                  value={form.customDuration}
                  onChange={e => set('customDuration', e.target.value)}
                  placeholder="Minutos (ex: 120)"
                  className="sl-num"
                  autoFocus
                />
              )}
            </div>
            {effectiveDuration > 0 && (
              <p className="text-[11px] text-[#3CA0B5] mt-1">
                {effectiveDuration >= 60
                  ? `${Math.floor(effectiveDuration / 60)}h${effectiveDuration % 60 ? ` ${effectiveDuration % 60}min` : ''}`
                  : `${effectiveDuration} minutos`}
              </p>
            )}
          </div>

          {/* Data + Hora */}
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Data"
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className="sl-num"
            />
            <TextField
              label="Hora início (opcional)"
              type="time"
              value={form.start_time}
              onChange={e => set('start_time', e.target.value)}
              className="sl-num"
            />
          </div>

          {/* Meta vinculada */}
          {goals.length > 0 && (
            <SelectField
              label="Meta vinculada (opcional)"
              value={form.goal_id}
              onChange={e => set('goal_id', e.target.value)}
              options={goalSelectOptions}
            />
          )}

          {/* Evento vinculado */}
          {events.length > 0 && (
            <SelectField
              label="Evento vinculado (opcional)"
              value={form.event_id}
              onChange={e => set('event_id', e.target.value)}
              options={eventSelectOptions}
            />
          )}

          {/* Notas */}
          <label className="flex flex-col gap-1.5">
            <FieldLabel>Notas (opcional)</FieldLabel>
            <div className="flex items-start gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3.5 py-2.5 focus-within:border-[var(--sl-border-em)] transition-colors">
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="O que foi trabalhado nesta sessão?"
                rows={3}
                className="flex-1 bg-transparent outline-none text-[14px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] resize-none"
              />
            </div>
          </label>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || effectiveDuration <= 0}
            className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: 'var(--sl-em)' }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {mode === 'create' ? 'Registrar sessão' : 'Salvar'}
          </button>
        </div>

      </div>
    </div>
  )
}
