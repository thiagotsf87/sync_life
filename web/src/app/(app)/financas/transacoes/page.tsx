'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  Plus, Search, ChevronLeft, ChevronRight, AlertTriangle,
  Pencil, Trash2, X, SlidersHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { useCategories } from '@/hooks/use-categories'
import {
  useTransactions, groupByDate,
  type Transaction, type TypeFilter, type SortOption,
} from '@/hooks/use-transactions'
import { TransacaoModal } from '@/components/financas/TransacaoModal'
import { DeleteConfirmModal } from '@/components/financas/DeleteConfirmModal'
import { FinancasMobileShell } from '@/components/financas/FinancasMobileShell'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PAYMENT_LABELS: Record<string, string> = {
  pix:      'Pix',
  credit:   'Crédito',
  debit:    'Débito',
  cash:     'Dinheiro',
  transfer: 'Transferência',
  boleto:   'Boleto',
}

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmtR$(n: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^\w/, c => c.toUpperCase())
}

function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="hidden md:grid px-5 py-3 border-b border-[var(--sl-border)] last:border-b-0"
          style={{ gridTemplateColumns: '1fr 150px 110px 130px 110px 80px' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[var(--sl-s3)] animate-pulse shrink-0" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-32 bg-[var(--sl-s3)] rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-[var(--sl-s3)] rounded animate-pulse" />
            </div>
          </div>
          <div className="h-3 w-16 bg-[var(--sl-s3)] rounded animate-pulse self-center" />
          <div className="h-5 w-20 bg-[var(--sl-s3)] rounded-full animate-pulse self-center" />
          <div className="h-5 w-16 bg-[var(--sl-s3)] rounded animate-pulse self-center" />
          <div className="h-4 w-16 bg-[var(--sl-s3)] rounded animate-pulse self-center ml-auto" />
        </div>
      ))}
      {/* Mobile skeleton */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--sl-border)]">
          <div className="w-9 h-9 rounded-[10px] bg-[var(--sl-s3)] animate-pulse shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 w-28 bg-[var(--sl-s3)] rounded animate-pulse" />
            <div className="h-2.5 w-20 bg-[var(--sl-s3)] rounded animate-pulse" />
          </div>
          <div className="h-4 w-16 bg-[var(--sl-s3)] rounded animate-pulse" />
        </div>
      ))}
    </>
  )
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, total, pageSize,
  onPage,
}: {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPage: (p: number) => void
}) {
  const start = Math.min((page - 1) * pageSize + 1, total)
  const end = Math.min(page * pageSize, total)

  // Build page numbers array (max 7 visible, ellipsis)
  function pages(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const result: (number | '...')[] = []
    result.push(1)
    if (page > 3) result.push('...')
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
      result.push(p)
    }
    if (page < totalPages - 2) result.push('...')
    result.push(totalPages)
    return result
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--sl-border)]">
      <span className="text-[12px] text-[var(--sl-t3)]">
        {total === 0 ? 'Nenhuma transação' : (
          <>Exibindo <strong className="text-[var(--sl-t1)]">{start}–{end}</strong> de{' '}
          <strong className="text-[var(--sl-t1)]">{total}</strong> transações</>
        )}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            className="w-7 h-7 rounded-[8px] border border-[var(--sl-border)] flex items-center justify-center text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          {pages().map((p, i) =>
            p === '...' ? (
              <span key={`e${i}`} className="w-7 text-center text-[11px] text-[var(--sl-t3)]">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p as number)}
                className={cn(
                  'w-7 h-7 rounded-[8px] border font-[DM_Mono] text-[12px] transition-colors',
                  p === page
                    ? 'bg-[#10b981] text-[#03071a] border-transparent font-bold'
                    : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)]'
                )}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages}
            className="w-7 h-7 rounded-[8px] border border-[var(--sl-border)] flex items-center justify-center text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── TRANSACTION ROW ──────────────────────────────────────────────────────────

