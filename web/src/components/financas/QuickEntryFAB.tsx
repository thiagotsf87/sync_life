'use client'

import { useState, useCallback } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCategories } from '@/hooks/use-categories'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────────────

type EntryType = 'expense' | 'income' | 'transfer'
type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash' | 'transfer' | 'boleto'

const TYPE_LABELS: Record<EntryType, string> = {
  expense: 'Despesa',
  income: 'Receita',
  transfer: 'Transf.',
}

const TYPE_STYLES: Record<EntryType, { bg: string; border: string; color: string }> = {
  expense:  { bg: 'rgba(244,63,94,0.15)',  border: 'rgba(244,63,94,0.4)',  color: '#f43f5e' },
  income:   { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#10b981' },
  transfer: { bg: 'rgba(0,85,255,0.15)',   border: 'rgba(0,85,255,0.4)',   color: '#0055ff' },
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX', credit: 'Crédito', debit: 'Débito',
  cash: 'Dinheiro', transfer: 'Transferência', boleto: 'Boleto',
}

const NUMPAD_KEYS = ['1','2','3','4','5','6','7','8','9','.,','0','⌫'] as const

// ── Helpers ─────────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (d.getTime() === today.getTime()) return `Hoje, ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Digits stored as integer string (last 2 = cents)
// "850" → R$ 8,50 | "12345" → R$ 123,45
function digitsToValue(digits: string): number {
  if (!digits) return 0
  return parseInt(digits, 10) / 100
}

function digitsToDisplay(digits: string): string {
  const val = digitsToValue(digits)
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Component ────────────────────────────────────────────────────────────────

interface QuickEntryFABProps {
  onSuccess?: () => void
}

export function QuickEntryFAB({ onSuccess }: QuickEntryFABProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<EntryType>('expense')
  const [rawDigits, setRawDigits] = useState('')
  const [date, setDate] = useState(todayStr())
  const [expanded, setExpanded] = useState(false)
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [showCatPicker, setShowCatPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { categories } = useCategories()

  const filteredCats = categories.filter(c =>
    type === 'expense' ? c.type === 'expense' : c.type === 'income'
  )

  // IA: smart category suggestion based on description keywords
  const suggestedCat = (() => {
    if (!description || filteredCats.length === 0) return filteredCats[0] ?? null

    const desc = description.toLowerCase()

    // Keyword → category name mapping for common expenses
    const EXPENSE_KEYWORDS: Record<string, string[]> = {
      'alimentação':  ['mercado', 'supermercado', 'ifood', 'uber eats', 'rappi', 'restaurante', 'lanchonete', 'almoço', 'jantar', 'padaria', 'café', 'pizza', 'hamburguer', 'sushi', 'delivery'],
      'transporte':   ['uber', '99', 'combustível', 'gasolina', 'estacionamento', 'pedágio', 'ônibus', 'metrô', 'trem', 'passagem', 'táxi', 'corrida'],
      'moradia':      ['aluguel', 'condomínio', 'iptu', 'luz', 'energia', 'água', 'gás', 'internet', 'manutenção'],
      'saúde':        ['farmácia', 'remédio', 'consulta', 'exame', 'plano de saúde', 'dentista', 'hospital', 'academia'],
      'educação':     ['curso', 'livro', 'escola', 'faculdade', 'mensalidade', 'material', 'udemy', 'alura'],
      'lazer':        ['cinema', 'netflix', 'spotify', 'show', 'teatro', 'viagem', 'hotel', 'bar', 'festa', 'jogo', 'streaming'],
      'vestuário':    ['roupa', 'calçado', 'sapato', 'tênis', 'loja', 'shopping'],
      'investimentos':['aporte', 'investimento', 'ação', 'fii', 'cdb', 'tesouro'],
    }

    const INCOME_KEYWORDS: Record<string, string[]> = {
      'salário':      ['salário', 'pagamento', 'holerite', 'contra-cheque', 'vt', 'vr', 'vale'],
      'freelance':    ['freelance', 'projeto', 'consultoria', 'serviço'],
      'investimentos':['dividendo', 'provento', 'jcp', 'rendimento', 'resgate'],
      'outros':       ['venda', 'reembolso', 'cashback', 'presente'],
    }

    const keywords = type === 'expense' ? EXPENSE_KEYWORDS : INCOME_KEYWORDS

    for (const [catName, words] of Object.entries(keywords)) {
      if (words.some(w => desc.includes(w))) {
        const match = filteredCats.find(c => c.name.toLowerCase().includes(catName.toLowerCase()))
        if (match) return match
      }
    }

    return filteredCats[0] ?? null
  })()

  const selectedCat = selectedCategoryId
    ? categories.find(c => c.id === selectedCategoryId) ?? suggestedCat
    : suggestedCat

  const numericValue = digitsToValue(rawDigits)

  function handleKey(key: typeof NUMPAD_KEYS[number]) {
    if (key === '⌫') {
      setRawDigits(d => d.slice(0, -1))
    } else if (key === '.,') {
      // Decimal point is implied — no-op
    } else {
      setRawDigits(d => {
        if (d.length >= 10) return d // max 99.999.999,99
        return d + key
      })
    }
  }

  const resetState = useCallback(() => {
    setOpen(false)
    setRawDigits('')
    setType('expense')
    setDate(todayStr())
    setExpanded(false)
    setDescription('')
    setPaymentMethod('pix')
    setSelectedCategoryId(null)
    setShowCatPicker(false)
    setError(null)
    setSuccess(false)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (numericValue <= 0 || !selectedCat || saving) return

    setSaving(true)
    setError(null)

    try {
      const sb = createClient() as any
      const { data: { user } } = await sb.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const txDate = new Date(date + 'T00:00:00')
      const isFuture = txDate > today

      const { error: err } = await sb.from('transactions').insert({
        user_id: user.id,
        category_id: selectedCat.id,
        amount: numericValue,
        type: type === 'transfer' ? 'expense' : type,
        description: description.trim() || selectedCat.name,
        date,
        payment_method: paymentMethod,
        notes: null,
        is_future: isFuture,
        recurring_transaction_id: null,
      })

      if (err) throw new Error(err.message)

      setSuccess(true)
      setTimeout(() => {
        resetState()
        onSuccess?.()
      }, 900)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }, [numericValue, selectedCat, saving, date, description, paymentMethod, type, resetState, onSuccess])

  const typeStyle = TYPE_STYLES[type]

  return (
    <>
      {/* ── FAB Button ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Registrar transação rápida"
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg,#10b981,#0055ff)',
          boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
        }}
      >
        <span className="text-[28px] font-[300] leading-none">+</span>
      </button>

      {/* ── Fullscreen Overlay ─────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col overflow-hidden"
          style={{ background: 'var(--sl-bg)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--sl-border)] shrink-0">
            <p className="font-[Syne] text-[17px] font-bold text-[var(--sl-t1)]">Registrar</p>
            <button
              type="button"
              onClick={resetState}
              className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Type Toggle */}
          <div className="flex gap-2 justify-center px-5 pt-4 pb-3 shrink-0">
            {(['expense', 'income', 'transfer'] as EntryType[]).map(t => {
              const s = TYPE_STYLES[t]
              const isActive = type === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setType(t); setSelectedCategoryId(null) }}
                  className="px-4 py-2 rounded-[20px] text-[13px] font-medium transition-all"
                  style={{
                    background: isActive ? s.bg : 'var(--sl-s1)',
                    border: `1px solid ${isActive ? s.border : 'var(--sl-border)'}`,
                    color: isActive ? s.color : 'var(--sl-t2)',
                  }}
                >
                  {TYPE_LABELS[t]}
                </button>
              )
            })}
          </div>

          {/* Amount display */}
          <div className="text-center px-5 pb-3 shrink-0">
            <div
              className="leading-none"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontWeight: 500,
                color: 'var(--sl-t1)',
                letterSpacing: -2,
              }}
            >
              <span style={{ fontSize: 24, color: 'var(--sl-t2)', fontFamily: 'inherit' }}>R$</span>
              <span style={{ fontSize: 52 }}>{rawDigits ? digitsToDisplay(rawDigits) : '0,00'}</span>
            </div>
          </div>

          {/* AI Category */}
          <div className="flex items-center justify-center gap-2 pb-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowCatPicker(p => !p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[20px] bg-[var(--sl-s2)] border border-[var(--sl-border-h)] text-[13px] text-[var(--sl-t1)] transition-colors active:bg-[var(--sl-s3)]"
            >
              <span>{selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : '📦 Selecionar'}</span>
              {suggestedCat && !selectedCategoryId && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-[6px] font-medium text-[#10b981]"
                  style={{ background: 'rgba(16,185,129,0.15)' }}
                >
                  IA
                </span>
              )}
            </button>
            <span className="text-[11px] text-[var(--sl-t3)]">Toque para mudar</span>
          </div>

          {/* Category Picker */}
          {showCatPicker && (
            <div className="mx-4 mb-2 px-3 py-2.5 rounded-[12px] bg-[var(--sl-s1)] border border-[var(--sl-border)] max-h-[110px] overflow-y-auto shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {filteredCats.length === 0 ? (
                  <p className="text-[12px] text-[var(--sl-t3)]">Nenhuma categoria disponível</p>
                ) : (
                  filteredCats.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setSelectedCategoryId(c.id); setShowCatPicker(false) }}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[12px] transition-colors',
                        selectedCat?.id === c.id
                          ? 'bg-[var(--sl-s3)] text-[var(--sl-t1)] border border-[var(--sl-border-h)]'
                          : 'bg-[var(--sl-s2)] text-[var(--sl-t2)] border border-[var(--sl-border)]'
                      )}
                    >
                      {c.icon} {c.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Date Picker */}
          <div className="text-center pb-1.5 shrink-0">
            <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] text-[13px] text-[var(--sl-t2)] cursor-pointer hover:border-[var(--sl-border-h)] transition-colors">
              📅 {formatDisplayDate(date)}
              <input
                type="date"
                value={date}
                onChange={e => { if (e.target.value) setDate(e.target.value) }}
                className="sr-only"
              />
            </label>
          </div>

          {/* Toggle Details */}
          <button
            type="button"
            onClick={() => setExpanded(p => !p)}
            className="flex items-center justify-center gap-1 text-[12px] text-[var(--sl-t3)] pb-1 shrink-0"
          >
            <ChevronDown
              size={14}
              className={cn('transition-transform duration-200', expanded && 'rotate-180')}
            />
            {expanded ? 'Ocultar detalhes' : '▼ Adicionar detalhes (descrição, conta)'}
          </button>

          {/* Expanded Fields */}
          {expanded && (
            <div className="mx-4 mb-2 flex flex-col gap-2 shrink-0">
              <input
                type="text"
                placeholder="Descrição (opcional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="px-3 py-2.5 rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#10b981] transition-colors"
              />
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-[10px] text-[11px] whitespace-nowrap shrink-0 transition-colors border',
                      paymentMethod === m
                        ? 'bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.3)] text-[#10b981]'
                        : 'bg-[var(--sl-s2)] border-[var(--sl-border)] text-[var(--sl-t2)]'
                    )}
                  >
                    {PAYMENT_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-[12px] text-[#f43f5e] text-center px-5 pb-1 shrink-0">{error}</p>
          )}

          {/* Numpad */}
          <div
            className="flex-1 px-4 pt-2 pb-safe-or-3 flex flex-col gap-1.5 overflow-hidden border-t border-[var(--sl-border)] shrink-0"
            style={{ background: 'var(--sl-s1)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            <div className="grid grid-cols-3 gap-1.5" style={{ flex: '1 1 auto' }}>
              {NUMPAD_KEYS.map(k => {
                const isDecimal = k === '.,'
                const isDelete = k === '⌫'
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKey(k)}
                    className="rounded-[12px] flex items-center justify-center active:scale-95 transition-transform select-none"
                    style={{
                      height: 54,
                      background: isDecimal ? 'rgba(16,185,129,0.12)' : 'var(--sl-s2)',
                      border: `1px solid ${isDecimal ? 'rgba(16,185,129,0.3)' : 'var(--sl-border)'}`,
                      color: isDecimal ? '#10b981' : isDelete ? 'var(--sl-t2)' : 'var(--sl-t1)',
                      fontFamily: isDelete ? 'inherit' : "'DM Mono', monospace",
                      fontSize: isDelete ? 18 : 22,
                      fontWeight: 600,
                    }}
                  >
                    {k}
                  </button>
                )
              })}
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={success ? undefined : handleConfirm}
              disabled={saving || numericValue <= 0 || !selectedCat}
              className="w-full rounded-[16px] flex items-center justify-center gap-2 font-[Syne] text-[15px] font-bold text-white transition-all disabled:opacity-50 active:brightness-90 shrink-0"
              style={{
                height: 52,
                background: success ? '#10b981' : 'linear-gradient(135deg,#10b981,#0055ff)',
              }}
            >
              {success ? (
                <><Check size={18} /> Salvo com sucesso!</>
              ) : saving ? (
                'Salvando...'
              ) : (
                `✓ Confirmar — R$ ${numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
