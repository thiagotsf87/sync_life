'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, User, Clock, RefreshCw, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useProfessionalProfile, useCareerHistory, useSkills, useCareerRoadmaps, useSaveProfile, useSaveSkill, useAddHistoryEntry,
  FIELD_LABELS, LEVEL_LABELS,
  type ProfessionalField, type CareerLevel,
} from '@/hooks/use-carreira'
import { createTransactionFromSalario } from '@/lib/integrations/financas'
import { CarreiraMobile } from '@/components/carreira/CarreiraMobile'
import { ModuleHeader } from '@/components/ui/module-header'
import { SectionHeader } from '@/components/ui/section-header'
import { SaveBar } from '@/components/ui/save-bar'
import { TextField } from '@/components/ui/text-field'
import { ToggleRow } from '@/components/ui/toggle-row'
import { fmtBRL } from '@/lib/format/currency'
import { CARREIRA_XP } from '@/lib/carreira-xp-mock'

const CARREIRA = '#DB6478'
const FIELDS: ProfessionalField[] = ['technology', 'finance', 'health', 'education', 'law', 'engineering', 'marketing', 'sales', 'hr', 'design', 'management', 'other']
const LEVELS: CareerLevel[] = ['intern', 'junior', 'mid', 'senior', 'specialist', 'coordinator', 'manager', 'director', 'c_level', 'freelancer', 'entrepreneur']

const CHANGE_TYPE_LABELS = {
  initial: 'Início',
  promotion: 'Promoção',
  lateral: 'Movimentação lateral',
  company_change: 'Mudança de empresa',
  salary_change: 'Ajuste salarial',
  other: 'Outro',
}

type FormState = {
  current_title: string
  current_company: string
  field: ProfessionalField | ''
  level: CareerLevel | ''
  gross_salary: string
  start_date: string
  sync_salary_to_finance: boolean
}

const EMPTY: FormState = {
  current_title: '',
  current_company: '',
  field: '',
  level: '',
  gross_salary: '',
  start_date: '',
  sync_salary_to_finance: false,
}

