'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useShellStore } from '@/stores/shell-store'
import { cn } from '@/lib/utils'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type RankTab = 'global' | 'mensal' | 'semanal'

interface RankUser {
  position:      number
  name:          string
  initials:      string
  score:         number
  badgeCount:    number
  streak:        number
  avatarColor:   string
  trend:         'up' | 'down' | 'same'
  trendValue:    number
  isCurrentUser?: boolean
}

// ─── DADOS MOCK ───────────────────────────────────────────────────────────────

// Top 20 — ranking global (todos os tempos)
const GLOBAL_TOP: RankUser[] = [
  { position: 1,  name: 'Mariana Oliveira',  initials: 'MO', score: 847, badgeCount: 21, streak: 92, avatarColor: '#10b981', trend: 'same', trendValue: 0 },
  { position: 2,  name: 'Rafael Santos',     initials: 'RS', score: 720, badgeCount: 19, streak: 65, avatarColor: '#0055ff', trend: 'up',   trendValue: 1 },
  { position: 3,  name: 'Juliana Costa',     initials: 'JC', score: 685, badgeCount: 18, streak: 44, avatarColor: '#f59e0b', trend: 'down', trendValue: 1 },
  { position: 4,  name: 'Pedro Almeida',     initials: 'PA', score: 630, badgeCount: 17, streak: 38, avatarColor: '#a855f7', trend: 'up',   trendValue: 2 },
  { position: 5,  name: 'Ana Ferreira',      initials: 'AF', score: 588, badgeCount: 16, streak: 30, avatarColor: '#f97316', trend: 'same', trendValue: 0 },
  { position: 6,  name: 'Carlos Mendes',     initials: 'CM', score: 542, badgeCount: 15, streak: 25, avatarColor: '#06b6d4', trend: 'up',   trendValue: 3 },
  { position: 7,  name: 'Beatriz Lima',      initials: 'BL', score: 498, badgeCount: 14, streak: 21, avatarColor: '#ec4899', trend: 'down', trendValue: 2 },
  { position: 8,  name: 'Lucas Rocha',       initials: 'LR', score: 465, badgeCount: 14, streak: 18, avatarColor: '#14b8a6', trend: 'up',   trendValue: 1 },
  { position: 9,  name: 'Fernanda Souza',    initials: 'FS', score: 432, badgeCount: 13, streak: 15, avatarColor: '#84cc16', trend: 'same', trendValue: 0 },
  { position: 10, name: 'Gabriel Nunes',     initials: 'GN', score: 410, badgeCount: 13, streak: 14, avatarColor: '#f43f5e', trend: 'down', trendValue: 1 },
  { position: 11, name: 'Isabela Carvalho',  initials: 'IC', score: 385, badgeCount: 12, streak: 12, avatarColor: '#0055ff', trend: 'up',   trendValue: 2 },
  { position: 12, name: 'Thiago Pereira',    initials: 'TP', score: 362, badgeCount: 12, streak: 11, avatarColor: '#10b981', trend: 'same', trendValue: 0 },
  { position: 13, name: 'Larissa Martins',   initials: 'LM', score: 340, badgeCount: 11, streak: 10, avatarColor: '#f59e0b', trend: 'up',   trendValue: 1 },
  { position: 14, name: 'Diego Barbosa',     initials: 'DB', score: 318, badgeCount: 11, streak: 9,  avatarColor: '#a855f7', trend: 'down', trendValue: 3 },
  { position: 15, name: 'Camila Rodrigues',  initials: 'CR', score: 295, badgeCount: 10, streak: 8,  avatarColor: '#f97316', trend: 'up',   trendValue: 1 },
  { position: 16, name: 'Henrique Gomes',    initials: 'HG', score: 272, badgeCount: 10, streak: 7,  avatarColor: '#06b6d4', trend: 'same', trendValue: 0 },
  { position: 17, name: 'Natália Silva',     initials: 'NS', score: 250, badgeCount: 9,  streak: 7,  avatarColor: '#ec4899', trend: 'up',   trendValue: 2 },
  { position: 18, name: 'Bruno Castro',      initials: 'BC', score: 228, badgeCount: 9,  streak: 6,  avatarColor: '#14b8a6', trend: 'down', trendValue: 1 },
  { position: 19, name: 'Priscila Torres',   initials: 'PT', score: 215, badgeCount: 8,  streak: 5,  avatarColor: '#84cc16', trend: 'same', trendValue: 0 },
  { position: 20, name: 'Vítor Nascimento',  initials: 'VN', score: 208, badgeCount: 8,  streak: 5,  avatarColor: '#f43f5e', trend: 'up',   trendValue: 1 },
  // Usuário fora do top 20 — exibido com separador
  { position: 38, name: 'Você',              initials: 'EU', score: 195, badgeCount: 12, streak: 7,  avatarColor: '#10b981', trend: 'up',   trendValue: 4, isCurrentUser: true },
]

