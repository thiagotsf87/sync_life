'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useShellStore } from '@/stores/shell-store'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type BadgeCat    = 'fin' | 'meta' | 'cons' | 'agenda' | 'corpo' | 'patrimonio' | 'experiencias'
type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'legendary'

interface Badge {
  id:          number
  cat:         BadgeCat
  icon:        string
  name:        string
  desc:        string
  rarity:      BadgeRarity
  unlocked:    boolean
  date:        string | null
  criteria:    string
  progress:    number
  progressMax: number
  motivation:  string
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const CAT_COLORS: Record<BadgeCat, string> = {
  fin:         '#10b981',
  meta:        '#0055ff',
  cons:        '#f59e0b',
  agenda:      '#06b6d4',
  corpo:       '#f97316',
  patrimonio:  '#10b981',
  experiencias:'#06b6d4',
}

const CAT_LABELS: Record<string, string> = {
  all:         'Todas',
  fin:         '💰 Financeiras',
  meta:        '🎯 Metas',
  cons:        '📅 Consistência',
  agenda:      '📆 Agenda',
  corpo:       '🏥 Corpo',
  patrimonio:  '📈 Patrimônio',
  experiencias:'✈️ Experiências',
}

const RARITY_LABELS: Record<BadgeRarity, string> = {
  common:    'Comum',
  uncommon:  'Incomum',
  rare:      'Rara',
  legendary: 'Lendária',
}

const BADGES: Badge[] = [
  // ── Financeiras ────────────────────────────────────────────────────────────
  { id: 1,  cat: 'fin',    icon: '💰', name: 'Primeiro Passo',       desc: 'Registrou a primeira transação',            rarity: 'common',    unlocked: true,  date: '15 Jan 2026', criteria: 'Registre sua primeira transação no app.',                                          progress: 1,   progressMax: 1,   motivation: '"Todo grande começo tem um pequeno passo."' },
  { id: 2,  cat: 'fin',    icon: '🟢', name: '3 Meses no Verde',     desc: 'Saldo positivo por 3 meses seguidos',       rarity: 'uncommon',  unlocked: true,  date: '01 Fev 2026', criteria: 'Mantenha saldo positivo por 3 meses consecutivos.',                                progress: 3,   progressMax: 3,   motivation: '"Consistência financeira é liberdade."' },
  { id: 3,  cat: 'fin',    icon: '🎯', name: 'Orçamento Cumprido',   desc: 'Respeitou o orçamento mensal',              rarity: 'common',    unlocked: true,  date: '31 Jan 2026', criteria: 'Termine o mês sem ultrapassar nenhuma categoria de orçamento.',                    progress: 1,   progressMax: 1,   motivation: '"Planejar é o primeiro ato de controle."' },
  { id: 4,  cat: 'fin',    icon: '📊', name: 'Analista',             desc: 'Gerou seu primeiro relatório',              rarity: 'common',    unlocked: true,  date: '10 Fev 2026', criteria: 'Acesse e gere um relatório mensal.',                                               progress: 1,   progressMax: 1,   motivation: '"Dados claros levam a decisões melhores."' },
  { id: 5,  cat: 'fin',    icon: '🔥', name: '6 Meses no Verde',     desc: 'Saldo positivo por 6 meses seguidos',       rarity: 'rare',      unlocked: false, date: null,          criteria: 'Mantenha saldo positivo por 6 meses consecutivos.',                                progress: 3,   progressMax: 6,   motivation: '"Metade do caminho já foi percorrido."' },
  { id: 6,  cat: 'fin',    icon: '💎', name: 'Investidor Iniciante', desc: 'Registrou primeiro investimento',           rarity: 'uncommon',  unlocked: false, date: null,          criteria: 'Registre uma transação do tipo "Investimento".',                                   progress: 0,   progressMax: 1,   motivation: '' },
  { id: 7,  cat: 'fin',    icon: '🏦', name: 'Reserva Construída',   desc: 'Atingiu meta de reserva de emergência',     rarity: 'legendary', unlocked: false, date: null,          criteria: 'Conclua uma meta financeira do tipo "Reserva de Emergência".',                    progress: 75,  progressMax: 100, motivation: '' },
  // ── Metas ──────────────────────────────────────────────────────────────────
  { id: 8,  cat: 'meta',   icon: '🎯', name: 'Sonhador',             desc: 'Criou sua primeira meta',                   rarity: 'common',    unlocked: true,  date: '12 Jan 2026', criteria: 'Crie sua primeira meta no módulo de Metas.',                                       progress: 1,   progressMax: 1,   motivation: '"Sonhos com prazo são objetivos."' },
  { id: 9,  cat: 'meta',   icon: '🚀', name: 'Na Velocidade',        desc: 'Meta 25% acima do ritmo',                   rarity: 'uncommon',  unlocked: true,  date: '20 Jan 2026', criteria: 'Registre progresso 25% acima do ritmo necessário por 30 dias.',                    progress: 1,   progressMax: 1,   motivation: '"Quando você vai além do necessário, algo especial acontece."' },
  { id: 10, cat: 'meta',   icon: '🏆', name: 'Meta Concluída',       desc: 'Completou uma meta',                        rarity: 'uncommon',  unlocked: true,  date: '05 Fev 2026', criteria: 'Conclua qualquer meta (atingir 100% do objetivo).',                                progress: 1,   progressMax: 1,   motivation: '"Uma meta realizada abre espaço para uma nova."' },
  { id: 11, cat: 'meta',   icon: '⭐', name: 'Triatleta de Metas',   desc: '3 metas ativas simultaneamente',            rarity: 'rare',      unlocked: false, date: null,          criteria: 'Tenha 3 metas ativas ao mesmo tempo.',                                             progress: 1,   progressMax: 3,   motivation: '' },
  { id: 12, cat: 'meta',   icon: '🌟', name: 'Lendário',             desc: 'Conclua 5 metas',                           rarity: 'legendary', unlocked: false, date: null,          criteria: 'Conclua um total de 5 metas quaisquer.',                                           progress: 1,   progressMax: 5,   motivation: '' },
  // ── Consistência ───────────────────────────────────────────────────────────
  { id: 13, cat: 'cons',   icon: '🔥', name: 'Sequência de 7 dias',  desc: 'Acessou o app 7 dias seguidos',             rarity: 'common',    unlocked: true,  date: '22 Jan 2026', criteria: 'Faça login e registre alguma atividade por 7 dias consecutivos.',                  progress: 7,   progressMax: 7,   motivation: '"7 dias. Hábito em formação."' },
  { id: 14, cat: 'cons',   icon: '📅', name: 'Mês Completo',         desc: 'Ativo todos os dias em um mês',             rarity: 'uncommon',  unlocked: true,  date: '31 Jan 2026', criteria: 'Faça login e registre alguma atividade todos os dias de um mês.',                  progress: 31,  progressMax: 31,  motivation: '"31 dias de consistência. Isso é caráter."' },
  { id: 15, cat: 'cons',   icon: '💪', name: 'Madrugador',           desc: '3 registros antes das 8h',                  rarity: 'common',    unlocked: true,  date: '18 Jan 2026', criteria: 'Registre alguma atividade antes das 8:00 em 3 dias diferentes.',                  progress: 3,   progressMax: 3,   motivation: '"Quem controla a manhã, controla o dia."' },
  { id: 16, cat: 'cons',   icon: '🏅', name: 'Sequência de 30 dias', desc: '30 dias seguidos usando o app',             rarity: 'rare',      unlocked: false, date: null,          criteria: 'Faça login e registre atividade por 30 dias consecutivos.',                       progress: 22,  progressMax: 30,  motivation: '' },
  { id: 17, cat: 'cons',   icon: '👑', name: 'Veterano',             desc: '6 meses usando o SyncLife',                 rarity: 'legendary', unlocked: false, date: null,          criteria: 'Use o app por 6 meses (não precisa ser consecutivo).',                             progress: 2,   progressMax: 6,   motivation: '' },
  // ── Agenda ─────────────────────────────────────────────────────────────────
  { id: 18, cat: 'agenda',       icon: '📅', name: 'Organizador',          desc: 'Criou o primeiro evento',                   rarity: 'common',    unlocked: true,  date: '14 Jan 2026', criteria: 'Crie seu primeiro evento no módulo de Agenda.',                                    progress: 1,   progressMax: 1,   motivation: '"Agenda vazia é plano que não existe."' },
  { id: 19, cat: 'agenda',       icon: '✅', name: '100% Concluído',       desc: 'Completou todos eventos de uma semana',     rarity: 'uncommon',  unlocked: true,  date: '02 Fev 2026', criteria: 'Marque como concluídos todos os eventos de uma semana.',                           progress: 1,   progressMax: 1,   motivation: '"Uma semana executada ao máximo."' },
  { id: 20, cat: 'agenda',       icon: '🔗', name: 'Integrador',           desc: 'Meta vinculada a um evento',                rarity: 'uncommon',  unlocked: false, date: null,          criteria: 'Crie um evento na Agenda vinculado a uma Meta.',                                   progress: 0,   progressMax: 1,   motivation: '' },
  { id: 21, cat: 'agenda',       icon: '🗓️', name: 'Planner Master',       desc: '50 eventos criados',                        rarity: 'rare',      unlocked: false, date: null,          criteria: 'Crie um total de 50 eventos no módulo de Agenda.',                                 progress: 12,  progressMax: 50,  motivation: '' },
  // ── Corpo ──────────────────────────────────────────────────────────────────
  { id: 22, cat: 'corpo',        icon: '🏥', name: 'Check-up Registrado',  desc: 'Primeira consulta médica registrada',       rarity: 'common',    unlocked: true,  date: '10 Fev 2026', criteria: 'Registre sua primeira consulta médica no módulo Corpo.',                          progress: 1,   progressMax: 1,   motivation: '"Saúde é o primeiro patrimônio."' },
  { id: 23, cat: 'corpo',        icon: '🏃', name: 'Em Movimento',         desc: '7 atividades físicas registradas',          rarity: 'common',    unlocked: false, date: null,          criteria: 'Registre 7 atividades físicas no módulo Corpo.',                                   progress: 4,   progressMax: 7,   motivation: '' },
  { id: 24, cat: 'corpo',        icon: '💪', name: 'Rotina Semanal',        desc: 'Meta de atividades atingida por 4 semanas', rarity: 'uncommon',  unlocked: false, date: null,          criteria: 'Atinja sua meta de atividades semanais por 4 semanas consecutivas.',               progress: 1,   progressMax: 4,   motivation: '' },
  { id: 25, cat: 'corpo',        icon: '🩺', name: 'Saúde em Dia',          desc: 'Check-up anual completo',                   rarity: 'rare',      unlocked: false, date: null,          criteria: 'Registre consultas em 5 especialidades diferentes no ano.',                        progress: 1,   progressMax: 5,   motivation: '' },
  // ── Patrimônio ─────────────────────────────────────────────────────────────
  { id: 26, cat: 'patrimonio',   icon: '📈', name: 'Primeiro Ativo',        desc: 'Primeiro ativo adicionado à carteira',      rarity: 'common',    unlocked: true,  date: '15 Jan 2026', criteria: 'Adicione seu primeiro ativo no módulo Patrimônio.',                                progress: 1,   progressMax: 1,   motivation: '"O melhor momento para investir foi ontem. O segundo melhor é hoje."' },
  { id: 27, cat: 'patrimonio',   icon: '🌐', name: 'Diversificado',         desc: 'Carteira com 3 classes de ativos',          rarity: 'uncommon',  unlocked: false, date: null,          criteria: 'Tenha ativos em pelo menos 3 classes diferentes na carteira.',                     progress: 1,   progressMax: 3,   motivation: '' },
  { id: 28, cat: 'patrimonio',   icon: '💰', name: 'Acúmulo Consistente',   desc: 'Aportes por 6 meses seguidos',              rarity: 'rare',      unlocked: false, date: null,          criteria: 'Registre pelo menos um aporte em cada um dos últimos 6 meses.',                   progress: 2,   progressMax: 6,   motivation: '' },
  { id: 29, cat: 'patrimonio',   icon: '🏆', name: 'Independência',         desc: 'Carteira suficiente para a regra dos 4%',   rarity: 'legendary', unlocked: false, date: null,          criteria: 'Atinja o valor-alvo calculado pelo simulador de independência financeira.',        progress: 8,   progressMax: 100, motivation: '' },
  // ── Experiências ───────────────────────────────────────────────────────────
  { id: 30, cat: 'experiencias', icon: '✈️', name: 'Primeira Aventura',     desc: 'Primeira viagem registrada',                rarity: 'common',    unlocked: true,  date: '08 Fev 2026', criteria: 'Registre sua primeira viagem no módulo Experiências.',                             progress: 1,   progressMax: 1,   motivation: '"Viajar é a única coisa que te enriquece ao gastar."' },
  { id: 31, cat: 'experiencias', icon: '🌍', name: 'Viajante',              desc: '3 viagens concluídas',                      rarity: 'uncommon',  unlocked: false, date: null,          criteria: 'Conclua 3 viagens (status "Concluída") no módulo Experiências.',                   progress: 1,   progressMax: 3,   motivation: '' },
  { id: 32, cat: 'experiencias', icon: '🗺️', name: 'Explorador',            desc: '10 destinos diferentes visitados',          rarity: 'rare',      unlocked: false, date: null,          criteria: 'Registre viagens com 10 destinos diferentes.',                                     progress: 2,   progressMax: 10,  motivation: '' },
  { id: 33, cat: 'experiencias', icon: '🌟', name: 'Nômade',                desc: 'Viajou em 4 países diferentes',             rarity: 'legendary', unlocked: false, date: null,          criteria: 'Registre viagens para pelo menos 4 países diferentes.',                            progress: 1,   progressMax: 4,   motivation: '' },
]

// Dados derivados estáticos (determinísticos — sem random)
const TOTAL_UNLOCKED = BADGES.filter(b => b.unlocked).length    // 12
const TOTAL_ALL      = BADGES.length                             // 21
const PCT            = Math.round(TOTAL_UNLOCKED / TOTAL_ALL * 100) // 57

const RECENT_UNLOCKED: Badge[] = (() => {
  const MONTH_IDX: Record<string, number> = {
    Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
    Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
  }
  const parseDate = (d: string) => {
    const [day, mon, year] = d.split(' ')
    return new Date(parseInt(year), MONTH_IDX[mon] ?? 0, parseInt(day)).getTime()
  }
  return BADGES
    .filter(b => b.unlocked && b.date)
    .sort((a, b) => parseDate(b.date!) - parseDate(a.date!))
    .slice(0, 3)
})()

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getRarityBorder(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'uncommon':  return 'border-[rgba(16,185,129,0.4)]'
    case 'rare':      return 'border-[rgba(139,92,246,0.5)] shadow-[0_0_20px_rgba(139,92,246,0.12)]'
    case 'legendary': return 'border-[rgba(245,158,11,0.6)] shadow-[0_0_24px_rgba(245,158,11,0.15)]'
    default:          return ''
  }
}

