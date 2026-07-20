'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, ChevronRight, ChevronLeft, Target, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TextField } from '@/components/ui/text-field'
import { fmtBRL } from '@/lib/format/currency'
import type { GoalFormData, Goal } from '@/hooks/use-metas'
import { calcProgress, calcProjectedDate } from '@/hooks/use-metas'

// ── Currency mask ─────────────────────────────────────────────────────────
function maskCurrency(raw: string): string {
  const cleaned = raw.replace(/[^\d,]/g, '')
  const commaIdx = cleaned.indexOf(',')
  let intStr: string
  let decStr: string | undefined
  if (commaIdx >= 0) {
    intStr = cleaned.slice(0, commaIdx)
    decStr = cleaned.slice(commaIdx + 1).replace(/,/g, '').slice(0, 2)
  } else {
    intStr = cleaned
  }
  intStr = intStr.replace(/^0+(\d)/, '$1')
  if (!intStr && decStr === undefined) return ''
  if (!intStr) intStr = '0'
  const intFormatted = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decStr !== undefined ? `${intFormatted},${decStr}` : intFormatted
}

function parseCurrency(masked: string): number {
  return parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ── Constants ──────────────────────────────────────────────────────────────
const GOAL_ICONS = ['🎯', '✈️', '🛡️', '🏠', '🚗', '📚', '💻', '💍', '🏋️', '🌎', '🎓', '💼', '📈', '🎵', '🛒', '🌟']

const GOAL_CATEGORIES = [
  { value: 'viagem',    label: 'Viagem',     icon: '✈️' },
  { value: 'reserva',   label: 'Reserva',    icon: '🛡️' },
  { value: 'moradia',   label: 'Moradia',    icon: '🏠' },
  { value: 'veiculo',   label: 'Veículo',    icon: '🚗' },
  { value: 'educacao',  label: 'Educação',   icon: '📚' },
  { value: 'saude',     label: 'Saúde',      icon: '🏥' },
  { value: 'tecnologia',label: 'Tecnologia', icon: '💻' },
  { value: 'casamento', label: 'Casamento',  icon: '💍' },
  { value: 'fitness',   label: 'Fitness',    icon: '🏋️' },
  { value: 'outros',    label: 'Outros',     icon: '🎯' },
]

const STEP_LABELS = ['Identidade', 'Alvo', 'Estratégia', 'Revisão']

// Cor do módulo Futuro (identificação)
const MOD_FUTURO = '#8B7BD4'

// ── Step indicator ─────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all',
            i < current
              ? 'w-6 h-1.5 bg-[var(--sl-em)]'
              : i === current
              ? 'w-8 h-1.5 bg-[var(--sl-em)]'
              : 'w-4 h-1.5 bg-[var(--sl-s3)]',
          )}
        />
      ))}
    </div>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────
interface MetaModalProps {
  open: boolean
  mode: 'create' | 'edit'
  goal?: Goal
  onClose: () => void
  onSave: (data: GoalFormData) => Promise<void>
}

interface FormState {
  name: string
  description: string
  icon: string
  category: string
  targetAmountStr: string
  currentAmountStr: string
  monthlyStr: string
  targetDate: string
  startDate: string
  notes: string
}

