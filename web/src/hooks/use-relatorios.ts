'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type PeriodKey = 'mes' | 'tri' | 'sem' | '12m' | 'ano' | 'custom'

export interface PeriodRange {
  start: string
  end: string
}

export interface RawTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  date: string
  payment_method: string | null
  notes: string | null
  is_future: boolean
  categories: { id: string; name: string; icon: string; color: string } | null
}

export interface PeriodStats {
  totalRecipes: number
  totalExpenses: number
  totalBalance: number
  avgSavingsRate: number
  prevTotalRecipes: number
  prevTotalExpenses: number
  prevTotalBalance: number
  prevAvgSavingsRate: number
  txCount: number
  monthCount: number
  topGrowingCategory: string | null
  topGrowthPct: number
  monthWithBestBalance: string
}

export interface CategoryComparison {
  name: string
  color: string
  currentTotal: number
  prevTotal: number
  delta: number | null
}

export interface SavingsRatePoint {
  month: string
  monthShort: string
  rate: number
  recipes: number
  expenses: number
}

export interface NarrativeTag {
  text: string
  type: 'pos' | 'neg' | 'neu'
}

export interface MonthlyChartPoint {
  month: string
  [catName: string]: number | string
}

export const PERIOD_OPTIONS = [
  { key: 'mes',    label: 'Mês atual',          proOnly: false },
  { key: 'tri',    label: 'Último trimestre',    proOnly: false },
  { key: 'sem',    label: 'Último semestre',     proOnly: true  },
  { key: '12m',    label: 'Últimos 12 meses',    proOnly: true  },
  { key: 'ano',    label: 'Ano atual',           proOnly: false },
  { key: 'custom', label: 'Personalizado',       proOnly: true  },
] as const

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix:      'Pix',
  credit:   'Crédito',
  debit:    'Débito',
  cash:     'Dinheiro',
  transfer: 'TED/DOC',
  boleto:   'Boleto',
}

export const CAT_COLORS = ['#10b981','#0055ff','#f59e0b','#f97316','#a855f7','#06b6d4','#f43f5e','#84cc16']

export const PAGE_SIZE = 30

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function calcDeltaPct(current: number, prev: number): number | null {
  if (prev === 0) return null
  return ((current - prev) / Math.abs(prev)) * 100
}

const MONTH_SHORT_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [y, m] = key.split('-')
  return `${MONTH_SHORT_PT[parseInt(m) - 1]}/${String(y).slice(2)}`
}

function monthsInRange(start: string, end: string): string[] {
  const keys: string[] = []
  const cur = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  while (cur <= endDate) {
    keys.push(monthKey(cur))
    cur.setMonth(cur.getMonth() + 1)
  }
  return keys
}

