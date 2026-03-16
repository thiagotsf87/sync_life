'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  Smile,
  FileText,
  Clock,
  Home,
  Dumbbell,
  BookOpen,
  BarChart3,
  ChevronRight,
  Frown,
  Meh,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useObjectives, calcObjectiveProgress } from '@/hooks/use-futuro'
import { ModuleHeader } from '@/components/ui/module-header'

// ─── Constants ──────────────────────────────────────────────────────────────

const MODULE_COLOR = '#8b5cf6'
const MODULE_COLOR_DIM = 'rgba(139,92,246,0.08)'

const DAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] as const
const DAY_FULL_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'] as const

// ─── Mock goals for demonstration ──────────────────────────────────────────

interface CheckinGoal {
  id: string
  title: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  status: 'on_track' | 'attention' | 'at_risk'
  statusLabel: string
  inputLabel: string
  inputPlaceholder: string
  inputSuffix?: string
  currentValue: string
  type: 'currency' | 'number' | 'days'
}

const MOCK_GOALS: CheckinGoal[] = [
  {
    id: 'goal-1',
    title: 'Comprar Casa',
    icon: <Home size={16} />,
    iconBg: 'rgba(244,63,94,0.10)',
    iconColor: '#f43f5e',
    status: 'at_risk',
    statusLabel: 'Em Risco',
    inputLabel: 'Aportei:',
    inputPlaceholder: 'R$ 0,00',
    currentValue: '',
    type: 'currency',
  },
  {
    id: 'goal-2',
    title: 'Perder 10kg',
    icon: <Dumbbell size={16} />,
    iconBg: 'rgba(245,158,11,0.10)',
    iconColor: '#f59e0b',
    status: 'attention',
    statusLabel: 'Atenção',
    inputLabel: 'Peso atual:',
    inputPlaceholder: '0,0',
    inputSuffix: 'kg',
    currentValue: '82,0',
    type: 'number',
  },
  {
    id: 'goal-3',
    title: 'Ler 24 livros',
    icon: <BookOpen size={16} />,
    iconBg: 'rgba(16,185,129,0.10)',
    iconColor: '#10b981',
    status: 'on_track',
    statusLabel: 'No Ritmo',
    inputLabel: 'Lidos:',
    inputPlaceholder: '0',
    inputSuffix: '/ 24',
    currentValue: '6',
    type: 'number',
  },
  {
    id: 'goal-4',
    title: 'Treinar 4x/semana',
    icon: <BarChart3 size={16} />,
    iconBg: 'rgba(16,185,129,0.10)',
    iconColor: '#10b981',
    status: 'on_track',
    statusLabel: 'No Ritmo',
    inputLabel: 'Esta semana:',
    inputPlaceholder: '',
    currentValue: '',
    type: 'days',
  },
]

// ─── Mock check-in history ────────────────────────────────────────────────

interface CheckinHistoryItem {
  id: string
  date: string
  objectivesUpdated: number
  moodLevel: 'good' | 'neutral' | 'bad'
  moodColor: string
  moodBg: string
}

const MOCK_HISTORY: CheckinHistoryItem[] = [
  { id: 'h1', date: '07 de março de 2026', objectivesUpdated: 4, moodLevel: 'good', moodColor: '#10b981', moodBg: 'rgba(16,185,129,0.10)' },
  { id: 'h2', date: '28 de fevereiro de 2026', objectivesUpdated: 3, moodLevel: 'neutral', moodColor: '#f59e0b', moodBg: 'rgba(245,158,11,0.10)' },
  { id: 'h3', date: '21 de fevereiro de 2026', objectivesUpdated: 5, moodLevel: 'good', moodColor: '#10b981', moodBg: 'rgba(16,185,129,0.10)' },
  { id: 'h4', date: '14 de fevereiro de 2026', objectivesUpdated: 6, moodLevel: 'good', moodColor: '#10b981', moodBg: 'rgba(16,185,129,0.10)' },
]

