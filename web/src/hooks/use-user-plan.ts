'use client'

interface UserPlan {
  plan: 'free' | 'pro'
  isPro: boolean
  isFree: boolean
  isLoading: boolean
}

/** MVP: all features unlocked — no PRO gate */
export function useUserPlan(): UserPlan {
  return {
    plan: 'pro',
    isPro: true,
    isFree: false,
    isLoading: false,
  }
}
