'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ExpenseChart } from '@/components/dashboard/expense-chart'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { ProjectionChart } from '@/components/dashboard/projection-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { formatMonthYear } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'

// Mock data for demo
const mockChartData = [
  { month: 'Março 2025', shortMonth: 'Mar', income: 5200, expense: 3890 },
  { month: 'Abril 2025', shortMonth: 'Abr', income: 5600, expense: 4120 },
  { month: 'Maio 2025', shortMonth: 'Mai', income: 5450, expense: 4560 },
  { month: 'Junho 2025', shortMonth: 'Jun', income: 5780, expense: 3650 },
  { month: 'Julho 2025', shortMonth: 'Jul', income: 6000, expense: 3980 },
  { month: 'Agosto 2025', shortMonth: 'Ago', income: 5600, expense: 4380 },
  { month: 'Setembro 2025', shortMonth: 'Set', income: 5450, expense: 4720 },
  { month: 'Outubro 2025', shortMonth: 'Out', income: 5780, expense: 4150 },
  { month: 'Novembro 2025', shortMonth: 'Nov', income: 6250, expense: 4890 },
  { month: 'Dezembro 2025', shortMonth: 'Dez', income: 6800, expense: 5890 },
  { month: 'Janeiro 2026', shortMonth: 'Jan', income: 5180, expense: 3089 },
  { month: 'Fevereiro 2026', shortMonth: 'Fev', income: 5800, expense: 3246, isCurrent: true },
]

const mockCategoryData = [
  { name: 'Alimentação', value: 1136, color: '#f97316', percent: 35 },
  { name: 'Moradia', value: 908.89, color: '#8b5cf6', percent: 28 },
  { name: 'Transporte', value: 584.22, color: '#06b6d4', percent: 18 },
  { name: 'Lazer', value: 389.48, color: '#22c55e', percent: 12 },
  { name: 'Outros', value: 227.08, color: '#64748b', percent: 7 },
]

const mockTransactions = [
  { id: '1', description: 'iFood - Jantar', amount: 67.90, type: 'expense' as const, category_id: 'alimentacao', date: '2026-02-04' },
  { id: '2', description: 'Salário', amount: 5800, type: 'income' as const, category_id: 'salario', date: '2026-02-01' },
  { id: '3', description: 'Aluguel', amount: 1500, type: 'expense' as const, category_id: 'moradia', date: '2026-02-01' },
  { id: '4', description: 'Uber', amount: 32.50, type: 'expense' as const, category_id: 'transporte', date: '2026-01-31' },
  { id: '5', description: 'Netflix', amount: 55.90, type: 'expense' as const, category_id: 'lazer', date: '2026-01-30' },
  { id: '6', description: 'Mercado', amount: 342.15, type: 'expense' as const, category_id: 'alimentacao', date: '2026-01-29' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [userName, setUserName] = useState('Usuário')

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

  // Current month data (from mock for now)
  const currentMonthData = mockChartData.find(d => d.isCurrent) || mockChartData[mockChartData.length - 1]
  const previousMonthData = mockChartData[mockChartData.length - 2]

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
          income={currentMonthData.income}
          expenses={currentMonthData.expense}
          previousIncome={previousMonthData.income}
          previousExpenses={previousMonthData.expense}
        />

        {/* Charts Row */}
        <ExpenseChart data={mockChartData} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mb-6 min-w-0">
          <div className="min-w-0 lg:col-span-2">
            <ProjectionChart />
          </div>
          <div className="min-w-0 lg:col-span-3">
            <CategoryChart data={mockCategoryData} totalCategories={5} />
          </div>
        </div>

        {/* Recent Transactions */}
        <RecentTransactions transactions={mockTransactions} />
        </div>
      </div>
    </>
  )
}