function TransactionRow({
  tx, onEdit, onDelete,
}: {
  tx: Transaction
  onEdit: (tx: Transaction) => void
  onDelete: (tx: Transaction) => void
}) {
  const isIncome = tx.type === 'income'

  return (
    <>
      {/* Desktop row */}
      <div
        className={cn(
          'hidden md:grid px-5 py-3 border-b border-[var(--sl-border)] last:border-b-0 group',
          'hover:bg-[var(--sl-s2)] transition-colors',
          tx.is_future && 'opacity-55'
        )}
        style={{ gridTemplateColumns: '1fr 150px 110px 130px 110px 80px' }}
      >
        {/* Descrição */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[10px] bg-[var(--sl-s3)] flex items-center justify-center text-base shrink-0">
            {tx.category?.icon ?? '💳'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] text-[var(--sl-t1)] truncate font-medium">{tx.description}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {tx.recurring_transaction_id && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(139,92,246,.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,.25)' }}>
                  🔄 Recorrente
                </span>
              )}
              {tx.is_future && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--sl-s3)] text-[var(--sl-t3)] border border-[var(--sl-border)]">
                  Previsto
                </span>
              )}
              {tx.notes && (
                <span className="text-[10px] text-[var(--sl-t3)] truncate max-w-[120px]">{tx.notes}</span>
              )}
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] self-center">
          {formatDateShort(tx.date)}
        </div>

        {/* Categoria */}
        <div className="self-center">
          {tx.category ? (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tx.category.color }} />
              <span className="text-[12px] text-[var(--sl-t2)] truncate">{tx.category.name}</span>
            </div>
          ) : (
            <span className="text-[11px] text-[var(--sl-t3)]">—</span>
          )}
        </div>

        {/* Método */}
        <div className="self-center">
          <span className="text-[11px] text-[var(--sl-t3)] px-2 py-1 rounded-full bg-[var(--sl-s2)] border border-[var(--sl-border)]">
            {PAYMENT_LABELS[tx.payment_method] ?? tx.payment_method}
          </span>
        </div>

        {/* Valor */}
        <div className={cn(
          'font-[DM_Mono] text-[14px] font-medium self-center text-right',
          isIncome ? 'text-[#10b981]' : 'text-[#f43f5e]'
        )}>
          {isIncome ? '+' : '-'}R$ {fmtR$(tx.amount)}
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-1 self-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(tx)}
            className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[var(--sl-t3)] hover:text-[#10b981] hover:bg-[rgba(16,185,129,.08)] transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(tx)}
            className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[var(--sl-t3)] hover:text-[#f43f5e] hover:bg-[rgba(244,63,94,.08)] transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Mobile card */}
      <div
        className={cn(
          'md:hidden flex flex-col px-4 py-3 border-b border-[var(--sl-border)] last:border-b-0',
          tx.is_future && 'opacity-55'
        )}
        onClick={() => onEdit(tx)}
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-[10px] bg-[var(--sl-s3)] flex items-center justify-center text-base shrink-0">
            {tx.category?.icon ?? '💳'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[var(--sl-t1)] truncate">{tx.description}</p>
            <p className="text-[10px] text-[var(--sl-t3)]">
              {formatDateShort(tx.date)} · {PAYMENT_LABELS[tx.payment_method] ?? tx.payment_method}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <p className={cn(
              'font-[DM_Mono] text-[15px] font-medium',
              isIncome ? 'text-[#10b981]' : 'text-[#f43f5e]'
            )}>
              {isIncome ? '+' : '-'}R$ {fmtR$(tx.amount)}
            </p>
            <button
              onClick={e => { e.stopPropagation(); onDelete(tx) }}
              className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[var(--sl-t3)] hover:text-[#f43f5e] hover:bg-[rgba(244,63,94,.08)] transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        {tx.category && (
          <div className="flex items-center gap-2 ml-[46px]">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tx.category.color }} />
            <span className="text-[11px] text-[var(--sl-t3)]">{tx.category.name}</span>
          </div>
        )}
      </div>
    </>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function TransacoesPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | undefined>(undefined)
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null)

  const { categories } = useCategories()
  const { transactions, total, totalPages, isLoading, error, refresh, create, update, remove } =
    useTransactions({ month, year, type: typeFilter, search, categoryId: categoryId || undefined, sort, page })

  const PAGE_SIZE = 30

  // Reset to page 1 when filters change
  function setFilter(fn: () => void) {
    fn()
    setPage(1)
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setPage(1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setPage(1)
  }

  function openCreate() {
    setEditingTx(undefined)
    setModalOpen(true)
  }

  function openEdit(tx: Transaction) {
    setEditingTx(tx)
    setModalOpen(true)
  }

  const handleSave = useCallback(async (data: Parameters<typeof create>[0]) => {
    try {
      if (editingTx) {
        await update(editingTx.id, data)
        toast.success('Transação atualizada')
      } else {
        await create(data)
        toast.success('Transação adicionada')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar transação')
      throw err
    }
  }, [editingTx, create, update])

  const handleDelete = useCallback(async () => {
    if (!deleteTx) return
    try {
      await remove(deleteTx.id)
      toast.success('Transação excluída')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir transação')
      throw err
    }
  }, [deleteTx, remove])

  // Summary for insight
  const totalReceitas = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalDespesas = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const poupancaPct = totalReceitas > 0 ? Math.round(((totalReceitas - totalDespesas) / totalReceitas) * 100) : 0
  const maiorCat = transactions
    .filter(t => t.type === 'expense' && t.category)
    .reduce((acc, t) => {
      acc[t.category!.name] = (acc[t.category!.name] ?? 0) + t.amount
      return acc
    }, {} as Record<string, number>)
  const maiorCategoria = Object.entries(maiorCat).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''

  const groupedByDate = (sort === 'newest' || sort === 'oldest') ? groupByDate(transactions) : null

  // Mobile filter chips (type + top categories)
  const mobileFilterChips = [
    { value: 'all', label: 'Todos' },
    { value: 'expense', label: 'Despesas' },
    { value: 'income', label: 'Receitas' },
    ...categories.slice(0, 4).map(c => ({ value: `cat:${c.id}`, label: c.name })),
  ]

  const [mobileSearch, setMobileSearch] = useState(false)

  return (
    <div className="max-w-[1100px] mx-auto md:px-6 py-0 md:py-7 pb-16">

      {/* ═══ MOBILE HEADER ═══ */}
      <div className="md:hidden">
        <FinancasMobileShell
          subtitle={`${MONTH_NAMES[month - 1]} ${year}`}
          rightAction={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileSearch(v => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-[10px]
                           bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]"
              >
                <Search size={16} />
              </button>
              <button
                onClick={openCreate}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white"
                style={{ background: '#10b981' }}
              >
                <Plus size={16} />
              </button>
            </div>
          }
        >
        {/* Mobile search bar (toggle) */}
        {mobileSearch && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2.5 rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] focus-within:border-[#10b981] transition-colors">
            <Search size={14} className="text-[var(--sl-t3)] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Buscar transações..."
              autoFocus
              className="flex-1 bg-transparent outline-none text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1) }}
                className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors">
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {/* Mobile period selector — ← Março 2026 → */}
        <div className="flex items-center justify-center gap-3 mb-3 px-1">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)] active:bg-[var(--sl-s2)]"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-[Syne] text-[14px] font-semibold text-[var(--sl-t1)] min-w-[120px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)] active:bg-[var(--sl-s2)]"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Mobile filter chips */}
        <div className="flex gap-2 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {mobileFilterChips.map(chip => {
            const isCat = chip.value.startsWith('cat:')
            const catId = isCat ? chip.value.slice(4) : ''
            const isActive = isCat
              ? categoryId === catId && typeFilter === 'all'
              : !isCat && typeFilter === chip.value && !categoryId

            return (
              <button
                key={chip.value}
                onClick={() => {
                  if (isCat) {
                    setFilter(() => { setCategoryId(catId); setTypeFilter('all') })
                  } else {
                    setFilter(() => { setTypeFilter(chip.value as TypeFilter); setCategoryId('') })
                  }
                }}
                className={cn(
                  'px-3.5 py-[7px] rounded-[20px] border text-[12px] font-medium shrink-0 transition-all',
                  isActive
                    ? 'bg-[rgba(16,185,129,0.15)] border-[rgba(16,185,129,0.35)] text-[#10b981]'
                    : 'bg-[var(--sl-s1)] border-[var(--sl-border)] text-[var(--sl-t2)]'
                )}
              >
                {chip.label}
              </button>
            )
          })}
        </div>

        {/* Mobile summary cards */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 rounded-[10px] px-3 py-2.5"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p className="text-[11px] text-[var(--sl-t2)]">Receitas</p>
            <p className="font-[DM_Mono] text-[16px] font-medium text-[#10b981]">+R$ {fmtR$(totalReceitas)}</p>
          </div>
          <div className="flex-1 rounded-[10px] px-3 py-2.5"
            style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
            <p className="text-[11px] text-[var(--sl-t2)]">Despesas</p>
            <p className="font-[DM_Mono] text-[16px] font-medium text-[#f43f5e]">-R$ {fmtR$(totalDespesas)}</p>
          </div>
        </div>
        </FinancasMobileShell>
      </div>

      {/* ═══ DESKTOP HEADER ═══ */}
      <div className="hidden md:block px-4 sm:px-0">
        {/* ① Topbar */}
        <div className="flex items-center gap-2.5 mb-5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <h1 className={cn(
              'font-[Syne] font-extrabold text-[22px] tracking-tight',
              'text-sl-grad'
            )}>
              Transações
            </h1>
            <span className="text-[11px] font-semibold text-[var(--sl-t2)] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-full px-2.5 py-0.5">
              {isLoading ? '…' : total} itens
            </span>
          </div>
          <div className="flex-1" />
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 text-[#03071a] font-bold text-[13px] px-5 py-2.5 rounded-full border-none shadow-[0_4px_16px_rgba(16,185,129,.25)] hover:-translate-y-px hover:brightness-105 transition-all"
            style={{ background: '#10b981' }}
          >
            <Plus size={14} />
            Nova Transação
          </button>
        </div>

        {/* ② Insight Jornada */}
        <JornadaInsight text={
          <>
            Este mês você registrou <strong>R$ {fmtR$(totalReceitas)}</strong> em receitas
            e <strong className="text-[#f43f5e]">R$ {fmtR$(totalDespesas)}</strong> em despesas.
            {poupancaPct > 0 && (
              <> Taxa de poupança: <span className="text-[#10b981]">{poupancaPct}%</span>.</>
            )}
            {maiorCategoria && <> Maior gasto: <strong>{maiorCategoria}</strong>.</>}
          </>
        } />

        {/* ③ Filtros desktop */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 mb-4">
          {/* Linha 1: busca + seletor de mês */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {/* Busca */}
            <div className="flex items-center gap-2 flex-1 min-w-[180px] px-3 py-2 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] focus-within:border-[#10b981] transition-colors">
              <Search size={14} className="text-[var(--sl-t3)] shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Buscar transações..."
                className="flex-1 bg-transparent outline-none text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
              />
              {search && (
                <button onClick={() => { setSearch(''); setPage(1) }}
                  className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Seletor de mês */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={prevMonth}
                className="w-7 h-7 rounded-[8px] border border-[var(--sl-border)] flex items-center justify-center text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors">
                <ChevronLeft size={14} />
              </button>
              <span className="font-[DM_Mono] text-[13px] text-[var(--sl-t1)] px-3 py-1.5 rounded-[8px] bg-[var(--sl-s2)] border border-[var(--sl-border)] whitespace-nowrap min-w-[140px] text-center">
                {MONTH_NAMES[month - 1]} {year}
              </span>
              <button onClick={nextMonth}
                className="w-7 h-7 rounded-[8px] border border-[var(--sl-border)] flex items-center justify-center text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors">
                <ChevronRight size={14} />
              </button>
              {(month !== now.getMonth() + 1 || year !== now.getFullYear()) && (
                <button
                  onClick={() => { setMonth(now.getMonth() + 1); setYear(now.getFullYear()); setPage(1) }}
                  className="ml-1 text-[11px] text-[#10b981] hover:underline"
                >
                  Hoje
                </button>
              )}
            </div>
          </div>

          {/* Linha 2: chips de tipo + categoria + ordenação */}
          <div className="flex items-center gap-2 flex-wrap overflow-x-auto scrollbar-none pb-0.5"
            style={{ scrollbarWidth: 'none' }}>
            {/* Chips de tipo */}
            {([
              { value: 'all', label: 'Todos' },
              { value: 'income', label: 'Receitas' },
              { value: 'expense', label: 'Despesas' },
              { value: 'recurring', label: 'Recorrentes' },
            ] as const).map(chip => (
              <button
                key={chip.value}
                onClick={() => setFilter(() => setTypeFilter(chip.value))}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-all',
                  typeFilter === chip.value
                    ? chip.value === 'all' ? 'bg-[#10b981] text-[#03071a] border-transparent font-bold'
                      : chip.value === 'income' ? 'bg-[rgba(16,185,129,.10)] text-[#10b981] border-[rgba(16,185,129,.30)]'
                      : chip.value === 'expense' ? 'bg-[rgba(244,63,94,.08)] text-[#f43f5e] border-[rgba(244,63,94,.25)]'
                      : 'bg-[rgba(139,92,246,.12)] text-[#a78bfa] border-[rgba(139,92,246,.30)]'
                    : 'bg-[var(--sl-s2)] text-[var(--sl-t2)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
                )}
              >
                {chip.label}
              </button>
            ))}

            <div className="w-px h-5 bg-[var(--sl-border)] mx-1" />

            {/* Categoria */}
            <select
              value={categoryId}
              onChange={e => setFilter(() => setCategoryId(e.target.value))}
              className="px-3 py-1.5 rounded-full border border-[var(--sl-border)] bg-[var(--sl-s2)] text-[12px] text-[var(--sl-t2)] outline-none cursor-pointer hover:border-[var(--sl-border-h)] transition-colors"
            >
              <option value="">Todas as categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>

            {/* Ordenação */}
            <select
              value={sort}
              onChange={e => setFilter(() => setSort(e.target.value as SortOption))}
              className="px-3 py-1.5 rounded-full border border-[var(--sl-border)] bg-[var(--sl-s2)] text-[12px] text-[var(--sl-t2)] outline-none cursor-pointer hover:border-[var(--sl-border-h)] transition-colors ml-auto"
            >
              <option value="newest">Mais recente</option>
              <option value="oldest">Mais antigo</option>
              <option value="highest">Maior valor</option>
              <option value="lowest">Menor valor</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE LIST ═══ */}
      <div className="md:hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="py-12 text-center px-6">
            <AlertTriangle size={32} className="text-[#f43f5e] mx-auto mb-3" />
            <p className="text-[13px] text-[var(--sl-t2)] mb-1">
              Erro ao carregar transações.{' '}
              <button onClick={refresh} className="text-[#10b981] hover:underline">Tentar novamente</button>
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center px-4">
            <span className="text-5xl block mb-3 opacity-60">
              {typeFilter === 'income' ? '💰' : typeFilter === 'expense' ? '📤' : '💳'}
            </span>
            <h3 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-1.5">
              {search ? 'Nenhum resultado encontrado' : 'Nenhuma transação'}
            </h3>
            <p className="text-[13px] text-[var(--sl-t2)]">
              Toque no + para registrar um lançamento.
            </p>
          </div>
        ) : groupedByDate ? (
          groupedByDate.map(group => (
            <div key={group.date}>
              <p className="px-1 pb-2 pt-1 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
                {formatDate(group.date)}
              </p>
              <div className="mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[12px] overflow-hidden">
                {group.transactions.map(tx => {
                  const isIncome = tx.type === 'income'
                  return (
                    <div
                      key={tx.id}
                      onClick={() => openEdit(tx)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 border-b border-[var(--sl-border)] last:border-b-0 cursor-pointer active:bg-[var(--sl-s2)] transition-colors',
                        tx.is_future && 'opacity-55'
                      )}
                    >
                      <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0"
                        style={{ background: tx.category?.color ? `${tx.category.color}15` : 'var(--sl-s3)' }}>
                        {tx.category?.icon ?? '💳'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[var(--sl-t1)] truncate">{tx.description}</p>
                        <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">
                          {tx.recurring_transaction_id ? '🔄 Recorrente · ' : ''}
                          {tx.category?.name ?? 'Sem categoria'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          'font-[DM_Mono] text-[14px] font-medium',
                          isIncome ? 'text-[#10b981]' : 'text-[#f43f5e]'
                        )}>
                          {isIncome ? '+' : '-'}R$ {fmtR$(tx.amount)}
                        </p>
                        <p className="text-[11px] text-[var(--sl-t2)] mt-[1px]">
                          {tx.date.split('-')[2]}/{tx.date.split('-')[1]}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[12px] overflow-hidden">
            {transactions.map(tx => {
              const isIncome = tx.type === 'income'
              return (
                <div
                  key={tx.id}
                  onClick={() => openEdit(tx)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 border-b border-[var(--sl-border)] last:border-b-0 cursor-pointer active:bg-[var(--sl-s2)] transition-colors',
                    tx.is_future && 'opacity-55'
                  )}
                >
                  <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0"
                    style={{ background: tx.category?.color ? `${tx.category.color}15` : 'var(--sl-s3)' }}>
                    {tx.category?.icon ?? '💳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--sl-t1)] truncate">{tx.description}</p>
                    <p className="text-[12px] text-[var(--sl-t2)] mt-[1px]">
                      {tx.category?.name ?? 'Sem categoria'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      'font-[DM_Mono] text-[14px] font-medium',
                      isIncome ? 'text-[#10b981]' : 'text-[#f43f5e]'
                    )}>
                      {isIncome ? '+' : '-'}R$ {fmtR$(tx.amount)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mobile pagination simplified */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pb-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[12px] text-[var(--sl-t2)] disabled:opacity-30"
            >
              Anterior
            </button>
            <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t2)]">{page}/{totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[12px] text-[var(--sl-t2)] disabled:opacity-30"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* ═══ DESKTOP TABLE ═══ */}
      <div className="hidden md:block px-4 sm:px-0">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden">

          {/* Cabeçalho desktop */}
          <div
            className="grid px-5 py-3 bg-[var(--sl-s2)] border-b border-[var(--sl-border)]"
            style={{ gridTemplateColumns: '1fr 150px 110px 130px 110px 80px' }}
          >
            {['Descrição', 'Data', 'Categoria', 'Método', 'Valor', ''].map(col => (
              <p key={col} className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">{col}</p>
            ))}
          </div>

          {/* Conteúdo */}
          {isLoading ? (
            <TableSkeleton />
          ) : error ? (
            <div className="py-12 text-center px-6">
              <AlertTriangle size={32} className="text-[#f43f5e] mx-auto mb-3" />
              <p className="text-[13px] text-[var(--sl-t2)] mb-1">
                Erro ao carregar transações.{' '}
                <button onClick={refresh} className="text-[#10b981] hover:underline">Tentar novamente</button>
              </p>
              <p className="text-[11px] text-[var(--sl-t3)] font-[DM_Mono] mt-2 max-w-md mx-auto break-all">
                {error.message}
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-5xl block mb-3 opacity-60">
                {typeFilter === 'income' ? '💰' : typeFilter === 'expense' ? '📤' : '💳'}
              </span>
              <h3 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-1.5">
                {search ? 'Nenhum resultado encontrado' : 'Nenhuma transação neste período'}
              </h3>
              <p className="text-[13px] text-[var(--sl-t2)]">
                {search
                  ? 'Tente buscar por outro termo.'
                  : 'Clique em "Nova Transação" para registrar um lançamento.'}
              </p>
            </div>
          ) : groupedByDate ? (
            // Grouped view (sorted by date)
            groupedByDate.map(group => (
              <div key={group.date}>
                {/* Date header */}
                <div className="flex items-center justify-between px-5 py-2.5 bg-[var(--sl-s2)] border-b border-[var(--sl-border)] sticky top-0">
                  <p className="text-[11px] font-semibold text-[var(--sl-t2)]">{formatDate(group.date)}</p>
                  <p className={cn(
                    'font-[DM_Mono] text-[12px] font-medium',
                    group.subtotal >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
                  )}>
                    {group.subtotal >= 0 ? '+' : ''}R$ {fmtR$(Math.abs(group.subtotal))}
                  </p>
                </div>
                {group.transactions.map(tx => (
                  <TransactionRow key={tx.id} tx={tx} onEdit={openEdit} onDelete={t => setDeleteTx(t)} />
                ))}
              </div>
            ))
          ) : (
            // Flat view (sorted by amount)
            transactions.map(tx => (
              <TransactionRow key={tx.id} tx={tx} onEdit={openEdit} onDelete={t => setDeleteTx(t)} />
            ))
          )}

          {/* Paginação */}
          {!isLoading && !error && total > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onPage={setPage}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <TransacaoModal
        open={modalOpen}
        mode={editingTx ? 'edit' : 'create'}
        transaction={editingTx}
        categories={categories}
        onClose={() => { setModalOpen(false); setEditingTx(undefined) }}
        onSave={handleSave}
      />
      <DeleteConfirmModal
        open={deleteTx !== null}
        transaction={deleteTx}
        onClose={() => setDeleteTx(null)}
        onConfirm={handleDelete}
      />

    </div>
  )
}
