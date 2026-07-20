'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  DollarSign,
  Activity,
  Target,
  Brain,
  TrendingUp,
  Clock,
  Briefcase,
  Plane,
  Bell,
  Check,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { fmtBRL } from '@/lib/format/currency'

// ─── helpers ──────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

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

// ─── Module palette (v3) ──────────────────────────────

const MOD = {
  fin: '#0F766E',
  fut: '#8B7BD4',
  tmp: '#3CA0B5',
  crp: '#D97534',
  mnt: '#D9962E',
  ptr: '#4F88D4',
  car: '#DB6478',
  exp: '#C76795',
}

// ─── Sub-components ───────────────────────────────────

interface MiniCardProps {
  color: string
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: string
  delta: string
}

function MiniCard({ color, icon: Icon, label, value, delta }: MiniCardProps) {
  return (
    <article
      className="rounded-[14px] p-3 flex flex-col gap-1.5 border bg-[var(--sl-s1)]"
      style={{ borderColor: 'var(--sl-border)' }}
    >
      <div
        className="w-6 h-6 rounded-[7px] inline-flex items-center justify-center"
        style={{ background: hexToRgba(color, 0.14), color }}
      >
        <Icon size={12} />
      </div>
      <div className="text-[9.5px] font-bold tracking-[0.1em] uppercase text-[var(--sl-t3)]">
        {label}
      </div>
      <div className="font-[Space_Grotesk] font-semibold text-[17px] leading-none tabular-nums tracking-[-0.02em] text-[var(--sl-t1)]">
        {value}
      </div>
      <div className="text-[10.5px] tabular-nums" style={{ color: 'var(--sl-em)' }}>
        {delta}
      </div>
    </article>
  )
}

interface DomainTileProps {
  color: string
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: string
  sub: string
  onClick?: () => void
}

function DomainTile({ color, icon: Icon, label, value, sub, onClick }: DomainTileProps) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-[14px] p-3 border bg-[var(--sl-s1)] transition-colors hover:border-[var(--sl-border-h)]"
      style={{ borderColor: 'var(--sl-border)' }}
    >
      <div className="flex justify-between items-center">
        <div
          className="w-[26px] h-[26px] rounded-[8px] inline-flex items-center justify-center"
          style={{ background: hexToRgba(color, 0.14), color }}
        >
          <Icon size={13} />
        </div>
        <ChevronRight size={12} className="text-[var(--sl-t3)]" />
      </div>
      <div className="text-[11.5px] text-[var(--sl-t2)] mt-2">{label}</div>
      <div className="font-[Space_Grotesk] font-semibold text-[18px] tabular-nums tracking-[-0.02em] text-[var(--sl-t1)] mt-0.5">
        {value}
      </div>
      <div className="text-[10.5px] tabular-nums text-[var(--sl-t3)] mt-0.5">{sub}</div>
    </button>
  )
}

interface TodayRowProps {
  done?: boolean
  text: string
  tag: string
  color: string
  time?: string
}

