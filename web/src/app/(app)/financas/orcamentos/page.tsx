'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Plus, ChevronLeft, ChevronRight, AlertTriangle, Pencil, Trash2, Copy, X } from 'lucide-react'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { KpiCard } from '@/components/ui/kpi-card'
import { useCategories } from '@/hooks/use-categories'
import { useBudgets, type BudgetWithSpend, type Budget } from '@/hooks/use-budgets'
import { EnvelopeModal } from '@/components/financas/EnvelopeModal'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function fmtR$(n: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function getEnvColor(pct: number): string {
  if (pct >= 100) return '#f43f5e'
  if (pct >= 80)  return '#f97316'
  if (pct >= 61)  return '#f59e0b'
  return '#10b981'
}

function getEnvelopeBadge(pct: number, alertThreshold: number): 'ok' | 'alert' | 'over' | null {
  if (pct >= 100) return 'over'
  if (pct >= alertThreshold) return 'alert'
  if (pct > 0 && pct < 60) return 'ok'
  return null
}

function daysRemainingInMonth(month: number, year: number): number {
  const now = new Date()
  const lastDay = new Date(year, month, 0).getDate()
  if (now.getMonth() + 1 !== month || now.getFullYear() !== year) {
    return month < now.getMonth() + 1 || year < now.getFullYear() ? 0 : lastDay
  }
  return lastDay - now.getDate()
}

// ─── ENVELOPE CARD ────────────────────────────────────────────────────────────

function EnvelopeCard({
  envelope, daysLeft, inactive,
  onEdit, onDelete,
}: {
  envelope: BudgetWithSpend
  daysLeft: number
  inactive?: boolean
  onEdit: (e: BudgetWithSpend) => void
  onDelete: (id: string) => void
}) {
  const badge = getEnvelopeBadge(envelope.pct, envelope.alert_threshold)
  const color = getEnvColor(envelope.pct)
  const remaining = Math.max(0, envelope.amount - envelope.gasto)

  return (
    <div className={cn(
      'bg-[var(--sl-s1)] border rounded-[14px] px-5 py-4 transition-all relative overflow-hidden group',
      envelope.pct >= 100
        ? 'border-l-[3px] border-l-[#f43f5e] border-[var(--sl-border)]'
        : envelope.pct >= 75
        ? 'border-l-[3px] border-l-[#f59e0b] border-[var(--sl-border)]'
        : 'border-[var(--sl-border)]',
      'hover:border-[var(--sl-border-h)] hover:shadow-[0_2px_12px_rgba(0,0,0,.08)]'
    )}>
      {/* Linha principal */}
      <div className="flex items-center gap-3 mb-2.5">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] shrink-0"
          style={{ background: `${color}20` }}
        >
          {envelope.category?.icon ?? '💼'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[14px] font-semibold text-[var(--sl-t1)] truncate">
              {envelope.category?.name ?? 'Categoria'}
            </span>
            {badge === 'over' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(244,63,94,.12)] text-[#f43f5e] border border-[rgba(244,63,94,.20)]">
                Estourado
              </span>
            )}
            {badge === 'alert' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(245,158,11,.12)] text-[#f59e0b] border border-[rgba(245,158,11,.20)]">
                Atenção
              </span>
            )}
            {badge === 'ok' && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(16,185,129,.10)] text-[#10b981] border border-[rgba(16,185,129,.18)]">
                OK
              </span>
            )}
            {envelope.rollover && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--sl-s2)] text-[var(--sl-t3)] border border-[var(--sl-border)]">
                Rollover
              </span>
            )}
          </div>
          <p className="font-[DM_Mono] text-[12px] text-[var(--sl-t3)]">
            <span className="text-[var(--sl-t1)] text-[13px] font-medium">R$ {fmtR$(envelope.gasto)}</span>
            {' '}/ R$ {fmtR$(envelope.amount)}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="font-[DM_Mono] text-[14px] font-bold min-w-[40px] text-right"
            style={{ color }}
          >
            {envelope.pct}%
          </span>
          {!inactive && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(envelope)}
                className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[var(--sl-t3)] hover:text-[#10b981] hover:bg-[rgba(16,185,129,.08)] transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(envelope.id)}
                className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[var(--sl-t3)] hover:text-[#f43f5e] hover:bg-[rgba(244,63,94,.08)] transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-2">
        <div className="h-[6px] bg-[var(--sl-s3)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ width: `${Math.min(envelope.pct, 100)}%`, background: color }}
          />
        </div>
      </div>

      {/* Linha de detalhe */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[var(--sl-t2)]">
          {envelope.pct >= 100
            ? <span className="text-[#f43f5e]">Estourou em R$ {fmtR$(envelope.gasto - envelope.amount)}</span>
            : <>Restam <strong className="text-[var(--sl-t1)]">R$ {fmtR$(remaining)}</strong></>
          }
        </span>
        <span className="text-[11px] text-[var(--sl-t3)]">
          {daysLeft} dias restantes
        </span>
      </div>
    </div>
  )
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function EnvelopeSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-5 py-4 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-[10px] bg-[var(--sl-s3)]" />
            <div className="flex-1">
              <div className="h-3.5 w-32 bg-[var(--sl-s3)] rounded mb-2" />
              <div className="h-3 w-24 bg-[var(--sl-s3)] rounded" />
            </div>
            <div className="h-5 w-12 bg-[var(--sl-s3)] rounded" />
          </div>
          <div className="h-1.5 bg-[var(--sl-s3)] rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ─── COPY MODAL ───────────────────────────────────────────────────────────────

function CopyModal({
  open, prevBudgets, currentMonth, currentYear,
  onClose, onConfirm,
}: {
  open: boolean
  prevBudgets: Budget[]
  currentMonth: number
  currentYear: number
  onClose: () => void
  onConfirm: (ids: string[]) => Promise<void>
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setSelected(new Set(prevBudgets.map(b => b.id)))
  }, [open, prevBudgets])

  if (!open) return null

  const prevM = currentMonth === 1 ? 12 : currentMonth - 1
  const prevY = currentMonth === 1 ? currentYear - 1 : currentYear

  function toggle(id: string) {
    setSelected(s => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm(Array.from(selected))
      onClose()
    } catch {
      /* parent toasts */
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-[440px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
          <h2 className="font-[Syne] font-extrabold text-[15px] text-[var(--sl-t1)]">
            Copiar de {MONTH_NAMES[prevM - 1]} {prevY}
          </h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="px-5 py-4 max-h-72 overflow-y-auto flex flex-col gap-2">
          {prevBudgets.map(b => (
            <label key={b.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] cursor-pointer hover:border-[var(--sl-border-h)] transition-colors">
              <input
                type="checkbox"
                checked={selected.has(b.id)}
                onChange={() => toggle(b.id)}
                className="w-4 h-4 accent-[#10b981] shrink-0"
              />
              <span className="text-lg">{b.category?.icon ?? '💼'}</span>
              <span className="flex-1 text-[13px] font-semibold text-[var(--sl-t1)]">{b.category?.name ?? 'Categoria'}</span>
              <span className="font-[DM_Mono] text-[13px] text-[var(--sl-t2)]">R$ {fmtR$(b.amount)}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button onClick={onClose}
            className="px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || selected.size === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-bold text-[#03071a] transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: '#10b981' }}
          >
            Copiar {selected.size} envelope{selected.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function OrcamentosPage() {
  const mode = useShellStore(s => s.mode)
  const isJornada = mode === 'jornada'

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpend | undefined>(undefined)
  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('orcamentos_50_30_20_dismissed')
    if (!dismissed) setShowBanner(true)
  }, [])

  const { categories } = useCategories()

  const {
    activeBudgets, inactiveBudgets, budgets,
    totalOrcado, totalGasto, naoAlocado, receitasMes, monthlyIncome,
    qtdOk, qtdAlert, qtdOver,
    isLoading, error, refresh,
    create, update, remove, copyFromPreviousMonth,
    prevMonthBudgets,
  } = useBudgets({ month, year })

  const daysLeft = daysRemainingInMonth(month, year)
  const pctGasto = totalOrcado > 0 ? Math.round((totalGasto / totalOrcado) * 100) : 0
  const qtdTotal = budgets.length

  function prevMonthNav() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonthNav() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function openCreate() { setEditingBudget(undefined); setModalOpen(true) }
  function openEdit(b: BudgetWithSpend) { setEditingBudget(b); setModalOpen(true) }

  function dismissBanner() {
    localStorage.setItem('orcamentos_50_30_20_dismissed', '1')
    setShowBanner(false)
  }

  const handleSave = useCallback(async (data: Parameters<typeof create>[0]) => {
    try {
      if (editingBudget) {
        await update(editingBudget.id, data)
        toast.success('Envelope atualizado')
      } else {
        await create(data)
        toast.success('Envelope criado')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar envelope')
      throw err
    }
  }, [editingBudget, create, update])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await remove(id)
      toast.success('Envelope excluído')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }, [remove])

  const handleCopy = useCallback(async (ids: string[]) => {
    try {
      await copyFromPreviousMonth(ids)
      toast.success('Envelopes copiados com sucesso')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao copiar envelopes')
      throw err
    }
  }, [copyFromPreviousMonth])

  const maiorCategoria = activeBudgets.length > 0 ? (activeBudgets[0].category?.name ?? '') : ''

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 pb-20">

      {/* ① Header */}
      <div className="flex items-center justify-between mb-7 gap-4 flex-wrap">
        <div>
          <p className="text-[11px] text-[#10b981] font-bold uppercase tracking-[.07em] mb-1">
            💰 Finanças
          </p>
          <h1 className={cn(
            'font-[Syne] font-extrabold text-[24px] tracking-tight',
            isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
          )}>
            Orçamentos
          </h1>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {budgets.length === 0 && prevMonthBudgets.length > 0 && (
            <button
              onClick={() => setCopyModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
            >
              <Copy size={13} />
              Copiar do mês anterior
            </button>
          )}
          <div className="flex items-center gap-1">
            <button onClick={prevMonthNav}
              className="w-8 h-8 rounded-[9px] border border-[var(--sl-border)] flex items-center justify-center text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="font-[DM_Mono] text-[13px] font-semibold text-[var(--sl-t1)] px-3 py-1.5 rounded-[9px] bg-[var(--sl-s1)] border border-[var(--sl-border)] min-w-[140px] text-center">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button onClick={nextMonthNav}
              className="w-8 h-8 rounded-[9px] border border-[var(--sl-border)] flex items-center justify-center text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 text-[#03071a] font-bold text-[13px] px-[18px] py-[9px] rounded-full border-none shadow-[0_4px_16px_rgba(16,185,129,.25)] hover:-translate-y-px hover:brightness-105 transition-all"
            style={{ background: '#10b981' }}
          >
            <Plus size={14} />
            Novo Envelope
          </button>
        </div>
      </div>

      {/* ② KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6 max-sm:grid-cols-2">
        <KpiCard label="Total Orçado" value={`R$ ${fmtR$(totalOrcado)}`} accent="#0055ff"
          delta={`${qtdTotal} envelope${qtdTotal !== 1 ? 's' : ''}`} deltaType="neutral" />
        <KpiCard label="Total Gasto" value={`R$ ${fmtR$(totalGasto)}`} accent="#f43f5e"
          delta={`${pctGasto}% do orçado`}
          deltaType={pctGasto > 85 ? 'down' : pctGasto > 60 ? 'warn' : 'neutral'} />
        <KpiCard label="Disponível" value={`R$ ${fmtR$(Math.max(0, totalOrcado - totalGasto))}`} accent="#10b981"
          delta={pctGasto < 60 ? 'Dentro do limite' : pctGasto < 85 ? 'Atenção' : 'Limite próximo'}
          deltaType={pctGasto < 60 ? 'up' : pctGasto < 85 ? 'warn' : 'down'} />
        <KpiCard label="Envelopes OK" value={`${qtdOk} / ${qtdTotal}`} accent="#10b981"
          delta={`${qtdAlert} em atenção · ${qtdOver} estourado${qtdOver !== 1 ? 's' : ''}`}
          deltaType={qtdOver > 0 ? 'down' : qtdAlert > 0 ? 'warn' : 'up'} />
      </div>

      {/* ③ Banner 50-30-20 */}
      {monthlyIncome > 0 && showBanner && (
        <div className="relative overflow-hidden flex items-start gap-3.5 rounded-[14px] px-5 py-4 mb-6"
          style={{ background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.15)' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#10b981] to-transparent" />
          <span className="text-[22px] shrink-0 mt-0.5">💡</span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[var(--sl-t1)] mb-0.5">
              Sugestão 50-30-20 baseada na sua renda
            </p>
            <p className="text-[12px] text-[var(--sl-t2)] leading-[1.55]">
              Com renda de <strong>R$ {fmtR$(monthlyIncome)}</strong>: destine{' '}
              <strong>R$ {fmtR$(monthlyIncome * 0.5)}</strong> para necessidades (50%),{' '}
              <strong>R$ {fmtR$(monthlyIncome * 0.3)}</strong> para desejos (30%) e{' '}
              <strong>R$ {fmtR$(monthlyIncome * 0.2)}</strong> para poupança (20%).
            </p>
          </div>
          <button onClick={dismissBanner}
            className="shrink-0 text-[18px] text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors p-0.5">
            ×
          </button>
        </div>
      )}

      {/* ④ Insight Jornada */}
      <JornadaInsight text={
        qtdOver > 0
          ? <><strong className="text-[#f43f5e]">{qtdOver} envelope{qtdOver > 1 ? 's' : ''} estourado{qtdOver > 1 ? 's' : ''}</strong>!{' '}
              Revise seus gastos em <strong>{maiorCategoria}</strong>.</>
          : pctGasto < 60
          ? <>Seus gastos estão em <span className="text-[#10b981]">{pctGasto}%</span> do orçamento. Ótimo controle!</>
          : <>Orçamento em <span className="text-[#f59e0b]">{pctGasto}%</span> utilizado. Atenção em <strong>{maiorCategoria}</strong>.</>
      } />

      {/* ⑤ Não Alocado */}
      {!isLoading && budgets.length > 0 && (
        <div className="flex items-center gap-3.5 bg-[var(--sl-s1)] border border-dashed rounded-[14px] px-5 py-4 mb-6"
          style={{ borderColor: naoAlocado >= 0 ? 'rgba(16,185,129,.30)' : 'rgba(244,63,94,.30)' }}>
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[20px] shrink-0"
            style={{ background: naoAlocado >= 0 ? 'rgba(16,185,129,.10)' : 'rgba(244,63,94,.10)' }}>
            {naoAlocado >= 0 ? '🟢' : '🔴'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[var(--sl-t3)] uppercase tracking-[.06em] mb-0.5">Não Alocado</p>
            <p className={cn('font-[DM_Mono] text-[20px] font-medium', naoAlocado >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
              R$ {fmtR$(Math.abs(naoAlocado))}
            </p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">
              {naoAlocado >= 0
                ? `Receitas do mês (R$ ${fmtR$(receitasMes)}) menos total orçado (R$ ${fmtR$(totalOrcado)})`
                : <span className="text-[#f43f5e]">⚠ Orçamento maior que a renda do mês</span>
              }
            </p>
          </div>
          {naoAlocado > 0 && (
            <button onClick={openCreate}
              className="text-[12px] font-semibold px-3.5 py-1.5 rounded-full border text-[#10b981] hover:bg-[rgba(16,185,129,.08)] transition-all shrink-0"
              style={{ borderColor: 'rgba(16,185,129,.25)' }}>
              + Criar envelope
            </button>
          )}
        </div>
      )}

      {/* ⑥ Conteúdo */}
      {isLoading ? (
        <EnvelopeSkeleton />
      ) : error ? (
        <div className="py-10 text-center">
          <AlertTriangle size={28} className="text-[#f43f5e] mx-auto mb-2.5" />
          <p className="text-[13px] text-[var(--sl-t2)]">
            Erro ao carregar orçamentos.{' '}
            <button onClick={refresh} className="text-[#10b981] hover:underline">Tentar novamente</button>
          </p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 bg-[var(--sl-s1)] border border-dashed border-[var(--sl-border)] rounded-[14px]">
          <span className="text-[40px] block mb-3 opacity-70">💼</span>
          <h3 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-1.5">
            Nenhum orçamento definido
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">
            Crie envelopes de gastos para controlar seu orçamento mensal.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 font-bold text-[13px] px-4 py-2 rounded-full text-[#03071a]"
            style={{ background: '#10b981' }}
          >
            <Plus size={14} />
            Criar primeiro envelope
          </button>
        </div>
      ) : (
        <>
          {activeBudgets.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t2)] uppercase tracking-[.06em]">
                  Envelopes Ativos
                </h2>
                <span className="text-[11px] text-[var(--sl-t3)] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-full px-2 py-0.5">
                  {activeBudgets.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {activeBudgets.map(e => (
                  <EnvelopeCard key={e.id} envelope={e} daysLeft={daysLeft}
                    onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
          {inactiveBudgets.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t2)] uppercase tracking-[.06em]">
                  Envelopes Inativos
                </h2>
                <span className="text-[11px] text-[var(--sl-t3)] italic">Sem gastos neste mês</span>
              </div>
              <div className="flex flex-col gap-3 opacity-45">
                {inactiveBudgets.map(e => (
                  <EnvelopeCard key={e.id} envelope={e} daysLeft={daysLeft} inactive
                    onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <EnvelopeModal
        open={modalOpen}
        mode={editingBudget ? 'edit' : 'create'}
        envelope={editingBudget}
        categories={categories}
        monthlyIncome={monthlyIncome}
        month={month}
        year={year}
        onClose={() => { setModalOpen(false); setEditingBudget(undefined) }}
        onSave={handleSave}
      />
      <CopyModal
        open={copyModalOpen}
        prevBudgets={prevMonthBudgets}
        currentMonth={month}
        currentYear={year}
        onClose={() => setCopyModalOpen(false)}
        onConfirm={handleCopy}
      />
    </div>
  )
}
