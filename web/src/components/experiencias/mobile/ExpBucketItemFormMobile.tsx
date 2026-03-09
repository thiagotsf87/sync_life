'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft } from 'lucide-react'
import { EXP_PRIMARY, EXP_GRAD, EXP_PRIMARY_LIGHT } from '@/lib/exp-colors'
import { useCreateBucketItem } from '@/hooks/use-experiencias'
import type { BucketPriority, BucketTripType, CreateBucketItemData } from '@/hooks/use-experiencias'

// Derive flag emoji from ISO 3166-1 alpha-2 code
function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🌍'
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  ).join('')
}

// Simple country → code + continent lookup
const COUNTRY_LOOKUP: Record<string, { code: string; continent: string }> = {
  'Brasil':         { code: 'BR', continent: 'América do Sul' },
  'Argentina':      { code: 'AR', continent: 'América do Sul' },
  'Chile':          { code: 'CL', continent: 'América do Sul' },
  'Uruguai':        { code: 'UY', continent: 'América do Sul' },
  'Colômbia':       { code: 'CO', continent: 'América do Sul' },
  'Peru':           { code: 'PE', continent: 'América do Sul' },
  'Bolívia':        { code: 'BO', continent: 'América do Sul' },
  'Equador':        { code: 'EC', continent: 'América do Sul' },
  'Venezuela':      { code: 'VE', continent: 'América do Sul' },
  'Paraguai':       { code: 'PY', continent: 'América do Sul' },
  'Portugal':       { code: 'PT', continent: 'Europa' },
  'Espanha':        { code: 'ES', continent: 'Europa' },
  'França':         { code: 'FR', continent: 'Europa' },
  'Itália':         { code: 'IT', continent: 'Europa' },
  'Alemanha':       { code: 'DE', continent: 'Europa' },
  'Grécia':         { code: 'GR', continent: 'Europa' },
  'Reino Unido':    { code: 'GB', continent: 'Europa' },
  'Holanda':        { code: 'NL', continent: 'Europa' },
  'Suíça':          { code: 'CH', continent: 'Europa' },
  'Áustria':        { code: 'AT', continent: 'Europa' },
  'Bélgica':        { code: 'BE', continent: 'Europa' },
  'Japão':          { code: 'JP', continent: 'Ásia' },
  'China':          { code: 'CN', continent: 'Ásia' },
  'Tailândia':      { code: 'TH', continent: 'Ásia' },
  'Índia':          { code: 'IN', continent: 'Ásia' },
  'Indonésia':      { code: 'ID', continent: 'Ásia' },
  'Singapura':      { code: 'SG', continent: 'Ásia' },
  'Vietnã':         { code: 'VN', continent: 'Ásia' },
  'Coreia do Sul':  { code: 'KR', continent: 'Ásia' },
  'EUA':            { code: 'US', continent: 'América do Norte' },
  'Estados Unidos': { code: 'US', continent: 'América do Norte' },
  'México':         { code: 'MX', continent: 'América do Norte' },
  'Canadá':         { code: 'CA', continent: 'América do Norte' },
  'Cuba':           { code: 'CU', continent: 'América do Norte' },
  'África do Sul':  { code: 'ZA', continent: 'África' },
  'Marrocos':       { code: 'MA', continent: 'África' },
  'Egito':          { code: 'EG', continent: 'África' },
  'Quênia':         { code: 'KE', continent: 'África' },
  'Tanzânia':       { code: 'TZ', continent: 'África' },
  'Austrália':      { code: 'AU', continent: 'Oceania' },
  'Nova Zelândia':  { code: 'NZ', continent: 'Oceania' },
}

const PRIORITY_OPTIONS: { value: BucketPriority; label: string; icon: string; color: string }[] = [
  { value: 'high',   label: 'Alta',   icon: '🔥', color: '#f43f5e' },
  { value: 'medium', label: 'Média',  icon: '⚡', color: '#f59e0b' },
  { value: 'low',    label: 'Baixa',  icon: '💎', color: '#ec4899' },
]

const TYPE_OPTIONS: { value: BucketTripType; label: string; icon: string }[] = [
  { value: 'solo',    label: 'Solo',      icon: '🧑' },
  { value: 'couple',  label: 'Casal',     icon: '👫' },
  { value: 'family',  label: 'Família',   icon: '👨‍👩‍👧' },
  { value: 'friends', label: 'Amigos',    icon: '👥' },
]

interface ExpBucketItemFormMobileProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function ExpBucketItemFormMobile({
  open,
  onClose,
  onSaved,
}: ExpBucketItemFormMobileProps) {
  const [mounted, setMounted] = useState(false)
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [priority, setPriority] = useState<BucketPriority>('medium')
  const [budget, setBudget] = useState('')
  const [year, setYear] = useState('')
  const [tripType, setTripType] = useState<BucketTripType | null>(null)
  const [motivation, setMotivation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createItem = useCreateBucketItem()
  const accent = EXP_PRIMARY

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (open) {
      setCountry(''); setCity(''); setPriority('medium')
      setBudget(''); setYear(''); setTripType(null)
      setMotivation(''); setError(null)
    }
  }, [open])

  if (!open || !mounted) return null

  // Auto-resolve flag/continent from country name
  const lookup = COUNTRY_LOOKUP[country]
  const flagEmoji = lookup ? countryCodeToFlag(lookup.code) : '🌍'
  const continent = lookup?.continent ?? null

  async function handleSave() {
    if (!country.trim()) { setError('Nome do país é obrigatório'); return }

    setSaving(true)
    setError(null)
    try {
      const payload: CreateBucketItemData = {
        destination_country: country.trim(),
        destination_city: city.trim() || null,
        country_code: lookup?.code ?? null,
        flag_emoji: flagEmoji,
        continent,
        priority,
        estimated_budget: budget ? Number(budget) : null,
        target_year: year ? Number(year) : null,
        trip_type: tripType,
        motivation: motivation.trim() || null,
      }
      await createItem(payload)
      onSaved()
    } catch (err: any) {
      if (err?.code === 'LIMIT_REACHED') {
        setError('Limite de 10 itens atingido no plano gratuito. Faça upgrade para continuar.')
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao salvar')
      }
    } finally {
      setSaving(false)
    }
  }

  const currentYear = new Date().getFullYear()

  return createPortal(
    <div className="fixed inset-0 bg-[var(--sl-bg)] flex flex-col" style={{ zIndex: 9999 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[14px] pb-[10px]">
        <button onClick={onClose}>
          <ChevronLeft size={20} className="text-[var(--sl-t2)]" />
        </button>
        <div className="text-center">
          <p className="text-[11px] font-medium" style={{ color: EXP_PRIMARY_LIGHT }}>
            🗺️ Bucket List
          </p>
          <p className="font-[Syne] text-[15px] font-bold text-[var(--sl-t1)]">
            Adicionar Destino
          </p>
        </div>
        <button onClick={onClose} className="text-[12px] text-[var(--sl-t3)]">Cancelar</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Country (required) */}
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
            style={{ color: EXP_PRIMARY_LIGHT }}>
            País *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[20px]">{flagEmoji}</span>
            <input
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="Ex: Japão, Itália, Grécia..."
              className="w-full pl-10 pr-4 py-3 rounded-[12px] text-[14px] text-[var(--sl-t1)] outline-none"
              style={{
                background: 'var(--sl-s2)',
                border: '1.5px solid rgba(139,92,246,0.25)',
              }}
            />
          </div>
          {continent && (
            <p className="text-[10px] mt-1" style={{ color: accent }}>{continent}</p>
          )}
        </div>

        {/* City (optional) */}
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
            style={{ color: EXP_PRIMARY_LIGHT }}>
            Cidade (opcional)
          </label>
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Ex: Tóquio, Roma, Santorini..."
            className="w-full px-4 py-3 rounded-[12px] text-[14px] text-[var(--sl-t1)] outline-none"
            style={{
              background: 'var(--sl-s2)',
              border: '1.5px solid rgba(139,92,246,0.25)',
            }}
          />
        </div>

        {/* Priority */}
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
            style={{ color: EXP_PRIMARY_LIGHT }}>
            Urgência da missão
          </label>
          <div className="flex gap-2">
            {PRIORITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPriority(opt.value)}
                className="flex-1 py-2 rounded-[10px] text-center text-[11px] font-semibold transition-colors"
                style={{
                  background: priority === opt.value
                    ? `${opt.color}22`
                    : 'var(--sl-s2)',
                  border: `1px solid ${priority === opt.value ? opt.color : 'var(--sl-border)'}`,
                  color: priority === opt.value ? opt.color : 'var(--sl-t2)',
                }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget + Year */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
              style={{ color: EXP_PRIMARY_LIGHT }}>
              Meta financeira
            </label>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="10000"
              className="w-full px-3 py-3 rounded-[12px] text-[14px] text-[var(--sl-t1)] outline-none"
              style={{
                background: 'var(--sl-s2)',
                border: '1.5px solid rgba(139,92,246,0.25)',
              }}
            />
          </div>
          <div className="w-[90px]">
            <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
              style={{ color: EXP_PRIMARY_LIGHT }}>
              Ano alvo
            </label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
              placeholder={String(currentYear + 1)}
              className="w-full px-3 py-3 rounded-[12px] text-[14px] text-[var(--sl-t1)] outline-none"
              style={{
                background: 'var(--sl-s2)',
                border: '1.5px solid rgba(139,92,246,0.25)',
              }}
            />
          </div>
        </div>

        {/* Trip type */}
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
            style={{ color: EXP_PRIMARY_LIGHT }}>
            Tipo de viagem
          </label>
          <div className="flex gap-2">
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTripType(prev => prev === opt.value ? null : opt.value)}
                className="flex-1 py-2 rounded-[10px] text-center text-[11px] font-medium transition-colors"
                style={{
                  background: tripType === opt.value
                    ? 'rgba(139,92,246,0.15)'
                    : 'var(--sl-s2)',
                  border: `1px solid ${tripType === opt.value ? accent : 'var(--sl-border)'}`,
                  color: tripType === opt.value ? accent : 'var(--sl-t2)',
                }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Motivation */}
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
            style={{ color: EXP_PRIMARY_LIGHT }}>
            Por que essa missão?
          </label>
          <textarea
            value={motivation}
            onChange={e => setMotivation(e.target.value)}
            placeholder="O que torna esse destino especial para você?"
            rows={3}
            className="w-full px-4 py-3 rounded-[12px] text-[13px] text-[var(--sl-t1)] outline-none resize-none"
            style={{
              background: 'var(--sl-s2)',
              border: '1.5px solid rgba(139,92,246,0.25)',
              lineHeight: 1.5,
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-[10px] p-3 mb-3 text-[12px]"
            style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e' }}
          >
            {error}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-[14px] h-[52px] text-[15px] font-bold text-white"
          style={{
            background: EXP_GRAD,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Salvando...' : '🗺️ Adicionar à Lista de Aventuras'}
        </button>
      </div>
    </div>,
    document.body
  )
}
