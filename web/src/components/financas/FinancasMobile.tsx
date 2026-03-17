'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AIInsightCard } from '@/components/ui/ai-insight-card'
import { FinancasMobileShell } from '@/components/financas/FinancasMobileShell'

function fmtR$(n: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n))
}

function fmtDate(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parts[2]}/${parts[1]}`
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX', credit: 'Crédito', debit: 'Débito',
  cash: 'Dinheiro', transfer: 'Transf.', boleto: 'Boleto',
}

function getEnvColor(pct: number): string {
  if (pct >= 100) return '#f43f5e'
  if (pct >= 80) return '#f97316'
  if (pct >= 61) return '#f59e0b'
  return '#10b981'
}

interface BudgetItem {
  id: string
  category?: { name?: string; icon?: string } | null
  amount: number
  gasto: number
  pct: number
}

interface TxItem {
  id: string
  amount: number
  type: 'income' | 'expense'
  description: string
  date: string
  payment_method: string
  category?: { name?: string; icon?: string } | null
}

interface FinancasMobileProps {
  totalIncome: number
  totalExpense: number
  balance: number
  budgets: BudgetItem[]
  projectedBalance: number
  mesLabel: string
  latestTransactions?: TxItem[]
}

export function FinancasMobile({
  totalIncome,
  totalExpense,
  balance,
  budgets,
  projectedBalance,
  mesLabel,
  latestTransactions = [],
}: FinancasMobileProps) {
  const router = useRouter()

  const balanceDelta = useMemo(() => {
    const diff = balance - (totalIncome * 0.6)
    return diff >= 0 ? `+R$ ${fmtR$(Math.abs(diff))}` : `-R$ ${fmtR$(Math.abs(diff))}`
  }, [balance, totalIncome])

  return (
    <FinancasMobileShell subtitle={mesLabel}>
      <div className="px-4">
      {/* Balance hero card — Jornada: gradient bg, Foco: plain card */}
      <div className="mb-3 rounded-[16px] p-5 border bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(0,85,255,0.08))] border-[rgba(16,185,129,0.2)]">
        <p className="text-[12px] text-[var(--sl-t2)] mb-1">Saldo disponível</p>
        <p className="font-[DM_Mono] text-[36px] font-medium text-[var(--sl-t1)] tracking-[-1px] leading-none">
          R$ {fmtR$(balance)}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[20px] text-[11px] font-medium
                            bg-[rgba(16,185,129,0.12)] text-[#10b981]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              </svg>
              {balanceDelta} vs mês passado
            </span>
          </div>
      </div>

      {/* Income / Expense stats — both modes */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3.5">
          <p className="text-[10px] text-[var(--sl-t2)] mb-1">Receitas</p>
          <p className="font-[DM_Mono] text-[20px] font-medium text-[#10b981]">R$ {fmtR$(totalIncome)}</p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-0.5">↑ Salário + Freela</p>
        </div>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3.5">
          <p className="text-[10px] text-[var(--sl-t2)] mb-1">Despesas</p>
          <p className="font-[DM_Mono] text-[20px] font-medium text-[#f43f5e]">R$ {fmtR$(totalExpense)}</p>
          <p className="text-[11px] text-[var(--sl-t2)] mt-0.5">→ {totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0}% da renda</p>
        </div>
      </div>

      {/* AI Insight */}
      <div className="mb-3">
        <AIInsightCard label="Projeção">
          Mantendo este ritmo, você termina o mês com <strong>R$ {fmtR$(projectedBalance)}</strong>
          {projectedBalance > balance
            ? ' — acima do mês passado.'
            : ' — fique atento aos gastos.'}
        </AIInsightCard>
      </div>

      {/* Budget envelopes — both modes */}
      <p className="px-1 pb-2 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
        Orçamentos do mês
      </p>
      {budgets.slice(0, 5).map((b) => {
        const color = getEnvColor(b.pct)
        return (
          <div
            key={b.id}
            className="mb-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] px-3.5 py-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-[var(--sl-t1)] flex items-center gap-1.5">
                {b.category?.icon ?? '📦'} {b.category?.name ?? 'Categoria'}
              </span>
              <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t2)]">
                R$ {fmtR$(b.gasto)} / R$ {fmtR$(b.amount)}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-[var(--sl-s3)]">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${Math.min(b.pct, 100)}%`, background: color }}
              />
            </div>
          </div>
        )
      })}

      {/* See all budgets */}
      <div className="pt-1 pb-3">
        <button
          onClick={() => router.push('/financas/orcamentos')}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[20px]
                     bg-[var(--sl-s2)] border border-[var(--sl-border-h)] text-[var(--sl-t1)]
                     text-[13px] font-medium transition-colors active:bg-[var(--sl-s3)]"
        >
          Ver todos os orçamentos
        </button>
      </div>

      {/* ── Últimas Transações ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 pb-2 pt-1">
        <p className="font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
          Últimas Transações
        </p>
        <button
          onClick={() => router.push('/financas/transacoes')}
          className="text-[11px] text-[#10b981] font-medium"
        >
          Ver todas →
        </button>
      </div>

      {latestTransactions.length === 0 ? (
        <div className="mb-6 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[12px] px-4 py-6 text-center">
          <p className="text-[13px] text-[var(--sl-t3)]">Nenhuma transação este mês</p>
          <p className="text-[11px] text-[var(--sl-t3)] mt-1">Toque no + para registrar</p>
        </div>
      ) : (
        <div className="mb-6 bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
          {latestTransactions.map((t, idx) => {
            const isIncome = t.type === 'income'
            const isLast = idx === latestTransactions.length - 1
            return (
              <div
                key={t.id}
                className={`flex items-center gap-3 px-4 py-3 active:bg-[var(--sl-s2)] transition-colors ${!isLast ? 'border-b border-[var(--sl-border)]' : ''}`}
              >
                <div
                  className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0"
                  style={{ background: isIncome ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.1)' }}
                >
                  {t.category?.icon ?? (isIncome ? '💰' : '📤')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[var(--sl-t1)] truncate">{t.description}</p>
                  <p className="text-[11px] text-[var(--sl-t3)]">
                    {fmtDate(t.date)} · {PAYMENT_LABELS[t.payment_method] ?? t.payment_method}
                  </p>
                </div>
                <p
                  className="font-[DM_Mono] text-[14px] font-medium shrink-0"
                  style={{ color: isIncome ? '#10b981' : '#f43f5e' }}
                >
                  {isIncome ? '+' : '−'}R$ {fmtR$(t.amount)}
                </p>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </FinancasMobileShell>
  )
}
