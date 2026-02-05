'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { ExpenseChart } from '@/components/dashboard/expense-chart'
import { CategoryChart } from '@/components/dashboard/category-chart'
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

      <div className="flex-1 p-4 lg:p-8">
        {/* Summary Cards */}
        <SummaryCards
          income={currentMonthData.income}
          expenses={currentMonthData.expense}
          previousIncome={previousMonthData.income}
          previousExpenses={previousMonthData.expense}
        />

        {/* Charts Row */}
        <ExpenseChart data={mockChartData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6">
          {/* Placeholder for projection chart */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Projeção de Despesas</h2>
                <p className="text-sm text-slate-400">Próximos 6 meses baseado na tendência</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <span className="text-sm font-medium text-rose-400">+3,2%/mês</span>
              </div>
            </div>

            {/* Alert box */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-400">Atenção: Tendência de alta</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Suas despesas aumentaram 3,2% ao mês nos últimos 6 meses.
                  </p>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Insights</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-amber-400">•</span>
                  <span>
                    Categoria <strong className="text-white">Alimentação</strong> cresceu 8% no último trimestre
                  </span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-emerald-400">•</span>
                  <span>
                    Você economizou <strong className="text-white">R$ 1.200</strong> a mais que a média dos últimos 6 meses
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Category Chart */}
          <CategoryChart data={mockCategoryData} totalCategories={5} />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions transactions={mockTransactions} />
      </div>
    </>
  )
}