// Top 20 — este mês (usuário aparece na lista em #15)
const MONTHLY_TOP: RankUser[] = [
  { position: 1,  name: 'Mariana Oliveira',  initials: 'MO', score: 120, badgeCount: 3, streak: 92, avatarColor: '#10b981', trend: 'same', trendValue: 0 },
  { position: 2,  name: 'Rafael Santos',     initials: 'RS', score: 110, badgeCount: 3, streak: 65, avatarColor: '#0055ff', trend: 'up',   trendValue: 1 },
  { position: 3,  name: 'Juliana Costa',     initials: 'JC', score: 95,  badgeCount: 2, streak: 44, avatarColor: '#f59e0b', trend: 'same', trendValue: 0 },
  { position: 4,  name: 'Gabriel Nunes',     initials: 'GN', score: 90,  badgeCount: 2, streak: 14, avatarColor: '#f43f5e', trend: 'up',   trendValue: 6 },
  { position: 5,  name: 'Pedro Almeida',     initials: 'PA', score: 85,  badgeCount: 2, streak: 38, avatarColor: '#a855f7', trend: 'same', trendValue: 0 },
  { position: 6,  name: 'Natália Silva',     initials: 'NS', score: 80,  badgeCount: 2, streak: 7,  avatarColor: '#ec4899', trend: 'up',   trendValue: 11 },
  { position: 7,  name: 'Beatriz Lima',      initials: 'BL', score: 75,  badgeCount: 2, streak: 21, avatarColor: '#ec4899', trend: 'up',   trendValue: 0 },
  { position: 8,  name: 'Carlos Mendes',     initials: 'CM', score: 70,  badgeCount: 2, streak: 25, avatarColor: '#06b6d4', trend: 'down', trendValue: 2 },
  { position: 9,  name: 'Ana Ferreira',      initials: 'AF', score: 65,  badgeCount: 1, streak: 30, avatarColor: '#f97316', trend: 'same', trendValue: 0 },
  { position: 10, name: 'Diego Barbosa',     initials: 'DB', score: 60,  badgeCount: 1, streak: 9,  avatarColor: '#a855f7', trend: 'up',   trendValue: 4 },
  { position: 11, name: 'Isabela Carvalho',  initials: 'IC', score: 55,  badgeCount: 1, streak: 12, avatarColor: '#0055ff', trend: 'up',   trendValue: 0 },
  { position: 12, name: 'Lucas Rocha',       initials: 'LR', score: 50,  badgeCount: 1, streak: 18, avatarColor: '#14b8a6', trend: 'down', trendValue: 3 },
  { position: 13, name: 'Camila Rodrigues',  initials: 'CR', score: 45,  badgeCount: 1, streak: 8,  avatarColor: '#f97316', trend: 'up',   trendValue: 2 },
  { position: 14, name: 'Fernanda Souza',    initials: 'FS', score: 40,  badgeCount: 1, streak: 15, avatarColor: '#84cc16', trend: 'same', trendValue: 0 },
  { position: 15, name: 'Você',             initials: 'EU', score: 40,  badgeCount: 1, streak: 7,  avatarColor: '#10b981', trend: 'up',   trendValue: 2, isCurrentUser: true },
  { position: 16, name: 'Henrique Gomes',   initials: 'HG', score: 35,  badgeCount: 1, streak: 7,  avatarColor: '#06b6d4', trend: 'same', trendValue: 0 },
  { position: 17, name: 'Thiago Pereira',   initials: 'TP', score: 30,  badgeCount: 0, streak: 11, avatarColor: '#10b981', trend: 'down', trendValue: 5 },
  { position: 18, name: 'Larissa Martins',  initials: 'LM', score: 25,  badgeCount: 0, streak: 10, avatarColor: '#f59e0b', trend: 'up',   trendValue: 1 },
  { position: 19, name: 'Bruno Castro',     initials: 'BC', score: 20,  badgeCount: 0, streak: 6,  avatarColor: '#14b8a6', trend: 'down', trendValue: 2 },
  { position: 20, name: 'Priscila Torres',  initials: 'PT', score: 15,  badgeCount: 0, streak: 5,  avatarColor: '#84cc16', trend: 'same', trendValue: 0 },
]