export default function PerfilCarreiraPage() {
  const router = useRouter()

  const { profile, loading, reload } = useProfessionalProfile()
  const { history } = useCareerHistory()
  const { skills } = useSkills()
  const { roadmaps } = useCareerRoadmaps()
  const activeRoadmap = roadmaps.find(r => r.status === 'active') ?? null
  const saveProfile = useSaveProfile()
  const saveSkill = useSaveSkill()
  const addHistory = useAddHistoryEntry()

  const [isSaving, setIsSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [baseline, setBaseline] = useState<FormState>(EMPTY)

  useEffect(() => {
    if (profile) {
      const next: FormState = {
        current_title: profile.current_title ?? '',
        current_company: profile.current_company ?? '',
        field: profile.field ?? '',
        level: profile.level ?? '',
        gross_salary: profile.gross_salary ? String(profile.gross_salary) : '',
        start_date: profile.start_date ?? '',
        sync_salary_to_finance: profile.sync_salary_to_finance,
      }
      setForm(next)
      setBaseline(next)
    } else {
      setForm(EMPTY)
      setBaseline(EMPTY)
    }
  }, [profile])

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(baseline)
  }, [form, baseline])

  async function handleSave() {
    setIsSaving(true)
    try {
      await saveProfile({
        current_title: form.current_title.trim() || null,
        current_company: form.current_company.trim() || null,
        field: form.field || null,
        level: form.level || null,
        gross_salary: form.gross_salary ? parseFloat(form.gross_salary) : null,
        start_date: form.start_date || null,
        sync_salary_to_finance: form.sync_salary_to_finance,
      }, profile?.id)

      if (profile && form.gross_salary && parseFloat(form.gross_salary) !== profile.gross_salary) {
        await addHistory({
          title: form.current_title || profile.current_title || '',
          company: form.current_company || null,
          field: form.field || null,
          level: form.level || null,
          salary: parseFloat(form.gross_salary),
          start_date: form.start_date || new Date().toISOString().split('T')[0],
          end_date: null,
          change_type: 'salary_change',
          notes: 'Atualização de salário via perfil',
        })
      }

      if (form.sync_salary_to_finance && form.gross_salary) {
        await createTransactionFromSalario({
          title: form.current_title,
          grossSalary: parseFloat(form.gross_salary),
          competenceDate: new Date().toISOString().split('T')[0],
        })
      }

      if (profile?.gross_salary && form.gross_salary) {
        const oldSalary = profile.gross_salary
        const newSalary = parseFloat(form.gross_salary)
        if (newSalary > oldSalary) {
          const monthlyGain = newSalary - oldSalary
          const gain2y = monthlyGain * 24
          toast.success(
            `+${fmtBRL(monthlyGain)}/mês`,
            {
              description: `Se viesse 2 anos antes, seriam +${fmtBRL(gain2y)} a mais acumulados.`,
              duration: 8000,
            }
          )
        } else {
          toast.success('Perfil salvo')
        }
      } else {
        toast.success('Perfil salvo')
      }
      await reload()
      setEditMode(false)
    } catch {
      toast.error('Erro ao salvar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  function handleDiscard() {
    setForm(baseline)
    if (profile) setEditMode(false)
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
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-24">

      {/* MODULE HEADER */}
      <ModuleHeader
        icon={User}
        iconBg="rgba(219,100,120,.08)"
        iconColor={CARREIRA}
        title="Perfil profissional"
        subtitle="Gerencie seus dados de carreira e sincronize com outros modulos"
      >
        {!editMode && profile && (
          <button
            onClick={() => setEditMode(true)}
            className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px]
                       font-semibold border border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)]
                       hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
          >
            Editar perfil
          </button>
        )}
      </ModuleHeader>

      {/* DISPLAY VIEW: profile read-only */}
      {!editMode && profile && (<>
        {/* Profile Hero Card (G-05: unico hero) */}
        <div className="relative bg-[var(--sl-s-hero)] border border-[var(--sl-border)] rounded-[18px] p-7 overflow-hidden mb-7 sl-fade-up sl-delay-1">
          {/* Accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px]"
            style={{ background: CARREIRA }}
          />
          <div className="flex items-center gap-6">
            {/* Avatar with initials */}
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-[Syne] font-extrabold text-[24px] shrink-0"
              style={{
                background: 'rgba(219,100,120,.12)',
                color: CARREIRA,
                border: '2px solid rgba(219,100,120,.25)',
              }}
            >
              {(() => {
                const name = profile.current_title || 'SP'
                const parts = name.split(' ').filter(Boolean)
                if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                return parts[0]?.slice(0, 2).toUpperCase() || 'SP'
              })()}
            </div>
            <div className="flex-1">
              <h2 className="font-[Syne] font-extrabold text-[22px] text-[var(--sl-t1)] mb-[3px]">
                {profile.current_title || 'Sem cargo'}
              </h2>
              <p className="text-[13px] text-[var(--sl-t2)]">
                {[
                  profile.level ? LEVEL_LABELS[profile.level] : null,
                  profile.current_company,
                  profile.field ? FIELD_LABELS[profile.field] : null,
                ].filter(Boolean).join(' · ')}
              </p>
              <div className="flex gap-[6px] mt-2 flex-wrap">
                {profile.level && (
                  <span
                    className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: 'rgba(219,100,120,.10)', color: CARREIRA }}
                  >
                    {LEVEL_LABELS[profile.level]}
                  </span>
                )}
                {profile.field && (
                  <span
                    className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: 'rgba(79,136,212,.10)', color: 'var(--sl-info)' }}
                  >
                    {FIELD_LABELS[profile.field]}
                  </span>
                )}
                {profile.start_date && (
                  <span
                    className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: 'rgba(15,118,110,.10)', color: 'var(--sl-em)' }}
                  >
                    {(() => {
                      const start = new Date(profile.start_date!)
                      const now = new Date()
                      const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
                      if (months < 1) return 'menos de 1 mes'
                      if (months < 12) return `${months} meses no cargo`
                      const y = Math.floor(months / 12)
                      return `${y} ano${y > 1 ? 's' : ''} no cargo`
                    })()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_340px] gap-5 max-lg:grid-cols-1 sl-fade-up sl-delay-2">

          {/* Left column: Info cards */}
          <div className="flex flex-col gap-5">
            {/* Salary card */}
            {profile.gross_salary && (
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
                <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                  <Briefcase size={16} style={{ color: CARREIRA }} />
                  Informações do cargo
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1">Salário bruto</p>
                    <p className="sl-num-strong text-[18px]" style={{ color: 'var(--sl-em)' }}>
                      {fmtBRL(profile.gross_salary)}
                    </p>
                  </div>
                  {profile.start_date && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1">Data de início</p>
                      <p className="text-[14px] font-medium text-[var(--sl-t1)]">
                        {new Date(profile.start_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
                {profile.sync_salary_to_finance && (
                  <div className="mt-4 px-4 py-3 bg-[var(--sl-s2)] rounded-xl flex items-center gap-3">
                    <RefreshCw size={14} style={{ color: CARREIRA }} className="shrink-0" />
                    <p className="text-[12px] text-[var(--sl-t2)]">Salário sincronizado com Finanças como receita mensal</p>
                  </div>
                )}
              </div>
            )}

            {/* XP badges card */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                <TrendingUp size={16} style={{ color: CARREIRA }} />
                Evolução
              </div>
              <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed">
                {profile.current_title || 'Profissional'} em evolução constante.
                {profile.start_date && ` Desde ${new Date(profile.start_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.`}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="text-[11px] font-semibold px-[10px] py-1 rounded-lg" style={{ background: 'rgba(219,100,120,.10)', color: CARREIRA }}>Level {CARREIRA_XP.level}</span>
                <span className="text-[11px] font-semibold px-[10px] py-1 rounded-lg" style={{ background: 'rgba(15,118,110,.10)', color: 'var(--sl-em)' }}>{history.length} posições</span>
              </div>
            </div>
          </div>

          {/* Right column: History sidebar */}
          <div className="flex flex-col gap-5">
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                <Clock size={16} style={{ color: CARREIRA }} />
                Histórico recente
                {history.length > 4 && (
                  <span
                    className="ml-auto font-sans text-[12px] font-medium cursor-pointer hover:underline"
                    style={{ color: CARREIRA }}
                    onClick={() => router.push('/carreira/historico')}
                  >
                    Ver tudo &rarr;
                  </span>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-[12px] text-[var(--sl-t3)]">Sem histórico ainda.</p>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  {history.slice(0, 4).map((entry, i) => {
                    const borderColors = ['#0F766E', '#8B7BD4', '#D9962E', '#4F88D4']
                    return (
                      <div
                        key={entry.id}
                        className="p-3 bg-[var(--sl-s2)] rounded-[10px]"
                        style={{ borderLeft: `3px solid ${borderColors[i % borderColors.length]}` }}
                      >
                        <p className="text-[12px] font-semibold text-[var(--sl-t1)]">{entry.title}</p>
                        <p className="text-[11px] text-[var(--sl-t3)]">
                          {entry.company} · {new Date(entry.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </p>
                        {entry.salary && (
                          <p className="sl-num text-[13px] mt-1" style={{ color: i === 0 ? 'var(--sl-em)' : 'var(--sl-t2)' }}>
                            {fmtBRL(Number(entry.salary))}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </>)}

      {/* EDIT FORM: cards numerados (G-09) + SaveBar (G-08) */}
      {(editMode || !profile) && (
        <div className="grid grid-cols-[1fr_340px] gap-5 max-lg:grid-cols-1">

          {/* Form column */}
          <div className="flex flex-col gap-5">
            {/* Card 01 · Informações do cargo */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-6 flex flex-col gap-4 transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-2">
              <SectionHeader
                eyebrow="01 · IDENTIDADE"
                title="Informações do cargo"
                sub="Dados básicos sobre sua posição atual"
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Cargo"
                  value={form.current_title}
                  onChange={e => setForm(f => ({ ...f, current_title: e.target.value }))}
                  placeholder="Ex: Desenvolvedor Sênior"
                />
                <TextField
                  label="Empresa"
                  value={form.current_company}
                  onChange={e => setForm(f => ({ ...f, current_company: e.target.value }))}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Salário bruto"
                  type="number"
                  value={form.gross_salary}
                  onChange={e => setForm(f => ({ ...f, gross_salary: e.target.value }))}
                  placeholder="0"
                  min="0"
                />
                <TextField
                  label="Data de início"
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                />
              </div>
            </div>

            {/* Card 02 · Área de atuação */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-6 transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-3">
              <SectionHeader
                eyebrow="02 · ÁREA"
                title="Área de atuação"
                sub="Em qual setor profissional você atua"
                className="mb-[18px]"
              />
              <div className="flex flex-wrap gap-2">
                {FIELDS.map(f => (
                  <button
                    key={f}
                    onClick={() => setForm(frm => ({ ...frm, field: f }))}
                    className={cn(
                      'inline-flex items-center gap-[5px] px-[14px] py-2 rounded-[10px] text-[12px] font-medium border transition-all',
                      form.field === f
                        ? ''
                        : 'border-transparent bg-[var(--sl-s2)] text-[var(--sl-t3)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t2)]'
                    )}
                    style={form.field === f ? {
                      background: 'rgba(219,100,120,.08)',
                      borderColor: 'rgba(219,100,120,.2)',
                      color: CARREIRA,
                    } : undefined}
                  >
                    {FIELD_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 03 · Nível profissional */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-6 transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-4">
              <SectionHeader
                eyebrow="03 · SENIORIDADE"
                title="Nível profissional"
                sub="Sua senioridade atual no mercado"
                className="mb-[18px]"
              />
              <div className="flex flex-wrap gap-[6px]">
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => setForm(f => ({ ...f, level: l }))}
                    className={cn(
                      'inline-flex px-3 py-[7px] rounded-lg text-[11px] font-semibold transition-all border',
                      form.level === l
                        ? ''
                        : 'bg-[var(--sl-s2)] text-[var(--sl-t3)] border-transparent hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t2)]'
                    )}
                    style={form.level === l ? {
                      background: 'rgba(219,100,120,.12)',
                      borderColor: 'rgba(219,100,120,.25)',
                      color: CARREIRA,
                    } : undefined}
                  >
                    {LEVEL_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 04 · Integrações */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
              <SectionHeader
                eyebrow="04 · INTEGRAÇÕES"
                title="Sincronização cross-module"
                sub="Compartilhe dados de carreira com outros módulos"
                className="mb-[18px]"
              />
              <ToggleRow
                label="Sync com Finanças"
                sub="Salário como receita mensal recorrente"
                checked={form.sync_salary_to_finance}
                onChange={(v) => setForm(f => ({ ...f, sync_salary_to_finance: v }))}
              />
            </div>
          </div>

          {/* Sidebar: career history */}
          <div className="flex flex-col gap-5">
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-6 transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-2">
              <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                <Clock size={16} style={{ color: CARREIRA }} />
                Histórico recente
                {history.length > 5 && (
                  <span
                    className="ml-auto font-sans text-[12px] font-medium cursor-pointer hover:underline"
                    style={{ color: CARREIRA }}
                    onClick={() => router.push('/carreira/historico')}
                  >
                    Ver tudo &rarr;
                  </span>
                )}
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-[var(--sl-s2)] animate-pulse" />)}
                </div>
              ) : history.length === 0 ? (
                <p className="text-[12px] text-[var(--sl-t3)]">Nenhum histórico ainda.</p>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  {history.slice(0, 5).map((entry, i) => {
                    const borderColors = ['#0F766E', '#8B7BD4', '#D9962E', '#4F88D4', '#3CA0B5']
                    return (
                      <div
                        key={entry.id}
                        className="p-3 bg-[var(--sl-s2)] rounded-[10px]"
                        style={{ borderLeft: `3px solid ${borderColors[i % borderColors.length]}` }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[12px] font-semibold text-[var(--sl-t1)]">{entry.title}</p>
                          <span
                            className="text-[10px] font-semibold px-[10px] py-[3px] rounded-lg shrink-0"
                            style={{ background: `${borderColors[i % borderColors.length]}15`, color: borderColors[i % borderColors.length] }}
                          >
                            {CHANGE_TYPE_LABELS[entry.change_type]}
                          </span>
                        </div>
                        {entry.company && <p className="text-[11px] text-[var(--sl-t3)]">{entry.company}</p>}
                        <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                          {new Date(entry.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                          {entry.salary && <span className="sl-num ml-1">{fmtBRL(Number(entry.salary))}</span>}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SaveBar sticky (G-08) · so aparece com mudancas */}
      <SaveBar
        hasChanges={(editMode || !profile) && isDirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
        saving={isSaving}
      />
    </div>
    </>
  )
}
