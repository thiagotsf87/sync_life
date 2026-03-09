'use client'

import { useState } from 'react'
import { ChevronLeft, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EXP_PRIMARY, EXP_PRIMARY_LIGHT } from '@/lib/exp-colors'
import { ExpDetailTabs, type DetailTab } from './ExpDetailTabs'
import { ExpTabOverview } from './ExpTabOverview'
import { ExpTabRoteiro } from './ExpTabRoteiro'
import { ExpTabOrcamento } from './ExpTabOrcamento'
import { ExpTabChecklist } from './ExpTabChecklist'
import { ExpTabHospedagem } from './ExpTabHospedagem'
import { ExpTabTransporte } from './ExpTabTransporte'

interface ExpDetailMobileProps {
  trip: {
    id: string
    name: string
    destinations: string[]
    start_date: string
    end_date: string
    status: string
    total_budget: number | null
    total_spent: number
    trip_type: string
    travelers_count: number
  }
  checklistPct: number
}

export function ExpDetailMobile({ trip, checklistPct }: ExpDetailMobileProps) {
  const router = useRouter()
  const accent = EXP_PRIMARY

  const [activeTab, setActiveTab] = useState<DetailTab>('overview')

  // Tab title
  const tabTitles: Record<DetailTab, string> = {
    overview: 'Visão geral',
    roteiro: 'Roteiro',
    orcamento: 'Orçamento',
    checklist: 'Checklist',
    hospedagem: 'Hospedagem',
    transporte: 'Transporte',
  }

  return (
    <div className="lg:hidden pb-[calc(68px+16px)]">
      {/* Header */}
      <div className="flex items-center gap-[10px] px-5 pt-[14px] pb-[10px]">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
        >
          <ChevronLeft size={16} className="text-[var(--sl-t2)]" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium" style={{ color: EXP_PRIMARY_LIGHT }}>
            ✈️ {trip.name}
          </p>
          <p className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)]">
            {tabTitles[activeTab]}
          </p>
        </div>
        <button
          className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{
            background: activeTab === 'checklist' ? accent : 'var(--sl-s1)',
            border: `1px solid ${activeTab === 'checklist' ? accent : 'var(--sl-border)'}`,
          }}
        >
          <Plus size={16} className={activeTab === 'checklist' ? 'text-white' : 'text-[var(--sl-t2)]'} />
        </button>
      </div>

      {/* Tabs */}
      <ExpDetailTabs active={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <div className="mt-3">
        {activeTab === 'overview' && (
          <ExpTabOverview trip={trip} checklistPct={checklistPct} />
        )}
        {activeTab === 'roteiro' && (
          <ExpTabRoteiro days={[]} />
        )}
        {activeTab === 'orcamento' && (
          <ExpTabOrcamento
            totalBudget={trip.total_budget ?? 0}
            totalSaved={trip.total_spent}
          />
        )}
        {activeTab === 'checklist' && (
          <ExpTabChecklist />
        )}
        {activeTab === 'hospedagem' && (
          <ExpTabHospedagem />
        )}
        {activeTab === 'transporte' && (
          <ExpTabTransporte />
        )}
      </div>
    </div>
  )
}
