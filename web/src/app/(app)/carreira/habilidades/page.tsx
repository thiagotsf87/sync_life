'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import {
  useSkills, useSaveSkill, useDeleteSkill,
  SKILL_CATEGORY_LABELS, SKILL_LEVEL_LABELS,
  type Skill, type SkillCategory, type SaveSkillData,
} from '@/hooks/use-carreira'
import { SkillCard } from '@/components/carreira/SkillCard'

const CATEGORIES: SkillCategory[] = ['hard_skill', 'soft_skill', 'language', 'certification']

const CATEGORY_ICONS: Record<SkillCategory, string> = {
  hard_skill: '⚙️',
  soft_skill: '🤝',
  language: '🌐',
  certification: '🎖️',
}

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  hard_skill: '#0055ff',
  soft_skill: '#10b981',
  language: '#f59e0b',
  certification: '#a855f7',
}

const EMPTY_FORM: SaveSkillData & { notes: string } = {
  name: '',
  category: 'hard_skill',
  proficiency_level: 3,
  notes: '',
}

export default function HabilidadesPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { skills, loading, error, reload } = useSkills()
  const saveSkill = useSaveSkill()
  const deleteSkill = useDeleteSkill()

  const [showModal, setShowModal] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<SkillCategory | 'all'>('all')
  const [form, setForm] = useState(EMPTY_FORM)

  function openCreate() {
    setEditingSkill(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(skill: Skill) {
    setEditingSkill(skill)
    setForm({
      name: skill.name,
      category: skill.category,
      proficiency_level: skill.proficiency_level,
      notes: skill.notes ?? '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Informe o nome da habilidade'); return }
    setIsSaving(true)
    try {
      await saveSkill({ ...form, notes: form.notes || null }, editingSkill?.id)
      toast.success(editingSkill ? 'Habilidade atualizada!' : 'Habilidade adicionada!')
      setShowModal(false)
      await reload()
    } catch {
      toast.error('Erro ao salvar habilidade')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteSkill(id)
      toast.success('Habilidade removida')
      await reload()
    } catch {
      toast.error('Erro ao remover')
    }
  }

  // Filter
  const filtered = skills.filter(s => {
    const matchCat = filterCat === 'all' || s.category === filterCat
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // Group by category
  const grouped = CATEGORIES.map(cat => ({
    cat,
    skills: filtered.filter(s => s.category === cat),
  })).filter(g => g.skills.length > 0)

  const totalByLevel = (level: number) => skills.filter(s => s.proficiency_level >= level).length

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
          ⭐ Habilidades
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#f59e0b] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {/* Stats bar */}
      {skills.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
          {[
            { label: 'Total', value: skills.length, color: '#f59e0b' },
            { label: 'Avançadas (≥4)', value: totalByLevel(4), color: '#10b981' },
            { label: 'Expert (5)', value: totalByLevel(5), color: '#0055ff' },
            { label: 'Certificações', value: skills.filter(s => s.category === 'certification').length, color: '#a855f7' },
          ].map(stat => (
            <div key={stat.label} className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 overflow-hidden">
              <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: stat.color }} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">{stat.label}</p>
              <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)]">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sl-t3)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar habilidade..."
            className="w-full pl-8 pr-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)]"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterCat('all')}
            className={cn(
              'px-3 py-1.5 rounded-[8px] text-[11px] font-medium border transition-all',
              filterCat === 'all'
                ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[var(--sl-t1)]'
                : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            Todas
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-[11px] font-medium border transition-all',
                filterCat === cat
                  ? 'text-[var(--sl-t1)]'
                  : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
              )}
              style={filterCat === cat ? {
                borderColor: CATEGORY_COLORS[cat],
                background: CATEGORY_COLORS[cat] + '20',
              } : undefined}
            >
              {CATEGORY_ICONS[cat]} {SKILL_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 rounded-xl bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            {skills.length === 0 ? 'Nenhuma habilidade cadastrada' : 'Nenhuma habilidade encontrada'}
          </h3>
          {skills.length === 0 && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#f59e0b] text-[#03071a] hover:opacity-90 mt-3"
            >
              <Plus size={15} />
              Adicionar habilidade
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ cat, skills: catSkills }) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                <h2 className="font-[Syne] font-bold text-[13px]" style={{ color: CATEGORY_COLORS[cat] }}>
                  {SKILL_CATEGORY_LABELS[cat]}
                </h2>
                <span className="text-[10px] text-[var(--sl-t3)]">({catSkills.length})</span>
                <div className="flex-1 h-px bg-[var(--sl-border)]" />
              </div>
              <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {catSkills.map(skill => (
                  <SkillCard key={skill.id} skill={skill} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[460px]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                {editingSkill ? '✏️ Editar Habilidade' : '⭐ Nova Habilidade'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors text-xl leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Nome da Habilidade</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: React, Negociação, Inglês..."
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Categoria</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setForm(f => ({ ...f, category: cat }))}
                      className={cn(
                        'px-2 py-1.5 rounded-[8px] text-[11px] border transition-all text-left',
                        form.category === cat
                          ? 'text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                      style={form.category === cat ? {
                        borderColor: CATEGORY_COLORS[cat],
                        background: CATEGORY_COLORS[cat] + '15',
                      } : undefined}
                    >
                      {CATEGORY_ICONS[cat]} {SKILL_CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-2 block">
                  Nível — {SKILL_LEVEL_LABELS[form.proficiency_level]}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(l => {
                    const color = CATEGORY_COLORS[form.category]
                    return (
                      <button
                        key={l}
                        onClick={() => setForm(f => ({ ...f, proficiency_level: l }))}
                        className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-all"
                        style={{
                          borderColor: l <= form.proficiency_level ? color : 'var(--sl-border)',
                          background: l <= form.proficiency_level ? color + '20' : 'transparent',
                          color: l <= form.proficiency_level ? color : 'var(--sl-t3)',
                        }}
                      >
                        {l}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Notas (opcional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Contexto, certificações, projetos..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f59e0b] text-[#03071a] hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isSaving ? 'Salvando...' : editingSkill ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
