'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MobileFormHeader } from '@/components/ui/mobile-form-header'

interface QuickEntrySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type EntryType = 'despesa' | 'receita' | 'transferencia'

const TYPE_STYLES: Record<EntryType, { active: string; color: string }> = {
  despesa: {
    active: 'bg-[rgba(244,63,94,0.15)] border-[rgba(244,63,94,0.4)] text-[#f43f5e]',
    color: '#f43f5e',
  },
  receita: {
    active: 'bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.4)] text-[#10b981]',
    color: '#10b981',
  },
  transferencia: {
    active: 'bg-[rgba(0,85,255,0.15)] border-[rgba(0,85,255,0.4)] text-[#0055ff]',
    color: '#0055ff',
  },
}

const CATEGORIES = [
  { emoji: '☕', label: 'Alimentação' },
  { emoji: '🚗', label: 'Transporte' },
  { emoji: '🏠', label: 'Moradia' },
  { emoji: '🎮', label: 'Lazer' },
  { emoji: '💊', label: 'Saúde' },
  { emoji: '📚', label: 'Educação' },
]

export function QuickEntrySheet({ open, onOpenChange }: QuickEntrySheetProps) {
  const [type, setType] = useState<EntryType>('despesa')
  const [amount, setAmount] = useState('0')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [showDetails, setShowDetails] = useState(false)

  const formatAmount = (raw: string) => {
    const num = parseInt(raw || '0', 10)
    return (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleKey = useCallback((key: string) => {
    if (key === 'del') {
      setAmount((prev) => prev.length > 1 ? prev.slice(0, -1) : '0')
    } else if (key === '.,') {
      // Decimal is handled via integer division
    } else if (key === 'confirm') {
      // TODO: save transaction
      onOpenChange(false)
      setAmount('0')
      setType('despesa')
    } else {
      setAmount((prev) => {
        const next = prev === '0' ? key : prev + key
        if (next.length > 10) return prev
        return next
      })
    }
  }, [onOpenChange])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    setAmount('0')
    setType('despesa')
    setShowDetails(false)
  }, [onOpenChange])

  if (!open) return null

  const today = new Date()
  const dateStr = today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--sl-bg)] lg:hidden">
      <MobileFormHeader
        moduleId="financas"
        title="Transação rápida"
        onBack={handleClose}
        inModal
      />

      {/* Amount display area */}
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        {/* Type toggle */}
        <div className="flex gap-2 mb-6">
          {(['despesa', 'receita', 'transferencia'] as EntryType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'px-5 py-2 rounded-[20px] text-[13px] font-medium border transition-all duration-150',
                type === t
                  ? TYPE_STYLES[t].active
                  : 'border-[var(--sl-border)] text-[var(--sl-t2)] bg-[var(--sl-s1)]',
              )}
            >
              {t === 'despesa' ? 'Despesa' : t === 'receita' ? 'Receita' : 'Transferência'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="font-[DM_Mono] text-[52px] font-medium text-[var(--sl-t1)] tracking-[-2px]">
          <span className="text-[24px] text-[var(--sl-t2)] mr-1">R$</span>
          {formatAmount(amount)}
        </div>

        {/* Category suggestion */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[var(--sl-s2)] border border-[var(--sl-border-h)] rounded-[20px] px-3 py-1.5">
            <span className="text-[13px] text-[var(--sl-t1)]">
              {category.emoji} {category.label}
            </span>
            <span className="text-[10px] bg-[rgba(16,185,129,0.15)] text-[#10b981] px-1.5 py-0.5 rounded-lg">
              IA
            </span>
          </div>
          <span className="text-[11px] text-[var(--sl-t3)]">Toque para mudar</span>
        </div>

        {/* Date */}
        <div className="mt-3 px-3.5 py-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] text-[13px] text-[var(--sl-t2)]">
          📅 Hoje, {dateStr}
        </div>

        {/* Details toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-2 text-[12px] text-[var(--sl-t2)] py-2"
        >
          ▼ Adicionar detalhes (descrição, tags, conta)
        </button>

        {/* Category selector (shown when showDetails=true) */}
        {showDetails && (
          <div className="flex flex-wrap gap-2 mt-2 px-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-[20px] text-[12px] border transition-colors',
                  category.label === cat.label
                    ? 'bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.35)] text-[#10b981]'
                    : 'bg-[var(--sl-s1)] border-[var(--sl-border)] text-[var(--sl-t2)]',
                )}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Numpad */}
      <div className="bg-[var(--sl-s1)] border-t border-[var(--sl-border)] px-4 py-2 pb-[env(safe-area-inset-bottom,8px)]">
        <div className="grid grid-cols-3 gap-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.,', '0', 'del'].map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className={cn(
                'h-[58px] rounded-[12px] flex items-center justify-center',
                'border transition-all duration-100 active:scale-95',
                key === 'del'
                  ? 'bg-[var(--sl-s2)] border-[var(--sl-border)] text-[var(--sl-t1)] text-[16px]'
                  : key === '.,'
                    ? 'bg-[rgba(16,185,129,0.15)] border-[var(--sl-border)] text-[#10b981] text-[14px] font-semibold'
                    : 'bg-[var(--sl-s2)] border-[var(--sl-border)] text-[var(--sl-t1)] text-[22px] font-normal font-[DM_Mono]',
              )}
            >
              {key === 'del' ? '⌫' : key}
            </button>
          ))}
          {/* Confirm button — spans all 3 columns */}
          <button
            onClick={() => handleKey('confirm')}
            className="col-span-3 h-[52px] rounded-[16px] mt-1 flex items-center justify-center
                        text-white text-[15px] font-semibold border-none
                        active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
          >
            ✓ Confirmar — R$ {formatAmount(amount)}
          </button>
        </div>
      </div>
    </div>
  )
}
