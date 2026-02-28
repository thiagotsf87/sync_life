'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import {
  useCareerRoadmaps, useCreateRoadmap, useUpdateRoadmapStep, useDeleteRoadmap,
  type CreateRoadmapData, type StepStatus,
} from '@/hooks/use-carreira'
import { RoadmapTimeline } from '@/components/carreira/RoadmapTimeline'
import { useUserPlan } from '@/hooks/use-user-plan'
import { checkPlanLimit } from '@/lib/plan-limits'

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  completed: 'Concluído',
  paused: 'Pausado',
  abandoned: 'Abandonado',
}

const STATUS_COLORS: Record<string, string> = {
  active: '#f59e0b',
  completed: '#10b981',
  paused: '#6e90b8',
  abandoned: '#f43f5e',
}

interface StepDraft {
  id: string
  title: string
  target_date: string
}

const EMPTY_FORM = {
  name: '',
  current_title: '',
  target_title: '',
  target_salary: '',
  target_date: '',
}

export default function RoadmapPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { roadmaps, loading, error, reload } = useCareerRoadmaps()
  const createRoadmap = useCreateRoadmap()
  const updateStep = useUpdateRoadmapStep()
  const deleteRoadmap = useDeleteRoadmap()
  const { isPro } = useUserPlan()

  const activeRoadmaps = roadmaps.filter(r => r.status === 'active')

  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [steps, setSteps] = useState<StepDraft[]>([])
  const [stepInput, setStepInput] = useState('')

  function addStep() {
    const t = stepInput.trim()
    if (!t) return
    setSteps(s => [...s, { id: crypto.randomUUID(), title: t, target_date: '' }])
    setStepInput('')
  }

  function removeStep(id: string) {
    setSteps(s => s.filter(st => st.id !== id))
  }

  function updateStepTargetDate(id: string, val: string) {
    setSteps(s => s.map(st => st.id === id ? { ...st, target_date: val } : st))
  }

  async function handleCreate() {
    if (!form.name.trim() || !form.current_title.trim() || !form.target_title.trim()) {
      toast.error('Preencha Nome, Cargo Atual e Cargo Alvo')
      return
    }
    // RN-CAR-11: Limite FREE = 1 roadmap ativo
    const limitCheck = checkPlanLimit(isPro, 'active_roadmaps', activeRoadmaps.length)
    if (!limitCheck.allowed) {
      toast.error(limitCheck.upsellMessage)
      return
    }
    setIsSaving(true)
    try {
      const data: CreateRoadmapData = {
        name: form.name.trim(),
        current_title: form.current_title.trim(),
        target_title: form.target_title.trim(),
        target_salary: form.target_salary ? parseFloat(form.target_salary) : null,
        target_date: form.target_date || null,
        steps: steps.map((s, i) => ({
          title: s.title,
          sort_order: i,
          target_date: s.target_date || null,
        })),
      }
      await createRoadmap(data)
      toast.success('Roadmap criado!')
      setShowModal(false)
      setForm(EMPTY_FORM)
      setSteps([])
      await reload()
    } catch {
      toast.error('Erro ao criar roadmap')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este roadmap?')) return
    try {
      await deleteRoadmap(id)
      toast.success('Roadmap excluído')
      await reload()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  async function handleUpdateStep(stepId: string, roadmapId: string, status: StepStatus) {
    try {
      // RN-CAR-09: verificar antes de reload se este passo conclui o roadmap
      let willComplete = false
      if (status === 'completed') {
        const roadmap = roadmaps.find(r => r.id === roadmapId)
        const steps = roadmap?.steps ?? []
        if (steps.length > 0) {
          const remaining = steps.filter(s => s.id !== stepId && s.status !== 'completed')
          willComplete = remaining.length === 0
        }
      }

      await updateStep(stepId, roadmapId, status)
      await reload()

      if (willComplete) {
        toast.success('🎉 Roadmap concluído! Atualize seu perfil de carreira.', {
          action: { label: 'Atualizar Perfil', onClick: () => router.push('/carreira/perfil') },
          duration: 8000,
        })
      }
    } catch {
      toast.error('Erro ao atualizar passo')
    }
  }

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => router.push('/carreira')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Carreira
        </button>
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl flex-1',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          🗺 Roadmaps
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#f59e0b] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Novo Roadmap
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🗺</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Nenhum roadmap criado</h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-5">Crie seu plano de carreira com passos concretos.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#f59e0b] text-[#03071a] hover:opacity-90"
          >
            <Plus size={15} />
            Criar Roadmap
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {roadmaps.map(rm => {
            const isExpanded = expandedRoadmap === rm.id
            const color = STATUS_COLORS[rm.status] ?? '#6e90b8'
            return (
              <div key={rm.id} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
                {/* Header */}
                <button
                  onClick={() => setExpandedRoadmap(isExpanded ? null : rm.id)}
                  className="w-full flex items-center gap-3 p-5 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">{rm.name}</h3>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ color, background: color + '20' }}
                      >
                        {STATUS_LABELS[rm.status]}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--sl-t2)]">
                      {rm.current_title} → {rm.target_title}
                    </p>
                    {/* RN-CAR-10: link para simulador quando tem salário alvo */}
                    {rm.target_salary && (
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push('/financas/planejamento') }}
                        className="mt-1 text-[10px] text-[#f59e0b] hover:opacity-80 transition-opacity"
                      >
                        💰 {rm.target_salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} alvo → Ver no Simulador →
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="font-[DM_Mono] text-[15px] font-bold" style={{ color }}>{Math.round(rm.progress)}%</p>
                      <div className="w-20 bg-[var(--sl-s3)] rounded-full overflow-hidden mt-1" style={{ height: '3px' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(rm.progress, 100)}%`, background: color }} />
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(rm.id) }}
                      className="p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.1)] transition-colors"
                    >
                      <Trash2 size={14} className="text-[var(--sl-t3)]" />
                    </button>
                    {isExpanded ? <ChevronUp size={16} className="text-[var(--sl-t3)]" /> : <ChevronDown size={16} className="text-[var(--sl-t3)]" />}
                  </div>
                </button>

                {/* Expanded: Timeline */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[var(--sl-border)] pt-4">
                    <RoadmapTimeline roadmap={rm} onUpdateStep={handleUpdateStep} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[580px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">🗺 Novo Roadmap</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors text-xl leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">

              {/* Basic info */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Nome do Roadmap</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Plano para Engenheiro Sênior"
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Cargo Atual</label>
                  <input
                    type="text"
                    value={form.current_title}
                    onChange={e => setForm(f => ({ ...f, current_title: e.target.value }))}
                    placeholder="Ex: Dev Pleno"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Cargo Alvo</label>
                  <input
                    type="text"
                    value={form.target_title}
                    onChange={e => setForm(f => ({ ...f, target_title: e.target.value }))}
                    placeholder="Ex: Dev Sênior"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Salário Alvo (R$)</label>
                  <input
                    type="number"
                    value={form.target_salary}
                    onChange={e => setForm(f => ({ ...f, target_salary: e.target.value }))}
                    placeholder="Opcional"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Prazo</label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              {/* Steps */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-2 block">
                  Passos ({steps.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={stepInput}
                    onChange={e => setStepInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addStep()}
                    placeholder="Nome do passo e Enter"
                    className="flex-1 px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b]"
                  />
                  <button
                    onClick={addStep}
                    className="px-3 py-2 rounded-[10px] bg-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/30 text-[12px] font-semibold transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {steps.length > 0 && (
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                    {steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-2 p-2 bg-[var(--sl-s2)] rounded-lg border border-[var(--sl-border)]">
                        <span className="text-[10px] font-bold text-[var(--sl-t3)] w-4 shrink-0">{idx + 1}</span>
                        <p className="flex-1 text-[12px] text-[var(--sl-t1)] truncate">{step.title}</p>
                        <input
                          type="date"
                          value={step.target_date}
                          onChange={e => updateStepTargetDate(step.id, e.target.value)}
                          className="text-[11px] bg-transparent border-none text-[var(--sl-t3)] outline-none"
                        />
                        <button onClick={() => removeStep(step.id)} className="text-[var(--sl-t3)] hover:text-[#f43f5e] transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f59e0b] text-[#03071a] hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isSaving ? 'Criando...' : 'Criar Roadmap'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
