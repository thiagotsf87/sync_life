'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
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
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

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
      const currentStreak = calcActivityStreakDays(activities.map(a => a.recorded_at))
      const milestones = [3, 7, 14, 30]
      const reachedMilestone = milestones.find(m => projectedStreak >= m && currentStreak < m)
      if (reachedMilestone) {
        toast.success(`🏆 Conquista desbloqueada: ${reachedMilestone} dias seguidos de atividade!`)
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

  // Preview calories
  const selectedMeta = ACTIVITY_TYPES.find(a => a.type === form.type)
  const previewCalories = selectedMeta
    ? calcCaloriesBurned(selectedMeta.met, profile?.current_weight ?? 70, form.duration_minutes)
    : 0

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => router.push('/corpo')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Corpo
        </button>
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl flex-1',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          🏋️ Atividades Físicas
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#10b981] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Registrar
        </button>
      </div>

      {/* Week stats */}
      <div className="grid grid-cols-3 gap-3 mb-5 max-sm:grid-cols-1">
        {[
          { label: 'Atividades esta semana', value: String(weekActivities.length), color: '#10b981' },
          { label: 'Minutos ativos', value: `${weekMinutes}min`, color: '#f97316' },
          { label: 'Calorias queimadas', value: `${Math.round(weekCalories)} kcal`, color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: stat.color }} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">{stat.label}</p>
            <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {currentStreak > 0 && (
        <div className="mb-5 bg-gradient-to-br from-[#f97316]/10 to-[#f59e0b]/10 border border-[#f97316]/30 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Conquista de consistência</p>
          <p className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)]">🔥 {currentStreak} dias seguidos</p>
          <p className="text-[12px] text-[var(--sl-t2)] mt-1">Continue para desbloquear marcos de 7, 14 e 30 dias.</p>
        </div>
      )}

      {/* Activities list */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🏋️</div>
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
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          {activities.map(a => <ActivityCard key={a.id} activity={a} onDelete={handleDelete} />)}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">🏋️ Registrar Atividade</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">

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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Duração (min)</label>
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
                  Intensidade — {['', 'Muito leve', 'Leve', 'Moderada', 'Intensa', 'Máxima'][form.intensity]}
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Distância (km)</label>
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
                  <span>🔥</span>
                  <p className="text-[12px] text-[var(--sl-t2)]">
                    Estimativa: <strong className="text-[var(--sl-t1)]">{Math.round(previewCalories)} kcal</strong> queimadas
                    {!profile?.current_weight && <span className="text-[var(--sl-t3)]"> (usando 70kg de referência)</span>}
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
                <span className="text-[12px] text-[var(--sl-t2)]">Adicionar à Agenda</span>
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
    </div>
  )
}
