'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { formatCurrency, formatDate } from '@/lib/format'
import { getCategoryById, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories'
import { createClient } from '@/lib/supabase/client'
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

// Mock data for demo
const mockTransactions = [
  { id: '1', description: 'iFood - Jantar', amount: 67.90, type: 'expense' as const, category_id: 'alimentacao', date: '2026-02-04' },
  { id: '2', description: 'Salário - Empresa XYZ', amount: 5800, type: 'income' as const, category_id: 'salario', date: '2026-02-01' },
  { id: '3', description: 'Aluguel - Apartamento', amount: 1500, type: 'expense' as const, category_id: 'moradia', date: '2026-02-01' },
  { id: '4', description: 'Uber - Trabalho', amount: 32.50, type: 'expense' as const, category_id: 'transporte', date: '2026-01-31' },
  { id: '5', description: 'Netflix - Assinatura mensal', amount: 55.90, type: 'expense' as const, category_id: 'lazer', date: '2026-01-30' },
  { id: '6', description: 'Supermercado Extra', amount: 342.15, type: 'expense' as const, category_id: 'alimentacao', date: '2026-01-29' },
  { id: '7', description: 'Conta de Luz - CPFL', amount: 187.45, type: 'expense' as const, category_id: 'contas', date: '2026-01-28' },
  { id: '8', description: 'Posto Shell - Gasolina', amount: 250, type: 'expense' as const, category_id: 'transporte', date: '2026-01-27' },
  { id: '9', description: 'Freelance - Projeto Web', amount: 1500, type: 'income' as const, category_id: 'freelance', date: '2026-01-25' },
  { id: '10', description: 'Cinema - Ingresso', amount: 48, type: 'expense' as const, category_id: 'lazer', date: '2026-01-24' },
]

const categoryFilters = [
  { id: 'alimentacao', label: '🍔 Alimentação' },
  { id: 'moradia', label: '🏠 Moradia' },
  { id: 'transporte', label: '🚗 Transporte' },
  { id: 'lazer', label: '🎮 Lazer' },
  { id: 'salario', label: '💼 Salário' },
]

export default function TransacoesPage() {
  const searchParams = useSearchParams()
  const [isFormOpen, setIsFormOpen] = useState(searchParams.get('new') === 'true')
  const [transactions, setTransactions] = useState(mockTransactions)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [userName, setUserName] = useState('Usuário')
  const [editTransaction, setEditTransaction] = useState<typeof mockTransactions[0] | null>(null)

  const itemsPerPage = 10

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
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
  }, [])

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    // Search filter
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    // Type filter
    if (typeFilter !== 'all' && t.type !== typeFilter) {
      return false
    }
    // Category filter
    if (categoryFilter && t.category_id !== categoryFilter) {
      return false
    }
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransactions(prev => prev.filter(t => t.id !== id))
      toast.success('Transação excluída com sucesso!')
    }
  }

  const handleEdit = (transaction: typeof mockTransactions[0]) => {
    setEditTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    // In real app, would refetch transactions
    setEditTransaction(null)
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
                defaultValue="2026-02-01"
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
              <span className="text-slate-500">até</span>
              <Input
                type="date"
                defaultValue="2026-02-28"
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {/* Type filters */}
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

            <div className="w-px h-6 bg-slate-700 mx-2 self-center"></div>

            {/* Category filters */}
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-[var(--color-sync-500)]/20 text-[var(--color-sync-400)] border-[var(--color-sync-500)]/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
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

          {/* Transactions list */}
          <div className="divide-y divide-slate-800">
            {paginatedTransactions.map((transaction) => {
              const category = getCategoryById(transaction.category_id)

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
                      <span className="text-lg">{category?.icon || '💰'}</span>
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
                          {category?.name || 'Outros'}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(transaction.date)}</span>
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
                      {category?.name || 'Outros'}
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
                      onClick={() => handleDelete(transaction.id)}
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

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
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

      {/* Transaction Form Modal */}
      <TransactionForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditTransaction(null)
        }}
        onSuccess={handleFormSuccess}
        editTransaction={editTransaction || undefined}
      />
    </>
  )
}
