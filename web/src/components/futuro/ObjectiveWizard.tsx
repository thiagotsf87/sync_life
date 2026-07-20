'use client'

import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Target, Calendar, Type, Flag, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { TextField } from '@/components/ui/text-field'
import type { ObjectiveCategory, ObjectivePriority, CreateObjectiveData } from '@/hooks/use-futuro'
import { CATEGORY_LABELS } from '@/hooks/use-futuro'
import { createEventFromObjective } from '@/lib/integrations/agenda'

interface ObjectiveWizardProps {
  open: boolean
  onClose: () => void
  onSave: (data: CreateObjectiveData) => Promise<void>
  isLoading?: boolean
}

const ICONS = ['🎯', '🏠', '✈️', '💰', '💪', '📚', '💼', '❤️', '🌟', '🚀', '🏆', '🧠']

// Cor do módulo Futuro (identificação)
const MOD_FUTURO = '#8B7BD4'

const CATEGORY_OPTIONS: { value: ObjectiveCategory; icon: string; label: string }[] = [
  { value: 'financial',    icon: '💰', label: 'Financeiro' },
  { value: 'health',       icon: '💪', label: 'Saúde' },
  { value: 'professional', icon: '💼', label: 'Carreira' },
  { value: 'educational',  icon: '📚', label: 'Educação' },
  { value: 'experience',   icon: '✈️', label: 'Experiências' },
  { value: 'personal',     icon: '🌟', label: 'Pessoal' },
  { value: 'other',        icon: '🎯', label: 'Outro' },
]

// RN-FUT-09/41: hints de módulo por categoria
const CATEGORY_TIPS: Partial<Record<ObjectiveCategory, string>> = {
  financial: 'Módulo Finanças ativo? Receitas e despesas poderão alimentar este objetivo.',
  health: 'Módulo Corpo ativo? Atividades físicas e consultas conectam-se automaticamente.',
  professional: 'Módulo Carreira ativo? Roadmaps e histórico salarial alimentarão este objetivo.',
  educational: 'Dica: vincule uma trilha de aprendizado no Mente para acompanhar o progresso.',
  experience: 'Módulo Experiências ativo? Viagens planejadas conectam-se a este objetivo.',
}

const PRIORITY_OPTIONS: { value: ObjectivePriority; label: string; color: string; desc: string }[] = [
  { value: 'high',   label: 'Alta',  color: 'var(--sl-danger)',  desc: 'Foco principal agora' },
  { value: 'medium', label: 'Média', color: 'var(--sl-warning)', desc: 'Importante, não urgente' },
  { value: 'low',    label: 'Baixa', color: 'var(--sl-info)',    desc: 'Quando der, futuramente' },
]

interface FormState {
  name: string
  description: string
  icon: string
  category: ObjectiveCategory
  priority: ObjectivePriority
  target_date: string
  target_date_reason: string
  syncToAgenda: boolean
}

const INITIAL_FORM: FormState = {
  name: '',
  description: '',
  icon: '🎯',
  category: 'personal',
  priority: 'medium',
  target_date: '',
  target_date_reason: '',
  syncToAgenda: false,
}

