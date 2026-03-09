'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft } from 'lucide-react'
import { EXP_PRIMARY, EXP_GRAD, EXP_PRIMARY_LIGHT } from '@/lib/exp-colors'
import { useCreateTripMemory, useUpdateTripMemory } from '@/hooks/use-experiencias'
import type { TripMemory, CreateTripMemoryData, Trip } from '@/hooks/use-experiencias'

const EMOTION_TAGS = [
  { id: 'incrivel',      label: '🤩 Incrível' },
  { id: 'gastronomico',  label: '🍝 Gastronômico' },
  { id: 'cultural',      label: '🏛️ Cultural' },
  { id: 'relaxante',     label: '😌 Relaxante' },
  { id: 'praia',         label: '🏖️ Praia' },
  { id: 'aventura',      label: '🏔️ Aventura' },
  { id: 'musical',       label: '🎶 Musical' },
  { id: 'romantico',     label: '💑 Romântico' },
]

interface ExpMemoryFormMobileProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  trip: Trip
  existingMemory?: TripMemory | null
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="text-[32px] transition-transform active:scale-95"
          style={{ filter: star <= value ? 'none' : 'grayscale(1) opacity(0.3)' }}
        >
          ⭐
        </button>
      ))}
    </div>
  )
}

function TextArea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="mb-4">
      <label className="text-[10px] font-bold uppercase tracking-[0.5px] block mb-[6px]"
        style={{ color: EXP_PRIMARY_LIGHT }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-[14px] py-3 rounded-[12px] text-[13px] text-[var(--sl-t1)] outline-none resize-none"
        style={{
          background: 'var(--sl-s2)',
          border: '1.5px solid rgba(139,92,246,0.25)',
          lineHeight: 1.5,
        }}
      />
    </div>
  )
}