function getRarityPill(rarity: BadgeRarity): string {
  switch (rarity) {
    case 'common':    return 'bg-[rgba(100,116,139,0.15)] text-[#64748b]'
    case 'uncommon':  return 'bg-[rgba(16,185,129,0.12)] text-[#10b981]'
    case 'rare':      return 'bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]'
    case 'legendary': return 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]'
  }
}

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--sl-t3)] mb-[14px] flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[var(--sl-border)]">
      {children}
    </div>
  )
}

function BadgeCard({ badge: b, delay, onClick }: { badge: Badge; delay: number; onClick: () => void }) {
  const col        = CAT_COLORS[b.cat]
  const progressPct = Math.round(b.progress / b.progressMax * 100)
  const rarityBorder = b.unlocked ? getRarityBorder(b.rarity) : ''
  const isLegendaryUnlocked = b.rarity === 'legendary' && b.unlocked

  return (
    <div
      className={`bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[18px_16px] text-center relative overflow-hidden sl-fade-up transition-all
        ${b.unlocked ? `cursor-pointer hover:-translate-y-[3px] hover:border-[var(--sl-border-h)] ${rarityBorder}` : 'cursor-default'}
        ${isLegendaryUnlocked ? 'bg-gradient-to-br from-[var(--sl-s1)] to-[rgba(245,158,11,0.04)]' : ''}`}
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
    >
      {/* Lock overlay */}
      {!b.unlocked && (
        <div className="absolute top-[10px] right-[10px] w-5 h-5 rounded-[6px] bg-[var(--sl-s3)] border border-[var(--sl-border)] flex items-center justify-center text-[11px]">
          🔒
        </div>
      )}

      {/* Rarity pill */}
      <div className={`inline-flex items-center gap-[3px] text-[9px] font-bold uppercase tracking-[0.07em] px-[7px] py-[2px] rounded-[8px] mb-[6px] ${getRarityPill(b.rarity)}`}>
        {RARITY_LABELS[b.rarity]}
      </div>

      {/* Icon */}
      <div
        className={`w-[54px] h-[54px] rounded-[16px] flex items-center justify-center text-[28px] mx-auto mb-3 transition-transform
          ${b.unlocked ? 'hover:scale-[1.08]' : 'grayscale opacity-40'}
          ${isLegendaryUnlocked ? 'badge-shimmer jornada:badge-shimmer' : ''}`}
        style={{ background: b.unlocked ? `${col}22` : `${col}11` }}
      >
        {b.icon}
      </div>

      {/* Name & desc */}
      <div className="font-[Syne] font-bold text-[12px] text-[var(--sl-t1)] mb-1 leading-[1.3]">{b.name}</div>
      <div className="text-[11px] text-[var(--sl-t2)] leading-[1.5] mb-2">{b.desc}</div>

      {/* Date or progress */}
      {b.unlocked
        ? <div className="text-[10px] text-[var(--sl-t3)]">🗓 {b.date}</div>
        : (
          <div className="mt-2">
            <div className="h-1 bg-[var(--sl-s3)] rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full transition-[width] duration-1000"
                style={{ width: `${progressPct}%`, background: col }}
              />
            </div>
            <div className="text-[10px] text-[var(--sl-t3)]">{b.progress}/{b.progressMax}</div>
          </div>
        )
      }

      {/* Bottom color bar (unlocked only) */}
      {b.unlocked && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[16px]"
          style={{ background: col }}
        />
      )}
    </div>
  )
}

