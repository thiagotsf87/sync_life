'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, BookOpen, Brain, Check, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useStudyTracks, useCreateTrack, useUpdateTrack, useDeleteTrack, useToggleStep,
  type TrackStatus, type TrackCategory, type StudyTrackStep,
  CATEGORY_LABELS, STATUS_LABELS,
} from '@/hooks/use-mente'
import { TrackWizard } from '@/components/mente/TrackWizard'
import { ModuleHeader } from '@/components/ui/module-header'
import { useUserPlan } from '@/hooks/use-user-plan'
import { checkPlanLimit } from '@/lib/plan-limits'

type FilterStatus = 'all' | TrackStatus

const STATUS_TABS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluidas' },
  { value: 'paused', label: 'Pausadas' },
  { value: 'abandoned', label: 'Abandonadas' },
]

const CATEGORY_COLORS: Record<string, string> = {
  technology: '#eab308',
  languages: '#3b82f6',
  management: '#a855f7',
  marketing: '#f97316',
  design: '#ec4899',
  finance: '#10b981',
  health: '#f43f5e',
  exam: '#06b6d4',
  undergraduate: '#6366f1',
  postgraduate: '#8b5cf6',
  certification: '#f59e0b',
  other: '#64748b',
}

const STATUS_PILL_STYLES: Record<TrackStatus, { bg: string; color: string }> = {
  in_progress: { bg: 'rgba(234,179,8,.12)', color: '#eab308' },
  completed: { bg: 'rgba(16,185,129,.12)', color: '#10b981' },
  paused: { bg: 'rgba(100,116,139,.12)', color: 'var(--sl-t2)' },
  abandoned: { bg: 'rgba(100,116,139,.12)', color: 'var(--sl-t3)' },
}

