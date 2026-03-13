'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type PlanType = 'free' | 'pro'
type SubscriptionStatus = 'none' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'

interface UserPlan {
  plan: PlanType
  isPro: boolean
  isFree: boolean
  isLoading: boolean
  subscriptionStatus?: SubscriptionStatus
  trialEndsAt?: string | null
  currentPeriodEnd?: string | null
  refetch: () => void
}

export function useUserPlan(): UserPlan {
  const [plan, setPlan] = useState<PlanType>('free')
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('none')
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchPlan = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setPlan('free')
        setIsLoading(false)
        return
      }

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('plan_type, subscription_status, trial_ends_at, current_period_end')
        .eq('id', user.id)
        .single()

      if (profile) {
        const planType = (profile.plan_type === 'pro' ? 'pro' : 'free') as PlanType
        setPlan(planType)
        setSubscriptionStatus((profile.subscription_status ?? 'none') as SubscriptionStatus)
        setTrialEndsAt(profile.trial_ends_at ?? null)
        setCurrentPeriodEnd(profile.current_period_end ?? null)
      }
    } catch {
      setPlan('free')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  return {
    plan,
    isPro: plan === 'pro',
    isFree: plan === 'free',
    isLoading,
    subscriptionStatus,
    trialEndsAt,
    currentPeriodEnd,
    refetch: fetchPlan,
  }
}
