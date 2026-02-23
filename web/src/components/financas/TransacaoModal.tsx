'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/hooks/use-categories'
import type { Transaction, TransacaoFormData } from '@/hooks/use-transactions'

const PAYMENT_OPTIONS = [
  { value: 'pix',      label: 'Pix' },
  { value: 'credit',   label: 'Crédito' },
  { value: 'debit',    label: 'Débito' },
  { value: 'cash',     label: 'Dinheiro' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'boleto',   label: 'Boleto' },
] as const

interface TransacaoModalProps {
  open: boolean
  mode: 'create' | 'edit'
  transaction?: Transaction
  categories: Category[]
  defaultDate?: string
  onClose: () => void
  onSave: (data: TransacaoFormData) => Promise<void>
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function TransacaoModal({
  open, mode, transaction, categories, defaultDate, onClose, onSave,
}: TransacaoModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [description, setDescription] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(defaultDate ?? todayStr())
  const [paymentMethod, setPaymentMethod] = useState<TransacaoFormData['payment_method']>('pix')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && transaction) {
      setType(transaction.type)
      setDescription(transaction.description)
      setAmountStr(String(transaction.amount))
      setCategoryId(transaction.category?.id ?? '')
      setDate(transaction.date)
      setPaymentMethod((transaction.payment_method as TransacaoFormData['payment_method']) ?? 'pix')
      setNotes(transaction.notes ?? '')
    } else if (mode === 'create') {
      setType('expense')
      setDescription('')
      setAmountStr('')
      setCategoryId('')
      setDate(defaultDate ?? todayStr())
      setPaymentMethod('pix')
      setNotes('')
    }
    setErrors({})
  }, [open, mode, transaction, defaultDate])

  // Reset category when type changes
  useEffect(() => {
    if (!transaction || mode === 'create') setCategoryId('')
  }, [type]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  const filteredCategories = categories.filter(c => c.type === type)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!description.trim()) errs.description = 'Descrição obrigatória'
    const amt = parseFloat(amountStr.replace(',', '.'))
    if (!amountStr || isNaN(amt) || amt <= 0) errs.amount = 'Valor inválido'
    if (!categoryId) errs.category = 'Selecione uma categoria'
    if (!date) errs.date = 'Data obrigatória'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const amt = parseFloat(amountStr.replace(',', '.'))
      await onSave({
        type,
        description: description.trim(),
        amount: amt,
        category_id: categoryId,
        date,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      })
      onClose()
    } catch {
      // error handled by parent via toast
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-[520px] max-h-[90vh] flex flex-col bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)] shrink-0">
          <h2 className="font-[Syne] font-extrabold text-[16px] text-[var(--sl-t1)]">
            {mode === 'create' ? 'Nova Transação' : 'Editar Transação'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Aviso para transação recorrente */}
          {mode === 'edit' && transaction?.recurring_transaction_id && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-[10px] text-[12px]"
              style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.20)' }}>
              <span className="text-base shrink-0">🔄</span>
              <p className="text-[#a78bfa] leading-snug">
                Esta é uma ocorrência gerada automaticamente. A edição altera apenas este lançamento, não a série.
              </p>
            </div>
          )}

          {/* Toggle tipo */}
          <div className="grid grid-cols-2 gap-2">
            {(['expense', 'income'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'py-3 rounded-[12px] border-[1.5px] bg-[var(--sl-s2)] cursor-pointer flex items-center justify-center gap-2 transition-all',
                  type === 'expense' && t === 'expense' ? 'border-[#f43f5e] bg-[rgba(244,63,94,.07)]'
                    : type === 'income' && t === 'income' ? 'border-[#10b981] bg-[rgba(16,185,129,.07)]'
                    : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
                )}
              >
                <span className="text-xl">{t === 'expense' ? '📤' : '💰'}</span>
                <span className={cn(
                  'text-[14px] font-semibold',
                  type === t ? (t === 'expense' ? 'text-[#f43f5e]' : 'text-[#10b981]') : 'text-[var(--sl-t2)]'
                )}>
                  {t === 'expense' ? 'Despesa' : 'Receita'}
                </span>
              </button>
            ))}
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Supermercado, Salário, Netflix..."
              className={cn(
                'w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none transition-colors',
                errors.description ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus:border-[#10b981]'
              )}
            />
            {errors.description && <p className="text-[11px] text-[#f43f5e]">{errors.description}</p>}
          </div>

          {/* Valor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Valor</label>
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
          </div>

          {/* Grid de categorias */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Categoria</label>
            {filteredCategories.length === 0 ? (
              <p className="text-[12px] text-[var(--sl-t3)] py-2">Nenhuma categoria disponível.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={cn(
                      'py-2.5 px-1.5 rounded-[11px] border-[1.5px] bg-[var(--sl-s2)] cursor-pointer text-center transition-all hover:border-[var(--sl-border-h)] hover:-translate-y-px',
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
            )}
            {errors.category && <p className="text-[11px] text-[#f43f5e]">{errors.category}</p>}
          </div>

          {/* Data + Método */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Data</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border text-[13px] text-[var(--sl-t1)] outline-none transition-colors font-[DM_Mono]',
                  errors.date ? 'border-[#f43f5e]' : 'border-[var(--sl-border)] focus:border-[#10b981]'
                )}
              />
              {errors.date && <p className="text-[11px] text-[#f43f5e]">{errors.date}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Método</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as TransacaoFormData['payment_method'])}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] text-[var(--sl-t1)] outline-none focus:border-[#10b981] transition-colors cursor-pointer"
              >
                {PAYMENT_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
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
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-bold text-[#03071a] transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: '#10b981' }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {mode === 'create' ? 'Adicionar' : 'Salvar alterações'}
          </button>
        </div>

      </div>
    </div>
  )
}
