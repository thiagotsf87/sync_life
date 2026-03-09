'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { TrackCategory, CreateTrackData } from '@/hooks/use-mente'
import { CATEGORY_LABELS } from '@/hooks/use-mente'
import { useObjectives } from '@/hooks/use-futuro'

const MENTE_COLOR = '#eab308'
const MENTE_BG = 'rgba(234,179,8,0.14)'
const MENTE_BORDER = 'rgba(234,179,8,0.3)'
const FREE_TRACK_LIMIT = 3

interface StepInput {
  id: string
  title: string
}

interface MenteTrackWizardMobileProps {
  open: boolean
  existingTrackCount: number
  onClose: () => void
  onSave: (data: CreateTrackData) => Promise<void>
}

export function MenteTrackWizardMobile({
  open,
  existingTrackCount,
  onClose,
  onSave,
}: MenteTrackWizardMobileProps) {
  const { objectives } = useObjectives()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<TrackCategory>('technology')
  const [stepInputs, setStepInputs] = useState<StepInput[]>([{ id: '1', title: '' }])
  const [targetDate, setTargetDate] = useState('')
  const [linkedObjectiveId, setLinkedObjectiveId] = useState<string>('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  function resetForm() {
    setStep(1)
    setName('')
    setCategory('technology')
    setStepInputs([{ id: '1', title: '' }])
    setTargetDate('')
    setLinkedObjectiveId('')
    setSaving(false)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function addStepInput() {
    setStepInputs((prev) => [
      ...prev,
      { id: String(Date.now()), title: '' },
    ])
  }

  function removeStepInput(id: string) {
    setStepInputs((prev) => prev.filter((s) => s.id !== id))
  }

  function updateStepTitle(id: string, title: string) {
    setStepInputs((prev) => prev.map((s) => s.id === id ? { ...s, title } : s))
  }

  async function handleSave() {
    setSaving(true)
    const validSteps = stepInputs
      .filter((s) => s.title.trim())
      .map((s, i) => ({ title: s.title.trim(), sort_order: i }))

    await onSave({
      name: name.trim(),
      category,
      target_date: targetDate || null,
      linked_objective_id: linkedObjectiveId || null,
      steps: validSteps,
    })
    resetForm()
  }

  const progressPct = (step / 3) * 100
  const isAtLimit = existingTrackCount >= FREE_TRACK_LIMIT

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Bottom sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] overflow-hidden"
        style={{
          background: 'var(--sl-s1)',
          border: '1px solid var(--sl-border)',
          maxHeight: '92vh',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--sl-s3)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[11px] font-medium" style={{ color: MENTE_COLOR }}>
              🧠 Nova Trilha — Passo {step} de 3
            </p>
            <h2 className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)]">
              {step === 1 ? 'Informações básicas' : step === 2 ? 'Etapas de aprendizado' : 'Prazo e objetivo'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--sl-t2)]"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 mb-4">
          <div className="h-1 rounded-full" style={{ background: 'var(--sl-s3)' }}>
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${progressPct}%`, background: MENTE_COLOR }}
            />
          </div>
        </div>

        {/* FREE limit warning */}
        {isAtLimit && step === 1 ? (
          <div className="px-5 pb-6">
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                background: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(139,92,246,0.1))',
                border: '1.5px solid rgba(245,158,11,0.3)',
              }}
            >
              <span className="text-[32px]">💎</span>
              <h3 className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)] mt-2 mb-1">
                Limite FREE atingido
              </h3>
              <p className="text-[13px] text-[var(--sl-t2)] mb-4">
                Você tem {existingTrackCount} trilhas ativas. O plano FREE permite até {FREE_TRACK_LIMIT} trilhas simultâneas.
              </p>
              <p className="text-[13px] font-medium" style={{ color: '#f59e0b' }}>
                PRO: trilhas ilimitadas + IA personalizada
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto px-5" style={{ maxHeight: '60vh' }}>
            {/* Step 1 — Name + Category */}
            {step === 1 && (
              <div className="space-y-4 pb-6">
                <div>
                  <label className="text-[12px] font-medium text-[var(--sl-t2)] block mb-1">
                    Nome da trilha *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: React Avançado"
                    className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]"
                    style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-[var(--sl-t2)] block mb-2">
                    Categoria *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(CATEGORY_LABELS) as [TrackCategory, string][]).map(([k, v]) => {
                      const selected = category === k
                      const [emoji, ...textParts] = v.split(' ')
                      const label = textParts.join(' ')
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setCategory(k)}
                          className="rounded-[12px] p-3 flex flex-col items-center gap-1 transition-colors"
                          style={{
                            background: selected ? MENTE_BG : 'var(--sl-s2)',
                            border: selected ? `1.5px solid ${MENTE_COLOR}` : '1px solid var(--sl-border)',
                          }}
                        >
                          <span className="text-[22px]">{emoji}</span>
                          <span className="text-[11px] font-medium leading-tight text-center text-[var(--sl-t1)]">
                            {label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Steps */}
            {step === 2 && (
              <div className="pb-6">
                <p className="text-[12px] text-[var(--sl-t2)] mb-3">
                  Adicione as etapas que compõem sua trilha de aprendizado.
                </p>

                <div className="space-y-2">
                  {stepInputs.map((s, idx) => (
                    <div key={s.id} className="flex gap-2 items-center">
                      <span className="text-[12px] text-[var(--sl-t3)] w-5 text-right flex-shrink-0">
                        {idx + 1}.
                      </span>
                      <input
                        value={s.title}
                        onChange={(e) => updateStepTitle(s.id, e.target.value)}
                        placeholder={`Etapa ${idx + 1}`}
                        className="flex-1 rounded-[10px] px-3 py-2.5 text-[13px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]"
                        style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
                      />
                      {stepInputs.length > 1 && (
                        <button
                          onClick={() => removeStepInput(s.id)}
                          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[var(--sl-t3)] flex-shrink-0"
                          style={{ background: 'var(--sl-s2)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addStepInput}
                  className="mt-3 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: MENTE_COLOR }}
                >
                  <Plus size={15} />
                  Adicionar etapa
                </button>
              </div>
            )}

            {/* Step 3 — Date + Objective link */}
            {step === 3 && (
              <div className="space-y-4 pb-6">
                <div>
                  <label className="text-[12px] font-medium text-[var(--sl-t2)] block mb-1">
                    Prazo (opcional)
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none"
                    style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
                  />
                </div>

                {objectives.length > 0 && (
                  <div>
                    <label className="text-[12px] font-medium text-[var(--sl-t2)] block mb-1">
                      Vincular a objetivo do Futuro (opcional)
                    </label>
                    <select
                      value={linkedObjectiveId}
                      onChange={(e) => setLinkedObjectiveId(e.target.value)}
                      className="w-full rounded-[10px] px-3 py-3 text-[14px] text-[var(--sl-t1)] outline-none"
                      style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
                    >
                      <option value="">Sem vinculação</option>
                      {objectives.map((obj) => (
                        <option key={obj.id} value={obj.id}>{obj.name}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[var(--sl-t3)] mt-1">
                      O progresso desta trilha será sincronizado com o objetivo vinculado.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer buttons */}
        {!isAtLimit && (
          <div
            className="flex gap-3 px-5 py-4"
            style={{ borderTop: '1px solid var(--sl-border)' }}
          >
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 rounded-[12px] text-[14px] font-semibold text-[var(--sl-t2)]"
                style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
              >
                Voltar
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && !name.trim()}
                className="flex-1 py-3 rounded-[12px] text-[14px] font-semibold text-white disabled:opacity-50"
                style={{ background: MENTE_COLOR }}
              >
                Próximo →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex-1 py-3 rounded-[12px] text-[14px] font-semibold text-white disabled:opacity-50"
                style={{ background: MENTE_COLOR }}
              >
                {saving ? 'Criando…' : 'Criar trilha'}
              </button>
            )}
          </div>
        )}

        {isAtLimit && (
          <div className="px-5 py-4">
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-[12px] text-[14px] font-semibold text-[var(--sl-t2)]"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </>
  )
}
