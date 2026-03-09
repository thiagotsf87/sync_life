'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, MoreVertical, Pause, Pencil, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useStudyTracks,
  useUpdateTrack,
  useDeleteTrack,
  useToggleStep,
  STATUS_LABELS,
  CATEGORY_LABELS,
} from '@/hooks/use-mente'
import type { TrackStatus, TrackCategory, StudyTrackStep } from '@/hooks/use-mente'
import { MOCK_TRACKS } from '@/lib/mente-mock-data'
import { MenteTrackEditModal, type EditTrackData } from '@/components/mente/mobile/MenteTrackEditModal'
import { MenteTrackDeleteModal } from '@/components/mente/mobile/MenteTrackDeleteModal'

const MENTE_COLOR = '#eab308'
const MENTE_BG = 'rgba(234,179,8,0.12)'

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    technology: '💻', languages: '🌍', management: '📊', marketing: '📢',
    design: '🎨', finance: '💰', health: '❤️', exam: '📝',
    undergraduate: '🎓', postgraduate: '🏫', certification: '🏆', other: '📚',
  }
  return map[cat] ?? '📚'
}

export default function TrilhaDetalhePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { tracks, loading, error, reload } = useStudyTracks()
  const updateTrack = useUpdateTrack()
  const deleteTrack = useDeleteTrack()
  const toggleStep = useToggleStep()

  // Fallback para mock quando Supabase retorna vazio (igual MenteMobile)
  const isMockMode = tracks.length === 0
  const tracksForLookup = tracks.length > 0 ? tracks : MOCK_TRACKS
  const track = tracksForLookup.find((t) => t.id === id)

  // Estado local para mock
  const [mockStepOverrides, setMockStepOverrides] = useState<Record<string, boolean>>({})
  const [mockStatusOverride, setMockStatusOverride] = useState<TrackStatus | null>(null)
  const [mockTrackOverrides, setMockTrackOverrides] = useState<Partial<{ name: string; category: TrackCategory; target_date: string | null; cost: number | null; notes: string | null }>>({})
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Track efetivo (merge com overrides de mock)
  const effectiveTrack = track
    ? {
        ...track,
        status: (mockStatusOverride ?? track.status) as TrackStatus,
        name: mockTrackOverrides.name ?? track.name,
        category: (mockTrackOverrides.category ?? track.category) as typeof track.category,
        target_date: mockTrackOverrides.target_date !== undefined ? mockTrackOverrides.target_date : track.target_date,
        cost: mockTrackOverrides.cost !== undefined ? mockTrackOverrides.cost : track.cost,
        notes: mockTrackOverrides.notes !== undefined ? mockTrackOverrides.notes : track.notes,
      }
    : null

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [menuOpen])

  async function handleToggleStep(stepId: string, trackId: string, isCompleted: boolean) {
    const t = tracksForLookup.find((tr) => tr.id === trackId)
    if (!t) return

    if (isMockMode) {
      // Mock: atualizar estado local sem chamar Supabase
      const baseStepsList = (t.steps ?? []).sort((a, b) => a.sort_order - b.sort_order)
      const nextOverrides = { ...mockStepOverrides, [stepId]: isCompleted }
      const newCompleted = baseStepsList.filter((s) => (s.id === stepId ? isCompleted : (nextOverrides[s.id] ?? s.is_completed))).length
      const willComplete = isCompleted && newCompleted === baseStepsList.length

      setMockStepOverrides(nextOverrides)
      if (willComplete) {
        toast.success(`🎉 Trilha "${t.name}" concluída!`, {
          description: 'Parabéns pelo aprendizado!',
          duration: 6000,
        })
      }
      return
    }

    try {
      const prevIncomplete = t?.steps?.filter((s) => !s.is_completed) ?? []
      const willComplete = isCompleted && prevIncomplete.length === 1 && prevIncomplete[0].id === stepId

      await toggleStep(stepId, trackId, isCompleted)
      await reload()

      if (willComplete) {
        toast.success(`🎉 Trilha "${t?.name}" concluída!`, {
          description: 'Parabéns pelo aprendizado!',
          duration: 6000,
        })
      }
    } catch {
      toast.error('Erro ao atualizar etapa')
    }
  }

  async function handleToggleStatus() {
    if (!track) return
    const nextStatus: TrackStatus = (effectiveTrack?.status ?? track.status) === 'in_progress' ? 'paused' : 'in_progress'
    if (isMockMode) {
      setMockStatusOverride(nextStatus)
      toast.success(nextStatus === 'paused' ? 'Trilha pausada' : 'Trilha retomada')
      return
    }
    try {
      await updateTrack(track.id, { status: nextStatus })
      toast.success(nextStatus === 'paused' ? 'Trilha pausada' : 'Trilha retomada')
      await reload()
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }

  async function handleEditSave(data: EditTrackData) {
    if (!track) return
    const costVal = data.cost ? parseFloat(data.cost) : null
    if (isMockMode) {
      setMockTrackOverrides({
        name: data.name,
        category: data.category,
        target_date: data.target_date || null,
        cost: costVal,
        notes: data.notes || null,
      })
      toast.success('Trilha atualizada')
      setEditOpen(false)
      return
    }
    try {
      await updateTrack(track.id, {
        name: data.name,
        category: data.category,
        target_date: data.target_date || null,
        cost: costVal,
        notes: data.notes || null,
      })
      toast.success('Trilha atualizada')
      await reload()
      setEditOpen(false)
    } catch {
      toast.error('Erro ao atualizar trilha')
    }
  }

  async function handleDeleteConfirm() {
    if (!track) return
    if (isMockMode) {
      toast.success('Trilha excluída')
      router.push('/mente')
      return
    }
    try {
      await deleteTrack(track.id)
      toast.success('Trilha excluída')
      router.push('/mente')
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  if (loading && !track) {
    return (
      <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">
        <div className="h-8 w-32 rounded bg-[var(--sl-s2)] animate-pulse mb-6" />
        <div className="h-48 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
      </div>
    )
  }

  if (error || !track) {
    return (
      <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--sl-t2)] hover:text-[var(--sl-t1)] mb-6"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-10 text-center">
          <p className="text-[14px] text-[var(--sl-t2)]">
            {error ?? 'Trilha não encontrada.'}
          </p>
          <button
            onClick={() => router.push('/mente')}
            className="mt-4 text-[13px] font-medium"
            style={{ color: MENTE_COLOR }}
          >
            Ir para Mente
          </button>
        </div>
      </div>
    )
  }

  const baseSteps = (track.steps ?? []).sort((a, b) => a.sort_order - b.sort_order)
  // Aplicar overrides de mock (quando Supabase vazio)
  const steps = baseSteps.map((s) => {
    const overridden = mockStepOverrides[s.id]
    const isCompleted = overridden ?? s.is_completed
    const completedAt = overridden === true ? new Date().toISOString() : (overridden === false ? null : s.completed_at)
    return { ...s, is_completed: isCompleted, completed_at: completedAt }
  })
  const completedSteps = steps.filter((s) => s.is_completed).length
  const nextStep = steps.find((s) => !s.is_completed)
  // Progresso efetivo: em mock, recalcular a partir das etapas
  const effectiveProgress = isMockMode && steps.length > 0
    ? Math.round((completedSteps / steps.length) * 100)
    : Math.round(track.progress)

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-5 sm:py-7 pb-16 lg:py-7">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-[10px] hover:bg-[var(--sl-s2)] transition-colors shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-[var(--sl-t2)]" />
        </button>
        <h1
          className="flex-1 min-w-0 font-[Syne] font-extrabold text-base sm:text-lg truncate text-center text-[var(--sl-t1)]"
        >
          {effectiveTrack?.name ?? track.name}
        </h1>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-[10px] hover:bg-[var(--sl-s2)] transition-colors"
            aria-label="Mais opções"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={20} className="text-[var(--sl-t2)]" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 min-w-[160px] py-1 rounded-[10px] z-50"
              style={{
                background: 'var(--sl-s1)',
                border: '1px solid var(--sl-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <button
                onClick={() => {
                  handleToggleStatus()
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[13px] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
              >
                <Pause size={16} />
                {(effectiveTrack?.status ?? track.status) === 'in_progress' ? 'Pausar' : 'Retomar'}
              </button>
              <button
                onClick={() => {
                  setEditOpen(true)
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[13px] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
              >
                <Pencil size={16} />
                Editar
              </button>
              <button
                onClick={() => {
                  setDeleteOpen(true)
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[13px] text-[#f43f5e] hover:bg-[rgba(244,63,94,0.1)] transition-colors"
              >
                <X size={16} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero card */}
      <div
        className="rounded-2xl p-4 sm:p-5 mb-4"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
      >
        {/* Ícone centralizado no topo */}
        <div className="flex justify-center mb-4">
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-[12px] sm:rounded-[16px] flex items-center justify-center text-[24px] sm:text-[32px]"
            style={{ background: MENTE_BG }}
          >
            {getCategoryEmoji(track.category)}
          </div>
        </div>

        {/* Pills: status + categoria */}
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          <span
            className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold"
            style={{
              background: (effectiveTrack?.status ?? track.status) === 'in_progress' ? 'rgba(249,115,22,0.2)' : 'rgba(100,116,139,0.2)',
              color: (effectiveTrack?.status ?? track.status) === 'in_progress' ? '#f97316' : 'var(--sl-t2)',
            }}
          >
            {STATUS_LABELS[(effectiveTrack?.status ?? track.status) as TrackStatus]}
          </span>
          <span
            className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold"
            style={{
              background: 'rgba(6,182,212,0.2)',
              color: '#06b6d4',
            }}
          >
            {CATEGORY_LABELS[(effectiveTrack?.category ?? track.category) as keyof typeof CATEGORY_LABELS]?.replace(/^.+ /, '') ?? track.category}
          </span>
        </div>

        {/* Métricas: Progresso, Estudadas, Investido */}
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div>
            <p className="font-[DM_Mono] text-base sm:text-lg font-bold" style={{ color: MENTE_COLOR }}>
              {effectiveProgress}%
            </p>
            <p className="text-[9px] sm:text-[10px] text-[var(--sl-t3)]">Progresso</p>
          </div>
          <div>
            <p className="font-[DM_Mono] text-base sm:text-lg font-bold text-[var(--sl-t1)]">
              {track.total_hours}h
            </p>
            <p className="text-[9px] sm:text-[10px] text-[var(--sl-t3)]">Estudadas</p>
          </div>
          <div>
            <p className="font-[DM_Mono] text-base sm:text-lg font-bold text-[var(--sl-t1)]">
              {(effectiveTrack?.cost ?? track.cost) != null ? `R$ ${(effectiveTrack?.cost ?? track.cost)!.toFixed(0)}` : '—'}
            </p>
            <p className="text-[9px] sm:text-[10px] text-[var(--sl-t3)]">Investido</p>
          </div>
        </div>

        {/* Progress bar + resumo */}
        <div>
          <div className="text-[11px] sm:text-[12px] text-[var(--sl-t2)] mb-1">
            {completedSteps} de {steps.length} etapas
            {(effectiveTrack?.target_date ?? track.target_date) && (
              <>
                {' - '}
                Meta: {new Date((effectiveTrack?.target_date ?? track.target_date)!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                {' '}
                ({Math.max(0, Math.ceil((new Date((effectiveTrack?.target_date ?? track.target_date)!).getTime() - Date.now()) / 86400000))} dias)
              </>
            )}
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--sl-s3)' }}>
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.min(effectiveProgress, 100)}%`,
                background: MENTE_COLOR,
              }}
            />
          </div>
        </div>
      </div>

      {/* Etapas */}
      {steps.length > 0 && (
        <div
          className="rounded-2xl p-4 sm:p-5 mb-4"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
        >
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-3">
            Etapas
          </p>
          <div className="flex flex-col gap-2">
            {steps.map((step: StudyTrackStep) => {
              const isNext = !step.is_completed && step.id === nextStep?.id
              return (
                <label
                  key={step.id}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-[10px] cursor-pointer transition-colors"
                  style={isNext ? { border: `2px solid ${MENTE_COLOR}`, background: 'rgba(234,179,8,0.06)' } : undefined}
                >
                  <input
                    type="checkbox"
                    checked={step.is_completed}
                    onChange={(e) => handleToggleStep(step.id, track.id, e.target.checked)}
                    className="accent-[#eab308] w-4 h-4 rounded shrink-0"
                  />
                  <span
                    className={cn(
                      'text-[13px] sm:text-[14px] flex-1',
                      step.is_completed ? 'text-[var(--sl-t3)] line-through' : 'text-[var(--sl-t1)]'
                    )}
                  >
                    {step.title}
                    {isNext && (
                      <span className="ml-1 text-[10px] sm:text-[11px] font-medium" style={{ color: MENTE_COLOR }}>
                        — próximo
                      </span>
                    )}
                  </span>
                  {step.completed_at && (
                    <span className="text-[10px] sm:text-[11px] text-[var(--sl-t3)] shrink-0">
                      {new Date(step.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  )}
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-2">
        <button
          onClick={handleToggleStatus}
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-[10px] text-[12px] sm:text-[13px] font-semibold border transition-colors"
          style={{
            borderColor: 'var(--sl-border)',
            color: 'var(--sl-t2)',
            background: 'var(--sl-s1)',
          }}
        >
          <Pause size={16} />
          {(effectiveTrack?.status ?? track.status) === 'in_progress' ? 'Pausar' : 'Retomar'}
        </button>
        <button
          onClick={() => setEditOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-[10px] text-[12px] sm:text-[13px] font-semibold border transition-colors"
          style={{
            borderColor: 'var(--sl-border)',
            color: 'var(--sl-t2)',
            background: 'var(--sl-s1)',
          }}
        >
          <Pencil size={16} />
          Editar
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-[10px] text-[12px] sm:text-[13px] font-semibold text-[#f43f5e] hover:bg-[rgba(244,63,94,0.1)] transition-colors border border-transparent"
        >
          <X size={16} />
          Excluir
        </button>
      </div>

      {/* Modal Editar */}
      <MenteTrackEditModal
        open={editOpen}
        track={effectiveTrack ?? track}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
      />

      {/* Modal Excluir */}
      <MenteTrackDeleteModal
        open={deleteOpen}
        trackName={effectiveTrack?.name ?? track.name}
        hasLinkedSkillOrCost={!!(track.linked_skill_id || (track.cost && track.cost > 0))}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
