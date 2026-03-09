'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import { CARREIRA_PRIMARY } from '@/lib/carreira-colors'
import { jornadaLabel } from '@/lib/jornada-labels'
import { CarreiraXpBar } from '@/components/carreira/mobile/CarreiraXpBar'
import { CarreiraCoachCard } from '@/components/carreira/mobile/CarreiraCoachCard'
import { CarreiraTabDashboard } from '@/components/carreira/mobile/CarreiraTabDashboard'
import { CarreiraTabPerfil } from '@/components/carreira/mobile/CarreiraTabPerfil'
import { CarreiraTabRoadmap } from '@/components/carreira/mobile/CarreiraTabRoadmap'
import { CarreiraTabHabilidades } from '@/components/carreira/mobile/CarreiraTabHabilidades'
import { CarreiraTabHistorico } from '@/components/carreira/mobile/CarreiraTabHistorico'
import { CarreiraAddSkillModal } from '@/components/carreira/mobile/CarreiraAddSkillModal'
import { CarreiraAddPromotionModal } from '@/components/carreira/mobile/CarreiraAddPromotionModal'
import type { ProfessionalProfile, CareerRoadmap, Skill, CareerHistoryEntry, SaveSkillData } from '@/hooks/use-carreira'

type Tab = 'dashboard' | 'perfil' | 'roadmap' | 'habilidades' | 'historico'

const TABS: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'perfil', label: 'Perfil' },
  { key: 'roadmap', label: 'Roadmap' },
  { key: 'habilidades', label: 'Habilidades' },
  { key: 'historico', label: 'Histórico' },
]

interface CarreiraMobileProps {
  profile: ProfessionalProfile | null
  activeRoadmap: CareerRoadmap | null
  skills: Skill[]
  history: CareerHistoryEntry[]
  loading: boolean
  onSaveSkill: (data: SaveSkillData) => Promise<void>
  onAddPromotion: (data: { title: string; company: string; salary: number; startDate: string; syncFinance: boolean }) => Promise<void>
  onReload: () => Promise<void>
}

export function CarreiraMobile({
  profile,
  activeRoadmap,
  skills,
  history,
  loading,
  onSaveSkill,
  onAddPromotion,
  onReload,
}: CarreiraMobileProps) {
  const pathname = usePathname()
  const accent = CARREIRA_PRIMARY

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (pathname.includes('/perfil')) return 'perfil'
    if (pathname.includes('/roadmap')) return 'roadmap'
    if (pathname.includes('/habilidades')) return 'habilidades'
    if (pathname.includes('/historico')) return 'historico'
    return 'dashboard'
  })

  const [showAddSkill, setShowAddSkill] = useState(false)
  const [showAddPromotion, setShowAddPromotion] = useState(false)

  const tabsRef = useRef<HTMLDivElement>(null)

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
  }

  // Header right button based on tab
  const showAddButton = activeTab === 'habilidades' || activeTab === 'historico'

  return (
    <div className="lg:hidden pb-[calc(68px+16px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[14px] pb-3">
        <div>
          <p className="text-[12px] font-semibold text-[#c4b5fd] mb-[2px]">
            ✦ {jornadaLabel('carreira', 'module', 'Carreira')} · Nível 6
          </p>
          <h1 className="font-[Syne] text-[20px] font-bold text-[var(--sl-t1)]">
            Sua jornada
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'perfil' && (
            <span className="inline-flex items-center gap-[3px] px-2 py-[3px] rounded-[10px] text-[10px] font-bold bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.2)] text-[#c4b5fd]">
              ⚡ Nível 6
            </span>
          )}
          {activeTab === 'roadmap' && (
            <span className="inline-flex items-center gap-[3px] px-2 py-[3px] rounded-[10px] text-[10px] font-bold bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.2)] text-[#c4b5fd]">
              ⚡ 55%
            </span>
          )}
          {activeTab === 'habilidades' && (
            <span className="inline-flex items-center gap-[3px] px-2 py-[3px] rounded-[10px] text-[10px] font-bold bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.2)] text-[#c4b5fd]">
              ⚡ 14 skills
            </span>
          )}
          {activeTab === 'historico' && (
            <span className="inline-flex items-center gap-[3px] px-2 py-[3px] rounded-[10px] text-[10px] font-bold bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.2)] text-[#c4b5fd]">
              ⚡ 480 XP
            </span>
          )}
          {showAddButton && (
            <button
              onClick={() => activeTab === 'habilidades' ? setShowAddSkill(true) : setShowAddPromotion(true)}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ background: accent, borderColor: accent }}
            >
              <Plus size={16} className="text-white" />
            </button>
          )}
          {activeTab === 'dashboard' && (
            <>
              <button className="w-9 h-9 rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] flex items-center justify-center">
                <Search size={16} className="text-[var(--sl-t2)]" />
              </button>
              <button
                onClick={() => activeTab === 'dashboard' && setShowAddPromotion(true)}
                className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                style={{ background: accent }}
              >
                <Plus size={16} className="text-white" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        ref={tabsRef}
        className="flex gap-0 px-4 border-b border-[var(--sl-border)] mb-3 overflow-x-auto scrollbar-hide"
      >
        {TABS.map(tab => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              data-active={active}
              onClick={() => setActiveTab(tab.key)}
              className="px-3 py-2 text-[12px] font-medium whitespace-nowrap border-b-2 shrink-0 transition-colors"
              style={{
                color: active ? '#c4b5fd' : 'var(--sl-t3)',
                borderBottomColor: active ? '#8b5cf6' : 'transparent',
              }}
            >
              {jornadaLabel('carreira', tab.key, tab.label)}
            </button>
          )
        })}
      </div>

      {/* Jornada extras (XP bar + Coach) on dashboard tab */}
      {activeTab === 'dashboard' && (
        <>
          <CarreiraXpBar />
          <CarreiraCoachCard
            message={<>Você está a <strong>2 habilidades</strong> de Tech Lead. Complete <strong>Node.js Avançado</strong> e <strong>Arquitetura</strong> para desbloquear o próximo nível. Seu salário pode subir <strong>52%</strong>!</>}
            cta="Ver simulador de promoção"
          />
        </>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="px-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <CarreiraTabDashboard
              profile={profile}
              activeRoadmap={activeRoadmap}
              skills={skills}
              onTabChange={handleTabChange}
            />
          )}
          {activeTab === 'perfil' && (
            <CarreiraTabPerfil
              profile={profile}
              history={history}
            />
          )}
          {activeTab === 'roadmap' && (
            <CarreiraTabRoadmap
              activeRoadmap={activeRoadmap}
            />
          )}
          {activeTab === 'habilidades' && (
            <CarreiraTabHabilidades
              skills={skills}
              onAddSkill={() => setShowAddSkill(true)}
            />
          )}
          {activeTab === 'historico' && (
            <CarreiraTabHistorico
              history={history}
              onAddPromotion={() => setShowAddPromotion(true)}
            />
          )}
        </>
      )}

      {/* Modals */}
      <CarreiraAddSkillModal
        open={showAddSkill}
        onClose={() => setShowAddSkill(false)}
        onSave={async (data) => {
          await onSaveSkill(data)
          await onReload()
        }}
      />
      <CarreiraAddPromotionModal
        open={showAddPromotion}
        onClose={() => setShowAddPromotion(false)}
        onSave={async (data) => {
          await onAddPromotion(data)
          await onReload()
        }}
        currentSalary={profile?.gross_salary ?? 9200}
      />
    </div>
  )
}
