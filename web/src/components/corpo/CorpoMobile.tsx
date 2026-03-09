'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  useCorpoDashboard, useWeightEntries, useActivities, useAppointments,
  useMeals, useWaterIntake,
  useAddWeightEntry, useSaveActivity, useSaveAppointment, useSaveMeal,
  useUpdateWater, useSaveHealthProfile,
  type MealSlot,
} from '@/hooks/use-corpo'
import { toast } from 'sonner'
import { jornadaLabel } from '@/lib/jornada-labels'

import { Plus } from 'lucide-react'
import { CorpoTabDashboard } from './mobile/CorpoTabDashboard'
import { CorpoTabAtividades } from './mobile/CorpoTabAtividades'
import { CorpoTabPeso } from './mobile/CorpoTabPeso'
import { CorpoTabCardapio } from './mobile/CorpoTabCardapio'
import { CorpoTabSaude } from './mobile/CorpoTabSaude'
import { CorpoTabCoach } from './mobile/CorpoTabCoach'
import { CorpoActivityModal } from './mobile/CorpoActivityModal'
import { CorpoWeightModal } from './mobile/CorpoWeightModal'
import { CorpoAppointmentModal } from './mobile/CorpoAppointmentModal'
import { CorpoMealModal } from './mobile/CorpoMealModal'
import { CorpoProfileModal } from './mobile/CorpoProfileModal'
import {
  MOCK_PROFILE, MOCK_WEIGHT_ENTRIES, MOCK_ACTIVITIES,
  MOCK_APPOINTMENTS, MOCK_MEALS, MOCK_WATER,
} from '@/lib/corpo-mock-data'

type TabId = 'dashboard' | 'atividades' | 'peso' | 'cardapio' | 'saude' | 'coach'
type ModalId = 'activity' | 'weight' | 'appointment' | 'meal' | 'profile' | null

const CORPO_COLOR = '#f97316'

const TABS: { id: TabId; label: string; key: string }[] = [
  { id: 'dashboard', label: 'Dashboard', key: 'dashboard' },
  { id: 'atividades', label: 'Atividades', key: 'atividades' },
  { id: 'peso', label: 'Peso', key: 'peso' },
  { id: 'cardapio', label: 'Cardápio', key: 'cardapio' },
  { id: 'saude', label: 'Saúde', key: 'consultas' },
  { id: 'coach', label: 'Coach', key: 'coach' },
]

