'use client'

import Link from 'next/link'
import { Crown } from 'lucide-react'
import { usePlanLimits, type ModuleId } from '@/hooks/use-plan-limits'

// ─── ProGate — 3 modes: preview (blur), inline (badge), default (card) ──────

interface ProGateProps {
  module: ModuleId
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
  inline?: boolean
  label?: string
  preview?: boolean
}

export function ProGate({
  module,
  feature,
  children,
  fallback,
  inline = false,
  label,
  preview = false,
}: ProGateProps) {
  const { canUse, loading } = usePlanLimits()

  if (loading) return <>{children}</>
  if (canUse(module, feature)) return <>{children}</>
  if (fallback) return <>{fallback}</>

  // Mode 1: preview — children with blur overlay
  if (preview) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--sl-bg)]/60 backdrop-blur-sm rounded-2xl">
          <Crown size={28} className="text-[#f59e0b]" />
          <p className="font-[Syne] font-bold text-sm text-[var(--sl-t1)]">
            {label ?? 'Recurso exclusivo PRO'}
          </p>
          <Link
            href="/configuracoes/plano"
            className="px-5 py-2 rounded-xl text-white text-[13px] font-bold transition-all hover:brightness-110 hover:-translate-y-px"
            style={{
              background: 'linear-gradient(135deg, #10b981, #0055ff)',
              boxShadow: '0 4px 20px rgba(16,185,129,0.25)',
            }}
          >
            Fazer upgrade para Pro
          </Link>
        </div>
      </div>
    )
  }

  // Mode 2: inline — compact badge
  if (inline) {
    return (
      <Link
        href="/configuracoes/plano"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors hover:bg-[var(--sl-s3)]"
        style={{ color: '#f59e0b' }}
      >
        <Crown size={12} />
        {label ?? 'Exclusivo PRO'}
      </Link>
    )
  }

  // Mode 3: default — card block
  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(245,158,11,0.12)' }}
      >
        <Crown size={22} className="text-[#f59e0b]" />
      </div>
      <div>
        <p className="font-[Syne] font-bold text-base text-[var(--sl-t1)] mb-1">
          {label ?? 'Recurso exclusivo PRO'}
        </p>
        <p className="text-[13px] text-[var(--sl-t3)] max-w-[340px]">
          Faça upgrade para o plano Pro e desbloqueie todos os recursos sem limites.
        </p>
      </div>
      <Link
        href="/configuracoes/plano"
        className="px-6 py-2.5 rounded-xl text-white text-[13px] font-bold transition-all hover:brightness-110 hover:-translate-y-px"
        style={{
          background: 'linear-gradient(135deg, #10b981, #0055ff)',
          boxShadow: '0 4px 20px rgba(16,185,129,0.25)',
        }}
      >
        Fazer upgrade para Pro
      </Link>
    </div>
  )
}

// ─── ProLimitGate — countable limits ────────────────────────────────────────

interface ProLimitGateProps {
  module: ModuleId
  feature: string
  currentCount: number
  children: React.ReactNode
  onLimitReached?: () => void
  label?: string
}

export function ProLimitGate({
  module,
  feature,
  currentCount,
  children,
  onLimitReached,
  label,
}: ProLimitGateProps) {
  const { withinLimit, limit: getMaxLimit, isPro, loading } = usePlanLimits()

  if (loading) return <>{children}</>
  if (isPro) return <>{children}</>
  if (withinLimit(module, feature, currentCount)) return <>{children}</>

  // Limit reached
  const maxLimit = getMaxLimit(module, feature)

  if (onLimitReached) {
    onLimitReached()
  }

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
      <Crown size={24} className="text-[#f59e0b]" />
      <div>
        <p className="font-[Syne] font-bold text-sm text-[var(--sl-t1)] mb-1">
          {label ?? 'Limite atingido'}
        </p>
        <p className="text-[13px] text-[var(--sl-t3)]">
          <span className="font-[DM_Mono] font-medium text-[var(--sl-t2)]">
            {currentCount}/{maxLimit === Infinity ? '∞' : maxLimit}
          </span>
          {' '}— Faça upgrade para Pro e tenha acesso ilimitado.
        </p>
      </div>
      <Link
        href="/configuracoes/plano"
        className="px-5 py-2 rounded-xl text-white text-[13px] font-bold transition-all hover:brightness-110 hover:-translate-y-px"
        style={{
          background: 'linear-gradient(135deg, #10b981, #0055ff)',
          boxShadow: '0 4px 20px rgba(16,185,129,0.25)',
        }}
      >
        Fazer upgrade para Pro
      </Link>
    </div>
  )
}