export function MetaModal({ open, mode, goal, onClose, onSave }: MetaModalProps) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    icon: '🎯',
    category: 'outros',
    targetAmountStr: '',
    currentAmountStr: '',
    monthlyStr: '',
    targetDate: '',
    startDate: todayStr(),
    notes: '',
  })

  function set(key: keyof FormState, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  // Reset / populate form
  useEffect(() => {
    if (!open) return
    setStep(0)
    setErrors({})
    if (mode === 'edit' && goal) {
      setForm({
        name: goal.name,
        description: goal.description ?? '',
        icon: goal.icon,
        category: goal.category,
        targetAmountStr: goal.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        currentAmountStr: goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        monthlyStr: goal.monthly_contribution.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        targetDate: goal.target_date ?? '',
        startDate: goal.start_date,
        notes: goal.notes ?? '',
      })
    } else {
      setForm({
        name: '',
        description: '',
        icon: '🎯',
        category: 'outros',
        targetAmountStr: '',
        currentAmountStr: '',
        monthlyStr: '',
        targetDate: '',
        startDate: todayStr(),
        notes: '',
      })
    }
  }, [open, mode, goal])

  if (!open) return null

  // ── Validation per step ─────────────────────────────────────────────────
  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {}
    if (s === 0) {
      if (!form.name.trim()) errs.name = 'Nome obrigatório'
    }
    if (s === 1) {
      const target = parseCurrency(form.targetAmountStr)
      if (!form.targetAmountStr || target <= 0) errs.targetAmount = 'Valor inválido'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (!validateStep(step)) return
    setStep(s => Math.min(s + 1, 3))
  }

  function handleBack() {
    setErrors({})
    setStep(s => Math.max(s - 1, 0))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        icon: form.icon,
        category: form.category,
        goal_type: 'monetary',
        target_amount: parseCurrency(form.targetAmountStr),
        current_amount: parseCurrency(form.currentAmountStr) || undefined,
        monthly_contribution: parseCurrency(form.monthlyStr) || 0,
        target_date: form.targetDate || undefined,
        start_date: form.startDate || todayStr(),
        notes: form.notes.trim() || undefined,
      })
      onClose()
    } catch {
      // handled by parent
    } finally {
      setSaving(false)
    }
  }

  // ── Projected summary (step 3) ──────────────────────────────────────────
  const targetAmt = parseCurrency(form.targetAmountStr)
  const currentAmt = parseCurrency(form.currentAmountStr) || 0
  const monthlyAmt = parseCurrency(form.monthlyStr) || 0
  const pct = calcProgress(currentAmt, targetAmt)
  const projDate = calcProjectedDate(currentAmt, targetAmt, monthlyAmt)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-[560px] max-h-[90vh] flex flex-col bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)] shrink-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Target size={16} style={{ color: MOD_FUTURO }} />
              <h2 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]">
                {mode === 'create' ? 'Nova meta' : 'Editar meta'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <StepIndicator current={step} total={4} />
              <span className="text-[11px] text-[var(--sl-t3)]">
                Passo {step + 1}/4 · {STEP_LABELS[step]}
              </span>
            </div>
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
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* ── Step 0: Identidade ──────────────────────────────── */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <TextField
                label="Nome da meta"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ex: Viagem para Europa, reserva de emergência..."
                error={errors.name}
              />

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                  Descrição (opcional)
                </span>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Conte mais sobre esta meta..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[14px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-em)] transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                  Ícone
                </span>
                <div className="grid grid-cols-8 gap-1.5">
                  {GOAL_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => set('icon', icon)}
                      className={cn(
                        'h-9 rounded-[8px] text-[20px] flex items-center justify-center border transition-all hover:-translate-y-px',
                        form.icon === icon
                          ? 'border-[var(--sl-em)] bg-[var(--sl-em-soft)]'
                          : 'border-[var(--sl-border)] bg-[var(--sl-s2)] hover:border-[var(--sl-border-h)]',
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                  Categoria
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {GOAL_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => set('category', cat.value)}
                      className={cn(
                        'py-2.5 px-1 rounded-[10px] border text-center transition-all hover:-translate-y-px',
                        form.category === cat.value
                          ? 'border-[var(--sl-em)] bg-[var(--sl-em-soft)]'
                          : 'border-[var(--sl-border)] bg-[var(--sl-s2)] hover:border-[var(--sl-border-h)]',
                      )}
                    >
                      <span className="text-[18px] block mb-0.5">{cat.icon}</span>
                      <span className={cn(
                        'text-[10px] leading-tight block truncate',
                        form.category === cat.value ? 'text-[var(--sl-em)] font-semibold' : 'text-[var(--sl-t3)]',
                      )}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Alvo ────────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                  Valor da meta
                </span>
                <div className={cn(
                  'flex items-center gap-2 px-3.5 py-3 rounded-[10px] bg-[var(--sl-s2)] border transition-colors',
                  errors.targetAmount ? 'border-[var(--sl-danger)]' : 'border-[var(--sl-border)] focus-within:border-[var(--sl-border-em)]',
                )}>
                  <span className="sl-num text-[14px] text-[var(--sl-t3)] shrink-0">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.targetAmountStr}
                    onChange={e => set('targetAmountStr', maskCurrency(e.target.value))}
                    placeholder="0,00"
                    className="flex-1 bg-transparent outline-none sl-num-strong text-[20px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
                  />
                </div>
                {errors.targetAmount && (
                  <span className="text-[11px] text-[var(--sl-danger)]">{errors.targetAmount}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                  Já possuo (opcional)
                </span>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] focus-within:border-[var(--sl-border-em)] transition-colors">
                  <span className="sl-num text-[14px] text-[var(--sl-t3)] shrink-0">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.currentAmountStr}
                    onChange={e => set('currentAmountStr', maskCurrency(e.target.value))}
                    placeholder="0,00"
                    className="flex-1 bg-transparent outline-none sl-num text-[16px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                    Data início
                  </span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => set('startDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[14px] text-[var(--sl-t1)] outline-none focus:border-[var(--sl-border-em)] transition-colors font-[IBM_Plex_Mono]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                    Prazo (opcional)
                  </span>
                  <input
                    type="date"
                    value={form.targetDate}
                    onChange={e => set('targetDate', e.target.value)}
                    min={form.startDate}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[14px] text-[var(--sl-t1)] outline-none focus:border-[var(--sl-border-em)] transition-colors font-[IBM_Plex_Mono]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Estratégia ──────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                  Aporte mensal planejado
                </span>
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] focus-within:border-[var(--sl-border-em)] transition-colors">
                  <span className="sl-num text-[14px] text-[var(--sl-t3)] shrink-0">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.monthlyStr}
                    onChange={e => set('monthlyStr', maskCurrency(e.target.value))}
                    placeholder="0,00"
                    className="flex-1 bg-transparent outline-none sl-num-strong text-[20px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
                  />
                </div>
                <p className="text-[11px] text-[var(--sl-t3)]">Quanto pretende guardar por mês para esta meta?</p>
              </div>

              {/* Preview de projeção */}
              {targetAmt > 0 && monthlyAmt > 0 && (
                <div className="p-4 rounded-[14px] bg-[var(--sl-s2)] border border-[var(--sl-border)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-3">
                    Prévia da projeção
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-[var(--sl-t3)]">Progresso atual</p>
                      <p className="sl-num-strong text-[16px] text-[var(--sl-em)]">{pct}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--sl-t3)]">Conclusão estimada</p>
                      <p className="sl-num text-[14px] text-[var(--sl-t1)]">
                        {projDate
                          ? projDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                          : 'Sem previsão'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                  Observações (opcional)
                </span>
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Estratégia, motivação, detalhes..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[14px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-em)] transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Revisão ─────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 rounded-[14px] bg-[var(--sl-s2)]">
                <span className="text-4xl">{form.icon}</span>
                <div>
                  <p className="font-[Syne] font-extrabold text-[17px] text-[var(--sl-t1)]">{form.name}</p>
                  {form.description && <p className="text-[12px] text-[var(--sl-t3)] mt-0.5">{form.description}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <ReviewRow label="Categoria" value={GOAL_CATEGORIES.find(c => c.value === form.category)?.label ?? form.category} />
                <ReviewRow label="Meta" value={targetAmt > 0 ? fmtBRL(targetAmt) : 'Sem valor'} mono />
                <ReviewRow label="Já possuo" value={currentAmt > 0 ? fmtBRL(currentAmt) : 'R$ 0,00'} mono />
                <ReviewRow label="Aporte mensal" value={monthlyAmt > 0 ? fmtBRL(monthlyAmt) : 'Sem aporte'} mono />
                <ReviewRow label="Início" value={form.startDate || todayStr()} mono />
                <ReviewRow label="Prazo" value={form.targetDate || 'Sem prazo definido'} mono />
                {projDate && <ReviewRow label="Conclusão estimada" value={projDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} mono />}
              </div>

              {form.notes && (
                <div className="p-3 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1">Observações</p>
                  <p className="text-[13px] text-[var(--sl-t2)]">{form.notes}</p>
                </div>
              )}

              <div className="p-3.5 rounded-[12px] bg-[var(--sl-em-soft)] border border-[var(--sl-border-em)] flex items-start gap-2">
                <Lightbulb size={14} className="text-[var(--sl-em)] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[var(--sl-t2)]">
                  Após criar, você receberá 4 marcos automáticos (25%, 50%, 75%, 100%) e poderá registrar aportes a qualquer momento.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--sl-border)] shrink-0">
          <button
            onClick={step === 0 ? onClose : handleBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            {step > 0 && <ChevronLeft size={14} />}
            {step === 0 ? 'Cancelar' : 'Anterior'}
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-[10px] text-[13px] font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--sl-em)' }}
            >
              Próximo
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--sl-em)' }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {mode === 'create' ? 'Criar meta' : 'Salvar alterações'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-[var(--sl-s2)] rounded-[10px] p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-0.5">{label}</p>
      <p className={cn('text-[13px] text-[var(--sl-t1)]', mono && 'sl-num')}>{value}</p>
    </div>
  )
}
