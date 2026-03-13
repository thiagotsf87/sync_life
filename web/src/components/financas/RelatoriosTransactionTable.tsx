'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SLCard } from '@/components/ui/sl-card'
import { fmtR, formatDate } from '@/components/financas/relatorios-helpers'
import { PAYMENT_METHOD_LABELS, PAGE_SIZE } from '@/hooks/use-relatorios'
import type { RawTransaction } from '@/hooks/use-relatorios'

interface RelatoriosTransactionTableProps {
  transactions: RawTransaction[]
}

export function RelatoriosTransactionTable({ transactions }: RelatoriosTransactionTableProps) {
  const [tableSearch, setTableSearch] = useState('')
  const [tableFilter, setTableFilter] = useState('todos')
  const [page, setPage] = useState(1)

  const handleFilterChange = (f: string) => { setTableFilter(f); setPage(1) }
  const handleSearchChange = (s: string) => { setTableSearch(s); setPage(1) }

  const filteredTxs = useMemo(() => {
    let txs = [...transactions]
    if (tableFilter === 'receitas') txs = txs.filter(t => t.type === 'income')
    if (tableFilter === 'despesas') txs = txs.filter(t => t.type === 'expense')
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase()
      txs = txs.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (t.categories?.name ?? '').toLowerCase().includes(q)
      )
    }
    return txs
  }, [transactions, tableFilter, tableSearch])

  const paginatedTxs = useMemo(() =>
    filteredTxs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredTxs, page]
  )

  const totalPages = Math.max(1, Math.ceil(filteredTxs.length / PAGE_SIZE))

  return (
    <SLCard className="mb-4">
      <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[120px]">
          <Search size={13} className="absolute left-[9px] top-1/2 -translate-y-1/2 text-[var(--sl-t3)] pointer-events-none" />
          <input
            value={tableSearch}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Buscar transação..."
            className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[9px] py-1.5 pl-8 pr-3 text-[var(--sl-t1)] text-[12px] outline-none placeholder:text-[var(--sl-t3)] focus:border-[rgba(16,185,129,0.35)]"
          />
        </div>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'receitas', label: 'Receitas' },
          { key: 'despesas', label: 'Despesas' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => handleFilterChange(f.key)}
            className={cn(
              'px-2.5 py-[5px] rounded-[8px] border text-[11px] cursor-pointer transition-all',
              tableFilter === f.key
                ? 'bg-[rgba(16,185,129,0.14)] text-[#10b981] border-[rgba(16,185,129,0.3)]'
                : 'border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]'
            )}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[500px]">
          <thead>
            <tr>
              {['Data', 'Descrição', 'Categoria', 'Método', 'Valor'].map(h => (
                <th
                  key={h}
                  className="text-left text-[10px] uppercase tracking-[0.07em] text-[var(--sl-t3)] px-2.5 py-1.5 border-b border-[var(--sl-border)] font-semibold last:text-right">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedTxs.map(txn => (
              <tr key={txn.id} className="group">
                <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)] font-[DM_Mono] text-[11px] text-[var(--sl-t3)] group-hover:bg-[var(--sl-s2)]">
                  {formatDate(txn.date)}
                </td>
                <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)] text-[var(--sl-t1)] font-medium max-w-[160px] truncate text-[12px] group-hover:bg-[var(--sl-s2)]">
                  {txn.description}
                </td>
                <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)] group-hover:bg-[var(--sl-s2)]">
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium"
                    style={{
                      background: `${txn.categories?.color ?? '#6b7280'}20`,
                      color: txn.categories?.color ?? '#6b7280',
                    }}>
                    {txn.categories?.icon} {txn.categories?.name ?? '—'}
                  </span>
                </td>
                <td className="px-2.5 py-[9px] border-b border-[var(--sl-border)] text-[11px] text-[var(--sl-t3)] group-hover:bg-[var(--sl-s2)]">
                  {txn.payment_method ? (PAYMENT_METHOD_LABELS[txn.payment_method] ?? txn.payment_method) : '—'}
                </td>
                <td className={cn(
                  'px-2.5 py-[9px] border-b border-[var(--sl-border)] font-[DM_Mono] text-[12px] font-medium text-right group-hover:bg-[var(--sl-s2)]',
                  txn.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]'
                )}>
                  {txn.type === 'income' ? '+' : '−'}{fmtR(txn.amount)}
                </td>
              </tr>
            ))}
            {paginatedTxs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-[12px] text-[var(--sl-t3)]">
                  Nenhuma transação encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {filteredTxs.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-[var(--sl-t3)]">
            Exibindo {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredTxs.length)} de {filteredTxs.length}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
              .map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'px-2.5 py-1 rounded-[7px] border text-[11px] cursor-pointer transition-all',
                    p === page
                      ? 'bg-[rgba(16,185,129,0.14)] text-[#10b981] border-[rgba(16,185,129,0.3)]'
                      : 'border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)]'
                  )}>
                  {p}
                </button>
              ))}
          </div>
        </div>
      )}
    </SLCard>
  )
}
