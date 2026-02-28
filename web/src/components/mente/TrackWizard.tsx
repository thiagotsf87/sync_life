'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrackCategory, CreateTrackData } from '@/hooks/use-mente'
import { CATEGORY_LABELS } from '@/hooks/use-mente'
import { createTransactionFromCurso } from '@/lib/integrations/financas'
import { createClient } from '@/lib/supabase/client'

interface TrackWizardProps {
  open: boolean
  onClose: () => void
  onSave: (data: CreateTrackData) => Promise<void>
  isLoading?: boolean
}

const CATEGORIES: TrackCategory[] = [
  'technology', 'languages', 'management', 'marketing', 'design',
  'finance', 'health', 'exam', 'undergraduate', 'postgraduate',
  'certification', 'other',
]

interface StepItem {
  id: string
  title: string
}

interface SkillOption { id: string; name: string }
interface ObjectiveOption { id: string; name: string }

interface FormState {
  name: string
  category: TrackCategory
  target_date: string
  cost: string
  notes: string
  steps: StepItem[]
  newStep: string
  syncToFinancas: boolean
  linked_skill_id: string | null
  linked_objective_id: string | null
}

const INITIAL: FormState = {
  name: '',
  category: 'technology',
  target_date: '',
  cost: '',
  notes: '',
  steps: [],
  newStep: '',
  syncToFinancas: false,
  linked_skill_id: null,
  linked_objective_id: null,
}

