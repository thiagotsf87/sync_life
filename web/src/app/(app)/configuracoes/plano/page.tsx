'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, X, Crown, ExternalLink } from 'lucide-react'
import { useUserPlan } from '@/hooks/use-user-plan'
import { PLAN_LIMITS } from '@/lib/plan-limits'

const FREE_FEATURES = [
  { text: 'Transações: até 200/mês', included: true },
  { text: 'Orçamentos por envelope', included: true },
  { text: `Objetivos: até ${PLAN_LIMITS.free.active_objectives} ativos`, included: true },
  { text: `Trilhas de estudo: até ${PLAN_LIMITS.free.active_study_tracks}`, included: true },
  { text: `Ativos na carteira: até ${PLAN_LIMITS.free.portfolio_assets}`, included: true },
  { text: 'Google Calendar', included: false },
  { text: 'Open Finance (bancos)', included: false },
  { text: 'WhatsApp Bot', included: false },
  { text: 'Exportação automática', included: false },
]

const PRO_FEATURES = [
  { text: 'Transações: ilimitadas' },
  { text: 'Orçamentos por envelope' },
  { text: 'Objetivos: ilimitados' },
  { text: 'Trilhas de estudo: ilimitadas' },
  { text: 'Ativos na carteira: ilimitados' },
  { text: 'Google Calendar (bidirecional)' },
  { text: 'Open Finance — 5 contas' },
  { text: 'WhatsApp Bot' },
  { text: 'Exportação automática mensal' },
]

const USAGE = [
  { label: 'Objetivos ativos', limitKey: 'active_objectives' as const },
  { label: 'Trilhas de estudo ativas', limitKey: 'active_study_tracks' as const },
  { label: 'Ativos na carteira', limitKey: 'portfolio_assets' as const },
  { label: 'Viagens ativas', limitKey: 'active_trips' as const },
]

function getBarColor(pct: number): string {
  if (pct > 90) return '#f43f5e'
  if (pct > 75) return '#f59e0b'
  return '#10b981'
}

function getValueColor(pct: number): string {
  if (pct > 90) return '#f43f5e'
  if (pct > 75) return '#f59e0b'
  return 'var(--sl-t2)'
}

