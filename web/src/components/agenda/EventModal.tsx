'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Plus, Trash2, Check, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TextField } from '@/components/ui/text-field'
import { SelectField } from '@/components/ui/select-field'
import { ToggleRow } from '@/components/ui/toggle-row'
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
  // hydration-safe: only called in handlers
  return Math.random().toString(36).slice(2)
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const PRIORITIES: { value: EventPriority; label: string; color: string }[] = [
  { value: 'baixa',   label: 'Baixa',   color: '#6e90b8' },
  { value: 'normal',  label: 'Normal',  color: '#3CA0B5' },
  { value: 'alta',    label: 'Alta',    color: '#D9962E' },
  { value: 'urgente', label: 'Urgente', color: '#DB6478' },
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

// ─── HELPERS DE LABEL ─────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
      {children}
    </span>
  )
}

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

  // goal options for SelectField
  const goalSelectOptions = [
    { value: '', label: 'Nenhuma' },
    ...goals.map(g => ({ value: g.id, label: `${g.icon} ${g.name}` })),
  ]

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
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center bg-[rgba(60,160,181,0.12)]">
              <CalendarIcon size={15} className="text-[#3CA0B5]" />
            </div>
            <h2 className="font-[Syne] font-extrabold text-[16px] text-[var(--sl-t1)]">
              {mode === 'create' ? 'Novo evento' : 'Editar evento'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Tipo</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(EVENT_TYPES) as [EventType, typeof EVENT_TYPES[EventType]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
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
                  <span aria-hidden="true">{cfg.icon}</span>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <TextField
            label="Título *"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Ex: Reunião de projeto, Academia..."
            autoFocus
          />

          {/* Descrição */}
          <label className="flex flex-col gap-1.5">
            <FieldLabel>Descrição (opcional)</FieldLabel>
            <div className="flex items-start gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3.5 py-2.5 focus-within:border-[var(--sl-border-em)] transition-colors">
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Detalhes do evento..."
                rows={2}
                className="flex-1 bg-transparent outline-none text-[14px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] resize-none"
              />
            </div>
          </label>

          {/* Dia inteiro + data */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Dia inteiro</FieldLabel>
              <button
                type="button"
                onClick={() => set('all_day', !form.all_day)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] border text-[13px] font-semibold transition-all',
                  form.all_day
                    ? 'border-[#3CA0B5] bg-[rgba(60,160,181,0.08)] text-[#3CA0B5]'
                    : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]',
                )}
              >
                <span className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                  form.all_day ? 'border-[#3CA0B5] bg-[#3CA0B5]' : 'border-[var(--sl-t3)]',
                )}>
                  {form.all_day && <Check size={11} className="text-white" />}
                </span>
                Dia inteiro
              </button>
            </div>
            <TextField
              label="Data"
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className="sl-num"
            />
          </div>

          {/* Horas (somente se não all_day) */}
          {!form.all_day && (
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Hora início"
                type="time"
                value={form.start_time}
                onChange={e => set('start_time', e.target.value)}
                className="sl-num"
              />
              <TextField
                label="Hora fim"
                type="time"
                value={form.end_time}
                onChange={e => set('end_time', e.target.value)}
                className="sl-num"
              />
            </div>
          )}

          {/* Prioridade */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Prioridade</FieldLabel>
            <div className="flex gap-2 flex-wrap">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
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
          </div>

          {/* Lembrete */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Lembrete (opcional)</FieldLabel>
            <div className="flex gap-2 flex-wrap">
              {REMINDERS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => set('reminder', form.reminder === r.value ? '' : r.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-[8px] border text-[12px] font-semibold transition-all',
                    form.reminder === r.value
                      ? 'border-[#3CA0B5] bg-[rgba(60,160,181,0.1)] text-[#3CA0B5]'
                      : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recorrência */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Recorrência</FieldLabel>
            <div className="flex gap-2 flex-wrap">
              {RECURRENCES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => set('recurrence', r.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-[8px] border text-[12px] font-semibold transition-all',
                    form.recurrence === r.value
                      ? 'border-[#3CA0B5] bg-[rgba(60,160,181,0.1)] text-[#3CA0B5]'
                      : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Local */}
          <TextField
            label="Local (opcional)"
            value={form.location}
            onChange={e => set('location', e.target.value)}
            placeholder="Ex: Sala de reunião, Academia, Online..."
          />

          {/* Meta vinculada */}
          {goals.length > 0 && (
            <SelectField
              label="Meta vinculada (opcional)"
              value={form.goal_id}
              onChange={e => set('goal_id', e.target.value)}
              options={goalSelectOptions}
            />
          )}

          {/* Checklist */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Checklist (opcional)</FieldLabel>
            <div className="flex flex-col gap-2">
              {form.checklist.map(item => (
                <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[var(--sl-s2)] border border-[var(--sl-border)]">
                  <button
                    type="button"
                    onClick={() => set('checklist', form.checklist.map(i => i.id === item.id ? { ...i, done: !i.done } : i))}
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                      item.done ? 'border-[var(--sl-em)] bg-[var(--sl-em)]' : 'border-[var(--sl-t3)]',
                    )}
                    aria-label={item.done ? 'Desmarcar' : 'Marcar'}
                  >
                    {item.done && <Check size={11} className="text-white" />}
                  </button>
                  <span className={cn('flex-1 text-[13px]', item.done ? 'line-through text-[var(--sl-t3)]' : 'text-[var(--sl-t1)]')}>
                    {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(item.id)}
                    className="text-[var(--sl-t3)] hover:text-[var(--sl-danger)] transition-colors"
                    aria-label="Remover item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <div className="flex-1">
                  <TextField
                    value={checklistInput}
                    onChange={e => setChecklistInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem() } }}
                    placeholder="Adicionar item..."
                  />
                </div>
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="px-3 py-2.5 rounded-[10px] border border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[#3CA0B5] hover:text-[#3CA0B5] transition-colors"
                  aria-label="Adicionar item ao checklist"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--sl-border)] shrink-0">
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
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: 'var(--sl-em)' }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {mode === 'create' ? 'Criar evento' : 'Salvar'}
          </button>
        </div>

      </div>
    </div>
  )
}
