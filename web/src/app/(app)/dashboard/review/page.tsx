'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Share2, CheckCircle, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateStreak } from '@/hooks/use-panorama'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getWeekLabel(): string {
  const now   = new Date()
  const day   = now.getDay() // 0=dom
  // Start of last Sunday
  const diff  = day === 0 ? 0 : day
  const start = new Date(now)
  start.setDate(now.getDate() - diff)
  const end   = new Date(start)
  end.setDate(start.getDate() + 6)

  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
  const yr  = end.getFullYear()
  return `${fmt(start)} — ${fmt(end)} ${yr}`
}

function isReviewAvailable(): boolean {
  const now  = new Date()
  const day  = now.getDay() // 0=dom, 1=seg, 2=ter, 3=qua
  const hour = now.getHours()

  // Dom 20h → Qua 23:59
  if (day === 0 && hour >= 20) return true
  if (day === 1 || day === 2)  return true
  if (day === 3)               return true // todo o dia
  return false
}

// ─── SLIDE DATA (mock — em produção viria de hooks de cada módulo) ─────────────

const SLIDES = [
  { id: 'capa'     },
  { id: 'financas' },
  { id: 'metas'    },
  { id: 'corpo'    },
  { id: 'score'    },
  { id: 'badges'   },
  { id: 'cta'      },
]

const SLIDE_LABELS: Record<string, string> = {
  capa:     'Bem-vindo',
  financas: '💰 Finanças',
  metas:    '🎯 Metas',
  corpo:    '🏃 Corpo',
  score:    '⭐ Life Score',
  badges:   '🏆 Conquistas',
  cta:      '✅ Conclusão',
}

// ─── SLIDE COMPONENTS ─────────────────────────────────────────────────────────

function SlideHeader({ step, total, weekLabel }: { step: number; total: number; weekLabel: string }) {
  return (
    <div className="text-center px-5 pt-4 pb-3">
      <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#6366f1] mb-1.5">
        SUA SEMANA NO SYNCLIFE
      </p>
      <p className="font-[Syne] text-[17px] font-bold text-[var(--sl-t1)] mb-0.5">
        {weekLabel}
      </p>
      <p className="text-[11px] text-[var(--sl-t3)]">Slide {step} de {total}</p>
    </div>
  )
}

