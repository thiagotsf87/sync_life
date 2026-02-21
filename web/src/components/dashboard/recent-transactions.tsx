'use client'

import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'
import { getCategoryById } from '@/constants/categories'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category_id: string
  date: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-6 min-w-0">
        <h2 className="text-lg font-semibold text-white">Últimas transações</h2>
        <Link
          href="/transacoes"
          className="text-sm text-[var(--color-sync-400)] hover:text-[var(--color-sync-300)] transition-colors"
        >
          Ver todas
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transactions.map((transaction) => {
          const category = getCategoryById(transaction.category_id)
          const colorClass =
            transaction.type === 'income'
              ? 'bg-emerald-500/10'
              : category?.color
              ? `bg-[${category.color}]/10`
              : 'bg-slate-700/50'

          return (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-emerald-500/10' : 'bg-orange-500/10'
                }`}
              >
                <span className="text-lg">{category?.icon || '💰'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {transaction.description || category?.name || 'Transação'}
                </p>
                <p className="text-xs text-slate-500">
                  {category?.name || 'Outros'} • {formatDate(transaction.date)}
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {transaction.type === 'income' ? '+ ' : '- '}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          )
        })}

        {transactions.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-slate-500">Nenhuma transação encontrada</p>
            <Link
              href="/transacoes"
              className="text-sm text-[var(--color-sync-400)] hover:text-[var(--color-sync-300)] mt-2 inline-block"
            >
              Adicionar primeira transação
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