function BadgeListItem({ badge: b, onClick }: { badge: Badge; onClick: () => void }) {
  const col = CAT_COLORS[b.cat]
  const pct = Math.round(b.progress / b.progressMax * 100)

  return (
    <div
      className={`flex items-center gap-[14px] p-[12px_16px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[12px] cursor-pointer hover:border-[var(--sl-border-h)] transition-all sl-fade-up ${!b.unlocked ? 'opacity-55' : ''}`}
      onClick={onClick}
    >
      <span className={`text-[22px] w-9 text-center flex-shrink-0 ${!b.unlocked ? 'grayscale opacity-50' : ''}`}>
        {b.icon}
      </span>
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ background: b.unlocked ? col : `${col}44` }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[var(--sl-t1)]">{b.name}</div>
        <div className="text-[12px] text-[var(--sl-t3)]">{b.desc}</div>
      </div>
      <div className="text-right flex-shrink-0">
        {b.unlocked ? (
          <>
            <div className="text-[11px] text-[var(--sl-t3)]">{b.date}</div>
            <div className="text-[11px] font-bold px-2 py-0.5 rounded-[8px] mt-0.5 bg-[rgba(16,185,129,0.12)] text-[#10b981]">
              ✅ Obtida
            </div>
          </>
        ) : (
          <>
            <div className="font-[DM_Mono] text-[12px] text-[var(--sl-t2)]">{b.progress}/{b.progressMax}</div>
            <div className="text-[11px] font-bold px-2 py-0.5 rounded-[8px] mt-0.5 bg-[rgba(100,116,139,0.12)] text-[#64748b]">
              🔒 {pct}%
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function BadgeModal({ badge: b, isJornada, onClose }: { badge: Badge; isJornada: boolean; onClose: () => void }) {
  const col = CAT_COLORS[b.cat]
  const pct = Math.round(b.progress / b.progressMax * 100)
  const [barWidth, setBarWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(pct), 100)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-[4px] z-[60] flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-[var(--sl-s1)] border border-[var(--sl-border-h)] rounded-[22px] p-8 max-w-[440px] w-full mx-4 relative"
        style={{ animation: 'modalUp 0.25s cubic-bezier(0.4,0,0.2,1) both' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-[30px] h-[30px] rounded-[8px] border border-[var(--sl-border)] bg-transparent cursor-pointer text-[var(--sl-t3)] flex items-center justify-center hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t1)] transition-all"
        >
          <X size={14} />
        </button>

        {/* Badge hero */}
        <div className="text-center mb-6">
          <span
            className="text-[64px] block mb-3"
            style={{ animation: 'bounceIn 0.4s cubic-bezier(0.4,0,0.2,1) both' }}
          >
            {b.icon}
          </span>
          <div className="font-[Syne] font-extrabold text-[20px] text-[var(--sl-t1)] mb-[6px]">{b.name}</div>
          <div className="text-[13px] text-[var(--sl-t2)] leading-[1.7]">{b.desc}</div>
          <div className="flex items-center justify-center gap-[10px] mt-[10px] flex-wrap">
            <span className={`inline-flex items-center gap-[3px] text-[9px] font-bold uppercase tracking-[0.07em] px-[7px] py-[2px] rounded-[8px] ${getRarityPill(b.rarity)}`}>
              {RARITY_LABELS[b.rarity]}
            </span>
            <span className="text-[11px] text-[var(--sl-t3)] px-2 py-0.5 rounded-[8px] bg-[var(--sl-s2)]">
              {CAT_LABELS[b.cat]}
            </span>
          </div>
        </div>

        {/* Criteria */}
        <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[12px] p-[14px_16px] mb-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mb-[6px]">
            Como desbloquear
          </div>
          <div className="text-[13px] text-[var(--sl-t2)] leading-[1.6]">{b.criteria}</div>
        </div>

        {/* Progress bar (locked) or unlocked date */}
        {!b.unlocked ? (
          <div className="mb-4">
            <div className="flex justify-between text-[12px] text-[var(--sl-t3)] mb-[6px]">
              <span>Progresso atual</span>
              <span>{b.progress}/{b.progressMax} ({pct}%)</span>
            </div>
            <div className="h-2 bg-[var(--sl-s3)] rounded-full overflow-hidden mb-[6px]">
              <div
                className="h-full rounded-full transition-[width] duration-1000"
                style={{ width: `${barWidth}%`, background: col }}
              />
            </div>
            <div className="text-[12px] text-[var(--sl-t3)]">
              {pct < 100
                ? `Faltam ${b.progressMax - b.progress} para desbloquear`
                : '✅ Critério atingido!'}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-[12px_16px] rounded-[12px] bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] mb-4 text-[13px] text-[var(--sl-t2)]">
            <span className="text-[20px]">🏆</span>
            <span>Conquistado em <strong className="text-[#10b981]">{b.date}</strong></span>
          </div>
        )}

        {/* Motivation (Jornada only) */}
        {isJornada && b.motivation && (
          <div className="p-[12px_16px] rounded-[12px] bg-gradient-to-br from-[#10b981]/7 to-[#0055ff]/6 border border-[rgba(16,185,129,0.18)] text-[13px] text-[var(--sl-t2)] italic">
            ✨ {b.motivation}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

export default function ConquistasPage() {
  const mode     = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const [curCat,     setCurCat]     = useState<string>('all')
  const [showLocked, setShowLocked] = useState(true)
  const [modalBadge, setModalBadge] = useState<Badge | null>(null)
  const [heroCount,  setHeroCount]  = useState(0)
  const [heroBarW,   setHeroBarW]   = useState(0)

  // Animated counter + bar after mount
  useEffect(() => {
    let frame = 0
    const target = TOTAL_UNLOCKED
    const tick = () => {
      frame++
      setHeroCount(frame)
      if (frame < target) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    const t = setTimeout(() => setHeroBarW(PCT), 100)
    return () => clearTimeout(t)
  }, [])

  // ESC closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalBadge(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Filtered badge lists
  const filtered    = BADGES.filter(b => curCat === 'all' || b.cat === curCat)
  const visUnlocked = filtered.filter(b => b.unlocked)
  const visLocked   = showLocked ? filtered.filter(b => !b.unlocked) : []

  function catCount(cat: string) {
    const pool = cat === 'all' ? BADGES : BADGES.filter(b => b.cat === cat)
    return { done: pool.filter(b => b.unlocked).length, total: pool.length }
  }

  const nextLocked = BADGES.find(b => !b.unlocked)

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Hero Summary */}
      <div className="flex gap-5 items-stretch mb-[22px] max-sm:flex-col sl-fade-up">

        {/* Score Card */}
        <div className="flex-1 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] p-[24px_28px] relative overflow-hidden">
          {/* Rainbow top bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg,#f59e0b,#f97316,#ec4899,#8b5cf6)' }}
          />
          {/* Counter */}
          <div className="flex items-end gap-[6px] mb-[6px]">
            <span className="font-[Syne] font-extrabold text-[44px] leading-none bg-gradient-to-br from-[#f59e0b] to-[#f97316] text-transparent bg-clip-text">
              {heroCount}
            </span>
            <span className="font-[DM_Mono] text-[18px] text-[var(--sl-t3)] mb-1">/ {TOTAL_ALL}</span>
          </div>
          <div className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[3px]">
            Conquistas desbloqueadas
          </div>
          <div className="text-[12px] text-[var(--sl-t3)] mb-4">
            Você está no <strong className="text-[var(--sl-t1)]">Top 15%</strong> dos usuários do SyncLife.
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-[var(--sl-s3)] rounded-full overflow-hidden mb-[10px]">
            <div
              className="h-full rounded-full"
              style={{
                width:      `${heroBarW}%`,
                background: 'linear-gradient(90deg,#f59e0b,#f97316,#ec4899)',
                transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
          <div className="text-[11px] text-[var(--sl-t3)]">{heroBarW}% do total desbloqueado</div>
        </div>

        {/* Recent Strip — vertical desktop, horizontal scroll mobile */}
        <div
          className="flex max-sm:flex-row max-sm:overflow-x-auto max-sm:pb-1 lg:flex-col gap-[10px] min-w-0 lg:min-w-[280px] lg:flex-shrink-0"
          style={{ scrollbarWidth: 'none' } as React.CSSProperties}
        >
          {RECENT_UNLOCKED.map((b, i) => (
            <div
              key={b.id}
              className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[14px_18px] flex items-center gap-[14px] cursor-pointer transition-all hover:border-[var(--sl-border-h)] hover:translate-x-0.5 relative overflow-hidden sl-fade-up max-sm:flex-shrink-0 max-sm:w-[240px]"
              style={{ animationDelay: `${i * 0.07}s` }}
              onClick={() => setModalBadge(b)}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
                style={{ background: CAT_COLORS[b.cat] }}
              />
              <span className="text-[28px] ml-1">{b.icon}</span>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mb-[3px]">
                  Recente{i === 0 ? ' · Última conquista' : ''}
                </div>
                <div className="text-[13px] font-bold text-[var(--sl-t1)]">{b.name}</div>
                <div className="text-[11px] text-[var(--sl-t3)]">{b.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ② Jornada Motivational Phrase */}
      <div className="hidden jornada:flex items-center gap-3 p-[14px_18px] rounded-[14px] mb-5 bg-gradient-to-br from-[#10b981]/7 to-[#0055ff]/7 border border-[rgba(16,185,129,0.18)] sl-fade-up">
        <span className="text-[22px] shrink-0">🤖</span>
        <span className="text-[13px] text-[var(--sl-t2)] leading-[1.7]">
          Você tem{' '}
          <strong className="text-[var(--sl-t1)]">{TOTAL_UNLOCKED} conquistas desbloqueadas</strong>{' '}
          e contando.
          {nextLocked && (
            <> Seu próximo marco é{' '}
              <strong className="text-[var(--sl-t1)]">{nextLocked.name}</strong> — continue assim!
            </>
          )}
        </span>
      </div>

      {/* ③ Category Tabs */}
      <div className="flex items-center gap-2 mb-[22px] flex-wrap sl-fade-up">
        {(['all', 'fin', 'meta', 'cons', 'agenda', 'corpo', 'patrimonio', 'experiencias'] as const).map(cat => {
          const cnt      = catCount(cat)
          const isActive = curCat === cat
          return (
            <button
              key={cat}
              onClick={() => setCurCat(cat)}
              className={`inline-flex items-center gap-[6px] px-[14px] py-[7px] rounded-[20px] border text-[12px] font-medium transition-all ${
                isActive
                  ? 'border-[#0055ff] bg-[rgba(0,85,255,0.15)] text-[#0055ff]'
                  : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t2)]'
              }`}
            >
              {CAT_LABELS[cat]}
              <span className="font-[DM_Mono] text-[10px] opacity-70">{cnt.done}/{cnt.total}</span>
            </button>
          )
        })}
        <label className="ml-auto flex items-center gap-[7px] text-[12px] text-[var(--sl-t3)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showLocked}
            onChange={e => setShowLocked(e.target.checked)}
            className="accent-[#0055ff] cursor-pointer"
          />
          Mostrar bloqueadas
        </label>
      </div>

      {/* ④-A Grid View (Jornada) */}
      <div className="hidden jornada:block">
        {visUnlocked.length > 0 && (
          <>
            <SectionLabel>✅ Desbloqueadas ({visUnlocked.length})</SectionLabel>
            <div className="grid grid-cols-4 gap-[14px] mb-7 max-[900px]:grid-cols-3 max-sm:grid-cols-2">
              {visUnlocked.map((b, i) => (
                <BadgeCard key={b.id} badge={b} delay={i * 0.04} onClick={() => setModalBadge(b)} />
              ))}
            </div>
          </>
        )}
        {visLocked.length > 0 && (
          <>
            <SectionLabel>🔒 Bloqueadas ({visLocked.length})</SectionLabel>
            <div className="grid grid-cols-4 gap-[14px] mb-7 max-[900px]:grid-cols-3 max-sm:grid-cols-2">
              {visLocked.map((b, i) => (
                <BadgeCard
                  key={b.id}
                  badge={b}
                  delay={(visUnlocked.length + i) * 0.04}
                  onClick={() => setModalBadge(b)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ④-B List View (Foco) */}
      <div className="block jornada:hidden">
        {visUnlocked.length > 0 && (
          <>
            <SectionLabel>✅ Desbloqueadas ({visUnlocked.length})</SectionLabel>
            <div className="flex flex-col gap-2 mb-7">
              {visUnlocked.map(b => (
                <BadgeListItem key={b.id} badge={b} onClick={() => setModalBadge(b)} />
              ))}
            </div>
          </>
        )}
        {visLocked.length > 0 && (
          <>
            <SectionLabel>🔒 Bloqueadas ({visLocked.length})</SectionLabel>
            <div className="flex flex-col gap-2 mb-7">
              {visLocked.map(b => (
                <BadgeListItem key={b.id} badge={b} onClick={() => setModalBadge(b)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modalBadge && (
        <BadgeModal
          badge={modalBadge}
          isJornada={isJornada}
          onClose={() => setModalBadge(null)}
        />
      )}
    </div>
  )
}
