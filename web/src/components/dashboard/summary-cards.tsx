'use client'

import { ArrowUp, ArrowDown, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatPercentageChange } from '@/lib/format'

interface SummaryCardsProps {
  income: number
  expenses: number
  previousIncome?: number
  previousExpenses?: number
}

export function SummaryCards({
  income,
  expenses,
  previousIncome = 0,
  previousExpenses = 0,
}: SummaryCardsProps) {
  const balance = income - expenses
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0

  const incomeChange = formatPercentageChange(income, previousIncome)
  const expenseChange = formatPercentageChange(expenses, previousExpenses)
  const incomeIncreased = income >= previousIncome
  const expenseIncreased = expenses >= previousExpenses

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
      {/* Receitas */}
      <div className="stat-card bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm font-medium">Receitas</span>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <ArrowUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
          {formatCurrency(income)}
        </p>
        <p className={`text-sm flex items-center gap-1 ${incomeIncreased ? 'text-emerald-400' : 'text-rose-400'}`}>
          {incomeIncreased ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {incomeChange} vs mês anterior
        </p>
      </div>

      {/* Despesas */}
      <div className="stat-card bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm font-medium">Despesas</span>
          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
            <ArrowDown className="w-5 h-5 text-rose-400" />
          </div>
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
          {formatCurrency(expenses)}
        </p>
        <p className={`text-sm flex items-center gap-1 ${expenseIncreased ? 'text-rose-400' : 'text-emerald-400'}`}>
          {expenseIncreased ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {expenseChange} vs mês anterior
        </p>
      </div>

      {/* Saldo */}
      <div className="stat-card bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm font-medium">Saldo do mês</span>
          <div className="w-10 h-10 bg-[var(--color-sync-500)]/10 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[var(--color-sync-400)]" />
          </div>
        </div>
        <p className={`text-2xl lg:text-3xl font-bold mb-1 ${balance >= 0 ? 'text-[var(--color-sync-400)]' : 'text-rose-400'}`}>
          {formatCurrency(balance)}
        </p>
        <p className="text-sm text-slate-400">
          {savingsRate}% das receitas {balance >= 0 ? 'poupado' : 'em déficit'}
        </p>
      </div>
    </div>
  )
}
