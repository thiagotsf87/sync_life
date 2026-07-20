'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  CheckCircle,
  Lock,
  DollarSign,
  Target,
  HeartPulse,
  Star,
  Trophy,
  PartyPopper,
  Calendar,
  Sparkles,
  Globe,
  ArrowLeft,
  ArrowRight,
  Flame,
  Award,
  UtensilsCrossed,
  Home,
  Car,
  Clapperboard,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateStreak } from '@/hooks/use-panorama'
import { fmtBRL } from '@/lib/format/currency'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getWeekLabel(): string {
  const now   = new Date()
  const day   = now.getDay()
  const diff  = day === 0 ? 0 : day
  const start = new Date(now)
  start.setDate(now.getDate() - diff)
  const end   = new Date(start)
  end.setDate(start.getDate() + 6)

  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
  const yr  = end.getFullYear()
  return `${fmt(start)} · ${fmt(end)} ${yr}`
}

function isReviewAvailable(): boolean {
  const now  = new Date()
  const day  = now.getDay()
  const hour = now.getHours()

  if (day === 0 && hour >= 20) return true
  if (day === 1 || day === 2)  return true
  if (day === 3)               return true
  return false
}

// ─── SLIDE DATA ───────────────────────────────────────────────────────────────

type SlideId = 'capa' | 'financas' | 'metas' | 'corpo' | 'score' | 'badges' | 'cta'

interface SlideMeta {
  id: SlideId
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const SLIDES: SlideMeta[] = [
  { id: 'capa',     label: 'Bem-vindo',  icon: Globe },
  { id: 'financas', label: 'Finanças',   icon: DollarSign },
  { id: 'metas',    label: 'Metas',      icon: Target },
  { id: 'corpo',    label: 'Corpo',      icon: HeartPulse },
  { id: 'score',    label: 'Life Score', icon: Star },
  { id: 'badges',   label: 'Conquistas', icon: Trophy },
  { id: 'cta',      label: 'Conclusão',  icon: CheckCircle },
]

// ─── SLIDE COMPONENTS ─────────────────────────────────────────────────────────

function SlideHeader({ step, total, weekLabel }: { step: number; total: number; weekLabel: string }) {
  return (
    <div className="text-center px-5 pt-4 pb-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sl-em)] mb-1.5">
        SUA SEMANA NO SYNCLIFE
      </p>
      <p className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)] mb-0.5 tracking-tight">
        {weekLabel}
      </p>
      <p className="font-[DM_Sans] text-[12px] text-[var(--sl-t3)]">Slide {step} de {total}</p>
    </div>
  )
}

