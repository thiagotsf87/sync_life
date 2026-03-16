'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import { ArrowLeft, Target, ChevronRight, ChevronLeft, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateObjective } from '@/hooks/use-futuro'
import { CATEGORY_LABELS, type ObjectiveCategory, type ObjectivePriority, type CreateObjectiveData } from '@/hooks/use-futuro'
import { ModuleHeader } from '@/components/ui/module-header'
import { createEventFromObjective } from '@/lib/integrations/agenda'

// ─── Constants ────────────────────────────────────────────────────────────────

const ICONS = ['🎯', '🏠', '✈️', '💰', '💪', '📚', '💼', '❤️', '🌟', '🚀', '🏆', '🧠']

const CATEGORY_OPTIONS: { value: ObjectiveCategory; icon: string; label: string; desc: string }[] = [
  { value: 'financial', icon: '💰', label: 'Financeiro', desc: 'Poupanca, investimento' },
  { value: 'educational', icon: '📚', label: 'Educacao', desc: 'Cursos, idiomas' },
  { value: 'experience', icon: '✈️', label: 'Experiencia', desc: 'Viagens, eventos' },
  { value: 'health', icon: '💪', label: 'Saude', desc: 'Peso, exercicio' },
  { value: 'professional', icon: '💼', label: 'Carreira', desc: 'Promocao, habilidade' },
  { value: 'personal', icon: '🌟', label: 'Pessoal', desc: 'Leitura, meditacao' },
  { value: 'other', icon: '🎯', label: 'Outro', desc: 'Outros objetivos' },
]