export function TrackWizard({ open, onClose, onSave, isLoading = false }: TrackWizardProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INITIAL)
  const [skills, setSkills] = useState<SkillOption[]>([])
  const [objectives, setObjectives] = useState<ObjectiveOption[]>([])

  // RN-MNT-03: carregar habilidades de Carreira para vinculação
  useEffect(() => {
    if (!open) return
    const supabase = createClient() as any
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      if (!user) return
      supabase.from('skills')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name')
        .then(({ data }: any) => { if (data) setSkills(data) })
      supabase.from('objectives')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .then(({ data }: any) => { if (data) setObjectives(data) })
    })
  }, [open])

  if (!open) return null

  const totalSteps = 3
  const canNext0 = form.name.trim().length >= 2
  const canSave = canNext0

  function handleClose() {
    setForm(INITIAL)
    setStep(0)
    onClose()
  }

  function addStep() {
    const title = form.newStep.trim()
    if (!title) return
    setForm(f => ({
      ...f,
      steps: [...f.steps, { id: `tmp-${Date.now()}`, title }],
      newStep: '',
    }))
  }

  function removeStep(id: string) {
    setForm(f => ({ ...f, steps: f.steps.filter(s => s.id !== id) }))
  }

  async function handleSave() {
    const cost = form.cost ? parseFloat(form.cost) : null
    await onSave({
      name: form.name.trim(),
      category: form.category,
      target_date: form.target_date || null,
      cost,
      notes: form.notes.trim() || null,
      steps: form.steps.map((s, i) => ({ title: s.title, sort_order: i })),
      linked_skill_id: form.linked_skill_id || null,
      linked_objective_id: form.linked_objective_id || null,
    })
    // RN-MNT-09: registrar custo em Finanças se opt-in
    if (form.syncToFinancas && cost && cost > 0) {
      await createTransactionFromCurso({
        trackName: form.name.trim(),
        cost,
        enrollmentDate: new Date().toISOString().split('T')[0],
      }).catch(() => {})
    }
    setForm(INITIAL)
    setStep(0)
  }

  const stepLabels = ['Básico', 'Etapas', 'Detalhes']

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[480px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
          <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Nova Trilha</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[var(--sl-s2)] transition-colors">
            <X size={16} className="text-[var(--sl-t2)]" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 px-5 pt-4 pb-2">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="h-0.5 w-full rounded-full transition-all duration-300"
                  style={{ background: i <= step ? '#a855f7' : 'var(--sl-s3)' }}
                />
                <span className={cn(
                  'text-[9px] font-bold uppercase tracking-wider transition-colors',
                  i <= step ? 'text-[#a855f7]' : 'text-[var(--sl-t3)]'
                )}>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-5 py-3 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">

          {/* Step 0 — Basic info */}
          {step === 0 && (
            <>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                  Nome da Trilha *
                </label>
                <input
                  autoFocus
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: React Avançado, Inglês B2, Python..."
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] font-medium
                             bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                             placeholder:text-[var(--sl-t3)] outline-none focus:border-[#a855f7] transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                  Categoria
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setForm(f => ({ ...f, category: cat }))}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1.5 rounded-[8px] text-[11px] transition-all border text-left',
                        form.category === cat
                          ? 'border-[#a855f7] bg-[#a855f7]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 1 — Steps */}
          {step === 1 && (
            <>
              <p className="text-[12px] text-[var(--sl-t2)]">
                Adicione as etapas (módulos, capítulos, tarefas) da trilha. Opcional — você pode adicionar depois.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.newStep}
                  onChange={e => setForm(f => ({ ...f, newStep: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addStep()}
                  placeholder="Nome da etapa..."
                  className="flex-1 px-3 py-2 rounded-[10px] text-[13px]
                             bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                             placeholder:text-[var(--sl-t3)] outline-none focus:border-[#a855f7] transition-colors"
                />
                <button
                  onClick={addStep}
                  className="px-3 py-2 rounded-[10px] bg-[#a855f7] text-white hover:opacity-90 transition-opacity"
                >
                  <Plus size={16} />
                </button>
              </div>

              {form.steps.length === 0 ? (
                <p className="text-[11px] text-[var(--sl-t3)] text-center py-4">
                  Nenhuma etapa adicionada ainda.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {form.steps.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[8px] px-3 py-2">
                      <GripVertical size={12} className="text-[var(--sl-t3)] shrink-0" />
                      <span className="text-[11px] text-[var(--sl-t3)] w-4 shrink-0">{i + 1}.</span>
                      <span className="text-[13px] text-[var(--sl-t1)] flex-1">{s.title}</span>
                      <button onClick={() => removeStep(s.id)} className="p-1 rounded hover:bg-[rgba(244,63,94,0.1)]">
                        <Trash2 size={13} className="text-[var(--sl-t3)]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                    Prazo (opcional)
                  </label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-[10px] text-[13px]
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               outline-none focus:border-[#a855f7] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                    Custo (opcional)
                  </label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                    placeholder="R$ 0,00"
                    min="0"
                    className="w-full px-3 py-2 rounded-[10px] text-[13px]
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               placeholder:text-[var(--sl-t3)] outline-none focus:border-[#a855f7] transition-colors"
                  />
                </div>
              </div>

              {/* RN-MNT-03: Vincular habilidade de Carreira */}
              {skills.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                    Habilidade vinculada (Carreira)
                  </label>
                  <select
                    value={form.linked_skill_id ?? ''}
                    onChange={e => setForm(f => ({ ...f, linked_skill_id: e.target.value || null }))}
                    className="w-full px-3 py-2 rounded-[10px] text-[13px]
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               outline-none focus:border-[#a855f7] transition-colors"
                  >
                    <option value="">Nenhuma</option>
                    {skills.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[var(--sl-t3)] mt-1">Ao concluir a trilha, você será lembrado de atualizar o nível.</p>
                </div>
              )}

              {/* RN-MNT-04: Vincular trilha a objetivo do Futuro */}
              {objectives.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                    Objetivo vinculado (Futuro)
                  </label>
                  <select
                    value={form.linked_objective_id ?? ''}
                    onChange={e => setForm(f => ({ ...f, linked_objective_id: e.target.value || null }))}
                    className="w-full px-3 py-2 rounded-[10px] text-[13px]
                               bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                               outline-none focus:border-[#a855f7] transition-colors"
                  >
                    <option value="">Nenhum</option>
                    {objectives.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[var(--sl-t3)] mt-1">Ao marcar etapas, o progresso da meta no Futuro será sincronizado.</p>
                </div>
              )}

              {/* RN-MNT-09: Sync to Finanças */}
              {form.cost && parseFloat(form.cost) > 0 && (
                <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={form.syncToFinancas}
                    onChange={e => setForm(f => ({ ...f, syncToFinancas: e.target.checked }))}
                    className="accent-[#a855f7] w-3.5 h-3.5"
                  />
                  <span className="text-[12px] text-[var(--sl-t2)]">
                    Registrar custo em Finanças
                  </span>
                </label>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                  Notas (opcional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Motivação, links úteis, observações..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-[10px] text-[13px] resize-none
                             bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                             placeholder:text-[var(--sl-t3)] outline-none focus:border-[#a855f7] transition-colors"
                />
              </div>

              {/* Preview */}
              <div className="bg-[var(--sl-s2)] border border-[#a855f7]/30 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#a855f7] mb-1.5">Resumo</p>
                <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{form.name}</p>
                <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
                  {CATEGORY_LABELS[form.category]} · {form.steps.length} etapas
                  {form.target_date && ` · Até ${new Date(form.target_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--sl-border)]">
          <button
            onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}
            className="px-4 py-2 rounded-[10px] text-[13px] font-medium text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
          >
            {step === 0 ? 'Cancelar' : '← Voltar'}
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 && !canNext0}
              className={cn(
                'px-5 py-2 rounded-[10px] text-[13px] font-semibold transition-all',
                step === 0 && !canNext0
                  ? 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
                  : 'bg-[#a855f7] text-white hover:opacity-90'
              )}
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isLoading || !canSave}
              className={cn(
                'px-5 py-2 rounded-[10px] text-[13px] font-semibold transition-all',
                canSave && !isLoading
                  ? 'bg-[#a855f7] text-white hover:opacity-90'
                  : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
              )}
            >
              {isLoading ? 'Criando...' : 'Criar Trilha'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
