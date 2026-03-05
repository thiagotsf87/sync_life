'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

interface ReviewStep {
  question: string
  context: string
  stats?: { label: string; value: string; color?: string }[]
  answers: { emoji: string; text: string; bonus?: string }[]
}

const STEPS: ReviewStep[] = [
  {
    question: 'Como foi sua semana no geral?',
    context: 'Vamos começar com uma visão geral. Pense nos últimos 7 dias como um todo.',
    answers: [
      { emoji: '🚀', text: 'Incrível! Produtiva e equilibrada', bonus: '+8 pontos no Life Score' },
      { emoji: '😊', text: 'Boa, sem grandes problemas', bonus: '+5 pontos no Life Score' },
      { emoji: '😬', text: 'Difícil, preciso ajustar rotinas' },
    ],
  },
  {
    question: 'Como foi a semana financeira?',
    context: 'Semana de 24 Fev – 1 Mar 2026. Aqui está um resumo do que aconteceu:',
    stats: [
      { label: 'Total gasto', value: 'R$ 892,40', color: '#f43f5e' },
      { label: 'vs. semana anterior', value: '-R$ 340 ↓ Menos', color: '#10b981' },
      { label: 'Categoria principal', value: '🏠 Moradia (R$ 1.200)' },
      { label: 'Orçamentos no limite', value: 'Lazer (80%)', color: '#f59e0b' },
    ],
    answers: [
      { emoji: '😊', text: 'Ótimo! Dentro do planejado', bonus: '+6 pontos no Life Score' },
      { emoji: '😐', text: 'Mais ou menos, teve um ou dois excessos' },
      { emoji: '😬', text: 'Saiu do controle, quero ajustar' },
    ],
  },
  {
    question: 'E os seus objetivos de longo prazo?',
    context: 'Você tem 3 metas ativas. Veja como andaram esta semana:',
    stats: [
      { label: 'Reserva de emergência', value: '68% → 70%', color: '#10b981' },
      { label: 'Viagem Europa', value: '42% (sem aporte)', color: '#f59e0b' },
      { label: 'Curso Python', value: '15% → 22%', color: '#10b981' },
    ],
    answers: [
      { emoji: '🎯', text: 'Avancei bem, estou motivado', bonus: '+6 pontos no Life Score' },
      { emoji: '😐', text: 'Pouco progresso, mas ok' },
      { emoji: '😴', text: 'Não pensei nisso essa semana' },
    ],
  },
  {
    question: 'Qual sua intenção para a próxima semana?',
    context: 'Definir uma intenção simples ajuda a manter o foco.',
    answers: [
      { emoji: '💰', text: 'Focar em economizar', bonus: '+4 pontos no Life Score' },
      { emoji: '📚', text: 'Dedicar tempo aos estudos', bonus: '+4 pontos no Life Score' },
      { emoji: '🏃', text: 'Melhorar hábitos de saúde', bonus: '+4 pontos no Life Score' },
    ],
  },
]

export default function WeeklyReviewPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1-indexed to match "Passo X de 4"
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const currentStep = STEPS[step - 1]
  const totalSteps = STEPS.length

  const minutesLeft = useMemo(() => {
    const remaining = totalSteps - step + 1
    return Math.max(1, remaining)
  }, [step, totalSteps])

  function handleSelect(answerIdx: number) {
    setAnswers(prev => ({ ...prev, [step]: answerIdx }))
  }

  function handleNext() {
    if (step < totalSteps) {
      setStep(s => s + 1)
    } else {
      // Review complete — go back to dashboard
      router.push('/dashboard')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--sl-bg)] flex flex-col lg:relative lg:max-w-[600px] lg:mx-auto lg:min-h-0">
      {/* Close button */}
      <div className="flex items-center justify-end px-4 pt-4 pb-2">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex h-9 w-9 items-center justify-center rounded-[10px]
                     bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t2)]"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Step indicator */}
        <div className="flex gap-1.5 justify-center mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-[2px] transition-all duration-300"
              style={{
                width: 28,
                background:
                  i + 1 < step
                    ? 'rgba(16,185,129,0.4)'
                    : i + 1 === step
                      ? '#10b981'
                      : 'var(--sl-s3)',
              }}
            />
          ))}
        </div>

        {/* Question */}
        <h1 className="font-[Syne] text-[22px] font-bold text-[var(--sl-t1)] leading-[1.3] mb-2">
          {currentStep.question}
        </h1>
        <p className="text-[13px] text-[var(--sl-t2)] leading-[1.5] mb-6">
          {currentStep.context}
        </p>

        {/* Summary card (if stats exist) */}
        {currentStep.stats && (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-4 mb-5">
            {currentStep.stats.map((stat, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2"
                style={{
                  borderBottom:
                    i < currentStep.stats!.length - 1
                      ? '1px solid var(--sl-border)'
                      : 'none',
                }}
              >
                <span className="text-[13px] text-[var(--sl-t2)]">{stat.label}</span>
                <span
                  className="font-[DM_Mono] text-[14px] font-medium"
                  style={{ color: stat.color ?? 'var(--sl-t1)' }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Answer buttons */}
        <div className="flex flex-col gap-2.5">
          {currentStep.answers.map((ans, i) => {
            const selected = answers[step] === i
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className="flex items-center gap-3 p-4 rounded-[10px] border text-left transition-all duration-150"
                style={{
                  background: selected ? 'rgba(16,185,129,0.15)' : 'var(--sl-s1)',
                  borderColor: selected ? 'rgba(16,185,129,0.4)' : 'var(--sl-border)',
                }}
              >
                <span className="text-[22px] shrink-0">{ans.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[14px] font-medium"
                    style={{ color: selected ? '#10b981' : 'var(--sl-t1)' }}
                  >
                    {ans.text}
                  </p>
                  {ans.bonus && (
                    <p className="text-[11px] text-[var(--sl-t2)] mt-0.5">{ans.bonus}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Next button */}
        <div className="mt-5">
          <button
            onClick={handleNext}
            disabled={answers[step] === undefined}
            className="w-full flex items-center justify-center h-[52px] rounded-[14px]
                       text-[15px] font-semibold text-white transition-all duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: answers[step] !== undefined
                ? 'linear-gradient(135deg, #10b981, #0055ff)'
                : 'var(--sl-s3)',
            }}
          >
            {step < totalSteps ? 'Próxima pergunta →' : 'Concluir revisão ✓'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-[var(--sl-t3)] mt-2.5">
          Passo {step} de {totalSteps} · ~{minutesLeft} {minutesLeft === 1 ? 'minuto restante' : 'minutos restantes'}
        </p>
      </div>
    </div>
  )
}
