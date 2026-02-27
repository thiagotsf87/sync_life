'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type AgendaEvent,
  type AgendaEventFormData,
  type EventType,
  type EventPriority,
  EVENT_TYPES,
} from '@/hooks/use-agenda'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function generateId(): string {
  return Math.random().toString(36).slice(2)
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const PRIORITIES: { value: EventPriority; label: string; color: string }[] = [
  { value: 'baixa',   label: 'Baixa',   color: '#6e90b8' },
  { value: 'normal',  label: 'Normal',  color: '#06b6d4' },
  { value: 'alta',    label: 'Alta',    color: '#f59e0b' },
  { value: 'urgente', label: 'Urgente', color: '#f43f5e' },
]

const REMINDERS = [
  { value: '5m',  label: '5 min' },
  { value: '15m', label: '15 min' },
  { value: '30m', label: '30 min' },
  { value: '1h',  label: '1 hora' },
  { value: '1d',  label: '1 dia' },
]

const RECURRENCES = [
  { value: 'none',    label: 'Nunca' },
  { value: 'daily',   label: 'Diária' },
  { value: 'weekly',  label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
]

// ─── COMPONENTES INTERNOS ─────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">{label}</label>
      {children}
    </div>
  )
}

const inputCls = cn(
  'w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)]',
  'text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none',
  'focus:border-[#06b6d4] transition-colors',
)

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface EventModalProps {
  open: boolean
  mode: 'create' | 'edit'
  event?: AgendaEvent | null
  defaultDate?: string     // YYYY-MM-DD
  defaultTime?: string     // HH:MM
  goals?: { id: string; name: string; icon: string }[]
  onClose: () => void
  onSave: (data: AgendaEventFormData) => Promise<void>
}

interface FormState {
  title: string
  description: string
  type: EventType
  date: string
  all_day: boolean
  start_time: string
  end_time: string
  priority: EventPriority
  reminder: string
  recurrence: string
  goal_id: string
  location: string
  checklist: { id: string; text: string; done: boolean }[]
}

const defaultForm = (defaultDate?: string, defaultTime?: string): FormState => ({
  title: '',
  description: '',
  type: 'pessoal',
  date: defaultDate ?? todayStr(),
  all_day: !defaultTime,
  start_time: defaultTime ?? '',
  end_time: '',
  priority: 'normal',
  reminder: '',
  recurrence: 'none',
  goal_id: '',
  location: '',
  checklist: [],
})

// ─── MODAL ────────────────────────────────────────────────────────────────────

