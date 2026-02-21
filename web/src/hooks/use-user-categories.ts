'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CustomCategory } from '@/constants/categories'

export function useUserCategories() {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([])

  const fetchCategories = useCallback(async () => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('categories')
      .select('id, name, icon, color, type')
      .eq('user_id', user.id)
      .eq('is_default', false)
      .order('created_at', { ascending: true }) as { data: CustomCategory[] | null }

    setCustomCategories(data || [])
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { customCategories, refetch: fetchCategories }
}
