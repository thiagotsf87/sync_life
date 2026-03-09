'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import {
  FUTURO_PRIMARY,
  FUTURO_PRIMARY_LIGHT,
  FUTURO_GRAD,
} from '@/lib/futuro-colors'

// ─── Types & Constants ─────────────────────────────────────────────────────────

interface ObjectiveType {
  id: string
  icon: string
  name: string
  description: string
  jornadaTag: string
  iconBg: string
}

const OBJECTIVE_TYPES: ObjectiveType[] = [
  { id: 'financial', icon: '🏠', name: 'Aquisição', description: 'Casa, carro, imóvel', jornadaTag: '💫 Conquista', iconBg: 'rgba(139,92,246,0.12)' },
  { id: 'experience', icon: '✈️', name: 'Experiência', description: 'Viagem, evento', jornadaTag: '🌍 Vivência', iconBg: 'rgba(20,184,166,0.12)' },
  { id: 'educational', icon: '🎓', name: 'Desenvolvimento', description: 'Estudo, MBA', jornadaTag: '🧠 Evolução', iconBg: 'rgba(139,92,246,0.12)' },
  { id: 'health', icon: '🛡️', name: 'Segurança', description: 'Reserva', jornadaTag: '🏰 Proteção', iconBg: 'rgba(16,185,129,0.12)' },
  { id: 'professional', icon: '🚀', name: 'Liberdade', description: 'FIRE', jornadaTag: '🔑 Missão máxima', iconBg: 'rgba(245,158,11,0.12)' },
  { id: 'other', icon: '✨', name: 'Outro', description: 'Personalizado', jornadaTag: '⚡ Missão livre', iconBg: 'rgba(110,144,184,0.1)' },
]

const EMOJI_OPTIONS = ['🏠', '🚗', '🏍️', '💍', '🖥️', '🎁']

const PRIORITY_OPTIONS = [
  { value: 'high' as const, label: 'Alta', emoji: '🔥' },
  { value: 'medium' as const, label: 'Média', emoji: '⚡' },
  { value: 'low' as const, label: 'Baixa', emoji: '💎' },
]

interface LinkedModule {
  id: string
  icon: string
  name: string
  description: string
  jornadaDescription: string
  iconBg: string
  enabled: boolean
}

const INITIAL_MODULES: LinkedModule[] = [
  { id: 'financas', icon: '💰', name: 'Finanças', description: 'Cria envelope R$ 800/mês', jornadaDescription: 'Cria envelope automático', iconBg: 'rgba(16,185,129,0.15)', enabled: true },
  { id: 'patrimonio', icon: '📈', name: 'Patrimônio', description: 'Vincula ao acompanhamento', jornadaDescription: 'Monitora crescimento', iconBg: 'rgba(245,158,11,0.15)', enabled: true },
  { id: 'carreira', icon: '💼', name: 'Carreira', description: 'Metas de aumento salarial', jornadaDescription: 'Metas de renda para acelerar', iconBg: 'rgba(236,72,153,0.15)', enabled: false },
]

export interface GoalInput {
  name: string
  category: string
  indicator_type: 'monetary' | 'weight' | 'task' | 'frequency' | 'percentage' | 'quantity'
  target_value: number
  current_value: number
}

