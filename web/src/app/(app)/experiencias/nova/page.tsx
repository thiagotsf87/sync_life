'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Plus, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import {
  useCreateTrip,
  TRIP_TYPE_LABELS,
  type TripType,
} from '@/hooks/use-experiencias'

interface WizardData {
  // Step 1 — Destino e Datas
  name: string
  destinations: string[]
  destinationInput: string
  trip_type: TripType
  start_date: string
  end_date: string
  travelers_count: number
  // Step 2 — Orçamento
  total_budget: string
  currency: string
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
  notes: '',
}

const CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'ARS']

const STEP_LABELS = [
  '✈️ Destino',
  '💰 Orçamento',
  '📝 Resumo',
]

export default function NovaViagemPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(EMPTY_DATA)
  const [isSaving, setIsSaving] = useState(false)
  const createTrip = useCreateTrip()

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
      return data.name.trim() && data.destinations.length > 0 && data.start_date && data.end_date
    }
    return true
  }

  async function handleFinish() {
    setIsSaving(true)
    try {
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
      })
      toast.success('Viagem criada com sucesso!')
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
    <div className="max-w-[700px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/experiencias')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          {step > 0 ? 'Voltar' : 'Experiências'}
        </button>
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl flex-1',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          ✈️ Nova Viagem
        </h1>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all',
                i < step
                  ? 'bg-[#06b6d4] text-[#03071a]'
                  : i === step
                    ? 'bg-[#06b6d4]/20 border-2 border-[#06b6d4] text-[#06b6d4]'
                    : 'bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t3)]'
              )}
            >
              {i < step ? <Check size={12} /> : i + 1}
            </div>
            <span className={cn(
              'text-[11px] truncate transition-colors',
              i === step ? 'text-[var(--sl-t1)] font-medium' : 'text-[var(--sl-t3)]'
            )}>
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div className={cn(
                'flex-1 h-px min-w-[20px]',
                i < step ? 'bg-[#06b6d4]' : 'bg-[var(--sl-border)]'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6">

        {/* Step 0 — Destino e Datas */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">✈️ Destino e Datas</h2>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Nome da viagem*</label>
              <input
                type="text"
                value={data.name}
                onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                placeholder="Ex: Europa 2026, Praias do Nordeste..."
                className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Destinos*</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={data.destinationInput}
                  onChange={e => setData(d => ({ ...d, destinationInput: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDestination() } }}
                  placeholder="Adicione uma cidade ou país"
                  className="flex-1 px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                />
                <button
                  onClick={addDestination}
                  className="p-2.5 rounded-[10px] bg-[#06b6d4]/10 border border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/20"
                >
                  <Plus size={16} />
                </button>
              </div>
              {data.destinations.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {data.destinations.map((dest, i) => (
                    <div key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[12px] text-[var(--sl-t1)]">
                      <span>📍 {dest}</span>
                      <button onClick={() => removeDestination(i)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)]">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Data de ida*</label>
                <input
                  type="date"
                  value={data.start_date}
                  onChange={e => setData(d => ({ ...d, start_date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Data de volta*</label>
                <input
                  type="date"
                  value={data.end_date}
                  min={data.start_date}
                  onChange={e => setData(d => ({ ...d, end_date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                />
              </div>
            </div>

            {stepDays > 0 && (
              <div className="flex items-center gap-2 p-3 bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-xl">
                <span>🗓️</span>
                <p className="text-[12px] text-[var(--sl-t2)]">
                  Duração: <strong className="text-[var(--sl-t1)]">{stepDays} {stepDays === 1 ? 'dia' : 'dias'}</strong>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Tipo de viagem</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(TRIP_TYPE_LABELS) as TripType[]).map(t => (
                    <button key={t} onClick={() => setData(d => ({ ...d, trip_type: t }))}
                      className={cn(
                        'py-2 rounded-[10px] border text-[11px] transition-all',
                        data.trip_type === t
                          ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t3)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      {TRIP_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Nº de viajantes</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={data.travelers_count}
                  onChange={e => setData(d => ({ ...d, travelers_count: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Orçamento */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">💰 Orçamento estimado</h2>
            <p className="text-[13px] text-[var(--sl-t2)]">
              Defina um orçamento total para a viagem. Você pode ajustar depois no detalhe da viagem.
            </p>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Orçamento total</label>
                <input
                  type="number"
                  step="100"
                  value={data.total_budget}
                  onChange={e => setData(d => ({ ...d, total_budget: e.target.value }))}
                  placeholder="Opcional — Ex: 5000"
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Moeda</label>
                <select
                  value={data.currency}
                  onChange={e => setData(d => ({ ...d, currency: e.target.value }))}
                  className="px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4]"
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {data.total_budget && parseFloat(data.total_budget) > 0 && stepDays > 0 && (
              <div className="p-4 bg-[var(--sl-s2)] rounded-xl">
                <p className="text-[11px] text-[var(--sl-t3)] mb-1">Estimativa por dia</p>
                <p className="font-[DM_Mono] font-bold text-lg text-[#06b6d4]">
                  {(parseFloat(data.total_budget) / stepDays).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">por viajante: {(parseFloat(data.total_budget) / stepDays / data.travelers_count).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/dia</p>
              </div>
            )}

            <div className="p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl">
              <p className="text-[12px] text-[var(--sl-t2)]">
                💡 Você pode definir o orçamento por categoria (hospedagem, passagens, alimentação, etc.) no detalhe da viagem.
              </p>
            </div>
          </div>
        )}

        {/* Step 2 — Resumo */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">📝 Confirmar viagem</h2>

            {/* Summary card */}
            <div className="bg-[var(--sl-s2)] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">{data.name}</h3>
                  <p className="text-[12px] text-[var(--sl-t3)]">{data.destinations.join(' → ')}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#06b6d4]/20 text-[#06b6d4]">
                  {TRIP_TYPE_LABELS[data.trip_type]}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Datas</p>
                  <p className="text-[11px] text-[var(--sl-t1)]">
                    {data.start_date ? new Date(data.start_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'}
                    {' '}→{' '}
                    {data.end_date ? new Date(data.end_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Duração</p>
                  <p className="font-[DM_Mono] text-[11px] text-[var(--sl-t1)]">{stepDays} {stepDays === 1 ? 'dia' : 'dias'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Viajantes</p>
                  <p className="font-[DM_Mono] text-[11px] text-[var(--sl-t1)]">{data.travelers_count}</p>
                </div>
                {data.total_budget && (
                  <div>
                    <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wider">Orçamento</p>
                    <p className="font-[DM_Mono] text-[11px] text-[#06b6d4]">
                      {parseFloat(data.total_budget).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Notas / Observações</label>
              <textarea
                value={data.notes}
                onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
                rows={3}
                placeholder="Informações gerais, contatos de emergência, preferências..."
                className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#06b6d4] resize-none"
              />
            </div>

            <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl">
              <p className="text-[12px] text-[var(--sl-t2)]">
                ✅ Ao criar a viagem, uma <strong className="text-[var(--sl-t1)]">checklist padrão</strong> e categorias de orçamento serão criadas automaticamente.
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-2 mt-6 pt-5 border-t border-[var(--sl-border)]">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]"
            >
              <ArrowLeft size={14} />
              Voltar
            </button>
          )}
          <div className="flex-1" />
          {step < STEP_LABELS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNextStep()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90 disabled:opacity-40"
            >
              Próximo
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSaving || !canNextStep()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#06b6d4] text-[#03071a] hover:opacity-90 disabled:opacity-40"
            >
              {isSaving ? 'Criando...' : '✈️ Criar viagem'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