// Top 10 — esta semana (usuário em #7)
const WEEKLY_TOP: RankUser[] = [
  { position: 1,  name: 'Gabriel Nunes',    initials: 'GN', score: 45, badgeCount: 2, streak: 14, avatarColor: '#f43f5e', trend: 'up',   trendValue: 9 },
  { position: 2,  name: 'Beatriz Lima',     initials: 'BL', score: 40, badgeCount: 2, streak: 21, avatarColor: '#ec4899', trend: 'up',   trendValue: 5 },
  { position: 3,  name: 'Pedro Almeida',    initials: 'PA', score: 35, badgeCount: 1, streak: 38, avatarColor: '#a855f7', trend: 'same', trendValue: 0 },
  { position: 4,  name: 'Natália Silva',    initials: 'NS', score: 30, badgeCount: 1, streak: 7,  avatarColor: '#ec4899', trend: 'up',   trendValue: 13 },
  { position: 5,  name: 'Larissa Martins',  initials: 'LM', score: 30, badgeCount: 1, streak: 10, avatarColor: '#f59e0b', trend: 'up',   trendValue: 8 },
  { position: 6,  name: 'Carlos Mendes',    initials: 'CM', score: 25, badgeCount: 1, streak: 25, avatarColor: '#06b6d4', trend: 'down', trendValue: 3 },
  { position: 7,  name: 'Você',             initials: 'EU', score: 25, badgeCount: 1, streak: 7,  avatarColor: '#10b981', trend: 'up',   trendValue: 31, isCurrentUser: true },
  { position: 8,  name: 'Ana Ferreira',     initials: 'AF', score: 20, badgeCount: 1, streak: 30, avatarColor: '#f97316', trend: 'down', trendValue: 3 },
  { position: 9,  name: 'Lucas Rocha',      initials: 'LR', score: 20, badgeCount: 1, streak: 18, avatarColor: '#14b8a6', trend: 'down', trendValue: 1 },
  { position: 10, name: 'Henrique Gomes',   initials: 'HG', score: 15, badgeCount: 0, streak: 7,  avatarColor: '#06b6d4', trend: 'up',   trendValue: 6 },
]

// Configurações por aba
interface TabConfig {
  users:      RankUser[]
  total:      number
  userPos:    number
  userScore:  number
  scoreLabel: string
  nextMilestones: { label: string; pts: number; needed: number; color: string }[]
  evolutionData: { label: string; pts: number }[]
}