function TodayRow({ done, text, tag, color, time }: TodayRowProps) {
  return (
    <div
      className="flex items-center gap-3 px-3.5 py-3 border-b last:border-b-0"
      style={{ borderColor: 'var(--sl-border)' }}
    >
      <button
        className="w-5 h-5 rounded-full shrink-0 inline-flex items-center justify-center"
        style={{
          border: `1.5px solid ${done ? 'var(--sl-em)' : 'var(--sl-t4)'}`,
          background: done ? 'var(--sl-em)' : 'transparent',
        }}
        aria-label={done ? 'Concluído' : 'Marcar como concluído'}
      >
        {done && <Check size={11} className="text-white" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px]"
          style={{
            color: done ? 'var(--sl-t3)' : 'var(--sl-t1)',
            textDecoration: done ? 'line-through' : 'none',
          }}
        >
          {text}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
          <span className="text-[10.5px] text-[var(--sl-t3)]">{tag}</span>
          {time && (
            <>
              <span className="text-[10.5px] text-[var(--sl-t4)]">·</span>
              <span className="text-[10.5px] tabular-nums text-[var(--sl-t3)]">{time}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────

function EmptyState({ onCTA }: { onCTA: (href: string) => void }) {
  return (
    <div className="px-4 pt-2 pb-6">
      <div className="px-1 pb-3 pt-1">
        <div className="font-[Space_Grotesk] text-[22px] font-bold text-[var(--sl-t1)]">
          Bem-vindo ao SyncLife.
        </div>
        <div className="text-[13px] text-[var(--sl-t2)] mt-1">
          Vamos organizar sua vida juntos.
        </div>
      </div>

      <div
        className="rounded-[16px] p-6 text-center mb-3 border"
        style={{
          background: 'var(--sl-s-hero)',
          borderColor: 'var(--sl-border-em)',
        }}
      >
        <div className="font-[Space_Grotesk] text-[16px] font-bold text-[var(--sl-t1)] mb-2">
          Seu Panorama está vazio
        </div>
        <div className="text-[13px] text-[var(--sl-t2)] leading-[1.5] mb-4">
          Comece registrando sua primeira transação para ver seus dados aqui.
        </div>
        <button
          onClick={() => onCTA('/financas/transacoes')}
          className="inline-flex items-center gap-1.5 px-6 py-3 rounded-[12px] font-[Space_Grotesk] text-[14px] font-bold text-white"
          style={{ background: 'var(--sl-em)' }}
        >
          Começar agora
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] px-1 mb-2 mt-4">
        PRIMEIROS PASSOS
      </div>
      <div className="flex flex-col gap-2">
        {[
          { num: '1', label: 'Registrar primeira transação', hint: 'Desbloqueie: Primeiro Passo (+10 pts)', href: '/financas/transacoes' },
          { num: '2', label: 'Configurar um orçamento', hint: 'Ative os alertas do Dashboard', href: '/financas/orcamentos' },
          { num: '3', label: 'Criar primeiro objetivo', hint: 'Desbloqueie: Primeiro Sonho (+10 pts)', href: '/futuro' },
        ].map(step => (
          <button
            key={step.num}
            onClick={() => onCTA(step.href)}
            className="flex items-center gap-3 p-3.5 rounded-[12px] border border-[var(--sl-border)] bg-[var(--sl-s1)] text-left"
          >
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[14px] font-bold shrink-0"
              style={{ background: 'var(--sl-em-soft)', color: 'var(--sl-em)' }}
            >
              {step.num}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[var(--sl-t1)]">{step.label}</div>
              <div className="text-[11px] text-[var(--sl-t3)] mt-0.5">{step.hint}</div>
            </div>
            <ArrowRight size={14} className="text-[var(--sl-em)] shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────

export function DashboardMobile({
  userName,
  lifeScore,
  alerts,
  goalsAtRisk,
  totalIncome,
  totalExpense,
  isEmpty = false,
}: DashboardMobileProps) {
  const router = useRouter()
  const greeting = useMemo(() => getGreeting(), [])
  const today = new Date()
  const dateLabel = today
    .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
    .replace(/\./g, '')
    .replace(/^./, c => c.toUpperCase())
    .replace(/,/g, ' ·')

  const balance = totalIncome - totalExpense
  const initial = (userName?.[0] ?? 'T').toUpperCase()

  // Progress 0-100 capped
  const scorePct = Math.min(100, Math.max(0, lifeScore))
  const level = Math.floor(scorePct / 6) + 1
  const xpToNext = Math.max(0, Math.round((Math.ceil(scorePct / 6) * 6 - scorePct) * 120))

  // Today list — derived from alerts (real data); fallback to placeholder
  const todayItems = useMemo(() => {
    const items: { done?: boolean; text: string; tag: string; color: string; time?: string }[] = []
    alerts.slice(0, 5).forEach(a => {
      items.push({ text: a.title, tag: a.text, color: a.color })
    })
    while (items.length < 3) {
      items.push({
        done: items.length === 0,
        text: items.length === 0 ? 'Conferir extrato do dia' : 'Registrar atividade',
        tag: items.length === 0 ? 'Finanças' : 'Corpo',
        color: items.length === 0 ? MOD.fin : MOD.crp,
      })
    }
    return items.slice(0, 5)
  }, [alerts])

  const doneCount = todayItems.filter(i => i.done).length

  return (
    <div className="lg:hidden scrollbar-hide" style={{ paddingBottom: 'calc(68px + env(safe-area-inset-bottom, 0px) + 24px)' }}>
      {isEmpty ? (
        <EmptyState onCTA={(href) => router.push(href)} />
      ) : (
        <div className="flex flex-col gap-4 px-[18px] pt-4 pb-2">

          {/* 1 · Top header */}
          <header className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-[DM_Sans] text-[11px] text-[var(--sl-t3)] tracking-[0.12em] uppercase">
                {dateLabel}
              </div>
              <h1 className="font-[Space_Grotesk] font-semibold text-[22px] tracking-[-0.02em] mt-0.5 text-[var(--sl-t1)]">
                {greeting}, {userName}.
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => router.push('/configuracoes/notificacoes')}
                className="w-10 h-10 rounded-full border border-[var(--sl-border)] inline-flex items-center justify-center text-[var(--sl-t2)] active:scale-95 transition-transform"
                aria-label="Notificações"
              >
                <Bell size={16} />
              </button>
              <button
                onClick={() => router.push('/configuracoes')}
                className="w-10 h-10 rounded-full inline-flex items-center justify-center font-[Space_Grotesk] font-bold text-[16px] text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--sl-em-strong) 0%, var(--sl-el) 100%)',
                }}
                aria-label="Perfil"
              >
                {initial}
              </button>
            </div>
          </header>

          {/* 2 · Hero score (compact) */}
          <article
            className="rounded-[18px] p-[18px] flex flex-col gap-2.5 border bg-[var(--sl-s-hero)]"
            style={{ borderColor: 'var(--sl-border)' }}
          >
            <div className="flex items-baseline justify-between">
              <div className="text-[10px] font-bold tracking-[0.14em] text-[var(--sl-t3)]">
                LIFE SYNC SCORE
              </div>
              <span
                className="text-[9.5px] font-semibold px-2 py-[3px] rounded-full border"
                style={{
                  background: 'var(--sl-em-soft)',
                  color: 'var(--sl-em)',
                  borderColor: 'var(--sl-border-em)',
                }}
              >
                +3 sem
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <div
                className="font-[Space_Grotesk] font-bold text-[56px] leading-[0.95] tracking-[-0.035em] tabular-nums text-[var(--sl-t1)]"
              >
                {lifeScore > 0 ? Math.round(lifeScore) : '—'}
              </div>
              <div className="text-[12px] text-[var(--sl-t3)]">
                pontos · Equilibrista
              </div>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--sl-s3)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${scorePct}%`, background: 'var(--sl-grad)' }}
              />
            </div>
            <div className="font-[DM_Sans] tabular-nums text-[11px] text-[var(--sl-t3)]">
              <span style={{ color: 'var(--sl-em)' }}>{xpToNext} XP</span> até o nível {level + 1}
            </div>
          </article>

          {/* 3 · Quick stats (2 cols) */}
          <section className="grid grid-cols-2 gap-2.5">
            <MiniCard
              color={MOD.fin}
              icon={DollarSign}
              label="Saldo do mês"
              value={fmtBRL(balance, { compact: Math.abs(balance) >= 10000 })}
              delta={balance >= 0 ? '+12%' : '-5%'}
            />
            <MiniCard
              color={MOD.crp}
              icon={Activity}
              label="Atividades"
              value="3 / 7"
              delta="esta sem"
            />
          </section>

          {/* 4 · Hoje */}
          <section>
            <div className="flex justify-between items-baseline mb-2.5 px-1">
              <h3 className="font-[Space_Grotesk] text-[14px] font-semibold text-[var(--sl-t1)]">
                Hoje
              </h3>
              <span className="font-[DM_Sans] tabular-nums text-[11px] text-[var(--sl-t3)]">
                {doneCount} / {todayItems.length}
              </span>
            </div>
            <div
              className="rounded-[14px] overflow-hidden border bg-[var(--sl-s1)]"
              style={{ borderColor: 'var(--sl-border)' }}
            >
              {todayItems.map((item, i) => (
                <TodayRow key={i} {...item} />
              ))}
            </div>
          </section>

          {/* 5 · Suas dimensões */}
          <section>
            <div className="flex justify-between items-baseline mb-2.5 px-1">
              <h3 className="font-[Space_Grotesk] text-[14px] font-semibold text-[var(--sl-t1)]">
                Suas dimensões
              </h3>
              <button
                onClick={() => router.push('/configuracoes/modulos')}
                className="text-[11px] inline-flex items-center gap-1"
                style={{ color: 'var(--sl-em)' }}
              >
                Ver todas <ArrowRight size={10} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <DomainTile
                color={MOD.fin}
                icon={DollarSign}
                label="Finanças"
                value={fmtBRL(balance, { compact: true })}
                sub="Saldo do mês"
                onClick={() => router.push('/financas')}
              />
              <DomainTile
                color={MOD.fut}
                icon={Target}
                label="Futuro"
                value={String(goalsAtRisk > 0 ? goalsAtRisk : 3)}
                sub="metas ativas"
                onClick={() => router.push('/futuro')}
              />
              <DomainTile
                color={MOD.mnt}
                icon={Brain}
                label="Mente"
                value="42 min"
                sub="leitura sem"
                onClick={() => router.push('/mente')}
              />
              <DomainTile
                color={MOD.ptr}
                icon={TrendingUp}
                label="Patrimônio"
                value="R$ 24,5k"
                sub="+8,2%"
                onClick={() => router.push('/patrimonio')}
              />
              <DomainTile
                color={MOD.tmp}
                icon={Clock}
                label="Tempo"
                value="4"
                sub="eventos hoje"
                onClick={() => router.push('/tempo')}
              />
              <DomainTile
                color={MOD.car}
                icon={Briefcase}
                label="Carreira"
                value="5"
                sub="habilidades"
                onClick={() => router.push('/carreira')}
              />
              <DomainTile
                color={MOD.crp}
                icon={Activity}
                label="Corpo"
                value="3"
                sub="atividades sem"
                onClick={() => router.push('/corpo')}
              />
              <DomainTile
                color={MOD.exp}
                icon={Plane}
                label="Experiências"
                value="47d"
                sub="próx viagem"
                onClick={() => router.push('/experiencias')}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
