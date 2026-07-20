'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Star, BarChart3, X, Settings2, Users2, Languages, Award, BookOpen, Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useSkills, useSaveSkill, useDeleteSkill, useSetSkillTracks,
  useProfessionalProfile, useCareerHistory, useCareerRoadmaps, useAddHistoryEntry,
  SKILL_CATEGORY_LABELS, SKILL_LEVEL_LABELS,
  type Skill, type SkillCategory, type SaveSkillData,
} from '@/hooks/use-carreira'
import { CarreiraMobile } from '@/components/carreira/CarreiraMobile'
import { ModuleHeader } from '@/components/ui/module-header'
import { MetricsStrip } from '@/components/ui/metrics-strip'
import { TextField } from '@/components/ui/text-field'
import { useStudyTracks } from '@/hooks/use-mente'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Tooltip as ReTooltip,
} from 'recharts'

const CARREIRA = '#DB6478'
const CATEGORIES: SkillCategory[] = ['hard_skill', 'soft_skill', 'language', 'certification']

const CATEGORY_ICONS: Record<SkillCategory, typeof Settings2> = {
  hard_skill: Settings2,
  soft_skill: Users2,
  language: Languages,
  certification: Award,
}

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  hard_skill: 'var(--sl-petrol)',
  soft_skill: 'var(--sl-em)',
  language: 'var(--sl-warning)',
  certification: '#8B7BD4',
}

// Static hex equivalents for color values that need string concatenation (radar fill)
const CATEGORY_HEX: Record<SkillCategory, string> = {
  hard_skill: '#0B2D34',
  soft_skill: '#0F766E',
  language: '#D9962E',
  certification: '#8B7BD4',
}

const EMPTY_FORM: SaveSkillData & { notes: string } = {
  name: '',
  category: 'hard_skill',
  proficiency_level: 3,
  notes: '',
}

