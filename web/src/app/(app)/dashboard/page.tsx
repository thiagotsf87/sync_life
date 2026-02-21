'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ExpenseChart } from '@/components/dashboard/expense-chart'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { ProjectionChart } from '@/components/dashboard/projection-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { formatMonthYear } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { resolveCategory } from '@/constants/categories'
import { useUserCategories } from '@/hooks/use-user-categories'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category_key: string | null
  date: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [userName, setUserName] = useState('Usuário')
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const { customCategories } = useUserCategories()

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single() as { data: { full_name: string | null } | null }
    setUserName(profile?.full_name || user.email?.split('@')[0] || 'Usuário')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: transactions } = await (supabase as any)
      .from('transactions')
      .select('id, description, amount, type, category_key, date')
      .eq('user_id', user.id)
      .order('date', { ascending: false }) as { data: Transaction[] | null }
    setAllTransactions(transactions || [])
  }, [])

  useEffect(() => {
    fetchData()
    const handleVisibility = () => { if (!document.hidden) fetchData() }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('transaction:changed', fetchData)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('transaction:changed', fetchData)
    }
  }, [fetchData])

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const handleNewTransaction = () => {
    router.push('/transacoes?new=true')
  }

  // --- Derived data computed inline ---

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() // 0-indexed

  const currentMonthTxs = allTransactions.filter(tx => {
    const [y, m] = tx.date.split('-').map(Number)
    return y === currentYear && m - 1 === currentMonth
  })

  const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  const prevMonthTxs = allTransactions.filter(tx => {
    const [y, m] = tx.date.split('-').map(Number)
    return y === prevDate.getFullYear() && m - 1 === prevDate.getMonth()
  })

  const currentIncome = currentMonthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const currentExpenses = currentMonthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const previousIncome = prevMonthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const previousExpenses = prevMonthTxs
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // Category breakdown for current month expenses
  const catMap: Record<string, number> = {}
  currentMonthTxs
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const key = t.category_key || 'outros-despesa'
      catMap[key] = (catMap[key] || 0) + Number(t.amount)
    })
  const totalExpenses = Object.values(catMap).reduce((a, b) => a + b, 0)
  const categoryData = Object.entries(catMap)
    .map(([key, value]) => {
      const cat = resolveCategory(key, customCategories)
      return {
        name: cat.name,
        value,
        color: cat.color,
        percent: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0,
      }
    })
    .sort((a, b) => b.value - a.value)

  // Last 12 months chart data relative to currentDate
  const chartData = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = d.getMonth() // 0-indexed
    const monthTxs = allTransactions.filter(tx => {
      const [ty, tm] = tx.date.split('-').map(Number)
      return ty === y && tm - 1 === m
    })
    const income = monthTxs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const expense = monthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const monthName = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(d)
    const shortMonth = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
      .format(d)
      .replace('.', '')
    chartData.push({
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      shortMonth: shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1),
      income,
      expense,
      isCurrent: i === 0,
    })
  }

  // Last 6 transactions (already sorted by date desc)
  const recentTransactions = allTransactions.slice(0, 6)

  return (
    <>
      <Header
        title="Dashboard"
        showMonthSelector
        currentMonth={formatMonthYear(currentDate)}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        showNewTransaction
        onNewTransaction={handleNewTransaction}
        userName={userName}
      />

      <div className="flex-1 min-w-0 overflow-x-hidden p-4 lg:p-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Summary Cards */}
          <SummaryCards
            income={currentIncome}
            expenses={currentExpenses}
            previousIncome={previousIncome}
            previousExpenses={previousExpenses}
          />

          {/* Receitas vs Despesas */}
          <ExpenseChart data={chartData} />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mb-6 min-w-0">
            <div className="min-w-0 lg:col-span-2">
              <ProjectionChart />
            </div>
            <div className="min-w-0 lg:col-span-3">
              <CategoryChart data={categoryData} totalCategories={categoryData.length} />
            </div>
          </div>

          {/* Recent Transactions */}
          <RecentTransactions transactions={recentTransactions} customCategories={customCategories} />
        </div>
      </div>
    </>
  )
}
