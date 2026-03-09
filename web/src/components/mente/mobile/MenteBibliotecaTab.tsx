'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { StudyResource, ResourceType, ResourceStatus } from '@/hooks/use-mente'
import { RESOURCE_TYPE_LABELS } from '@/hooks/use-mente'

const MENTE_COLOR = '#eab308'
const MENTE_BG = 'rgba(234,179,8,0.14)'
const MENTE_BORDER = 'rgba(234,179,8,0.3)'

const TYPE_ICONS: Record<ResourceType, string> = {
  book: '📚',
  video: '🎥',
  pdf: '📄',
  note: '📝',
  link: '🔗',
  other: '🎧',
}

const FILTER_OPTIONS = [
  { label: 'Todos', value: null as ResourceType | null },
  { label: '📚 Livros', value: 'book' as ResourceType },
  { label: '🎥 Cursos', value: 'video' as ResourceType },
  { label: '🎧 Podcasts', value: 'other' as ResourceType },
  { label: '🔗 Artigos', value: 'link' as ResourceType },
]

interface AddResourceForm {
  title: string
  type: ResourceType
  url: string
  personal_notes: string
}

function useAllResources() {
  const [resources, setResources] = useState<StudyResource[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const sb = supabase as any

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await sb
        .from('study_resources')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
      setResources(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const addResource = useCallback(async (form: AddResourceForm) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: tracks } = await sb
      .from('study_tracks')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
    const trackId = tracks?.[0]?.id
    if (!trackId) return

    await sb.from('study_resources').insert({
      track_id: trackId,
      user_id: user.id,
      title: form.title,
      type: form.type,
      url: form.url || null,
      personal_notes: form.personal_notes || null,
      status: 'to_study' as ResourceStatus,
    })
    await load()
  }, [load])

  const updateStatus = useCallback(async (id: string, status: ResourceStatus) => {
    await sb.from('study_resources').update({ status }).eq('id', id)
    setResources((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
  }, [])

  const deleteResource = useCallback(async (id: string) => {
    await sb.from('study_resources').delete().eq('id', id)
    setResources((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return { resources, loading, addResource, updateStatus, deleteResource }
}

export function MenteBibliotecaTab() {
  const { resources, loading, addResource, updateStatus, deleteResource } = useAllResources()
  const [filterType, setFilterType] = useState<ResourceType | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<AddResourceForm>({
    title: '',
    type: 'link',
    url: '',
    personal_notes: '',
  })
  const [saving, setSaving] = useState(false)

  const filtered = filterType
    ? resources.filter((r) => r.type === filterType)
    : resources

  const studying = filtered.filter((r) => r.status === 'studying')
  const toStudy = filtered.filter((r) => r.status === 'to_study')

  async function handleAdd() {
    if (!form.title.trim()) return
    setSaving(true)
    await addResource(form)
    setForm({ title: '', type: 'link', url: '', personal_notes: '' })
    setShowAddForm(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="px-4 pt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Type filter pills */}
      <div className="flex gap-[6px] px-4 py-3 overflow-x-auto scrollbar-hide">
        {FILTER_OPTIONS.map(({ label, value }) => {
          const active = filterType === value
          return (
            <button
              key={label}
              onClick={() => setFilterType(value)}
              className="px-[14px] py-[7px] rounded-full text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-colors"
              style={{
                background: active ? MENTE_COLOR : 'var(--sl-s1)',
                color: active ? '#fff' : 'var(--sl-t2)',
                border: active ? 'none' : '1px solid var(--sl-border)',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Em andamento */}
      {studying.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pt-1 pb-2">
            Em andamento
          </p>
          {studying.map((r) => (
            <div
              key={r.id}
              className="mx-4 mb-3 rounded-2xl p-3 cursor-pointer hover:border-[var(--sl-border-h)] transition-colors"
              style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
            >
              <div className="flex gap-3 items-start">
                <div
                  className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-[22px] flex-shrink-0"
                  style={{ background: MENTE_BG }}
                >
                  {TYPE_ICONS[r.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-[var(--sl-t1)] truncate">{r.title}</div>
                  <div className="text-[12px] text-[var(--sl-t2)] mt-[1px]">
                    {RESOURCE_TYPE_LABELS[r.type]}{r.url ? ` · ${r.url.replace(/^https?:\/\//, '').split('/')[0]}` : ''}
                  </div>
                  <button
                    onClick={() => updateStatus(r.id, 'completed')}
                    className="text-[11px] mt-2 px-2 py-[2px] rounded-[6px]"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                  >
                    ✓ Marcar concluído
                  </button>
                </div>
                <ChevronRight size={14} className="text-[var(--sl-t3)] flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </>
      )}

      {/* Salvos para depois */}
      {toStudy.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pt-2 pb-2">
            Salvos para depois
          </p>
          <div
            style={{
              background: 'var(--sl-s1)',
              borderTop: '1px solid var(--sl-border)',
              borderBottom: '1px solid var(--sl-border)',
            }}
          >
            {toStudy.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 px-5 py-3 border-b border-[var(--sl-border)] last:border-b-0"
              >
                <div
                  className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-[18px] flex-shrink-0"
                  style={{ background: MENTE_BG }}
                >
                  {TYPE_ICONS[r.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-[var(--sl-t1)] truncate">{r.title}</div>
                  <div className="text-[12px] text-[var(--sl-t2)] mt-[1px]">
                    {RESOURCE_TYPE_LABELS[r.type]}{r.personal_notes ? ` · ${r.personal_notes}` : ''}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateStatus(r.id, 'studying')}
                    className="text-[11px] px-2 py-[2px] rounded-[6px]"
                    style={{ background: MENTE_BG, color: MENTE_COLOR }}
                  >
                    Estudar
                  </button>
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={14} className="text-[var(--sl-t3)]" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {filtered.length === 0 && !showAddForm && (
        <div className="mx-4 mt-4 py-8 text-center text-[13px] text-[var(--sl-t2)]">
          Nenhum recurso salvo ainda.
        </div>
      )}

      {/* Add resource button / form */}
      <div className="px-4 mt-4">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full rounded-[10px] py-[14px] text-[14px] font-medium text-center"
            style={{
              background: 'rgba(139,92,246,0.06)',
              border: `1.5px dashed ${MENTE_BORDER}`,
              color: MENTE_COLOR,
            }}
          >
            + Adicionar recurso
          </button>
        ) : (
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            <p className="text-[13px] font-semibold text-[var(--sl-t1)]">Novo recurso</p>

            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ResourceType }))}
              className="w-full rounded-[10px] px-3 py-2 text-[13px] text-[var(--sl-t1)] outline-none"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            >
              {Object.entries(RESOURCE_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{TYPE_ICONS[k as ResourceType]} {v}</option>
              ))}
            </select>

            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Título"
              className="w-full rounded-[10px] px-3 py-2 text-[13px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />

            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="URL (opcional)"
              className="w-full rounded-[10px] px-3 py-2 text-[13px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />

            <textarea
              value={form.personal_notes}
              onChange={(e) => setForm((f) => ({ ...f, personal_notes: e.target.value }))}
              placeholder="Notas pessoais (opcional)"
              rows={2}
              className="w-full rounded-[10px] px-3 py-2 text-[13px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)] resize-none"
              style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 rounded-[10px] text-[13px] text-[var(--sl-t2)]"
                style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !form.title.trim()}
                className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white disabled:opacity-50"
                style={{ background: MENTE_COLOR }}
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
