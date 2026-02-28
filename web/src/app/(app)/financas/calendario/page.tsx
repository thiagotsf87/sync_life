'use client'

import { Fragment, useState } from 'react'
import { ChevronLeft, ChevronRight, X, Plus, Info } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { useCategories } from '@/hooks/use-categories'
import { useCalendario, type CalendarDayData, type CalendarTransaction } from '@/hooks/use-calendario'
import { SLCard } from '@/components/ui/sl-card'
import { TransacaoModal } from '@/components/financas/TransacaoModal'
import { PlanningEventModal } from '@/components/financas/PlanningEventModal'
import { usePlanejamento, type EventFormData } from '@/hooks/use-planejamento'
import { useTransactions, type TransacaoFormData } from '@/hooks/use-transactions'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmtR = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })

const fmtRShort = (v: number) => {
  const abs = Math.abs(v)
  const prefix = v < 0 ? '-' : '+'
  if (abs >= 1000) return `${prefix}${(abs / 1000).toFixed(1)}k`
  return `${prefix}R$${Math.round(abs)}`
}

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const DOT_COLORS: Record<string, string> = {
  income:     '#10b981',
  expense:    '#f43f5e',
  recorrente: '#60a5fa',
  planned:    '#a855f7',
}

const DAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// ─── CALENDAR DAY ─────────────────────────────────────────────────────────────

function CalendarDay({
  day,
  isSelected,
  onClick,
}: {
  day: CalendarDayData
  isSelected: boolean
  onClick: () => void
}) {
  const visibleDots = day.transactions.slice(0, 3)
  const overflow = day.transactions.length - 3

  return (
    <div
      onClick={onClick}
      className={cn(
        'border-r border-b border-[var(--sl-border)] p-1.5 min-h-[88px] max-md:min-h-[70px] flex flex-col gap-0.5 relative',
        'transition-colors',
        !day.isCurrentMonth ? 'opacity-35 cursor-default' : 'cursor-pointer',
        day.isCurrentMonth && 'hover:bg-[var(--sl-s3)]',
        isSelected && 'bg-[var(--sl-s3)] ring-1 ring-inset ring-[#10b981] z-[2]',
        day.isToday && !isSelected && 'bg-[rgba(16,185,129,0.05)]',
        !day.isFuture && day.balance > 0 && !isSelected && !day.isToday && 'bg-[rgba(16,185,129,0.03)]',
      )}
    >
      {/* Today top bar */}
      {day.isToday && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#10b981] to-[#0055ff]" />
      )}

      {/* Future tag */}
      {day.isFuture && day.isCurrentMonth && day.transactions.length > 0 && (
        <span className="absolute top-[5px] right-[5px] text-[8px] font-bold px-1 py-px rounded-[3px] bg-[rgba(96,165,250,0.1)] text-[#60a5fa] whitespace-nowrap hidden max-md:hidden sm:block">
          futuro
        </span>
      )}

      {/* Day number + balance */}
      <div className="flex items-start justify-between mb-0.5">
        <span className={cn(
          'text-[12px] max-md:text-[11px] font-semibold leading-none',
          day.isToday
            ? 'text-[#10b981] bg-[rgba(16,185,129,0.15)] rounded-full w-[22px] h-[22px] flex items-center justify-center'
            : 'text-[var(--sl-t2)]'
        )}>
          {day.day}
        </span>
        {day.isCurrentMonth && day.balance !== 0 && (
          <span className={cn(
            'font-[DM_Mono] text-[9px] font-medium leading-none max-md:hidden',
            day.balance > 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
          )}>
            {fmtRShort(day.balance)}
          </span>
        )}
      </div>

      {/* Dots */}
      {visibleDots.length > 0 && (
        <div className="flex gap-0.5 flex-wrap mt-0.5">
          {visibleDots.map((t, i) => (
            <span key={i} className="w-[7px] h-[7px] rounded-full shrink-0"
              style={{ background: DOT_COLORS[t.dotType] }} />
          ))}
          {overflow > 0 && (
            <span className="text-[9px] text-[var(--sl-t3)] opacity-70">+{overflow}</span>
          )}
        </div>
      )}

      {/* Transaction count */}
      {day.isCurrentMonth && day.transactions.length > 0 && (
        <span className="text-[9px] text-[var(--sl-t3)] mt-auto opacity-70 max-md:hidden">
          {day.transactions.length} trans.
        </span>
      )}
    </div>
  )
}

// ─── DRAWER SECTION ───────────────────────────────────────────────────────────

