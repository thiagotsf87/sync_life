'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { formatCurrency, formatDate } from '@/lib/format'
import { ALL_CATEGORIES, resolveCategory } from '@/constants/categories'
import { useUserCategories } from '@/hooks/use-user-categories'
import { createClient } from '@/lib/supabase/client'
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category_key: string | null
  date: string
}

// Retorna YYYY-MM-DD do primeiro e último dia do mês corrente
function getCurrentMonthRange() {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${String(lastDay).padStart(2, '0')}`,
  }
}

export default function TransacoesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { from: defaultFrom, to: defaultTo } = getCurrentMonthRange()

  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('new') === 'true')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState(defaultFrom)
  const [dateTo, setDateTo] = useState(defaultTo)
  const [currentPage, setCurrentPage] = useState(1)
  const [userName, setUserName] = useState('Usuário')
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Transaction | null>(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  const { customCategories } = useUserCategories()

  const allCategoryOptions = [...ALL_CATEGORIES, ...customCategories]

  const itemsPerPage = 10

  const fetchTransactions = useCallback(async () => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('transactions')
      .select('id, description, amount, type, category_key, date')
      .eq('user_id', user.id)
      .order('date', { ascending: false }) as { data: Transaction[] | null, error: unknown }

    if (!error) setTransactions(data || [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: { user } } = await (supabase as any).auth.getUser()
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single() as { data: { full_name: string | null } | null }
        setUserName(profile?.full_name || user.email?.split('@')[0] || 'Usuário')
      }
    }
    fetchUser()
    fetchTransactions()
  }, [fetchTransactions])

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, typeFilter, categoryFilter, dateFrom, dateTo])

  // Filter transactions — datas em YYYY-MM-DD ordenam lexicograficamente
  const filteredTransactions = transactions.filter((t) => {
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (categoryFilter && t.category_key !== categoryFilter) return false
    if (dateFrom && t.date < dateFrom) return false
    if (dateTo && t.date > dateTo) return false
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    setIsDeleteLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('transactions')
      .delete()
      .eq('id', deleteConfirm.id)

    if (error) {
      toast.error('Erro ao excluir transação')
      setIsDeleteLoading(false)
      return
    }
    toast.success('Transação excluída com sucesso!')
    setDeleteConfirm(null)
    setIsDeleteLoading(false)
    fetchTransactions()
    window.dispatchEvent(new CustomEvent('transaction:changed'))
    router.refresh()
  }

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setEditTransaction(null)
    fetchTransactions()
    router.refresh()
  }

  return (
    <>
      <Header
        title="Transações"
        badge={`${filteredTransactions.length} registros`}
        showNewTransaction
        onNewTransaction={() => setIsFormOpen(true)}
        userName={userName}
      />

      <div className="flex-1 p-4 lg:p-8">
        {/* Filters section */}
        <div className="bg-slate-900 rounded-2xl p-4 lg:p-6 border border-slate-800 mb-6">
          {/* Search and date filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="text"
                placeholder="Buscar transação..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
              <span className="text-slate-500">até</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type chips */}
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                typeFilter === 'all'
                  ? 'bg-[var(--color-sync-500)]/20 text-[var(--color-sync-400)] border-[var(--color-sync-500)]/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-[var(--color-sync-500)]/50'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                typeFilter === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              Receitas
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                typeFilter === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-rose-500/50 hover:text-rose-400'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
              Despesas
            </button>

            <div className="w-px h-6 bg-slate-700 mx-2 self-center hidden sm:block"></div>

            {/* Category dropdown */}
            <select
              value={categoryFilter ?? ''}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all bg-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-sync-500)]/50 ${
                categoryFilter
                  ? 'text-[var(--color-sync-400)] border-[var(--color-sync-500)]/30'
                  : 'text-slate-300 border-slate-700'
              }`}
            >
              <option value="">Filtrar por categoria</option>
              <optgroup label="Despesas">
                {allCategoryOptions
                  .filter(c => c.type === 'expense')
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
              </optgroup>
              <optgroup label="Receitas">
                {allCategoryOptions
                  .filter(c => c.type === 'income')
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Table header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-800/50 border-b border-slate-800 text-sm font-medium text-slate-400">
            <div className="col-span-5">Descrição</div>
            <div className="col-span-2">Categoria</div>
            <div className="col-span-2">Data</div>
            <div className="col-span-2 text-right">Valor</div>
            <div className="col-span-1 text-right">Ações</div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-500">Carregando transações...</p>
            </div>
          )}

          {/* Transactions list */}
          {!isLoading && (
            <div className="divide-y divide-slate-800">
              {paginatedTransactions.map((transaction) => {
                const category = resolveCategory(transaction.category_key, customCategories)

                return (
                  <div
                    key={transaction.id}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-4 lg:px-6 py-4 items-center hover:bg-slate-800/30 transition-colors min-h-[72px]"
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          transaction.type === 'income' ? 'bg-emerald-500/10' : 'bg-orange-500/10'
                        }`}
                      >
                        <span className="text-lg">{category.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 lg:block">
                          <p className="text-sm font-medium text-white truncate">
                            {transaction.description}
                          </p>
                          <p
                            className={`text-base font-bold lg:hidden flex-shrink-0 ${
                              transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {transaction.type === 'income' ? '+ ' : '- '}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 lg:hidden">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === 'income'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-orange-500/15 text-orange-400'
                            }`}
                          >
                            {category.name}
                          </span>
                          <span className="text-xs text-slate-500">{formatDate(transaction.date)}</span>
                          <div className="ml-auto flex gap-1">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(transaction)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden lg:block col-span-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          transaction.type === 'income'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-orange-500/10 text-orange-400'
                        }`}
                      >
                        {category.name}
                      </span>
                    </div>
                    <div className="hidden lg:block col-span-2 text-sm text-slate-400">
                      {formatDate(transaction.date)}
                    </div>
                    <div className="hidden lg:block col-span-2 text-right">
                      <p
                        className={`text-sm font-semibold ${
                          transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {transaction.type === 'income' ? '+ ' : '- '}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <div className="hidden lg:flex col-span-1 justify-end gap-1">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(transaction)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {paginatedTransactions.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-slate-500">Nenhuma transação encontrada</p>
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="mt-4 bg-[var(--color-sync-500)] hover:bg-[var(--color-sync-600)]"
                  >
                    Adicionar primeira transação
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && filteredTransactions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-800">
              <div className="text-sm text-slate-400">
                Mostrando{' '}
                <span className="text-white font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
                </span>{' '}
                de <span className="text-white font-medium">{filteredTransactions.length}</span>{' '}
                transações
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-[var(--color-sync-500)]/20 text-[var(--color-sync-400)] border border-[var(--color-sync-500)]/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Form Modal — key força remontagem ao trocar de transação, garantindo estado correto */}
      <TransactionForm
        key={editTransaction?.id ?? 'new'}
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditTransaction(null)
        }}
        onSuccess={handleFormSuccess}
        editTransaction={editTransaction ? {
          ...editTransaction,
          category_id: editTransaction.category_key || '',
        } : undefined}
      />

      {/* Modal de confirmação de exclusão */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Excluir transação
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-slate-400 text-sm mb-4">
              Esta ação não pode ser desfeita.
            </p>
            {deleteConfirm && (
              <div className="bg-slate-800 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Descrição</span>
                  <span className="text-white font-medium truncate max-w-[160px]">
                    {deleteConfirm.description}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Valor</span>
                  <span className={`font-semibold ${
                    deleteConfirm.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {deleteConfirm.type === 'income' ? '+ ' : '- '}
                    {formatCurrency(deleteConfirm.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Data</span>
                  <span className="text-white">{formatDate(deleteConfirm.date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Categoria</span>
                  <span className="text-white flex items-center gap-1.5">
                    <span>{resolveCategory(deleteConfirm.category_key, customCategories).icon}</span>
                    <span className="font-medium">{resolveCategory(deleteConfirm.category_key, customCategories).name}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleteLoading}
              className="flex-1 bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleteLoading}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleteLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
