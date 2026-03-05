'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import {
  useHealthProfile, useWeightEntries, useSaveHealthProfile, useAddWeightEntry, useDeleteWeightEntry,
  calcBMR, calcTDEE, calcIMC, calcCaloriesTarget, IMC_LABEL,
  ACTIVITY_LEVEL_LABELS, WEIGHT_GOAL_LABELS,
  type ActivityLevelType, type WeightGoalType, type BiologicalSex,
} from '@/hooks/use-corpo'
import { WeightChart } from '@/components/corpo/WeightChart'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { uploadCorpoFile } from '@/lib/storage/corpo'

const ACTIVITY_LEVELS: ActivityLevelType[] = ['sedentary', 'light', 'moderate', 'very_active', 'extreme']
const WEIGHT_GOALS: WeightGoalType[] = ['lose', 'maintain', 'gain']

export default function PesoPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { profile, loading, reload: reloadProfile } = useHealthProfile()
  const { entries, reload: reloadEntries } = useWeightEntries(90)
  const saveProfile = useSaveHealthProfile()
  const addEntry = useAddWeightEntry()
  const deleteEntry = useDeleteWeightEntry()

  const [chartMonths, setChartMonths] = useState<3 | 6 | 12>(3)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Profile form
  const [profileForm, setProfileForm] = useState({
    height_cm: profile?.height_cm ? String(profile.height_cm) : '',
    biological_sex: (profile?.biological_sex ?? '') as BiologicalSex | '',
    birth_date: profile?.birth_date ?? '',
    activity_level: (profile?.activity_level ?? '') as ActivityLevelType | '',
    weight_goal_type: (profile?.weight_goal_type ?? '') as WeightGoalType | '',
    weight_goal_kg: profile?.weight_goal_kg ? String(profile.weight_goal_kg) : '',
    dietary_restrictions: (profile?.dietary_restrictions ?? []).join(', '),
  })

  // Weight entry form
  const [weightForm, setWeightForm] = useState({
    weight: '',
    recorded_at: new Date().toISOString().split('T')[0],
    waist_cm: '',
    hip_cm: '',
    notes: '',
  })
  const [progressPhotoFile, setProgressPhotoFile] = useState<File | null>(null)

  async function handleSaveProfile() {
    if (!profileForm.height_cm || !profileForm.biological_sex || !profileForm.birth_date) {
      toast.error('Preencha altura, sexo e data de nascimento')
      return
    }
    setIsSaving(true)
    try {
      const latestW = entries[0]?.weight ?? null
      const restrictions = profileForm.dietary_restrictions
        .split(',').map(s => s.trim()).filter(Boolean)

      await saveProfile({
        height_cm: parseFloat(profileForm.height_cm),
        biological_sex: profileForm.biological_sex as BiologicalSex,
        birth_date: profileForm.birth_date,
        activity_level: (profileForm.activity_level || null) as ActivityLevelType | null,
        weight_goal_type: (profileForm.weight_goal_type || null) as WeightGoalType | null,
        weight_goal_kg: profileForm.weight_goal_kg ? parseFloat(profileForm.weight_goal_kg) : null,
        current_weight: latestW,
        dietary_restrictions: restrictions,
      }, profile?.id)
      toast.success('Perfil atualizado!')
      setShowProfileModal(false)
      await reloadProfile()
    } catch {
      toast.error('Erro ao salvar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAddWeight() {
    if (!weightForm.weight) { toast.error('Informe o peso'); return }
    setIsSaving(true)
    try {
      await addEntry({
        weight: parseFloat(weightForm.weight),
        recorded_at: weightForm.recorded_at,
        waist_cm: weightForm.waist_cm ? parseFloat(weightForm.waist_cm) : null,
        hip_cm: weightForm.hip_cm ? parseFloat(weightForm.hip_cm) : null,
        body_fat_pct: null, arm_cm: null, thigh_cm: null, chest_cm: null,
        notes: weightForm.notes || null,
        progress_photo_url: progressPhotoFile ? await uploadCorpoFile(progressPhotoFile, 'weight-progress') : null,
      })

      // Update profile current_weight + BMR/TDEE
      if (profile?.height_cm && profile.biological_sex && profile.birth_date) {
        const w = parseFloat(weightForm.weight)
        const bmr = calcBMR(w, profile.height_cm, profile.biological_sex, profile.birth_date)
        const tdee = profile.activity_level ? calcTDEE(bmr, profile.activity_level) : null
        await saveProfile({ current_weight: w, bmr, ...(tdee ? { tdee } : {}) }, profile.id)
      }

      toast.success('Peso registrado!')
      setShowWeightModal(false)
      setWeightForm({ weight: '', recorded_at: new Date().toISOString().split('T')[0], waist_cm: '', hip_cm: '', notes: '' })
      setProgressPhotoFile(null)
      await Promise.all([reloadEntries(), reloadProfile()])
    } catch {
      toast.error('Erro ao registrar peso')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteEntry(id: string) {
    try {
      await deleteEntry(id)
      toast.success('Registro removido')
      await reloadEntries()
    } catch {
      toast.error('Erro ao remover')
    }
  }

  const latestEntry = entries[0]
  const imc = latestEntry && profile?.height_cm
    ? calcIMC(latestEntry.weight, profile.height_cm)
    : null
  const imcInfo = imc ? IMC_LABEL(imc) : null

  const caloriesTarget = profile?.tdee && profile.weight_goal_type
    ? calcCaloriesTarget(profile.tdee, profile.weight_goal_type)
    : null

  // RN-CRP-14 + RN-CRP-15: velocidade e previsão baseadas nos últimos 30 dias
  const last30Entries = entries.filter(e => {
    const d = new Date(e.recorded_at)
    const now = new Date()
    return (now.getTime() - d.getTime()) <= 30 * 24 * 60 * 60 * 1000
  })

  let weeklyVelocity: number | null = null
  let predictedDate: Date | null = null

  if (last30Entries.length >= 2) {
    const oldest = last30Entries[last30Entries.length - 1]
    const newest = last30Entries[0]
    const days = Math.max(1, (new Date(newest.recorded_at).getTime() - new Date(oldest.recorded_at).getTime()) / (1000 * 60 * 60 * 24))
    const totalChange = newest.weight - oldest.weight
    const changePerDay = totalChange / days
    weeklyVelocity = changePerDay * 7

    if (profile?.weight_goal_kg && latestEntry && Math.abs(changePerDay) > 0.001) {
      const diff = profile.weight_goal_kg - latestEntry.weight
      const daysNeeded = diff / changePerDay
      if (daysNeeded > 0 && daysNeeded < 3650) {
        predictedDate = new Date()
        predictedDate.setDate(predictedDate.getDate() + Math.round(daysNeeded))
      }
    }
  }

  const speedUnsafe = weeklyVelocity !== null && Math.abs(weeklyVelocity) > 1

  // Open profile modal and pre-fill
  function openProfileModal() {
    setProfileForm({
      height_cm: profile?.height_cm ? String(profile.height_cm) : '',
      biological_sex: (profile?.biological_sex ?? '') as BiologicalSex | '',
      birth_date: profile?.birth_date ?? '',
      activity_level: (profile?.activity_level ?? '') as ActivityLevelType | '',
      weight_goal_type: (profile?.weight_goal_type ?? '') as WeightGoalType | '',
      weight_goal_kg: profile?.weight_goal_kg ? String(profile.weight_goal_kg) : '',
      dietary_restrictions: (profile?.dietary_restrictions ?? []).join(', '),
    })
    setShowProfileModal(true)
  }

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
          ⚖️ Peso & Medidas
        </h1>
        <button
          onClick={openProfileModal}
          className="px-3 py-1.5 rounded-[10px] text-[12px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-colors"
        >
          ⚙️ Perfil
        </button>
        <button
          onClick={() => setShowWeightModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#f97316] text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Registrar
        </button>
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
      ) : (
        <div className="grid grid-cols-[1fr_300px] gap-5 max-lg:grid-cols-1">

          {/* Chart */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">📈 Evolução de Peso</h2>
              <div className="flex gap-1">
                {([3, 6, 12] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setChartMonths(m)}
                    className={cn(
                      'px-2.5 py-1 rounded-[7px] text-[11px] font-medium border transition-all',
                      chartMonths === m
                        ? 'border-[#f97316] bg-[#f97316]/10 text-[var(--sl-t1)]'
                        : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
            <WeightChart entries={entries} goalWeight={profile?.weight_goal_kg} months={chartMonths} />
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-3">
            {/* Current stats */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
              <h3 className="font-[Syne] font-bold text-[12px] text-[var(--sl-t1)] mb-3">📊 Estatísticas</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Peso', value: latestEntry ? `${latestEntry.weight} kg` : '—' },
                  {
                    label: 'IMC',
                    value: imc ? imc.toFixed(1) : '—',
                    sub: imcInfo?.label,
                    color: imcInfo?.color,
                  },
                  { label: 'Altura', value: profile?.height_cm ? `${profile.height_cm} cm` : '—' },
                  { label: 'TMB', value: profile?.bmr ? `${Math.round(profile.bmr)} kcal` : '—' },
                  { label: 'TDEE', value: profile?.tdee ? `${Math.round(profile.tdee)} kcal` : '—' },
                  {
                    label: 'Meta calórica',
                    value: caloriesTarget ? `${Math.round(caloriesTarget)} kcal` : '—',
                    sub: profile?.weight_goal_type ? WEIGHT_GOAL_LABELS[profile.weight_goal_type] : undefined,
                  },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--sl-t3)]">{stat.label}</span>
                    <div className="text-right">
                      <span
                        className="font-[DM_Mono] text-[13px] font-medium"
                        style={{ color: (stat as any).color ?? 'var(--sl-t1)' }}
                      >
                        {stat.value}
                      </span>
                      {(stat as any).sub && (
                        <p className="text-[10px]" style={{ color: (stat as any).color ?? 'var(--sl-t3)' }}>
                          {(stat as any).sub}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goal */}
            {profile?.weight_goal_kg && latestEntry && (
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
                <h3 className="font-[Syne] font-bold text-[12px] text-[var(--sl-t1)] mb-2">🎯 Meta de Peso</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-[DM_Mono] text-[13px] text-[var(--sl-t1)]">{latestEntry.weight} kg</span>
                  <span className="text-[11px] text-[var(--sl-t3)]">→</span>
                  <span className="font-[DM_Mono] text-[13px] text-[#10b981]">{profile.weight_goal_kg} kg</span>
                </div>
                {(() => {
                  const diff = Math.abs(latestEntry.weight - profile.weight_goal_kg)
                  const direction = latestEntry.weight > profile.weight_goal_kg ? 'Perder' : 'Ganhar'
                  return (
                    <p className="text-[11px] text-[var(--sl-t3)]">
                      {direction} <strong className="text-[var(--sl-t1)]">{diff.toFixed(1)} kg</strong> para atingir a meta.
                    </p>
                  )
                })()}
                {/* RN-CRP-14: Previsão de data */}
                {predictedDate && (
                  <p className="text-[11px] text-[var(--sl-t2)] mt-1.5">
                    📅 Previsão: <strong className="text-[var(--sl-t1)]">
                      {predictedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </strong>
                    {weeklyVelocity !== null && (
                      <span className="text-[var(--sl-t3)]"> ({Math.abs(weeklyVelocity).toFixed(1)} kg/sem)</span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* RN-CRP-15: Alerta velocidade insegura */}
            {speedUnsafe && (
              <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/30 rounded-xl p-3">
                <p className="text-[11px] text-[var(--sl-t2)] leading-relaxed">
                  ⚠️ Velocidade de {weeklyVelocity! > 0 ? 'ganho' : 'perda'} de peso acima de 1 kg/semana
                  (<strong className="text-[#f43f5e]">{Math.abs(weeklyVelocity!).toFixed(1)} kg/sem</strong>).
                  A faixa saudável é de 0,5 a 1 kg/semana. Considere consultar um profissional.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RN-CRP-16: Gráfico de evolução de medidas (cintura/quadril) */}
      {entries.some(e => e.waist_cm || e.hip_cm) && (
        <div className="mt-5 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
          <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)] mb-4">📏 Evolução de Medidas</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={[...entries].reverse().slice(-30).map(e => ({
                date: new Date(e.recorded_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                cintura: e.waist_cm ?? undefined,
                quadril: e.hip_cm ?? undefined,
              }))}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--sl-t3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--sl-t3)' }} axisLine={false} tickLine={false} unit="cm" />
              <Tooltip
                contentStyle={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)', borderRadius: 10, fontSize: 11 }}
                labelStyle={{ color: 'var(--sl-t2)' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--sl-t3)' }} />
              <Line type="monotone" dataKey="cintura" name="Cintura (cm)" stroke="#f59e0b" dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="quadril" name="Quadril (cm)" stroke="#a855f7" dot={false} strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      {entries.length > 0 && (
        <div className="mt-5">
          <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)] mb-3">📜 Histórico</h2>
          <div className="flex flex-col gap-2">
            {entries.slice(0, 15).map(entry => (
              <div key={entry.id} className="flex items-center gap-3 p-3 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-xl hover:border-[var(--sl-border-h)] transition-colors">
                <p className="text-[12px] text-[var(--sl-t3)] w-24 shrink-0">
                  {new Date(entry.recorded_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                </p>
                <p className="font-[DM_Mono] font-medium text-[14px] text-[var(--sl-t1)]">{entry.weight} kg</p>
                {entry.waist_cm && <p className="text-[11px] text-[var(--sl-t3)]">Cintura: {entry.waist_cm}cm</p>}
                {entry.notes && <p className="flex-1 text-[11px] text-[var(--sl-t3)] truncate italic">{entry.notes}</p>}
                {entry.progress_photo_url && (
                  <a href={entry.progress_photo_url} target="_blank" rel="noreferrer" className="text-[11px] text-[#f97316] hover:opacity-80">
                    📷 Foto
                  </a>
                )}
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="ml-auto p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.1)] transition-colors"
                >
                  <Trash2 size={12} className="text-[var(--sl-t3)]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weight Entry Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowWeightModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[420px]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">⚖️ Registrar Peso</h2>
              <button onClick={() => setShowWeightModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Peso (kg)</label>
                  <input type="number" step="0.1" value={weightForm.weight}
                    onChange={e => setWeightForm(f => ({ ...f, weight: e.target.value }))}
                    placeholder="Ex: 75.5" autoFocus
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f97316]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Data</label>
                  <input type="date" value={weightForm.recorded_at}
                    onChange={e => setWeightForm(f => ({ ...f, recorded_at: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Cintura (cm)</label>
                  <input type="number" step="0.5" value={weightForm.waist_cm}
                    onChange={e => setWeightForm(f => ({ ...f, waist_cm: e.target.value }))}
                    placeholder="Opcional"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f97316]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Quadril (cm)</label>
                  <input type="number" step="0.5" value={weightForm.hip_cm}
                    onChange={e => setWeightForm(f => ({ ...f, hip_cm: e.target.value }))}
                    placeholder="Opcional"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Notas</label>
                <input type="text" value={weightForm.notes}
                  onChange={e => setWeightForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Opcional..."
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f97316]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Foto de progresso (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setProgressPhotoFile(e.target.files?.[0] ?? null)}
                  className="w-full text-[12px] text-[var(--sl-t2)]"
                />
                {progressPhotoFile && (
                  <p className="text-[10px] text-[var(--sl-t3)] mt-1">{progressPhotoFile.name}</p>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowWeightModal(false)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]">
                  Cancelar
                </button>
                <button onClick={handleAddWeight} disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f97316] text-white hover:opacity-90 disabled:opacity-50">
                  {isSaving ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowProfileModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">⚙️ Perfil de Saúde</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Altura (cm)</label>
                  <input type="number" value={profileForm.height_cm}
                    onChange={e => setProfileForm(f => ({ ...f, height_cm: e.target.value }))}
                    placeholder="Ex: 175"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f97316]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Nascimento</label>
                  <input type="date" value={profileForm.birth_date}
                    onChange={e => setProfileForm(f => ({ ...f, birth_date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Sexo Biológico</label>
                <div className="flex gap-2">
                  {(['male', 'female'] as const).map(s => (
                    <button key={s} onClick={() => setProfileForm(f => ({ ...f, biological_sex: s }))}
                      className={cn(
                        'flex-1 py-2 rounded-[10px] text-[12px] border transition-all',
                        profileForm.biological_sex === s
                          ? 'border-[#f97316] bg-[#f97316]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      {s === 'male' ? '♂️ Masculino' : '♀️ Feminino'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Nível de Atividade</label>
                <div className="flex flex-col gap-1">
                  {ACTIVITY_LEVELS.map(l => (
                    <button key={l} onClick={() => setProfileForm(f => ({ ...f, activity_level: l }))}
                      className={cn(
                        'px-3 py-2 rounded-[10px] text-[12px] border transition-all text-left',
                        profileForm.activity_level === l
                          ? 'border-[#f97316] bg-[#f97316]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      {ACTIVITY_LEVEL_LABELS[l]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Objetivo</label>
                <div className="flex gap-2">
                  {WEIGHT_GOALS.map(g => (
                    <button key={g} onClick={() => setProfileForm(f => ({ ...f, weight_goal_type: g }))}
                      className={cn(
                        'flex-1 py-2 rounded-[10px] text-[11px] border transition-all',
                        profileForm.weight_goal_type === g
                          ? 'border-[#f97316] bg-[#f97316]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      {WEIGHT_GOAL_LABELS[g]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Peso Alvo (kg)</label>
                  <input type="number" step="0.5" value={profileForm.weight_goal_kg}
                    onChange={e => setProfileForm(f => ({ ...f, weight_goal_kg: e.target.value }))}
                    placeholder="Opcional"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f97316]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Restrições Alimentares</label>
                  <input type="text" value={profileForm.dietary_restrictions}
                    onChange={e => setProfileForm(f => ({ ...f, dietary_restrictions: e.target.value }))}
                    placeholder="Ex: Lactose, Glúten"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f97316]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]">
                  Cancelar
                </button>
                <button onClick={handleSaveProfile} disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f97316] text-white hover:opacity-90 disabled:opacity-50">
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
