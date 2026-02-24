'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { useUserPlan } from '@/hooks/use-user-plan'
import { useCategories } from '@/hooks/use-categories'
import { SLCard } from '@/components/ui/sl-card'
import { KpiCard } from '@/components/ui/kpi-card'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { TimelineScroll } from '@/components/financas/TimelineScroll'
import { PlanningEventModal } from '@/components/financas/PlanningEventModal'
import {
  usePlanejamento,
  SCENARIOS,
  SCENARIO_COLORS,
  SCENARIO_LABELS,
  type ScenarioKey,
  type PlanningEvent,
  type EventFormData,
  type BalanceDataPoint,
} from '@/hooks/use-planejamento'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmtR = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })

const fmtDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────

function SparklineSvg({ data, color }: { data: BalanceDataPoint[]; color: string }) {
  if (data.length < 2) return <div className="h-[120px] bg-[var(--sl-s2)] rounded-lg animate-pulse" />

  const balances = data.map(d => d.balance)
  const minBal = Math.min(...balances)
  const maxBal = Math.max(...balances)
  const range = maxBal - minBal || 1

  const W = 300
  const H = 110
  const PAD = 8
  const step = W / (data.length - 1)

  const pts = data.map((d, i) => {
    const x = i * step
    const y = H - PAD - ((d.balance - minBal) / range) * (H - 2 * PAD)
    return `${x},${y}`
  }).join(' ')

  const gradId = `spark-${color.replace('#', '')}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${H} ${pts} ${(data.length - 1) * step},${H}`}
        fill={`url(#${gradId})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">
      <div className="h-8 w-56 bg-[var(--sl-s3)] rounded-lg mb-5 animate-pulse" />
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 animate-pulse">
            <div className="h-3 w-20 bg-[var(--sl-s3)] rounded mb-3" />
            <div className="h-6 w-28 bg-[var(--sl-s3)] rounded" />
          </div>
        ))}
      </div>
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl animate-pulse" style={{ height: 360 }} />
    </div>
  )
}

// ─── EVENT ROW ────────────────────────────────────────────────────────────────

function EventRow({
  ev,
  onEdit,
  onDelete,
  onConfirm,
}: {
  ev: PlanningEvent
  onEdit: (ev: PlanningEvent) => void
  onDelete: (id: string) => void
  onConfirm: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 -mx-2 px-2 rounded-lg hover:bg-[var(--sl-s2)] transition-colors group">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: ev.type === 'income' ? '#10b981' : '#f43f5e' }}
      />
      <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] shrink-0 w-[46px]">
        {fmtDate(ev.planned_date)}
      </span>
      <span className="flex-1 text-[13px] text-[var(--sl-t2)] truncate">
        {ev.categories?.icon ?? (ev.type === 'income' ? '💰' : '📤')} {ev.name}
      </span>
      <span className={cn('font-[DM_Mono] text-[13px] shrink-0', ev.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
        {ev.type === 'income' ? '+' : '-'}{fmtR(ev.amount)}
      </span>
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!ev.is_confirmed && (
          <button onClick={() => onConfirm(ev.id)}
            className="w-6 h-6 flex items-center justify-center rounded text-[#10b981] hover:bg-[rgba(16,185,129,0.1)] transition-colors"
            title="Confirmar evento">
            <CheckCircle2 size={13} />
          </button>
        )}
        <button onClick={() => onEdit(ev)}
          className="w-6 h-6 flex items-center justify-center rounded text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s3)] transition-colors">
          <Pencil size={12} />
        </button>
        <button onClick={() => onDelete(ev.id)}
          className="w-6 h-6 flex items-center justify-center rounded text-[var(--sl-t3)] hover:text-[#f43f5e] hover:bg-[rgba(244,63,94,0.08)] transition-colors">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function PlanejamentoPage() {
  const mode = useShellStore(s => s.mode)
  const isJornada = mode === 'jornada'
  const { isPro } = useUserPlan()
  const { categories } = useCategories()

  const {
    planningEvents, projectedEvents, balanceData, months,
    loading, error,
    scenario, setScenario,
    currentBalance, bal6m, bal12m, nextCritical,
    createEvent, updateEvent, deleteEvent, confirmEvent,
    refresh,
  } = usePlanejamento()

  const [modalOpen, setModalOpen]     = useState(false)
  const [editEvent, setEditEvent]     = useState<PlanningEvent | undefined>()
  const [modalMode, setModalMode]     = useState<'create' | 'edit'>('create')

  if (loading) return <LoadingSkeleton />

  const todayCol = 0 // current month is always first column

  // ── KPI delta labels ──────────────────────────────────────────────────────
  const month6Label = months[6]?.label ?? ''
  const month12Label = months[12]?.label ?? ''

  const bal6mDelta  = `${month6Label} — ${SCENARIO_LABELS[scenario]}`
  const bal12mDelta = `${month12Label} — ${SCENARIO_LABELS[scenario]}`

  // ── Insight text ──────────────────────────────────────────────────────────
  const insightText = (() => {
    const b12 = fmtR(bal12m)
    const m12 = month12Label
    if (scenario === 'o') return `No cenário otimista, você pode alcançar ${b12} em ${m12}. Mantenha o ritmo de economia! 🚀`
    if (scenario === 'p') {
      const isNeg = bal12m < 0
      return isNeg
        ? `No cenário pessimista, saldo pode ficar negativo. Reforce sua reserva de emergência. ⚠️`
        : `No cenário pessimista, o crescimento é mais lento — previsto ${b12} em ${m12}.`
    }
    return nextCritical
      ? `No cenário realista, saldo chega a ${b12} em ${m12}. Atenção: queda expressiva prevista em ${nextCritical.date}.`
      : `No cenário realista, você projeta ${b12} em ${m12}. Continue no ritmo! 📊`
  })()

  // ── Handlers ──────────────────────────────────────────────────────────────
  function openCreate() { setModalMode('create'); setEditEvent(undefined); setModalOpen(true) }
  function openEdit(ev: PlanningEvent) { setModalMode('edit'); setEditEvent(ev); setModalOpen(true) }

  async function handleSave(data: EventFormData) {
    try {
      if (modalMode === 'edit' && editEvent) {
        await updateEvent(editEvent.id, data)
        toast.success('Evento atualizado!')
      } else {
        await createEvent(data)
        toast.success('Evento criado!')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar'
      toast.error(msg)
      throw e
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEvent(id)
      toast.success('Evento removido')
    } catch {
      toast.error('Erro ao remover evento')
    }
  }

  async function handleConfirm(id: string) {
    try {
      await confirmEvent(id)
      toast.success('Evento confirmado')
    } catch {
      toast.error('Erro ao confirmar evento')
    }
  }

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className={cn(
          'font-[Syne] font-extrabold text-[22px] tracking-tight',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          📈 Planejamento Futuro
        </h1>
        <div className="flex-1" />

        {/* Scenario group */}
        <div className="flex bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[20px] p-0.5 gap-0.5">
          {SCENARIOS.map(sc => (
            <button key={sc.key} onClick={() => setScenario(sc.key as ScenarioKey)}
              className={cn(
                'px-[14px] py-[5px] rounded-[16px] text-[12px] font-medium cursor-pointer transition-all whitespace-nowrap',
                scenario === sc.key ? sc.activeClass : 'bg-transparent text-[var(--sl-t3)] hover:text-[var(--sl-t2)]'
              )}>
              {sc.icon} {sc.label}
            </button>
          ))}
        </div>

        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#10b981] text-white text-[12px] font-semibold cursor-pointer hover:opacity-85 transition-opacity">
          <Plus size={13} strokeWidth={2.5} />
          Novo Evento
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[rgba(244,63,94,0.06)] border border-[rgba(244,63,94,0.2)] rounded-xl p-4 text-[13px] text-[#f43f5e] mb-5">
          {error}{' '}
          <button onClick={refresh} className="underline">Tentar novamente</button>
        </div>
      )}

      {/* ② Summary Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Saldo Hoje"
          value={fmtR(currentBalance)}
          delta={new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          deltaType="neutral"
          accent="#10b981"
        />
        <KpiCard
          label="Saldo em 6 meses"
          value={fmtR(bal6m)}
          delta={bal6mDelta}
          deltaType={bal6m >= currentBalance ? 'up' : 'down'}
          accent={SCENARIO_COLORS[scenario]}
        />
        <KpiCard
          label="Saldo em 12 meses"
          value={fmtR(bal12m)}
          delta={bal12mDelta}
          deltaType={bal12m >= currentBalance ? 'up' : 'down'}
          accent={bal12m >= currentBalance ? '#10b981' : '#f43f5e'}
        />
        <KpiCard
          label="Próximo crítico"
          value={nextCritical ? fmtR(nextCritical.balance) : '—'}
          delta={nextCritical ? `${nextCritical.date} — ${nextCritical.name}` : 'Nenhum alerta'}
          deltaType={nextCritical ? 'down' : 'neutral'}
          accent={nextCritical ? '#f43f5e' : '#10b981'}
        />
      </div>

      {/* ③ JornadaInsight */}
      <JornadaInsight text={insightText} />

      {/* ④ Timeline Card */}
      <SLCard className="mb-4 overflow-hidden p-0 sl-fade-up">
        {/* Timeline header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
          <div>
            <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]">
              Curva de Saldo — 6 meses
            </p>
            <p className="text-[11px] text-[var(--sl-t3)]">
              Projeção {SCENARIO_LABELS[scenario]} · {months[0]?.label} → {months[6]?.label}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(Object.entries(SCENARIO_COLORS) as [ScenarioKey, string][]).map(([key, color]) => (
              <span key={key} className="flex items-center gap-1 text-[11px]" style={{ color }}>
                <span
                  className="w-4 h-0.5 inline-block rounded"
                  style={{ background: key === 'r' ? color : undefined, borderTop: key !== 'r' ? `2px dashed ${color}` : undefined }}
                />
                {SCENARIO_LABELS[key]}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline body */}
        <div className="flex overflow-hidden" style={{ height: 320 }}>
          {/* Layer labels */}
          <div className="w-20 shrink-0 flex flex-col border-r border-[var(--sl-border)] bg-[var(--sl-s2)] overflow-hidden">
            {/* Header spacer */}
            <div className="h-9 shrink-0 border-b border-[var(--sl-border)] bg-[var(--sl-s1)]" />
            {/* Receitas band */}
            <div className="flex flex-col items-end justify-center px-3 h-[90px] shrink-0 border-b border-[var(--sl-border)]">
              <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-right text-[#10b981]">Receitas</span>
              <span className="text-[13px]">💰</span>
            </div>
            {/* Saldo band */}
            <div className="flex flex-col items-end justify-center px-3 flex-1 min-h-0 border-b border-[var(--sl-border)]">
              <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-right text-[#0055ff]">Saldo</span>
              <span className="text-[13px]">📈</span>
            </div>
            {/* Despesas band */}
            <div className="flex flex-col items-end justify-center px-3 h-[90px] shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-right text-[#f43f5e]">Despesas</span>
              <span className="text-[13px]">📤</span>
            </div>
          </div>

          {/* Scrollable timeline */}
          <TimelineScroll
            months={months.slice(0, 7)}
            events={projectedEvents.filter(e => e.monthIndex < 7)}
            balanceData={balanceData.slice(0, 7)}
            scenario={scenario}
            todayCol={todayCol}
            isPro={isPro}
          />
        </div>
      </SLCard>

      {/* ⑤ Bottom Grid */}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">

        {/* Próximos Eventos */}
        <SLCard className="sl-fade-up sl-delay-1">
          <div className="flex items-center justify-between mb-4">
            <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">📋 Próximos Eventos</p>
            <button onClick={openCreate} className="text-[11px] text-[#10b981] cursor-pointer hover:opacity-70 transition-opacity">
              + Adicionar
            </button>
          </div>

          {planningEvents.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-[28px] block mb-2 opacity-50">📋</span>
              <p className="text-[12px] text-[var(--sl-t3)]">Nenhum evento planejado.</p>
              <button onClick={openCreate} className="text-[12px] text-[#10b981] underline mt-1 cursor-pointer">
                Adicionar evento
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[var(--sl-border)]">
              {planningEvents.slice(0, 7).map(ev => (
                <EventRow
                  key={ev.id}
                  ev={ev}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onConfirm={handleConfirm}
                />
              ))}
              {planningEvents.length > 7 && (
                <p className="text-[11px] text-[var(--sl-t3)] pt-2.5 text-center">
                  +{planningEvents.length - 7} eventos
                </p>
              )}
            </div>
          )}
        </SLCard>

        {/* Projeção de Saldo */}
        <SLCard className="sl-fade-up sl-delay-2">
          <div className="flex items-center justify-between mb-4">
            <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">📊 Projeção de Saldo</p>
            <span className="text-[11px] font-semibold" style={{ color: SCENARIO_COLORS[scenario] }}>
              ● {SCENARIO_LABELS[scenario]}
            </span>
          </div>

          <SparklineSvg data={balanceData.slice(0, 7)} color={SCENARIO_COLORS[scenario]} />

          {/* Bal row */}
          <div className="flex justify-between mt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">Hoje</span>
              <span className="font-[DM_Mono] text-[15px] text-[#10b981]">{fmtR(currentBalance)}</span>
            </div>
            <div className="flex flex-col gap-0.5 items-center">
              <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">6 meses</span>
              <span className="font-[DM_Mono] text-[15px]" style={{ color: SCENARIO_COLORS[scenario] }}>
                {fmtR(bal6m)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <span className="text-[10px] uppercase tracking-[0.06em] text-[var(--sl-t3)]">12 meses</span>
              <span className={cn('font-[DM_Mono] text-[15px]', bal12m >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                {fmtR(bal12m)}
              </span>
            </div>
          </div>

          {/* Critical warning */}
          {nextCritical && (
            <div className="mt-3 p-2.5 rounded-[9px] text-[12px] text-[var(--sl-t2)]"
              style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}>
              ⚠ <strong className="text-[#f59e0b]">{nextCritical.date}</strong> — {nextCritical.name}
              {' '}— saldo cai para{' '}
              <strong className="text-[#f59e0b]">{fmtR(nextCritical.balance)}</strong>
            </div>
          )}
        </SLCard>
      </div>

      {/* ─── Modal ─── */}
      <PlanningEventModal
        open={modalOpen}
        mode={modalMode}
        event={editEvent}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