export function EventModal({
  open,
  mode,
  event,
  defaultDate,
  defaultTime,
  goals = [],
  onClose,
  onSave,
}: EventModalProps) {
  const [form, setForm] = useState<FormState>(defaultForm(defaultDate, defaultTime))
  const [saving, setSaving] = useState(false)
  const [checklistInput, setChecklistInput] = useState('')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && event) {
      setForm({
        title: event.title,
        description: event.description ?? '',
        type: event.type,
        date: event.date,
        all_day: event.all_day,
        start_time: event.start_time ?? '',
        end_time: event.end_time ?? '',
        priority: event.priority,
        reminder: event.reminder ?? '',
        recurrence: event.recurrence ?? 'none',
        goal_id: event.goal_id ?? '',
        location: event.location ?? '',
        checklist: event.checklist ?? [],
      })
    } else {
      setForm(defaultForm(defaultDate, defaultTime))
    }
  }, [open, mode, event, defaultDate, defaultTime])

  if (!open) return null

  function addChecklistItem() {
    const text = checklistInput.trim()
    if (!text) return
    set('checklist', [...form.checklist, { id: generateId(), text, done: false }])
    setChecklistInput('')
  }

  function removeChecklistItem(id: string) {
    set('checklist', form.checklist.filter(i => i.id !== id))
  }

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        date: form.date,
        all_day: form.all_day,
        start_time: form.all_day ? undefined : (form.start_time || undefined),
        end_time: form.all_day ? undefined : (form.end_time || undefined),
        priority: form.priority,
        reminder: form.reminder || undefined,
        recurrence: form.recurrence || 'none',
        goal_id: form.goal_id || undefined,
        location: form.location.trim() || undefined,
        checklist: form.checklist,
      })
      onClose()
    } catch {
      // handled by parent
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-[560px] max-h-[90vh] flex flex-col bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center bg-[rgba(6,182,212,0.12)]">
              <span className="text-sm">📅</span>
            </div>
            <h2 className="font-[Syne] font-extrabold text-[16px] text-[var(--sl-t1)]">
              {mode === 'create' ? 'Novo Evento' : 'Editar Evento'}
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
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

          {/* Tipo */}
          <Field label="Tipo">
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(EVENT_TYPES) as [EventType, typeof EVENT_TYPES[EventType]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => set('type', key)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-[10px] border text-[12px] font-semibold transition-all',
                    form.type === key
                      ? 'text-[var(--sl-t1)]'
                      : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]',
                  )}
                  style={form.type === key ? {
                    borderColor: cfg.color,
                    background: `${cfg.color}15`,
                    color: cfg.color,
                  } : {}}
                >
                  <span>{cfg.icon}</span>
                  {cfg.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Título */}
          <Field label="Título *">
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Ex: Reunião de projeto, Academia..."
              className={inputCls}
              autoFocus
            />
          </Field>

          {/* Descrição */}
          <Field label="Descrição (opcional)">
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Detalhes do evento..."
              rows={2}
              className={cn(inputCls, 'resize-none')}
            />
          </Field>

          {/* Dia inteiro + data */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dia inteiro">
              <button
                onClick={() => set('all_day', !form.all_day)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] border text-[13px] font-semibold transition-all',
                  form.all_day
                    ? 'border-[#06b6d4] bg-[rgba(6,182,212,0.08)] text-[#06b6d4]'
                    : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]',
                )}
              >
                <span className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                  form.all_day ? 'border-[#06b6d4] bg-[#06b6d4]' : 'border-[var(--sl-t3)]',
                )}>
                  {form.all_day && <span className="text-white text-[9px] font-bold">✓</span>}
                </span>
                Dia inteiro
              </button>
            </Field>
            <Field label="Data">
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className={cn(inputCls, 'font-[DM_Mono]')}
              />
            </Field>
          </div>

          {/* Horas (somente se não all_day) */}
          {!form.all_day && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Hora início">
                <input
                  type="time"
                  value={form.start_time}
                  onChange={e => set('start_time', e.target.value)}
                  className={cn(inputCls, 'font-[DM_Mono]')}
                />
              </Field>
              <Field label="Hora fim">
                <input
                  type="time"
                  value={form.end_time}
                  onChange={e => set('end_time', e.target.value)}
                  className={cn(inputCls, 'font-[DM_Mono]')}
                />
              </Field>
            </div>
          )}

          {/* Prioridade */}
          <Field label="Prioridade">
            <div className="flex gap-2 flex-wrap">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  onClick={() => set('priority', p.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-[8px] border text-[12px] font-semibold transition-all',
                    form.priority === p.value
                      ? 'text-white'
                      : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]',
                  )}
                  style={form.priority === p.value ? { background: p.color, borderColor: p.color } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Lembrete */}
          <Field label="Lembrete (opcional)">
            <div className="flex gap-2 flex-wrap">
              {REMINDERS.map(r => (
                <button
                  key={r.value}
                  onClick={() => set('reminder', form.reminder === r.value ? '' : r.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-[8px] border text-[12px] font-semibold transition-all',
                    form.reminder === r.value
                      ? 'border-[#06b6d4] bg-[rgba(6,182,212,0.1)] text-[#06b6d4]'
                      : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Recorrência */}
          <Field label="Recorrência">
            <div className="flex gap-2 flex-wrap">
              {RECURRENCES.map(r => (
                <button
                  key={r.value}
                  onClick={() => set('recurrence', r.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-[8px] border text-[12px] font-semibold transition-all',
                    form.recurrence === r.value
                      ? 'border-[#06b6d4] bg-[rgba(6,182,212,0.1)] text-[#06b6d4]'
                      : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Local */}
          <Field label="Local (opcional)">
            <input
              type="text"
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="Ex: Sala de reunião, Academia, Online..."
              className={inputCls}
            />
          </Field>

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

          {/* Checklist */}
          <Field label="Checklist (opcional)">
            <div className="flex flex-col gap-2">
              {form.checklist.map(item => (
                <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[var(--sl-s2)] border border-[var(--sl-border)]">
                  <button
                    onClick={() => set('checklist', form.checklist.map(i => i.id === item.id ? { ...i, done: !i.done } : i))}
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                      item.done ? 'border-[#10b981] bg-[#10b981]' : 'border-[var(--sl-t3)]',
                    )}
                  >
                    {item.done && <span className="text-white text-[9px] font-bold">✓</span>}
                  </button>
                  <span className={cn('flex-1 text-[13px]', item.done ? 'line-through text-[var(--sl-t3)]' : 'text-[var(--sl-t1)]')}>
                    {item.text}
                  </span>
                  <button onClick={() => removeChecklistItem(item.id)} className="text-[var(--sl-t3)] hover:text-[#f43f5e] transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={checklistInput}
                  onChange={e => setChecklistInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem() } }}
                  placeholder="Adicionar item..."
                  className={cn(inputCls, 'flex-1')}
                />
                <button
                  onClick={addChecklistItem}
                  className="px-3 py-2.5 rounded-[10px] border border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[#06b6d4] hover:text-[#06b6d4] transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </Field>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--sl-border)] shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: '#10b981' }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {mode === 'create' ? 'Criar evento' : 'Salvar'}
          </button>
        </div>

      </div>
    </div>
  )
}
