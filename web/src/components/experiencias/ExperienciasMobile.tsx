'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { EXP_PRIMARY } from '@/lib/exp-colors'
import { jornadaLabel } from '@/lib/jornada-labels'
import { useXP } from '@/hooks/use-xp'
import { ExpXpBar } from '@/components/experiencias/mobile/ExpXpBar'
import { ExpCoachCard } from '@/components/experiencias/mobile/ExpCoachCard'
import { ExpTabDashboard } from '@/components/experiencias/mobile/ExpTabDashboard'
import { ExpTabViagens } from '@/components/experiencias/mobile/ExpTabViagens'
import { ExpTabPassaporte } from '@/components/experiencias/mobile/ExpTabPassaporte'
import { ExpTabMemorias } from '@/components/experiencias/mobile/ExpTabMemorias'
import { ExpMemoryDetailMobile } from '@/components/experiencias/mobile/ExpMemoryDetailMobile'
import { ExpTabBucketList } from '@/components/experiencias/mobile/ExpTabBucketList'
import { ExpWizardMobile } from '@/components/experiencias/mobile/ExpWizardMobile'
import { ExpMemoryFormMobile } from '@/components/experiencias/mobile/ExpMemoryFormMobile'
import { ExpUpgradeModal } from '@/components/experiencias/mobile/ExpUpgradeModal'
import {
  useTrips,
  useTripMemories,
  usePassportData,
  useBucketList,
  useUpdateTripStatus,
} from '@/hooks/use-experiencias'
import type { Trip, TripStatus } from '@/hooks/use-experiencias'

type Tab = 'dashboard' | 'viagens' | 'passaporte' | 'memorias' | 'bucketlist'

const TAB_LABEL_MAP: Record<Tab, { key: string; label: string }> = {
  dashboard: { key: 'dashboard', label: 'Dashboard' },
  viagens: { key: 'viagens', label: 'Viagens' },
  passaporte: { key: 'passaporte', label: 'Passaporte' },
  memorias: { key: 'memorias', label: 'Memórias' },
  bucketlist: { key: 'bucketList', label: 'Bucket List' },
}

function getTabLabel(key: Tab): string {
  const { key: labelKey, label } = TAB_LABEL_MAP[key]
  return jornadaLabel('experiencias', labelKey, label)
}

const TAB_KEYS: Tab[] = ['dashboard', 'viagens', 'passaporte', 'memorias', 'bucketlist']
const FREE_ACTIVE_LIMIT = 5

