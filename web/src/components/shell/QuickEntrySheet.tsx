'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useCategories, type Category } from '@/hooks/use-categories'

type EntryType = 'despesa' | 'receita' | 'transferencia'

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'alimentacao', icon: '☕', name: 'Alimentação', color: '#f97316', type: 'expense', is_default: true, sort_order: 1 },
  { id: 'transporte',  icon: '🚗', name: 'Transporte',  color: '#06b6d4', type: 'expense', is_default: true, sort_order: 2 },
  { id: 'moradia',     icon: '🏠', name: 'Moradia',     color: '#3b82f6', type: 'expense', is_default: true, sort_order: 3 },
  { id: 'lazer',       icon: '🎮', name: 'Lazer',       color: '#a855f7', type: 'expense', is_default: true, sort_order: 4 },
  { id: 'mercado',     icon: '🛒', name: 'Mercado',     color: '#10b981', type: 'expense', is_default: true, sort_order: 5 },
  { id: 'saude',       icon: '💊', name: 'Saúde',       color: '#f43f5e', type: 'expense', is_default: true, sort_order: 6 },
  { id: 'educacao',    icon: '📚', name: 'Educação',    color: '#8b5cf6', type: 'expense', is_default: true, sort_order: 7 },
  { id: 'salario',     icon: '💰', name: 'Salário',     color: '#10b981', type: 'income',  is_default: true, sort_order: 8 },
  { id: 'outros',      icon: '📦', name: 'Outros',      color: '#64748b', type: 'expense', is_default: true, sort_order: 9 },
]

function formatAmount(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return '0,00'
  const num = parseInt(digits, 10)
  const reais = Math.floor(num / 100)
  const cents = num % 100
  return `${reais.toLocaleString('pt-BR')},${String(cents).padStart(2, '0')}`
}

// ─── CATEGORY PICKER ─────────────────────────────────────────────────────────

function CategoryPicker({
  open,
  categories,
  entryType,
  onSelect,
  onClose,
}: {
  open: boolean
  categories: Category[]
  entryType: EntryType
  onSelect: (cat: Category) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')

  const typeFilter = entryType === 'receita' ? 'income' : 'expense'
  const filteredCats = categories
    .filter(c => entryType === 'transferencia' || c.type === typeFilter)
    .filter(c =>
      !search.trim() || c.name.toLowerCase().includes(search.toLowerCase())
    )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative bg-[var(--sl-s1)] rounded-t-2xl max-h-[70vh] flex flex-col"
        style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.3)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--sl-border)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--sl-border)] shrink-0">
          <p className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]">Escolher categoria</p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--sl-s2)] text-[var(--sl-t2)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl px-3 py-2">
            <Search size={14} className="text-[var(--sl-t3)] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar categoria..."
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {filteredCats.length === 0 ? (
            <p className="text-center text-[13px] text-[var(--sl-t3)] py-8">Nenhuma categoria encontrada</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredCats.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { onSelect(cat); onClose() }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] border border-[var(--sl-border)] bg-[var(--sl-s2)] text-left transition-all active:scale-[0.97] hover:border-[var(--sl-border-h)]"
                >
                  <span
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] shrink-0"
                    style={{ background: `${cat.color}1a` }}
                  >
                    {cat.icon}
                  </span>
                  <span className="text-[13px] font-medium text-[var(--sl-t1)] truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN SHEET ───────────────────────────────────────────────────────────────

interface QuickEntrySheetProps {
  open: boolean
  onClose: () => void
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.,', '0', '⌫'],
]

