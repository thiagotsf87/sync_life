'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Camera, DollarSign, TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react'
import { AIInsightCard } from '@/components/ui/ai-insight-card'
import { useShellStore } from '@/stores/shell-store'

// ─── helpers ──────────────────────────────────────────

function fmt(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

// ─── types ────────────────────────────────────────────

interface ModuleScore {
  id: string
  emoji: string
  label: string
  pct: number
  color: string
  bg: string
}

interface AlertItem {
  color: string
  title: string
  text: string
}

interface DashboardMobileProps {
  userName: string
  lifeScore: number
  moduleScores: ModuleScore[]
  alerts: AlertItem[]
  budgetsOver: number
  goalsAtRisk: number
  totalExpense: number
  projectedBalance: number
}

// ─── Heatmap data (mock for now) ──────────────────────

const HEATMAP_DAYS = [
  12, 0, 84, 47, 340, 23, 55, 120, 0, 38, 18, 0, 280, 8,
]

function getHeatmapColor(val: number): string {
  if (val === 0) return 'rgba(16,185,129,0.04)'
  if (val > 200) return 'rgba(244,63,94,0.3)'
  if (val > 100) return 'rgba(245,158,11,0.2)'
  if (val > 50) return 'rgba(16,185,129,0.25)'
  if (val > 30) return 'rgba(16,185,129,0.15)'
  return 'rgba(16,185,129,0.08)'
}

// ─── Component ────────────────────────────────────────

export function DashboardMobile({
  userName,
  lifeScore,
  moduleScores,
  alerts,
  budgetsOver,
  goalsAtRisk,
  totalExpense,
  projectedBalance,
}: DashboardMobileProps) {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'
  const greeting = useMemo(() => getGreeting(), [])
  const today = new Date()
  const dateLabel = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^\w/, c => c.toUpperCase())

  // Build SVG arcs for Life Sync Score ring
  const ringR = 68
  const ringCirc = 2 * Math.PI * ringR

  // Divide score arc proportionally among active modules
  const activeModules = moduleScores.filter(m => m.pct > 0)
  const totalPct = activeModules.reduce((s, m) => s + m.pct, 0)

  const arcs = useMemo(() => {
    if (activeModules.length === 0) return []
    const total = lifeScore // overall score out of 100
    const totalArc = (total / 100) * ringCirc
    let offset = 0
    return activeModules.map((m) => {
      const share = totalPct > 0 ? m.pct / totalPct : 1 / activeModules.length
      const arcLen = totalArc * share
      const gap = 5
      const a = {
        color: m.color,
        dasharray: `${Math.max(0, arcLen - gap)} ${ringCirc - Math.max(0, arcLen - gap)}`,
        dashoffset: -offset,
      }
      offset += arcLen
      return a
    })
  }, [activeModules, lifeScore, ringCirc, totalPct])

  return (
    <div className="lg:hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          {isJornada ? (
            <h1 className="font-[Syne] text-[20px] font-bold text-sl-grad">
              {greeting}, {userName} 👋
            </h1>
          ) : (
            <h1 className="font-[Syne] text-[20px] font-bold text-[var(--sl-t1)]">
              Dashboard
            </h1>
          )}
          <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">{dateLabel}</p>
        </div>
      </div>

      {/* ─── JORNADA: Life Sync Score Ring + chips + AI insight ─── */}
      {isJornada && (
        <>
          {/* Life Sync Score Ring */}
          <div className="text-center px-4 pb-2">
            <div className="relative mx-auto mb-5" style={{ width: 160, height: 160 }}>
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r={ringR} fill="none" stroke="var(--sl-s3)" strokeWidth="10" />
                {arcs.map((arc, i) => (
                  <circle
                    key={i}
                    cx="80" cy="80" r={ringR}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={arc.dasharray}
                    strokeDashoffset={arc.dashoffset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-[Syne] text-[36px] font-extrabold text-[var(--sl-t1)] leading-none">
                  {lifeScore > 0 ? lifeScore : '—'}
                </span>
                <span className="text-[11px] text-[var(--sl-t2)] mt-0.5">Life Score</span>
              </div>
            </div>

            {/* Evolution badge */}
            <div className="flex items-center gap-1.5 justify-center mb-2">
              <div className="inline-flex items-center gap-1 px-3 py-[5px] rounded-[20px]
                              bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span className="text-[12px] font-medium text-[#10b981]">+4 pts essa semana</span>
              </div>
            </div>
          </div>

          {/* Module chips */}
          <div className="flex flex-wrap gap-2 px-4 pb-1">
            {moduleScores.filter(m => m.pct > 0).map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-1.5 px-[11px] py-1.5 rounded-[20px] text-[12px] font-medium border border-transparent"
                style={{ background: m.bg, borderColor: `${m.color}30`, color: m.color }}
              >
                {m.emoji} {m.label} {m.pct}%
              </div>
            ))}
          </div>

          <div className="h-4" />

          {/* AI Insight */}
          <div className="px-4">
            <AIInsightCard>
              Você gastou <strong>R$ 340 menos</strong> que a média este mês.
              {goalsAtRisk > 0
                ? <> Atenção: <strong>{goalsAtRisk} meta(s)</strong> abaixo do ritmo.</>
                : ' Quer mover esse valor para sua meta de viagem?'}
            </AIInsightCard>
          </div>

          <div className="h-3" />
        </>
      )}

      {/* ─── FOCO: KPI strip compacto ─── */}
      {!isJornada && (
        <>
          <div className="grid grid-cols-2 gap-2 px-4 pb-3">
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown size={12} className="text-[#f43f5e]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)]">Despesas</span>
              </div>
              <p className="font-[DM_Mono] text-[16px] font-medium text-[#f43f5e]">{fmt(totalExpense)}</p>
            </div>
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={12} className="text-[#10b981]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)]">Projeção</span>
              </div>
              <p className="font-[DM_Mono] text-[16px] font-medium text-[#10b981]">{fmt(projectedBalance)}</p>
            </div>
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={12} className="text-[#f59e0b]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)]">Orçamentos</span>
              </div>
              <p className="font-[DM_Mono] text-[16px] font-medium text-[var(--sl-t1)]">
                {budgetsOver > 0 ? <span className="text-[#f43f5e]">{budgetsOver} acima</span> : 'OK'}
              </p>
            </div>
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Target size={12} className="text-[#0055ff]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)]">Metas</span>
              </div>
              <p className="font-[DM_Mono] text-[16px] font-medium text-[var(--sl-t1)]">
                {goalsAtRisk > 0 ? <span className="text-[#f59e0b]">{goalsAtRisk} em risco</span> : 'No ritmo'}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Alerts — both modes */}
      <p className="px-5 pb-2 mt-1 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
        Hoje
      </p>
      {alerts.map((alert, i) => (
        <div
          key={i}
          className="mx-4 mb-2 flex items-start gap-2.5 rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] px-3.5 py-3"
        >
          <div
            className="mt-1 h-2 w-2 shrink-0 rounded-full"
            style={{ background: alert.color }}
          />
          <p className="text-[13px] text-[var(--sl-t2)] leading-[1.5] [&_strong]:text-[var(--sl-t1)]">
            <strong>{alert.title}</strong> {alert.text}
          </p>
        </div>
      ))}

      {/* Mini Heatmap — both modes (data-oriented) */}
      <p className="px-5 pb-2 mt-3 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
        Gastos — {today.toLocaleDateString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
      </p>
      <div className="mx-4 mb-1">
        <div className="flex gap-[3px]">
          {HEATMAP_DAYS.map((val, i) => (
            <div
              key={i}
              className="flex-1 h-7 rounded min-w-[8px] flex items-center justify-center"
              style={{ background: getHeatmapColor(val) }}
            >
              <span className="text-[9px] text-[var(--sl-t3)]">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-0.5 mt-1">
          <span className="text-[10px] text-[var(--sl-t3)]">Menor gasto</span>
          <span className="text-[10px] text-[var(--sl-t3)]">→</span>
          <span className="text-[10px] text-[var(--sl-t3)]">Maior gasto</span>
        </div>
      </div>

      {/* Quick Actions — both modes */}
      <p className="px-5 pb-2 mt-3 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
        Ações Rápidas
      </p>
      <div className="grid grid-cols-2 gap-2.5 px-4 pb-6">
        <button
          onClick={() => router.push('/financas/transacoes')}
          className="flex flex-col gap-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3.5
                     transition-colors active:bg-[var(--sl-s2)]"
        >
          <div className="h-8 w-8 rounded-[9px] flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <DollarSign size={16} />
          </div>
          <span className="text-[13px] font-medium text-[var(--sl-t1)]">Transação</span>
          <span className="text-[11px] text-[var(--sl-t2)]">Registrar gasto</span>
        </button>
        <button
          onClick={() => router.push('/tempo')}
          className="flex flex-col gap-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3.5
                     transition-colors active:bg-[var(--sl-s2)]"
        >
          <div className="h-8 w-8 rounded-[9px] flex items-center justify-center"
            style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
            <Calendar size={16} />
          </div>
          <span className="text-[13px] font-medium text-[var(--sl-t1)]">Evento</span>
          <span className="text-[11px] text-[var(--sl-t2)]">Agendar compromisso</span>
        </button>
        <button
          onClick={() => router.push('/dashboard/review')}
          className="flex flex-col gap-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3.5
                     transition-colors active:bg-[var(--sl-s2)]"
        >
          <div className="h-8 w-8 rounded-[9px] flex items-center justify-center"
            style={{ background: 'rgba(0,85,255,0.15)', color: '#0055ff' }}>
            <Clock size={16} />
          </div>
          <span className="text-[13px] font-medium text-[var(--sl-t1)]">Revisão</span>
          <span className="text-[11px] text-[var(--sl-t2)]">Review semanal</span>
        </button>
        <button
          className="flex flex-col gap-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3.5
                     transition-colors active:bg-[var(--sl-s2)]"
        >
          <div className="h-8 w-8 rounded-[9px] flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
            <Camera size={16} />
          </div>
          <span className="text-[13px] font-medium text-[var(--sl-t1)]">Foto Recibo</span>
          <span className="text-[11px] text-[var(--sl-t2)]">OCR automático</span>
        </button>
      </div>
    </div>
  )
}