function SlideFinancas() {
  const cats = [
    { label: '🍔 Alimentação', value: 'R$ 480' },
    { label: '🏠 Moradia',     value: 'R$ 420' },
    { label: '🚗 Transporte',  value: 'R$ 180' },
    { label: '🎬 Lazer',       value: 'R$ 160' },
  ]
  return (
    <div className="mx-4 rounded-[14px] p-4"
         style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.2)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#10b981] mb-2">
        💰 Finanças da semana
      </p>
      <p className="font-[DM_Mono] text-[28px] font-bold text-[var(--sl-t1)] mb-0.5">R$ 1.240</p>
      <p className="text-[13px] text-[var(--sl-t2)] mb-3">
        gastos esta semana ·{' '}
        <span className="text-[#10b981] font-semibold">18% menos</span> que a média
      </p>
      <p className="text-[11px] font-semibold text-[var(--sl-t2)] mb-2">Top categorias:</p>
      <div className="flex flex-col gap-2">
        {cats.map((c) => (
          <div key={c.label} className="flex items-center justify-between">
            <span className="text-[12px] text-[var(--sl-t1)]">{c.label}</span>
            <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t2)]">{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideMetas() {
  const goals = [
    { label: 'Reserva de emergência', from: 68, to: 70, color: '#10b981' },
    { label: 'Viagem Europa',         from: 42, to: 42, color: '#f59e0b' },
    { label: 'Curso Python',          from: 15, to: 22, color: '#6366f1' },
  ]
  return (
    <div className="mx-4 rounded-[14px] p-4"
         style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(0,85,255,0.03))', border: '1px solid rgba(99,102,241,0.2)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#6366f1] mb-3">
        🎯 Metas ativas — progresso
      </p>
      <div className="flex flex-col gap-4">
        {goals.map((g) => {
          const diff = g.to - g.from
          return (
            <div key={g.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] text-[var(--sl-t1)]">{g.label}</span>
                <span className="font-[DM_Mono] text-[11px]" style={{ color: g.color }}>
                  {g.from}% → {g.to}%{diff > 0 ? ` (+${diff}%)` : ' (sem aporte)'}
                </span>
              </div>
              <div className="h-[4px] rounded-full bg-[var(--sl-s3)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${g.to}%`, background: g.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SlideCorpo() {
  const metrics = [
    { label: 'Treinos',         value: '4 sessões',    color: '#f97316' },
    { label: 'Peso registrado', value: '73,8 kg',      color: '#10b981' },
    { label: 'Água média/dia',  value: '2,1 L',        color: '#06b6d4' },
    { label: 'Sono médio',      value: '7h 12min',     color: '#a855f7' },
  ]
  return (
    <div className="mx-4 rounded-[14px] p-4"
         style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.02))', border: '1px solid rgba(249,115,22,0.2)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#f97316] mb-3">
        🏃 Corpo — dados da semana
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
            <p className="text-[10px] text-[var(--sl-t3)] mb-1">{m.label}</p>
            <p className="font-[DM_Mono] text-[16px] font-medium" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideScore() {
  const modules = [
    { label: 'Finanças',    pct: 72, color: '#10b981' },
    { label: 'Futuro',      pct: 55, color: '#8b5cf6' },
    { label: 'Corpo',       pct: 80, color: '#f97316' },
    { label: 'Tempo',       pct: 65, color: '#06b6d4' },
    { label: 'Mente',       pct: 50, color: '#eab308' },
  ]
  const score = 68
  const r = 52
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ

  return (
    <div className="mx-4">
      <div className="rounded-[14px] p-4 text-center"
           style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(0,85,255,0.05))', border: '1px solid rgba(99,102,241,0.25)' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#6366f1] mb-3">
          ⭐ Life Sync Score — semana
        </p>
        <div className="flex items-center justify-center mb-3">
          <div className="relative" style={{ width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="reviewRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#0055ff" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r={r} fill="none" stroke="var(--sl-s3)" strokeWidth="8" />
              <circle cx="60" cy="60" r={r} fill="none"
                stroke="url(#reviewRingGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${fill} ${circ - fill}`}
                style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[Syne] text-[28px] font-extrabold leading-none"
                style={{ background: 'linear-gradient(135deg, #6366f1, #0055ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {score}
              </span>
              <span className="text-[10px] text-[var(--sl-t3)]">/ 100</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#10b981]"
                style={{ background: 'rgba(16,185,129,0.12)' }}>
            ▲ +4 pts vs semana anterior
          </span>
        </div>
        <div className="flex flex-col gap-2 text-left">
          {modules.map((m) => (
            <div key={m.label} className="flex items-center gap-2.5">
              <span className="text-[11px] text-[var(--sl-t2)] w-[72px] shrink-0">{m.label}</span>
              <div className="flex-1 h-[4px] rounded-full bg-[var(--sl-s3)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
              </div>
              <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t2)] w-[28px] text-right">{m.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SlideBadges() {
  const badgesThisWeek = [
    { icon: '💰', name: 'Primeiro Registro', rarity: 'Comum', pts: 10, color: '#64748b' },
    { icon: '🔥', name: '7 Dias Seguidos',   rarity: 'Incomum', pts: 25, color: '#10b981' },
  ]
  return (
    <div className="mx-4 rounded-[14px] p-4"
         style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))', border: '1px solid rgba(245,158,11,0.2)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#f59e0b] mb-3">
        🏆 Conquistas desta semana
      </p>
      {badgesThisWeek.length > 0 ? (
        <div className="flex flex-col gap-3">
          {badgesThisWeek.map((b) => (
            <div key={b.name} className="flex items-center gap-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] p-3">
              <span className="text-[28px] shrink-0">{b.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{b.name}</p>
                <p className="text-[11px] font-medium" style={{ color: b.color }}>{b.rarity} · +{b.pts} pts</p>
              </div>
              <CheckCircle size={18} className="text-[#10b981] shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-[32px] mb-2">🎯</p>
          <p className="text-[13px] text-[var(--sl-t2)]">Nenhuma badge desbloqueada essa semana.</p>
          <p className="text-[12px] text-[var(--sl-t3)] mt-1">Continue assim — você está perto!</p>
        </div>
      )}
    </div>
  )
}

function SlideCTA({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="mx-4">
      <div className="rounded-[14px] p-5 text-center mb-4"
           style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(0,85,255,0.06))', border: '1px solid rgba(99,102,241,0.25)' }}>
        <div className="text-[48px] mb-3">🎉</div>
        <p className="font-[Syne] text-[20px] font-extrabold text-[var(--sl-t1)] mb-2">
          Review completo!
        </p>
        <p className="text-[13px] text-[var(--sl-t2)] leading-[1.6] mb-4">
          Você ganhou{' '}
          <span className="font-[DM_Mono] font-bold text-[#f59e0b]">+50 pts</span>
          {' '}por completar sua review semanal. Sua streak continua!
        </p>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#6366f1]"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
            ⭐ +50 XP adicionados
          </span>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full h-[52px] rounded-[14px] flex items-center justify-center gap-2
                   font-[Syne] text-[15px] font-bold text-white transition-all mb-3"
        style={{ background: 'linear-gradient(135deg, #6366f1, #0055ff)' }}
      >
        Ir para o Dashboard
      </button>

      <button
        className="w-full h-[48px] rounded-[14px] flex items-center justify-center gap-2
                   text-[14px] font-medium text-[var(--sl-t2)] bg-[var(--sl-s1)]
                   border border-[var(--sl-border)] transition-all"
      >
        <Lock size={14} />
        Compartilhar — PRO
      </button>
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function WeeklyReviewPage() {
  const router = useRouter()
  const [step, setStep]         = useState(0)        // 0-indexed
  const [saving, setSaving]     = useState(false)
  const [done, setDone]         = useState(false)
  const weekLabel = useMemo(() => getWeekLabel(), [])
  const total     = SLIDES.length
  const available = useMemo(() => isReviewAvailable(), [])

  async function handleComplete() {
    if (done) { router.push('/dashboard'); return }
    setSaving(true)
    try {
      const sb   = createClient() as any
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        // Salvar review semanal
        const weekStart = new Date()
        const day = weekStart.getDay()
        weekStart.setDate(weekStart.getDate() - (day === 0 ? 0 : day))
        await sb.from('weekly_reviews').upsert({
          user_id:       user.id,
          week_start:    weekStart.toISOString().slice(0, 10),
          completed_at:  new Date().toISOString(),
          score_gained:  50,
        }, { onConflict: 'user_id,week_start' })

        // Atualizar streak
        await updateStreak(user.id)
      }
    } catch (err) { console.error('[Review] Falha ao salvar review semanal:', err) }
    setDone(true)
    setSaving(false)
    router.push('/dashboard')
  }

  // Review indisponível fora do período
  if (!available) {
    return (
      <div className="fixed inset-0 z-50 bg-[var(--sl-bg)] flex flex-col items-center justify-center px-6 lg:relative lg:max-w-[600px] lg:mx-auto">
        <div className="text-[48px] mb-4">📅</div>
        <h2 className="font-[Syne] text-[20px] font-bold text-[var(--sl-t1)] text-center mb-2">
          Review indisponível
        </h2>
        <p className="text-[13px] text-[var(--sl-t2)] text-center leading-[1.6] mb-6">
          A review semanal fica disponível de{' '}
          <strong className="text-[var(--sl-t1)]">domingo às 20h</strong> até{' '}
          <strong className="text-[var(--sl-t1)]">quarta-feira às 23h59</strong>.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 rounded-[12px] text-[14px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #0055ff)' }}
        >
          Voltar ao Dashboard
        </button>
      </div>
    )
  }

  const isCTA = SLIDES[step].id === 'cta'

  return (
    <div className="fixed inset-0 z-50 bg-[var(--sl-bg)] flex flex-col lg:relative lg:max-w-[600px] lg:mx-auto lg:min-h-0">

      {/* Close */}
      <div className="flex items-center justify-end px-4 pt-4 pb-1 shrink-0">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex h-9 w-9 items-center justify-center rounded-[10px]
                     bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]
                     hover:bg-[var(--sl-s2)] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Slide label */}
      <div className="flex items-center justify-center px-4 pb-0 shrink-0">
        <span className="text-[11px] font-semibold text-[#6366f1] uppercase tracking-[1px]">
          {SLIDE_LABELS[SLIDES[step].id]}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <SlideHeader step={step + 1} total={total} weekLabel={weekLabel} />

        <div className="pb-4">
          {SLIDES[step].id === 'capa'     && (
            <div className="mx-4 rounded-[14px] p-6 text-center"
                 style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(0,85,255,0.06))', border: '1px solid rgba(99,102,241,0.25)' }}>
              <div className="text-[52px] mb-3">🌐</div>
              <p className="font-[Syne] text-[20px] font-extrabold text-[var(--sl-t1)] mb-2">
                Sua semana em review
              </p>
              <p className="text-[13px] text-[var(--sl-t2)] leading-[1.6]">
                Vamos juntos analisar o que aconteceu e comemorar suas conquistas. Complete para ganhar{' '}
                <span className="font-[DM_Mono] font-bold text-[#f59e0b]">+50 pts</span>.
              </p>
            </div>
          )}
          {SLIDES[step].id === 'financas' && <SlideFinancas />}
          {SLIDES[step].id === 'metas'    && <SlideMetas />}
          {SLIDES[step].id === 'corpo'    && <SlideCorpo />}
          {SLIDES[step].id === 'score'    && <SlideScore />}
          {SLIDES[step].id === 'badges'   && <SlideBadges />}
          {SLIDES[step].id === 'cta'      && <SlideCTA onComplete={handleComplete} />}
        </div>
      </div>

      {/* Navigation dots + buttons (not on CTA) */}
      {!isCTA && (
        <div className="shrink-0 px-4 pb-6 pt-2 bg-[var(--sl-bg)] border-t border-[var(--sl-border)]">
          {/* Dots */}
          <div className="flex items-center justify-center gap-[6px] mb-3">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === step ? 20 : 8,
                  height:     8,
                  background: i === step ? '#6366f1' : 'rgba(99,102,241,0.25)',
                }}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex-1 h-[48px] rounded-[12px] text-[14px] font-semibold
                         bg-[var(--sl-s1)] border border-[var(--sl-border)]
                         text-[var(--sl-t2)] disabled:opacity-30 transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setStep(s => Math.min(total - 1, s + 1))}
              className="flex-1 h-[48px] rounded-[12px] text-[14px] font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #0055ff)' }}
            >
              {step === total - 2 ? 'Ver conclusão →' : 'Próximo →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
