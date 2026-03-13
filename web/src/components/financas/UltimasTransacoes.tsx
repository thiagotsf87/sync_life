'use client'

import { useRouter } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fmtR$, fmtDate, PAYMENT_LABELS } from '@/components/financas/helpers'

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  date: string
  payment_method: string
  category?: { name?: string; icon?: string } | null
}

interface UltimasTransacoesProps {
  transactions: Transaction[]
  loading: boolean
}

export function UltimasTransacoes({ transactions, loading }: UltimasTransacoesProps) {
  const router = useRouter()

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Últimas Transações</p>
        <button onClick={() => router.push('/financas/transacoes')} className="text-[11px] text-[#10b981] hover:underline flex items-center gap-1">
          Ver todas <ExternalLink size={9} />
        </button>
      </div>
      <div className="flex flex-col">
        {loading ? (
          <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Carregando...</p>
        ) : transactions.length === 0 ? (
          <p className="text-[12px] text-[var(--sl-t3)] text-center py-4">Nenhuma transação este mês</p>
        ) : (
          transactions.map((t) => {
            const isIncome = t.type === 'income'
            return (
              <div
                key={t.id}
                className="flex items-center gap-2.5 py-2 border-b border-[var(--sl-border)] last:border-b-0 cursor-pointer rounded-[8px] hover:bg-[var(--sl-s2)] hover:px-2 hover:-mx-2 transition-all"
              >
                <div className="w-[29px] h-[29px] rounded-[8px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--sl-s3)]">
                  {t.category?.icon ?? (isIncome ? '💰' : '📤')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[var(--sl-t1)] truncate">{t.description}</p>
                  <p className="text-[10px] text-[var(--sl-t3)]">{fmtDate(t.date)} · {PAYMENT_LABELS[t.payment_method] ?? t.payment_method}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn('font-[DM_Mono] text-[12px] font-medium', isIncome ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                    {isIncome ? '+' : ''}R$ {fmtR$(t.amount)}
                  </p>
                  <p className="text-[10px] text-[var(--sl-t3)]">{t.category?.name ?? (isIncome ? 'Receita' : 'Despesa')}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
