'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserAccount } from '@/hooks/use-accounts'
import { ACCOUNT_TYPE_LABELS } from '@/constants/bank-presets'

interface AccountSelectorProps {
  accounts: UserAccount[]
  selectedId: string
  onChange: (id: string) => void
  label: string
  excludeId?: string
  error?: string
  onCreateAccount?: () => void
}

export function AccountSelector({
  accounts, selectedId, onChange, label, excludeId, error, onCreateAccount,
}: AccountSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const selected = accounts.find(a => a.id === selectedId)

  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border text-[13px] text-[var(--sl-t1)] outline-none transition-colors flex items-center gap-2 text-left',
          error
            ? 'border-[#DB6478]'
            : selectedId
              ? 'border-[#0B2D34]'
              : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
          open && !error && 'border-[#0B2D34]'
        )}
      >
        {selected ? (
          <>
            <span className="text-base shrink-0">{selected.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="font-medium truncate block">{selected.name}</span>
              <span className="text-[10px] text-[var(--sl-t3)]">{ACCOUNT_TYPE_LABELS[selected.type] ?? selected.type}</span>
            </div>
          </>
        ) : (
          <span className="flex-1 text-[var(--sl-t3)]">Selecione uma conta</span>
        )}
        <ChevronDown size={14} className={cn('text-[var(--sl-t3)] shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute z-[70] top-full left-0 right-0 mt-1 py-1 rounded-[10px] max-h-[220px] overflow-y-auto"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
        >
          {accounts.length === 0 ? (
            <p className="px-3.5 py-2.5 text-[12px] text-[var(--sl-t3)]">Nenhuma conta cadastrada</p>
          ) : (
            accounts.map(acc => {
              const isExcluded = acc.id === excludeId
              const isSelected = acc.id === selectedId
              return (
                <button
                  key={acc.id}
                  type="button"
                  disabled={isExcluded}
                  onClick={() => { onChange(acc.id); setOpen(false) }}
                  className={cn(
                    'w-full px-3.5 py-2.5 text-left text-[13px] flex items-center gap-2.5 transition-colors',
                    isExcluded && 'opacity-40 cursor-not-allowed',
                    isSelected
                      ? 'bg-[rgba(0,85,255,.12)] text-[#0B2D34] font-semibold'
                      : 'text-[var(--sl-t1)] hover:bg-[var(--sl-s2)]'
                  )}
                >
                  <span className="text-base shrink-0">{acc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="block truncate font-medium">{acc.name}</span>
                    <span className="text-[10px] text-[var(--sl-t3)]">{ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}</span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: acc.color }} />
                </button>
              )
            })
          )}

          {/* Divider + Nova conta */}
          {onCreateAccount && (
            <>
              <div className="h-px bg-[var(--sl-border)] mx-2 my-1" />
              <button
                type="button"
                onClick={() => { onCreateAccount(); setOpen(false) }}
                className="w-full px-3.5 py-2.5 text-left text-[13px] flex items-center gap-2 text-[#0B2D34] hover:bg-[var(--sl-s2)] transition-colors"
              >
                <Plus size={14} />
                <span className="font-medium">Nova conta</span>
              </button>
            </>
          )}
        </div>
      )}

      {error && <p className="text-[11px] text-[#DB6478]">{error}</p>}
    </div>
  )
}