function SlideFinancas() {
  const cats = [
    { Icon: UtensilsCrossed, label: 'Alimentação', value: fmtBRL(480) },
    { Icon: Home,            label: 'Moradia',     value: fmtBRL(420) },
    { Icon: Car,             label: 'Transporte',  value: fmtBRL(180) },
    { Icon: Clapperboard,    label: 'Lazer',       value: fmtBRL(160) },
  ]
  return (
    <div className="mx-4 rounded-[14px] p-4 bg-[var(--sl-s1)] border border-[var(--sl-border)]">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign size={14} className="text-[var(--sl-success)]" />
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-success)]">
          FINANÇAS DA SEMANA
        </p>
      </div>
      <p className="sl-num-strong text-[28px] font-bold text-[var(--sl-t1)] mb-0.5">{fmtBRL(1240)}</p>
      <p className="font-[DM_Sans] text-[13px] text-[var(--sl-t2)] mb-3">
        gastos esta semana ·{' '}
        <span className="text-[var(--sl-success)] font-semibold">18% menos</span> que a média
      </p>
      <p className="font-[DM_Sans] text-[11px] font-semibold text-[var(--sl-t2)] mb-2">Top categorias</p>
      <div className="flex flex-col gap-2">
        {cats.map((c) => (
          <div key={c.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-[DM_Sans] text-[12px] text-[var(--sl-t1)]">
              <c.Icon size={12} className="text-[var(--sl-t3)]" />
              {c.label}
            </span>
            <span className="sl-num text-[12px] text-[var(--sl-t2)]">{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideMetas() {
  const goals = [
    { label: 'Reserva de emergência', from: 68, to: 70, color: 'var(--sl-em)' },
    { label: 'Viagem Europa',         from: 42, to: 42, color: 'var(--sl-warning)' },
    { label: 'Curso Python',          from: 15, to: 22, color: '#8B7BD4' },
  ]
  return (
    <div className="mx-4 rounded-[14px] p-4 bg-[var(--sl-s1)] border border-[var(--sl-border)]">
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className="text-[#8B7BD4]" />
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8B7BD4]">
          METAS ATIVAS · PROGRESSO
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {goals.map((g) => {
          const diff = g.to - g.from
          return (
            <div key={g.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-[DM_Sans] text-[13px] text-[var(--sl-t1)]">{g.label}</span>
                <span className="sl-num text-[11px]" style={{ color: g.color }}>
                  {g.from}% → {g.to}%{diff > 0 ? ` (+${diff}%)` : ' (sem aporte)'}
                </span>
              </div>
              <div className="h-[4px] rounded-full bg-[var(--sl-s3)] overflow-hidden">
                <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${g.to}%`, background: g.color }} />
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
    { label: 'Treinos',         value: '4 sessões',    color: 'var(--sl-mod-corp, #D97534)' },
    { label: 'Peso registrado', value: '73,8 kg',      color: 'var(--sl-em)' },
    { label: 'Água média/dia',  value: '2,1 L',        color: 'var(--sl-info)' },
    { label: 'Sono médio',      value: '7h 12min',     color: '#8B7BD4' },
  ]
  return (
    <div className="mx-4 rounded-[14px] p-4 bg-[var(--sl-s1)] border border-[var(--sl-border)]">
      <div className="flex items-center gap-2 mb-3">
        <HeartPulse size={14} className="text-[#D97534]" />
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#D97534]">
          CORPO · DADOS DA SEMANA
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] p-3">
            <p className="font-[DM_Sans] text-[10px] text-[var(--sl-t3)] mb-1">{m.label}</p>
            <p className="sl-num-strong text-[16px] font-semibold" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideScore() {
  const modules = [
    { label: 'Finanças',    pct: 72, color: 'var(--sl-success)' },
    { label: 'Futuro',      pct: 55, color: '#8B7BD4' },
    { label: 'Corpo',       pct: 80, color: '#D97534' },
    { label: 'Tempo',       pct: 65, color: 'var(--sl-info)' },
    { label: 'Mente',       pct: 50, color: 'var(--sl-warning)' },
  ]
  const score = 68
  const r = 52
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ

  return (
    <div className="mx-4">
      <div className="rounded-[14px] p-4 text-center bg-[var(--sl-s-hero)] border border-[var(--sl-border)]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Star size={14} className="text-[var(--sl-em)]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-em)]">
            LIFE SYNC SCORE · SEMANA
          </p>
        </div>
        <div className="flex items-center justify-center mb-3">
          <div className="relative" style={{ width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="reviewRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0F766E" />
                  <stop offset="100%" stopColor="#0B2D34" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r={r} fill="none" stroke="var(--sl-s3)" strokeWidth="8" />
              <circle cx="60" cy="60" r={r} fill="none"
                stroke="url(#reviewRingGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${fill} ${circ - fill}`}
                style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[Syne] sl-num-strong text-[32px] font-extrabold leading-none text-[var(--sl-t1)]">
                {score}
              </span>
              <span className="font-[DM_Sans] text-[10px] text-[var(--sl-t3)] mt-0.5">de 100</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-[var(--sl-em)] bg-[var(--sl-em-soft)] border border-[var(--sl-border-em)]">
            <Sparkles size={11} /> +4 pts vs semana anterior
          </span>
        </div>
        <div className="flex flex-col gap-2 text-left">
          {modules.map((m) => (
            <div key={m.label} className="flex items-center gap-2.5">
              <span className="font-[DM_Sans] text-[11px] text-[var(--sl-t2)] w-[72px] shrink-0">{m.label}</span>
              <div className="flex-1 h-[4px] rounded-full bg-[var(--sl-s3)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
              </div>
              <span className="sl-num text-[11px] text-[var(--sl-t2)] w-[28px] text-right">{m.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SlideBadges() {
  const badgesThisWeek = [
    { Icon: Award,  name: 'Primeiro Registro', rarity: 'Comum',   pts: 10, color: 'var(--sl-t3)' },
    { Icon: Flame,  name: '7 Dias Seguidos',   rarity: 'Incomum', pts: 25, color: 'var(--sl-em)' },
  ]
  return (
    <div className="mx-4 rounded-[14px] p-4 bg-[var(--sl-s1)] border border-[var(--sl-border)]">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={14} className="text-[var(--sl-warning)]" />
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-warning)]">
          CONQUISTAS DESTA SEMANA
        </p>
      </div>
      {badgesThisWeek.length > 0 ? (
        <div className="flex flex-col gap-3">
          {badgesThisWeek.map((b) => {
            const Icon = b.Icon
            return (
              <div key={b.name} className="flex items-center gap-3 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] p-3">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 bg-[var(--sl-s3)]" style={{ color: b.color }}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[DM_Sans] text-[13px] font-semibold text-[var(--sl-t1)]">{b.name}</p>
                  <p className="font-[DM_Sans] text-[11px] font-medium" style={{ color: b.color }}>{b.rarity} · +{b.pts} pts</p>
                </div>
                <CheckCircle size={18} className="text-[var(--sl-success)] shrink-0" />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <Target size={32} className="mx-auto mb-2 text-[var(--sl-t3)]" />
          <p className="font-[DM_Sans] text-[13px] text-[var(--sl-t2)]">Nenhuma badge desbloqueada essa semana.</p>
          <p className="font-[DM_Sans] text-[12px] text-[var(--sl-t3)] mt-1">Continue assim, você está perto.</p>
        </div>
      )}
    </div>
  )
}

function SlideCTA({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="mx-4">
      <div className="rounded-[14px] p-5 text-center mb-4 bg-[var(--sl-s-hero)] border border-[var(--sl-border)]">
        <div className="w-14 h-14 mx-auto mb-3 rounded-[14px] flex items-center justify-center bg-[var(--sl-em-soft)] border border-[var(--sl-border-em)]">
          <PartyPopper size={26} className="text-[var(--sl-em)]" />
        </div>
        <p className="font-[Syne] text-[20px] font-extrabold text-[var(--sl-t1)] mb-2 tracking-tight">
          Review completo
        </p>
        <p className="font-[DM_Sans] text-[13px] text-[var(--sl-t2)] leading-[1.6] mb-4">
          Você ganhou{' '}
          <span className="sl-num-strong font-bold text-[var(--sl-warning)]">+50 pts</span>
          {' '}por completar sua review semanal. Sua streak continua.
        </p>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold text-[var(--sl-em)] bg-[var(--sl-em-soft)] border border-[var(--sl-border-em)]">
            <Star size={12} /> +50 XP adicionados
          </span>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full h-[52px] rounded-[14px] flex items-center justify-center gap-2
                   font-[Syne] text-[15px] font-bold text-white transition-all mb-3 bg-[var(--sl-em)] hover:opacity-90"
      >
        Ir para o Dashboard
      </button>

      <button
        className="w-full h-[48px] rounded-[14px] flex items-center justify-center gap-2
                   font-[DM_Sans] text-[14px] font-medium text-[var(--sl-t2)] bg-[var(--sl-s1)]
                   border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] transition-colors"
      >
        <Lock size={14} />
        Compartilhar · PRO
      </button>
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function WeeklyReviewPage() {
  const router = useRouter()
  const [step, setStep]     = useState(0)
  const [, setSaving]       = useState(false)
  const [done, setDone]     = useState(false)
  const weekLabel = useMemo(() => getWeekLabel(), [])
  const total     = SLIDES.length
  const available = useMemo(() => isReviewAvailable(), [])

  async function handleComplete() {
    if (done) { router.push('/dashboard'); return }
    setSaving(true)
    try {
      const sb = createClient() as any
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        const weekStart = new Date()
        const day = weekStart.getDay()
        weekStart.setDate(weekStart.getDate() - (day === 0 ? 0 : day))
        await sb.from('weekly_reviews').upsert({
          user_id:       user.id,
          week_start:    weekStart.toISOString().slice(0, 10),
          completed_at:  new Date().toISOString(),
          score_gained:  50,
        }, { onConflict: 'user_id,week_start' })

        await updateStreak(user.id)
      }
    } catch (err) { console.error('[Review] Falha ao salvar review semanal:', err) }
    setDone(true)
    setSaving(false)
    router.push('/dashboard')
  }

  if (!available) {
    return (
      <div className="fixed inset-0 z-50 bg-[var(--sl-bg)] flex flex-col items-center justify-center px-6 lg:relative lg:max-w-[600px] lg:mx-auto">
        <div className="w-14 h-14 mb-4 rounded-[14px] flex items-center justify-center bg-[var(--sl-em-soft)] border border-[var(--sl-border-em)]">
          <Calendar size={26} className="text-[var(--sl-em)]" />
        </div>
        <h2 className="font-[Syne] text-[22px] font-bold text-[var(--sl-t1)] text-center mb-2 tracking-tight">
          Review indisponível
        </h2>
        <p className="font-[DM_Sans] text-[13px] text-[var(--sl-t2)] text-center leading-[1.6] mb-6">
          A review semanal fica disponível de{' '}
          <strong className="text-[var(--sl-t1)]">domingo às 20h</strong> até{' '}
          <strong className="text-[var(--sl-t1)]">quarta-feira às 23h59</strong>.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 rounded-[12px] font-[DM_Sans] text-[14px] font-semibold text-white bg-[var(--sl-em)] hover:opacity-90 transition-opacity"
        >
          Voltar ao Dashboard
        </button>
      </div>
    )
  }

  const current = SLIDES[step]
  const isCTA   = current.id === 'cta'
  const StepIcon = current.icon

  return (
    <div className="fixed inset-0 z-50 bg-[var(--sl-bg)] flex flex-col lg:relative lg:max-w-[600px] lg:mx-auto lg:min-h-0">

      {/* Close */}
      <div className="flex items-center justify-end px-4 pt-4 pb-1 shrink-0">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex h-9 w-9 items-center justify-center rounded-[10px]
                     bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]
                     hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Slide label */}
      <div className="flex items-center justify-center gap-1.5 px-4 pb-0 shrink-0 text-[var(--sl-em)]">
        <StepIcon size={12} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
          {current.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <SlideHeader step={step + 1} total={total} weekLabel={weekLabel} />

        <div className="pb-4">
          {current.id === 'capa' && (
            <div className="mx-4 rounded-[14px] p-6 text-center bg-[var(--sl-s-hero)] border border-[var(--sl-border)]">
              <div className="w-16 h-16 mx-auto mb-3 rounded-[16px] flex items-center justify-center bg-[var(--sl-em-soft)] border border-[var(--sl-border-em)]">
                <Globe size={28} className="text-[var(--sl-em)]" />
              </div>
              <p className="font-[Syne] text-[22px] font-extrabold text-[var(--sl-t1)] mb-2 tracking-tight">
                Sua semana em review
              </p>
              <p className="font-[DM_Sans] text-[13px] text-[var(--sl-t2)] leading-[1.6]">
                Vamos juntos analisar o que aconteceu e comemorar suas conquistas. Complete para ganhar{' '}
                <span className="sl-num-strong font-bold text-[var(--sl-warning)]">+50 pts</span>.
              </p>
            </div>
          )}
          {current.id === 'financas' && <SlideFinancas />}
          {current.id === 'metas'    && <SlideMetas />}
          {current.id === 'corpo'    && <SlideCorpo />}
          {current.id === 'score'    && <SlideScore />}
          {current.id === 'badges'   && <SlideBadges />}
          {current.id === 'cta'      && <SlideCTA onComplete={handleComplete} />}
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
                  background: i === step ? 'var(--sl-em)' : 'var(--sl-em-soft)',
                }}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex-1 h-[48px] rounded-[12px] flex items-center justify-center gap-1.5
                         font-[DM_Sans] text-[14px] font-semibold
                         bg-[var(--sl-s1)] border border-[var(--sl-border)]
                         text-[var(--sl-t2)] disabled:opacity-30
                         hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
            >
              <ArrowLeft size={14} /> Anterior
            </button>
            <button
              onClick={() => setStep(s => Math.min(total - 1, s + 1))}
              className="flex-1 h-[48px] rounded-[12px] flex items-center justify-center gap-1.5
                         font-[DM_Sans] text-[14px] font-bold text-white transition-opacity bg-[var(--sl-em)] hover:opacity-90"
            >
              {step === total - 2 ? 'Ver conclusão' : 'Próximo'} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
