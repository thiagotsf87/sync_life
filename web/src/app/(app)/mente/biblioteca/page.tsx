'use client'

import { useState, useCallback } from 'react'
import { Plus, X, Search, Brain, Link2, Video, BookOpen, FileText, StickyNote, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useStudyTracks, useStudyResources,
  useAddResource, useDeleteResource, useUpdateResourceStatus,
  type ResourceType, type ResourceStatus, type AddResourceData,
} from '@/hooks/use-mente'
import { RESOURCE_TYPE_LABELS, RESOURCE_STATUS_LABELS } from '@/hooks/use-mente'
import { ModuleHeader } from '@/components/ui/module-header'
import { useUserPlan } from '@/hooks/use-user-plan'
import { checkPlanLimit } from '@/lib/plan-limits'

const RESOURCE_TYPES: ResourceType[] = ['link', 'book', 'video', 'pdf', 'note', 'other']
const RESOURCE_STATUSES: ResourceStatus[] = ['to_study', 'studying', 'completed']

const TYPE_ICONS: Record<ResourceType, typeof Link2> = {
  link: Link2,
  video: Video,
  book: BookOpen,
  pdf: FileText,
  note: StickyNote,
  other: Paperclip,
}

const TYPE_COLORS: Record<ResourceType, string> = {
  link: '#3b82f6',
  video: '#f43f5e',
  book: '#a855f7',
  pdf: '#f97316',
  note: '#eab308',
  other: '#64748b',
}

const STATUS_STYLES: Record<ResourceStatus, { bg: string; color: string; label: string }> = {
  to_study: { bg: 'rgba(120,165,220,.10)', color: 'var(--sl-t2)', label: 'Para estudar' },
  studying: { bg: 'rgba(234,179,8,.12)', color: '#eab308', label: 'Estudando' },
  completed: { bg: 'rgba(16,185,129,.12)', color: '#10b981', label: 'Concluido' },
}

