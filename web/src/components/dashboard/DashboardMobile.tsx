'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Camera, DollarSign } from 'lucide-react'
import { AIInsightCard } from '@/components/ui/ai-insight-card'
import { PanoramaMobileShell } from '@/components/dashboard/PanoramaMobileShell'

// ─── helpers ──────────────────────────────────────────

function fmt(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Converte hex #rrggbb para rgba(r,g,b,alpha) */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
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
  totalIncome: number
  totalExpense: number
  projectedBalance: number
  isEmpty?: boolean
}

// ─── Heatmap data (mock for now) ──────────────────────

interface HeatmapDay {
  day:   number   // dia do mês (1–31)
  value: number   // total gasto em R$
  cat:   string   // categoria principal (emoji + nome)
}

const HEATMAP_DAYS: HeatmapDay[] = [
  { day:  1, value:  12, cat: '🚗 Transporte'  },
  { day:  2, value:   0, cat: ''               },
  { day:  3, value:  84, cat: '🍔 Alimentação'  },
  { day:  4, value:  47, cat: '🛒 Compras'      },
  { day:  5, value: 340, cat: '🏠 Moradia'      },
  { day:  6, value:  23, cat: '🚗 Transporte'  },
  { day:  7, value:  55, cat: '🍔 Alimentação'  },
  { day:  8, value: 120, cat: '🎬 Lazer'        },
  { day:  9, value:   0, cat: ''               },
  { day: 10, value:  38, cat: '🍔 Alimentação'  },
  { day: 11, value:  18, cat: '🚗 Transporte'  },
  { day: 12, value:   0, cat: ''               },
  { day: 13, value: 280, cat: '🏥 Saúde'        },
  { day: 14, value:   8, cat: '☕ Café'         },
]