export default function HabilidadesPage() {
  const router = useRouter()

  const { skills, loading, error, reload } = useSkills()
  const { profile } = useProfessionalProfile()
  const { history } = useCareerHistory()
  const { roadmaps } = useCareerRoadmaps()
  const activeRoadmap = roadmaps.find(r => r.status === 'active') ?? null
  const saveSkill = useSaveSkill()
  const addHistory = useAddHistoryEntry()
  const deleteSkill = useDeleteSkill()
  const setSkillTracks = useSetSkillTracks()
  const { tracks } = useStudyTracks()

  const [showModal, setShowModal] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<SkillCategory | 'all'>('all')
  const [form, setForm] = useState(EMPTY_FORM)
  const [linkedTrackIds, setLinkedTrackIds] = useState<string[]>([])

  function openCreate() {
    setEditingSkill(null)
    setForm(EMPTY_FORM)
    setLinkedTrackIds([])
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
    setLinkedTrackIds(skill.linked_track_ids ?? [])
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Informe o nome da habilidade'); return }
    setIsSaving(true)
    try {
      const wasLevelChange = editingSkill && editingSkill.proficiency_level !== form.proficiency_level
      const saved = await saveSkill({ ...form, notes: form.notes || null }, editingSkill?.id)
      await setSkillTracks(saved.id, linkedTrackIds)
      toast.success(editingSkill ? 'Habilidade atualizada!' : 'Habilidade adicionada!')
      if (wasLevelChange && form.proficiency_level > (editingSkill?.proficiency_level ?? 0)) {
        setTimeout(() => {
          toast.info('Nível de habilidade aumentado', {
            description: 'Verifique se algum passo do seu Roadmap foi desbloqueado.',
            action: { label: 'Ver roadmap', onClick: () => router.push('/carreira/roadmap') },
            duration: 8000,
          })
        }, 1000)
      }
      setShowModal(false)
      await reload()
    } catch {
      toast.error('Erro ao salvar habilidade')
    } finally {
      setIsSaving(false)
    }
  }

  // Filter
  const filtered = skills.filter(s => {
    const matchCat = filterCat === 'all' || s.category === filterCat
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

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
        icon={Star}
        iconBg="rgba(219,100,120,.08)"
        iconColor={CARREIRA}
        title="Habilidades"
        subtitle={skills.length > 0
          ? `${skills.length} habilidades mapeadas · Media de proficiencia: ${(skills.reduce((a, s) => a + s.proficiency_level, 0) / Math.max(1, skills.length)).toFixed(1)} / 5`
          : 'Mapeie suas habilidades profissionais'}
      >
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                     text-white hover:brightness-110 transition-all"
          style={{ background: 'var(--sl-em)' }}
        >
          <Plus size={16} />
          Adicionar habilidade
        </button>
      </ModuleHeader>

      {/* Metrics Strip */}
      {skills.length > 0 && (
        <MetricsStrip
          className="mb-7 sl-fade-up sl-delay-1"
          items={[
            { label: 'Total', value: String(skills.length), note: 'habilidades', valueColor: CARREIRA },
            { label: 'Hard skills', value: String(skills.filter(s => s.category === 'hard_skill').length), note: 'tecnicas', valueColor: CATEGORY_HEX.hard_skill },
            { label: 'Soft skills', value: String(skills.filter(s => s.category === 'soft_skill').length), note: 'comportamentais', valueColor: CATEGORY_HEX.soft_skill },
            { label: 'Idiomas', value: String(skills.filter(s => s.category === 'language').length), note: 'linguas', valueColor: CATEGORY_HEX.language },
            { label: 'Certificacoes', value: String(skills.filter(s => s.category === 'certification').length), note: 'atestados', valueColor: CATEGORY_HEX.certification },
          ]}
        />
      )}

      {/* TWO-COLUMN LAYOUT: Skills table + Radar sidebar */}
      <div className="grid grid-cols-[1fr_320px] gap-5 max-lg:grid-cols-1">

        {/* Left: Skills Table */}
        <div className="sl-fade-up sl-delay-2">
          {/* Category tabs + search */}
          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <div className="flex gap-0 border-b border-[var(--sl-border)] flex-1 min-w-0">
              <button
                onClick={() => setFilterCat('all')}
                className={cn(
                  'px-[18px] py-[9px] text-[12px] font-semibold border-b-2 transition-all',
                  filterCat === 'all'
                    ? 'text-[var(--sl-t1)]'
                    : 'text-[var(--sl-t3)] border-b-transparent hover:text-[var(--sl-t2)]'
                )}
                style={filterCat === 'all' ? { borderBottomColor: CARREIRA } : undefined}
              >
                Todas
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={cn(
                    'px-[18px] py-[9px] text-[12px] font-semibold border-b-2 transition-all',
                    filterCat === cat
                      ? 'text-[var(--sl-t1)]'
                      : 'text-[var(--sl-t3)] border-b-transparent hover:text-[var(--sl-t2)]'
                  )}
                  style={filterCat === cat ? { borderBottomColor: CARREIRA } : undefined}
                >
                  {SKILL_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-em)] w-[160px]"
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 rounded-xl bg-[var(--sl-s2)] animate-pulse" />)}
            </div>
          ) : error ? (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-8 text-center">
              <p className="text-[13px] text-[var(--sl-t2)]">
                {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-12 text-center">
              <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
                {skills.length === 0 ? 'Nenhuma habilidade cadastrada' : 'Nenhuma habilidade encontrada'}
              </h3>
              {skills.length === 0 && (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white hover:brightness-110 mt-3"
                  style={{ background: 'var(--sl-em)' }}
                >
                  <Plus size={15} />
                  Adicionar habilidade
                </button>
              )}
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="flex items-center gap-[14px] px-0 py-2 border-b border-[var(--sl-border)] text-[10px] font-bold uppercase tracking-[.14em] text-[var(--sl-t3)]">
                <span className="w-8" />
                <span className="w-[140px]">Nome</span>
                <span className="w-[80px]">Categoria</span>
                <span className="flex-1">Nivel</span>
              </div>

              {/* Skill rows with segmented bars */}
              {filtered.map(skill => {
                const catColor = CATEGORY_HEX[skill.category]
                const CatIcon = CATEGORY_ICONS[skill.category]
                return (
                  <div
                    key={skill.id}
                    className="flex items-center gap-[14px] py-3 border-b border-[var(--sl-border)] group cursor-pointer hover:bg-[var(--sl-s2)]/30 transition-colors"
                    onClick={() => openEdit(skill)}
                  >
                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                      style={{ background: catColor + '15' }}
                    >
                      <CatIcon size={14} style={{ color: catColor }} />
                    </div>
                    {/* Name */}
                    <span className="text-[13px] font-medium text-[var(--sl-t1)] w-[140px] shrink-0 truncate">
                      {skill.name}
                    </span>
                    {/* Category pill */}
                    <span className="w-[80px] shrink-0">
                      <span
                        className="inline-flex items-center px-[10px] py-[3px] rounded-lg text-[10px] font-semibold"
                        style={{ background: catColor + '15', color: catColor }}
                      >
                        {skill.category === 'hard_skill' ? 'Hard' : skill.category === 'soft_skill' ? 'Soft' : skill.category === 'language' ? 'Idioma' : 'Cert.'}
                      </span>
                    </span>
                    {/* Segmented bar */}
                    <div className="flex-1 flex items-center gap-[10px]">
                      <div className="flex gap-[3px]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-5 h-2 rounded-[2px]"
                            style={{ background: i < skill.proficiency_level ? catColor : 'var(--sl-s3)' }}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-[var(--sl-t2)] ml-2">
                        {SKILL_LEVEL_LABELS[skill.proficiency_level] ?? 'N/A'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right sidebar: Radar + Summary */}
        <div className="flex flex-col gap-[14px] sl-fade-up sl-delay-3">
          {/* Radar chart */}
          {skills.length >= 3 && (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                <Target size={16} style={{ color: CARREIRA }} />
                Arsenal de competencias
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { axis: 'Hard skills', value: Math.round(skills.filter(s => s.category === 'hard_skill').reduce((a, s) => a + s.proficiency_level, 0) / Math.max(1, skills.filter(s => s.category === 'hard_skill').length) * 20) },
                    { axis: 'Soft skills', value: Math.round(skills.filter(s => s.category === 'soft_skill').reduce((a, s) => a + s.proficiency_level, 0) / Math.max(1, skills.filter(s => s.category === 'soft_skill').length) * 20) },
                    { axis: 'Idiomas', value: Math.round(skills.filter(s => s.category === 'language').reduce((a, s) => a + s.proficiency_level, 0) / Math.max(1, skills.filter(s => s.category === 'language').length) * 20) },
                    { axis: 'Certif.', value: skills.filter(s => s.category === 'certification').length * 20 },
                    { axis: 'Lideranca', value: Math.round(skills.filter(s => s.name.toLowerCase().includes('lideranca') || s.name.toLowerCase().includes('gestao')).reduce((a, s) => a + s.proficiency_level, 0) / Math.max(1, skills.filter(s => s.name.toLowerCase().includes('lideranca') || s.name.toLowerCase().includes('gestao')).length) * 20) || 20 },
                    { axis: 'Gestao', value: Math.round(skills.filter(s => s.name.toLowerCase().includes('gestao') || s.name.toLowerCase().includes('gerencia')).reduce((a, s) => a + s.proficiency_level, 0) / Math.max(1, skills.filter(s => s.name.toLowerCase().includes('gestao') || s.name.toLowerCase().includes('gerencia')).length) * 20) || 10 },
                  ]}>
                    <PolarGrid stroke="var(--sl-s3)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: 'var(--sl-t3)' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Habilidades" dataKey="value" stroke={CARREIRA} fill={CARREIRA} fillOpacity={0.2} />
                    <ReTooltip
                      contentStyle={{ background: 'var(--sl-s-hero)', border: '1px solid var(--sl-border)', borderRadius: '10px', fontSize: '11px' }}
                      labelStyle={{ color: 'var(--sl-t2)' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Summary card */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
              <BarChart3 size={16} style={{ color: CARREIRA }} />
              Resumo
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--sl-t2)]">Media proficiencia</span>
                <span className="sl-num-strong text-[18px]" style={{ color: CARREIRA }}>
                  {skills.length > 0 ? (skills.reduce((a, s) => a + s.proficiency_level, 0) / skills.length).toFixed(1) : '0'} / 5
                </span>
              </div>
              <div className="h-px bg-[var(--sl-border)]" />
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--sl-t2)]">Skill mais forte</span>
                <span className="text-[12px] font-semibold text-[var(--sl-t1)]">
                  {(() => {
                    const best = [...skills].sort((a, b) => b.proficiency_level - a.proficiency_level)[0]
                    return best ? `${best.name} (${SKILL_LEVEL_LABELS[best.proficiency_level]})` : '-'
                  })()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--sl-t2)]">A desenvolver</span>
                <span className="text-[12px] font-semibold" style={{ color: 'var(--sl-warning)' }}>
                  {(() => {
                    const weakest = [...skills].sort((a, b) => a.proficiency_level - b.proficiency_level)[0]
                    return weakest ? weakest.name : '-'
                  })()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--sl-t2)]">Ultima certificacao</span>
                <span className="text-[12px] font-semibold" style={{ color: CATEGORY_HEX.certification }}>
                  {(() => {
                    const cert = skills.filter(s => s.category === 'certification').sort((a, b) => new Date(b.updated_at ?? b.created_at ?? '').getTime() - new Date(a.updated_at ?? a.created_at ?? '').getTime())[0]
                    return cert ? cert.name : '-'
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] w-full max-w-[460px]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-extrabold text-[20px] text-[var(--sl-t1)] flex items-center gap-[10px]">
                <Star size={20} style={{ color: CARREIRA }} />
                {editingSkill ? 'Editar habilidade' : 'Nova habilidade'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <TextField
                label="Nome da habilidade"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: React, Negociacao, Ingles..."
                autoFocus
              />

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5 block">Categoria</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.map(cat => {
                    const CatIcon = CATEGORY_ICONS[cat]
                    const catColor = CATEGORY_HEX[cat]
                    return (
                      <button
                        key={cat}
                        onClick={() => setForm(f => ({ ...f, category: cat }))}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-[10px] text-[12px] border transition-all text-left',
                          form.category === cat
                            ? 'text-[var(--sl-t1)]'
                            : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                        )}
                        style={form.category === cat ? {
                          borderColor: catColor,
                          background: catColor + '15',
                        } : undefined}
                      >
                        <CatIcon size={14} style={{ color: catColor }} />
                        {SKILL_CATEGORY_LABELS[cat]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-2 block">
                  Nivel · {SKILL_LEVEL_LABELS[form.proficiency_level]}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(l => {
                    const color = CATEGORY_HEX[form.category]
                    return (
                      <button
                        key={l}
                        onClick={() => setForm(f => ({ ...f, proficiency_level: l }))}
                        className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-all sl-num"
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
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5 block">Notas (opcional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Contexto, certificacoes, projetos..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-em)] resize-none"
                />
              </div>

              {tracks.length > 0 && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5 block">Trilhas vinculadas (Mente)</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                    {tracks.map(track => {
                      const checked = linkedTrackIds.includes(track.id)
                      return (
                        <button
                          key={track.id}
                          onClick={() => {
                            setLinkedTrackIds(prev =>
                              checked ? prev.filter(id => id !== track.id) : [...prev, track.id]
                            )
                          }}
                          className={cn(
                            'flex items-center gap-1.5 px-2 py-1.5 rounded-[8px] text-[11px] border text-left transition-all',
                            checked
                              ? 'text-[var(--sl-t1)]'
                              : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                          )}
                          style={checked ? { borderColor: CATEGORY_HEX.certification, background: CATEGORY_HEX.certification + '15' } : undefined}
                        >
                          <BookOpen size={11} /> {track.name}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-[var(--sl-t3)] mt-1">Uma habilidade pode estar vinculada a multiplas trilhas.</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {editingSkill && (
                  <button
                    onClick={async () => {
                      if (!editingSkill) return
                      try {
                        await deleteSkill(editingSkill.id)
                        toast.success('Habilidade removida')
                        setShowModal(false)
                        await reload()
                      } catch { toast.error('Erro ao remover') }
                    }}
                    className="py-2.5 px-3 rounded-[10px] text-[12px] border border-[var(--sl-border)] text-[var(--sl-danger)] hover:bg-[var(--sl-danger)]/10 transition-colors"
                  >
                    Excluir
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ background: 'var(--sl-em)' }}
                >
                  {isSaving ? 'Salvando...' : editingSkill ? 'Atualizar' : 'Adicionar'}
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
