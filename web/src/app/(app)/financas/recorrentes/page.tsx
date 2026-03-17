'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  Repeat, Plus, Calendar, Clock, Pencil, Pause, Play, Trash2, AlertTriangle, MoreVertical,
} from 'lucide-react'
import { ModuleHeader } from '@/components/ui/module-header'
import { toast } from 'sonner'
import { useUserPlan } from '@/hooks/use-user-plan'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { KpiCard } from '@/components/ui/kpi-card'
import { SLCard } from '@/components/ui/sl-card'
import { useCategories } from '@/hooks/use-categories'
import {
  useRecorrentes, calcNextOccurrence, normalizeToMonthly,
  type RecurrenteWithCategory, type Frequency,
} from '@/hooks/use-recorrentes'
import { RecorrenteModal } from '@/components/financas/RecorrenteModal'
import { FinancasMobileShell } from '@/components/financas/FinancasMobileShell'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const FREE_PLAN_LIMIT = 5

const FREQ_LABELS: Record<Frequency, string> = {
  weekly:    'Semanal',
  biweekly:  'Quinzenal',
  monthly:   'Mensal',
  quarterly: 'Trimestral',
  annual:    'Anual',
}

const FREQ_SECTION_LABELS: Record<Frequency, string> = {
  weekly:    'Semanais',
  biweekly:  'Quinzenais',
  monthly:   'Mensais',
  quarterly: 'Trimestrais',
  annual:    'Anuais',
}

