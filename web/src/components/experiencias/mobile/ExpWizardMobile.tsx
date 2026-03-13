'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft } from 'lucide-react'
import { EXP_PRIMARY, EXP_GRAD, EXP_PRIMARY_LIGHT } from '@/lib/exp-colors'
import { ExpWizardStepper } from './ExpWizardStepper'
import { ExpWizardStep1 } from './ExpWizardStep1'
import { ExpWizardStep2 } from './ExpWizardStep2'
import { ExpWizardStep3 } from './ExpWizardStep3'
import { ExpWizardStep4 } from './ExpWizardStep4'
import { ExpWizardStep5 } from './ExpWizardStep5'
import { useCreateTrip, DEFAULT_CHECKLIST_ITEMS } from '@/hooks/use-experiencias'
import type { TripType } from '@/hooks/use-experiencias'
import { useObjectives } from '@/hooks/use-futuro'
import { MOCK_OBJECTIVES_FUTURO } from '@/lib/exp-mock-data'

interface ExpWizardMobileProps {
  open: boolean
  onClose: () => void
  onSubmit?: (data: WizardData) => void
  onTripCreated?: () => void
}

export interface WizardData {
  tripName: string
  destinations: string[]
  tripType: string
  companion: string
  travelers: number
  startDate: Date | null
  endDate: Date | null
  budget: number
  currency: string
  syncFinance: boolean
  syncAgenda: boolean
}

