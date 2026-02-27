'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/hooks/use-categories'
import type { Budget, EnvelopeFormData } from '@/hooks/use-budgets'

interface EnvelopeModalProps {
  open: boolean
  mode: 'create' | 'edit'
  envelope?: Budget
  categories: Category[]
  monthlyIncome: number
  month: number
  year: number
  onClose: () => void
  onSave: (data: EnvelopeFormData) => Promise<void>
}

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function fmtR$(n: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export function EnvelopeModal({
  open, mode, envelope, categories, monthlyIncome, month, year, onClose, onSave,
}: EnvelopeModalProps) {
  const [categoryId, setCategoryId] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [alertThreshold, setAlertThreshold] = useState(80)
  const [rollover, setRollover] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (mode === 'edit' && envelope) {
      setCategoryId(envelope.category_id)
      setAmountStr(String(envelope.amount))
      setAlertThreshold(envelope.alert_threshold)
      setRollover(envelope.rollover)
      setNotes(envelope.notes ?? '')
    } else {
      setCategoryId('')
      setAmountStr('')
      setAlertThreshold(80)
      setRollover(false)
      setNotes('')
    }
    setErrors({})
  }, [open, mode, envelope])

  if (!open) return null

  // Only expense categories for budgets
  const expenseCategories = categories.filter(c => c.type === 'expense')
  const selectedCategory = expenseCategories.find(c => c.id === categoryId)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!categoryId) errs.category = 'Selecione uma categoria'
    const amt = parseFloat(amountStr.replace(',', '.'))
    if (!amountStr || isNaN(amt) || amt <= 0) errs.amount = 'Valor inválido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const amt = parseFloat(amountStr.replace(',', '.'))
      await onSave({
        category_id: categoryId,
        amount: amt,
        month,
        year,
        alert_threshold: alertThreshold,
        rollover,
        notes: notes.trim() || undefined,
      })
      onClose()
    } catch {
      // error handled by parent
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

      <div className="relative w-full max-w-[480px] max-h-[90vh] flex flex-col bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)] shrink-0">
          <h2 className="font-[Syne] font-extrabold text-[16px] text-[var(--sl-t1)]">
            {mode === 'create' ? 'Novo Envelope' : 'Editar Envelope'}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--sl-t3)] font-[DM_Mono]">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Categoria */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Categoria</label>
            <div className="grid grid-cols-4 gap-2">
              {expenseCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  disabled={mode === 'edit'}
                  className={cn(
                    'py-2.5 px-1.5 rounded-[11px] border-[1.5px] bg-[var(--sl-s2)] text-center transition-all',
                    mode === 'edit' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-[var(--sl-border-h)] hover:-translate-y-px',
                    categoryId === cat.id
                      ? 'border-[#10b981] bg-[rgba(16,185,129,.08)]'
                      : 'border-[var(--sl-border)]'
                  )}
                >
                  <span className="text-[20px] block mb-1">{cat.icon}</span>
                  <span className={cn(
                    'text-[11px] leading-tight block truncate',
                    categoryId === cat.id ? 'text-[#10b981] font-semibold' : 'text-[var(--sl-t2)]'
                  )}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-[11px] text-[#f43f5e]">{errors.category}</p>}
          </div>

          {/* Limite */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Limite mensal</label>
            <div className={cn(
              'flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border transition-colors',
              errors.amount ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus-within:border-[#10b981]'
            )}>
              <span className="font-[DM_Mono] text-[14px] text-[var(--sl-t3)] shrink-0">R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder="0,00"
                className="flex-1 bg-transparent outline-none font-[DM_Mono] text-[16px] font-medium text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
              />
            </div>
            {errors.amount && <p className="text-[11px] text-[#f43f5e]">{errors.amount}</p>}
            {/* Sugestão 50-30-20 */}
            {monthlyIncome > 0 && selectedCategory && (
              <p className="text-[11px] text-[var(--sl-t3)] px-1">
                💡 Sugestão 50-30-20 para {selectedCategory.name}:{' '}
                <button
                  onClick={() => setAmountStr(String(Math.round(monthlyIncome * 0.15)))}
                  className="text-[#10b981] hover:underline font-semibold"
                >
                  R$ {fmtR$(monthlyIncome * 0.15)}
                </button>
              </p>
            )}
          </div>

          {/* Alert Threshold */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">
                Alertar quando atingir
              </label>
              <span className="font-[DM_Mono] text-[13px] font-bold text-[#f59e0b]">{alertThreshold}%</span>
            </div>
            <input
              type="range"
              min={50} max={100} step={5}
              value={alertThreshold}
              onChange={e => setAlertThreshold(Number(e.target.value))}
              className="w-full accent-[#f59e0b]"
            />
            <div className="flex justify-between text-[10px] text-[var(--sl-t3)] font-[DM_Mono]">
              <span>50%</span><span>70%</span><span>90%</span><span>100%</span>
            </div>
          </div>

          {/* Rollover */}
          <div
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-[11px] border cursor-pointer transition-all',
              rollover
                ? 'border-[rgba(16,185,129,.30)] bg-[rgba(16,185,129,.05)]'
                : 'border-[var(--sl-border)] bg-[var(--sl-s2)]'
            )}
            onClick={() => setRollover(r => !r)}
          >
            <div className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
              rollover ? 'bg-[#10b981] border-[#10b981]' : 'border-[var(--sl-border)]'
            )}>
              {rollover && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[var(--sl-t1)]">Carregar saldo não gasto</p>
              <p className="text-[11px] text-[var(--sl-t3)] mt-0.5 leading-snug">
                O saldo restante deste mês será somado ao limite do próximo.
              </p>
            </div>
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Adicione uma observação..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#10b981] transition-colors resize-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--sl-border)] shrink-0">
          <button onClick={onClose}
            className="px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-bold text-[#03071a] transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: '#10b981' }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {mode === 'create' ? 'Criar envelope' : 'Salvar'}
          </button>
        </div>

      </div>
    </div>
  )
}
