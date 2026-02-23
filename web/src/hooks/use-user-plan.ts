'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserPlan {
  plan: 'free' | 'pro'
  isPro: boolean
  isFree: boolean
  isLoading: boolean
}

export function useUserPlan(): UserPlan {
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || cancelled) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
        if (!cancelled) {
          setPlan(data?.plan === 'pro' ? 'pro' : 'free')
        }
      } catch {
        // fallback to free on error (safe default)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return {
    plan,
    isPro: plan === 'pro',
    isFree: plan === 'free',
    isLoading,
  }
}
