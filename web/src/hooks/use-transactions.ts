'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'
import type { Category } from './use-categories'
import { syncFinanceCategoryToFuturo } from '@/lib/integrations/futuro'
import { updateStreak } from '@/hooks/use-panorama'
import { addXP } from '@/hooks/use-xp'

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

// ─── Standalone fetch function (used by useQuery) ──────────────────────────────

interface FetchResult {
  transactions: Transaction[]
  total: number
}

async function fetchTransactions(
  options: UseTransactionsOptions,
  debouncedSearch: string,
): Promise<FetchResult> {
  const PAGE_SIZE = options.pageSize ?? 30
  const page = options.page ?? 1
  const sort = options.sort ?? 'newest'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { transactions: [], total: 0 }

  const monthStr = String(options.month).padStart(2, '0')
  const startDate = `${options.year}-${monthStr}-01`
  const endDate = new Date(options.year, options.month, 0).toISOString().split('T')[0]

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

  if (err) throw new Error(err.message)

  return {
    transactions: (data ?? []) as unknown as Transaction[],
    total: count ?? 0,
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useTransactions(options: UseTransactionsOptions): UseTransactionsReturn {
  const PAGE_SIZE = options.pageSize ?? 30
  const queryClient = useQueryClient()

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(options.search ?? '')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(options.search ?? ''), 300)
    return () => clearTimeout(timer)
  }, [options.search])

  const queryKey = queryKeys.transactions.list({
    month: options.month,
    year: options.year,
    type: options.type,
    search: debouncedSearch,
    categoryId: options.categoryId,
    sort: options.sort,
    page: options.page,
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchTransactions(options, debouncedSearch),
  })

  const transactions = data?.transactions ?? []
  const total = data?.total ?? 0

  const refresh = useCallback(() => { refetch() }, [refetch])

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (formData: TransacaoFormData): Promise<Transaction> => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { data: created, error: err } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          category_id: formData.category_id,
          amount: formData.amount,
          type: formData.type,
          description: formData.description,
          date: formData.date,
          payment_method: formData.payment_method,
          notes: formData.notes ?? null,
          is_future: isDateInFuture(formData.date),
          recurring_transaction_id: null,
        } as any)
        .select('id, amount, type, description, date, payment_method, notes, is_future, recurring_transaction_id, created_at, category:categories(id, name, icon, color)')
        .single()

      if (err) throw new Error(err.message)
      await syncFinanceCategoryToFuturo(user.id, formData.category_id)
      updateStreak(user.id).catch(() => {})
      addXP(user.id, 'transaction_created').catch(() => {})
      return created as unknown as Transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: formData }: { id: string; data: Partial<TransacaoFormData> }): Promise<Transaction> => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (formData.category_id !== undefined) updatePayload.category_id = formData.category_id
      if (formData.amount !== undefined) updatePayload.amount = formData.amount
      if (formData.type !== undefined) updatePayload.type = formData.type
      if (formData.description !== undefined) updatePayload.description = formData.description
      if (formData.date !== undefined) {
        updatePayload.date = formData.date
        updatePayload.is_future = isDateInFuture(formData.date)
      }
      if (formData.payment_method !== undefined) updatePayload.payment_method = formData.payment_method
      if ('notes' in formData) updatePayload.notes = formData.notes ?? null

      const sb = supabase as any
      const { data: updated, error: err } = await sb
        .from('transactions')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, amount, type, description, date, payment_method, notes, is_future, recurring_transaction_id, created_at, category:categories(id, name, icon, color)')
        .single()

      if (err) throw new Error(err.message)
      const affectedCategory = (updated as unknown as { category?: { id: string } | null })?.category?.id
        ?? formData.category_id
      if (affectedCategory) {
        await syncFinanceCategoryToFuturo(user.id, affectedCategory)
      }
      return updated as unknown as Transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { data: existing } = await (supabase as any)
        .from('transactions')
        .select('category_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      const { error: err } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (err) throw new Error(err.message)
      if (existing?.category_id) {
        await syncFinanceCategoryToFuturo(user.id, existing.category_id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
    },
  })

  const create = useCallback(
    (data: TransacaoFormData) => createMutation.mutateAsync(data),
    [createMutation],
  )

  const update = useCallback(
    (id: string, data: Partial<TransacaoFormData>) => updateMutation.mutateAsync({ id, data }),
    [updateMutation],
  )

  const remove = useCallback(
    (id: string) => removeMutation.mutateAsync(id),
    [removeMutation],
  )

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return { transactions, total, totalPages, isLoading, error: error as Error | null, refresh, create, update, remove }
}

// Helper — group by date for sorted-by-date views
export interface GroupedTransactions {
  date: string
  transactions: Transaction[]
  subtotal: number
  runningBalance: number
}

export function groupByDate(transactions: Transaction[]): GroupedTransactions[] {
  const groups = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const key = tx.date
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }

  // Build groups with daily subtotal
  const result = Array.from(groups.entries()).map(([date, txns]) => ({
    date,
    transactions: txns,
    subtotal: txns.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
    runningBalance: 0,
  }))

  // Sort by date ascending to compute running balance correctly
  result.sort((a, b) => a.date.localeCompare(b.date))
  let cumulative = 0
  for (const group of result) {
    cumulative += group.subtotal
    group.runningBalance = cumulative
  }

  // Re-sort by date descending (newest first, matching default display)
  result.sort((a, b) => b.date.localeCompare(a.date))
  return result
}