function calcPeriodStats(
  txs: RawTransaction[],
  prevTxs: RawTransaction[],
  profile: { monthly_income?: number } | null,
  months: string[],
): PeriodStats {
  const totalRecipes  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalBalance  = totalRecipes - totalExpenses

  const prevRecipes  = prevTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const prevExpenses = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const prevBalance  = prevRecipes - prevExpenses

  const monthlyIncome = profile?.monthly_income ?? 0

  // Monthly savings rates
  const monthlySavings = months.map(m => {
    const monthTxs = txs.filter(t => t.date.startsWith(m))
    const rec = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const exp = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const base = monthlyIncome > 0 ? monthlyIncome : rec
    return { m, rate: base > 0 ? Math.max(0, (rec - exp) / base * 100) : 0, balance: rec - exp }
  })

  const avgSavingsRate = monthlySavings.length > 0
    ? monthlySavings.reduce((s, m) => s + m.rate, 0) / monthlySavings.length
    : 0

  // Prev period savings rate
  const prevMonths = Array.from(new Set(prevTxs.map(t => t.date.slice(0, 7))))
  const prevMonthlySavings = prevMonths.map(m => {
    const monthTxs = prevTxs.filter(t => t.date.startsWith(m))
    const rec = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const exp = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const base = monthlyIncome > 0 ? monthlyIncome : rec
    return base > 0 ? Math.max(0, (rec - exp) / base * 100) : 0
  })
  const prevAvgSavingsRate = prevMonthlySavings.length > 0
    ? prevMonthlySavings.reduce((s, r) => s + r, 0) / prevMonthlySavings.length
    : 0

  // Best month
  const bestMonth = monthlySavings.reduce((best, m) => m.balance > best.balance ? m : best, { m: months[0] ?? '', balance: -Infinity })
  const monthWithBestBalance = monthLabel(bestMonth.m)

  // Top growing category (expense categories that grew most month-to-month)
  let topGrowingCategory: string | null = null
  let topGrowthPct = 0
  if (months.length >= 2) {
    const catSet = new Set(txs.filter(t => t.type === 'expense').map(t => t.categories?.name ?? 'Outros'))
    for (const cat of catSet) {
      const first = txs.filter(t => t.date.startsWith(months[0]) && t.type === 'expense' && (t.categories?.name ?? 'Outros') === cat).reduce((s, t) => s + t.amount, 0)
      const last  = txs.filter(t => t.date.startsWith(months[months.length - 1]) && t.type === 'expense' && (t.categories?.name ?? 'Outros') === cat).reduce((s, t) => s + t.amount, 0)
      if (first > 0 && last > first) {
        const pct = (last - first) / first * 100
        if (pct > topGrowthPct) { topGrowthPct = pct; topGrowingCategory = cat }
      }
    }
  }

  return {
    totalRecipes, totalExpenses, totalBalance,
    avgSavingsRate,
    prevTotalRecipes: prevRecipes,
    prevTotalExpenses: prevExpenses,
    prevTotalBalance: prevBalance,
    prevAvgSavingsRate,
    txCount: txs.length,
    monthCount: months.length,
    topGrowingCategory,
    topGrowthPct,
    monthWithBestBalance,
  }
}

function calcCatComparison(txs: RawTransaction[], prevTxs: RawTransaction[]): CategoryComparison[] {
  const currentMap = new Map<string, { total: number; color: string; idx: number }>()
  txs.filter(t => t.type === 'expense').forEach((t, i) => {
    const name = t.categories?.name ?? 'Outros'
    const existing = currentMap.get(name)
    currentMap.set(name, {
      total: (existing?.total ?? 0) + t.amount,
      color: t.categories?.color ?? CAT_COLORS[i % CAT_COLORS.length],
      idx: existing?.idx ?? i,
    })
  })

  const prevMap = new Map<string, number>()
  prevTxs.filter(t => t.type === 'expense').forEach(t => {
    const name = t.categories?.name ?? 'Outros'
    prevMap.set(name, (prevMap.get(name) ?? 0) + t.amount)
  })

  return Array.from(currentMap.entries())
    .map(([name, { total, color }]) => ({
      name,
      color,
      currentTotal: total,
      prevTotal: prevMap.get(name) ?? 0,
      delta: prevMap.has(name) ? calcDeltaPct(total, prevMap.get(name)!) : null,
    }))
    .sort((a, b) => b.currentTotal - a.currentTotal)
    .slice(0, 8)
}

function calcSavingsRate(
  txs: RawTransaction[],
  months: string[],
  profile: { monthly_income?: number } | null,
): SavingsRatePoint[] {
  const monthlyIncome = profile?.monthly_income ?? 0
  return months.map(m => {
    const monthTxs = txs.filter(t => t.date.startsWith(m))
    const recipes  = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const base = monthlyIncome > 0 ? monthlyIncome : recipes
    const rate = base > 0 ? Math.max(0, (recipes - expenses) / base * 100) : 0
    return { month: monthLabel(m), monthShort: m.slice(0, 7), rate, recipes, expenses }
  })
}