function DrawerSection({
  title,
  items,
}: {
  title: string
  items: CalendarTransaction[]
}) {
  if (items.length === 0) return null
  return (
    <div className="mb-[18px]">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mb-2">
        {title}
        <span className="flex-1 h-px bg-[var(--sl-border)]" />
      </div>
      {items.map(txn => (
        <div key={txn.id}
          className="flex items-center gap-2.5 p-2.5 px-[10px] rounded-[10px] border border-[var(--sl-border)] bg-[var(--sl-s2)] mb-1.5 hover:border-[var(--sl-border-h)] transition-colors">
          <div className={cn(
            'w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[14px] shrink-0',
            txn.type === 'income' ? 'bg-[rgba(16,185,129,0.12)]' : 'bg-[rgba(244,63,94,0.1)]'
          )}>
            {txn.icon ?? (txn.type === 'income' ? '💰' : '📤')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[var(--sl-t1)] truncate">{txn.description}</p>
            <p className="text-[10px] text-[var(--sl-t3)]">{txn.categoryName ?? '—'}</p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className={cn(
              'font-[DM_Mono] text-[13px] font-medium',
              txn.is_future ? 'text-[#60a5fa]' : txn.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]'
            )}>
              {txn.type === 'income' ? '+' : '−'}{fmtR(txn.amount)}
            </span>
            {txn.is_future && (
              <span className="text-[8px] font-bold px-1.5 py-px rounded-[3px] bg-[rgba(96,165,250,0.12)] text-[#60a5fa] mt-0.5">
                previsto
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden animate-pulse">
      <div className="grid grid-cols-7 border-b border-[var(--sl-border)] bg-[var(--sl-s2)]">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="py-2 px-1 h-8" />
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="border-r border-b border-[var(--sl-border)] min-h-[88px] p-2">
            <div className="h-3 w-5 bg-[var(--sl-s3)] rounded mb-1.5" />
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--sl-s3)]" />
              <div className="w-2 h-2 rounded-full bg-[var(--sl-s3)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function CalendarioFinanceiroPage() {
  const mode = useShellStore(s => s.mode)
  const isJornada = mode === 'jornada'
  const { categories } = useCategories()

  const {
    currentDate, setCurrentDate,
    calendarDays, weekBalances, monthStats, currentBalance,
    loading, error,
    prevMonth, nextMonth, refresh,
  } = useCalendario()

  const now = new Date()
  const { createEvent } = usePlanejamento()
  const { create: createTransacao } = useTransactions({ month: now.getMonth() + 1, year: now.getFullYear() })

  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null)
  const [fabOpen, setFabOpen] = useState(false)

  // Add transaction modal
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalDate, setAddModalDate] = useState<string | undefined>()

  // Add planning event modal
  const [planModalOpen, setPlanModalOpen] = useState(false)

  // ── Computed ──────────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0]

  const selectedWeekIndex = (() => {
    const idx = calendarDays.findIndex(d => d.dateString === (selectedDay?.dateString ?? todayStr))
    return idx >= 0 ? Math.floor(idx / 7) : 0
  })()

  const weekDays = calendarDays.slice(selectedWeekIndex * 7, (selectedWeekIndex + 1) * 7).filter(d => d.isCurrentMonth)

  const weekRecipes  = weekDays.reduce((s, d) => s + d.transactions.filter(t => t.type === 'income'  && !t.is_future).reduce((a, t) => a + t.amount, 0), 0)
  const weekExpenses = weekDays.reduce((s, d) => s + d.transactions.filter(t => t.type === 'expense' && !t.is_future).reduce((a, t) => a + t.amount, 0), 0)
  const weekBalance  = weekRecipes - weekExpenses
  const weekPending  = weekDays.reduce((s, d) => s + d.transactions.filter(t => t.is_future).length, 0)

  // Drawer day stats
  const dayTransactions = selectedDay?.transactions ?? []
  const dayRecipes  = dayTransactions.filter(t => t.type === 'income'  && !t.is_future).reduce((s, t) => s + t.amount, 0)
  const dayExpenses = dayTransactions.filter(t => t.type === 'expense' && !t.is_future).reduce((s, t) => s + t.amount, 0)
  const dayBalance  = dayRecipes - dayExpenses

  const cumulativeBalance = selectedDay
    ? currentBalance + calendarDays
        .filter(d => d.isCurrentMonth && d.date <= selectedDay.date)
        .reduce((sum, d) => sum + d.balance, 0)
    : 0

  // Month projected balance (for Jornada card)
  const monthProjectedBalance = currentBalance + calendarDays
    .filter(d => d.isCurrentMonth)
    .reduce((sum, d) => sum + d.balance + d.transactions.filter(t => t.is_future).reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0), 0)

  // ── Handlers ──────────────────────────────────────────────────────────────
  function openAddModal(date?: string | null) {
    setAddModalDate(date ?? undefined)
    setAddModalOpen(true)
    setFabOpen(false)
  }

  async function handleAddTransaction(data: TransacaoFormData) {
    try {
      await createTransacao(data)
      toast.success('Transação adicionada!')
      refresh()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar'
      toast.error(msg)
      throw e
    }
  }

  async function handleAddEvent(data: EventFormData) {
    try {
      await createEvent(data)
      toast.success('Evento criado!')
      refresh()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar'
      toast.error(msg)
      throw e
    }
  }

  const formatDayFull = (date: Date) =>
    date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Page Header */}
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#10b981] mb-0.5">
            <span className="w-[5px] h-[5px] rounded-full bg-[#10b981]" />
            Finanças
          </div>
          <h1 className={cn(
            'font-[Syne] font-extrabold text-[22px] tracking-tight',
            isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
          )}>
            📅 Calendário Financeiro
          </h1>
          <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">Visualize e planeje suas finanças dia a dia.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Month navigation */}
          <div className="flex border border-[var(--sl-border)] rounded-[9px] overflow-hidden bg-[var(--sl-s1)]">
            <button onClick={prevMonth}
              className="px-2.5 py-1.5 bg-transparent cursor-pointer text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)] transition-all flex items-center">
              <ChevronLeft size={16} />
            </button>
            <span className="px-3.5 py-1.5 text-[12px] font-semibold text-[var(--sl-t1)] border-x border-[var(--sl-border)] min-w-[120px] text-center">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth}
              className="px-2.5 py-1.5 bg-transparent cursor-pointer text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)] transition-all flex items-center">
              <ChevronRight size={16} />
            </button>
          </div>
          <button onClick={() => setCurrentDate(new Date())}
            className="px-3.5 py-1.5 rounded-[9px] border border-[var(--sl-border)] bg-[var(--sl-s1)] text-[var(--sl-t2)] text-[12px] cursor-pointer hover:border-[#10b981] hover:text-[#10b981] transition-all">
            Hoje
          </button>
          <button onClick={() => openAddModal(null)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] bg-[#10b981] text-white text-[12px] font-bold cursor-pointer hover:opacity-85 transition-opacity">
            <Plus size={13} />
            Adicionar
          </button>
        </div>
      </div>

      {/* ② Jornada Projection Card */}
      <div className="hidden [.jornada_&]:flex items-center gap-3 p-[11px] px-[14px] rounded-[11px] border border-[rgba(16,185,129,0.2)] bg-gradient-to-br from-[rgba(16,185,129,0.07)] to-[rgba(0,85,255,0.05)] mb-4">
        <span className="text-[22px] shrink-0">📊</span>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[var(--sl-t1)] mb-0.5">Projeção do mês</p>
          <p className="font-[DM_Mono] text-[18px] font-medium text-[#10b981] leading-none">
            {fmtR(monthProjectedBalance)}
          </p>
          <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">saldo projetado no final do mês</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.2)] text-[10px] font-bold text-[#10b981] shrink-0 whitespace-nowrap">
          {monthStats.pendingCount} pendente{monthStats.pendingCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ③ Legend strip */}
      <div className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] mb-4 flex-wrap">
        {[
          { type: 'income',     label: 'Receita',    color: '#10b981' },
          { type: 'expense',    label: 'Despesa',    color: '#f43f5e' },
          { type: 'recorrente', label: 'Recorrente', color: '#60a5fa' },
          { type: 'planned',    label: 'Planejado',  color: '#a855f7' },
        ].map(l => (
          <span key={l.type} className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t2)]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
        <span className="flex-1" />
        <span className="text-[10px] text-[var(--sl-t3)] italic max-sm:hidden">Clique em um dia para ver detalhes</span>
      </div>

      {/* ④ Week Summary */}
      <div className="grid grid-cols-4 gap-2.5 mb-4 max-sm:grid-cols-2">
        {[
          { label: 'Receitas semana',  value: fmtR(weekRecipes),  color: '#10b981' },
          { label: 'Despesas semana',  value: fmtR(weekExpenses), color: '#f43f5e' },
          { label: 'Saldo semana',     value: fmtR(weekBalance),  color: weekBalance >= 0 ? '#10b981' : '#f43f5e' },
          { label: 'Pendentes',        value: String(weekPending), color: '#60a5fa', delta: `${weekPending} futuros` },
        ].map(c => (
          <div key={c.label} className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 overflow-hidden transition-colors hover:border-[var(--sl-border-h)] sl-fade-up">
            <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: c.color }} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">{c.label}</p>
            <p className="font-[DM_Mono] font-medium text-xl leading-none" style={{ color: c.color }}>{c.value}</p>
            {c.delta && <p className="text-[11px] mt-1 text-[var(--sl-t3)]">{c.delta}</p>}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[rgba(244,63,94,0.06)] border border-[rgba(244,63,94,0.2)] rounded-xl p-4 text-[13px] text-[#f43f5e] mb-4">
          Erro ao carregar calendário.{' '}
          <button onClick={refresh} className="underline">Tentar novamente</button>
        </div>
      )}

      {/* ⑤ Calendar + Drawer wrapper */}
      <div className="relative overflow-hidden">

        {/* ── Calendar Grid ── */}
        {loading ? (
          <CalendarSkeleton />
        ) : (
          <SLCard className="p-0 overflow-hidden mb-4 sl-fade-up">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[var(--sl-border)] bg-[var(--sl-s2)]">
              {DAY_HEADERS.map((d, i) => (
                <div key={d} className={cn(
                  'py-2 px-1 text-center text-[10px] font-bold uppercase tracking-[0.07em]',
                  i === 0 ? 'text-[#f43f5e] opacity-70' : 'text-[var(--sl-t3)]'
                )}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <Fragment key={day.dateString}>
                  <CalendarDay
                    day={day}
                    isSelected={selectedDay?.dateString === day.dateString}
                    onClick={() => {
                      if (!day.isCurrentMonth) return
                      setSelectedDay(prev => prev?.dateString === day.dateString ? null : day)
                    }}
                  />
                  {/* Weekly balance row after each Saturday */}
                  {index % 7 === 6 && index < calendarDays.length - 1 && (
                    <div key={`week-${index}`} className="col-span-7 flex items-center justify-end px-3 py-0.5 border-b border-[var(--sl-border)] bg-[var(--sl-s2)] gap-1.5">
                      <span className="text-[9px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">
                        Semana {Math.floor(index / 7) + 1}
                      </span>
                      <span className={cn(
                        'font-[DM_Mono] text-[10px] font-medium',
                        (weekBalances[Math.floor(index / 7)] ?? 0) >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
                      )}>
                        {(weekBalances[Math.floor(index / 7)] ?? 0) >= 0 ? '+' : ''}
                        {fmtR(weekBalances[Math.floor(index / 7)] ?? 0)}
                      </span>
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </SLCard>
        )}

        {/* ── Day Drawer ── */}
        <div className={cn(
          // Desktop: slide from right
          'absolute top-0 w-[400px] bg-[var(--sl-s1)] border-l border-[var(--sl-border)]',
          'flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 overflow-hidden shadow-[-12px_0_40px_rgba(0,0,0,0.25)]',
          selectedDay ? 'right-0' : 'right-[-420px]',
          // Mobile: slide from bottom
          'max-md:w-full max-md:right-0 max-md:top-auto max-md:h-[80%]',
          'max-md:border-l-0 max-md:border-t max-md:rounded-t-2xl max-md:shadow-[0_-8px_30px_rgba(0,0,0,0.2)]',
          selectedDay ? 'max-md:bottom-0' : 'max-md:bottom-[-100%]',
          'h-full',
        )}>
          {selectedDay && (
            <>
              {/* Drawer Header */}
              <div className="px-[18px] py-4 border-b border-[var(--sl-border)] shrink-0">
                {/* Mobile handle */}
                <div className="hidden max-md:block w-10 h-1 bg-[var(--sl-t3)] rounded mx-auto mb-3 opacity-40" />
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-[Syne] text-[15px] font-extrabold text-[var(--sl-t1)] capitalize">
                    {formatDayFull(selectedDay.date)}
                  </h3>
                  <button onClick={() => setSelectedDay(null)}
                    className="w-7 h-7 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-s2)] cursor-pointer text-[var(--sl-t2)] flex items-center justify-center hover:border-[#f43f5e] hover:text-[#f43f5e] transition-all">
                    <X size={14} />
                  </button>
                </div>

                {/* 3 mini cards */}
                <div className="flex gap-2">
                  {[
                    { label: 'Receitas', value: fmtR(dayRecipes),  cls: 'text-[#10b981]' },
                    { label: 'Despesas', value: fmtR(dayExpenses), cls: 'text-[#f43f5e]' },
                    { label: 'Saldo',    value: fmtR(dayBalance),  cls: dayBalance >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]' },
                  ].map(c => (
                    <div key={c.label} className="flex-1 px-[11px] py-[9px] rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-center">
                      <p className="text-[9px] uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-0.5">{c.label}</p>
                      <p className={cn('font-[DM_Mono] text-[13px] font-medium', c.cls)}>{c.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto px-[18px] py-3.5">
                <DrawerSection
                  title="Transações"
                  items={dayTransactions.filter(t => !t.is_future && !t.recurring_transaction_id)}
                />
                <DrawerSection
                  title="Recorrentes"
                  items={dayTransactions.filter(t => !!t.recurring_transaction_id)}
                />
                <DrawerSection
                  title="Planejados / Futuros"
                  items={dayTransactions.filter(t => t.is_future && !t.recurring_transaction_id)}
                />

                {dayTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-[28px] block mb-2 opacity-50">📅</span>
                    <p className="text-[12px] text-[var(--sl-t3)]">Nenhuma transação neste dia.</p>
                  </div>
                )}

                <button onClick={() => openAddModal(selectedDay.dateString)}
                  className="w-full py-2.5 rounded-[10px] border border-dashed border-[var(--sl-border-h)] bg-transparent cursor-pointer text-[var(--sl-t2)] text-[12px] flex items-center justify-center gap-1.5 hover:border-[#10b981] hover:text-[#10b981] hover:bg-[rgba(16,185,129,0.04)] transition-all mt-2">
                  <Plus size={14} />
                  Adicionar transação neste dia
                </button>
              </div>

              {/* Drawer Footer */}
              <div className="px-[18px] py-3.5 border-t border-[var(--sl-border)] shrink-0">
                <div className="flex items-center justify-between px-3.5 py-[11px] rounded-[11px] bg-gradient-to-br from-[rgba(16,185,129,0.07)] to-[rgba(0,85,255,0.05)] border border-[rgba(16,185,129,0.15)]">
                  <span className="text-[11px] text-[var(--sl-t2)]">Saldo acumulado até aqui</span>
                  <span className={cn('font-[DM_Mono] text-[16px] font-medium', cumulativeBalance >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                    {fmtR(cumulativeBalance)}
                  </span>
                </div>
                {selectedDay.isFuture && dayTransactions.some(t => t.is_future) && (
                  <div className="flex items-start gap-1.5 mt-2.5 p-3 rounded-[9px] bg-[rgba(96,165,250,0.06)] border border-[rgba(96,165,250,0.2)] text-[11px] text-[#60a5fa] leading-relaxed">
                    <Info size={13} className="shrink-0 mt-px" />
                    Valores futuros são projeções baseadas em recorrentes e eventos planejados.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Backdrop for mobile drawer */}
        {selectedDay && (
          <div
            className="hidden max-md:block fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelectedDay(null)}
          />
        )}
      </div>

      {/* ─── FAB ─── */}
      <div className="fixed bottom-[22px] right-[22px] z-[90] flex flex-col items-end gap-1.5">
        {/* FAB options */}
        <div className={cn(
          'flex flex-col gap-1.5 items-end transition-all duration-200',
          fabOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
        )}>
          {[
            { icon: '📥', label: 'Nova Receita',  action: () => openAddModal(null) },
            { icon: '📤', label: 'Nova Despesa',  action: () => openAddModal(null) },
            { icon: '📅', label: 'Evento futuro', action: () => { setPlanModalOpen(true); setFabOpen(false) } },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5 cursor-pointer" onClick={item.action}>
              <span className="bg-[var(--sl-s1)] border border-[var(--sl-border-h)] rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-[var(--sl-t1)] shadow-[0_4px_12px_rgba(0,0,0,0.2)] whitespace-nowrap">
                {item.label}
              </span>
              <span className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border-h)]">
                {item.icon}
              </span>
            </div>
          ))}
        </div>

        {/* FAB main button */}
        <button
          onClick={() => setFabOpen(v => !v)}
          className={cn(
            'w-[46px] h-[46px] rounded-full text-white text-[22px] cursor-pointer shadow-[0_5px_20px_rgba(16,185,129,0.4)] transition-transform duration-200 flex items-center justify-center font-light',
            fabOpen && 'rotate-45'
          )}
          style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
        >
          +
        </button>
      </div>

      {/* ─── Modals ─── */}
      <TransacaoModal
        open={addModalOpen}
        mode="create"
        categories={categories}
        defaultDate={addModalDate}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddTransaction}
      />

      <PlanningEventModal
        open={planModalOpen}
        mode="create"
        categories={categories}
        onClose={() => setPlanModalOpen(false)}
        onSave={handleAddEvent}
      />
    </div>
  )
}
