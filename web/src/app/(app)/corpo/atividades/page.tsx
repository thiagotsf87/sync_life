'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, BarChart3 } from 'lucide-react'
import { MobileFormHeader } from '@/components/ui/mobile-form-header'
import { ModuleHeader } from '@/components/ui/module-header'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useActivities, useHealthProfile, useSaveActivity, useDeleteActivity,
  ACTIVITY_TYPES, calcCaloriesBurned,
} from '@/hooks/use-corpo'
import { ActivityCard } from '@/components/corpo/ActivityCard'
import { createEventFromAtividade } from '@/lib/integrations/agenda'

interface ActivityForm {
  type: string
  duration_minutes: number
  intensity: number
  recorded_at: string
  distance: string
  steps: string
  notes: string
  syncToAgenda: boolean
}

const EMPTY_FORM: ActivityForm = {
  type: 'walking',
  duration_minutes: 30,
  intensity: 3,
  recorded_at: new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().slice(0, 5),
  distance: '',
  steps: '',
  notes: '',
  syncToAgenda: false,
}

function calcActivityStreakDays(recordedAtList: string[]): number {
  const daySet = new Set(
    recordedAtList.map((d) => new Date(d).toISOString().slice(0, 10))
  )
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (!daySet.has(key)) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export default function AtividadesPage() {
  const router = useRouter()

  const { activities, loading, error, reload } = useActivities(50)
  const { profile } = useHealthProfile()
  const saveActivity = useSaveActivity()
  const deleteActivity = useDeleteActivity()

  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<ActivityForm>(EMPTY_FORM)

  async function handleSave() {
    setIsSaving(true)
    try {
      const meta = ACTIVITY_TYPES.find(a => a.type === form.type)
      const met = meta?.met ?? 4
      const weight = profile?.current_weight ?? 70
      const calories = calcCaloriesBurned(met, weight, form.duration_minutes)

      const data = {
        type: form.type,
        duration_minutes: form.duration_minutes,
        intensity: form.intensity,
        recorded_at: form.recorded_at,
        distance_km: form.distance ? parseFloat(form.distance) : null,
        steps: form.steps ? parseInt(form.steps) : null,
        calories_burned: Math.round(calories * 10) / 10,
        met_value: met,
        notes: form.notes || null,
      }
      await saveActivity(data)

      // RN-CRP-35: streak de atividade gera conquistas
      const projectedStreak = calcActivityStreakDays([
        ...activities.map(a => a.recorded_at),
        data.recorded_at,
      ])
      const currentStreakVal = calcActivityStreakDays(activities.map(a => a.recorded_at))
      const milestones = [3, 7, 14, 30]
      const reachedMilestone = milestones.find(m => projectedStreak >= m && currentStreakVal < m)
      if (reachedMilestone) {
        toast.success(`Conquista desbloqueada: ${reachedMilestone} dias seguidos de atividade!`)
      }

      // RN-CRP-33: registrar na Agenda se opt-in
      if (form.syncToAgenda) {
        const actMeta = ACTIVITY_TYPES.find(a => a.type === form.type)
        await createEventFromAtividade({
          activityLabel: actMeta?.label ?? form.type,
          durationMinutes: form.duration_minutes,
          recordedAt: form.recorded_at,
        }).catch(() => {})
      }
      toast.success('Atividade registrada!')
      setShowModal(false)
      setForm({ ...EMPTY_FORM, distance: '', steps: '', notes: '', syncToAgenda: false })
      await reload()
    } catch {
      toast.error('Erro ao registrar atividade')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteActivity(id)
      toast.success('Atividade removida')
      await reload()
    } catch {
      toast.error('Erro ao remover')
    }
  }

  // Weekly stats
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekActivities = activities.filter(a => new Date(a.recorded_at) >= weekAgo)
  const weekMinutes = weekActivities.reduce((s, a) => s + a.duration_minutes, 0)
  const weekCalories = weekActivities.reduce((s, a) => s + (a.calories_burned ?? 0), 0)
  const currentStreak = calcActivityStreakDays(activities.map(a => a.recorded_at))
  const avgMinutes = weekActivities.length > 0 ? Math.round(weekMinutes / weekActivities.length) : 0
  const avgCalories = weekActivities.length > 0 ? Math.round(weekCalories / weekActivities.length) : 0

  // Preview calories
  const selectedMeta = ACTIVITY_TYPES.find(a => a.type === form.type)
  const previewCalories = selectedMeta
    ? calcCaloriesBurned(selectedMeta.met, profile?.current_weight ?? 70, form.duration_minutes)
    : 0

  // Activity type breakdown
  const typeBreakdown = weekActivities.reduce<Record<string, number>>((acc, a) => {
    const meta = ACTIVITY_TYPES.find(t => t.type === a.type)
    const label = meta?.label ?? a.type
    acc[label] = (acc[label] ?? 0) + a.duration_minutes
    return acc
  }, {})

  const typeColors = ['#f97316', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6']

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden max-w-[1160px] mx-auto px-4">
        <MobileFormHeader
          moduleId="corpo"
          title="Atividades Fisicas"
          onBack={() => router.push('/corpo')}
          rightAction={
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              Registrar
            </button>
          }
        />

        {/* Mobile week stats */}
        <div className="grid grid-cols-3 gap-3 mb-5 max-sm:grid-cols-1">
          {[
            { label: 'Atividades esta semana', value: String(weekActivities.length), color: '#10b981' },
            { label: 'Minutos ativos', value: `${weekMinutes}min`, color: '#f97316' },
            { label: 'Calorias queimadas', value: `${Math.round(weekCalories)} kcal`, color: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 overflow-hidden">
              <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: stat.color }} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">{stat.label}</p>
              <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)]">{stat.value}</p>
            </div>
          ))}
        </div>

        {currentStreak > 0 && (
          <div className="mb-5 bg-gradient-to-br from-[#f97316]/10 to-[#f59e0b]/10 border border-[#f97316]/30 rounded-[18px] p-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Conquista de consistencia</p>
            <p className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)]">{currentStreak} dias seguidos</p>
            <p className="text-[12px] text-[var(--sl-t2)] mt-1">Continue para desbloquear marcos de 7, 14 e 30 dias.</p>
          </div>
        )}

        {/* Mobile activities list */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-[var(--sl-s2)] animate-pulse" />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-12 text-center">
            <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Nenhuma atividade registrada</h3>
            <p className="text-[13px] text-[var(--sl-t2)] mb-5">Registre seus treinos e acompanhe seu progresso.</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90"
            >
              <Plus size={15} />
              Primeira atividade
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activities.map(a => <ActivityCard key={a.id} activity={a} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

        {/* 1. ModuleHeader */}
        <ModuleHeader
          icon={BarChart3}
          iconBg="rgba(249,115,22,.08)"
          iconColor="#f97316"
          title="Atividades Fisicas"
          subtitle="Registre e acompanhe seus treinos"
        >
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                       bg-[#f97316] text-white hover:brightness-110 hover:-translate-y-px
                       transition-all shadow-[0_6px_20px_rgba(249,115,22,.15)]"
          >
            <Plus size={16} />
            Registrar Atividade
          </button>
        </ModuleHeader>

        {/* 2. Streak Strip */}
        {currentStreak > 0 && (
          <div className="flex items-center gap-5 px-6 py-[18px] bg-gradient-to-br from-[rgba(249,115,22,.1)] to-[rgba(245,158,11,.06)] border border-[rgba(249,115,22,.2)] rounded-[18px] mb-7 sl-fade-up sl-delay-1">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" className="shrink-0">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <div>
              <div className="font-[Syne] text-[36px] font-extrabold leading-none text-[var(--sl-t1)]">{currentStreak}</div>
              <div className="text-[12px] text-[var(--sl-t2)]">dias consecutivos de atividade</div>
            </div>
            <div className="flex gap-[6px] ml-auto">
              {[3, 7, 14, 30].map(m => (
                <div
                  key={m}
                  className={cn(
                    'w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[11px] font-bold border',
                    currentStreak >= m
                      ? 'border-[#f97316] bg-[rgba(249,115,22,.08)] text-[#f97316]'
                      : currentStreak >= m - 2
                        ? 'border-[#f97316] text-[var(--sl-t3)] shadow-[0_0_10px_rgba(249,115,22,.3)]'
                        : 'border-[var(--sl-border)] text-[var(--sl-t3)]'
                  )}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Main Layout: Feed LEFT + Summary sidebar RIGHT */}
        {loading ? (
          <div className="grid grid-cols-[1fr_300px] gap-[14px] max-lg:grid-cols-1">
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />)}
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-64 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
            <p className="text-[13px] text-[var(--sl-t2)]">
              {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-12 text-center sl-fade-up sl-delay-2">
            <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Nenhuma atividade registrada</h3>
            <p className="text-[13px] text-[var(--sl-t2)] mb-5">Registre seus treinos e acompanhe seu progresso.</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#f97316] text-white hover:opacity-90"
            >
              <Plus size={15} />
              Primeira atividade
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_300px] gap-[14px] max-lg:grid-cols-1 sl-fade-up sl-delay-2">

            {/* Activity Feed */}
            <div className="flex flex-col gap-3">
              {activities.map(a => {
                const meta = ACTIVITY_TYPES.find(t => t.type === a.type)
                return (
                  <div
                    key={a.id}
                    className="flex items-stretch gap-4 px-[22px] py-[18px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px]
                               hover:border-[var(--sl-border-h)] hover:shadow-[0_4px_20px_rgba(0,0,0,.2)] transition-all"
                  >
                    <div
                      className="w-[44px] h-[44px] rounded-xl flex items-center justify-center shrink-0 text-xl"
                      style={{ background: 'rgba(249,115,22,.08)' }}
                    >
                      {meta?.icon ?? ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-semibold text-[var(--sl-t1)] mb-[2px]">
                        {meta?.label ?? a.type}
                      </h4>
                      <div className="text-[11px] text-[var(--sl-t3)]">
                        {new Date(a.recorded_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        {a.notes ? ` \u00B7 ${a.notes}` : ''}
                      </div>
                    </div>
                    <div className="flex gap-5 items-center">
                      <div className="text-center">
                        <span className="font-[DM_Mono] text-[15px] font-medium text-[var(--sl-t1)] block">{a.duration_minutes}</span>
                        <span className="text-[9px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)]">min</span>
                      </div>
                      <div className="text-center">
                        <span className="font-[DM_Mono] text-[15px] font-medium text-[var(--sl-t1)] block">{a.distance_km ?? '--'}</span>
                        <span className="text-[9px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)]">km</span>
                      </div>
                      <div className="text-center">
                        <span className="font-[DM_Mono] text-[15px] font-medium text-[var(--sl-t1)] block">{a.calories_burned ? Math.round(a.calories_burned) : '--'}</span>
                        <span className="text-[9px] font-bold uppercase tracking-[.06em] text-[var(--sl-t3)]">kcal</span>
                      </div>
                      <div className="flex gap-[3px] items-center">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className="w-[5px] h-[14px] rounded-[3px]"
                            style={{
                              background: i <= (a.intensity ?? 0) ? '#f97316' : 'var(--sl-s3)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Sidebar Summary */}
            <div className="flex flex-col gap-[14px]">

              {/* Weekly Summary */}
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[22px] hover:border-[var(--sl-border-h)] transition-colors">
                <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t3)] uppercase tracking-[.06em] mb-4">
                  Resumo Semanal
                </h3>
                <div className="flex flex-col">
                  {[
                    { label: 'Atividades', value: String(weekActivities.length) },
                    { label: 'Meta semanal', value: `${profile?.weekly_activity_goal ?? 4}/semana`, color: 'var(--sl-t3)' },
                    { label: 'Minutos ativos', value: String(weekMinutes) },
                    { label: 'Media/treino', value: `${avgMinutes} min` },
                    { label: 'Calorias', value: String(Math.round(weekCalories)) },
                    { label: 'Media/treino', value: `${avgCalories} kcal` },
                    { label: 'Streak', value: `${currentStreak} dias`, color: '#f97316' },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-[rgba(120,165,220,.04)] last:border-b-0">
                      <span className="text-[12px] text-[var(--sl-t3)]">{row.label}</span>
                      <span className="font-[DM_Mono] text-[13px] font-medium" style={{ color: row.color ?? 'var(--sl-t1)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Type */}
              {Object.keys(typeBreakdown).length > 0 && (
                <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[22px] hover:border-[var(--sl-border-h)] transition-colors">
                  <h3 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t3)] uppercase tracking-[.06em] mb-4">
                    Por Tipo
                  </h3>
                  <div className="flex flex-col">
                    {Object.entries(typeBreakdown).map(([label, minutes], i) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-[rgba(120,165,220,.04)] last:border-b-0">
                        <span className="flex items-center gap-[6px] text-[12px] text-[var(--sl-t3)]">
                          <span className="w-2 h-2 rounded-sm" style={{ background: typeColors[i % typeColors.length] }} />
                          {label}
                        </span>
                        <span className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t1)]">{minutes} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[18px] text-[var(--sl-t1)] flex items-center gap-[10px]">
                <BarChart3 size={20} className="text-[#f97316]" />
                Registrar Atividade
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 flex flex-col gap-4">

              {/* Activity type */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Atividade</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {ACTIVITY_TYPES.map(at => (
                    <button key={at.type} onClick={() => setForm(f => ({ ...f, type: at.type }))}
                      className={cn(
                        'flex flex-col items-center gap-0.5 py-2 rounded-[10px] border transition-all',
                        form.type === at.type
                          ? 'border-[#10b981] bg-[#10b981]/10'
                          : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      <span className="text-lg">{at.icon}</span>
                      <span className="text-[9px] text-[var(--sl-t3)]">{at.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration + DateTime */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Duracao (min)</label>
                  <input type="number" value={form.duration_minutes}
                    onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 0 }))}
                    min="1"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Data/Hora</label>
                  <input type="datetime-local" value={form.recorded_at}
                    onChange={e => setForm(f => ({ ...f, recorded_at: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Intensity */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">
                  Intensidade — {['', 'Muito leve', 'Leve', 'Moderada', 'Intensa', 'Maxima'][form.intensity]}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} onClick={() => setForm(f => ({ ...f, intensity: i }))}
                      className="flex-1 py-2 rounded-[10px] text-[11px] font-bold border transition-all"
                      style={{
                        borderColor: i <= form.intensity ? '#f97316' : 'var(--sl-border)',
                        background: i <= form.intensity ? '#f97316' + '20' : 'transparent',
                        color: i <= form.intensity ? '#f97316' : 'var(--sl-t3)',
                      }}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Distancia (km)</label>
                  <input type="number" step="0.1" value={form.distance}
                    onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
                    placeholder="Opcional"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Passos</label>
                  <input type="number" value={form.steps}
                    onChange={e => setForm(f => ({ ...f, steps: e.target.value }))}
                    placeholder="Opcional"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Preview calories */}
              {previewCalories > 0 && (
                <div className="flex items-center gap-2 p-3 bg-[#f97316]/10 border border-[#f97316]/30 rounded-xl">
                  <p className="text-[12px] text-[var(--sl-t2)]">
                    Estimativa: <strong className="text-[var(--sl-t1)]">{Math.round(previewCalories)} kcal</strong> queimadas
                    {!profile?.current_weight && <span className="text-[var(--sl-t3)]"> (usando 70kg de referencia)</span>}
                  </p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Notas</label>
                <input type="text" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Opcional..."
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#10b981]"
                />
              </div>

              {/* RN-CRP-33: Sync to Agenda */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.syncToAgenda}
                  onChange={e => setForm(f => ({ ...f, syncToAgenda: e.target.checked }))}
                  className="accent-[#10b981] w-3.5 h-3.5"
                />
                <span className="text-[12px] text-[var(--sl-t2)]">Adicionar a Agenda</span>
              </label>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90 disabled:opacity-50">
                  {isSaving ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
