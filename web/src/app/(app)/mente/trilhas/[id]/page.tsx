'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, MoreVertical, Pause, Pencil, X, BookOpen, ChevronLeft, Check, Play } from 'lucide-react'
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
import { ModuleHeader } from '@/components/ui/module-header'

const MENTE_COLOR = '#eab308'

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

export default function TrilhaDetalhePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { tracks, loading, error, reload } = useStudyTracks()
  const updateTrack = useUpdateTrack()
  const deleteTrack = useDeleteTrack()
  const toggleStep = useToggleStep()

  // Fallback to mock when Supabase returns empty
  const isMockMode = tracks.length === 0
  const tracksForLookup = tracks.length > 0 ? tracks : MOCK_TRACKS
  const track = tracksForLookup.find((t) => t.id === id)

  // Local state for mock
  const [mockStepOverrides, setMockStepOverrides] = useState<Record<string, boolean>>({})
  const [mockStatusOverride, setMockStatusOverride] = useState<TrackStatus | null>(null)
  const [mockTrackOverrides, setMockTrackOverrides] = useState<Partial<{ name: string; category: TrackCategory; target_date: string | null; cost: number | null; notes: string | null }>>({})
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Effective track (merge with mock overrides)
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
      const baseStepsList = (t.steps ?? []).sort((a, b) => a.sort_order - b.sort_order)
      const nextOverrides = { ...mockStepOverrides, [stepId]: isCompleted }
      const newCompleted = baseStepsList.filter((s) => (s.id === stepId ? isCompleted : (nextOverrides[s.id] ?? s.is_completed))).length
      const willComplete = isCompleted && newCompleted === baseStepsList.length

      setMockStepOverrides(nextOverrides)
      if (willComplete) {
        toast.success(`Trilha "${t.name}" concluida!`, {
          description: 'Parabens pelo aprendizado!',
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
        toast.success(`Trilha "${t?.name}" concluida!`, {
          description: 'Parabens pelo aprendizado!',
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
      toast.success('Trilha excluida')
      router.push('/mente')
      return
    }
    try {
      await deleteTrack(track.id)
      toast.success('Trilha excluida')
      router.push('/mente')
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  if (loading && !track) {
    return (
      <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">
        <div className="h-8 w-32 rounded bg-[var(--sl-s2)] animate-pulse mb-6" />
        <div className="h-48 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
      </div>
    )
  }

  if (error || !track) {
    return (
      <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--sl-t2)] hover:text-[var(--sl-t1)] mb-6"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-10 text-center">
          <p className="text-[14px] text-[var(--sl-t2)]">
            {error ?? 'Trilha nao encontrada.'}
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

  const catColor = CATEGORY_COLORS[track.category] ?? '#eab308'
  const catLabel = (CATEGORY_LABELS[track.category as TrackCategory] ?? '').replace(/^.+ /, '')
  const statusPill = STATUS_PILL_STYLES[(effectiveTrack?.status ?? track.status) as TrackStatus] ?? STATUS_PILL_STYLES.in_progress

  const baseSteps = (track.steps ?? []).sort((a, b) => a.sort_order - b.sort_order)
  const steps = baseSteps.map((s) => {
    const overridden = mockStepOverrides[s.id]
    const isCompleted = overridden ?? s.is_completed
    const completedAt = overridden === true ? new Date().toISOString() : (overridden === false ? null : s.completed_at)
    return { ...s, is_completed: isCompleted, completed_at: completedAt }
  })
  const completedSteps = steps.filter((s) => s.is_completed).length
  const nextStep = steps.find((s) => !s.is_completed)
  const effectiveProgress = isMockMode && steps.length > 0
    ? Math.round((completedSteps / steps.length) * 100)
    : Math.round(track.progress)

  const daysLeft = (effectiveTrack?.target_date ?? track.target_date)
    ? Math.max(0, Math.ceil((new Date((effectiveTrack?.target_date ?? track.target_date)!).getTime() - Date.now()) / 86400000))
    : null

  return (
    <div className="max-w-[1160px] mx-auto px-4 sm:px-10 py-5 sm:py-9 pb-16 lg:py-9">

      {/* Desktop ModuleHeader */}
      <div className="hidden lg:block">
        <ModuleHeader
          icon={BookOpen}
          iconBg={`${catColor}1a`}
          iconColor={catColor}
          title={effectiveTrack?.name ?? track.name}
          subtitle={`Trilha de aprendizado \u00B7 ${catLabel} \u00B7 Criada em ${new Date(track.created_at ?? '').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`}
        >
          <button
            onClick={() => router.push('/mente/trilhas')}
            className="flex items-center gap-[7px] px-[14px] py-[7px] rounded-[11px] text-[12px] font-semibold
                       bg-transparent text-[var(--sl-t2)] border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
          >
            <ChevronLeft size={14} />
            Trilhas
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-[7px] px-[10px] py-[7px] rounded-[11px] text-[12px] font-semibold
                         bg-transparent text-[var(--sl-t2)] border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
            >
              <MoreVertical size={16} />
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
                  onClick={() => { handleToggleStatus(); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[13px] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
                >
                  <Pause size={16} />
                  {(effectiveTrack?.status ?? track.status) === 'in_progress' ? 'Pausar' : 'Retomar'}
                </button>
                <button
                  onClick={() => { setEditOpen(true); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[13px] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
                >
                  <Pencil size={16} />
                  Editar
                </button>
                <button
                  onClick={() => { setDeleteOpen(true); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[13px] text-[#f43f5e] hover:bg-[rgba(244,63,94,0.1)] transition-colors"
                >
                  <X size={16} />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </ModuleHeader>
      </div>

      {/* Mobile Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:hidden">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-[10px] hover:bg-[var(--sl-s2)] transition-colors shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-[var(--sl-t2)]" />
        </button>
        <h1 className="flex-1 min-w-0 font-[Syne] font-extrabold text-base sm:text-lg truncate text-center text-[var(--sl-t1)]">
          {effectiveTrack?.name ?? track.name}
        </h1>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-[10px] hover:bg-[var(--sl-s2)] transition-colors"
          >
            <MoreVertical size={20} className="text-[var(--sl-t2)]" />
          </button>
        </div>
      </div>

      {/* HERO card — gradient accent bar + 36px values */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 mb-[14px] relative overflow-hidden sl-fade-up sl-delay-1 transition-colors hover:border-[var(--sl-border-h)]">
        {/* Gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #eab308, #f97316)' }} />

        <div className="grid grid-cols-[1fr_auto] gap-7 items-center max-sm:grid-cols-1">
          {/* Left: pills + progress */}
          <div>
            <div className="flex items-center gap-2 mb-[14px] flex-wrap">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: statusPill.bg, color: statusPill.color }}
              >
                {STATUS_LABELS[(effectiveTrack?.status ?? track.status) as TrackStatus]}
              </span>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: 'rgba(6,182,212,.12)', color: '#06b6d4' }}
              >
                {catLabel}
              </span>
              {(effectiveTrack?.target_date ?? track.target_date) && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--sl-s2)] text-[var(--sl-t3)]">
                  Meta: {new Date((effectiveTrack?.target_date ?? track.target_date)!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
            <p className="text-[12px] text-[var(--sl-t2)] mb-2">
              {completedSteps} de {steps.length} etapas concluidas
              {daysLeft !== null && ` \u00B7 ${daysLeft} dias restantes`}
            </p>
            <div className="w-full max-w-[400px] bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '8px' }}>
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${Math.min(effectiveProgress, 100)}%`,
                  background: 'linear-gradient(90deg, #eab308, #f97316)',
                }}
              />
            </div>
          </div>

          {/* Right: 36px values */}
          <div className="flex gap-7 text-center max-sm:justify-around">
            <div>
              <p className="font-[DM_Mono] font-bold leading-none text-[#eab308]" style={{ fontSize: '36px' }}>
                {effectiveProgress}%
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sl-t3)] mt-1">Progresso</p>
            </div>
            <div className="w-px bg-[var(--sl-border)]" />
            <div>
              <p className="font-[DM_Mono] font-bold leading-none text-[var(--sl-t1)]" style={{ fontSize: '36px' }}>
                {track.total_hours}h
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sl-t3)] mt-1">Estudadas</p>
            </div>
            <div className="w-px bg-[var(--sl-border)]" />
            <div>
              <p className="font-[DM_Mono] font-bold leading-none text-[var(--sl-t1)]" style={{ fontSize: '36px' }}>
                {(effectiveTrack?.cost ?? track.cost) != null ? `R$ ${(effectiveTrack?.cost ?? track.cost)!.toFixed(0)}` : '\u2014'}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sl-t3)] mt-1">Investido</p>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE + RIGHT COLUMN SPLIT */}
      <div className="grid grid-cols-[1fr_380px] gap-[14px] max-lg:grid-cols-1">

        {/* LEFT: Vertical Timeline steps */}
        {steps.length > 0 && (
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up sl-delay-2 transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex items-center gap-[9px] mb-[18px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                Etapas da Trilha
              </h2>
            </div>

            <div className="relative">
              {steps.map((step, idx) => {
                const isLast = idx === steps.length - 1
                const isNext = !step.is_completed && step.id === nextStep?.id
                const isPending = !step.is_completed && !isNext

                return (
                  <div
                    key={step.id}
                    className="relative"
                    style={{ paddingLeft: '42px', paddingBottom: isLast ? 0 : '18px' }}
                  >
                    {/* Vertical line */}
                    {!isLast && (
                      <div
                        className="absolute left-[15px] top-[24px] bottom-0 w-[2px]"
                        style={{ background: step.is_completed ? '#10b981' : 'var(--sl-s3)' }}
                      />
                    )}

                    {/* Dot */}
                    <div
                      className={cn(
                        'absolute left-[7px] top-1 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] z-[1]',
                      )}
                      style={{
                        background: step.is_completed ? '#10b981' : isNext ? '#eab308' : 'var(--sl-s3)',
                        color: step.is_completed ? '#fff' : isNext ? '#000' : 'var(--sl-t3)',
                        boxShadow: isNext ? '0 0 0 4px rgba(234,179,8,.2)' : undefined,
                        animation: isNext ? 'tl-pulse 2s infinite' : undefined,
                      }}
                    >
                      {step.is_completed ? (
                        <Check size={10} strokeWidth={3} />
                      ) : isNext ? (
                        <Play size={9} fill="currentColor" stroke="none" />
                      ) : (
                        <span className="text-[9px] font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={cn(
                        'rounded-xl px-[14px] py-[10px]',
                        isNext ? 'border-2' : 'bg-[var(--sl-s2)]',
                      )}
                      style={isNext ? {
                        borderColor: '#eab308',
                        background: 'rgba(234,179,8,.06)',
                      } : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={step.is_completed}
                            onChange={(e) => handleToggleStep(step.id, track.id, e.target.checked)}
                            className="accent-[#eab308] w-4 h-4 rounded shrink-0"
                          />
                          <span
                            className={cn(
                              'text-[13px]',
                              step.is_completed ? 'text-[var(--sl-t3)] line-through' : 'text-[var(--sl-t1)]',
                              isNext && 'font-semibold'
                            )}
                          >
                            {step.title}
                            {isNext && (
                              <span className="ml-1.5 text-[10px] font-medium text-[#eab308]">proximo</span>
                            )}
                          </span>
                        </label>
                        {step.completed_at && (
                          <span className="text-[10px] text-[var(--sl-t3)] shrink-0 ml-2">
                            {new Date(step.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-[18px] pt-[14px] border-t border-[var(--sl-border)]">
              <button
                onClick={handleToggleStatus}
                className="flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-[10px] text-[12px] font-semibold
                           bg-transparent text-[var(--sl-t2)] border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
              >
                <Pause size={14} />
                {(effectiveTrack?.status ?? track.status) === 'in_progress' ? 'Pausar' : 'Retomar'}
              </button>
              <button
                onClick={() => setEditOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-[10px] text-[12px] font-semibold
                           bg-transparent text-[var(--sl-t2)] border border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
              >
                <Pencil size={14} />
                Editar
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-[10px] text-[12px] font-semibold
                           text-[#f43f5e] hover:bg-[rgba(244,63,94,0.1)] transition-colors border border-transparent"
              >
                <X size={14} />
                Excluir
              </button>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-[14px]">
          {/* Placeholder chart card */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up sl-delay-3 transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex items-center gap-[9px] mb-[18px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                Horas de Estudo
              </h2>
            </div>
            <div className="border border-dashed border-[var(--sl-border)] rounded-xl p-5 flex items-center justify-center text-[var(--sl-t3)] text-[12px] min-h-[200px]">
              Grafico de horas de estudo por semana
            </div>
          </div>

          {/* Notes */}
          {(effectiveTrack?.notes ?? track.notes) && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 sl-fade-up sl-delay-4 transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-[9px] mb-3">
                <BookOpen size={16} className="text-[#eab308]" />
                <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                  Notas
                </h2>
              </div>
              <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed">
                {effectiveTrack?.notes ?? track.notes}
              </p>
            </div>
          )}
        </div>
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