function getHeatmapColor(val: number): string {
  if (val === 0)  return 'rgba(16,185,129,0.04)'
  if (val > 200)  return 'rgba(244,63,94,0.3)'
  if (val > 100)  return 'rgba(245,158,11,0.2)'
  if (val > 50)   return 'rgba(16,185,129,0.25)'
  if (val > 30)   return 'rgba(16,185,129,0.15)'
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
  totalIncome,
  totalExpense,
  projectedBalance,
  isEmpty = false,
}: DashboardMobileProps) {
  const router    = useRouter()
  const greeting  = useMemo(() => getGreeting(), [])
  const today     = new Date()
  const dateLabel = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^\w/, c => c.toUpperCase())

  const [activeHeatDay, setActiveHeatDay] = useState<number | null>(null)

  // Life Score ring — gradiente indigo→blue (#6366f1 → #0055ff)
  const ringR    = 68
  const ringCirc = 2 * Math.PI * ringR
  const ringFill = (lifeScore / 100) * ringCirc
  const ringGradId = 'panRingGrad'

  const ringColor = lifeScore >= 60
    ? `url(#${ringGradId})`
    : lifeScore >= 30
      ? '#f59e0b'
      : '#f43f5e'

  return (
    // Dashboard não passa title/subtitle — tabs vão direto para o conteúdo
    <PanoramaMobileShell>

      {/* ─── EMPTY STATE (primeiro uso — sem dados) ─── */}
      {isEmpty && (
        <div className="px-4 pt-2 pb-6">
          <div className="px-1 pb-3 pt-1">
            <div className="font-[Syne] text-[22px] font-extrabold text-[var(--sl-t1)]">Bem-vindo ao SyncLife! 🌟</div>
            <div className="text-[13px] text-[var(--sl-t2)] mt-1">Vamos organizar sua vida juntos.</div>
          </div>

          {/* Card CTA */}
          <div
            className="rounded-[16px] p-6 text-center mb-3"
            style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.10),rgba(0,85,255,0.08))', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <div className="text-[48px] mb-3">🌐</div>
            <div className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)] mb-2">Seu Panorama está vazio</div>
            <div className="text-[13px] text-[var(--sl-t2)] leading-[1.5] mb-4">
              Comece registrando sua primeira transação ou configurando um orçamento para ver seus dados aqui.
            </div>
            <button
              onClick={() => router.push('/financas/transacoes')}
              className="inline-flex px-6 py-[12px] rounded-[12px] font-[Syne] text-[14px] font-bold text-white"
              style={{ background: '#6366f1' }}
            >
              Começar agora →
            </button>
          </div>

          {/* Primeiros passos */}
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] px-1 mb-2 mt-4">PRIMEIROS PASSOS</div>
          <div className="flex flex-col gap-2">
            {[
              { num: '1', color: 'rgba(16,185,129,0.12)', label: 'Registrar primeira transação', hint: 'Desbloqueie: 🎯 Primeiro Passo (+10 pts)', href: '/financas/transacoes' },
              { num: '2', color: 'rgba(99,102,241,0.12)', label: 'Configurar um orçamento', hint: 'Ative os alertas do Dashboard', href: '/financas/orcamentos' },
              { num: '3', color: 'rgba(139,92,246,0.12)', label: 'Criar primeiro objetivo', hint: 'Desbloqueie: 🎯 Primeiro Sonho (+10 pts)', href: '/futuro' },
            ].map(step => (
              <button
                key={step.num}
                onClick={() => router.push(step.href)}
                className="flex items-center gap-3 p-[14px] rounded-[12px] border border-[var(--sl-border)] bg-[var(--sl-s1)] text-left"
              >
                <div className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center text-[14px] font-bold text-[var(--sl-t1)] shrink-0" style={{ background: step.color }}>
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--sl-t1)]">{step.label}</div>
                  <div className="text-[11px] text-[var(--sl-t3)] mt-0.5">{step.hint}</div>
                </div>
                <span className="text-[14px] text-[#6366f1] shrink-0">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Greeting + Life Sync Score Ring + chips + AI insight ─── */}
      <>
        {/* Saudação — dentro do conteúdo, abaixo das tabs (como protótipo) */}
          <div className="px-5 pb-3 pt-3">
            <div className="font-[Syne] text-[22px] font-extrabold text-[var(--sl-t1)]">
              {greeting}, {userName} ✨
            </div>
            <div className="text-[13px] text-[var(--sl-t2)] mt-0.5">{dateLabel}</div>
          </div>

          {/* Life Sync Score Ring */}
          <div className="text-center px-4 pb-2">
            <div className="relative mx-auto mb-5" style={{ width: 160, height: 160 }}>
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                  <linearGradient id={ringGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#0055ff" />
                  </linearGradient>
                </defs>
                {/* Track */}
                <circle cx="80" cy="80" r={ringR} fill="none" stroke="var(--sl-s3)" strokeWidth="10" />
                {/* Fill arc */}
                <circle
                  cx="80" cy="80" r={ringR}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${ringFill} ${ringCirc - ringFill}`}
                  strokeDashoffset={0}
                  style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-[Syne] text-[36px] font-extrabold leading-none"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #0055ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: lifeScore >= 60 ? 'transparent' : undefined,
                    color: lifeScore < 60 ? ringColor : undefined,
                  }}
                >
                  {lifeScore > 0 ? lifeScore : '—'}
                </span>
                <span className="text-[11px] text-[var(--sl-t2)] mt-0.5">Life Score</span>
              </div>
            </div>

            {/* Evolution badge */}
            <div className="flex items-center gap-1.5 justify-center mb-2">
              <div className="inline-flex items-center gap-1 px-3 py-[5px] rounded-[20px]
                              bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.25)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span className="text-[12px] font-medium text-[#6366f1]">+4 pts essa semana</span>
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

      {/* ─── Conteúdo normal do dashboard (oculto no empty state) ─── */}
      {!isEmpty && <>

      {/* ─── Alertas — ambos os modos ─── */}
      <p className="px-5 pb-2 mt-1 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
        Hoje
      </p>
      {alerts.map((alert, i) => (
        <div
          key={i}
          className="mx-4 mb-2 flex items-center gap-2.5 rounded-[10px] px-3.5 py-3"
          style={{
            background: hexToRgba(alert.color, 0.06),
            border: `1px solid ${hexToRgba(alert.color, 0.15)}`,
          }}
        >
          <div
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: alert.color }}
          />
          <p className="text-[13px] text-[var(--sl-t1)] leading-[1.5] [&_strong]:text-[var(--sl-t1)]">
            <strong>{alert.title}</strong> {alert.text}
          </p>
        </div>
      ))}

      {/* ─── Mini Heatmap — ambos os modos ─── */}
      <p className="px-5 pb-2 mt-3 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
        Gastos — {today.toLocaleDateString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
      </p>
      <div className="mx-4 mb-1">
        {/* Tooltip do dia ativo */}
        {activeHeatDay !== null && (() => {
          const d = HEATMAP_DAYS[activeHeatDay]
          return (
            <div
              className="mb-2 flex items-center gap-3 px-3 py-2 rounded-[10px] border"
              style={{
                background: 'var(--sl-s2)',
                borderColor: d.value > 0 ? getHeatmapColor(d.value).replace('0.', '0.4').replace('0.04', '0.25') : 'var(--sl-border)',
              }}
            >
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-[var(--sl-t3)]">
                  {d.day} {today.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                </span>
                {d.value > 0 ? (
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[13px] text-[var(--sl-t2)]">{d.cat}</span>
                    <span className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t1)]">
                      {d.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : (
                  <div className="text-[12px] text-[var(--sl-t3)] mt-0.5">Sem gastos</div>
                )}
              </div>
              <button
                onClick={() => setActiveHeatDay(null)}
                className="text-[var(--sl-t3)] text-[16px] leading-none px-1"
              >
                ×
              </button>
            </div>
          )
        })()}

        {/* Quadrados — tap para ver tooltip */}
        <div className="flex gap-[3px]">
          {HEATMAP_DAYS.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveHeatDay(activeHeatDay === i ? null : i)}
              className="w-5 h-5 rounded-[4px] flex-shrink-0 transition-transform active:scale-110"
              style={{
                background: getHeatmapColor(d.value),
                outline: activeHeatDay === i ? '2px solid var(--sl-t2)' : 'none',
                outlineOffset: '1px',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between px-0.5 mt-1">
          <span className="text-[10px] text-[var(--sl-t3)]">Menor gasto</span>
          <span className="text-[10px] text-[var(--sl-t3)]">—</span>
          <span className="text-[10px] text-[var(--sl-t3)]">Maior gasto</span>
        </div>
      </div>

      {/* ─── Ações Rápidas — 4 em Jornada, 3 em Foco (sem Foto Recibo) ─── */}
      <p className="px-5 pb-2 mt-3 font-[Syne] text-[13px] font-semibold uppercase tracking-[0.5px] text-[var(--sl-t2)]">
        Ações Rápidas
      </p>
      <div className="grid gap-2.5 px-4 pb-6 grid-cols-2">
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
            style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
            <Clock size={16} />
          </div>
          <span className="text-[13px] font-medium text-[var(--sl-t1)]">Revisão</span>
          <span className="text-[11px] text-[var(--sl-t2)]">Review semanal</span>
        </button>

        {/* Foto Recibo */}
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

      </>} {/* /!isEmpty */}

    </PanoramaMobileShell>
  )
}