const TAB_CONFIG: Record<RankTab, TabConfig> = {
  global: {
    users:      GLOBAL_TOP,
    total:      247,
    userPos:    38,
    userScore:  195,
    scoreLabel: 'pontos totais',
    nextMilestones: [
      { label: 'Top 25', pts: 208,  needed: 13,  color: '#10b981' },
      { label: 'Top 10', pts: 410,  needed: 215, color: '#0055ff' },
      { label: 'Top 5',  pts: 588,  needed: 393, color: '#f59e0b' },
    ],
    evolutionData: [
      { label: 'S-6', pts: 30  },
      { label: 'S-5', pts: 70  },
      { label: 'S-4', pts: 110 },
      { label: 'S-3', pts: 145 },
      { label: 'S-2', pts: 165 },
      { label: 'S-1', pts: 185 },
      { label: 'Hoje', pts: 195 },
    ],
  },
  mensal: {
    users:      MONTHLY_TOP,
    total:      198,
    userPos:    15,
    userScore:  40,
    scoreLabel: 'pontos neste mês',
    nextMilestones: [
      { label: 'Top 10', pts: 60,  needed: 20,  color: '#10b981' },
      { label: 'Top 5',  pts: 85,  needed: 45,  color: '#0055ff' },
      { label: 'Top 3',  pts: 95,  needed: 55,  color: '#f59e0b' },
    ],
    evolutionData: [
      { label: 'S1',   pts: 0  },
      { label: 'S2',   pts: 10 },
      { label: 'S3',   pts: 25 },
      { label: 'S4',   pts: 40 },
    ],
  },
  semanal: {
    users:      WEEKLY_TOP,
    total:      142,
    userPos:    7,
    userScore:  25,
    scoreLabel: 'pontos esta semana',
    nextMilestones: [
      { label: 'Top 5', pts: 30,  needed: 5,  color: '#10b981' },
      { label: 'Top 3', pts: 35,  needed: 10, color: '#f59e0b' },
      { label: 'Top 1', pts: 45,  needed: 20, color: '#f97316' },
    ],
    evolutionData: [
      { label: 'Seg', pts: 0  },
      { label: 'Ter', pts: 10 },
      { label: 'Qua', pts: 10 },
      { label: 'Qui', pts: 20 },
      { label: 'Sex', pts: 25 },
      { label: 'Sáb', pts: 25 },
      { label: 'Dom', pts: 25 },
    ],
  },
}

const TABS: { id: RankTab; label: string }[] = [
  { id: 'global',  label: 'Geral'         },
  { id: 'mensal',  label: 'Este mês'      },
  { id: 'semanal', label: 'Esta semana'   },
]