export function ExpMemoryFormMobile({
  open,
  onClose,
  onSaved,
  trip,
  existingMemory,
}: ExpMemoryFormMobileProps) {
  const [mounted, setMounted] = useState(false)
  const [rating, setRating] = useState(0)
  const [favoriteMoment, setFavoriteMoment] = useState('')
  const [bestFood, setBestFood] = useState('')
  const [mostBeautiful, setMostBeautiful] = useState('')
  const [lessonLearned, setLessonLearned] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMemory = useCreateTripMemory()
  const updateMemory = useUpdateTripMemory()
  const accent = EXP_PRIMARY

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (existingMemory) {
      setRating(existingMemory.rating)
      setFavoriteMoment(existingMemory.favorite_moment ?? '')
      setBestFood(existingMemory.best_food ?? '')
      setMostBeautiful(existingMemory.most_beautiful ?? '')
      setLessonLearned(existingMemory.lesson_learned ?? '')
      setSelectedTags(existingMemory.emotion_tags)
    } else {
      setRating(0)
      setFavoriteMoment('')
      setBestFood('')
      setMostBeautiful('')
      setLessonLearned('')
      setSelectedTags([])
    }
    setError(null)
  }, [existingMemory, open])

  if (!open || !mounted) return null

  function toggleTag(id: string) {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    if (rating === 0) { setError('Dê uma nota de 1 a 5 estrelas'); return }
    if (!favoriteMoment && !bestFood && !mostBeautiful && !lessonLearned) {
      setError('Preencha ao menos um campo de texto'); return
    }
    if (selectedTags.length === 0) { setError('Selecione ao menos uma tag de emoção'); return }

    setSaving(true)
    setError(null)
    try {
      const payload: CreateTripMemoryData = {
        rating,
        favorite_moment: favoriteMoment || null,
        best_food: bestFood || null,
        most_beautiful: mostBeautiful || null,
        lesson_learned: lessonLearned || null,
        emotion_tags: selectedTags,
        budget_planned: trip.total_budget ?? null,
        budget_actual: trip.total_spent > 0 ? trip.total_spent : null,
      }
      if (existingMemory) {
        await updateMemory(existingMemory.id, payload)
      } else {
        await createMemory(trip.id, payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar memória')
    } finally {
      setSaving(false)
    }
  }

  const budgetPlanned = trip.total_budget
  const budgetActual = trip.total_spent > 0 ? trip.total_spent : null

  return createPortal(
    <div className="fixed inset-0 bg-[var(--sl-bg)] flex flex-col" style={{ zIndex: 9999 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[14px] pb-[10px]">
        <button onClick={onClose}>
          <ChevronLeft size={20} className="text-[var(--sl-t2)]" />
        </button>
        <div className="text-center">
          <p className="text-[11px] font-medium" style={{ color: EXP_PRIMARY_LIGHT }}>
            📝 Diário do Explorador
          </p>
          <p className="font-[Syne] text-[15px] font-bold text-[var(--sl-t1)]" style={{ maxWidth: 200 }}>
            {trip.name}
          </p>
        </div>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Rating */}
        <div
          className="rounded-[16px] p-[14px] mb-4 text-center"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
        >
          <p className="text-[13px] font-semibold text-[var(--sl-t1)] mb-3">
            Qual foi a intensidade dessa missão?
          </p>
          <StarRating value={rating} onChange={setRating} />
          {rating > 0 && (
            <p className="text-[11px] mt-2" style={{ color: accent }}>
              {rating === 5 ? 'Perfeita!' : rating === 4 ? 'Excelente!' : rating === 3 ? 'Boa!' : rating === 2 ? 'Regular' : 'Difícil'}
            </p>
          )}
        </div>

        {/* Budget comparison */}
        {(budgetPlanned || budgetActual) && (
          <div
            className="rounded-[14px] p-3 mb-4 flex gap-3"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            {budgetPlanned && (
              <div className="flex-1 text-center">
                <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wide mb-1">Orçado</p>
                <p className="font-[DM_Mono] text-[14px] font-medium" style={{ color: 'var(--sl-t2)' }}>
                  R$ {budgetPlanned.toLocaleString('pt-BR')}
                </p>
              </div>
            )}
            {budgetActual && (
              <div className="flex-1 text-center">
                <p className="text-[9px] text-[var(--sl-t3)] uppercase tracking-wide mb-1">Real</p>
                <p className="font-[DM_Mono] text-[14px] font-medium" style={{ color: accent }}>
                  R$ {budgetActual.toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Text fields */}
        <TextArea
          label="Momento épico"
          placeholder="O que foi mais incrível nessa missão?"
          value={favoriteMoment}
          onChange={setFavoriteMoment}
        />
        <TextArea
          label="Combustível da missão"
          placeholder="Qual prato te deu energia extra?"
          value={bestFood}
          onChange={setBestFood}
        />
        <TextArea
          label="Cenário épico"
          placeholder="Que paisagem ficou gravada na memória?"
          value={mostBeautiful}
          onChange={setMostBeautiful}
        />
        <TextArea
          label="Habilidade desbloqueada"
          placeholder="Que habilidade você desenvolveu?"
          value={lessonLearned}
          onChange={setLessonLearned}
        />

        {/* Emotion tags */}
        <p className="text-[10px] font-bold uppercase tracking-[0.5px] mb-2"
          style={{ color: EXP_PRIMARY_LIGHT }}>
          Tipo de missão
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {EMOTION_TAGS.map(tag => {
            const active = selectedTags.includes(tag.id)
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="text-[11px] font-medium px-3 py-[6px] rounded-[20px] transition-colors"
                style={{
                  background: active
                    ? 'rgba(139,92,246,0.2)'
                    : 'var(--sl-s2)',
                  border: `1px solid ${active ? accent : 'var(--sl-border)'}`,
                  color: active ? accent : 'var(--sl-t2)',
                }}
              >
                {tag.label}
              </button>
            )
          })}
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
          {saving ? 'Salvando...' : '📝 Registrar no Diário'}
        </button>
      </div>
    </div>,
    document.body
  )
}
