'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserAccount {
  id: string
  user_id: string
  name: string
  bank: string
  type: 'checking' | 'savings' | 'investment' | 'wallet'
  icon: string
  color: string
  is_active: boolean
  sort_order: number
}

export type CreateAccountData = Pick<UserAccount, 'name' | 'bank' | 'type' | 'icon' | 'color'>
export type UpdateAccountData = Partial<CreateAccountData>

interface UseAccountsReturn {
  accounts: UserAccount[]
  isLoading: boolean
  error: Error | null
  createAccount: (data: CreateAccountData) => Promise<UserAccount>
  updateAccount: (id: string, data: UpdateAccountData) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  refetch: () => void
}

let cachedAccounts: UserAccount[] | null = null

export function invalidateAccountsCache() {
  cachedAccounts = null
}

export function useAccounts(): UseAccountsReturn {
  const [accounts, setAccounts] = useState<UserAccount[]>(cachedAccounts ?? [])
  const [isLoading, setIsLoading] = useState(cachedAccounts === null)
  const [error, setError] = useState<Error | null>(null)
  const cancelled = useRef(false)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    if (cachedAccounts !== null && fetchKey === 0) return

    cancelled.current = false
    setIsLoading(true)
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled.current) return

      const { data, error: err } = await (supabase as any)
        .from('user_accounts')
        .select('id, user_id, name, bank, type, icon, color, is_active, sort_order')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (cancelled.current) return

      if (err) {
        setError(new Error(err.message))
      } else {
        const accs = (data ?? []) as UserAccount[]
        cachedAccounts = accs
        setAccounts(accs)
      }
      setIsLoading(false)
    }

    load()
    return () => { cancelled.current = true }
  }, [fetchKey])

  const refetch = useCallback(() => {
    cachedAccounts = null
    setFetchKey(k => k + 1)
  }, [])

  const createAccount = useCallback(async (data: CreateAccountData): Promise<UserAccount> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const nextOrder = accounts.length
    const { data: created, error: err } = await (supabase as any)
      .from('user_accounts')
      .insert({
        user_id: user.id,
        name: data.name,
        bank: data.bank,
        type: data.type,
        icon: data.icon,
        color: data.color,
        sort_order: nextOrder,
      })
      .select('id, user_id, name, bank, type, icon, color, is_active, sort_order')
      .single()

    if (err) throw new Error(err.message)

    const account = created as UserAccount
    cachedAccounts = null
    refetch()
    return account
  }, [accounts.length, refetch])

  const updateAccount = useCallback(async (id: string, data: UpdateAccountData): Promise<void> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    const payload: Record<string, unknown> = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.bank !== undefined) payload.bank = data.bank
    if (data.type !== undefined) payload.type = data.type
    if (data.icon !== undefined) payload.icon = data.icon
    if (data.color !== undefined) payload.color = data.color

    const { error: err } = await (supabase as any)
      .from('user_accounts')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id)

    if (err) throw new Error(err.message)

    cachedAccounts = null
    refetch()
  }, [refetch])

  const deleteAccount = useCallback(async (id: string): Promise<void> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')

    // Soft delete
    const { error: err } = await (supabase as any)
      .from('user_accounts')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', user.id)

    if (err) throw new Error(err.message)

    cachedAccounts = null
    refetch()
  }, [refetch])

  return { accounts, isLoading, error, createAccount, updateAccount, deleteAccount, refetch }
}