// Score por categoria (calculado a partir dos 12 badges desbloqueados)
// common=10pts, uncommon=25pts, rare=50pts, legendary=100pts
const SCORE_BREAKDOWN = [
  { cat: 'fin',    label: 'Financeiras',  icon: '💰', color: '#10b981', pts: 70,  unlocked: 4, total: 7,  maxPts: 245 },
  { cat: 'meta',   label: 'Metas',        icon: '🎯', color: '#0055ff', pts: 60,  unlocked: 3, total: 5,  maxPts: 235 },
  { cat: 'cons',   label: 'Consistência', icon: '📅', color: '#f59e0b', pts: 45,  unlocked: 3, total: 5,  maxPts: 235 },
  { cat: 'agenda', label: 'Agenda',       icon: '📆', color: '#06b6d4', pts: 20,  unlocked: 2, total: 4,  maxPts: 185 },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getMedalEmoji(pos: number): string {
  if (pos === 1) return '🥇'
  if (pos === 2) return '🥈'
  if (pos === 3) return '🥉'
  return ''
}

function getTopLabel(pos: number, total: number): string {
  const pct = (pos / total) * 100
  if (pct <= 1)  return 'Top 1%'
  if (pct <= 5)  return 'Top 5%'
  if (pct <= 10) return 'Top 10%'
  if (pct <= 15) return 'Top 15%'
  if (pct <= 25) return 'Top 25%'
  return `Top ${Math.ceil(pct)}%`
}

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────

function TrendBadge({ trend, value }: { trend: RankUser['trend']; value: number }) {
  if (trend === 'up')
    return (
      <span className="flex items-center gap-0.5 text-[#10b981] text-[10px] font-medium">
        <TrendingUp size={10} />+{value}
      </span>
    )
  if (trend === 'down')
    return (
      <span className="flex items-center gap-0.5 text-[#f43f5e] text-[10px] font-medium">
        <TrendingDown size={10} />-{value}
      </span>
    )
  return <Minus size={10} className="text-[var(--sl-t3)]" />
}

function LeaderboardRow({ user }: { user: RankUser }) {
  const isTop3 = user.position <= 3
  const medal  = getMedalEmoji(user.position)

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-[10px] rounded-xl transition-colors duration-150',
        user.isCurrentUser
          ? 'bg-[rgba(16,185,129,0.07)] border border-[rgba(16,185,129,0.28)]'
          : isTop3
            ? 'bg-[var(--sl-s2)]'
            : 'hover:bg-[var(--sl-s2)]',
      )}
    >
      {/* Posição */}
      <div className="w-[30px] shrink-0 text-center">
        {medal ? (
          <span className="text-[17px] leading-none">{medal}</span>
        ) : (
          <span className={cn(
            'font-[DM_Mono] text-[12px]',
            user.isCurrentUser ? 'text-[#10b981] font-bold' : 'text-[var(--sl-t3)]',
          )}>
            #{user.position}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div
        className="h-[34px] w-[34px] shrink-0 rounded-full flex items-center justify-center
                   text-white text-[12px] font-bold"
        style={{ background: user.avatarColor + (user.isCurrentUser ? '' : 'bb') }}
      >
        {user.initials}
      </div>

      {/* Nome */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] font-semibold leading-tight truncate',
          user.isCurrentUser ? 'text-[#10b981]' : 'text-[var(--sl-t1)]',
        )}>
          {user.name}
          {user.isCurrentUser && (
            <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md
                             bg-[rgba(16,185,129,0.15)] text-[#10b981] uppercase tracking-wider">
              você
            </span>
          )}
        </p>
        <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
          {user.badgeCount} {user.badgeCount === 1 ? 'badge' : 'badges'} · 🔥 {user.streak}d
        </p>
      </div>

      {/* Score + trend */}
      <div className="text-right shrink-0">
        <p className="font-[DM_Mono] font-medium text-[14px] text-[var(--sl-t1)] leading-tight">
          {user.score}
          <span className="text-[10px] text-[var(--sl-t3)] font-normal"> pts</span>
        </p>
        <div className="flex justify-end mt-0.5">
          <TrendBadge trend={user.trend} value={user.trendValue} />
        </div>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function RankingPage() {
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const [activeTab, setActiveTab] = useState<RankTab>('global')

  const cfg           = TAB_CONFIG[activeTab]
  const topLabel      = getTopLabel(cfg.userPos, cfg.total)
  const topPct        = Math.round((cfg.userPos / cfg.total) * 100)
  const totalScore    = SCORE_BREAKDOWN.reduce((acc, c) => acc + c.pts, 0) // 195 pts

  // Leaderboard: usuário pode estar na lista (mensal/semanal) ou fora dela (global)
  const usersInList    = cfg.users.filter(u => !u.isCurrentUser)
  const currentInList  = cfg.users.find(u => u.isCurrentUser)
  const userIsInTop    = currentInList && currentInList.position <= usersInList.length + 1
  const displayList    = userIsInTop
    ? cfg.users                          // user inline
    : [...usersInList, currentInList!]  // user abaixo com separador

  // Próximo milestone para barra no hero
  const nextMilestone = cfg.nextMilestones[0]
  const heroProgress  = nextMilestone
    ? Math.round((cfg.userScore / nextMilestone.pts) * 100)
    : 100

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① TOPBAR ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div>
          <h1 className={cn(
            'font-[Syne] font-extrabold text-2xl leading-tight',
            isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]',
          )}>
            🏆 Ranking Global
          </h1>
          <p className="text-[13px] text-[var(--sl-t3)] mt-0.5">
            {cfg.total} participantes · atualizado em tempo real
          </p>
        </div>

        {/* Tabs */}
        <div className="ml-auto flex items-center gap-1.5 bg-[var(--sl-s2)] p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-[10px] text-[12px] font-semibold transition-all duration-150',
                activeTab === tab.id
                  ? 'bg-[var(--sl-s1)] text-[var(--sl-t1)] shadow-sm'
                  : 'text-[var(--sl-t3)] hover:text-[var(--sl-t2)]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ② POSITION HERO ────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative overflow-hidden rounded-[20px] p-6 mb-5 sl-fade-up',
          'bg-[var(--sl-s1)] border border-[var(--sl-border)]',
          isJornada && 'border-[rgba(16,185,129,0.25)] shadow-[0_0_40px_rgba(16,185,129,0.07)]',
        )}
      >
        {/* Barra de acento topo */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316, #ec4899, #8b5cf6)' }}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">

          {/* Posição + pontuação */}
          <div className="flex items-center gap-5">
            {/* Avatar grande */}
            <div
              className="h-[64px] w-[64px] shrink-0 rounded-full flex items-center justify-center
                         text-white text-[22px] font-extrabold font-[Syne]
                         shadow-[0_0_24px_rgba(16,185,129,0.25)]"
              style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
            >
              EU
            </div>

            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-[DM_Mono] text-[36px] font-medium text-[var(--sl-t1)] leading-none">
                  #{cfg.userPos}
                </span>
                <span className="text-[14px] text-[var(--sl-t3)]">de {cfg.total}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, rgba(16,185,129,0.15), rgba(0,85,255,0.15))',
                    color: '#10b981',
                    border: '1px solid rgba(16,185,129,0.3)',
                  }}
                >
                  {topLabel} dos usuários
                </span>
                <span className="text-[12px] text-[var(--sl-t3)]">
                  🔥 7 dias de streak
                </span>
              </div>
            </div>
          </div>

          {/* Divisor */}
          <div className="hidden sm:block w-px h-[56px] bg-[var(--sl-border)] shrink-0" />

          {/* Pontuação total */}
          <div className="shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">
              Pontuação total
            </p>
            <p className="font-[DM_Mono] text-[32px] font-medium text-[var(--sl-t1)] leading-none">
              {totalScore}
              <span className="text-[14px] text-[var(--sl-t3)] font-normal ml-1">pts</span>
            </p>
          </div>

          {/* Barra próximo milestone */}
          {nextMilestone && (
            <div className="flex-1 min-w-[180px]">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-[var(--sl-t3)]">
                  Próxima marca — <strong className="text-[var(--sl-t2)]">{nextMilestone.label}</strong>
                </p>
                <p className="font-[DM_Mono] text-[11px] text-[var(--sl-t2)]">
                  {cfg.userScore}<span className="text-[var(--sl-t3)]">/{nextMilestone.pts}</span>
                </p>
              </div>
              <div className="h-[6px] rounded-full bg-[var(--sl-s3)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(.4,0,.2,1)]"
                  style={{
                    width: `${Math.min(heroProgress, 100)}%`,
                    background: `linear-gradient(90deg, ${nextMilestone.color}, ${nextMilestone.color}bb)`,
                  }}
                />
              </div>
              <p className="text-[10px] text-[var(--sl-t3)] mt-1">
                Faltam <span className="font-[DM_Mono] text-[var(--sl-t2)]">{nextMilestone.needed} pts</span> para o {nextMilestone.label}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ③ SCORE BREAKDOWN ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2 sl-fade-up sl-delay-1">
        {SCORE_BREAKDOWN.map((cat) => {
          const barPct = Math.round((cat.pts / cat.maxPts) * 100)
          return (
            <div
              key={cat.cat}
              className="relative overflow-hidden rounded-2xl p-4
                         bg-[var(--sl-s1)] border border-[var(--sl-border)]
                         hover:border-[var(--sl-border-h)] transition-colors"
            >
              {/* Acento topo */}
              <div
                className="absolute top-0 left-4 right-4 h-[2px] rounded-b"
                style={{ background: cat.color }}
              />
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[18px]">{cat.icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--sl-t3)]">
                  {cat.label}
                </span>
              </div>
              <p className="font-[DM_Mono] text-[22px] font-medium text-[var(--sl-t1)] leading-none mb-1">
                {cat.pts}
                <span className="text-[11px] text-[var(--sl-t3)] font-normal ml-0.5">pts</span>
              </p>
              <p className="text-[10px] text-[var(--sl-t3)] mb-2">
                {cat.unlocked}/{cat.total} badges
              </p>
              <div className="h-[4px] rounded-full bg-[var(--sl-s3)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${barPct}%`, background: cat.color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* ④ MAIN GRID ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_300px] gap-4 max-lg:grid-cols-1">

        {/* LEADERBOARD */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden sl-fade-up sl-delay-2">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[var(--sl-border)] flex items-center gap-3">
            <span className="text-[13px] font-bold text-[var(--sl-t1)]">
              🏅 Leaderboard
            </span>
            <span className="text-[11px] text-[var(--sl-t3)] ml-auto">
              {activeTab === 'semanal' ? 'Top 10' : 'Top 20'} de {cfg.total}
            </span>
          </div>

          {/* Lista */}
          <div className="p-2 flex flex-col gap-0.5">
            {displayList.map((user, idx) => {
              const showSeparator = !userIsInTop && user.isCurrentUser
              return (
                <div key={user.position}>
                  {/* Separador quando user está fora do top */}
                  {showSeparator && (
                    <div className="flex items-center gap-2 px-4 py-2">
                      <div className="flex-1 h-px bg-[var(--sl-border)]" />
                      <span className="text-[11px] text-[var(--sl-t3)] font-medium">
                        ··· posições {displayList[idx - 1]?.position + 1}–{user.position - 1} ···
                      </span>
                      <div className="flex-1 h-px bg-[var(--sl-border)]" />
                    </div>
                  )}
                  <LeaderboardRow user={user} />
                </div>
              )
            })}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="flex flex-col gap-4">

          {/* Evolução de pontos */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-3">
              📈 Evolução de pontos
            </p>
            <div className="h-[110px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cfg.evolutionData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                  <defs>
                    <linearGradient id="rankGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: 'var(--sl-t3)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--sl-t3)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--sl-s2)',
                      border: '1px solid var(--sl-border)',
                      borderRadius: '10px',
                      fontSize: 11,
                      color: 'var(--sl-t1)',
                    }}
                    formatter={(v) => [`${v} pts`, 'Pontuação']}
                    labelStyle={{ color: 'var(--sl-t3)', marginBottom: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pts"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#rankGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Próximos marcos */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-3">
              🎯 Próximos marcos
            </p>
            <div className="flex flex-col gap-3">
              {cfg.nextMilestones.map((m, i) => {
                const pct = Math.round((cfg.userScore / m.pts) * 100)
                return (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold text-[var(--sl-t1)]">
                        {m.label}
                      </span>
                      <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)]">
                        +{m.needed} pts
                      </span>
                    </div>
                    <div className="h-[5px] rounded-full bg-[var(--sl-s3)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-1000"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: m.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--sl-border)]">
              <p className="text-[11px] text-[var(--sl-t3)] leading-[1.6]">
                Desbloqueie mais badges para subir no ranking. Cada badge rara vale
                {' '}<span className="font-[DM_Mono] text-[var(--sl-t2)]">50 pts</span> e
                lendária vale{' '}
                <span className="font-[DM_Mono] text-[var(--sl-t2)]">100 pts</span>.
              </p>
              <a
                href="/conquistas"
                className="flex items-center gap-1 mt-2 text-[12px] font-semibold text-[#10b981]
                           hover:opacity-80 transition-opacity"
              >
                Ver badges <ChevronRight size={13} />
              </a>
            </div>
          </div>

          {/* Sistema de pontuação */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-3">
              ⚡ Como funciona
            </p>
            <div className="flex flex-col gap-2">
              {([
                { label: 'Comum',    pts: 10,  color: '#64748b', pill: 'bg-[rgba(100,116,139,0.12)] text-[#64748b]' },
                { label: 'Incomum',  pts: 25,  color: '#10b981', pill: 'bg-[rgba(16,185,129,0.12)] text-[#10b981]' },
                { label: 'Rara',     pts: 50,  color: '#8b5cf6', pill: 'bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]' },
                { label: 'Lendária', pts: 100, color: '#f59e0b', pill: 'bg-[rgba(245,158,11,0.12)] text-[#f59e0b]' },
              ] as const).map((r) => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${r.pill}`}>
                    {r.label}
                  </span>
                  <span className="font-[DM_Mono] text-[12px] text-[var(--sl-t2)]">
                    +{r.pts} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ⑤ JORNADA — frase motivacional ─────────────────────────────────────── */}
      <div className="hidden [.jornada_&]:flex items-center gap-3 p-[14px_18px] rounded-[14px] mt-5
                      bg-gradient-to-br from-[#10b981]/7 to-[#0055ff]/7
                      border border-[#10b981]/18 sl-fade-up">
        <span className="text-[22px] shrink-0">🤖</span>
        <span className="text-[13px] text-[var(--sl-t2)] leading-[1.7]">
          Você está no <strong>{topLabel}</strong> do SyncLife com{' '}
          <strong>{totalScore} pontos</strong>. Desbloqueie{' '}
          <strong>Reserva Construída</strong> (+100 pts) para subir para o Top 10% 🚀
        </span>
      </div>
    </div>
  )
}
