'use client'

import { useState } from 'react'
import { ChevronLeft, Plus } from 'lucide-react'
import { FUTURO_PRIMARY, FUTURO_PRIMARY_LIGHT } from '@/lib/futuro-colors'
import { fmtBRL } from '@/lib/format/currency'

interface GoalItem {
  id: string
  name: string
  target_module: string
  target_value?: number | null
  indicator_type?: string
}

interface FuturoEditarMobileProps {
  objectiveName: string
  objectiveIcon: string
  category: string
  targetValue: number
  contribution: number
  deadlineMonth: string
  deadlineYear: string
  priority?: 'high' | 'medium' | 'low'
  goals?: GoalItem[]
  open: boolean
  onClose: () => void
  onSave?: (data: { contribution: number; priority: 'high' | 'medium' | 'low' }) => void
  onPause?: () => void
  onDelete?: () => void
  onAddGoal?: () => void
  onEditGoal?: (id: string) => void
  onDeleteGoal?: (id: string) => void
}

const MODULE_META: Record<string, { icon: string; label: string; bg: string; color: string }> = {
  financas:     { icon: '💰', label: 'Finanças',     bg: 'rgba(15,118,110,0.15)',  color: 'var(--sl-em)' },
  tempo:        { icon: '⏳', label: 'Tempo',        bg: 'rgba(60,160,181,0.15)',   color: 'var(--sl-info)' },
  corpo:        { icon: '💪', label: 'Corpo',        bg: 'rgba(217,117,52,0.15)',  color: '#D97534' },
  mente:        { icon: '🧠', label: 'Mente',        bg: 'rgba(139,123,212,0.15)',  color: '#8B7BD4' },
  patrimonio:   { icon: '📊', label: 'Patrimônio',   bg: 'rgba(217,150,46,0.15)',  color: 'var(--sl-warning)' },
  carreira:     { icon: '💼', label: 'Carreira',     bg: 'rgba(199,103,149,0.15)',  color: '#C76795' },
  experiencias: { icon: '✈️', label: 'Experiências', bg: 'rgba(20,184,166,0.15)',  color: '#14b8a6' },
  futuro:       { icon: '🔮', label: 'Futuro',       bg: 'rgba(0,85,255,0.15)',    color: '#0B2D34' },
}

const PRIORITY_OPTIONS = [
  { value: 'high' as const, label: 'Alta', emoji: '🔥' },
  { value: 'medium' as const, label: 'Média', emoji: '⚡' },
  { value: 'low' as const, label: 'Baixa', emoji: '💎' },
]