function calcLineChartData(txs: RawTransaction[], months: string[]): { data: MonthlyChartPoint[]; topCats: { name: string; color: string }[] } {
  // Get top 5 expense categories by total
  const catTotals = new Map<string, { total: number; color: string }>()
  txs.filter(t => t.type === 'expense').forEach((t, i) => {
    const name = t.categories?.name ?? 'Outros'
    const existing = catTotals.get(name)
    catTotals.set(name, {
      total: (existing?.total ?? 0) + t.amount,
      color: t.categories?.color ?? CAT_COLORS[i % CAT_COLORS.length],
    })
  })
  const topCats = Array.from(catTotals.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([name, { color }]) => ({ name, color }))

  const data: MonthlyChartPoint[] = months.map(m => {
    const point: MonthlyChartPoint = { month: monthLabel(m) }
    for (const cat of topCats) {
      point[cat.name] = txs
        .filter(t => t.date.startsWith(m) && t.type === 'expense' && (t.categories?.name ?? 'Outros') === cat.name)
        .reduce((s, t) => s + t.amount, 0)
    }
    return point
  })

  return { data, topCats }
}

function calcBarChartData(txs: RawTransaction[], months: string[]) {
  return months.map(m => {
    const mTxs = txs.filter(t => t.date.startsWith(m))
    return {
      month: monthLabel(m),
      receitas: mTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      despesas: mTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })
}

export function generateNarrative(stats: PeriodStats, periodLabel: string, fmtR: (v: number) => string): { text: string; tags: NarrativeTag[] } {
  const { totalBalance, avgSavingsRate, topGrowingCategory, topGrowthPct, monthWithBestBalance, totalExpenses, prevTotalExpenses } = stats
  const expenseDelta = prevTotalExpenses > 0
    ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses * 100).toFixed(1)
    : null

  let text = `No período <em>${periodLabel}</em> você acumulou `
    + `<em>${fmtR(Math.abs(totalBalance))} de saldo ${totalBalance >= 0 ? 'positivo' : 'negativo'}</em>, `
    + `com taxa média de poupança de <em>${avgSavingsRate.toFixed(1)}%</em>. `

  if (topGrowingCategory && topGrowthPct > 10) {
    text += `O gasto com <em>${topGrowingCategory} cresceu ${topGrowthPct.toFixed(0)}%</em> ao longo do período. `
  }
  if (expenseDelta && parseFloat(expenseDelta) > 5) {
    text += `Despesas cresceram ${expenseDelta}% em relação ao período anterior. `
  }
  if (monthWithBestBalance && monthWithBestBalance !== '') {
    text += `<em>${monthWithBestBalance}</em> foi seu melhor mês em saldo.`
  }

  const tags: NarrativeTag[] = [
    totalBalance >= 0
      ? { text: '✓ Saldo positivo no período', type: 'pos' }
      : { text: '⚠ Saldo negativo no período', type: 'neg' },
    avgSavingsRate >= 20
      ? { text: '✓ Meta de poupança atingida', type: 'pos' }
      : { text: `⚠ Poupança ${avgSavingsRate.toFixed(1)}% (abaixo de 20%)`, type: 'neg' },
    ...(topGrowingCategory && topGrowthPct > 15
      ? [{ text: `⚠ ${topGrowingCategory} em alta`, type: 'neg' as const }]
      : []),
    ...(monthWithBestBalance ? [{ text: `→ Melhor mês: ${monthWithBestBalance}`, type: 'neu' as const }] : []),
  ]

  return { text, tags }
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

interface UseRelatoriosReturn {
  period: PeriodKey
  setPeriod: (p: PeriodKey) => void
  customStart: string
  setCustomStart: (s: string) => void
  customEnd: string
  setCustomEnd: (s: string) => void
  transactions: RawTransaction[]
  prevTransactions: RawTransaction[]
  profile: { monthly_income?: number; savings_goal_pct?: number } | null
  loading: boolean
  error: string | null
  periodStats: PeriodStats
  catCompData: CategoryComparison[]
  savingsRateData: SavingsRatePoint[]
  lineChartData: MonthlyChartPoint[]
  lineChartCats: { name: string; color: string }[]
  barChartData: { month: string; receitas: number; despesas: number }[]
  topExpenses: RawTransaction[]
  months: string[]
  periodRange: PeriodRange
  handleGenerate: () => Promise<void>
  exportCSV: () => void
}

export function useRelatorios(): UseRelatoriosReturn {
  const [period, setPeriod] = useState<PeriodKey>('tri')
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 2)
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  })
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0])
  const [transactions, setTransactions] = useState<RawTransaction[]>([])
  const [prevTransactions, setPrevTransactions] = useState<RawTransaction[]>([])
  const [profile, setProfile] = useState<{ monthly_income?: number; savings_goal_pct?: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [periodRange, setPeriodRange] = useState<PeriodRange>({ start: '', end: '' })

  function getRange(p: PeriodKey): PeriodRange {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const y = now.getFullYear()
    const m = now.getMonth()
    switch (p) {
      case 'mes':    return { start: new Date(y, m, 1).toISOString().split('T')[0],      end: today }
      case 'tri':    return { start: new Date(y, m - 2, 1).toISOString().split('T')[0],  end: today }
      case 'sem':    return { start: new Date(y, m - 5, 1).toISOString().split('T')[0],  end: today }
      case '12m':    return { start: new Date(y - 1, m + 1, 1).toISOString().split('T')[0], end: today }
      case 'ano':    return { start: new Date(y, 0, 1).toISOString().split('T')[0],      end: today }
      case 'custom': return { start: customStart, end: customEnd }
    }
  }

  function getPrevRange(range: PeriodRange): PeriodRange {
    const startMs = new Date(range.start).getTime()
    const endMs   = new Date(range.end).getTime()
    const duration = endMs - startMs
    return {
      start: new Date(startMs - duration - 86400000).toISOString().split('T')[0],
      end:   new Date(startMs - 86400000).toISOString().split('T')[0],
    }
  }

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const range = getRange(period)
    const prev  = getPrevRange(range)
    setPeriodRange(range)

    const [txRes, prevTxRes, profileRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('id, description, amount, type, date, payment_method, notes, is_future, categories(id, name, icon, color)')
        .eq('user_id', user.id)
        .gte('date', range.start)
        .lte('date', range.end)
        .eq('is_future', false)
        .order('date', { ascending: false }),
      supabase
        .from('transactions')
        .select('id, description, amount, type, date, payment_method, notes, is_future, categories(id, name, icon, color)')
        .eq('user_id', user.id)
        .gte('date', prev.start)
        .lte('date', prev.end)
        .eq('is_future', false),
      supabase
        .from('profiles')
        .select('savings_goal_pct, monthly_income, current_balance')
        .eq('id', user.id)
        .single(),
    ])

    if (txRes.error) setError(txRes.error.message)
    else setTransactions(txRes.data ?? [])
    setPrevTransactions(prevTxRes.data ?? [])
    if (profileRes.data) setProfile(profileRes.data)
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customStart, customEnd])

  useEffect(() => { handleGenerate() }, []) // initial load

  const months = useMemo(() => {
    if (!periodRange.start || !periodRange.end) return []
    return monthsInRange(periodRange.start, periodRange.end)
  }, [periodRange])

  const periodStats = useMemo(() =>
    calcPeriodStats(transactions, prevTransactions, profile, months),
    [transactions, prevTransactions, profile, months]
  )

  const catCompData = useMemo(() =>
    calcCatComparison(transactions, prevTransactions),
    [transactions, prevTransactions]
  )

  const savingsRateData = useMemo(() =>
    calcSavingsRate(transactions, months, profile),
    [transactions, months, profile]
  )

  const { data: lineChartData, topCats: lineChartCats } = useMemo(() =>
    calcLineChartData(transactions, months),
    [transactions, months]
  )

  const barChartData = useMemo(() =>
    calcBarChartData(transactions, months),
    [transactions, months]
  )

  const topExpenses = useMemo(() =>
    [...transactions].filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount).slice(0, 5),
    [transactions]
  )

  function exportCSV() {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Método', 'Notas']
    const rows = transactions.map(t => [
      t.date,
      `"${t.description}"`,
      `"${t.categories?.name ?? ''}"`,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount.toFixed(2).replace('.', ','),
      t.payment_method ?? '',
      `"${t.notes ?? ''}"`,
    ])
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synclife-relatorio-${period}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    period, setPeriod,
    customStart, setCustomStart,
    customEnd, setCustomEnd,
    transactions, prevTransactions, profile,
    loading, error,
    periodStats, catCompData, savingsRateData,
    lineChartData, lineChartCats,
    barChartData, topExpenses, months,
    periodRange,
    handleGenerate,
    exportCSV,
  }
}
