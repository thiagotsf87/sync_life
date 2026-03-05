'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Flame, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useFocusSessions, type FocusSession, type FocusSessionFormData } from '@/hooks/use-focus-sessions'
import { useMetas } from '@/hooks/use-metas'
import { useAgenda } from '@/hooks/use-agenda'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { KpiCard } from '@/components/ui/kpi-card'
import { FocusSessionModal } from '@/components/agenda/FocusSessionModal'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

type FilterPeriod = 'today' | 'week' | 'month'

function formatMinutes(min: number): string {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function groupSessionsByDate(sessions: FocusSession[]): { date: string; items: FocusSession[] }[] {
  const map: Record<string, FocusSession[]> = {}
  for (const s of sessions) {
    if (!map[s.date]) map[s.date] = []
    map[s.date].push(s)
  }
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }))
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: FilterPeriod; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week',  label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
]

export default function BlocosFocoPage() {
  const [filter, setFilter] = useState<FilterPeriod>('week')
  const { sessions, loading, kpis, create, update, remove } = useFocusSessions(filter)
  const { goals } = useMetas()
  const goalOptions = goals.map(g => ({ id: g.id, name: g.name, icon: g.icon }))

  // Buscar eventos da semana atual para vincular
  const { events: weekEvents } = useAgenda({ mode: 'week', referenceDate: new Date() })
  const eventOptions = weekEvents.slice(0, 20).map(e => ({
    id: e.id,
    title: e.title,
    date: e.date,
  }))

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    session?: FocusSession | null
  }>({ open: false, mode: 'create' })

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleSave(data: FocusSessionFormData) {
    try {
      if (modal.mode === 'create') {
        await create(data)
        toast.success('Sessão registrada!')
      } else if (modal.session) {
        await update(modal.session.id, data)
        toast.success('Sessão atualizada!')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
      throw err
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id)
      toast.success('Sessão excluída!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  // ── Dados agrupados ────────────────────────────────────────────────────────
  const grouped = groupSessionsByDate(sessions)

  return (
    <div className="max-w-[1140px] mx-auto px-4 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className="font-[Syne] font-extrabold text-2xl text-[var(--sl-t1)] jornada:text-sl-grad">
          🎯 Blocos de Foco
        </h1>
        <div className="flex-1" />
        <button
          onClick={() => setModal({ open: true, mode: 'create' })}
          className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-bold text-white transition-all hover:brightness-110"
          style={{ background: '#06b6d4' }}
        >
          <Plus size={15} />
          <span className="max-sm:hidden">Nova Sessão</span>
        </button>
      </div>

      {/* ② JornadaInsight */}
      <JornadaInsight text={
        <span>
          {kpis.streakDays > 0
            ? <><strong className="text-[#f97316]">🔥 {kpis.streakDays} dias seguidos</strong> de foco! Continue assim — a consistência é o segredo do progresso. ✨</>
            : <>Registre sua primeira sessão de foco hoje e comece seu streak! 💪</>
          }
        </span>
      } />

      {/* ③ KPI Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Horas hoje"
          value={formatMinutes(kpis.todayMinutes)}
          delta="sessões registradas"
          accent="#06b6d4"
        />
        <KpiCard
          label="Horas esta semana"
          value={formatMinutes(kpis.weekMinutes)}
          delta="nos últimos 7 dias"
          accent="#10b981"
        />
        <KpiCard
          label="Streak"
          value={`${kpis.streakDays}d`}
          delta={kpis.streakDays > 0 ? 'dias consecutivos!' : 'comece hoje'}
          deltaType={kpis.streakDays > 0 ? 'up' : 'neutral'}
          accent="#f97316"
        />
        <KpiCard
          label="Sessões no mês"
          value={String(kpis.monthCount)}
          delta={`${formatMinutes(kpis.monthMinutes)} total`}
          accent="#8b5cf6"
        />
      </div>

      {/* ④ Filtro de período */}
      <div className="flex gap-2 mb-5">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              'px-4 py-1.5 rounded-[8px] border text-[12px] font-semibold transition-all',
              filter === opt.value
                ? 'border-[#06b6d4] bg-[rgba(6,182,212,0.1)] text-[#06b6d4]'
                : 'border-[var(--sl-border)] bg-[var(--sl-s1)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ⑤ Lista de sessões */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-[13px] text-[var(--sl-t3)]">Carregando sessões...</p>
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl">
          <span className="text-4xl">🎯</span>
          <p className="font-[Syne] font-extrabold text-[16px] text-[var(--sl-t1)]">Nenhuma sessão registrada</p>
          <p className="text-[13px] text-[var(--sl-t3)] text-center max-w-[280px]">
            Clique em &quot;Nova Sessão&quot; para registrar uma sessão de foco.
          </p>
          <button
            onClick={() => setModal({ open: true, mode: 'create' })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[13px] font-bold text-white transition-all hover:brightness-110 mt-1"
            style={{ background: '#06b6d4' }}
          >
            <Plus size={15} />
            Nova Sessão
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ date, items }) => {
            const totalMin = items.reduce((s, i) => s + i.duration_minutes, 0)
            return (
              <div key={date}>
                {/* Header do grupo */}
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">
                    {formatDate(date)}
                  </p>
                  <div className="flex-1 h-px bg-[var(--sl-border)]" />
                  <span className="text-[11px] font-[DM_Mono] font-semibold text-[#06b6d4]">
                    {formatMinutes(totalMin)}
                  </span>
                </div>

                {/* Cards de sessão */}
                <div className="flex flex-col gap-2">
                  {items.map(session => {
                    const goal = goals.find(g => g.id === session.goal_id)
                    return (
                      <div
                        key={session.id}
                        className="flex items-start gap-3 px-4 py-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] hover:border-[var(--sl-border-h)] transition-colors sl-fade-up"
                      >
                        {/* Ícone de foco */}
                        <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 bg-[rgba(6,182,212,0.1)]">
                          <Clock size={18} className="text-[#06b6d4]" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          {goal ? (
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-sm">{goal.icon}</span>
                              <p className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">
                                {goal.name}
                              </p>
                            </div>
                          ) : (
                            <p className="text-[13px] font-semibold text-[var(--sl-t2)] mb-0.5">Sessão livre</p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-[DM_Mono] text-[13px] font-bold text-[#06b6d4]">
                              {formatMinutes(session.duration_minutes)}
                            </span>
                            {session.start_time && (
                              <span className="text-[11px] text-[var(--sl-t3)] font-[DM_Mono]">
                                às {session.start_time}
                              </span>
                            )}
                          </div>

                          {session.notes && (
                            <p className="text-[11px] text-[var(--sl-t3)] mt-1 line-clamp-2">{session.notes}</p>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setModal({ open: true, mode: 'edit', session })}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
                            title="Editar"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--sl-t3)] hover:text-[#f43f5e] hover:bg-[var(--sl-s2)] transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* FAB mobile */}
      <button
        onClick={() => setModal({ open: true, mode: 'create' })}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white z-30 transition-all hover:brightness-110"
        style={{ background: '#06b6d4' }}
      >
        <Plus size={22} />
      </button>

      {/* Modal */}
      <FocusSessionModal
        open={modal.open}
        mode={modal.mode}
        session={modal.session}
        goals={goalOptions}
        events={eventOptions}
        onClose={() => setModal(s => ({ ...s, open: false, session: null }))}
        onSave={handleSave}
      />

    </div>
  )
}
