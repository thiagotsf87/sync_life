'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type EntryType = 'despesa' | 'receita' | 'transferencia'

interface Category {
  emoji: string
  label: string
  keywords: string[]
}

const CATEGORIES: Category[] = [
  { emoji: '☕', label: 'Alimentação',   keywords: ['cafe', 'coffee', 'restaurante', 'comida', 'lanche', 'pizza', 'ifood'] },
  { emoji: '🚗', label: 'Transporte',    keywords: ['uber', 'taxi', 'gasolina', 'onibus', 'metro'] },
  { emoji: '🏠', label: 'Moradia',       keywords: ['aluguel', 'condominio', 'agua', 'luz', 'gas'] },
  { emoji: '🎮', label: 'Lazer',         keywords: ['netflix', 'spotify', 'cinema', 'jogo', 'play'] },
  { emoji: '🛒', label: 'Mercado',       keywords: ['mercado', 'supermercado', 'compras'] },
  { emoji: '💊', label: 'Saúde',         keywords: ['farmacia', 'medico', 'dentista', 'academia'] },
  { emoji: '📚', label: 'Educação',      keywords: ['curso', 'livro', 'escola', 'faculdade'] },
  { emoji: '💼', label: 'Trabalho',      keywords: ['trabalho', 'escritorio', 'reuniao'] },
  { emoji: '💰', label: 'Salário',       keywords: ['salario', 'freela', 'renda', 'pagamento'] },
]

function detectCategory(description: string): Category {
  const lower = description.toLowerCase()
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(kw => lower.includes(kw))) return cat
  }
  return CATEGORIES[0]
}

function formatAmount(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return '0,00'
  const num = parseInt(digits, 10)
  const reais = Math.floor(num / 100)
  const cents = num % 100
  return `${reais.toLocaleString('pt-BR')},${String(cents).padStart(2, '0')}`
}

export default function QuickEntryPage() {
  const router    = useRouter()
  const supabase  = createClient()

  const [type, setType]           = useState<EntryType>('despesa')
  const [rawDigits, setRawDigits] = useState('')
  const [description, setDescription] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [saving, setSaving]       = useState(false)

  const displayAmount = formatAmount(rawDigits)
  const numericValue  = parseInt(rawDigits || '0', 10) / 100

  const detectedCat = detectCategory(description)

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  })

  function handleKey(key: string) {
    if (key === '⌫') {
      setRawDigits(prev => prev.slice(0, -1))
    } else if (key === '.,') {
      // decimal separator — ignorar (já está em centavos)
    } else {
      if (rawDigits.length >= 10) return
      setRawDigits(prev => prev + key)
    }
  }

  async function handleConfirm() {
    if (!rawDigits || numericValue === 0) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const isReceita = type === 'receita'
      await (supabase as any).from('transactions').insert({
        user_id:     user.id,
        type:        isReceita ? 'income' : 'expense',
        amount:      numericValue,
        description: description || detectedCat.label,
        category:    detectedCat.label,
        date:        new Date().toISOString().slice(0, 10),
      })
      router.push('/financas/transacoes')
    } catch {
      setSaving(false)
    }
  }

  const KEYS = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['.,','0','⌫'],
  ]

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--sl-bg)] flex flex-col">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <div className="flex gap-1 bg-[var(--sl-s2)] rounded-full p-0.5">
          {(['despesa','receita','transferencia'] as EntryType[]).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all capitalize',
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
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--sl-s2)] text-[var(--sl-t2)]"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Valor ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
        <div className="text-center">
          <span className="text-[var(--sl-t3)] text-[15px] font-medium">R$</span>
          <span
            className="font-[DM_Mono] font-bold text-[56px] leading-none ml-1"
            style={{
              color: type === 'receita' ? '#10b981' : type === 'despesa' ? '#f43f5e' : '#0055ff',
            }}
          >
            {displayAmount}
          </span>
        </div>

        {/* Categoria detectada */}
        <div className="flex items-center gap-2 bg-[var(--sl-s2)] rounded-2xl px-4 py-2.5">
          <span className="text-xl">{detectedCat.emoji}</span>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{detectedCat.label}</p>
            <p className="text-[10px] text-[var(--sl-t3)]">Toque para mudar</p>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#10b981]/20 text-[#10b981]">IA</span>
        </div>

        {/* Data */}
        <p className="text-[12px] text-[var(--sl-t3)]">📅 Hoje, {today}</p>

        {/* Detalhes colapsáveis */}
        <button
          onClick={() => setShowDetails(s => !s)}
          className="flex items-center gap-1.5 text-[12px] text-[var(--sl-t3)]"
        >
          <ChevronDown
            size={14}
            className={cn('transition-transform', showDetails && 'rotate-180')}
          />
          {showDetails ? 'Ocultar detalhes' : '▼ Adicionar detalhes (descrição, tags, conta)'}
        </button>

        {showDetails && (
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descrição... (ex: café da manhã)"
            className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)]"
          />
        )}
      </div>

      {/* ── Numpad ── */}
      <div className="shrink-0 px-4 pb-6">
        <div className="grid grid-cols-3 gap-3 mb-3">
          {KEYS.flat().map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className={cn(
                'h-[56px] rounded-2xl text-[20px] font-semibold text-[var(--sl-t1)] transition-all active:scale-95',
                key === '⌫'
                  ? 'bg-[var(--sl-s2)] text-[var(--sl-t2)]'
                  : 'bg-[var(--sl-s2)] hover:bg-[var(--sl-s3)]',
              )}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Botão confirmar */}
        <button
          onClick={handleConfirm}
          disabled={!rawDigits || numericValue === 0 || saving}
          className={cn(
            'w-full h-[56px] rounded-2xl text-[15px] font-bold text-white transition-all active:scale-[0.98]',
            rawDigits && numericValue > 0
              ? 'opacity-100 shadow-lg'
              : 'opacity-40 cursor-not-allowed',
          )}
          style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
        >
          {saving ? 'Salvando...' : `✓ Confirmar — R$ ${displayAmount}`}
        </button>
      </div>
    </div>
  )
}