export function ObjectiveWizard({ open, onClose, onSave, isLoading = false }: ObjectiveWizardProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)

  if (!open) return null

  const steps = [
    { label: 'O sonho', icon: Target },
    { label: 'Categoria', icon: Type },
    { label: 'Prioridade', icon: Flag },
    { label: 'Prazo', icon: Calendar },
  ]

  function handleClose() {
    setForm(INITIAL_FORM)
    setStep(0)
    onClose()
  }

  async function handleSave() {
    // RN-FUT-15: Data alvo deve ser futura
    if (form.target_date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selected = new Date(form.target_date + 'T00:00:00')
      if (selected <= today) {
        toast.error('A data alvo deve ser uma data futura.')
        return
      }
    }

    await onSave({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      icon: form.icon,
      category: form.category,
      priority: form.priority,
      target_date: form.target_date || null,
      target_date_reason: form.target_date_reason.trim() || undefined,
    })

    // RN-FUT-35: criar lembrete na Agenda no dia do prazo
    if (form.syncToAgenda && form.target_date) {
      createEventFromObjective({
        objectiveName: form.name.trim(),
        targetDate: form.target_date,
      }).catch(() => {})
    }

    setForm(INITIAL_FORM)
    setStep(0)
  }

  const canNext = step === 0 ? form.name.trim().length >= 3 : true

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[480px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
          <div>
            <div className="flex items-center gap-2">
              <Target size={16} style={{ color: MOD_FUTURO }} />
              <h2 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]">
                Novo objetivo
              </h2>
            </div>
            <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
              Passo {step + 1} de {steps.length} · {steps[step].label}
            </p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[var(--sl-s2)] transition-colors" aria-label="Fechar">
            <X size={18} className="text-[var(--sl-t2)]" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 px-5 pt-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className={cn(
                'h-[3px] flex-1 rounded-full transition-colors duration-300',
                i <= step ? 'bg-[var(--sl-em)]' : 'bg-[var(--sl-s3)]'
              )}
            />
          ))}
        </div>

        {/* Body */}
        <div className="px-5 py-5 min-h-[280px]">

          {/* Step 0: Name + icon */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <TextField
                label="Qual é o seu objetivo?"
                autoFocus
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Comprar minha casa própria"
                maxLength={80}
                hint={`${form.name.length}/80`}
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5 block">
                  Ícone
                </span>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={cn(
                        'w-9 h-9 flex items-center justify-center rounded-lg text-xl transition-all border',
                        form.icon === icon
                          ? 'bg-[var(--sl-em-soft)] border-[var(--sl-em)]'
                          : 'bg-[var(--sl-s2)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                  Descrição (opcional)
                </span>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Por que este objetivo é importante para você?"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px]
                             bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                             placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-em)] transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 1: Category */}
          {step === 1 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-3 block">
                Qual área da vida este objetivo pertence?
              </span>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-3 rounded-[12px] text-left transition-all border',
                      form.category === cat.value
                        ? 'border-[var(--sl-em)] bg-[var(--sl-em-soft)]'
                        : 'border-[var(--sl-border)] bg-[var(--sl-s2)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[13px] font-medium text-[var(--sl-t1)]">{cat.label}</span>
                  </button>
                ))}
              </div>
              {/* RN-FUT-09/41: module hint for selected category */}
              {CATEGORY_TIPS[form.category] && (
                <div className="mt-3 p-3 bg-[var(--sl-em-soft)] border border-[var(--sl-border-em)] rounded-[10px] flex items-start gap-2">
                  <Lightbulb size={14} className="text-[var(--sl-em)] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[var(--sl-t2)]">{CATEGORY_TIPS[form.category]}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Priority */}
          {step === 2 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-3 block">
                Qual é a prioridade deste objetivo?
              </span>
              <div className="flex flex-col gap-2">
                {PRIORITY_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-all border',
                      form.priority === p.value
                        ? 'border-[var(--sl-em)] bg-[var(--sl-em-soft)]'
                        : 'border-[var(--sl-border)] bg-[var(--sl-s2)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
                    <div>
                      <span className="text-[13px] font-semibold text-[var(--sl-t1)]">{p.label}</span>
                      <p className="text-[11px] text-[var(--sl-t3)]">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Deadline */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                  Prazo (opcional)
                </span>
                <input
                  type="date"
                  value={form.target_date}
                  onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px]
                             bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                             outline-none focus:border-[var(--sl-border-em)] transition-colors font-[IBM_Plex_Mono]"
                />
              </div>
              {form.target_date && (
                <TextField
                  label="Por que esta data? (opcional)"
                  value={form.target_date_reason}
                  onChange={e => setForm(f => ({ ...f, target_date_reason: e.target.value }))}
                  placeholder="Ex: Quero realizar antes dos 35 anos"
                />
              )}
              {/* RN-FUT-35: Sync to Agenda toggle */}
              {form.target_date && (
                <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-[10px] hover:bg-[var(--sl-s2)] transition-colors -mx-1">
                  <input
                    type="checkbox"
                    checked={form.syncToAgenda}
                    onChange={e => setForm(f => ({ ...f, syncToAgenda: e.target.checked }))}
                    className="accent-[var(--sl-em)] w-3.5 h-3.5 shrink-0"
                  />
                  <span className="text-[12px] text-[var(--sl-t2)] inline-flex items-center gap-1.5">
                    <Calendar size={12} />
                    Criar lembrete na agenda no dia do prazo
                  </span>
                </label>
              )}

              {/* Preview */}
              <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[14px] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-2">Resumo</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{form.icon}</span>
                  <div>
                    <p className="text-[14px] font-bold text-[var(--sl-t1)]">{form.name}</p>
                    <p className="text-[11px] text-[var(--sl-t3)]">
                      {CATEGORY_LABELS[form.category]} · Prioridade{' '}
                      {PRIORITY_OPTIONS.find(p => p.value === form.priority)?.label}
                      {form.target_date && ` · Prazo: ${new Date(form.target_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--sl-border)]">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-medium
                         text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
            >
              <ChevronLeft size={16} />
              Voltar
            </button>
          ) : (
            <div />
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext}
              className={cn(
                'flex items-center gap-1.5 px-5 py-2 rounded-[10px] text-[13px] font-semibold transition-all',
                canNext
                  ? 'text-white hover:opacity-90'
                  : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
              )}
              style={canNext ? { background: 'var(--sl-em)' } : undefined}
            >
              Próximo
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isLoading || !form.name.trim()}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-[10px] text-[13px] font-semibold transition-all',
                !isLoading && form.name.trim()
                  ? 'text-white hover:opacity-90'
                  : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
              )}
              style={!isLoading && form.name.trim() ? { background: 'var(--sl-em)' } : undefined}
            >
              {isLoading ? 'Criando...' : 'Criar objetivo'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
