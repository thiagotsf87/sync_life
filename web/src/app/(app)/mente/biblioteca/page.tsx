'use client'

import { useState, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import {
  useStudyTracks, useStudyResources,
  useAddResource, useDeleteResource, useUpdateResourceStatus,
  type ResourceType, type ResourceStatus, type AddResourceData,
} from '@/hooks/use-mente'
import { RESOURCE_TYPE_LABELS, RESOURCE_STATUS_LABELS } from '@/hooks/use-mente'
import { ResourceCard } from '@/components/mente/ResourceCard'

const RESOURCE_TYPES: ResourceType[] = ['link', 'book', 'video', 'pdf', 'note', 'other']
const RESOURCE_STATUSES: ResourceStatus[] = ['to_study', 'studying', 'completed']

export default function BibliotecaPage() {
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { tracks } = useStudyTracks()
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | 'all'>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const { resources, loading, reload } = useStudyResources(selectedTrackId)
  const addResource = useAddResource()
  const deleteResource = useDeleteResource()
  const updateResourceStatus = useUpdateResourceStatus()

  // Form state
  const [form, setForm] = useState<AddResourceData>({
    title: '',
    type: 'link',
    url: '',
    personal_notes: '',
    status: 'to_study',
  })

  const filtered = statusFilter === 'all'
    ? resources
    : resources.filter(r => r.status === statusFilter)

  const activeTracks = tracks.filter(t => t.status === 'in_progress' || t.status === 'paused')

  const handleAdd = useCallback(async () => {
    if (!selectedTrackId || !form.title.trim()) return
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
  }, [selectedTrackId, form, addResource, reload])

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
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className={cn(
          'font-[Syne] font-extrabold text-2xl',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          📚 Biblioteca de Recursos
        </h1>
        <div className="flex-1" />
        {selectedTrackId && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                       bg-[#a855f7] text-white hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Adicionar Recurso
          </button>
        )}
      </div>

      {/* Track selector */}
      <div className="mb-5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-2 block">
          Selecionar Trilha
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedTrackId(null)}
            className={cn(
              'px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all border',
              !selectedTrackId
                ? 'bg-[#a855f7] text-white border-[#a855f7]'
                : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            Todas
          </button>
          {activeTracks.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTrackId(t.id)}
              className={cn(
                'px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all border max-w-[200px] truncate',
                selectedTrackId === t.id
                  ? 'bg-[#a855f7] text-white border-[#a855f7]'
                  : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      {selectedTrackId && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {(['all', ...RESOURCE_STATUSES] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border',
                statusFilter === s
                  ? 'bg-[#a855f7] text-white border-[#a855f7]'
                  : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
              )}
            >
              {s === 'all' ? 'Todos' : RESOURCE_STATUS_LABELS[s]}
            </button>
          ))}
          <span className="text-[11px] text-[var(--sl-t3)] ml-auto">
            {filtered.length} recurso{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Content */}
      {!selectedTrackId ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">📖</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            Selecione uma trilha
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)]">
            Os recursos são organizados por trilha de aprendizado.
          </p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">📎</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            {statusFilter !== 'all' ? 'Nenhum recurso com este status' : 'Nenhum recurso ainda'}
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">
            Adicione links, livros e materiais de referência para esta trilha.
          </p>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                       bg-[#a855f7] text-white hover:opacity-90"
          >
            <Plus size={15} />
            Adicionar Recurso
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
          {filtered.map((resource, idx) => (
            <div key={resource.id} className={`sl-delay-${Math.min(idx + 1, 5)}`}>
              <ResourceCard
                resource={resource}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-[420px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden shadow-2xl">

            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Novo Recurso</h2>
              <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--sl-s2)]">
                <X size={16} className="text-[var(--sl-t2)]" />
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-3">
              {/* Title */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Título *</label>
                <input
                  autoFocus
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Nome do recurso..."
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#a855f7] transition-colors"
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
                          ? 'border-[#a855f7] bg-[#a855f7]/10 text-[var(--sl-t1)]'
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
                    className="w-full px-3 py-2 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#a855f7] transition-colors"
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
                          ? 'border-[#a855f7] bg-[#a855f7]/10 text-[var(--sl-t1)]'
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
                  placeholder="Suas anotações sobre o recurso..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-[10px] text-[13px] resize-none bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#a855f7] transition-colors"
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
                    : 'bg-[#a855f7] text-white hover:opacity-90'
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
