'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
  is_default: boolean
  sort_order: number
}

interface UseCategoriesReturn {
  categories: Category[]
  isLoading: boolean
  error: Error | null
}

// Module-level cache to avoid repeated fetches during session
let cachedCategories: Category[] | null = null

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>(cachedCategories ?? [])
  const [isLoading, setIsLoading] = useState(cachedCategories === null)
  const [error, setError] = useState<Error | null>(null)
  const cancelled = useRef(false)

  useEffect(() => {
    if (cachedCategories !== null) return

    cancelled.current = false
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled.current) return

      const { data, error: err } = await supabase
        .from('categories')
        .select('id, name, icon, color, type, is_default, sort_order')
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order('sort_order', { ascending: true })

      if (cancelled.current) return

      if (err) {
        setError(new Error(err.message))
      } else {
        const cats = (data ?? []) as Category[]
        cachedCategories = cats
        setCategories(cats)
      }
      setIsLoading(false)
    }

    load()
    return () => { cancelled.current = true }
  }, [])

  return { categories, isLoading, error }
}