const PRIORITY_OPTIONS: { value: ObjectivePriority; label: string; color: string; desc: string }[] = [
  { value: 'high', label: 'Alta', color: '#f43f5e', desc: 'Foco principal agora' },
  { value: 'medium', label: 'Media', color: '#f59e0b', desc: 'Importante, nao urgente' },
  { value: 'low', label: 'Baixa', color: '#06b6d4', desc: 'Quando der, futuramente' },
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NovoObjetivoPage() {
  const router = useRouter()
  const createObjective = useCreateObjective()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)

  const STEPS = [
    { label: 'Informacoes Basicas' },
    { label: 'Categoria & Icone' },
    { label: 'Metas & Prazos' },
    { label: 'Resumo' },
  ]

  const canNext = step === 0 ? form.name.trim().length >= 3 : true

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

    setIsLoading(true)
    try {
      await createObjective({
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

      toast.success(`Objetivo "${form.name}" criado!`)
      router.push('/futuro')
    } catch {
      toast.error('Erro ao criar objetivo')
      setIsLoading(false)
    }
  }

  // Calculate monthly needed for preview
  const monthsLeft = form.target_date
    ? Math.max(1, Math.ceil((new Date(form.target_date + 'T00:00:00').getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)))
    : 12
  const previewDeadline = form.target_date
    ? new Date(form.target_date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    : '\u2014'

  return (
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* Back + Title */}
      <div className="flex items-center gap-[14px] mb-7 sl-fade-up">
        <button
          onClick={() => router.push('/futuro')}
          className="inline-flex items-center gap-[6px] px-[14px] py-[7px] rounded-[10px]
                     border border-[var(--sl-border)] text-[var(--sl-t2)] text-[12px] font-medium
                     hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
        >
          <ArrowLeft size={15} />
          Voltar
        </button>
        <h1 className="font-[Syne] font-extrabold text-[24px] text-[var(--sl-t1)]">Novo Objetivo</h1>
      </div>

      {/* ── Two-column wizard layout ── */}
      <div className="grid grid-cols-[1fr_360px] gap-7 items-start sl-fade-up sl-delay-1">

        {/* LEFT: Form */}
        <div>
          {/* Step bar — 4px blue */}
          <div className="flex gap-1 mb-6">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={cn(
                  'h-[4px] flex-1 rounded-[2px] transition-colors duration-300',
                  i <= step ? 'bg-[#0055ff]' : 'bg-[var(--sl-s3)]'
                )}
              />
            ))}
          </div>

          {/* Step 0: Info Basica */}
          {step === 0 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7">
              <h2 className="font-[Syne] font-bold text-[18px] text-[var(--sl-t1)] mb-5 flex items-center gap-2">
                <Target size={18} className="text-[#0055ff]" />
                Informacoes Basicas
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">
                    Nome do objetivo
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Comprar um apartamento"
                    maxLength={80}
                    className="w-full px-[14px] py-[10px] rounded-[10px] text-[13px]
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               placeholder:text-[var(--sl-t3)] outline-none focus:border-[rgba(0,85,255,0.5)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">
                    Descricao
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Descreva seu objetivo..."
                    rows={3}
                    className="w-full px-[14px] py-[10px] rounded-[10px] text-[13px] resize-y
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               placeholder:text-[var(--sl-t3)] outline-none focus:border-[rgba(0,85,255,0.5)] transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-5">
                <button
                  onClick={() => setStep(1)}
                  disabled={!canNext}
                  className={cn(
                    'inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold transition-all',
                    canNext
                      ? 'bg-[#0055ff] text-white hover:brightness-110 hover:-translate-y-px shadow-[0_6px_20px_rgba(0,85,255,0.15)]'
                      : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
                  )}
                >
                  Proximo
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Categoria & Icone */}
          {step === 1 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7">
              <h2 className="font-[Syne] font-bold text-[18px] text-[var(--sl-t1)] mb-5 flex items-center gap-2">
                <Target size={18} className="text-[#0055ff]" />
                Categoria & Icone
              </h2>

              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[10px]">Categoria</p>
              {/* 3-column grid */}
              <div className="grid grid-cols-3 gap-[10px] mb-5">
                {CATEGORY_OPTIONS.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className={cn(
                      'bg-[var(--sl-s2)] border rounded-[12px] p-[14px] text-center cursor-pointer transition-all',
                      form.category === cat.value
                        ? 'border-[#0055ff] bg-[rgba(0,85,255,0.08)]'
                        : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mx-auto mb-2 text-[18px]"
                      style={{ background: 'rgba(0,85,255,0.10)' }}>
                      {cat.icon}
                    </div>
                    <div className={cn(
                      'text-[12px] font-semibold',
                      form.category === cat.value ? 'text-[#0055ff]' : 'text-[var(--sl-t1)]'
                    )}>
                      {cat.label}
                    </div>
                    <div className="text-[10px] text-[var(--sl-t3)] mt-[2px]">{cat.desc}</div>
                  </button>
                ))}
              </div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[10px]">Icone</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm(f => ({ ...f, icon }))}
                    className={cn(
                      'w-[42px] h-[42px] rounded-[11px] flex items-center justify-center text-xl transition-all border',
                      form.icon === icon
                        ? 'bg-[rgba(0,85,255,0.10)] border-[#0055ff]'
                        : 'bg-[var(--sl-s2)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[10px]">Prioridade</p>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map(p => {
                  const selected = form.priority === p.value
                  return (
                    <button
                      key={p.value}
                      onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                      className={cn(
                        'px-[14px] py-[6px] rounded-[9px] text-[12px] font-semibold border flex items-center gap-[5px] transition-all',
                        selected
                          ? ''
                          : 'border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                      style={selected ? {
                        borderColor: p.color,
                        background: `${p.color}10`,
                        color: p.color,
                      } : undefined}
                    >
                      <div className="w-[8px] h-[8px] rounded-full" style={{ background: p.color }} />
                      {p.label}
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(0)}
                  className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                             border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
                >
                  <ChevronLeft size={16} />
                  Voltar
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                             bg-[#0055ff] text-white hover:brightness-110 hover:-translate-y-px shadow-[0_6px_20px_rgba(0,85,255,0.15)] transition-all"
                >
                  Proximo
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Metas & Prazos */}
          {step === 2 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7">
              <h2 className="font-[Syne] font-bold text-[18px] text-[var(--sl-t1)] mb-5 flex items-center gap-2">
                <Target size={18} className="text-[#0055ff]" />
                Metas & Prazos
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">
                    Data Inicio
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-[14px] py-[10px] rounded-[10px] text-[13px] font-[DM_Mono]
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               outline-none focus:border-[rgba(0,85,255,0.5)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">
                    Data Limite
                  </label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-[14px] py-[10px] rounded-[10px] text-[13px] font-[DM_Mono]
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               outline-none focus:border-[rgba(0,85,255,0.5)] transition-colors"
                  />
                </div>
              </div>
              {form.target_date && (
                <div className="mb-4">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[6px] block">
                    Por que esta data? (opcional)
                  </label>
                  <input
                    type="text"
                    value={form.target_date_reason}
                    onChange={e => setForm(f => ({ ...f, target_date_reason: e.target.value }))}
                    placeholder="Ex: Quero realizar antes dos 35 anos"
                    className="w-full px-[14px] py-[10px] rounded-[10px] text-[13px]
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               placeholder:text-[var(--sl-t3)] outline-none focus:border-[rgba(0,85,255,0.5)] transition-colors"
                  />
                </div>
              )}
              {/* RN-FUT-35: Sync to Agenda toggle */}
              {form.target_date && (
                <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-[10px] hover:bg-[var(--sl-s2)] transition-colors -mx-1 mb-2">
                  <input
                    type="checkbox"
                    checked={form.syncToAgenda}
                    onChange={e => setForm(f => ({ ...f, syncToAgenda: e.target.checked }))}
                    className="accent-[#0055ff] w-3.5 h-3.5 shrink-0"
                  />
                  <span className="text-[12px] text-[var(--sl-t2)]">
                    Criar lembrete na Agenda no dia do prazo
                  </span>
                </label>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                             border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
                >
                  <ChevronLeft size={16} />
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                             bg-[#0055ff] text-white hover:brightness-110 hover:-translate-y-px shadow-[0_6px_20px_rgba(0,85,255,0.15)] transition-all"
                >
                  Proximo
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Resumo */}
          {step === 3 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7">
              <h2 className="font-[Syne] font-bold text-[18px] text-[var(--sl-t1)] mb-5 flex items-center gap-2">
                <Target size={18} className="text-[#0055ff]" />
                Resumo do Objetivo
              </h2>

              <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[14px] p-5 mb-5">
                <div className="flex items-center gap-[14px] mb-[14px]">
                  <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center text-[22px]"
                    style={{ background: 'rgba(0,85,255,0.10)' }}>
                    {form.icon}
                  </div>
                  <div>
                    <div className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]">{form.name || 'Sem nome'}</div>
                    <div className="text-[11px] text-[var(--sl-t3)] mt-[2px]">
                      {CATEGORY_LABELS[form.category]} &middot; Prioridade {PRIORITY_OPTIONS.find(p => p.value === form.priority)?.label}
                    </div>
                  </div>
                </div>
                {form.description && (
                  <div className="text-[12px] text-[var(--sl-t2)] leading-[1.6] mb-[14px]">
                    {form.description}
                  </div>
                )}
                <div className="flex gap-0 pt-[14px] border-t border-[var(--sl-border)]">
                  <div className="flex-1 text-center">
                    <div className="text-[14px] font-medium text-[var(--sl-t1)]">{previewDeadline}</div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mt-[3px]">Prazo</div>
                  </div>
                  <div className="flex-1 text-center border-l border-[var(--sl-border)]">
                    <div className="text-[14px] font-medium text-[var(--sl-t1)]">{form.priority === 'high' ? 'Alta' : form.priority === 'medium' ? 'Media' : 'Baixa'}</div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mt-[3px]">Prioridade</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                             border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
                >
                  <ChevronLeft size={16} />
                  Voltar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !form.name.trim()}
                  className={cn(
                    'inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold transition-all',
                    !isLoading && form.name.trim()
                      ? 'bg-[#0055ff] text-white hover:brightness-110 hover:-translate-y-px shadow-[0_6px_20px_rgba(0,85,255,0.15)]'
                      : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
                  )}
                >
                  {isLoading ? 'Criando...' : 'Criar Objetivo'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Live Preview (sticky) */}
        <div className="sticky top-9">
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6
                          hover:border-[var(--sl-border-h)] transition-colors">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mb-4 flex items-center gap-[6px]">
              <Eye size={14} className="text-[var(--sl-t3)]" />
              Preview ao Vivo
            </div>

            {/* Preview card */}
            <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[14px] p-5 relative overflow-hidden">
              {/* Accent bar */}
              <div className="absolute top-0 left-5 right-5 h-[2px] rounded-b-sm bg-[#f59e0b]" />

              <div className="flex items-center gap-3 mb-[14px]">
                <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center text-[22px]"
                  style={{ background: 'rgba(0,85,255,0.10)' }}>
                  {form.icon}
                </div>
                <div>
                  <div className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]">
                    {form.name || 'Nome do objetivo'}
                  </div>
                  <div className="text-[11px] text-[var(--sl-t3)] mt-[2px]">
                    {CATEGORY_LABELS[form.category]} &middot; Prioridade {PRIORITY_OPTIONS.find(p => p.value === form.priority)?.label}
                  </div>
                </div>
              </div>

              {form.description && (
                <div className="text-[12px] text-[var(--sl-t2)] leading-[1.55] mb-3">
                  {form.description}
                </div>
              )}

              {/* Preview metrics */}
              <div className="flex gap-0 mt-[14px] pt-[14px] border-t border-[var(--sl-border)]">
                <div className="flex-1 text-center">
                  <div className="font-[DM_Mono] text-[15px] font-medium text-[#0055ff]">0%</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mt-[3px]">Progresso</div>
                </div>
                <div className="flex-1 text-center border-l border-r border-[var(--sl-border)]">
                  <div className="text-[14px] font-medium text-[var(--sl-t1)]">{previewDeadline}</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mt-[3px]">Prazo</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="font-[DM_Mono] text-[15px] font-medium text-[#10b981]">0</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mt-[3px]">Metas</div>
                </div>
              </div>
            </div>

            {/* Projection placeholder */}
            <div className="mt-[18px] p-4 bg-[var(--sl-s2)] rounded-[12px]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-[10px]">Projecao</div>
              <div className="border border-dashed border-[var(--sl-border)] rounded-[12px] p-5 flex items-center justify-center text-[var(--sl-t3)] text-[12px] min-h-[100px]"
                style={{ background: 'rgba(120,165,220,0.015)' }}>
                {form.target_date
                  ? `Projecao ate ${previewDeadline}`
                  : 'Defina um prazo para ver a projecao'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
