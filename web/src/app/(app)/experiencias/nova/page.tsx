'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Plus, X, Check, Plane } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ExperienciasMobile } from '@/components/experiencias/ExperienciasMobile'
import {
  useTrips, useCreateTrip,
  TRIP_TYPE_LABELS, DEFAULT_CHECKLIST_ITEMS,
  type TripType, type ChecklistCategory,
} from '@/hooks/use-experiencias'
import { useUserPlan } from '@/hooks/use-user-plan'
import { checkPlanLimit } from '@/lib/plan-limits'
import { createTransactionFromViagem } from '@/lib/integrations/financas'
import { createEventsFromViagem } from '@/lib/integrations/agenda'
import { convertToBrl, formatMoneyWithBrl } from '@/lib/currency'
import { createClient } from '@/lib/supabase/client'

interface WizardData {
  // Step 0 — Destino
  name: string
  destinations: string[]
  destinationInput: string
  // Step 1 — Datas e Viajantes
  trip_type: TripType
  start_date: string
  end_date: string
  travelers_count: number
  // Step 2 — Orçamento
  total_budget: string
  currency: string
  syncToFinancas: boolean
  syncToAgenda: boolean
  objective_id: string
  // Step 3 — Resumo/notas
  notes: string
}

const EMPTY_DATA: WizardData = {
  name: '',
  destinations: [],
  destinationInput: '',
  trip_type: 'leisure',
  start_date: '',
  end_date: '',
  travelers_count: 1,
  total_budget: '',
  currency: 'BRL',
  syncToFinancas: false,
  syncToAgenda: false,
  notes: '',
  objective_id: '',
}

const CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'ARS']

// RN-EXP-26: gera checklist personalizado por tipo e duração
function buildAutoChecklist(tripType: TripType, days: number): { title: string; category: ChecklistCategory }[] {
  const items: { title: string; category: ChecklistCategory }[] = [...DEFAULT_CHECKLIST_ITEMS]

  if (tripType === 'work') {
    items.push(
      { title: 'Cartões de visita', category: 'documents' },
      { title: 'Notebook e cabos carregados', category: 'luggage' },
      { title: 'Agenda de reuniões impressa', category: 'documents' },
    )
  }
  if (tripType === 'study') {
    items.push(
      { title: 'Material de estudo/apostilas', category: 'luggage' },
      { title: 'Comprovante de matrícula', category: 'documents' },
    )
  }
  if (days > 7) {
    items.push(
      { title: 'Reservar passeios com antecedência', category: 'before_trip' },
      { title: 'Planejar lavanderia local', category: 'luggage' },
    )
  }
  if (days > 14) {
    items.push(
      { title: 'Consulta médica preventiva', category: 'before_trip' },
      { title: 'Medicamentos para viagem longa', category: 'luggage' },
    )
  }

  return items
}

const STEPS = [
  { label: 'Destino', desc: 'Onde voce vai?' },
  { label: 'Datas e Viajantes', desc: 'Quando e com quem' },
  { label: 'Orcamento', desc: 'Defina limites' },
  { label: 'Resumo', desc: 'Revisar e criar' },
]

