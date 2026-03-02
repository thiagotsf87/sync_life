'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type RatingKey = 'otimo' | 'mais_ou_menos' | 'saiu_controle'

interface Rating {
  key: RatingKey
  emoji: string
  label: string
  sub?: string
  points?: string
}

const RATINGS: Rating[] = [
  {
    key: 'otimo',
    emoji: '😊',
    label: 'Ótimo! Dentro do planejado',
    sub: undefined,
    points: '+6 pontos no Life Score',
  },
  {
    key: 'mais_ou_menos',
    emoji: '😐',
    label: 'Mais ou menos, teve um ou dois excessos',
  },
  {
    key: 'saiu_controle',
    emoji: '😬',
    label: 'Saiu do controle, quero ajustar',
  },
]

const TOTAL_STEPS = 4

const STEP_LABELS = [
  'Finanças',
  'Tempo & Energia',
  'Metas & Futuro',
  'Reflexão Geral',
]

const STEP_QUESTIONS = [
  'Como foi a semana financeira?',
  'Como foi sua gestão de tempo?',
  'Você avançou em seus objetivos?',
  'Como você avalia a semana no geral?',
]

// Mock summary stats
const FINANCIAL_SUMMARY = [
  { label: 'Total gasto',       value: 'R$ 892,40' },
  { label: 'vs. semana anterior', value: '-R$ 340 ↓ Menos', positive: true },
  { label: 'Categoria principal', value: '🏠 Moradia (R$ 1.200)' },
  { label: 'Orçamentos no limite', value: 'Lazer (80%)' },
]

export default function WeeklyReviewPage() {
  const router = useRouter()
  const [step, setStep]       = useState(1)
  const [ratings, setRatings] = useState<Partial<Record<number, RatingKey>>>({})

  const progress = ((step - 1) / TOTAL_STEPS) * 100
  const remaining = TOTAL_STEPS - (step - 1)
  const currentRating = ratings[step]

  // Semana atual
  const now   = new Date()
  const start = new Date(now); start.setDate(now.getDate() - 6)
  const weekLabel = `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`

  function handleSelect(key: RatingKey) {
    setRatings(prev => ({ ...prev, [step]: key }))
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1)
    } else {
      // Concluiu — volta ao dashboard
      router.push('/dashboard')
    }
  }

  return (
    <div className="max-w-[520px] mx-auto px-4 py-6 pb-32 flex flex-col min-h-[calc(100dvh-140px)]">

      {/* Back + title */}
      <div className="flex items-center gap-2 mb-5 shrink-0">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--sl-s2)] text-[var(--sl-t2)]"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)] leading-tight">
            Revisão Semanal
          </h1>
          <p className="text-[11px] text-[var(--sl-t3)]">{weekLabel}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 shrink-0">
        <div className="h-1.5 bg-[var(--sl-s3)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#10b981,#0055ff)' }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-[var(--sl-t3)]">
            Passo {step} de {TOTAL_STEPS}
          </span>
          <span className="text-[10px] text-[var(--sl-t3)]">
            ~{remaining} {remaining === 1 ? 'minuto' : 'minutos'} restantes
          </span>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 mb-5 shrink-0 overflow-x-auto pb-1"
           style={{ scrollbarWidth: 'none' }}>
        {STEP_LABELS.map((label, i) => {
          const s = i + 1
          const done = ratings[s] !== undefined
          const active = s === step
          return (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all',
                active
                  ? 'text-white'
                  : done
                  ? 'bg-[#10b981]/15 text-[#10b981]'
                  : 'bg-[var(--sl-s2)] text-[var(--sl-t3)]',
              )}
              style={active ? { background: 'linear-gradient(135deg,#10b981,#0055ff)' } : undefined}
            >
              {done && !active ? '✓ ' : ''}{label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Pergunta */}
        <h2 className="font-[Syne] font-extrabold text-[22px] text-[var(--sl-t1)] leading-tight mb-2">
          {STEP_QUESTIONS[step - 1]}
        </h2>

        {/* Summary (só no passo 1) */}
        {step === 1 && (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 mb-4 sl-fade-up">
            <p className="text-[11px] text-[var(--sl-t3)] mb-3">
              Semana de {weekLabel}. Aqui está um resumo do que aconteceu:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FINANCIAL_SUMMARY.map((item) => (
                <div key={item.label} className="bg-[var(--sl-s2)] rounded-xl p-3">
                  <p className="text-[10px] text-[var(--sl-t3)] uppercase tracking-wide mb-0.5">
                    {item.label}
                  </p>
                  <p className={cn(
                    'text-[13px] font-semibold font-[DM_Mono]',
                    item.positive ? 'text-[#10b981]' : 'text-[var(--sl-t1)]',
                  )}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opções de rating */}
        <div className="flex flex-col gap-2 mb-6">
          {RATINGS.map((r) => {
            const selected = currentRating === r.key
            return (
              <button
                key={r.key}
                onClick={() => handleSelect(r.key)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-2xl border text-left transition-all',
                  selected
                    ? 'border-[#10b981] bg-[#10b981]/10'
                    : 'border-[var(--sl-border)] bg-[var(--sl-s1)] hover:border-[var(--sl-border-h)]',
                )}
              >
                <span className="text-2xl shrink-0">{r.emoji}</span>
                <div>
                  <p className={cn(
                    'text-[13px] font-medium',
                    selected ? 'text-[var(--sl-t1)]' : 'text-[var(--sl-t2)]',
                  )}>
                    {r.label}
                  </p>
                  {r.points && selected && (
                    <p className="text-[11px] text-[#10b981] mt-0.5">{r.points}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Botão próximo */}
      <button
        onClick={handleNext}
        disabled={!currentRating}
        className={cn(
          'w-full h-[52px] rounded-2xl text-[14px] font-bold text-white transition-all active:scale-[0.98] shrink-0',
          currentRating ? 'opacity-100' : 'opacity-40 cursor-not-allowed',
        )}
        style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
      >
        {step < TOTAL_STEPS ? 'Próxima pergunta →' : '✓ Concluir revisão'}
      </button>
    </div>
  )
}
