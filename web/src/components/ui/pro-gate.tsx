'use client'

import type { ModuleId } from '@/hooks/use-plan-limits'

// ─── ProGate — MVP: always renders children (no PRO gate) ───────────────────

interface ProGateProps {
  module: ModuleId
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
  inline?: boolean
  label?: string
  preview?: boolean
}

export function ProGate({ children }: ProGateProps) {
  return <>{children}</>
}

// ─── ProLimitGate — MVP: always renders children ────────────────────────────

interface ProLimitGateProps {
  module: ModuleId
  feature: string
  currentCount: number
  children: React.ReactNode
  onLimitReached?: () => void
  label?: string
}

export function ProLimitGate({ children }: ProLimitGateProps) {
  return <>{children}</>
}