export function QuickEntrySheet({ open, onClose }: QuickEntrySheetProps) {
  const { categories: loadedCats, isLoading } = useCategories()
  const supabase = createClient()

  const categories = (!isLoading && loadedCats.length > 0) ? loadedCats : FALLBACK_CATEGORIES

  const [type, setType]               = useState<EntryType>('despesa')
  const [rawDigits, setRawDigits]     = useState('')
  const [selectedCat, setSelectedCat] = useState<Category | null>(null)
  const [catPickerOpen, setCatPickerOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [description, setDescription] = useState('')
  const [saving, setSaving]           = useState(false)

  // Reset state when sheet opens
  useEffect(() => {
    if (open) {
      setType('despesa')
      setRawDigits('')
      setSelectedCat(null)
      setShowDetails(false)
      setDescription('')
      setSaving(false)
    }
  }, [open])

  const displayAmount = formatAmount(rawDigits)
  const numericValue  = parseInt(rawDigits || '0', 10) / 100

  // Default category based on type
  const defaultCat = categories.find(c =>
    type === 'receita' ? c.type === 'income' : c.type === 'expense'
  ) ?? categories[0]
  const activeCat = selectedCat ?? defaultCat

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const handleKey = useCallback((key: string) => {
    if (key === '⌫') {
      setRawDigits(prev => prev.slice(0, -1))
    } else if (key === '.,') {
      // already in centavos, ignore
    } else {
      if (rawDigits.length >= 10) return
      setRawDigits(prev => prev + key)
    }
  }, [rawDigits])

  async function handleConfirm() {
    if (!rawDigits || numericValue === 0) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaving(false); return }

      const isReceita = type === 'receita'
      await (supabase as any).from('transactions').insert({
        user_id:     user.id,
        type:        isReceita ? 'income' : 'expense',
        amount:      numericValue,
        description: description || activeCat.name,
        category:    activeCat.name,
        category_id: activeCat.id !== 'alimentacao' && !activeCat.id.startsWith('_') ? activeCat.id : undefined,
        date:        new Date().toISOString().slice(0, 10),
      })
      onClose()
    } catch {
      setSaving(false)
    }
  }

  const valueColor =
    type === 'receita'       ? '#10b981' :
    type === 'despesa'       ? '#f43f5e' : '#0055ff'

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 lg:hidden"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[101] lg:hidden bg-[var(--sl-bg)] rounded-t-2xl flex flex-col"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
          maxHeight: '95vh',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--sl-border)]" />
        </div>

        {/* Header: type toggle + close */}
        <div className="flex items-center justify-between px-4 py-2 shrink-0">
          <div className="flex gap-0.5 bg-[var(--sl-s2)] rounded-full p-0.5">
            {(['despesa', 'receita', 'transferencia'] as EntryType[]).map(t => (
              <button
                key={t}
                onClick={() => { setType(t); setSelectedCat(null) }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all',
                  type === t
                    ? t === 'receita'
                      ? 'bg-[#10b981] text-white'
                      : t === 'despesa'
                      ? 'bg-[#f43f5e] text-white'
                      : 'bg-[#0055ff] text-white'
                    : 'text-[var(--sl-t3)]',
                )}
              >
                {t === 'transferencia' ? 'Transf.' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--sl-s2)] text-[var(--sl-t2)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Value display */}
        <div className="flex flex-col items-center px-6 pt-2 pb-1 shrink-0">
          <div className="text-center mb-3">
            <span className="text-[var(--sl-t3)] text-[15px] font-medium">R$</span>
            <span
              className="font-[DM_Mono] font-bold text-[52px] leading-none ml-1"
              style={{ color: valueColor }}
            >
              {displayAmount}
            </span>
          </div>

          {/* Category badge — tappable */}
          <button
            onClick={() => setCatPickerOpen(true)}
            className="flex items-center gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl px-4 py-2.5 mb-2 transition-all active:scale-[0.97] hover:border-[var(--sl-border-h)]"
          >
            <span className="text-xl">{activeCat?.icon ?? '☕'}</span>
            <div className="flex-1 text-left">
              <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{activeCat?.name ?? 'Categoria'}</p>
              <p className="text-[10px] text-[var(--sl-t3)]">Toque para mudar</p>
            </div>
            <ChevronDown size={14} className="text-[var(--sl-t3)] shrink-0" />
          </button>

          {/* Date */}
          <p className="text-[12px] text-[var(--sl-t3)] mb-1">📅 Hoje, {today}</p>

          {/* Details toggle */}
          <button
            onClick={() => setShowDetails(s => !s)}
            className="flex items-center gap-1.5 text-[12px] text-[var(--sl-t3)] mb-2"
          >
            <ChevronDown
              size={14}
              className={cn('transition-transform', showDetails && 'rotate-180')}
            />
            {showDetails ? 'Ocultar detalhes' : '▼ Adicionar descrição'}
          </button>

          {showDetails && (
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrição... (ex: almoço no trabalho)"
              className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)] mb-1"
            />
          )}
        </div>

        {/* Numpad */}
        <div className="shrink-0 px-4 pb-2">
          <div className="grid grid-cols-3 gap-2.5 mb-2.5">
            {KEYS.flat().map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className={cn(
                  'h-[52px] rounded-2xl text-[20px] font-semibold text-[var(--sl-t1)] transition-all active:scale-95',
                  key === '⌫'
                    ? 'bg-[var(--sl-s2)] text-[var(--sl-t2)]'
                    : 'bg-[var(--sl-s2)] hover:bg-[var(--sl-s3)]',
                )}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={!rawDigits || numericValue === 0 || saving}
            className={cn(
              'w-full h-[52px] rounded-2xl text-[15px] font-bold text-white transition-all active:scale-[0.98]',
              rawDigits && numericValue > 0 ? 'opacity-100 shadow-lg' : 'opacity-40 cursor-not-allowed',
            )}
            style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
          >
            {saving ? 'Salvando...' : `✓ Confirmar — R$ ${displayAmount}`}
          </button>
        </div>
      </div>

      {/* Category picker sub-sheet */}
      <CategoryPicker
        open={catPickerOpen}
        categories={categories}
        entryType={type}
        onSelect={cat => setSelectedCat(cat)}
        onClose={() => setCatPickerOpen(false)}
      />
    </>
  )
}