export function ExpWizardMobile({ open, onClose, onSubmit, onTripCreated }: ExpWizardMobileProps) {
  const accent = EXP_PRIMARY

  const [step, setStep] = useState(1)
  const [tripName, setTripName] = useState('')
  const [destinations, setDestinations] = useState<string[]>([])
  const [tripType, setTripType] = useState('leisure')
  const [companion, setCompanion] = useState<'solo' | 'couple' | 'family' | 'friends'>('solo')
  const [travelers, setTravelers] = useState(1)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [budget, setBudget] = useState(0)
  const [currency, setCurrency] = useState('BRL')
  const [syncFinance, setSyncFinance] = useState(true)
  const [syncAgenda, setSyncAgenda] = useState(true)
  const [syncFuturo, setSyncFuturo] = useState(false)
  const [linkedObjectiveId, setLinkedObjectiveId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const createTrip = useCreateTrip()
  const { objectives, loading: objectivesLoading } = useObjectives()
  const realObjectives = (objectives ?? [])
    .filter(o => o.status === 'active')
    .map(o => ({ id: o.id, name: o.name, icon: o.icon ?? '🎯' }))
  // Use mock objectives as fallback for visual validation when DB has none yet
  const activeObjectives = !objectivesLoading && realObjectives.length === 0
    ? MOCK_OBJECTIVES_FUTURO
    : realObjectives

  useEffect(() => { setMounted(true) }, [])

  if (!open || !mounted) return null

  const tripDays = startDate && endDate
    ? Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0

  const STEP_LABELS = ['', 'Continuar → Companhia +50 XP', 'Continuar → Datas +50 XP', 'Continuar → Orçamento +50 XP', 'Continuar → Revisão +50 XP', saving ? 'Criando...' : '✦ Iniciar Missão · +50 XP']

  async function handleNext() {
    if (step < 5) {
      setStep(step + 1)
    } else {
      // Final step: create trip
      setSaving(true)
      setSaveError(null)
      try {
        const wizardData: WizardData = {
          tripName, destinations, tripType, companion, travelers,
          startDate, endDate, budget, currency, syncFinance, syncAgenda,
        }

        const toIsoDate = (d: Date) => d.toISOString().slice(0, 10)

        const trip = await createTrip(
          {
            name: tripName || (destinations[0] ?? 'Nova Viagem'),
            destinations,
            trip_type: (tripType as TripType) || 'leisure',
            start_date: startDate ? toIsoDate(startDate) : toIsoDate(new Date()),
            end_date: endDate ? toIsoDate(endDate) : toIsoDate(new Date()),
            travelers_count: travelers,
            total_budget: budget > 0 ? budget : null,
            currency,
            objective_id: syncFuturo && linkedObjectiveId ? linkedObjectiveId : null,
          },
          DEFAULT_CHECKLIST_ITEMS
        )

        // Integrations (best-effort, fire-and-forget)
        if (syncFinance && budget > 0 && trip?.id) {
          try {
            const { createClient } = await import('@/lib/supabase/client')
            const sb = createClient() as any
            const { data: { user } } = await sb.auth.getUser()
            if (user) {
              await sb.from('budgets').insert({
                user_id: user.id,
                name: `Viagem: ${tripName || (destinations[0] ?? 'Nova Viagem')}`,
                amount: budget,
                period: 'once',
                category: 'viagem',
                notes: `Criado automaticamente para a viagem ${trip.id}`,
              })
            }
          } catch (err) { console.warn('[CrossModule] Falha ao criar transação de viagem em Finanças:', err) }
        }

        if (syncAgenda && startDate && endDate && trip?.id) {
          try {
            const { createClient } = await import('@/lib/supabase/client')
            const sb = createClient() as any
            const { data: { user } } = await sb.auth.getUser()
            if (user) {
              const toIsoDate = (d: Date) => d.toISOString().slice(0, 10)
              await sb.from('agenda_events').insert({
                user_id: user.id,
                title: `✈️ ${tripName || (destinations[0] ?? 'Viagem')}`,
                date: toIsoDate(startDate),
                type: 'pessoal',
                description: `Viagem até ${toIsoDate(endDate)} (trip_id: ${trip.id})`,
                all_day: true,
                status: 'pendente',
                priority: 'normal',
              })
            }
          } catch (err) { console.warn('[CrossModule] Falha ao criar evento de viagem no Tempo:', err) }
        }

        onSubmit?.(wizardData)
        onTripCreated?.()
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Erro ao criar viagem')
        setSaving(false)
      }
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
    else onClose()
  }

  return createPortal(
    <div className="fixed inset-0 bg-[var(--sl-bg)] flex flex-col" style={{ zIndex: 9999 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[14px] pb-[10px]">
        <button onClick={handleBack}>
          <ChevronLeft size={20} className="text-[var(--sl-t2)]" />
        </button>
        <div className="text-center">
          <p className="text-[12px] font-medium" style={{ color: EXP_PRIMARY_LIGHT }}>
            ✦ Nova Missão de Viagem
          </p>
          <p className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)]">
            {step > 1 && tripName ? `${tripName} 🇯🇵` : 'Sua próxima aventura'}
          </p>
        </div>
        <button onClick={onClose} className="text-[13px] text-[var(--sl-t3)]">Cancelar</button>
      </div>

      {/* Stepper */}
      <ExpWizardStepper currentStep={step} />

      {/* Step content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {step === 1 && (
          <ExpWizardStep1
            tripName={tripName} setTripName={setTripName}
            destinations={destinations} setDestinations={setDestinations}
            tripType={tripType} setTripType={setTripType}
          />
        )}
        {step === 2 && (
          <ExpWizardStep2
            tripName={tripName} destinations={destinations}
            companion={companion} setCompanion={setCompanion}
            travelers={travelers} setTravelers={setTravelers}
          />
        )}
        {step === 3 && (
          <ExpWizardStep3
            tripName={tripName} destinations={destinations} companion={companion}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
          />
        )}
        {step === 4 && (
          <ExpWizardStep4
            budget={budget} setBudget={setBudget}
            currency={currency} setCurrency={setCurrency}
            syncFinance={syncFinance} setSyncFinance={setSyncFinance}
            syncAgenda={syncAgenda} setSyncAgenda={setSyncAgenda}
            syncFuturo={syncFuturo} setSyncFuturo={setSyncFuturo}
            linkedObjectiveId={linkedObjectiveId} setLinkedObjectiveId={setLinkedObjectiveId}
            objectives={activeObjectives}
            tripDays={tripDays} travelers={travelers}
          />
        )}
        {step === 5 && (
          <ExpWizardStep5
            tripName={tripName} destinations={destinations}
            tripType={tripType} companion={companion} travelers={travelers}
            startDate={startDate} endDate={endDate}
            budget={budget} syncFinance={syncFinance} syncAgenda={syncAgenda}
          />
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-6">
        {saveError && (
          <div
            className="rounded-[10px] p-3 mb-3 text-[12px]"
            style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e' }}
          >
            {saveError}
          </div>
        )}
        <button
          onClick={handleNext}
          disabled={saving}
          className="w-full rounded-[14px] text-[15px] font-semibold text-white"
          style={{
            background: EXP_GRAD,
            height: step === 5 ? 54 : 50,
            fontSize: step === 5 ? 16 : 15,
            fontWeight: step === 5 ? 700 : 600,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {STEP_LABELS[step]}
        </button>
      </div>
    </div>,
    document.body
  )
}