export default function TrilhasPage() {
  const router = useRouter()

  const { tracks, loading, error, reload } = useStudyTracks()
  const createTrack = useCreateTrack()
  const updateTrack = useUpdateTrack()
  const deleteTrack = useDeleteTrack()
  const toggleStep = useToggleStep()
  const { isPro } = useUserPlan()

  const activeTracks = tracks.filter(t => t.status === 'in_progress')
  const completedCount = tracks.filter(t => t.status === 'completed').length
  const pausedCount = tracks.filter(t => t.status === 'paused').length

  const [wizardOpen, setWizardOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

  const filtered = tracks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreate = useCallback(async (data: Parameters<typeof createTrack>[0]) => {
    const limitCheck = checkPlanLimit(isPro, 'active_study_tracks', activeTracks.length)
    if (!limitCheck.allowed) {
      toast.error(limitCheck.upsellMessage)
      return
    }
    setIsCreating(true)
    try {
      await createTrack(data)
      toast.success(`Trilha "${data.name}" criada!`)
      setWizardOpen(false)
      await reload()
    } catch {
      toast.error('Erro ao criar trilha')
    } finally {
      setIsCreating(false)
    }
  }, [createTrack, reload])

  const handleToggleStatus = useCallback(async (id: string, currentStatus: TrackStatus) => {
    const nextStatus: TrackStatus = currentStatus === 'in_progress' ? 'paused' : 'in_progress'
    try {
      await updateTrack(id, { status: nextStatus })
      toast.success(nextStatus === 'paused' ? 'Trilha pausada' : 'Trilha retomada')
      await reload()
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }, [updateTrack, reload])

  const handleDelete = useCallback(async (id: string, name: string) => {
    const track = tracks.find(t => t.id === id)
    const hasLinkedSkill = !!track?.linked_skill_id
    const hasCost = track?.cost && track.cost > 0
    const warning = (hasLinkedSkill || hasCost)
      ? '\n\nEsta trilha pode estar vinculada a habilidades de carreira ou ter custo registrado em Financas.'
      : ''
    if (!window.confirm(`Excluir a trilha "${name}"? Esta acao nao pode ser desfeita.${warning}`)) return
    try {
      await deleteTrack(id)
      toast.success('Trilha excluida')
      await reload()
    } catch {
      toast.error('Erro ao excluir trilha')
    }
  }, [tracks, deleteTrack, reload])

  return (
    <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* ModuleHeader */}
      <ModuleHeader
        icon={BookOpen}
        iconBg="rgba(234,179,8,.1)"
        iconColor="#eab308"
        title="Trilhas de Aprendizado"
        subtitle={`${tracks.length} trilhas criadas \u00B7 ${completedCount} concluida${completedCount !== 1 ? 's' : ''} \u00B7 ${pausedCount} pausada${pausedCount !== 1 ? 's' : ''}`}
      >
        {!isPro && (
          <span className="text-[11px] text-[var(--sl-t3)] font-medium">
            {activeTracks.length}/3 FREE
          </span>
        )}
        <button
          onClick={() => setWizardOpen(true)}
          className="flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                     bg-[#eab308] text-black hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          Nova Trilha
        </button>
      </ModuleHeader>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap sl-fade-up sl-delay-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-[14px] py-[6px] rounded-lg text-[12px] font-medium transition-all border',
              statusFilter === tab.value
                ? 'bg-[rgba(234,179,8,.08)] border-[#eab308] text-[#eab308] font-semibold'
                : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3.5 py-2 w-[200px]
                        focus-within:border-[rgba(234,179,8,.4)] transition-colors">
          <Search size={16} className="text-[var(--sl-t3)] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar trilha..."
            className="bg-transparent text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none w-full"
          />
        </div>
      </div>

      {/* FULL-WIDTH HORIZONTAL TRACK CARDS */}
      {loading ? (
        <div className="flex flex-col gap-[14px]">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[120px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-10 text-center">
          <BookOpen size={32} className="text-[#eab308] mx-auto mb-3 opacity-60" />
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            {search || statusFilter !== 'all' ? 'Nenhuma trilha encontrada' : 'Crie sua primeira trilha'}
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">
            {search || statusFilter !== 'all' ? 'Tente outros filtros.' : 'Organize tudo que voce quer aprender em trilhas.'}
          </p>
          {!search && statusFilter === 'all' && (
            <button
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#eab308] text-black hover:brightness-110"
            >
              <Plus size={15} />
              Criar primeira trilha
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-[14px] sl-fade-up sl-delay-2">
          {filtered.map((track) => {
            const steps = track.steps ?? []
            const completedSteps = steps.filter(s => s.is_completed).length
            const nextStep = steps.sort((a, b) => a.sort_order - b.sort_order).find(s => !s.is_completed)
            const catColor = CATEGORY_COLORS[track.category] ?? '#eab308'
            const catLabel = (CATEGORY_LABELS[track.category as TrackCategory] ?? '').replace(/^.+ /, '')
            const statusPill = STATUS_PILL_STYLES[track.status] ?? STATUS_PILL_STYLES.in_progress
            const isCompleted = track.status === 'completed'
            const isPaused = track.status === 'paused'
            const daysLeft = track.target_date
              ? Math.max(0, Math.ceil((new Date(track.target_date).getTime() - Date.now()) / 86400000))
              : null

            const subParts: string[] = []
            if (steps.length > 0) subParts.push(`${completedSteps} de ${steps.length} etapas`)
            if (track.total_hours > 0) subParts.push(`${track.total_hours.toFixed(1)}h`)
            if (track.cost) subParts.push(track.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))

            return (
              <div
                key={track.id}
                className={cn(
                  'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)] cursor-pointer',
                  isCompleted && 'opacity-70',
                  track.status === 'in_progress' && 'border-[rgba(234,179,8,.2)]'
                )}
                style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '20px' }}
                onClick={() => router.push(`/mente/trilhas/${track.id}`)}
              >
                {/* Left content */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${catColor}1a` }}
                    >
                      <BookOpen size={20} style={{ color: catColor }} />
                    </div>
                    <div>
                      <p className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]">{track.name}</p>
                      <div className="flex items-center gap-1.5 mt-[3px]">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold"
                          style={{ background: statusPill.bg, color: statusPill.color }}
                        >
                          {STATUS_LABELS[track.status]}
                        </span>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-[var(--sl-s2)] text-[var(--sl-t3)]"
                        >
                          {catLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-[var(--sl-t3)]">{subParts.join(' \u00B7 ')}</span>
                    <span className="font-[DM_Mono] text-[14px] font-semibold" style={{ color: isCompleted ? '#10b981' : '#eab308' }}>
                      {Math.round(track.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '5px' }}>
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${Math.min(track.progress, 100)}%`,
                        background: isCompleted ? '#10b981' : isPaused ? 'var(--sl-t3)' : '#eab308',
                      }}
                    />
                  </div>
                </div>

                {/* Right panel */}
                <div className="flex flex-col justify-center items-center border-l border-[var(--sl-border)] pl-5">
                  {isCompleted ? (
                    <>
                      <Check size={22} className="text-[#10b981]" />
                      <span className="text-[12px] text-[#10b981] mt-1.5 font-semibold">Concluida!</span>
                    </>
                  ) : isPaused ? (
                    <>
                      <Pause size={22} className="text-[var(--sl-t3)]" />
                      <span className="text-[12px] text-[var(--sl-t3)] mt-1.5 font-medium">Pausada</span>
                    </>
                  ) : nextStep ? (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Proxima etapa</p>
                      <p className="text-[13px] font-medium text-[var(--sl-t1)] text-center">{nextStep.title}</p>
                      {daysLeft !== null && (
                        <p className="text-[11px] text-[var(--sl-t3)] mt-[3px]">{daysLeft}d restantes</p>
                      )}
                    </>
                  ) : (
                    <p className="text-[12px] text-[var(--sl-t3)]">Sem etapas</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <TrackWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSave={handleCreate}
        isLoading={isCreating}
      />
    </div>
  )
}