export function CorpoMobile() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [activeModal, setActiveModal] = useState<ModalId>(null)
  const [activeMealSlot, setActiveMealSlot] = useState<MealSlot>('breakfast')
  const tabsRef = useRef<HTMLDivElement>(null)

  const todayStr = new Date().toISOString().split('T')[0]

  // ─── Tab scroll-into-view ─────────────────────────────────────
  useEffect(() => {
    if (!tabsRef.current) return
    const btn = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeTab])

  // ─── Data hooks ───────────────────────────────────────────────
  const { profile: realProfile, latestWeight: realLatestWeight, nextAppointment: realNextAppt, weekActivities: realWeekActs, loading, reload } = useCorpoDashboard()
  const { entries: realEntries, reload: reloadEntries } = useWeightEntries(90)
  const { activities: realActivities, reload: reloadActivities } = useActivities(30)
  const { appointments: realAppointments, reload: reloadAppointments } = useAppointments()
  const { meals: realMeals, reload: reloadMeals } = useMeals(todayStr)
  const { water: realWater, reload: reloadWater } = useWaterIntake(todayStr)

  // ─── Mock fallback (ativo quando Supabase retorna vazio) ───────
  const profile        = realProfile        ?? MOCK_PROFILE
  const latestWeight   = realLatestWeight   ?? MOCK_WEIGHT_ENTRIES[0]
  const nextAppointment= realNextAppt       ?? MOCK_APPOINTMENTS[0]
  const weekActivities = realWeekActs.length > 0 ? realWeekActs : MOCK_ACTIVITIES.slice(0, 4)
  const entries        = realEntries.length > 0 ? realEntries : MOCK_WEIGHT_ENTRIES
  const activities     = realActivities.length > 0 ? realActivities : MOCK_ACTIVITIES
  const appointments   = realAppointments.length > 0 ? realAppointments : MOCK_APPOINTMENTS
  const meals          = realMeals.length > 0 ? realMeals : MOCK_MEALS
  const water          = realWater ?? MOCK_WATER

  // ─── Mutation hooks ───────────────────────────────────────────
  const addWeightEntry = useAddWeightEntry()
  const saveActivity = useSaveActivity()
  const saveAppointment = useSaveAppointment()
  const saveMeal = useSaveMeal()
  const updateWater = useUpdateWater()
  const saveProfile = useSaveHealthProfile()

  // ─── Water add handler ────────────────────────────────────────
  const handleAddWater = useCallback(async (ml: number) => {
    if (ml <= 0) return
    const current = water?.intake_ml ?? 0
    const goal = water?.goal_ml ?? 2500
    try {
      await updateWater(todayStr, current + ml, goal)
      await reloadWater()
    } catch {
      toast.error('Erro ao registrar hidratação')
    }
  }, [water, todayStr, updateWater, reloadWater])

  // ─── Modal handlers ───────────────────────────────────────────
  function openMealModal(slot: MealSlot) {
    setActiveMealSlot(slot)
    setActiveModal('meal')
  }

  const totalConsumedKcal = meals.reduce((s, m) => s + m.calories_kcal, 0)

  if (loading) {
    return (
      <div className="lg:hidden">
        {/* Header skeleton */}
        <div className="flex items-center justify-between px-5 pt-14 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[20px]">🏃</span>
            <span className="font-[Syne] text-[20px] font-bold text-[var(--sl-t1)]">Corpo</span>
          </div>
          <div className="h-7 w-20 rounded-full bg-[var(--sl-s2)] animate-pulse" />
        </div>
        <div className="flex gap-0 px-5 border-b border-[var(--sl-border)] mb-4">
          {TABS.map((t) => (
            <div key={t.id} className="px-3 py-2 h-9 rounded bg-[var(--sl-s2)] animate-pulse mr-2" style={{ width: 70 }} />
          ))}
        </div>
        <div className="space-y-3 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="lg:hidden pb-[calc(68px+16px)]">
      {/* Modals (full-screen overlays) */}
      {activeModal === 'activity' && (
        <CorpoActivityModal
          weightKg={latestWeight?.weight ?? null}
          onClose={() => setActiveModal(null)}
          onSave={async (data) => {
            await saveActivity(data)
            toast.success('Atividade registrada!')
            setActiveModal(null)
            await Promise.all([reload(), reloadActivities()])
          }}
        />
      )}
      {activeModal === 'weight' && (
        <CorpoWeightModal
          profile={profile}
          onClose={() => setActiveModal(null)}
          onSave={async (data) => {
            await addWeightEntry(data as any)
            toast.success('Pesagem registrada!')
            setActiveModal(null)
            await Promise.all([reload(), reloadEntries()])
          }}
        />
      )}
      {activeModal === 'appointment' && (
        <CorpoAppointmentModal
          onClose={() => setActiveModal(null)}
          onSave={async (data) => {
            await saveAppointment(data)
            toast.success('Consulta agendada!')
            setActiveModal(null)
            await reloadAppointments()
          }}
        />
      )}
      {activeModal === 'meal' && (
        <CorpoMealModal
          slot={activeMealSlot}
          profile={profile}
          totalConsumedKcal={totalConsumedKcal}
          onClose={() => setActiveModal(null)}
          onSave={async (data) => {
            await saveMeal(data)
            toast.success('Refeição registrada!')
            setActiveModal(null)
            await reloadMeals()
          }}
        />
      )}
      {activeModal === 'profile' && (
        <CorpoProfileModal
          profile={profile}
          onClose={() => setActiveModal(null)}
          onSave={async (data, id) => {
            await saveProfile(data, id)
            toast.success('Perfil atualizado!')
            setActiveModal(null)
            await reload()
          }}
        />
      )}

      {/* Module header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[20px]">🏃</span>
          <span className="font-[Syne] text-[20px] font-bold text-[var(--sl-t1)]">
            {jornadaLabel('corpo', 'module', 'Corpo')}
          </span>
        </div>
        {activeTab === 'atividades' && (
          <button
            onClick={() => setActiveModal('activity')}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white shrink-0"
            style={{ background: CORPO_COLOR }}
            aria-label="Registrar atividade"
          >
            <Plus size={20} />
          </button>
        )}
        {activeTab === 'saude' && (
          <button
            onClick={() => setActiveModal('appointment')}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white shrink-0"
            style={{ background: CORPO_COLOR }}
            aria-label="Agendar consulta"
          >
            <Plus size={20} />
          </button>
        )}
        {activeTab === 'peso' && (
          <button
            onClick={() => setActiveModal('weight')}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white shrink-0"
            style={{ background: CORPO_COLOR }}
            aria-label="Registrar peso"
          >
            <Plus size={20} />
          </button>
        )}
        {activeTab === 'coach' && (
          <span
            className="text-[12px] font-semibold px-3 py-1 rounded-full"
            style={{ background: 'rgba(168,85,247,0.14)', color: '#a855f7' }}
          >
            💎 PRO
          </span>
        )}
        {activeTab === 'dashboard' && weekActivities.length > 0 && profile?.weekly_activity_goal && (
          <span
            className="text-[12px] font-semibold px-3 py-1 rounded-full"
            style={{ background: 'rgba(249,115,22,0.14)', color: CORPO_COLOR }}
          >
            {weekActivities.length}/{profile.weekly_activity_goal} atividades
          </span>
        )}
      </div>

      {/* Sub-nav underline tabs */}
      <div
        ref={tabsRef}
        className="flex gap-0 px-5 border-b border-[var(--sl-border)] mb-3 overflow-x-auto scrollbar-hide"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative px-3 py-2 text-[13px] whitespace-nowrap flex-shrink-0 transition-colors"
            style={{
              color: activeTab === tab.id ? 'var(--sl-t1)' : 'var(--sl-t3)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              paddingBottom: 10,
            }}
          >
            {jornadaLabel('corpo', tab.key, tab.label)}
            {activeTab === tab.id && (
              <span
                className="absolute bottom-[-1px] rounded-t-[3px]"
                style={{
                  left: 6, right: 6, height: 3,
                  background: CORPO_COLOR,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'dashboard' && (
        <CorpoTabDashboard
          profile={profile}
          latestWeight={latestWeight}
          entries={entries}
          nextAppointment={nextAppointment}
          weekActivities={weekActivities}
          water={water}
          onOpenProfile={() => setActiveModal('profile')}
          onOpenWeight={() => setActiveModal('weight')}
          onOpenActivity={() => setActiveModal('activity')}
          onAddWater={handleAddWater}
        />
      )}
      {activeTab === 'atividades' && (
        <CorpoTabAtividades
          activities={activities}
          weekActivities={weekActivities}
          onOpenModal={() => setActiveModal('activity')}
        />
      )}
      {activeTab === 'peso' && (
        <CorpoTabPeso
          entries={entries}
          profile={profile}
          onOpenModal={() => setActiveModal('weight')}
        />
      )}
      {activeTab === 'cardapio' && (
        <CorpoTabCardapio
          meals={meals}
          profile={profile}
          onOpenMealModal={openMealModal}
        />
      )}
      {activeTab === 'saude' && (
        <CorpoTabSaude
          appointments={appointments}
          onOpenModal={() => setActiveModal('appointment')}
        />
      )}
      {activeTab === 'coach' && (
        <CorpoTabCoach
          profile={profile}
          weekActivities={weekActivities}
          latestWeight={latestWeight}
          isPro={false}
        />
      )}
    </div>
  )
}
