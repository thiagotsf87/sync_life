'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import { ArrowLeft, Target, ChevronRight, ChevronLeft, Eye, Calendar, Flag, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateObjective, CATEGORY_LABELS, type ObjectiveCategory, type ObjectivePriority } from '@/hooks/use-futuro'
import { createEventFromObjective } from '@/lib/integrations/agenda'
import { TextField } from '@/components/ui/text-field'
import { SectionHeader } from '@/components/ui/section-header'

// ─── Constants ────────────────────────────────────────────────────────────────

// Cor do módulo Futuro (identificação)
const MOD_FUTURO = '#8B7BD4'
const MOD_FUTURO_SOFT = 'rgba(139,123,212,0.10)'

const ICONS = ['🎯', '🏠', '✈️', '💰', '💪', '📚', '💼', '❤️', '🌟', '🚀', '🏆', '🧠']

const CATEGORY_OPTIONS: { value: ObjectiveCategory; icon: string; label: string; desc: string }[] = [
  { value: 'financial',    icon: '💰', label: 'Financeiro',   desc: 'Poupança, investimento' },
  { value: 'educational',  icon: '📚', label: 'Educação',     desc: 'Cursos, idiomas' },
  { value: 'experience',   icon: '✈️', label: 'Experiência',  desc: 'Viagens, eventos' },
  { value: 'health',       icon: '💪', label: 'Saúde',        desc: 'Peso, exercício' },
  { value: 'professional', icon: '💼', label: 'Carreira',     desc: 'Promoção, habilidade' },
  { value: 'personal',     icon: '🌟', label: 'Pessoal',      desc: 'Leitura, meditação' },
  { value: 'other',        icon: '🎯', label: 'Outro',        desc: 'Outros objetivos' },
]

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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NovoObjetivoPage() {
  const router = useRouter()
  const createObjective = useCreateObjective()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)

  const STEPS = [
    { label: 'Informações básicas', eyebrow: '01 · IDENTIDADE' },
    { label: 'Categoria & ícone',   eyebrow: '02 · CONTEXTO' },
    { label: 'Metas & prazos',      eyebrow: '03 · PRAZO' },
    { label: 'Resumo',              eyebrow: '04 · REVISÃO' },
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

  const previewDeadline = form.target_date
    ? new Date(form.target_date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    : 'Sem prazo'

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
        <div className="flex items-center gap-3">
          <div
            className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center"
            style={{ background: MOD_FUTURO_SOFT }}
          >
            <Target size={20} style={{ color: MOD_FUTURO }} />
          </div>
          <h1 className="font-[Syne] font-extrabold text-[24px] text-[var(--sl-t1)]">Novo objetivo</h1>
        </div>
      </div>

      {/* ── Two-column wizard layout ── */}
      <div className="grid grid-cols-[1fr_360px] gap-7 items-start sl-fade-up sl-delay-1 max-lg:grid-cols-1">

        {/* LEFT: Form */}
        <div>
          {/* Step bar */}
          <div className="flex gap-1 mb-6">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className={cn(
                  'h-[4px] flex-1 rounded-[2px] transition-colors duration-300',
                  i <= step ? 'bg-[var(--sl-em)]' : 'bg-[var(--sl-s3)]'
                )}
              />
            ))}
          </div>

          {/* Step 0: Info Basica */}
          {step === 0 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7 hover:border-[var(--sl-border-h)] transition-colors">
              <SectionHeader
                eyebrow={STEPS[0].eyebrow}
                title={STEPS[0].label}
                sub="Dê um nome marcante e conte a história do seu sonho."
                className="mb-5"
              />
              <div className="flex flex-col gap-4">
                <TextField
                  label="Nome do objetivo"
                  autoFocus
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Comprar um apartamento"
                  maxLength={80}
                />
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                    Descrição
                  </span>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Descreva seu objetivo..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px] resize-y
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-em)] transition-colors"
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
                      ? 'text-white hover:opacity-90 hover:-translate-y-px'
                      : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
                  )}
                  style={canNext ? { background: 'var(--sl-em)' } : undefined}
                >
                  Próximo
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Categoria & Icone */}
          {step === 1 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7 hover:border-[var(--sl-border-h)] transition-colors">
              <SectionHeader
                eyebrow={STEPS[1].eyebrow}
                title={STEPS[1].label}
                sub="Escolha categoria, ícone e prioridade do objetivo."
                className="mb-5"
              />

              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-[10px]">Categoria</p>
              <div className="grid grid-cols-3 gap-[10px] mb-5 max-sm:grid-cols-2">
                {CATEGORY_OPTIONS.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className={cn(
                      'bg-[var(--sl-s2)] border rounded-[12px] p-[14px] text-center cursor-pointer transition-all',
                      form.category === cat.value
                        ? 'border-[var(--sl-em)] bg-[var(--sl-em-soft)]'
                        : 'border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mx-auto mb-2 text-[18px]"
                      style={{ background: MOD_FUTURO_SOFT }}>
                      {cat.icon}
                    </div>
                    <div className={cn(
                      'text-[12px] font-semibold',
                      form.category === cat.value ? 'text-[var(--sl-em)]' : 'text-[var(--sl-t1)]'
                    )}>
                      {cat.label}
                    </div>
                    <div className="text-[10px] text-[var(--sl-t3)] mt-[2px]">{cat.desc}</div>
                  </button>
                ))}
              </div>

              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-[10px]">Ícone</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm(f => ({ ...f, icon }))}
                    className={cn(
                      'w-[42px] h-[42px] rounded-[11px] flex items-center justify-center text-xl transition-all border',
                      form.icon === icon
                        ? 'bg-[var(--sl-em-soft)] border-[var(--sl-em)]'
                        : 'bg-[var(--sl-s2)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-[10px]">Prioridade</p>
              <div className="flex gap-2 max-sm:flex-col">
                {PRIORITY_OPTIONS.map(p => {
                  const selected = form.priority === p.value
                  return (
                    <button
                      key={p.value}
                      onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                      className={cn(
                        'flex-1 px-[14px] py-[8px] rounded-[9px] text-[12px] font-semibold border flex items-center gap-[8px] transition-all',
                        selected
                          ? ''
                          : 'border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                      style={selected ? {
                        borderColor: p.color,
                        background: `color-mix(in oklab, ${p.color} 10%, transparent)`,
                        color: p.color,
                      } : undefined}
                    >
                      <Flag size={12} style={{ color: p.color }} />
                      {p.label}
                      <span className="text-[10px] text-[var(--sl-t3)] font-normal ml-auto max-sm:hidden">{p.desc}</span>
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
                             text-white hover:opacity-90 hover:-translate-y-px transition-all"
                  style={{ background: 'var(--sl-em)' }}
                >
                  Próximo
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Metas & Prazos */}
          {step === 2 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7 hover:border-[var(--sl-border-h)] transition-colors">
              <SectionHeader
                eyebrow={STEPS[2].eyebrow}
                title={STEPS[2].label}
                sub="Defina início, prazo e se quer sincronizar com a Agenda."
                className="mb-5"
              />
              <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                    Data início
                  </span>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px] font-[IBM_Plex_Mono]
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               outline-none focus:border-[var(--sl-border-em)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                    Data limite
                  </span>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px] font-[IBM_Plex_Mono]
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               outline-none focus:border-[var(--sl-border-em)] transition-colors"
                  />
                </div>
              </div>
              {form.target_date && (
                <div className="mb-4">
                  <TextField
                    label="Por que esta data? (opcional)"
                    value={form.target_date_reason}
                    onChange={e => setForm(f => ({ ...f, target_date_reason: e.target.value }))}
                    placeholder="Ex: Quero realizar antes dos 35 anos"
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
                    className="accent-[var(--sl-em)] w-3.5 h-3.5 shrink-0"
                  />
                  <span className="text-[12px] text-[var(--sl-t2)] inline-flex items-center gap-1.5">
                    <Calendar size={12} />
                    Criar lembrete na agenda no dia do prazo
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
                             text-white hover:opacity-90 hover:-translate-y-px transition-all"
                  style={{ background: 'var(--sl-em)' }}
                >
                  Próximo
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Resumo */}
          {step === 3 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7 hover:border-[var(--sl-border-h)] transition-colors">
              <SectionHeader
                eyebrow={STEPS[3].eyebrow}
                title={STEPS[3].label}
                sub="Revise as informações antes de criar."
                className="mb-5"
              />

              <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[14px] p-5 mb-5">
                <div className="flex items-center gap-[14px] mb-[14px]">
                  <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center text-[22px]"
                    style={{ background: MOD_FUTURO_SOFT }}>
                    {form.icon}
                  </div>
                  <div>
                    <div className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]">{form.name || 'Sem nome'}</div>
                    <div className="text-[11px] text-[var(--sl-t3)] mt-[2px]">
                      {CATEGORY_LABELS[form.category]} · Prioridade {PRIORITY_OPTIONS.find(p => p.value === form.priority)?.label}
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
                    <div className="sl-num text-[14px] text-[var(--sl-t1)]">{previewDeadline}</div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mt-[3px]">Prazo</div>
                  </div>
                  <div className="flex-1 text-center border-l border-[var(--sl-border)]">
                    <div className="text-[14px] font-medium text-[var(--sl-t1)]">{form.priority === 'high' ? 'Alta' : form.priority === 'medium' ? 'Média' : 'Baixa'}</div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mt-[3px]">Prioridade</div>
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
                      ? 'text-white hover:opacity-90 hover:-translate-y-px'
                      : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
                  )}
                  style={!isLoading && form.name.trim() ? { background: 'var(--sl-em)' } : undefined}
                >
                  {isLoading ? 'Criando...' : 'Criar objetivo'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Live Preview (sticky) */}
        <div className="sticky top-9 max-lg:static">
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6
                          hover:border-[var(--sl-border-h)] transition-colors">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-em)] mb-4 flex items-center gap-[6px]">
              <Eye size={14} className="text-[var(--sl-em)]" />
              Preview ao vivo
            </div>

            {/* Preview card */}
            <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[14px] p-5 relative overflow-hidden">
              <div className="absolute top-0 left-5 right-5 h-[2px] rounded-b-sm" style={{ background: MOD_FUTURO }} />

              <div className="flex items-center gap-3 mb-[14px]">
                <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center text-[22px]"
                  style={{ background: MOD_FUTURO_SOFT }}>
                  {form.icon}
                </div>
                <div>
                  <div className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]">
                    {form.name || 'Nome do objetivo'}
                  </div>
                  <div className="text-[11px] text-[var(--sl-t3)] mt-[2px]">
                    {CATEGORY_LABELS[form.category]} · Prioridade {PRIORITY_OPTIONS.find(p => p.value === form.priority)?.label}
                  </div>
                </div>
              </div>

              {form.description && (
                <div className="text-[12px] text-[var(--sl-t2)] leading-[1.55] mb-3">
                  {form.description}
                </div>
              )}

              <div className="flex gap-0 mt-[14px] pt-[14px] border-t border-[var(--sl-border)]">
                <div className="flex-1 text-center">
                  <div className="sl-num-strong text-[15px] text-[var(--sl-em)]">0%</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mt-[3px]">Progresso</div>
                </div>
                <div className="flex-1 text-center border-l border-r border-[var(--sl-border)]">
                  <div className="sl-num text-[14px] text-[var(--sl-t1)]">{previewDeadline}</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mt-[3px]">Prazo</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="sl-num-strong text-[15px] text-[var(--sl-em)]">0</div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mt-[3px]">Metas</div>
                </div>
              </div>
            </div>

            <div className="mt-[18px] p-4 bg-[var(--sl-s2)] rounded-[12px]">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-[10px] flex items-center gap-1.5">
                <Sparkles size={12} style={{ color: MOD_FUTURO }} />
                Projeção
              </div>
              <div className="border border-dashed border-[var(--sl-border)] rounded-[12px] p-5 flex items-center justify-center text-[var(--sl-t3)] text-[12px] min-h-[100px] text-center">
                {form.target_date
                  ? `Projeção até ${previewDeadline}`
                  : 'Defina um prazo para ver a projeção'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