export function FuturoEditarMobile({
  objectiveName,
  objectiveIcon,
  category,
  targetValue,
  contribution: initialContribution,
  deadlineMonth,
  deadlineYear,
  priority: initialPriority = 'medium',
  goals = [],
  open,
  onClose,
  onSave,
  onPause,
  onDelete,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
}: FuturoEditarMobileProps) {
  const accent = FUTURO_PRIMARY

  const [contribution, setContribution] = useState(initialContribution)
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(initialPriority)
  const [notifications, setNotifications] = useState({
    monthly: true,
    delay: true,
    insights: false,
  })

  if (!open) return null

  const sliderPct = ((contribution - 200) / (2000 - 200)) * 100

  return (
    <div className="fixed inset-0 z-50 bg-[var(--sl-bg)] flex flex-col overflow-y-auto lg:hidden">
      {/* Header: back + title + save */}
      <div className="flex items-center justify-between px-5 pt-[11px] pb-[10px]">
        <button
          onClick={onClose}
          className="flex items-center gap-[5px] text-[13px] font-semibold"
          style={{ color: accent }}
        >
          <ChevronLeft size={15} strokeWidth={2.5} />
          {objectiveName}
        </button>
        <span className="font-[Syne] text-[15px] font-bold text-[var(--sl-t1)]">
          Editar Missão
        </span>
        <button
          onClick={() => onSave?.({ contribution, priority })}
          className="text-[13px] font-semibold"
          style={{ color: accent }}
        >
          Salvar
        </button>
      </div>

      {/* Sections */}
      <div className="flex-1">
        {/* Identification */}
        <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[13px_15px]">
          <p className="font-[Syne] text-[11px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] mb-[11px]">
            Identificação
          </p>
          <div className="mb-[13px]">
            <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--sl-t2)] mb-1.5 block">Nome</label>
            <div
              className="w-full flex items-center justify-between bg-[var(--sl-s1)] rounded-[10px] px-[15px] py-3 text-[14px]"
              style={{ border: `1px solid ${accent}` }}
            >
              <span className="text-[var(--sl-t1)]">{objectiveName}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--sl-t2)] mb-1.5 block">Tipo</label>
            <div className="w-full flex items-center justify-between bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] px-[15px] py-3 text-[14px]">
              <span className="text-[var(--sl-t1)]">
                {objectiveIcon} Missão de Conquista
              </span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--sl-t2)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Priority selector */}
        <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[13px_15px]">
          <p className="font-[Syne] text-[11px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] mb-[11px]">
            Nível da missão
          </p>
          <div className="flex gap-[8px]">
            {PRIORITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPriority(opt.value)}
                className="flex-1 flex items-center justify-center gap-[5px] p-[10px] rounded-[10px] text-[12px] font-semibold transition-colors"
                style={{
                  background: priority === opt.value ? 'rgba(139,123,212,0.08)' : 'var(--sl-s2)',
                  border: priority === opt.value
                    ? '1px solid rgba(139,123,212,0.3)'
                    : '1px solid var(--sl-border)',
                  color: priority === opt.value ? accent : 'var(--sl-t2)',
                }}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Goals list */}
        <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[13px_15px]">
          <div className="flex items-center justify-between mb-[11px]">
            <p className="font-[Syne] text-[11px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px]">
              {`Aliados (${goals.length})`}
            </p>
          </div>

          {goals.length > 0 ? (
            <div className="flex flex-col gap-[8px] mb-[10px]">
              {goals.map(goal => {
                const mod = MODULE_META[goal.target_module] ?? { icon: '🎯', label: goal.target_module, bg: 'rgba(139,123,212,0.12)', color: '#8B7BD4' }
                return (
                  <div
                    key={goal.id}
                    className="flex items-center gap-[10px] p-[9px_11px] rounded-[10px]"
                    style={{
                      background: 'var(--sl-s2)',
                      border: '1px solid var(--sl-border)',
                    }}
                  >
                    <div
                      className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center text-[15px] shrink-0"
                      style={{ background: mod.bg }}
                    >
                      {mod.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[var(--sl-t1)] truncate">{goal.name}</p>
                      <p className="text-[10px] text-[var(--sl-t2)] mt-[1px]">
                        {mod.label}
                        {goal.target_value ? ` · ${fmtBRL(goal.target_value, { compact: true })}` : ''}
                        {' · +80 XP/marco'}
                      </p>
                    </div>
                    <div className="flex gap-[5px] shrink-0">
                      <button
                        onClick={() => onEditGoal?.(goal.id)}
                        className="w-[26px] h-[26px] rounded-[8px] flex items-center justify-center text-[13px]"
                        style={{ background: 'var(--sl-s3)' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeleteGoal?.(goal.id)}
                        className="w-[26px] h-[26px] rounded-[8px] flex items-center justify-center text-[13px]"
                        style={{ background: 'rgba(219,100,120,0.1)' }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[12px] text-[var(--sl-t3)] mb-[10px]">
              Nenhum aliado recrutado ainda.
            </p>
          )}

          <button
            onClick={onAddGoal}
            className="flex items-center justify-center gap-2 w-full h-[40px] rounded-[10px] text-[12px] font-semibold border-dashed"
            style={{
              background: 'transparent',
              border: '1px dashed var(--sl-border-h)',
              color: 'var(--sl-t2)',
            }}
          >
            <Plus size={14} />
            + Adicionar aliado
          </button>
        </div>

        {/* Values & Deadline */}
        <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[13px_15px]">
          <p className="font-[Syne] text-[11px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] mb-[11px]">
            Valores e Prazo
          </p>
          <div className="mb-[13px]">
            <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--sl-t2)] mb-1.5 block">Meta total</label>
            <div className="w-full bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] px-[15px] py-3 text-[14px] text-[var(--sl-t1)]">
              {fmtBRL(targetValue)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[10px]">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--sl-t2)] mb-1.5 block">Mês</label>
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] px-[15px] py-3 text-[14px] text-[var(--sl-t1)]">
                {deadlineMonth}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--sl-t2)] mb-1.5 block">Ano</label>
              <div
                className="bg-[var(--sl-s1)] rounded-[10px] px-[15px] py-3 text-[14px] text-[var(--sl-t1)]"
                style={{ border: `1px solid ${accent}` }}
              >
                {deadlineYear}
              </div>
            </div>
          </div>
        </div>

        {/* Contribution slider */}
        <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[13px_15px]">
          <div className="flex items-center justify-between mb-[10px]">
            <p className="font-[Syne] text-[11px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px]">
              Contribuição Mensal
            </p>
            <span className="sl-num-strong text-[17px]" style={{ color: accent }}>
              {fmtBRL(contribution)}
            </span>
          </div>
          <input
            type="range"
            min={200}
            max={2000}
            step={50}
            value={contribution}
            onChange={e => setContribution(Number(e.target.value))}
            className="w-full h-1 rounded-[2px] appearance-none cursor-pointer mb-[10px]"
            style={{
              background: `linear-gradient(to right, ${accent} ${sliderPct}%, var(--sl-s3) ${sliderPct}%)`,
              accentColor: accent,
            }}
          />
          <div
            className="p-[9px_12px] rounded-[10px]"
            style={{
              background: 'rgba(139,123,212,0.08)',
              border: '1px solid rgba(139,123,212,0.15)',
            }}
          >
            <p className="text-[11px] font-semibold mb-[3px]" style={{ color: accent }}>
              Com {fmtBRL(contribution)}/mês
            </p>
            <p className="text-[12px] text-[var(--sl-t2)]">
              Novo prazo: <strong className="text-[var(--sl-em)]">Out 2028</strong> · 2 meses antes ✓
              {<> · <span style={{ color: FUTURO_PRIMARY_LIGHT }}>+80 XP/mês</span></>}
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="mx-4 mb-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[13px_15px]">
          <p className="font-[Syne] text-[11px] font-bold text-[var(--sl-t2)] uppercase tracking-[0.5px] mb-[11px]">
            Notificações
          </p>
          {([
            { key: 'monthly' as const, label: 'Lembrete mensal', desc: 'Todo dia 1 do mês' },
            { key: 'delay' as const, label: 'Alertas de atraso', desc: 'Quando contrib. não ocorrer' },
            { key: 'insights' as const, label: 'Insights Coach', desc: 'Sugestões personalizadas' },
          ]).map((item, i) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2"
              style={{ borderBottom: i < 2 ? '1px solid var(--sl-border)' : 'none' }}
            >
              <div>
                <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{item.label}</p>
                <p className="text-[11px] text-[var(--sl-t2)]">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className="w-9 h-5 rounded-[10px] relative shrink-0"
                style={{ background: notifications[item.key] ? accent : 'var(--sl-s3)' }}
              >
                <div
                  className="w-4 h-4 rounded-full bg-white absolute top-[2px] transition-[left] duration-150"
                  style={{ left: notifications[item.key] ? '18px' : '2px' }}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <button
          onClick={onDelete}
          className="mx-4 mb-6 w-[calc(100%-32px)] p-3 rounded-[10px] text-center text-[13px] font-bold text-[var(--sl-danger)]"
          style={{
            background: 'rgba(219,100,120,0.08)',
            border: '1px solid rgba(219,100,120,0.2)',
          }}
        >
          ⚠️ Excluir missão permanentemente
        </button>
      </div>
    </div>
  )
}
