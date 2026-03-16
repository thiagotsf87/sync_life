'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronDown, Clock, TrendingUp, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  useCareerRoadmaps, useCreateRoadmap, useUpdateRoadmapStep, useDeleteRoadmap,
  useProfessionalProfile, useCareerHistory, useSkills, useSaveSkill, useAddHistoryEntry,
  type CreateRoadmapData, type StepStatus,
} from '@/hooks/use-carreira'
import { RoadmapTimeline } from '@/components/carreira/RoadmapTimeline'
import { HorizontalTimeline } from '@/components/ui/horizontal-timeline'
import type { TimelineStepStatus } from '@/components/ui/horizontal-timeline'
import { CarreiraMobile } from '@/components/carreira/CarreiraMobile'
import { ModuleHeader } from '@/components/ui/module-header'
import { useUserPlan } from '@/hooks/use-user-plan'
import { checkPlanLimit } from '@/lib/plan-limits'
import { createClient } from '@/lib/supabase/client'

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
  linked_objective_id: '',
}

export default function RoadmapPage() {
  const router = useRouter()

  const { roadmaps, loading, error, reload } = useCareerRoadmaps()
  const { profile } = useProfessionalProfile()
  const { history } = useCareerHistory()
  const { skills } = useSkills()
  const saveSkill = useSaveSkill()
  const addHistory = useAddHistoryEntry()
  const createRoadmap = useCreateRoadmap()
  const updateStep = useUpdateRoadmapStep()
  const deleteRoadmap = useDeleteRoadmap()
  const { isPro } = useUserPlan()

  const activeRoadmaps = roadmaps.filter(r => r.status === 'active')
  const activeRoadmap = activeRoadmaps[0] ?? null

  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [steps, setSteps] = useState<StepDraft[]>([])
  const [stepInput, setStepInput] = useState('')
  const [objectiveOptions, setObjectiveOptions] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const supabase = createClient() as any
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      if (!user) return
      supabase.from('objectives')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .then(({ data }: any) => {
          setObjectiveOptions(data ?? [])
        })
    })
  }, [])

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
        linked_objective_id: form.linked_objective_id || null,
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
      const roadmap = roadmaps.find(r => r.id === roadmapId)
      if (status === 'completed') {
        const rmSteps = roadmap?.steps ?? []
        if (rmSteps.length > 0) {
          const remaining = rmSteps.filter(s => s.id !== stepId && s.status !== 'completed')
          willComplete = remaining.length === 0
        }
      }

      await updateStep(stepId, roadmapId, status)
      await reload()

      // RN-CAR-17: passo concluído → meta no Futuro (opt-in)
      if (status === 'completed') {
        try {
          const settings = JSON.parse(localStorage.getItem('sl_integrations_settings') ?? '{}')
          if (settings.car_roadmap_futuro) {
            const step = roadmap?.steps?.find(s => s.id === stepId)
            if (step && roadmap) {
              const supabase = createClient() as any
              const { data: { user } } = await supabase.auth.getUser()
              if (user) {
                await supabase.from('objectives').insert({
                  user_id: user.id,
                  name: step.title,
                  type: 'task',
                  status: 'completed',
                  current_value: 1,
                  target_value: 1,
                  target_date: step.target_date ?? null,
                  notes: `Auto — 💼 Carreira | Passo concluído do roadmap "${roadmap.name}"`,
                })
              }
            }
          }
        } catch (err) { console.warn('[CrossModule] Falha ao criar meta automática em Futuro:', err) }
      }

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
    <>
    <CarreiraMobile
      profile={profile}
      activeRoadmap={activeRoadmap}
      skills={skills}
      history={history}
      loading={loading}
      onSaveSkill={async (data) => { await saveSkill(data) }}
      onAddPromotion={async (data) => {
        await addHistory({
          title: data.title,
          company: data.company || null,
          field: null,
          level: null,
          salary: data.salary,
          start_date: data.startDate || new Date().toISOString().split('T')[0],
          end_date: null,
          change_type: 'promotion',
          notes: null,
        })
      }}
      onReload={async () => { await reload() }}
    />
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* MODULE HEADER */}
      <ModuleHeader
        icon={Clock}
        iconBg="rgba(244,63,94,.08)"
        iconColor="#f43f5e"
        title="Roadmaps"
        subtitle={roadmaps.length > 0
          ? `${roadmaps.length} roadmap${roadmaps.length > 1 ? 's' : ''} \u00B7 ${activeRoadmaps.length} ativo${activeRoadmaps.length !== 1 ? 's' : ''}`
          : 'Crie seu plano de carreira'}
      >
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                     bg-[#f43f5e] text-white hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          Novo Roadmap
        </button>
      </ModuleHeader>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-[14px]">
          {[1, 2].map(i => <div key={i} className="h-20 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-12 text-center">
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Nenhum roadmap criado</h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-5">Crie seu plano de carreira com passos concretos.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#f43f5e] text-white hover:brightness-110"
          >
            <Plus size={15} />
            Criar Roadmap
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-[14px]">
          {roadmaps.map((rm, rmIdx) => {
            const isExpanded = expandedRoadmap === rm.id
            const color = STATUS_COLORS[rm.status] ?? '#6e90b8'

            // Build steps for HorizontalTimeline
            const timelineSteps = (rm.steps ?? []).map(s => ({
              label: s.title,
              date: s.target_date
                ? new Date(s.target_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                : undefined,
              status: (s.status === 'completed' ? 'done' : s.status === 'in_progress' ? 'current' : 'pending') as TimelineStepStatus,
            }))

            return (
              <div
                key={rm.id}
                className={cn(
                  'bg-[var(--sl-s1)] border rounded-[18px] overflow-hidden transition-colors sl-fade-up',
                  `sl-delay-${Math.min(rmIdx + 1, 5)}`,
                  rm.status === 'active' ? 'border-[rgba(244,63,94,.18)]' : rm.status === 'completed' ? 'border-[rgba(16,185,129,.15)]' : 'border-[var(--sl-border)]',
                  'hover:border-[var(--sl-border-h)]',
                  rm.status === 'paused' || rm.status === 'abandoned' ? 'opacity-60' : ''
                )}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedRoadmap(isExpanded ? null : rm.id)}
                  className="w-full flex items-center gap-4 p-[22px_28px] text-left"
                >
                  {/* Status icon */}
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: color + '15' }}
                  >
                    {rm.status === 'completed' ? (
                      <Check size={18} style={{ color }} />
                    ) : (
                      <TrendingUp size={18} style={{ color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[10px] mb-[2px] flex-wrap">
                      <span className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]">{rm.name}</span>
                      <span
                        className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                        style={{ background: color + '15', color }}
                      >
                        {STATUS_LABELS[rm.status]}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--sl-t3)]">
                      {rm.current_title} &rarr; {rm.target_title}
                      {rm.target_salary && ` \u00B7 Salario alvo: ${rm.target_salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                      {rm.target_date && ` \u00B7 Prazo: ${new Date(rm.target_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="font-[DM_Mono] text-[14px] font-medium" style={{ color }}>
                      {Math.round(rm.progress)}%
                    </div>
                    <div className="w-[120px]">
                      <div className="h-[5px] bg-[var(--sl-s3)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(rm.progress, 100)}%`,
                            background: rm.status === 'active'
                              ? 'linear-gradient(90deg, #10b981, #f43f5e)'
                              : color,
                          }}
                        />
                      </div>
                    </div>
                    <span className={cn('transition-transform text-[var(--sl-t3)]', isExpanded && 'rotate-180')}>
                      <ChevronDown size={18} />
                    </span>
                  </div>
                </button>

                {/* Expanded body with Horizontal Timeline */}
                {isExpanded && (
                  <div className="px-7 pb-6 border-t border-[var(--sl-border)] pt-5">
                    {/* Horizontal Timeline */}
                    {timelineSteps.length > 0 && (
                      <div className="mb-5">
                        <HorizontalTimeline
                          steps={timelineSteps}
                          progressPercent={Math.round(rm.progress)}
                          accentColor={rm.status === 'completed' ? '#10b981' : '#10b981'}
                        />
                      </div>
                    )}

                    {/* Detail grid: current step + impact */}
                    <div className="grid grid-cols-2 gap-[14px]">
                      {/* Current step detail */}
                      {(() => {
                        const nextStep = rm.steps?.find(s => s.status !== 'completed')
                        if (!nextStep) return null
                        return (
                          <div className="p-[16px_18px] bg-[var(--sl-s2)] rounded-xl">
                            <p className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] mb-[6px]">Etapa Atual</p>
                            <p className="text-[14px] font-semibold text-[var(--sl-t1)] mb-1">{nextStep.title}</p>
                            <p className="text-[12px] text-[var(--sl-t2)]">
                              {nextStep.description || (nextStep.target_date
                                ? `Prazo: ${new Date(nextStep.target_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
                                : 'Sem prazo definido')}
                            </p>
                          </div>
                        )
                      })()}

                      {/* Impact projection */}
                      {rm.target_salary && profile?.gross_salary && (
                        <div className="p-[16px_18px] bg-[var(--sl-s2)] rounded-xl">
                          <p className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] mb-[6px]">Impacto Projetado</p>
                          <div className="flex gap-5 mt-2">
                            <div>
                              <p className="text-[11px] text-[var(--sl-t3)]">Salario atual</p>
                              <p className="font-[DM_Mono] text-[16px] text-[var(--sl-t1)] mt-[2px]">
                                {profile.gross_salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </p>
                            </div>
                            <div className="flex items-center text-[var(--sl-t3)]">&rarr;</div>
                            <div>
                              <p className="text-[11px] text-[var(--sl-t3)]">Salario alvo</p>
                              <p className="font-[DM_Mono] text-[16px] text-[#10b981] mt-[2px]">
                                {rm.target_salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] text-[var(--sl-t3)]">Aumento</p>
                              <p className="font-[DM_Mono] text-[16px] text-[#10b981] mt-[2px]">
                                +{Math.round(((rm.target_salary - profile.gross_salary) / profile.gross_salary) * 100)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Vertical timeline for step management */}
                    <div className="mt-5">
                      <RoadmapTimeline roadmap={rm} onUpdateStep={handleUpdateStep} />
                    </div>

                    {/* Delete button */}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => handleDelete(rm.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] text-[var(--sl-t3)] hover:text-[#f43f5e] hover:bg-[rgba(244,63,94,.06)] transition-all"
                      >
                        <Trash2 size={12} />
                        Excluir roadmap
                      </button>
                    </div>
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
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] w-full max-w-[580px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-extrabold text-[20px] text-[var(--sl-t1)] flex items-center gap-[10px]">
                <Clock size={20} className="text-[#f43f5e]" />
                Novo Roadmap
              </h2>
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
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)]"
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
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Cargo Alvo</label>
                  <input
                    type="text"
                    value={form.target_title}
                    onChange={e => setForm(f => ({ ...f, target_title: e.target.value }))}
                    placeholder="Ex: Dev Sênior"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)]"
                  />
                </div>
              </div>

              {objectiveOptions.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Objetivo no Futuro (opcional)</label>
                  <select
                    value={form.linked_objective_id}
                    onChange={e => setForm(f => ({ ...f, linked_objective_id: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[var(--sl-border-h)]"
                  >
                    <option value="">Nenhum</option>
                    {objectiveOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                  <p className="text-[10px] text-[var(--sl-t3)] mt-1">Ao concluir os passos do roadmap, as metas vinculadas no Futuro serão atualizadas.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Salário Alvo (R$)</label>
                  <input
                    type="number"
                    value={form.target_salary}
                    onChange={e => setForm(f => ({ ...f, target_salary: e.target.value }))}
                    placeholder="Opcional"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Prazo</label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[var(--sl-border-h)]"
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
                    className="flex-1 px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)]"
                  />
                  <button
                    onClick={addStep}
                    className="px-3 py-2 rounded-[10px] bg-[#f43f5e]/20 text-[#f43f5e] hover:bg-[#f43f5e]/30 text-[12px] font-semibold transition-colors"
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
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f43f5e] text-white hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {isSaving ? 'Criando...' : 'Criar Roadmap'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
