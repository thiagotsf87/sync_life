'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Crown, CheckSquare, Calendar, Clock, BarChart3, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useAgenda } from '@/hooks/use-agenda'
import { useFocusSessions } from '@/hooks/use-focus-sessions'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { ModuleHeader } from '@/components/ui/module-header'
import { useUserPlan } from '@/hooks/use-user-plan'
import { TempoMobileShell } from '@/components/tempo/TempoMobileShell'

// ─── TABS ─────────────────────────────────────────────────────────────────────

const TEMPO_TABS = [
  { label: 'Dashboard', href: '/tempo' },
  { label: 'Agenda', href: '/tempo/agenda' },
  { label: 'Semanal', href: '/tempo/semanal' },
  { label: 'Mensal', href: '/tempo/mensal' },
  { label: 'Review', href: '/tempo/review', pro: true },
]
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Cell,
} from 'recharts'
import { toast } from 'sonner'

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const MODULE_COLORS: Record<string, string> = {
  trabalho:   '#f43f5e',
  meta:       '#8b5cf6',
  saude:      '#f97316',
  pessoal:    '#06b6d4',
  financeiro: '#10b981',
  estudo:     '#a855f7',
}

const MODULE_LABELS: Record<string, string> = {
  trabalho:   '💼 Trabalho',
  meta:       '🎯 Meta',
  saude:      '🏥 Saúde',
  pessoal:    '👤 Pessoal',
  financeiro: '💰 Financeiro',
  estudo:     '📚 Estudo',
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getWeekStart(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  return `${weekStart.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function WeeklyReviewPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { isPro } = useUserPlan()

  const weekStart = getWeekStart(new Date())

  const { events } = useAgenda({ mode: 'week', referenceDate: new Date() })
  const { sessions, kpis } = useFocusSessions('week')

  const [completed, setCompleted] = useState(false)

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalEvents = events.length
  const completedEvents = events.filter(e => e.status === 'concluido').length
  const completionPct = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0
  const focusMinutes = kpis.weekMinutes
  const focusHours = Math.round(focusMinutes / 60 * 10) / 10

  // Module distribution
  const moduleDistribution = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(moduleDistribution).map(([type, count]) => ({
    name: MODULE_LABELS[type] ?? type,
    count,
    color: MODULE_COLORS[type] ?? '#6366f1',
  }))

  // Pending tasks
  const pendingEvents = events.filter(e => e.status === 'pendente')

  // Week number
  const weekOfYear = Math.ceil(
    ((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7
  )

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleCompleteReview() {
    setCompleted(true)
    toast.success('✅ Review concluído! +10 XP', { duration: 4000 })
  }

  // ── PRO Gate ──────────────────────────────────────────────────────────────
  if (!isPro) {
    return (
      <>
        {/* Mobile PRO gate */}
        <TempoMobileShell>
          <div className="px-4 pb-[calc(68px+16px)]">
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-8 text-center mt-2">
              <Crown size={32} className="mx-auto mb-3 text-[#f59e0b]" />
              <h2 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)] mb-2">Recurso PRO</h2>
              <p className="text-[12px] text-[var(--sl-t2)] mb-4 leading-relaxed">
                Analise sua semana com métricas de foco e distribuição. Disponível no plano PRO.
              </p>
              <button
                onClick={() => router.push('/configuracoes/plano')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] font-semibold text-[13px] text-white"
                style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
              >
                <Crown size={14} /> Assinar PRO
              </button>
            </div>
          </div>
        </TempoMobileShell>

        {/* Desktop PRO gate */}
        <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">
          <div className="hidden lg:flex border-b border-[var(--sl-border)] mb-5">
            {TEMPO_TABS.map(tab => (
              <Link key={tab.href} href={tab.href}
                className={cn(
                  'relative px-4 py-2.5 text-[13px] transition-colors',
                  pathname === tab.href
                    ? 'text-[#06b6d4] font-semibold'
                    : 'text-[var(--sl-t2)] hover:text-[var(--sl-t1)]'
                )}>
                {tab.label}
                {tab.pro && <span className="ml-1 text-[9px] font-bold bg-[#f59e0b] text-[#03071a] px-1 py-0.5 rounded">PRO</span>}
                {pathname === tab.href && (
                  <span className="absolute bottom-[-1px] left-2 right-2 h-[3px] rounded-t bg-[#06b6d4]" />
                )}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push('/tempo')}
              className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
            >
              <ArrowLeft size={16} /> Tempo
            </button>
            <h1 className="font-[Syne] font-extrabold text-xl flex-1 text-[var(--sl-t1)]">
              📋 Review Semanal
            </h1>
          </div>
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-12 text-center max-w-[480px] mx-auto">
            <Crown size={40} className="mx-auto mb-4 text-[#f59e0b]" />
            <h2 className="font-[Syne] font-bold text-lg text-[var(--sl-t1)] mb-2">
              Review Semanal — Recurso PRO
            </h2>
            <p className="text-[13px] text-[var(--sl-t2)] mb-6 leading-relaxed">
              Analise sua semana com distribuição por módulo, tarefas pendentes e métricas de foco. Disponível no plano PRO.
            </p>
            <button
              onClick={() => router.push('/configuracoes/plano')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-semibold text-[13px] text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
            >
              <Crown size={14} /> Assinar PRO
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* ─── Mobile Review ────────────────────────────────────────── */}
      <TempoMobileShell
        rightAction={
          !completed ? (
            <button
              onClick={handleCompleteReview}
              className="flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-[12px] font-semibold text-[#03071a]"
              style={{ background: '#06b6d4' }}
            >
              <CheckSquare size={13} /> +10 XP
            </button>
          ) : undefined
        }
      >
        <div className="px-4 pb-[calc(68px+16px)]">
          {/* Completion hero */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 mb-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: '#06b6d4' }} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-2">
              Semana {weekOfYear} · {formatWeekLabel(weekStart)}
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p
                  className="font-[Syne] font-extrabold text-[36px] leading-none"
                  style={{ color: completionPct >= 75 ? '#10b981' : completionPct >= 50 ? '#f59e0b' : '#f43f5e' }}
                >
                  {completionPct}%
                </p>
                <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">de conclusão</p>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-[var(--sl-t3)]">Concluídos</span>
                  <span className="font-[DM_Mono] font-bold text-[#10b981]">{completedEvents}/{totalEvents}</span>
                </div>
                <div className="bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: 6 }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${completionPct}%`,
                      background: completionPct >= 75 ? '#10b981' : completionPct >= 50 ? '#f59e0b' : '#f43f5e',
                    }}
                  />
                </div>
              </div>
            </div>
            {completed && (
              <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20">
                <span>✅</span>
                <p className="text-[12px] text-[#10b981] font-semibold">Review concluído! +10 XP adicionados.</p>
              </div>
            )}
          </div>

          {/* KPI grid 2×2 */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {[
              { label: 'Total', value: String(totalEvents), accent: '#06b6d4' },
              { label: 'Concluídos', value: String(completedEvents), accent: '#10b981' },
              { label: 'Horas Foco', value: `${focusHours}h`, accent: '#f59e0b' },
              { label: 'Pendentes', value: String(pendingEvents.length), accent: pendingEvents.length > 0 ? '#f43f5e' : '#10b981' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-3.5 relative overflow-hidden">
                <div className="absolute top-0 left-3 right-3 h-[2px] rounded-b" style={{ background: kpi.accent }} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">{kpi.label}</p>
                <p className="font-[DM_Mono] font-semibold text-[20px] leading-none text-[var(--sl-t1)]">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Pending events */}
          {pendingEvents.length > 0 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-3">
                📌 Pendentes ({pendingEvents.length})
              </h2>
              <div className="flex flex-col gap-2">
                {pendingEvents.slice(0, 5).map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 p-2.5 bg-[var(--sl-s2)] rounded-[10px]">
                    <div
                      className="w-1 self-stretch rounded-full shrink-0"
                      style={{ background: ev.priority === 'urgente' ? '#f43f5e' : ev.priority === 'alta' ? '#f59e0b' : '#06b6d4' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[var(--sl-t1)] font-medium truncate">{ev.title}</p>
                      <p className="text-[10px] text-[var(--sl-t3)]">{ev.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TempoMobileShell>

      {/* ─── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* Sub-nav underline tabs (desktop) */}
      <div className="hidden lg:flex border-b border-[var(--sl-border)] mb-5">
        {TEMPO_TABS.map(tab => (
          <Link key={tab.href} href={tab.href}
            className={cn(
              'relative px-4 py-2.5 text-[13px] transition-colors',
              pathname === tab.href
                ? 'text-[#06b6d4] font-semibold'
                : 'text-[var(--sl-t2)] hover:text-[var(--sl-t1)]'
            )}>
            {tab.label}
            {tab.pro && <span className="ml-1 text-[9px] font-bold bg-[#f59e0b] text-[#03071a] px-1 py-0.5 rounded">PRO</span>}
            {pathname === tab.href && (
              <span className="absolute bottom-[-1px] left-2 right-2 h-[3px] rounded-t bg-[#06b6d4]" />
            )}
          </Link>
        ))}
      </div>

      {/* ① ModuleHeader */}
      <ModuleHeader
        icon={FileText}
        iconBg="rgba(16,185,129,.1)"
        iconColor="#10b981"
        title="Review Semanal"
        subtitle={`Semana ${weekOfYear} \u00B7 ${formatWeekLabel(weekStart)}`}
      >
        {!completed && (
          <button
            onClick={handleCompleteReview}
            className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold text-white transition-all hover:brightness-110 hover:-translate-y-px"
            style={{ background: '#06b6d4' }}
          >
            <CheckSquare size={16} />
            Concluir Review (+10 XP)
          </button>
        )}
      </ModuleHeader>

      {/* ② Hero: Semana + % conclusão */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 mb-5 relative overflow-hidden sl-fade-up transition-colors hover:border-[var(--sl-border-h)]">
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t" style={{ background: '#06b6d4' }} />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">
              Semana {weekOfYear} · {formatWeekLabel(weekStart)}
            </p>
            <h2
              className="font-[Syne] font-extrabold text-3xl"
              style={{
                color: completionPct >= 75
                  ? '#10b981'
                  : completionPct >= 50
                  ? '#f59e0b'
                  : '#f43f5e',
              }}
            >
              {completionPct}%
            </h2>
            <p className="text-[13px] text-[var(--sl-t2)] mt-0.5">de conclusão</p>
          </div>
          <div className="flex flex-col gap-2 min-w-[160px]">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[var(--sl-t2)]">Concluídos</span>
              <span className="font-[DM_Mono] font-bold text-[#10b981]">
                {completedEvents}/{totalEvents}
              </span>
            </div>
            <div
              className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden"
              style={{ height: '6px' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${completionPct}%`,
                  background: completionPct >= 75
                    ? '#10b981'
                    : completionPct >= 50
                    ? '#f59e0b'
                    : '#f43f5e',
                }}
              />
            </div>
          </div>
        </div>
        {completed && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20">
            <span className="text-[18px]">✅</span>
            <p className="text-[13px] text-[#10b981] font-semibold">
              Review concluído! +10 XP adicionados.
            </p>
          </div>
        )}
      </div>

      {/* ③ KPI Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        {[
          { label: 'Total Eventos', value: String(totalEvents), icon: <Calendar size={14} />, accent: '#06b6d4' },
          { label: 'Concluídos',    value: String(completedEvents), icon: <CheckSquare size={14} />, accent: '#10b981' },
          { label: 'Horas Foco',    value: `${focusHours}h`, icon: <Clock size={14} />, accent: '#f59e0b' },
          {
            label: 'Pendentes',
            value: String(pendingEvents.length),
            icon: <BarChart3 size={14} />,
            accent: pendingEvents.length > 0 ? '#f43f5e' : '#10b981',
          },
        ].map(kpi => (
          <div
            key={kpi.label}
            className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 overflow-hidden sl-fade-up transition-colors hover:border-[var(--sl-border-h)]"
          >
            <div
              className="absolute top-0 left-4 right-4 h-0.5 rounded-b"
              style={{ background: kpi.accent }}
            />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-1">
              {kpi.label}
            </p>
            <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)]">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ④ JornadaInsight */}
      <JornadaInsight
        text={
          completionPct >= 75 ? (
            <>
              Excelente semana! Você concluiu{' '}
              <strong className="text-[#10b981]">{completedEvents} de {totalEvents} eventos</strong> e teve{' '}
              <strong className="text-[#06b6d4]">{focusHours}h</strong> de foco intenso. Continue assim! 🚀
            </>
          ) : completionPct >= 50 ? (
            <>
              Boa semana! Concluiu{' '}
              <strong className="text-[#f59e0b]">{completedEvents} de {totalEvents} eventos</strong>. Ainda há{' '}
              <strong className="text-[var(--sl-t1)]">{pendingEvents.length} itens pendentes</strong> que podem ser movidos para a próxima semana.
            </>
          ) : (
            <>
              Semana desafiadora. Foque em concluir{' '}
              <strong className="text-[#f43f5e]">{pendingEvents.length} itens pendentes</strong>. Lembre: consistência &gt; perfeição. 💪
            </>
          )
        }
      />

      {/* ⑤ Main grid */}
      <div className="grid grid-cols-[1fr_340px] gap-3.5 max-lg:grid-cols-1">

        {/* Left: chart + sessions */}
        <div className="flex flex-col gap-4">

          {/* Module distribution chart */}
          {chartData.length > 0 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up transition-colors hover:border-[var(--sl-border-h)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-4">
                📊 Distribuição por Tipo
              </h2>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: 'var(--sl-t3)' as string }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'var(--sl-t3)' as string }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ReTooltip
                      contentStyle={{
                        background: 'var(--sl-s2)',
                        border: '1px solid var(--sl-border)',
                        borderRadius: '10px',
                        fontSize: '11px',
                      }}
                      formatter={(v: number | undefined) => [v ?? 0, 'Eventos']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sessions list */}
          {sessions.length > 0 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up transition-colors hover:border-[var(--sl-border-h)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-3">
                ⏱ Sessões de Foco
              </h2>
              <div className="flex flex-col gap-2">
                {sessions.slice(0, 5).map(s => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-[var(--sl-s2)] rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#06b6d4]" />
                      <span className="text-[12px] text-[var(--sl-t1)]">{s.date}</span>
                    </div>
                    <span className="font-[DM_Mono] text-[12px] font-bold text-[#06b6d4]">
                      {s.duration_minutes}min
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Pending tasks */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 h-fit sl-fade-up transition-colors hover:border-[var(--sl-border-h)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
              📌 Pendentes ({pendingEvents.length})
            </h2>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-[13px] text-[var(--sl-t2)]">Nenhuma tarefa pendente!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              {pendingEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]"
                >
                  <div
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{
                      background: event.priority === 'urgente'
                        ? '#f43f5e'
                        : event.priority === 'alta'
                        ? '#f59e0b'
                        : '#06b6d4',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[var(--sl-t1)] font-medium truncate">{event.title}</p>
                    <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                      {new Date(event.date).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                      {event.start_time && ` · ${event.start_time}`}
                    </p>
                  </div>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}
                  >
                    Mover →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}
