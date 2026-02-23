'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from './use-categories'

export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  description: string
  date: string
  payment_method: string
  notes: string | null
  is_future: boolean
  recurring_transaction_id: string | null
  created_at: string
  category: {
    id: string
    name: string
    icon: string
    color: string
  } | null
}

export interface TransacaoFormData {
  type: 'income' | 'expense'
  description: string
  amount: number
  category_id: string
  date: string
  payment_method: 'pix' | 'credit' | 'debit' | 'cash' | 'transfer' | 'boleto'
  notes?: string
}

export type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest'
export type TypeFilter = 'all' | 'income' | 'expense' | 'recurring'

interface UseTransactionsOptions {
  month: number
  year: number
  type?: TypeFilter
  search?: string
  categoryId?: string
  sort?: SortOption
  page?: number
  pageSize?: number
}

interface UseTransactionsReturn {
  transactions: Transaction[]
  total: number
  totalPages: number
  isLoading: boolean
  error: Error | null
  refresh: () => void
  create: (data: TransacaoFormData) => Promise<Transaction>
  update: (id: string, data: Partial<TransacaoFormData>) => Promise<Transaction>
  remove: (id: string) => Promise<void>
}

function isDateInFuture(dateStr: string): boolean {
  const txDate = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return txDate > today
}

export function useTransactions(options: UseTransactionsOptions): UseTransactionsReturn {
  const PAGE_SIZE = options.pageSize ?? 30
  const page = options.page ?? 1
  const sort = options.sort ?? 'newest'

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(options.search ?? '')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(options.search ?? ''), 300)
    return () => clearTimeout(timer)
  }, [options.search])

  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled.current) return

      const monthStr = String(options.month).padStart(2, '0')
      const startDate = `${options.year}-${monthStr}-01`
      // use day 31 — Supabase/Postgres handles it correctly (clips to last day)
      const endDate = `${options.year}-${monthStr}-31`

      let query = supabase
        .from('transactions')
        .select(`
          id, amount, type, description, date,
          payment_method, notes, is_future, recurring_transaction_id, created_at,
          category:categories(id, name, icon, color)
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)

      if (options.type === 'income')    query = query.eq('type', 'income')
      if (options.type === 'expense')   query = query.eq('type', 'expense')
      if (options.type === 'recurring') query = query.not('recurring_transaction_id', 'is', null)

      if (debouncedSearch) query = query.ilike('description', `%${debouncedSearch}%`)
      if (options.categoryId) query = query.eq('category_id', options.categoryId)

      const orderCol = sort === 'highest' || sort === 'lowest' ? 'amount' : 'date'
      const ascending = sort === 'oldest' || sort === 'lowest'
      query = query
        .order(orderCol, { ascending })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      const { data, error: err, count } = await query

      if (cancelled.current) return

      if (err) {
        setError(new Error(err.message))
        setIsLoading(false)
        return
      }

      setTransactions((data ?? []) as unknown as Transaction[])
      setTotal(count ?? 0)
      setIsLoading(false)
    }

    load()
    return () => { cancelled.current = true }
  }, [
    options.month, options.year, options.type, options.categoryId,
    sort, page, PAGE_SIZE, debouncedSearch, refreshKey,
  ])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  const create = useCallback(async (data: TransacaoFormData): Promise<Transaction> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { data: created, error: err } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        category_id: data.category_id,
        amount: data.amount,
        type: data.type,
        description: data.description,
        date: data.date,
        payment_method: data.payment_method,
        notes: data.notes ?? null,
        is_future: isDateInFuture(data.date),
        recurring_transaction_id: null,
      } as any)
      .select('id, amount, type, description, date, payment_method, notes, is_future, recurring_transaction_id, created_at, category:categories(id, name, icon, color)')
      .single()

    if (err) throw new Error(err.message)
    refresh()
    return created as unknown as Transaction
  }, [refresh])

  const update = useCallback(async (id: string, data: Partial<TransacaoFormData>): Promise<Transaction> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (data.category_id !== undefined) updatePayload.category_id = data.category_id
    if (data.amount !== undefined) updatePayload.amount = data.amount
    if (data.type !== undefined) updatePayload.type = data.type
    if (data.description !== undefined) updatePayload.description = data.description
    if (data.date !== undefined) {
      updatePayload.date = data.date
      updatePayload.is_future = isDateInFuture(data.date)
    }
    if (data.payment_method !== undefined) updatePayload.payment_method = data.payment_method
    if ('notes' in data) updatePayload.notes = data.notes ?? null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any
    const { data: updated, error: err } = await sb
      .from('transactions')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, amount, type, description, date, payment_method, notes, is_future, recurring_transaction_id, created_at, category:categories(id, name, icon, color)')
      .single()

    if (err) throw new Error(err.message)
    refresh()
    return updated as unknown as Transaction
  }, [refresh])

  const remove = useCallback(async (id: string): Promise<void> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const { error: err } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (err) throw new Error(err.message)
    refresh()
  }, [refresh])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return { transactions, total, totalPages, isLoading, error, refresh, create, update, remove }
}

// Helper — group by date for sorted-by-date views
export interface GroupedTransactions {
  date: string
  transactions: Transaction[]
  subtotal: number
}

export function groupByDate(transactions: Transaction[]): GroupedTransactions[] {
  const groups = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const key = tx.date
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }
  return Array.from(groups.entries()).map(([date, txns]) => ({
    date,
    transactions: txns,
    subtotal: txns.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
  }))
}