export default function PlanoPage() {
  const { plan, isPro, isFree, isLoading, subscriptionStatus, trialEndsAt, refetch } = useUserPlan()
  const searchParams = useSearchParams()
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null)

  // Handle redirect params
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setToast({ type: 'success', message: 'Assinatura ativada com sucesso!' })
      refetch()
      // Clean URL
      window.history.replaceState({}, '', '/configuracoes/plano')
    } else if (searchParams.get('canceled') === 'true') {
      setToast({ type: 'info', message: 'Checkout cancelado. Você pode tentar novamente quando quiser.' })
      window.history.replaceState({}, '', '/configuracoes/plano')
    }
  }, [searchParams, refetch])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  async function handleCheckout(selectedInterval: 'monthly' | 'yearly') {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval: selectedInterval }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setToast({ type: 'info', message: data.error ?? 'Erro ao iniciar checkout' })
        setCheckoutLoading(false)
      }
    } catch {
      setToast({ type: 'info', message: 'Erro de conexão. Tente novamente.' })
      setCheckoutLoading(false)
    }
  }

  async function handlePortal() {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setToast({ type: 'info', message: 'Erro ao abrir portal de assinatura.' })
    }
  }

  const isTrialing = subscriptionStatus === 'trialing'

  return (
    <div className="max-w-[680px]">
      <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)] mb-1">Meu Plano</h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-6">
        Gerencie sua assinatura e veja os limites do seu plano atual.
      </p>

      {/* Toast */}
      {toast && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-[13px] font-medium border"
          style={{
            background: toast.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
            borderColor: toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.3)',
            color: toast.type === 'success' ? '#10b981' : '#3b82f6',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Trial info */}
      {isPro && isTrialing && trialEndsAt && (
        <div className="mb-4 px-4 py-3 rounded-xl text-[13px] font-medium border bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.25)] text-[#f59e0b]">
          <Crown size={14} className="inline mr-1.5 -mt-0.5" />
          Período de teste gratuito — expira em{' '}
          {new Date(trialEndsAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )}

      {/* Interval toggle (only for FREE) */}
      {isFree && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => setInterval('monthly')}
            className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-colors"
            style={{
              background: interval === 'monthly' ? 'rgba(16,185,129,0.15)' : 'transparent',
              color: interval === 'monthly' ? '#10b981' : 'var(--sl-t3)',
            }}
          >
            Mensal
          </button>
          <button
            onClick={() => setInterval('yearly')}
            className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-colors"
            style={{
              background: interval === 'yearly' ? 'rgba(16,185,129,0.15)' : 'transparent',
              color: interval === 'yearly' ? '#10b981' : 'var(--sl-t3)',
            }}
          >
            Anual
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.15)] text-[#10b981]">
              -25%
            </span>
          </button>
        </div>
      )}

      {/* Plan grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
        {/* FREE card */}
        <div className="bg-[var(--sl-s1)] border-2 border-[var(--sl-border)] rounded-[18px] p-5">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-md bg-[var(--sl-s3)] text-[var(--sl-t3)] mb-3">
            Free
          </span>
          <div className="mb-3">
            <p className="font-[Syne] font-extrabold text-3xl text-[var(--sl-t1)] leading-none">
              <sup className="text-base font-semibold align-super">R$</sup>0
              <sub className="text-[13px] font-normal text-[var(--sl-t3)] align-baseline">/mês</sub>
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] mt-1">Para sempre gratuito</p>
          </div>
          <div className="flex flex-col gap-2 mb-5">
            {FREE_FEATURES.map(({ text, included }) => (
              <div key={text} className="flex items-start gap-2 text-[12px]">
                {included ? (
                  <Check size={13} className="text-[#10b981] shrink-0 mt-0.5" />
                ) : (
                  <X size={13} className="text-[var(--sl-t3)] shrink-0 mt-0.5" />
                )}
                <span
                  className={included ? 'text-[var(--sl-t1)]' : 'text-[var(--sl-t3)] line-through'}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
          <button
            disabled
            className="w-full py-2.5 rounded-[10px] bg-[var(--sl-s3)] text-[var(--sl-t3)] text-[13px] font-bold cursor-default"
          >
            {isFree ? 'Plano atual' : 'Plano Free'}
          </button>
        </div>

        {/* PRO card */}
        <div
          className="bg-[var(--sl-s1)] border-2 rounded-[18px] p-5 relative"
          style={{
            borderColor: '#10b981',
            boxShadow: '0 0 0 1px rgba(16,185,129,0.2), 0 8px 32px rgba(16,185,129,0.12)',
          }}
        >
          <div className="absolute top-3.5 right-3.5 text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-md bg-[rgba(16,185,129,0.15)] text-[#10b981]">
            Mais popular
          </div>
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-md mb-3 text-white"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(0,85,255,0.3))' }}
          >
            Pro
          </span>
          <div className="mb-3">
            <p className="font-[Syne] font-extrabold text-3xl text-[var(--sl-t1)] leading-none">
              <sup className="text-base font-semibold align-super">R$</sup>
              {interval === 'yearly' ? '14' : '19'}
              <span className="text-xl">,{interval === 'yearly' ? '90' : '90'}</span>
              <sub className="text-[13px] font-normal text-[var(--sl-t3)] align-baseline">/mês</sub>
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] mt-1">
              {interval === 'yearly' ? 'R$ 179/ano (economize 25%)' : 'ou R$ 179/ano (25% off)'}
            </p>
          </div>
          <div className="flex flex-col gap-2 mb-5">
            {PRO_FEATURES.map(({ text }) => (
              <div key={text} className="flex items-start gap-2 text-[12px]">
                <Check size={13} className="text-[#10b981] shrink-0 mt-0.5" />
                <span className="text-[var(--sl-t1)]">{text}</span>
              </div>
            ))}
          </div>

          {isPro ? (
            <div className="flex flex-col gap-2">
              <button
                disabled
                className="w-full py-2.5 rounded-[10px] bg-[var(--sl-s3)] text-[var(--sl-t1)] text-[13px] font-bold cursor-default"
              >
                Plano atual
              </button>
              <button
                onClick={handlePortal}
                className="w-full py-2 rounded-[10px] text-[12px] font-medium text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={12} />
                Gerenciar assinatura
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => handleCheckout(interval)}
                disabled={checkoutLoading || isLoading}
                className="w-full py-2.5 rounded-[10px] text-white text-[13px] font-bold transition-all hover:brightness-110 hover:-translate-y-px disabled:opacity-60 disabled:cursor-wait"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #0055ff)',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.25)',
                }}
              >
                {checkoutLoading ? 'Redirecionando...' : 'Fazer upgrade para Pro'}
              </button>
              <p className="text-[11px] text-[var(--sl-t3)] text-center mt-2">
                7 dias grátis, cancele quando quiser
              </p>
            </>
          )}
        </div>
      </div>

      {/* Usage card (FREE users only) */}
      {isFree && (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 transition-colors hover:border-[var(--sl-border-h)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-4">
            Limites do plano Free
          </p>
          <div className="flex flex-col gap-4">
            {USAGE.map(({ label, limitKey }) => {
              const limit = PLAN_LIMITS.free[limitKey]
              // Usage is placeholder — real counts come from each module's hook
              const used = 0
              const pct = limit > 0 ? Math.round((used / limit) * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[12px] text-[var(--sl-t2)]">{label}</span>
                    <span
                      className="text-[12px] font-[DM_Mono] font-medium"
                      style={{ color: getValueColor(pct) }}
                    >
                      {used} / {limit}
                    </span>
                  </div>
                  <div className="h-[5px] bg-[var(--sl-s3)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: getBarColor(pct),
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