// ─── Status pill helpers ───────────────────────────────────────────────────

function getStatusPillStyles(status: 'on_track' | 'attention' | 'at_risk') {
  switch (status) {
    case 'on_track': return { bg: 'rgba(16,185,129,0.10)', color: '#10b981' }
    case 'attention': return { bg: 'rgba(245,158,11,0.10)', color: '#f59e0b' }
    case 'at_risk': return { bg: 'rgba(244,63,94,0.10)', color: '#f43f5e' }
  }
}

// ─── Mood helpers ──────────────────────────────────────────────────────────

function getMoodLabel(value: number): string {
  if (value <= 3) return 'Ruim'
  if (value <= 6) return 'Neutro'
  return 'Ótimo'
}

function getMoodColor(value: number): string {
  if (value <= 3) return '#f43f5e'
  if (value <= 6) return '#f59e0b'
  return '#10b981'
}

// ─── Date helpers ──────────────────────────────────────────────────────────

function getCurrentDateString(): string {
  const now = new Date()
  const day = now.getDate()
  const month = now.toLocaleDateString('pt-BR', { month: 'long' })
  const year = now.getFullYear()
  return `${day} de ${month} de ${year}`
}

function getCurrentWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  return Math.ceil(diff / oneWeek)
}

function getTodayDayIndex(): number {
  const day = new Date().getDay()
  // Convert from Sunday=0 to Monday=0
  return day === 0 ? 6 : day - 1
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function FuturoCheckinPage() {
  const router = useRouter()
  const { active, loading } = useObjectives()

  // ─── State ────────────────────────────────────────────────────────────
  const [mood, setMood] = useState(7)
  const [notes, setNotes] = useState('')
  const [goalValues, setGoalValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    MOCK_GOALS.forEach(g => {
      initial[g.id] = g.currentValue
    })
    return initial
  })
  const [dayToggles, setDayToggles] = useState<boolean[]>(() => {
    const todayIdx = getTodayDayIndex()
    // Pre-fill: first 3 days done (mock)
    return DAY_LABELS.map((_, i) => i < 3)
  })
  const [saving, setSaving] = useState(false)

  // ─── Derived ──────────────────────────────────────────────────────────
  const moodPercentage = ((mood - 1) / 9) * 100
  const moodLabel = getMoodLabel(mood)
  const moodColor = getMoodColor(mood)
  const todayIdx = getTodayDayIndex()
  const trainDaysCount = dayToggles.filter(Boolean).length

  // Use real objectives if available, otherwise mock
  const displayGoals = useMemo(() => {
    if (!loading && active.length > 0) {
      return active.slice(0, 4).map((obj, idx): CheckinGoal => {
        const progress = calcObjectiveProgress(obj.goals ?? [])
        const firstGoal = (obj.goals ?? [])[0]
        const isMonetary = firstGoal?.indicator_type === 'monetary'
        const status: 'on_track' | 'attention' | 'at_risk' =
          progress < 30 ? 'at_risk' : progress < 60 ? 'attention' : 'on_track'
        const statusLabel = status === 'on_track' ? 'No Ritmo' : status === 'attention' ? 'Atenção' : 'Em Risco'

        return {
          id: obj.id,
          title: obj.name,
          icon: <span className="text-[14px]">{obj.icon}</span>,
          iconBg: idx % 2 === 0 ? 'rgba(244,63,94,0.10)' : 'rgba(16,185,129,0.10)',
          iconColor: idx % 2 === 0 ? '#f43f5e' : '#10b981',
          status,
          statusLabel,
          inputLabel: isMonetary ? 'Aportei:' : 'Atual:',
          inputPlaceholder: isMonetary ? 'R$ 0,00' : '0',
          inputSuffix: firstGoal?.target_value ? `/ ${firstGoal.target_value}` : undefined,
          currentValue: String(firstGoal?.current_value ?? 0),
          type: isMonetary ? 'currency' : 'number',
        }
      })
    }
    return MOCK_GOALS
  }, [active, loading])

  const updatedGoalsCount = useMemo(() => {
    return Object.keys(goalValues).filter(k => goalValues[k] && goalValues[k].trim() !== '').length
  }, [goalValues])

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleGoalValueChange = useCallback((goalId: string, value: string) => {
    setGoalValues(prev => ({ ...prev, [goalId]: value }))
  }, [])

  const handleDayToggle = useCallback((index: number) => {
    setDayToggles(prev => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      // Store check-in data locally (Supabase integration to be added later)
      const checkinData = {
        date: new Date().toISOString(),
        mood,
        notes,
        goalValues,
        dayToggles,
        weekNumber: getCurrentWeekNumber(),
      }
      const existing = JSON.parse(localStorage.getItem('sl_futuro_checkins') ?? '[]')
      existing.unshift(checkinData)
      localStorage.setItem('sl_futuro_checkins', JSON.stringify(existing.slice(0, 52)))
      localStorage.setItem('sl_futuro_checkin', new Date().toISOString())

      toast.success('Check-in semanal salvo com sucesso!')
      router.push('/futuro')
    } catch {
      toast.error('Erro ao salvar check-in')
    } finally {
      setSaving(false)
    }
  }, [mood, notes, goalValues, dayToggles, router])

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <>
      {/* ══════════════ MOBILE ══════════════ */}
      <div className="lg:hidden min-h-screen bg-[var(--sl-bg)] flex flex-col pb-[calc(68px+16px)]">
        {/* Mobile Header */}
        <div className="flex items-center gap-3 px-5 pt-[14px] pb-4 border-b border-[var(--sl-border)]">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={17} className="text-[var(--sl-t2)]" />
          </button>
          <div className="flex-1">
            <h1 className="font-[Syne] text-[17px] font-bold text-[var(--sl-t1)]">
              Check-in Semanal
            </h1>
            <p className="text-[11px] text-[var(--sl-t3)] mt-[1px]">
              Semana {getCurrentWeekNumber()} &middot; {getCurrentDateString()}
            </p>
          </div>
        </div>

        <div className="flex-1 px-5 pt-5 flex flex-col gap-4">
          {/* Mobile Mood Slider */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-4 relative overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-[2px] rounded-b-sm" style={{ background: MODULE_COLOR }} />
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-3 flex items-center gap-2">
              <Smile size={14} style={{ color: MODULE_COLOR }} />
              Como você está se sentindo?
            </p>
            <input
              type="range"
              min={1}
              max={10}
              value={mood}
              onChange={e => setMood(Number(e.target.value))}
              className="w-full h-[6px] rounded-full appearance-none cursor-pointer mb-2"
              style={{
                background: `linear-gradient(to right, rgba(244,63,94,0.25), rgba(245,158,11,0.25), rgba(16,185,129,0.25))`,
              }}
            />
            <div className="flex justify-between text-[10px] text-[var(--sl-t3)]">
              <span className="flex items-center gap-1"><Frown size={12} className="text-[#f43f5e]" />Ruim</span>
              <span className="font-[DM_Mono] font-medium" style={{ color: moodColor }}>{mood}/10</span>
              <span className="flex items-center gap-1"><Smile size={12} className="text-[#10b981]" />Ótimo</span>
            </div>
          </div>

          {/* Mobile Goal Updates */}
          {displayGoals.map(goal => (
            <div key={goal.id} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-4 relative overflow-hidden">
              <div className="absolute top-0 left-4 right-4 h-[2px] rounded-b-sm" style={{ background: MODULE_COLOR }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                  style={{ background: goal.iconBg, color: goal.iconColor }}>
                  {goal.icon}
                </div>
                <span className="text-[13px] font-semibold text-[var(--sl-t1)] flex-1">{goal.title}</span>
                <span className="text-[9px] font-semibold px-2 py-[2px] rounded-lg"
                  style={{ background: getStatusPillStyles(goal.status).bg, color: getStatusPillStyles(goal.status).color }}>
                  {goal.statusLabel}
                </span>
              </div>
              {goal.type === 'days' ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--sl-t3)] w-[80px] shrink-0">{goal.inputLabel}</span>
                  <div className="flex gap-[5px]">
                    {DAY_LABELS.map((d, i) => (
                      <button key={i} onClick={() => handleDayToggle(i)}
                        className={cn(
                          'w-[30px] h-[30px] rounded-lg text-[11px] font-bold transition-all',
                          dayToggles[i] && 'text-[var(--sl-bg)]',
                          i === todayIdx && !dayToggles[i] && 'border-2',
                          !dayToggles[i] && i !== todayIdx && 'bg-[var(--sl-s3)] text-[var(--sl-t3)]',
                        )}
                        style={{
                          ...(dayToggles[i] ? { background: '#10b981' } : {}),
                          ...(i === todayIdx && !dayToggles[i] ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}),
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--sl-t3)] w-[65px] shrink-0">{goal.inputLabel}</span>
                  <input
                    value={goalValues[goal.id] ?? ''}
                    onChange={e => handleGoalValueChange(goal.id, e.target.value)}
                    placeholder={goal.inputPlaceholder}
                    className="flex-1 px-3 py-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[9px]
                               text-[var(--sl-t1)] text-[13px] font-[DM_Mono] outline-none
                               transition-colors focus:border-[rgba(139,92,246,0.4)]"
                  />
                  {goal.inputSuffix && (
                    <span className="text-[11px] text-[var(--sl-t3)] shrink-0">{goal.inputSuffix}</span>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Mobile Notes */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-2">
              Notas da semana
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Alguma observação sobre esta semana?"
              rows={3}
              className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] p-3
                         text-[var(--sl-t1)] text-[13px] outline-none resize-vertical min-h-[80px]
                         placeholder:text-[var(--sl-t3)] transition-colors focus:border-[rgba(139,92,246,0.4)]"
            />
          </div>

          {/* Mobile Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-[14px] text-[14px] font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #0055ff)' }}
          >
            <Check size={16} />
            {saving ? 'Salvando...' : 'Salvar Check-in'}
          </button>
        </div>
      </div>

      {/* ══════════════ DESKTOP ══════════════ */}
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

        {/* ── Module Header ── */}
        <ModuleHeader
          icon={CheckCircle2}
          iconBg={MODULE_COLOR_DIM}
          iconColor={MODULE_COLOR}
          title="Check-in Semanal"
          subtitle={`${getCurrentDateString()} · Semana ${getCurrentWeekNumber()}`}
        >
          <button
            onClick={() => router.push('/futuro')}
            className="inline-flex items-center gap-[7px] px-[18px] py-[9px] rounded-[11px] text-[13px] font-semibold
                       border border-[var(--sl-border)] text-[var(--sl-t2)]
                       hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
          >
            <ArrowLeft size={15} />
            Voltar aos Objetivos
          </button>
        </ModuleHeader>

        {/* ── MOOD STRIP (full-width) ── */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 px-7 mb-7 relative overflow-hidden
                        sl-fade-up sl-delay-1 transition-colors hover:border-[var(--sl-border-h)]">
          {/* Accent bar */}
          <div className="absolute top-0 left-7 right-7 h-[2.5px] rounded-b-sm" style={{ background: MODULE_COLOR }} />

          <div className="flex items-center gap-3 mb-1">
            <Smile size={18} style={{ color: MODULE_COLOR }} />
            <span className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
              Como você está se sentindo?
            </span>
          </div>

          {/* Mood Track */}
          <div className="relative w-full h-[44px] rounded-[22px] overflow-hidden my-4">
            {/* Gradient background */}
            <div
              className="absolute inset-0 rounded-[22px]"
              style={{ background: 'linear-gradient(90deg, rgba(244,63,94,0.25), rgba(245,158,11,0.25), rgba(16,185,129,0.25))' }}
            />
            {/* Range input overlaid */}
            <input
              type="range"
              min={1}
              max={10}
              value={mood}
              onChange={e => setMood(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-[2]"
            />
            {/* Custom thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-[34px] h-[34px] rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.3)]
                         flex items-center justify-center pointer-events-none z-[1] transition-[left] duration-150"
              style={{ left: `calc(${moodPercentage}% - 17px)` }}
            >
              {mood <= 3
                ? <Frown size={18} style={{ color: '#f43f5e' }} />
                : mood <= 6
                  ? <Meh size={18} style={{ color: '#f59e0b' }} />
                  : <Smile size={18} style={{ color: '#10b981' }} />
              }
            </div>
          </div>

          {/* Mood labels */}
          <div className="flex justify-between text-[11px] text-[var(--sl-t3)]">
            <span className="flex items-center gap-1">
              <Frown size={14} className="text-[#f43f5e]" />
              Ruim
            </span>
            <span className="flex items-center gap-1">
              <Meh size={14} className="text-[#f59e0b]" />
              Neutro
            </span>
            <span className="flex items-center gap-1">
              <Smile size={14} className="text-[#10b981]" />
              Ótimo
            </span>
          </div>
        </div>

        {/* ── 2x2 GOAL UPDATE GRID ── */}
        <div className="grid grid-cols-2 gap-[14px] mb-7 sl-fade-up sl-delay-2">
          {displayGoals.map(goal => {
            const pillStyles = getStatusPillStyles(goal.status)
            return (
              <div key={goal.id}
                className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-5 relative overflow-hidden
                           transition-all hover:border-[var(--sl-border-h)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.15)]"
              >
                {/* Accent bar */}
                <div className="absolute top-0 left-5 right-5 h-[2px] rounded-b-sm" style={{ background: MODULE_COLOR }} />

                {/* Head: icon + name + pill */}
                <div className="flex items-center gap-[10px] mb-[14px]">
                  <div
                    className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                    style={{ background: goal.iconBg, color: goal.iconColor }}
                  >
                    {goal.icon}
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--sl-t1)] flex-1">{goal.title}</span>
                  <span
                    className="text-[9px] font-semibold px-[8px] py-[3px] rounded-lg shrink-0"
                    style={{ background: pillStyles.bg, color: pillStyles.color }}
                  >
                    {goal.statusLabel}
                  </span>
                </div>

                {/* Input row or day toggles */}
                {goal.type === 'days' ? (
                  <div className="flex items-center gap-[10px]">
                    <span className="text-[11px] text-[var(--sl-t3)] w-[80px] shrink-0">
                      {goal.inputLabel}
                    </span>
                    <div className="flex gap-[5px]">
                      {DAY_LABELS.map((d, i) => (
                        <button
                          key={i}
                          onClick={() => handleDayToggle(i)}
                          className={cn(
                            'w-[30px] h-[30px] rounded-lg text-[11px] font-bold transition-all cursor-pointer',
                            dayToggles[i] && 'text-[var(--sl-bg)]',
                            i === todayIdx && !dayToggles[i] && 'border-2',
                            !dayToggles[i] && i !== todayIdx && 'bg-[var(--sl-s3)] text-[var(--sl-t3)]',
                          )}
                          style={{
                            ...(dayToggles[i] ? { background: '#10b981' } : {}),
                            ...(i === todayIdx && !dayToggles[i] ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}),
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-[10px]">
                    <span className="text-[11px] text-[var(--sl-t3)] w-[65px] shrink-0">
                      {goal.inputLabel}
                    </span>
                    <input
                      value={goalValues[goal.id] ?? ''}
                      onChange={e => handleGoalValueChange(goal.id, e.target.value)}
                      placeholder={goal.inputPlaceholder}
                      className="flex-1 px-3 py-[9px] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[9px]
                                 text-[var(--sl-t1)] text-[13px] font-[DM_Mono] outline-none
                                 transition-colors focus:border-[rgba(139,92,246,0.4)]"
                    />
                    {goal.inputSuffix && (
                      <span className="text-[11px] text-[var(--sl-t3)] ml-[6px] shrink-0">{goal.inputSuffix}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── NOTES + HISTORY SPLIT ── */}
        <div className="grid grid-cols-2 gap-[14px] sl-fade-up sl-delay-3">

          {/* Left: Notes + Preview + Save */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 relative overflow-hidden
                          transition-colors hover:border-[var(--sl-border-h)]">
            {/* Accent bar */}
            <div className="absolute top-0 left-6 right-6 h-[2.5px] rounded-b-sm" style={{ background: MODULE_COLOR }} />

            <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] flex items-center gap-[9px] mb-4">
              <FileText size={16} style={{ color: MODULE_COLOR }} />
              Notas
            </h3>

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Alguma observação sobre esta semana?"
              className="w-full px-3 py-3 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px]
                         text-[var(--sl-t1)] text-[13px] outline-none resize-vertical min-h-[80px]
                         placeholder:text-[var(--sl-t3)] transition-colors focus:border-[rgba(139,92,246,0.4)]"
            />

            {/* Preview inline */}
            <div
              className="mt-4 p-[14px] rounded-[12px]"
              style={{
                background: 'rgba(139,92,246,0.04)',
                border: '1px solid rgba(139,92,246,0.15)',
              }}
            >
              <div className="text-[12px] font-semibold mb-2" style={{ color: MODULE_COLOR }}>
                Preview do Check-in
              </div>
              <div className="flex gap-4 text-[12px]">
                <div>
                  <span className="text-[var(--sl-t3)]">Humor: </span>
                  <span style={{ color: moodColor }}>{moodLabel}</span>
                </div>
                <div>
                  <span className="text-[var(--sl-t3)]">Objetivos atualizados: </span>
                  <span style={{ color: MODULE_COLOR }}>{updatedGoalsCount}</span>
                </div>
                <div>
                  <span className="text-[var(--sl-t3)]">Treinos: </span>
                  <span style={{ color: '#10b981' }}>{trainDaysCount}/4</span>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-4 py-3 rounded-[11px] text-[13px] font-semibold text-white
                         flex items-center justify-center gap-2 disabled:opacity-60
                         hover:brightness-110 hover:-translate-y-px transition-all
                         shadow-[0_6px_20px_rgba(139,92,246,0.15)]"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #0055ff)' }}
            >
              <Check size={16} />
              {saving ? 'Salvando...' : 'Salvar Check-in'}
            </button>
          </div>

          {/* Right: History */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 relative overflow-hidden
                          transition-colors hover:border-[var(--sl-border-h)]">
            {/* Accent bar gradient */}
            <div className="absolute top-0 left-6 right-6 h-[2.5px] rounded-b-sm"
              style={{ background: 'linear-gradient(90deg, #8b5cf6, #0055ff)' }} />

            <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] flex items-center gap-[9px] mb-4">
              <Clock size={16} style={{ color: MODULE_COLOR }} />
              Histórico de Check-ins
            </h3>

            <div className="flex flex-col gap-[6px]">
              {MOCK_HISTORY.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-[10px] bg-[var(--sl-s2)] rounded-[10px]
                             transition-colors hover:bg-[var(--sl-s3)] cursor-pointer"
                >
                  {/* Mood icon */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: item.moodBg }}
                  >
                    {item.moodLevel === 'good'
                      ? <Smile size={14} style={{ color: item.moodColor }} />
                      : item.moodLevel === 'neutral'
                        ? <Meh size={14} style={{ color: item.moodColor }} />
                        : <Frown size={14} style={{ color: item.moodColor }} />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="text-[12px] font-medium text-[var(--sl-t1)]">{item.date}</div>
                    <div className="text-[10px] text-[var(--sl-t3)] mt-[1px]">
                      {item.objectivesUpdated} objetivos atualizados
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={14} className="text-[var(--sl-t3)] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
