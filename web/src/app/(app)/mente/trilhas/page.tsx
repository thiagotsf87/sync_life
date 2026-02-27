'use client'

import { useState, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import {
  useStudyTracks, useCreateTrack, useUpdateTrack, useDeleteTrack, useToggleStep,
  type TrackStatus, type StudyTrackStep,
} from '@/hooks/use-mente'
import { STATUS_LABELS } from '@/hooks/use-mente'
import { TrackCard } from '@/components/mente/TrackCard'
import { TrackWizard } from '@/components/mente/TrackWizard'

type FilterStatus = 'all' | TrackStatus

const STATUS_TABS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluídas' },
  { value: 'paused', label: 'Pausadas' },
  { value: 'abandoned', label: 'Abandonadas' },
]

export default function TrilhasPage() {
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { tracks, loading, error, reload } = useStudyTracks()
  const createTrack = useCreateTrack()
  const updateTrack = useUpdateTrack()
  const deleteTrack = useDeleteTrack()
  const toggleStep = useToggleStep()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = tracks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreate = useCallback(async (data: Parameters<typeof createTrack>[0]) => {
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
    if (!window.confirm(`Excluir a trilha "${name}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteTrack(id)
      toast.success('Trilha excluída')
      await reload()
    } catch {
      toast.error('Erro ao excluir trilha')
    }
  }, [deleteTrack, reload])

  const handleToggleStep = useCallback(async (stepId: string, trackId: string, isCompleted: boolean) => {
    try {
      await toggleStep(stepId, trackId, isCompleted)
      await reload()
    } catch {
      toast.error('Erro ao atualizar etapa')
    }
  }, [toggleStep, reload])

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className={cn(
          'font-[Syne] font-extrabold text-2xl',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          📚 Trilhas de Aprendizado
        </h1>
        <div className="flex-1" />
        <button
          onClick={() => setWizardOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#a855f7] text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Nova Trilha
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border',
              statusFilter === tab.value
                ? 'bg-[#a855f7] text-white border-[#a855f7]'
                : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3 py-1.5 max-w-[180px]">
          <Search size={13} className="text-[var(--sl-t3)] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="bg-transparent text-[12px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none w-full"
          />
        </div>
      </div>

      {/* Tracks grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[160px] rounded-2xl bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            {search || statusFilter !== 'all' ? 'Nenhuma trilha encontrada' : 'Crie sua primeira trilha'}
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">
            {search || statusFilter !== 'all' ? 'Tente outros filtros.' : 'Organize tudo que você quer aprender em trilhas.'}
          </p>
          {!search && statusFilter === 'all' && (
            <button
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#a855f7] text-white hover:opacity-90"
            >
              <Plus size={15} />
              Criar primeira trilha
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
          {filtered.map((track, idx) => (
            <div key={track.id} className={`sl-delay-${Math.min(idx + 1, 5)}`}>
              {/* Card with expandable steps */}
              <div
                className={cn(
                  'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden transition-all',
                  expandedId === track.id && 'border-[#a855f7]/50'
                )}
              >
                <div onClick={() => setExpandedId(id => id === track.id ? null : track.id)}>
                  <TrackCard track={track} />
                </div>

                {/* Expanded: steps + actions */}
                {expandedId === track.id && (
                  <div className="px-5 pb-5 flex flex-col gap-3">
                    {/* Steps */}
                    {(track.steps ?? []).length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">
                          Etapas ({(track.steps ?? []).filter(s => s.is_completed).length}/{(track.steps ?? []).length})
                        </p>
                        {(track.steps ?? []).sort((a, b) => a.sort_order - b.sort_order).map((step: StudyTrackStep) => (
                          <label key={step.id} className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={step.is_completed}
                              onChange={e => handleToggleStep(step.id, track.id, e.target.checked)}
                              className="accent-[#a855f7] w-3.5 h-3.5 rounded"
                            />
                            <span className={cn(
                              'text-[12px] transition-colors',
                              step.is_completed ? 'text-[var(--sl-t3)] line-through' : 'text-[var(--sl-t1)]'
                            )}>
                              {step.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--sl-border)]">
                      <button
                        onClick={() => handleToggleStatus(track.id, track.status)}
                        className="flex-1 py-1.5 rounded-[8px] text-[12px] font-medium border border-[var(--sl-border)] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
                      >
                        {track.status === 'in_progress' ? '⏸ Pausar' : '▶ Retomar'}
                      </button>
                      <button
                        onClick={() => handleDelete(track.id, track.name)}
                        className="py-1.5 px-3 rounded-[8px] text-[12px] font-medium text-[#f43f5e] hover:bg-[rgba(244,63,94,0.1)] transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
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