const FREQUENCY_GROUPS: Frequency[] = ['monthly', 'biweekly', 'weekly', 'quarterly', 'annual']

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmtR$(n: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function getDayOfMonthLabel(rec: RecurrenteWithCategory): string {
  if (rec.frequency === 'weekly') return 'Toda semana'
  if (rec.frequency === 'biweekly') return 'A cada 15 dias'
  if (rec.day_of_month) return `Todo dia ${rec.day_of_month}`
  return FREQ_LABELS[rec.frequency]
}

function formatMonthYear(dateStr: string): string {
  const [y, m] = dateStr.split('-')
  const date = new Date(Number(y), Number(m) - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function RecorrenteSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[11px] bg-[var(--sl-s3)]" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-48 bg-[var(--sl-s3)] rounded" />
              <div className="h-3 w-32 bg-[var(--sl-s3)] rounded" />
            </div>
            <div className="h-5 w-24 bg-[var(--sl-s3)] rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── DELETE MODAL ─────────────────────────────────────────────────────────────

function DeleteRecorrenteModal({
  open, rec, onClose, onConfirm,
}: {
  open: boolean
  rec: RecurrenteWithCategory | null
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  if (!open || !rec) return null

  async function handleConfirm() {
    setLoading(true)
    try { await onConfirm(); onClose() }
    catch { /* parent toasts */ }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-[420px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl shadow-2xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--sl-t2)] mb-1.5">Atenção</p>
        <h2 className="font-[Syne] text-[20px] font-extrabold text-[var(--sl-t1)] mb-2">Excluir recorrente</h2>
        <p className="text-[13px] text-[var(--sl-t2)] mb-5 leading-relaxed">
          Escolha o que deseja fazer com <strong>&ldquo;{rec.name}&rdquo;</strong>:
        </p>
        <div
          className="flex items-start gap-3 p-[14px] border-[1.5px] border-[var(--sl-border)] rounded-xl cursor-pointer bg-[var(--sl-s2)] hover:border-[rgba(244,63,94,0.35)] hover:bg-[rgba(244,63,94,0.04)] transition-all mb-4"
          onClick={handleConfirm}
        >
          <span className="text-[22px] shrink-0 mt-0.5">🗑️</span>
          <div>
            <div className="text-[13px] font-semibold text-[var(--sl-t1)] mb-0.5">
              Excluir toda a série{loading ? ' …' : ''}
            </div>
            <div className="text-[12px] text-[var(--sl-t2)] leading-relaxed">
              Remove esta recorrente e impede novos lançamentos futuros. Lançamentos já registrados não são excluídos.
            </div>
          </div>
        </div>
        <button onClick={onClose}
          className="w-full py-2.5 rounded-[10px] border border-[var(--sl-border)] text-[13px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ─── RECORRENTE CARD ──────────────────────────────────────────────────────────

function RecorrenteCard({
  rec, onEdit, onPause, onDelete,
}: {
  rec: RecurrenteWithCategory
  onEdit: (rec: RecurrenteWithCategory) => void
  onPause: (id: string, isPaused: boolean) => Promise<void>
  onDelete: (rec: RecurrenteWithCategory) => void
}) {
  const isPaused = rec.is_paused
  const nextOcc = isPaused ? null : calcNextOccurrence(rec)
  const isIncome = rec.type === 'income'

  return (
    <div className={cn(
      'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl px-[18px] py-4 transition-colors hover:border-[var(--sl-border-h)] relative sl-fade-up',
      isPaused && 'opacity-55'
    )}>
      <div className="flex items-center gap-3">
        {/* Ícone */}
        <div className={cn(
          'w-10 h-10 rounded-[11px] flex items-center justify-center text-xl shrink-0',
          isIncome ? 'bg-[rgba(16,185,129,0.12)]' : 'bg-[rgba(244,63,94,0.1)]'
        )}>
          {rec.categories?.icon ?? (isIncome ? '💰' : '📤')}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={cn(
              'text-[14px] font-semibold text-[var(--sl-t1)] truncate',
              isPaused && 'line-through opacity-70'
            )}>
              {rec.name}
            </span>
            <span className={cn(
              'text-[10px] font-bold px-[7px] py-[2px] rounded-full shrink-0',
              isIncome
                ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981] border border-[rgba(16,185,129,0.2)]'
                : 'bg-[rgba(244,63,94,0.1)] text-[#f43f5e] border border-[rgba(244,63,94,0.2)]'
            )}>
              {isIncome ? 'Receita' : 'Despesa'}
            </span>
            {isPaused && (
              <span className="text-[10px] font-bold px-[7px] py-[2px] rounded-full bg-[rgba(110,144,184,0.1)] text-[var(--sl-t2)] border border-[rgba(110,144,184,0.2)] shrink-0">
                Pausada
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-[12px] text-[var(--sl-t3)]">
              <Calendar size={12} />
              {getDayOfMonthLabel(rec)}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-[var(--sl-t3)]">
              <Clock size={12} />
              Desde {formatMonthYear(rec.start_date)}
            </span>
            {rec.categories?.name && (
              <span className="text-[12px] text-[var(--sl-t3)]">
                {rec.categories.icon} {rec.categories.name}
              </span>
            )}
          </div>
        </div>

        {/* Valor + Ações */}
        <div className="flex items-center gap-3 shrink-0">
          <span className={cn(
            'font-[DM_Mono] text-[16px] font-medium whitespace-nowrap',
            isPaused && 'opacity-50',
            isIncome ? 'text-[#10b981]' : 'text-[#f43f5e]'
          )}>
            {isIncome ? '+ ' : '− '}R$ {fmtR$(rec.amount)}
          </span>

          {/* Desktop actions */}
          <div className="hidden sm:flex gap-1">
            <button onClick={() => onEdit(rec)}
              className="flex items-center gap-1 border border-[var(--sl-border)] rounded-lg px-2.5 py-1 text-[11px] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all">
              <Pencil size={12} />
              Editar
            </button>
            <button onClick={() => onPause(rec.id, rec.is_paused)}
              className={cn(
                'flex items-center gap-1 border rounded-lg px-2.5 py-1 text-[11px] transition-all',
                isPaused
                  ? 'border-[rgba(16,185,129,0.3)] text-[#10b981] hover:bg-[rgba(16,185,129,0.06)]'
                  : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[rgba(245,158,11,0.4)] hover:text-[#f59e0b]'
              )}>
              {isPaused ? <Play size={12} /> : <Pause size={12} />}
              {isPaused ? 'Retomar' : 'Pausar'}
            </button>
            <button onClick={() => onDelete(rec)}
              className="flex items-center gap-1 border border-[var(--sl-border)] rounded-lg px-2.5 py-1 text-[11px] text-[var(--sl-t3)] hover:border-[rgba(244,63,94,0.4)] hover:text-[#f43f5e] transition-all">
              <Trash2 size={12} />
              Excluir
            </button>
          </div>

          {/* Mobile kebab */}
          <button className="sm:hidden border border-[var(--sl-border)] rounded-lg p-1.5 text-[var(--sl-t3)]">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      {/* Rodapé */}
      <div className={cn(
        'flex items-center justify-between mt-3 pt-3 border-t border-[var(--sl-border)]',
        isPaused && 'opacity-50'
      )}>
        <span className="text-[11px] text-[var(--sl-t3)]">
          {isPaused ? 'Pausada — não vai gerar lançamentos' : 'Próximo lançamento'}
        </span>
        {!isPaused && nextOcc && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[var(--sl-t2)] font-medium font-[DM_Mono]">
              {String(nextOcc.day).padStart(2, '0')}/{nextOcc.monthShort}
            </span>
            <span className={cn('text-[11px]', nextOcc.daysLeft <= 7 ? 'text-[#f59e0b]' : 'text-[var(--sl-t3)]')}>
              em {nextOcc.daysLeft} dia{nextOcc.daysLeft !== 1 ? 's' : ''}{nextOcc.daysLeft <= 7 ? ' ⚠' : ''}
            </span>
          </div>
        )}
        {isPaused && <span className="text-[12px] text-[var(--sl-t2)]">Retomar para reativar</span>}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function RecorrentesPage() {
  const { isFree } = useUserPlan()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingRec, setEditingRec] = useState<RecurrenteWithCategory | undefined>(undefined)
  const [deletingRec, setDeletingRec] = useState<RecurrenteWithCategory | null>(null)

  const { categories } = useCategories()
  const {
    recorrentes, upcomingOccurrences, grouped, loading, error,
    activeCount, totalExpenseMonthly, totalIncomeMonthly, netMonthly, totalExpenseAnnual,
    createRecorrente, updateRecorrente, togglePause, deleteRecorrente, refresh,
  } = useRecorrentes()

  const canCreate = isFree ? activeCount < FREE_PLAN_LIMIT : true

  function openCreate() {
    if (!canCreate) { toast.error('Limite de 5 recorrentes atingido. Assine o PRO para criar mais.'); return }
    setEditingRec(undefined)
    setModalOpen(true)
  }
  function openEdit(rec: RecurrenteWithCategory) { setEditingRec(rec); setModalOpen(true) }

  const handleSave = useCallback(async (data: Parameters<typeof createRecorrente>[0]) => {
    try {
      if (editingRec) {
        await updateRecorrente(editingRec.id, data)
        toast.success('Recorrente atualizada')
      } else {
        await createRecorrente(data)
        toast.success('Recorrente criada')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    }
  }, [editingRec, createRecorrente, updateRecorrente])

  const handlePause = useCallback(async (id: string, isPaused: boolean) => {
    try {
      await togglePause(id, isPaused)
      toast.success(isPaused ? 'Recorrente retomada' : 'Recorrente pausada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar status')
    }
  }, [togglePause])

  const handleDelete = useCallback(async () => {
    if (!deletingRec) return
    try {
      await deleteRecorrente(deletingRec.id)
      toast.success('Recorrente excluída')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
      throw err
    }
  }, [deletingRec, deleteRecorrente])

  // Insight data
  const nextOcc = upcomingOccurrences[0]
  const expensePct = Math.round((totalExpenseMonthly / 3000) * 100) // placeholder — sem renda no hook ainda

  // Mobile helpers
  const incomeRecs = recorrentes.filter(r => r.type === 'income' && !r.is_paused)
  const expenseRecs = recorrentes.filter(r => r.type === 'expense' && !r.is_paused)

  return (
    <>
      {/* ═══════════ MOBILE VIEW ═══════════ */}
      <FinancasMobileShell
        subtitle="Despesas e receitas fixas"
        rightAction={
          <button
            onClick={openCreate}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]"
          >
            <Plus size={16} />
          </button>
        }
      >
        {/* KPI cards — 3 columns */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-[10px] p-2.5" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="text-[9px] text-[var(--sl-t2)] uppercase font-semibold mb-1">Rec. Receitas</div>
            <div className="font-[DM_Mono] text-[15px] font-bold text-[#10b981] leading-none">R$ {fmtR$(totalIncomeMonthly)}</div>
          </div>
          <div className="rounded-[10px] p-2.5" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
            <div className="text-[9px] text-[var(--sl-t2)] uppercase font-semibold mb-1">Rec. Despesas</div>
            <div className="font-[DM_Mono] text-[15px] font-bold text-[#f43f5e] leading-none">R$ {fmtR$(totalExpenseMonthly)}</div>
          </div>
          <div className="rounded-[10px] p-2.5 bg-[var(--sl-s1)] border border-[var(--sl-border)]">
            <div className="text-[9px] text-[var(--sl-t2)] uppercase font-semibold mb-1">% Comprom.</div>
            <div className="font-[DM_Mono] text-[15px] font-bold leading-none" style={{ color: expensePct >= 60 ? '#f59e0b' : '#10b981' }}>{expensePct}%</div>
          </div>
        </div>

        {/* AI Insight — both modes */}
        {!loading && recorrentes.length > 0 && (
          <div className="rounded-2xl p-3 mb-3 flex gap-2.5 items-start"
            style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <span className="text-[16px]">✨</span>
            <div className="text-[12px] text-[var(--sl-t2)] leading-[1.5]">
              {expensePct}% da renda comprometida com recorrentes
              {expensePct < 50 ? ' — isso é saudável.' : expensePct < 70 ? ' — fique de olho.' : ' — considere reduzir despesas fixas.'}
              {nextOcc && (
                <> Próximo: <strong className="text-[var(--sl-t1)]">{nextOcc.name}</strong> dia {nextOcc.day}.</>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <RecorrenteSkeleton />
        ) : error ? (
          <div className="rounded-xl p-4 text-[13px] text-[#f43f5e]" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)' }}>
            Erro ao carregar.{' '}<button onClick={refresh} className="underline">Tentar novamente</button>
          </div>
        ) : recorrentes.length === 0 ? (
          <div className="text-center py-10 px-4 bg-[var(--sl-s1)] border border-dashed border-[var(--sl-border)] rounded-2xl">
            <span className="text-[36px] block mb-2 opacity-70">🔄</span>
            <h3 className="font-[Syne] text-[15px] font-bold text-[var(--sl-t1)] mb-1">Nenhuma recorrente</h3>
            <p className="text-[12px] text-[var(--sl-t2)] mb-3">Cadastre despesas fixas e receitas regulares.</p>
            <button onClick={openCreate} className="inline-flex items-center gap-1.5 font-bold text-[12px] px-4 py-2 rounded-full text-[#03071a]" style={{ background: '#10b981' }}>
              <Plus size={13} /> Criar primeira
            </button>
          </div>
        ) : (
          <>
            {/* Receitas section */}
            {incomeRecs.length > 0 && (
              <>
                <div className="font-[Syne] text-[13px] font-semibold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-1 pb-2 mt-3">Receitas</div>
                <div className="bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
                  {incomeRecs.map(rec => {
                    const next = calcNextOccurrence(rec)
                    return (
                      <div key={rec.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--sl-border)] last:border-b-0">
                        <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0" style={{ background: 'rgba(16,185,129,0.15)' }}>
                          {rec.categories?.icon ?? '💼'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-medium text-[var(--sl-t1)] truncate">{rec.name}</div>
                          <div className="text-[12px] text-[var(--sl-t2)]">{getDayOfMonthLabel(rec)} · {FREQ_LABELS[rec.frequency]}</div>
                          {next && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 text-[10px] px-[7px] py-[2px] rounded-[10px]" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}>
                                🔄 Próximo: {next.day} {next.monthShort}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-[DM_Mono] text-[14px] font-medium text-[#10b981]">+R$ {fmtR$(rec.amount)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Despesas section */}
            {expenseRecs.length > 0 && (
              <>
                <div className="font-[Syne] text-[13px] font-semibold text-[var(--sl-t2)] uppercase tracking-[0.5px] px-1 pb-2 mt-4">Despesas Fixas</div>
                <div className="bg-[var(--sl-s1)] border-t border-b border-[var(--sl-border)]">
                  {expenseRecs.map(rec => {
                    const next = calcNextOccurrence(rec)
                    return (
                      <div key={rec.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--sl-border)] last:border-b-0">
                        <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] shrink-0" style={{ background: 'rgba(244,63,94,0.1)' }}>
                          {rec.categories?.icon ?? '📤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-medium text-[var(--sl-t1)] truncate">{rec.name}</div>
                          <div className="text-[12px] text-[var(--sl-t2)]">{getDayOfMonthLabel(rec)} · {FREQ_LABELS[rec.frequency]}</div>
                          {next && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 text-[10px] px-[7px] py-[2px] rounded-[10px]" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}>
                                🔄 Próximo: {next.day} {next.monthShort}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-[DM_Mono] text-[14px] font-medium text-[#f43f5e]">-R$ {fmtR$(rec.amount)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
        )}
        </>
        )}
        <div className="h-5" />
      </FinancasMobileShell>

      {/* ═══════════ DESKTOP VIEW ═══════════ */}
      <div className="hidden lg:block max-w-[1100px] mx-auto px-6 py-7 pb-16">

        {/* ① Topbar */}
        <ModuleHeader
          icon={Repeat}
          iconBg="rgba(16,185,129,.08)"
          iconColor="#10b981"
          title="Recorrentes"
          subtitle="Despesas e receitas que acontecem automaticamente todo período."
          className="mb-6"
        >
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 font-bold text-[13px] px-5 py-2.5 rounded-full border-none cursor-pointer shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition-all shrink-0 text-[#03071a]"
            style={{ background: '#10b981' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Nova recorrente
          </button>
        </ModuleHeader>

        {/* ② FREE Banner */}
        {isFree && activeCount >= 4 && (
          <div className="flex items-center gap-3 rounded-xl px-[18px] py-[14px] mb-5"
            style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <span className="text-xl shrink-0">⭐</span>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-[var(--sl-t1)] mb-0.5">
                Você está usando {activeCount} de {FREE_PLAN_LIMIT} recorrentes do plano Free
              </div>
              <div className="text-[12px] text-[var(--sl-t2)]">
                Assine o PRO para criar recorrentes ilimitadas e nunca perder um lançamento.
              </div>
            </div>
            <button className="text-[12px] font-bold px-[14px] py-[6px] rounded-full cursor-pointer hover:bg-[rgba(139,92,246,0.25)] transition-all whitespace-nowrap"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>
              Ver PRO
            </button>
          </div>
        )}

        {/* ③ KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <KpiCard label="Saída mensal"
            value={`− R$ ${fmtR$(totalExpenseMonthly)}`}
            delta={`${recorrentes.filter(r => r.type === 'expense' && !r.is_paused).length} despesas ativas`}
            accent="#f43f5e" deltaType="down" />
          <KpiCard label="Entrada mensal"
            value={`+ R$ ${fmtR$(totalIncomeMonthly)}`}
            delta={`${recorrentes.filter(r => r.type === 'income' && !r.is_paused).length} receitas ativas`}
            accent="#10b981" deltaType="up" />
          <KpiCard label="Impacto líquido"
            value={`${netMonthly >= 0 ? '+ ' : '− '}R$ ${fmtR$(Math.abs(netMonthly))}`}
            delta="por mês"
            accent={netMonthly >= 0 ? '#10b981' : '#f43f5e'}
            deltaType={netMonthly >= 0 ? 'up' : 'down'} />
          <KpiCard label="Custo anual"
            value={`R$ ${fmtR$(totalExpenseAnnual)}`}
            delta="só em despesas fixas"
            accent="#f59e0b" deltaType="warn" />
        </div>

        {/* ④ Insight Jornada */}
        <JornadaInsight text={
          <>
            Suas despesas recorrentes representam{' '}
            <strong>{expensePct}% da sua renda mensal</strong>
            {expensePct <= 20 ? ' — isso é saudável.' : expensePct <= 35 ? ' — atenção ao orçamento.' : ' — acima do recomendado.'}
            {nextOcc && (
              <> O próximo lançamento é <strong>{nextOcc.name} dia {nextOcc.day}</strong>, em {nextOcc.daysLeft} dia{nextOcc.daysLeft !== 1 ? 's' : ''}.</>
            )}
          </>
        } />

        {/* ⑤ Próximas ocorrências */}
        {upcomingOccurrences.length > 0 && (
          <SLCard className="mb-7">
            <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.06em] mb-4">
              📅 Próximas ocorrências — 30 dias
            </p>
            <div className="flex flex-col divide-y divide-[var(--sl-border)]">
              {upcomingOccurrences.map(occ => (
                <div key={occ.id} className="flex items-center gap-3 py-[9px]">
                  <div className="w-11 shrink-0 text-center">
                    <div className="font-[DM_Mono] text-[18px] font-bold text-[var(--sl-t1)] leading-none">
                      {String(occ.day).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] text-[var(--sl-t3)] uppercase tracking-[0.05em]">
                      {occ.monthShort}
                    </div>
                  </div>
                  <span className="text-[18px] shrink-0">{occ.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[var(--sl-t1)] truncate">{occ.name}</div>
                    <div className="text-[11px] text-[var(--sl-t3)]">{FREQ_LABELS[occ.frequency]}</div>
                  </div>
                  <span className={cn(
                    'font-[DM_Mono] text-[13px] font-medium whitespace-nowrap',
                    occ.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]'
                  )}>
                    {occ.type === 'income' ? '+ ' : '− '}R$ {fmtR$(occ.amount)}
                  </span>
                </div>
              ))}
            </div>
          </SLCard>
        )}

        {/* ⑥ Conteúdo */}
        {loading ? (
          <RecorrenteSkeleton />
        ) : error ? (
          <div className="rounded-xl p-4 text-[13px] text-[#f43f5e]"
            style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)' }}>
            Erro ao carregar recorrentes.{' '}
            <button onClick={refresh} className="underline">Tentar novamente</button>
          </div>
        ) : recorrentes.length === 0 ? (
          <div className="text-center py-12 px-6 bg-[var(--sl-s1)] border border-dashed border-[var(--sl-border)] rounded-2xl">
            <span className="text-[40px] block mb-3 opacity-70">🔄</span>
            <h3 className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)] mb-1.5">
              Nenhuma recorrente cadastrada
            </h3>
            <p className="text-[13px] text-[var(--sl-t2)] mb-4">
              Cadastre suas despesas fixas e receitas regulares para nunca perder um lançamento.
            </p>
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 font-bold text-[13px] px-5 py-2.5 rounded-full text-[#03071a]"
              style={{ background: '#10b981' }}>
              <Plus size={14} />
              Criar primeira recorrente
            </button>
          </div>
        ) : (
          FREQUENCY_GROUPS.map(freq => {
            const items = grouped[freq]
            if (!items || items.length === 0) return null
            const totalMonthly = items
              .filter(r => r.is_active && !r.is_paused)
              .reduce((sum, r) => sum + normalizeToMonthly(r.amount, r.frequency), 0)
            const ativasCount = items.filter(r => r.is_active && !r.is_paused).length

            return (
              <section key={freq} className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-[Syne] text-[13px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.06em]">
                      {FREQ_SECTION_LABELS[freq]}
                    </span>
                    <span className="text-[11px] text-[var(--sl-t3)] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-full px-2 py-0.5">
                      {ativasCount} ativas
                    </span>
                  </div>
                  {totalMonthly > 0 && (
                    <span className="font-[DM_Mono] text-[13px] text-[var(--sl-t2)]">
                      − R$ {fmtR$(totalMonthly)} / mês
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {items.map(rec => (
                    <RecorrenteCard
                      key={rec.id}
                      rec={rec}
                      onEdit={openEdit}
                      onPause={handlePause}
                      onDelete={r => setDeletingRec(r)}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </div>

      {/* Modals (shared) */}
      <RecorrenteModal
        open={modalOpen}
        mode={editingRec ? 'edit' : 'create'}
        recorrente={editingRec}
        categories={categories}
        onClose={() => { setModalOpen(false); setEditingRec(undefined) }}
        onSave={handleSave}
      />
      <DeleteRecorrenteModal
        open={deletingRec !== null}
        rec={deletingRec}
        onClose={() => setDeletingRec(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