export default function NovaViagemPage() {
  const router = useRouter()

  const { trips } = useTrips()
  const { isPro } = useUserPlan()
  const [objectiveOptions, setObjectiveOptions] = useState<Array<{ id: string; name: string }>>([])
  // RN-EXP-07: Viagens ativas = status não completed/cancelled
  const activeTrips = trips.filter(t => !['completed', 'cancelled'].includes(t.status))

  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(EMPTY_DATA)
  const [isSaving, setIsSaving] = useState(false)
  const createTrip = useCreateTrip()

  useEffect(() => {
    const supabase = createClient() as any
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      if (!user) return
      supabase.from('objectives')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .then(({ data }: any) => {
          setObjectiveOptions(data ?? [])
        })
    })
  }, [])

  function addDestination() {
    const dest = data.destinationInput.trim()
    if (!dest) return
    if (data.destinations.includes(dest)) return
    setData(d => ({ ...d, destinations: [...d.destinations, dest], destinationInput: '' }))
  }

  function removeDestination(i: number) {
    setData(d => ({ ...d, destinations: d.destinations.filter((_, idx) => idx !== i) }))
  }

  function canNextStep() {
    if (step === 0) {
      return data.name.trim().length > 0 && data.destinations.length > 0
    }
    if (step === 1) {
      return data.start_date && data.end_date
    }
    return true
  }

  async function handleFinish() {
    // RN-EXP-07: Limite FREE = 1 viagem ativa
    const limitCheck = checkPlanLimit(isPro, 'active_trips', activeTrips.length)
    if (!limitCheck.allowed) {
      toast.error(limitCheck.upsellMessage)
      return
    }
    setIsSaving(true)
    try {
      // RN-EXP-26: checklist automática por tipo e duração
      const autoChecklist = buildAutoChecklist(data.trip_type, stepDays)
      const trip = await createTrip({
        name: data.name.trim(),
        destinations: data.destinations,
        trip_type: data.trip_type,
        start_date: data.start_date,
        end_date: data.end_date,
        travelers_count: data.travelers_count,
        total_budget: data.total_budget ? parseFloat(data.total_budget) : null,
        currency: data.currency,
        notes: data.notes.trim() || null,
        objective_id: data.objective_id || null,
      }, autoChecklist)
      // RN-EXP-02: criar eventos de partida e retorno na Agenda
      if (data.syncToAgenda) {
        await createEventsFromViagem({
          tripName: data.name.trim(),
          startDate: data.start_date,
          endDate: data.end_date,
        })
      }
      // RN-EXP-03: sincronizar orçamento com Finanças
      if (data.syncToFinancas && data.total_budget && parseFloat(data.total_budget) > 0) {
        const totalBudgetInBrl = convertToBrl(parseFloat(data.total_budget), data.currency)
        await createTransactionFromViagem({
          tripName: data.name.trim(),
          totalBudget: totalBudgetInBrl,
          startDate: data.start_date,
        })
      }
      toast.success('Viagem criada com sucesso!')
      // RN-EXP-08/FUT-50: sugerir criação de objetivo no Futuro para a viagem
      setTimeout(() => {
        toast.info('Dica: crie um Objetivo no modulo Futuro para acompanhar o progresso desta viagem!', {
          action: { label: 'Criar Objetivo', onClick: () => router.push('/futuro') },
          duration: 8000,
        })
      }, 1500)
      router.push(`/experiencias/viagens/${trip.id}`)
    } catch {
      toast.error('Erro ao criar viagem')
    } finally {
      setIsSaving(false)
    }
  }

  const stepDays = data.start_date && data.end_date
    ? Math.max(1, Math.ceil((new Date(data.end_date).getTime() - new Date(data.start_date).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <>
    {/* Mobile -- wizard acessivel via botao + em ExperienciasMobile */}
    <ExperienciasMobile />

    {/* Desktop */}
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* Back + Module Header */}
      <div className="flex items-center gap-[14px] mb-7 sl-fade-up">
        <button
          onClick={() => router.push('/experiencias')}
          className="inline-flex items-center gap-[6px] px-[14px] py-[7px] rounded-[10px]
                     border border-[var(--sl-border)] text-[var(--sl-t2)] text-[12px] font-medium
                     hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
        >
          <ArrowLeft size={15} />
          Voltar
        </button>
        <div className="w-[44px] h-[44px] rounded-[14px] flex items-center justify-center shrink-0"
          style={{ background: 'rgba(236,72,153,.1)' }}>
          <Plane size={22} className="stroke-2" style={{ color: '#ec4899' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-[Syne] font-extrabold text-[26px] leading-[1.15] text-[var(--sl-t1)]">
            Nova Viagem
          </h1>
          <p className="text-[13px] text-[var(--sl-t2)] mt-[3px]">Planeje sua proxima aventura</p>
        </div>
      </div>

      {/* Two-column wizard layout: Left Rail + Content */}
      <div className="grid grid-cols-[220px_1fr] gap-8 sl-fade-up sl-delay-1" style={{ minHeight: 500 }}>

        {/* ── Left Rail: Steps ── */}
        <div className="pt-2">
          {STEPS.map((s, i) => {
            const isDone = i < step
            const isActive = i === step
            return (
              <div key={i} className="flex items-start gap-[14px] py-[14px] relative">
                {/* Connecting line */}
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-[15px] top-[42px] bottom-0 w-[2px]',
                      isDone ? 'bg-[#10b981]' : 'bg-[var(--sl-s3)]'
                    )}
                  />
                )}

                {/* Step number circle */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 z-[1] transition-all',
                    'font-[DM_Mono] text-[13px] font-medium',
                    isDone
                      ? 'bg-[#10b981] border-2 border-[#10b981] text-white'
                      : isActive
                        ? 'bg-[rgba(236,72,153,.08)] border-2 border-[#ec4899] text-[#ec4899]'
                        : 'bg-[var(--sl-bg)] border-2 border-[var(--sl-s3)] text-[var(--sl-t3)]'
                  )}
                >
                  {isDone ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                </div>

                {/* Step label + description */}
                <div className="pt-[5px]">
                  <div className={cn(
                    'text-[13px] font-semibold transition-colors',
                    isDone
                      ? 'text-[#10b981]'
                      : isActive
                        ? 'text-[var(--sl-t1)]'
                        : 'text-[var(--sl-t3)]'
                  )}>
                    {s.label}
                  </div>
                  <div className="text-[11px] text-[var(--sl-t3)] mt-[2px]">{s.desc}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Right: Form Content ── */}
        <div>
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6">

            {/* Step 0 -- Destino */}
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <div>
                  <div className="font-[Syne] font-bold text-[17px] text-[var(--sl-t1)] mb-[6px]">Destino</div>
                  <div className="text-[12px] text-[var(--sl-t3)] mb-6">Para onde voce vai?</div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">
                    Nome da viagem *
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={data.name}
                    onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                    placeholder="Ex: Europa 2026, Praias do Nordeste..."
                    className="w-full px-[14px] py-[10px] rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[rgba(236,72,153,.5)] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">
                    Destinos *
                  </label>
                  {data.destinations.length > 0 && (
                    <div className="flex flex-wrap gap-[6px] mb-2">
                      {data.destinations.map((dest, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-[5px] rounded-full bg-[rgba(236,72,153,.1)] text-[#ec4899] text-[12px]">
                          {dest}
                          <button onClick={() => removeDestination(i)} className="ml-1 opacity-60 hover:opacity-100 cursor-pointer">
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={data.destinationInput}
                      onChange={e => setData(d => ({ ...d, destinationInput: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDestination() } }}
                      placeholder="Adicionar outro destino..."
                      className="flex-1 px-[14px] py-[10px] rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[rgba(236,72,153,.5)] transition-colors"
                    />
                    <button
                      onClick={addDestination}
                      className="p-[10px] rounded-[10px] bg-[rgba(236,72,153,.1)] border border-[#ec4899] text-[#ec4899] hover:bg-[rgba(236,72,153,.2)] transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setStep(1)}
                    disabled={!canNextStep()}
                    className={cn(
                      'inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold transition-all',
                      canNextStep()
                        ? 'bg-[#ec4899] text-white hover:brightness-110 hover:-translate-y-px shadow-[0_6px_20px_rgba(236,72,153,.15)]'
                        : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
                    )}
                  >
                    Proximo
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1 -- Datas e Viajantes */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <div className="font-[Syne] font-bold text-[17px] text-[var(--sl-t1)] mb-[6px]">Datas e Viajantes</div>
                  <div className="text-[12px] text-[var(--sl-t3)] mb-6">Defina o periodo e quem vai junto</div>
                </div>

                <div className="grid grid-cols-2 gap-[14px]">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">Data de ida *</label>
                    <input
                      type="date"
                      value={data.start_date}
                      onChange={e => setData(d => ({ ...d, start_date: e.target.value }))}
                      className="w-full px-[14px] py-[10px] rounded-[10px] text-[13px] font-[DM_Mono] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[rgba(236,72,153,.5)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">Data de volta *</label>
                    <input
                      type="date"
                      value={data.end_date}
                      min={data.start_date}
                      onChange={e => setData(d => ({ ...d, end_date: e.target.value }))}
                      className="w-full px-[14px] py-[10px] rounded-[10px] text-[13px] font-[DM_Mono] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[rgba(236,72,153,.5)] transition-colors"
                    />
                  </div>
                </div>

                {stepDays > 0 && (
                  <div className="text-center my-1">
                    <span className="inline-block px-[14px] py-[5px] rounded-full bg-[rgba(236,72,153,.1)] text-[#ec4899] text-[12px] font-medium">
                      {stepDays} {stepDays === 1 ? 'dia' : 'dias'} de viagem
                    </span>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[10px] block">Tipo de viagem</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(TRIP_TYPE_LABELS) as TripType[]).map(t => (
                      <button key={t} onClick={() => setData(d => ({ ...d, trip_type: t }))}
                        className={cn(
                          'py-[14px] px-2 rounded-[11px] border text-center text-[12px] font-semibold transition-all cursor-pointer',
                          data.trip_type === t
                            ? 'border-[rgba(236,72,153,.3)] bg-[rgba(236,72,153,.08)] text-[var(--sl-t1)]'
                            : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                        )}
                      >
                        {TRIP_TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">Numero de viajantes</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={data.travelers_count}
                    onChange={e => setData(d => ({ ...d, travelers_count: parseInt(e.target.value) || 1 }))}
                    className="w-[100px] px-[14px] py-[10px] rounded-[10px] text-[13px] text-center bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[rgba(236,72,153,.5)] transition-colors"
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(0)}
                    className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                               border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
                  >
                    <ArrowLeft size={14} />
                    Voltar
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canNextStep()}
                    className={cn(
                      'inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold transition-all',
                      canNextStep()
                        ? 'bg-[#ec4899] text-white hover:brightness-110 hover:-translate-y-px shadow-[0_6px_20px_rgba(236,72,153,.15)]'
                        : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
                    )}
                  >
                    Proximo
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 -- Orcamento */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <div className="font-[Syne] font-bold text-[17px] text-[var(--sl-t1)] mb-[6px]">Orcamento</div>
                  <div className="text-[12px] text-[var(--sl-t3)] mb-6">Defina um orcamento total para a viagem. Voce pode ajustar depois no detalhe da viagem.</div>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">Orcamento total</label>
                    <input
                      type="number"
                      step="100"
                      value={data.total_budget}
                      onChange={e => setData(d => ({ ...d, total_budget: e.target.value }))}
                      placeholder="Opcional -- Ex: 5000"
                      className="w-full px-[14px] py-[10px] rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[rgba(236,72,153,.5)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">Moeda</label>
                    <select
                      value={data.currency}
                      onChange={e => setData(d => ({ ...d, currency: e.target.value }))}
                      className="px-[14px] py-[10px] rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[rgba(236,72,153,.5)] transition-colors"
                    >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {data.total_budget && parseFloat(data.total_budget) > 0 && stepDays > 0 && (
                  <div className="p-4 bg-[var(--sl-s2)] rounded-xl">
                    <p className="text-[11px] text-[var(--sl-t3)] mb-1">Estimativa por dia</p>
                    <p className="font-[DM_Mono] font-bold text-lg text-[#ec4899]">
                      {formatMoneyWithBrl(parseFloat(data.total_budget) / stepDays, data.currency)}
                    </p>
                    <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                      por viajante: {formatMoneyWithBrl(parseFloat(data.total_budget) / stepDays / data.travelers_count, data.currency)}/dia
                    </p>
                  </div>
                )}

                <div className="p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl">
                  <p className="text-[12px] text-[var(--sl-t2)]">
                    Voce pode definir o orcamento por categoria (hospedagem, passagens, alimentacao, etc.) no detalhe da viagem.
                  </p>
                </div>

                {objectiveOptions.length > 0 && (
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">Objetivo no Futuro (opcional)</label>
                    <select
                      value={data.objective_id}
                      onChange={e => setData(d => ({ ...d, objective_id: e.target.value }))}
                      className="w-full px-[14px] py-[10px] rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[rgba(236,72,153,.5)] transition-colors"
                    >
                      <option value="">Nenhum</option>
                      {objectiveOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                    <p className="text-[10px] text-[var(--sl-t3)] mt-1">Cria meta tecnica vinculada a viagem para sincronizar progresso no Futuro.</p>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--sl-t1)]">Bloquear datas na Agenda</p>
                    <p className="text-[11px] text-[var(--sl-t3)]">Cria eventos de partida e retorno automaticamente</p>
                  </div>
                  <button
                    onClick={() => setData(d => ({ ...d, syncToAgenda: !d.syncToAgenda }))}
                    className={cn('w-10 h-6 rounded-full transition-all relative shrink-0', data.syncToAgenda ? 'bg-[#ec4899]' : 'bg-[var(--sl-s3)]')}
                  >
                    <div className={cn('w-4 h-4 rounded-full bg-white absolute top-1 transition-all', data.syncToAgenda ? 'left-5' : 'left-1')} />
                  </button>
                </div>

                {data.total_budget && parseFloat(data.total_budget) > 0 && (
                  <div className="flex items-center justify-between p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
                    <div>
                      <p className="text-[13px] font-medium text-[var(--sl-t1)]">Registrar em Financas</p>
                      <p className="text-[11px] text-[var(--sl-t3)]">Cria despesa planejada automaticamente</p>
                    </div>
                    <button
                      onClick={() => setData(d => ({ ...d, syncToFinancas: !d.syncToFinancas }))}
                      className={cn('w-10 h-6 rounded-full transition-all relative shrink-0', data.syncToFinancas ? 'bg-[#ec4899]' : 'bg-[var(--sl-s3)]')}
                    >
                      <div className={cn('w-4 h-4 rounded-full bg-white absolute top-1 transition-all', data.syncToFinancas ? 'left-5' : 'left-1')} />
                    </button>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                               border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
                  >
                    <ArrowLeft size={14} />
                    Voltar
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                               bg-[#ec4899] text-white hover:brightness-110 hover:-translate-y-px shadow-[0_6px_20px_rgba(236,72,153,.15)] transition-all"
                  >
                    Proximo
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 -- Resumo */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <div className="font-[Syne] font-bold text-[17px] text-[var(--sl-t1)] mb-[6px]">Confirmar viagem</div>
                  <div className="text-[12px] text-[var(--sl-t3)] mb-6">Revise os dados e crie sua viagem</div>
                </div>

                {/* Summary card */}
                <div className="bg-[var(--sl-s2)] rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">{data.name}</h3>
                      <p className="text-[12px] text-[var(--sl-t3)]">{data.destinations.join(' \u2192 ')}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ec4899]/20 text-[#ec4899]">
                      {TRIP_TYPE_LABELS[data.trip_type]}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Datas</p>
                      <p className="text-[11px] text-[var(--sl-t1)]">
                        {data.start_date ? new Date(data.start_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '\u2014'}
                        {' \u2192 '}
                        {data.end_date ? new Date(data.end_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '\u2014'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Duracao</p>
                      <p className="font-[DM_Mono] text-[11px] text-[var(--sl-t1)]">{stepDays} {stepDays === 1 ? 'dia' : 'dias'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Viajantes</p>
                      <p className="font-[DM_Mono] text-[11px] text-[var(--sl-t1)]">{data.travelers_count}</p>
                    </div>
                    {data.total_budget && (
                      <div>
                        <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Orcamento</p>
                        <p className="font-[DM_Mono] text-[11px] text-[#ec4899]">
                          {formatMoneyWithBrl(parseFloat(data.total_budget), data.currency)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">Notas / Observacoes</label>
                  <textarea
                    value={data.notes}
                    onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
                    rows={3}
                    placeholder="Informacoes gerais, contatos de emergencia, preferencias..."
                    className="w-full px-[14px] py-[10px] rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[rgba(236,72,153,.5)] resize-none transition-colors"
                  />
                </div>

                <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl">
                  <p className="text-[12px] text-[var(--sl-t2)]">
                    Ao criar a viagem, uma <strong className="text-[var(--sl-t1)]">checklist padrao</strong> e categorias de orcamento serao criadas automaticamente.
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                               border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
                  >
                    <ArrowLeft size={14} />
                    Voltar
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={isSaving || !canNextStep()}
                    className={cn(
                      'inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold transition-all',
                      !isSaving
                        ? 'bg-[#ec4899] text-white hover:brightness-110 hover:-translate-y-px shadow-[0_6px_20px_rgba(236,72,153,.15)]'
                        : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
                    )}
                  >
                    {isSaving ? 'Criando...' : 'Criar Viagem'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
    </>
  )
}