export function ExperienciasMobile() {
  const accent = EXP_PRIMARY
  const { totalXP, level } = useXP()

  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showWizard, setShowWizard] = useState(false)
  const [memoryDetailId, setMemoryDetailId] = useState<string | null>(null)
  const [memoryFormTrip, setMemoryFormTrip] = useState<Trip | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const tabsRef = useRef<HTMLDivElement>(null)

  // Real data hooks
  const { trips, loading: tripsLoading, reload: reloadTrips } = useTrips()
  const { memories, loading: memoriesLoading, reload: reloadMemories } = useTripMemories()
  const { passport, loading: passportLoading } = usePassportData()
  const { items: bucketItems, loading: bucketLoading, reload: reloadBucket } = useBucketList()
  const updateTripStatus = useUpdateTripStatus()

  // Build memoriesMap: tripId → has memory
  const memoriesMap = Object.fromEntries(
    memories.map(m => [m.trip_id, true])
  )

  // Trips without memory = completed trips with no memory registered
  const tripsWithoutMemory = trips.filter(
    t => t.status === 'completed' && !memoriesMap[t.id]
  )

  // Badge for header
  const badge = `${totalXP.toLocaleString('pt-BR')} XP`

  // Auto-scroll to active tab
  useEffect(() => {
    if (!tabsRef.current) return
    const container = tabsRef.current
    const activeEl = container.querySelector('[data-active="true"]') as HTMLElement | null
    if (activeEl) {
      const scrollLeft = activeEl.offsetLeft - container.clientWidth / 2 + activeEl.clientWidth / 2
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [activeTab])

  function handleTabChange(tab: string) {
    setActiveTab(tab as Tab)
    setMemoryDetailId(null)
  }

  function handleNewTrip() {
    // FREE limit: max 5 active trips
    const activeCount = trips.filter(t => ['planning', 'reserved', 'ongoing'].includes(t.status)).length
    if (activeCount >= FREE_ACTIVE_LIMIT) {
      setUpgradeOpen(true)
      return
    }
    setShowWizard(true)
  }

  async function handleUpdateStatus(tripId: string, status: TripStatus) {
    await updateTripStatus(tripId, status)
    reloadTrips()
  }

  // If memory detail is open, show detail view
  if (memoryDetailId) {
    return (
      <div className="lg:hidden pb-[calc(68px+16px)]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-[14px] pb-[10px]">
          <button
            onClick={() => setMemoryDetailId(null)}
            className="text-[18px] text-[var(--sl-t2)] w-6 shrink-0"
          >←</button>
          <span
            className="font-[Syne] text-[16px] font-bold flex-1"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Diário do Explorador
          </span>
          <span className="text-[14px]" style={{ color: '#ec4899' }}>✏️</span>
        </div>

        {/* Tabs */}
        <div
          ref={tabsRef}
          className="flex gap-0 px-5 border-b border-[var(--sl-border)] mb-3 overflow-x-auto scrollbar-hide"
        >
          {TAB_KEYS.map(key => {
            const active = activeTab === key
            return (
              <button
                key={key}
                data-active={active}
                onClick={() => { setMemoryDetailId(null); setActiveTab(key) }}
                className="flex-1 text-center py-2 text-[10.5px] font-medium whitespace-nowrap relative"
                style={{
                  color: active ? '#c4b5fd' : 'var(--sl-t3)',
                  fontWeight: active ? 600 : 500,
                }}
              >
                {getTabLabel(key)}
                {active && (
                  <span
                    className="absolute bottom-[-1px] left-[10%] w-[80%] h-0.5 rounded-sm"
                    style={{ background: '#8b5cf6' }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <ExpMemoryDetailMobile
          onBack={() => setMemoryDetailId(null)}
        />
      </div>
    )
  }

  return (
    <div className="lg:hidden pb-[calc(68px+16px)]">
      {/* Header */}
      <div className="px-5 pt-[14px] pb-0">
        <div className="flex items-center justify-between">
          <div className="font-[Syne] text-[17px] font-bold">
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              ✦ Explorador Nível {level}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] px-2 py-[3px] rounded-[20px] font-semibold"
              style={{
                background: 'rgba(139,92,246,0.15)',
                color: '#c4b5fd',
              }}
            >
              {badge}
            </span>
            {(activeTab === 'dashboard' || activeTab === 'viagens') && (
              <button
                onClick={handleNewTrip}
                className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                style={{ background: accent }}
              >
                <Plus size={16} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        ref={tabsRef}
        className="flex gap-0 px-5 pt-3 border-b border-[var(--sl-border)] mb-3 overflow-x-auto scrollbar-hide"
      >
        {TAB_KEYS.map(key => {
          const active = activeTab === key
          return (
            <button
              key={key}
              data-active={active}
              onClick={() => setActiveTab(key)}
              className="flex-1 text-center py-2 text-[10.5px] font-medium whitespace-nowrap relative"
              style={{
                color: active ? '#c4b5fd' : 'var(--sl-t3)',
                fontWeight: active ? 600 : 500,
              }}
            >
              {getTabLabel(key)}
              {active && (
                <span
                  className="absolute bottom-[-1px] left-[10%] w-[80%] h-0.5 rounded-sm"
                  style={{ background: '#8b5cf6' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Jornada extras on dashboard tab */}
      {activeTab === 'dashboard' && (
        <>
          <ExpXpBar />
          <ExpCoachCard
            message={
              <>{trips.filter(t => ['planning','reserved','ongoing'].includes(t.status)).length > 0
                ? <><strong>{trips.filter(t => ['planning','reserved','ongoing'].includes(t.status)).length} missões ativas</strong> — continue guardando para a próxima aventura!</>
                : <>Planeje sua próxima missão épica e desbloqueie novos continentes! 🌎</>
              }</>
            }
            cta={trips.find(t => t.status === 'planning')?.name ? `Ver Missão ${trips.find(t => t.status === 'planning')?.name}` : 'Nova Missão'}
          />
        </>
      )}

      {/* Tab content */}
      {activeTab === 'dashboard' && (
        <ExpTabDashboard
          onTabChange={handleTabChange}
          onNewTrip={handleNewTrip}
          trips={trips}
          loading={tripsLoading}
        />
      )}
      {activeTab === 'viagens' && (
        <ExpTabViagens
          trips={trips}
          loading={tripsLoading}
          onUpdateStatus={handleUpdateStatus}
          onOpenMemoryForm={setMemoryFormTrip}
          memoriesMap={memoriesMap}
        />
      )}
      {activeTab === 'passaporte' && (
        <ExpTabPassaporte
          passport={passport}
          loading={passportLoading}
        />
      )}
      {activeTab === 'memorias' && (
        <ExpTabMemorias
          onOpenDetail={(id) => setMemoryDetailId(id)}
          memories={memories}
          loading={memoriesLoading}
          tripsWithoutMemory={tripsWithoutMemory}
          onOpenMemoryForm={setMemoryFormTrip}
        />
      )}
      {activeTab === 'bucketlist' && (
        <ExpTabBucketList
          items={bucketItems}
          loading={bucketLoading}
          onReload={reloadBucket}
          onCreateTrip={() => handleNewTrip()}
        />

      )}

      {/* Wizard overlay */}
      <ExpWizardMobile
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onTripCreated={() => {
          reloadTrips()
          setShowWizard(false)
          setActiveTab('viagens')
        }}
      />

      {/* Memory form */}
      {memoryFormTrip && (
        <ExpMemoryFormMobile
          open
          onClose={() => setMemoryFormTrip(null)}
          onSaved={() => {
            setMemoryFormTrip(null)
            reloadMemories()
          }}
          trip={memoryFormTrip}
        />
      )}

      {/* Upgrade modal */}
      <ExpUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="viagens ativas"
        limitDescription={`Você atingiu o limite de ${FREE_ACTIVE_LIMIT} viagens ativas no plano gratuito.`}
      />
    </div>
  )
}