const MODULE_OPTIONS = [
  { id: 'financas', icon: '💰', label: 'Finanças', bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  { id: 'corpo', icon: '💪', label: 'Corpo', bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  { id: 'mente', icon: '🧠', label: 'Mente', bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  { id: 'patrimonio', icon: '📊', label: 'Patrimônio', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  { id: 'carreira', icon: '💼', label: 'Carreira', bg: 'rgba(236,72,153,0.15)', color: '#ec4899' },
  { id: 'experiencias', icon: '✈️', label: 'Experiências', bg: 'rgba(20,184,166,0.15)', color: '#14b8a6' },
  { id: 'tempo', icon: '⏱️', label: 'Tempo', bg: 'rgba(6,182,212,0.15)', color: '#06b6d4' },
  { id: 'futuro', icon: '🔮', label: 'Futuro', bg: 'rgba(0,85,255,0.15)', color: '#0055ff' },
]

const INDICATOR_OPTIONS: { value: GoalInput['indicator_type']; label: string }[] = [
  { value: 'monetary', label: 'Monetário (R$)' },
  { value: 'quantity', label: 'Quantidade' },
  { value: 'percentage', label: 'Percentual (%)' },
  { value: 'task', label: 'Tarefa (sim/não)' },
  { value: 'frequency', label: 'Frequência' },
  { value: 'weight', label: 'Peso (kg)' },
]

const WEIGHT_OPTIONS = [
  { value: '0.5', label: 'Baixo (0.5×)', hint: 'Meta de suporte' },
  { value: '1.0', label: 'Normal (1.0×)', hint: 'Peso padrão' },
  { value: '1.5', label: 'Alto (1.5×)', hint: 'Meta importante' },
  { value: '2.0', label: 'Máximo (2.0×)', hint: 'Meta com peso 2.0 conta o dobro' },
]

const FREE_GOAL_LIMIT = 3

interface FuturoWizardMobileProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    category: string
    targetValue: number
    contribution: number
    goals: GoalInput[]
    icon: string
    priority: 'high' | 'medium' | 'low'
  }) => void
  isLoading?: boolean
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function FuturoWizardMobile({ open, onClose, onSave, isLoading }: FuturoWizardMobileProps) {
  const accent = FUTURO_PRIMARY

  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [targetValue, setTargetValue] = useState(80000)
  const [icon, setIcon] = useState('🏠')
  const [deadline, setDeadline] = useState('2028-12')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [description, setDescription] = useState('')
  const [contribution, setContribution] = useState(800)
  const [modules, setModules] = useState(INITIAL_MODULES)

  // Step 3 — Goals
  const [goals, setGoals] = useState<GoalInput[]>([])
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newGoalModule, setNewGoalModule] = useState('financas')
  const [newGoalName, setNewGoalName] = useState('')
  const [newGoalType, setNewGoalType] = useState<GoalInput['indicator_type']>('monetary')
  const [newGoalTarget, setNewGoalTarget] = useState('')
  const [newGoalCurrentValue, setNewGoalCurrentValue] = useState('')

  if (!open) return null

  const totalSteps = 4
  const canContinue1 = selectedType !== null
  const canContinue2 = name.trim().length > 0 && targetValue > 0

  const toggleModule = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  }

  const handleSubmit = () => {
    onSave({
      name,
      category: selectedType ?? 'other',
      targetValue,
      contribution,
      goals,
      icon,
      priority,
    })
  }

  const handleAddGoal = () => {
    if (!newGoalName.trim()) return
    const targetNum = parseFloat(newGoalTarget) || 0
    const currentNum = parseFloat(newGoalCurrentValue) || 0
    setGoals(prev => [...prev, {
      name: newGoalName.trim(),
      category: newGoalModule,
      indicator_type: newGoalType,
      target_value: targetNum,
      current_value: currentNum,
    }])
    setNewGoalName('')
    setNewGoalTarget('')
    setNewGoalCurrentValue('')
    setNewGoalModule('financas')
    setNewGoalType('monetary')
    setShowGoalForm(false)
  }

  const handleRemoveGoal = (idx: number) => {
    setGoals(prev => prev.filter((_, i) => i !== idx))
  }

  const handleClose = () => {
    onClose()
    setStep(1)
    setSelectedType(null)
    setName('')
    setTargetValue(80000)
    setGoals([])
    setShowGoalForm(false)
    setPriority('medium')
    setDescription('')
    setNewGoalCurrentValue('')
  }

  // Contribution slider percentage (200-2000 range)
  const sliderPct = ((contribution - 200) / (2000 - 200)) * 100

  const stepLabel = step === 4 ? 'Último passo!' : `Passo ${step} de ${totalSteps}`

  const stepTitle = () => {
    if (step === 1) return 'Qual é o seu sonho?'
    if (step === 2) return 'Defina seu objetivo'
    if (step === 3) return 'Metas do Objetivo'
    return 'Quanto você investe neste sonho?'
  }

  const stepDesc = () => {
    if (step === 1) return (
      <><strong className="text-[var(--sl-t1)]">Cada objetivo</strong> vira uma <strong className="text-[var(--sl-t1)]">missão</strong> ativa no seu Futuro. Qual será a próxima?</>
    )
    if (step === 2) return 'Dê um nome e defina o valor da sua meta.'
    if (step === 3) return 'O que você vai acompanhar neste objetivo?'
    return 'A IA projeta o caminho mais rápido para você chegar lá.'
  }

  const atGoalLimit = goals.length >= FREE_GOAL_LIMIT

  // Unique module ids in goals list (for summary chips)
  const uniqueModules = Array.from(new Set(goals.map(g => g.category)))
    .map(id => MODULE_OPTIONS.find(m => m.id === id))
    .filter(Boolean) as (typeof MODULE_OPTIONS[0])[]

  const selectedGoalMod = MODULE_OPTIONS.find(m => m.id === newGoalModule)

  return (
    <div className="fixed inset-0 z-50 bg-[var(--sl-bg)] flex flex-col overflow-y-auto lg:hidden">
      {/* Progress bar */}
      <div className="flex gap-1.5 px-5 pt-[14px]">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-[2px]"
            style={{
              background: i < step - 1
                ? `${accent}66`
                : i === step - 1
                  ? accent
                  : 'var(--sl-s3)',
            }}
          />
        ))}
      </div>

      {/* Header area */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.8px] mb-1.5" style={{ color: accent }}>
          {stepLabel}
        </p>
        <h2 className="font-[Syne] text-[21px] font-extrabold text-[var(--sl-t1)] leading-[1.25] mb-2">
          {stepTitle()}
        </h2>
        <p className="text-[13px] text-[var(--sl-t2)] leading-[1.6]">
          {stepDesc()}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5">

        {/* STEP 1: Type selection */}
        {step === 1 && (
          <>
            {/* XP hint */}
            <div
              className="flex items-center gap-2 mb-4 px-[13px] py-2 rounded-[20px]"
              style={{
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.2)',
              }}
            >
              <span className="text-[14px]">⚡</span>
              <span className="text-[12px] font-semibold" style={{ color: FUTURO_PRIMARY_LIGHT }}>
                Criar esta missão vale <strong className="text-[var(--sl-t1)]">+50 XP</strong> imediatos
              </span>
            </div>

            {/* Type grid */}
            <div className="grid grid-cols-2 gap-[10px] mb-[18px]">
              {OBJECTIVE_TYPES.map(type => {
                const selected = selectedType === type.id
                return (
                  <button
                    key={type.id}
                    onClick={() => { setSelectedType(type.id); setIcon(type.icon) }}
                    className="flex flex-col gap-[7px] p-3 rounded-[10px] text-left transition-colors"
                    style={{
                      background: selected
                        ? 'rgba(139,92,246,0.08)'
                        : 'var(--sl-s1)',
                      border: selected
                        ? '1px solid rgba(139,92,246,0.5)'
                        : '1px solid var(--sl-border)',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px]"
                      style={{ background: type.iconBg }}
                    >
                      {type.icon}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[var(--sl-t1)]">{type.name}</p>
                      <p className="text-[10px] text-[var(--sl-t2)] leading-[1.4]">
                        {type.description.split(',')[0]}
                      </p>
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.5px]" style={{ color: FUTURO_PRIMARY_LIGHT }}>
                      {type.jornadaTag}
                    </p>
                    {/* Check circle */}
                    <div
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center self-end mt-auto"
                      style={{
                        background: selected ? accent : 'transparent',
                        border: selected ? `2px solid ${accent}` : '2px solid var(--sl-border-h)',
                      }}
                    >
                      {selected && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* STEP 2: Name, Value, Emoji, Prazo, Descrição, Prioridade */}
        {step === 2 && (
          <div className="flex flex-col gap-[13px]">
            {/* Nome */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--sl-t2)] mb-1.5 block">
                Nome do objetivo
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Comprar meu apartamento"
                className="w-full bg-[var(--sl-s1)] border rounded-[10px] px-[15px] py-3 text-[14px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none"
                style={{ borderColor: name ? accent : 'var(--sl-border)' }}
              />
            </div>

            {/* Valor total */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--sl-t2)] mb-1.5 block">
                Valor total da meta
              </label>
              <input
                type="text"
                value={`R$ ${targetValue.toLocaleString('pt-BR')}`}
                onChange={e => {
                  const num = parseInt(e.target.value.replace(/\D/g, ''), 10)
                  if (!isNaN(num)) setTargetValue(num)
                }}
                className="w-full bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] px-[15px] py-3 font-[DM_Mono] text-[14px] text-[var(--sl-t1)] outline-none"
              />
            </div>

            {/* Emoji picker */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--sl-t2)] mb-[8px] block">
                Ícone
              </label>
              <div className="flex gap-[7px]">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className="flex-1 h-[42px] rounded-[12px] flex items-center justify-center text-[20px] transition-colors"
                    style={{
                      background: icon === emoji ? 'rgba(139,92,246,0.12)' : 'var(--sl-s1)',
                      border: icon === emoji ? `2px solid ${accent}` : '1px solid var(--sl-border)',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Prazo */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--sl-t2)] mb-1.5 block">
                Prazo
              </label>
              <input
                type="month"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] px-[15px] py-3 text-[14px] text-[var(--sl-t1)] outline-none"
              />
              <p className="text-[10px] mt-[5px] leading-[1.5]" style={{ color: FUTURO_PRIMARY_LIGHT }}>
                {"🧭 Coach: '24 meses é realista para aquisições'"}
              </p>
            </div>

            {/* Descrição / Motivação */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--sl-t2)] mb-1.5 block">
                Motivação (opcional)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="O que muda na sua vida ao conquistar?"
                rows={2}
                className="w-full bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] px-[15px] py-3 text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none resize-none leading-[1.5]"
              />
            </div>

            {/* Prioridade */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--sl-t2)] mb-[8px] block">
                Nível da missão
              </label>
              <div className="flex gap-[8px]">
                {PRIORITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPriority(opt.value)}
                    className="flex-1 flex items-center justify-center gap-[5px] p-[10px] rounded-[10px] text-[12px] font-semibold transition-colors"
                    style={{
                      background: priority === opt.value ? 'rgba(139,92,246,0.08)' : 'var(--sl-s1)',
                      border: priority === opt.value
                        ? '1px solid rgba(139,92,246,0.3)'
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
          </div>
        )}

        {/* STEP 3: Goals */}
        {step === 3 && (
          <div className="flex flex-col gap-[10px]">
            {/* Goal limit badge */}
            {atGoalLimit && (
              <div
                className="flex items-center gap-2 px-[13px] py-2 rounded-[20px] mb-1"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.25)',
                }}
              >
                <span className="text-[12px]">🔒</span>
                <span className="text-[11px] font-semibold text-[#f59e0b]">
                  Limite FREE: 3 metas por objetivo
                </span>
              </div>
            )}

            {/* Existing goals */}
            {goals.map((goal, idx) => {
              const mod = MODULE_OPTIONS.find(m => m.id === goal.category)
              return (
                <div
                  key={idx}
                  className="flex items-center gap-[10px] p-[10px_13px] rounded-[12px]"
                  style={{
                    background: 'var(--sl-s1)',
                    border: '1px solid var(--sl-border)',
                    borderLeft: `3px solid ${mod?.color ?? accent}`,
                  }}
                >
                  <div
                    className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[16px] shrink-0"
                    style={{ background: mod?.bg ?? 'rgba(139,92,246,0.12)' }}
                  >
                    {mod?.icon ?? '🎯'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[var(--sl-t1)] truncate">{goal.name}</p>
                    <p className="text-[10px] text-[var(--sl-t2)] mt-[1px]">
                      {mod?.label} · {INDICATOR_OPTIONS.find(o => o.value === goal.indicator_type)?.label}
                      {goal.target_value > 0 ? ` · ${goal.target_value}` : ''}
                      {goal.current_value > 0 ? ` (atual: ${goal.current_value})` : ''}
                    </p>
                    <p className="text-[9px] font-bold mt-[2px]" style={{ color: FUTURO_PRIMARY_LIGHT }}>
                      ⚡ +80 XP ao concluir
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveGoal(idx)}
                    className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(244,63,94,0.1)' }}
                  >
                    <Trash2 size={13} color="#f43f5e" />
                  </button>
                </div>
              )
            })}

            {/* Summary chips (shown when goals > 0) */}
            {goals.length > 0 && !showGoalForm && (
              <div
                className="p-[10px_13px] rounded-[12px]"
                style={{
                  background: 'rgba(139,92,246,0.06)',
                  border: '1px solid rgba(139,92,246,0.15)',
                }}
              >
                <p className="text-[11px] font-semibold text-[var(--sl-t2)] mb-[7px]">
                  {`${goals.length} aliados recrutados · ${uniqueModules.length} módulos`}
                </p>
                <div className="flex flex-wrap gap-[5px]">
                  {uniqueModules.map(mod => (
                    <span
                      key={mod.id}
                      className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-[10px] text-[10px] font-semibold"
                      style={{ background: mod.bg, color: mod.color }}
                    >
                      {mod.icon} {mod.label}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] font-bold mt-[7px]" style={{ color: FUTURO_PRIMARY_LIGHT }}>
                  ⚡ XP estimado: +{goals.length * 80} XP até a conclusão
                </p>
              </div>
            )}

            {/* Add goal form */}
            {showGoalForm ? (
              <div
                className="rounded-[12px] p-[13px]"
                style={{
                  background: 'var(--sl-s1)',
                  border: `1px solid ${accent}33`,
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.6px] mb-[10px]" style={{ color: accent }}>
                  Recrutar aliado
                </p>
                <div className="flex flex-col gap-[9px]">
                  {/* Module grid — 4 columns */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[var(--sl-t3)] mb-[7px]">Módulo</p>
                    <div className="grid grid-cols-4 gap-[6px]">
                      {MODULE_OPTIONS.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setNewGoalModule(m.id)}
                          className="flex flex-col items-center gap-[3px] p-[8px_4px] rounded-[10px] text-[9px] font-semibold transition-colors"
                          style={{
                            background: newGoalModule === m.id ? m.bg : 'var(--sl-s2)',
                            border: newGoalModule === m.id ? `1px solid ${m.color}60` : '1px solid var(--sl-border)',
                            color: newGoalModule === m.id ? m.color : 'var(--sl-t3)',
                          }}
                        >
                          <span className="text-[18px]">{m.icon}</span>
                          <span className="text-center leading-[1.2]">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Goal name */}
                  <input
                    type="text"
                    value={newGoalName}
                    onChange={e => setNewGoalName(e.target.value)}
                    placeholder="Ex: Guardar R$ 500/mês"
                    className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[8px] px-3 py-2 text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none"
                  />

                  {/* Indicator type */}
                  <select
                    value={newGoalType}
                    onChange={e => setNewGoalType(e.target.value as GoalInput['indicator_type'])}
                    className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[8px] px-3 py-2 text-[13px] text-[var(--sl-t1)] outline-none"
                  >
                    {INDICATOR_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>

                  {/* Target value + initial value (side by side) */}
                  {newGoalType !== 'task' && (
                    <div className="grid grid-cols-2 gap-[8px]">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[var(--sl-t3)] mb-[5px]">Valor alvo</p>
                        <input
                          type="number"
                          value={newGoalTarget}
                          onChange={e => setNewGoalTarget(e.target.value)}
                          placeholder="Ex: 80000"
                          className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[8px] px-3 py-2 text-[13px] font-[DM_Mono] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[var(--sl-t3)] mb-[5px]">Valor inicial</p>
                        <input
                          type="number"
                          value={newGoalCurrentValue}
                          onChange={e => setNewGoalCurrentValue(e.target.value)}
                          placeholder="Já tenho..."
                          className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[8px] px-3 py-2 text-[13px] font-[DM_Mono] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Automation preview */}
                  {selectedGoalMod && (
                    <div
                      className="p-[9px_12px] rounded-[10px]"
                      style={{
                        background: 'var(--sl-s2)',
                        border: '1px solid var(--sl-border)',
                      }}
                    >
                      <p className="text-[10px] text-[var(--sl-t3)] leading-[1.4]">
                        Será criado: <strong className="text-[var(--sl-t2)]">Envelope &apos;{name || 'Objetivo'}&apos;</strong> em {selectedGoalMod.icon} {selectedGoalMod.label} automaticamente
                        {<> · <span style={{ color: FUTURO_PRIMARY_LIGHT }}>+80 XP/marco</span></>}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-[8px] mt-1">
                    <button
                      onClick={() => setShowGoalForm(false)}
                      className="flex-1 h-9 rounded-[8px] text-[12px] font-semibold text-[var(--sl-t2)] bg-[var(--sl-s2)] border border-[var(--sl-border)]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddGoal}
                      disabled={!newGoalName.trim()}
                      className="flex-1 h-9 rounded-[8px] text-[12px] font-semibold text-white disabled:opacity-40"
                      style={{ background: accent }}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              !atGoalLimit && (
                <button
                  onClick={() => setShowGoalForm(true)}
                  className="flex items-center justify-center gap-2 w-full h-[44px] rounded-[12px] text-[13px] font-semibold border-dashed"
                  style={{
                    background: 'transparent',
                    border: '1px dashed var(--sl-border-h)',
                    color: 'var(--sl-t2)',
                  }}
                >
                  <Plus size={16} />
                  + Recrutar outro aliado
                </button>
              )
            )}

            {/* Empty state hint */}
            {goals.length === 0 && !showGoalForm && (
              <p className="text-center text-[12px] text-[var(--sl-t3)] mt-2 leading-[1.6]">
                Metas são opcionais. Você pode adicionar depois no detalhe do objetivo.
              </p>
            )}
          </div>
        )}

        {/* STEP 4: Configure contribution */}
        {step === 4 && (
          <>
            {/* Slider */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-[13px_15px] mb-[13px]">
              <div className="flex justify-between items-center mb-[11px]">
                <span className="text-[12px] text-[var(--sl-t2)]">Contribuição mensal</span>
                <span className="font-[DM_Mono] text-[18px] font-medium" style={{ color: accent }}>
                  R$ {contribution.toLocaleString('pt-BR')}
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={2000}
                step={50}
                value={contribution}
                onChange={e => setContribution(Number(e.target.value))}
                className="w-full h-1 rounded-[2px] appearance-none cursor-pointer mb-2"
                style={{
                  background: `linear-gradient(to right, ${accent} ${sliderPct}%, var(--sl-s3) ${sliderPct}%)`,
                  accentColor: accent,
                }}
              />
              <div className="flex justify-between text-[10px] text-[var(--sl-t3)]">
                <span>R$ 200</span>
                <span>R$ 2.000</span>
              </div>
            </div>

            {/* Projection card */}
            <div
              className="rounded-[10px] p-[13px] mb-3"
              style={{
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.15)',
              }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.5px] mb-[9px]" style={{ color: accent }}>
                Impacto na sua jornada
              </p>
              <div className="flex justify-between items-center py-[5px] border-b border-[var(--sl-border)]">
                <span className="text-[12px] text-[var(--sl-t2)]">Prazo projetado</span>
                <span className="font-[DM_Mono] text-[12px] font-medium text-[#10b981]">Dez 2028 ✓</span>
              </div>
              <div className="flex justify-between items-center py-[5px] border-b border-[var(--sl-border)]">
                <span className="text-[12px] text-[var(--sl-t2)]">Total c/ rendimento</span>
                <span className="font-[DM_Mono] text-[12px] font-medium" style={{ color: accent }}>R$ 83.200</span>
              </div>
              <div className="flex justify-between items-center py-[5px] border-b border-[var(--sl-border)]">
                <span className="text-[12px] text-[var(--sl-t2)]">XP mensal desta missão</span>
                <span className="font-[DM_Mono] text-[12px] font-medium" style={{ color: FUTURO_PRIMARY_LIGHT }}>+80 XP/mês ⚡</span>
              </div>
              <div className="flex justify-between items-center py-[5px]">
                <span className="text-[12px] text-[var(--sl-t2)]">Impacto no Life Score</span>
                <span className="font-[DM_Mono] text-[12px] font-medium text-[#10b981]">+8 pts Futuro ↑</span>
              </div>
            </div>

            {/* Module linker */}
            <p className="text-[12px] font-bold text-[var(--sl-t1)] mb-[3px]">
              Aliados desta missão
            </p>
            <p className="text-[11px] text-[var(--sl-t3)] mb-[10px]">Módulos que vão trabalhar com você</p>

            {modules.map(mod => (
              <button
                key={mod.id}
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center gap-[11px] p-[10px_13px] rounded-[10px] mb-2 text-left transition-colors"
                style={{
                  background: 'var(--sl-s1)',
                  border: mod.enabled
                    ? '1px solid rgba(139,92,246,0.3)'
                    : '1px solid var(--sl-border)',
                }}
              >
                <div
                  className="w-[33px] h-[33px] rounded-[10px] flex items-center justify-center text-[16px]"
                  style={{ background: mod.iconBg }}
                >
                  {mod.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{mod.name}</p>
                  <p className="text-[11px] text-[var(--sl-t2)] mt-[1px]">
                    {mod.jornadaDescription}
                  </p>
                </div>
                {/* Toggle */}
                <div
                  className="w-7 h-4 rounded-lg relative shrink-0"
                  style={{ background: mod.enabled ? accent : 'var(--sl-s3)' }}
                >
                  <div
                    className="w-3 h-3 rounded-full bg-white absolute top-[2px] transition-[left] duration-150"
                    style={{ left: mod.enabled ? '14px' : '2px' }}
                  />
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-6 pt-3">
        {step < totalSteps ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !canContinue1 : step === 2 ? !canContinue2 : false}
              className="w-full h-[46px] rounded-[14px] text-[14px] font-semibold text-white disabled:opacity-40 transition-opacity"
              style={{ background: FUTURO_GRAD }}
            >
              Continuar →
              {step === 1 && <span className="text-[11px] opacity-80 ml-1">+50 XP</span>}
            </button>
            {/* Skip for step 3 (Goals) */}
            {step === 3 && goals.length === 0 && (
              <button
                onClick={() => setStep(4)}
                className="w-full h-[38px] rounded-[12px] text-[13px] font-medium text-[var(--sl-t3)]"
              >
                Pular (adicionar depois)
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-[46px] rounded-[14px] text-[14px] font-semibold text-white disabled:opacity-60 transition-opacity"
            style={{ background: FUTURO_GRAD }}
          >
            🚀 Iniciar missão → <span className="text-[11px] opacity-80">+50 XP</span>
          </button>
        )}
        {step === 1 && (
          <p className="text-center mt-[10px] text-[12px] text-[var(--sl-t3)]">
            Você pode alterar o tipo depois
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--sl-s2)] flex items-center justify-center"
      >
        <X size={16} className="text-[var(--sl-t2)]" />
      </button>
    </div>
  )
}