export default function BibliotecaPage() {
  const { tracks } = useStudyTracks()
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const { resources, loading, reload } = useStudyResources(selectedTrackId)
  const addResource = useAddResource()
  const deleteResource = useDeleteResource()
  const updateResourceStatus = useUpdateResourceStatus()
  const { isPro } = useUserPlan()

  // Form state
  const [form, setForm] = useState<AddResourceData>({
    title: '',
    type: 'link',
    url: '',
    personal_notes: '',
    status: 'to_study',
  })

  let filtered = statusFilter === 'all'
    ? resources
    : resources.filter(r => r.status === statusFilter)

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(r => r.title.toLowerCase().includes(q))
  }

  const activeTracks = tracks.filter(t => t.status === 'in_progress' || t.status === 'paused')
  const selectedTrackName = activeTracks.find(t => t.id === selectedTrackId)?.name

  const handleAdd = useCallback(async () => {
    if (!selectedTrackId || !form.title.trim()) return
    const limitCheck = checkPlanLimit(isPro, 'resources_per_track', resources.length)
    if (!limitCheck.allowed) {
      toast.error(limitCheck.upsellMessage)
      return
    }
    setIsAdding(true)
    try {
      await addResource(selectedTrackId, {
        title: form.title.trim(),
        type: form.type,
        url: form.url?.trim() || null,
        personal_notes: form.personal_notes?.trim() || null,
        status: form.status,
      })
      toast.success('Recurso adicionado!')
      setAddOpen(false)
      setForm({ title: '', type: 'link', url: '', personal_notes: '', status: 'to_study' })
      await reload()
    } catch {
      toast.error('Erro ao adicionar recurso')
    } finally {
      setIsAdding(false)
    }
  }, [selectedTrackId, form, addResource, reload, resources.length, isPro])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteResource(id)
      toast.success('Recurso removido')
      await reload()
    } catch {
      toast.error('Erro ao remover recurso')
    }
  }, [deleteResource, reload])

  const handleUpdateStatus = useCallback(async (id: string, status: ResourceStatus) => {
    try {
      await updateResourceStatus(id, status)
      await reload()
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }, [updateResourceStatus, reload])

  return (
    <div className="max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* ModuleHeader */}
      <ModuleHeader
        icon={BookOpen}
        iconBg="rgba(234,179,8,.1)"
        iconColor="#eab308"
        title="Biblioteca de Recursos"
        subtitle={selectedTrackName ? `${filtered.length} recursos vinculados \u00B7 ${selectedTrackName} selecionada` : 'Selecione uma trilha para ver recursos'}
      >
        {selectedTrackId && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                       bg-[#eab308] text-black hover:brightness-110 transition-all"
          >
            <Plus size={16} />
            Adicionar Recurso
          </button>
        )}
      </ModuleHeader>

      {/* Search + Track selector + Filters toolbar */}
      <div className="flex items-center gap-[14px] mb-5 flex-wrap sl-fade-up sl-delay-1">
        <div className="flex items-center gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3.5 py-2 flex-1 min-w-[200px] max-w-[320px]
                        focus-within:border-[rgba(234,179,8,.4)] transition-colors">
          <Search size={16} className="text-[var(--sl-t3)] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar recurso..."
            className="bg-transparent text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none w-full"
          />
        </div>

        <select
          value={selectedTrackId ?? ''}
          onChange={e => setSelectedTrackId(e.target.value || null)}
          className="px-3.5 py-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] text-[13px] text-[var(--sl-t1)] outline-none cursor-pointer"
        >
          <option value="">Todas as trilhas</option>
          {activeTracks.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-[6px] ml-auto">
          {(['all', ...RESOURCE_STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-[14px] py-[6px] rounded-lg text-[12px] font-medium transition-all border',
                statusFilter === s
                  ? 'bg-[rgba(234,179,8,.08)] border-[#eab308] text-[#eab308] font-semibold'
                  : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
              )}
            >
              {s === 'all' ? 'Todos' : RESOURCE_STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-[var(--sl-t3)] font-medium">
          {filtered.length} recurso{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content */}
      {!selectedTrackId ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-10 text-center">
          <BookOpen size={32} className="text-[#eab308] mx-auto mb-3 opacity-60" />
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            Selecione uma trilha
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)]">
            Os recursos sao organizados por trilha de aprendizado.
          </p>
        </div>
      ) : loading ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] overflow-hidden">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 border-b border-[var(--sl-border)] bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-10 text-center">
          <BookOpen size={32} className="text-[#eab308] mx-auto mb-3 opacity-60" />
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            {statusFilter !== 'all' ? 'Nenhum recurso com este status' : 'Nenhum recurso ainda'}
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">
            Adicione links, livros e materiais de referencia para esta trilha.
          </p>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                       bg-[#eab308] text-black hover:brightness-110"
          >
            <Plus size={15} />
            Adicionar Recurso
          </button>
        </div>
      ) : (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] overflow-hidden sl-fade-up sl-delay-2 transition-colors hover:border-[var(--sl-border-h)]">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] py-0 px-3 pb-3 pt-5 pl-[22px] w-[42px] border-b border-[var(--sl-border)]">Tipo</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] py-0 px-3 pb-3 pt-5 border-b border-[var(--sl-border)]">Recurso</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] py-0 px-3 pb-3 pt-5 border-b border-[var(--sl-border)]">Fonte / Detalhes</th>
                <th className="text-center text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] py-0 px-3 pb-3 pt-5 border-b border-[var(--sl-border)] w-[100px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((resource) => {
                const TypeIcon = TYPE_ICONS[resource.type as ResourceType] ?? Paperclip
                const typeColor = TYPE_COLORS[resource.type as ResourceType] ?? '#64748b'
                const statusStyle = STATUS_STYLES[resource.status as ResourceStatus] ?? STATUS_STYLES.to_study

                return (
                  <tr key={resource.id} className="hover:bg-[rgba(120,165,220,.02)] transition-colors">
                    <td className="py-3 px-3 pl-[22px] align-middle border-b border-[rgba(120,165,220,.04)]">
                      <div
                        className="w-8 h-8 rounded-[9px] flex items-center justify-center"
                        style={{ background: `${typeColor}1a` }}
                      >
                        <TypeIcon size={15} style={{ color: typeColor }} />
                      </div>
                    </td>
                    <td className="py-3 px-3 align-middle text-[13px] font-medium text-[var(--sl-t1)] border-b border-[rgba(120,165,220,.04)]">
                      {resource.title}
                    </td>
                    <td className="py-3 px-3 align-middle text-[11px] text-[var(--sl-t3)] border-b border-[rgba(120,165,220,.04)]">
                      {resource.url
                        ? resource.url.replace(/^https?:\/\//, '').split('/').slice(0, 2).join('/')
                        : resource.personal_notes
                          ? resource.personal_notes.substring(0, 60)
                          : '\u2014'}
                    </td>
                    <td className="py-3 px-3 align-middle text-center border-b border-[rgba(120,165,220,.04)]">
                      <select
                        value={resource.status}
                        onChange={e => handleUpdateStatus(resource.id, e.target.value as ResourceStatus)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border-none outline-none cursor-pointer"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {RESOURCE_STATUSES.map(s => (
                          <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Resource Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-[420px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] overflow-hidden shadow-2xl">

            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Novo Recurso</h2>
              <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--sl-s2)]">
                <X size={16} className="text-[var(--sl-t2)]" />
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-3">
              {/* Title */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Titulo *</label>
                <input
                  autoFocus
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Nome do recurso..."
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#eab308] transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Tipo</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {RESOURCE_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={cn(
                        'px-2 py-1.5 rounded-[8px] text-[11px] border transition-all',
                        form.type === t
                          ? 'border-[#eab308] bg-[#eab308]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      {RESOURCE_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL */}
              {form.type !== 'note' && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">URL (opcional)</label>
                  <input
                    type="url"
                    value={form.url ?? ''}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#eab308] transition-colors"
                  />
                </div>
              )}

              {/* Status */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Status</label>
                <div className="flex gap-1.5">
                  {RESOURCE_STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={cn(
                        'flex-1 py-1.5 rounded-[8px] text-[11px] border transition-all',
                        form.status === s
                          ? 'border-[#eab308] bg-[#eab308]/10 text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t2)]'
                      )}
                    >
                      {RESOURCE_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Nota pessoal (opcional)</label>
                <textarea
                  value={form.personal_notes ?? ''}
                  onChange={e => setForm(f => ({ ...f, personal_notes: e.target.value }))}
                  placeholder="Suas anotacoes sobre o recurso..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-[10px] text-[13px] resize-none bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#eab308] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--sl-border)]">
              <button
                onClick={() => setAddOpen(false)}
                className="px-4 py-2 rounded-[10px] text-[13px] font-medium text-[var(--sl-t2)] hover:bg-[var(--sl-s2)]"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={isAdding || !form.title.trim()}
                className={cn(
                  'px-5 py-2 rounded-[10px] text-[13px] font-semibold transition-all',
                  !form.title.trim() || isAdding
                    ? 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
                    : 'bg-[#eab308] text-black hover:brightness-110'
                )}
              >
                {isAdding ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
