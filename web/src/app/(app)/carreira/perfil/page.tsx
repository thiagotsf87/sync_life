'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Save, User, Clock, RefreshCw, TrendingUp } from 'lucide-react'
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
import { CARREIRA_XP } from '@/lib/carreira-xp-mock'

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
  const [form, setForm] = useState({
    current_title: '',
    current_company: '',
    field: '' as ProfessionalField | '',
    level: '' as CareerLevel | '',
    gross_salary: '',
    start_date: '',
    sync_salary_to_finance: false,
  })

  useEffect(() => {
    if (profile) {
      setForm({
        current_title: profile.current_title ?? '',
        current_company: profile.current_company ?? '',
        field: profile.field ?? '',
        level: profile.level ?? '',
        gross_salary: profile.gross_salary ? String(profile.gross_salary) : '',
        start_date: profile.start_date ?? '',
        sync_salary_to_finance: profile.sync_salary_to_finance,
      })
    }
  }, [profile])

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

      // Register history if salary changed
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

      // RN-CAR-01: sincronizar salário com Finanças
      if (form.sync_salary_to_finance && form.gross_salary) {
        await createTransactionFromSalario({
          title: form.current_title,
          grossSalary: parseFloat(form.gross_salary),
          competenceDate: new Date().toISOString().split('T')[0],
        })
      }
      // RN-CAR-20: promoção efetivada → calcular impacto
      if (profile?.gross_salary && form.gross_salary) {
        const oldSalary = profile.gross_salary
        const newSalary = parseFloat(form.gross_salary)
        if (newSalary > oldSalary) {
          const monthlyGain = newSalary - oldSalary
          const gain2y = monthlyGain * 24
          toast.success(
            `💼 +${monthlyGain.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês`,
            {
              description: `Se viesse 2 anos antes, seriam +${gain2y.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} a mais acumulados.`,
              duration: 8000,
            }
          )
        } else {
          toast.success('Perfil salvo!')
        }
      } else {
        toast.success('Perfil salvo!')
      }
      await reload()
      setEditMode(false)
    } catch {
      toast.error('Erro ao salvar perfil')
    } finally {
      setIsSaving(false)
    }
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
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* MODULE HEADER */}
      <ModuleHeader
        icon={User}
        iconBg="rgba(244,63,94,.08)"
        iconColor="#f43f5e"
        title="Perfil Profissional"
        subtitle="Gerencie seus dados de carreira e sincronize com outros modulos"
      >
        {!editMode && profile ? (
          <button
            onClick={() => setEditMode(true)}
            className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px]
                       font-semibold border border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)]
                       hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
          >
            Editar Perfil
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                       bg-[#f43f5e] text-white hover:brightness-110 disabled:opacity-50 transition-all"
          >
            <Save size={15} />
            {isSaving ? 'Salvando...' : 'Salvar Alteracoes'}
          </button>
        )}
      </ModuleHeader>

      {/* Display view — when profile exists and not in edit mode */}
      {!editMode && profile && (<>
        {/* Profile Hero Card */}
        <div
          className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7 overflow-hidden mb-7 sl-fade-up sl-delay-1"
        >
          {/* Accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px]"
            style={{ background: 'linear-gradient(90deg, #f43f5e, #a855f7, #06b6d4)' }}
          />
          <div className="flex items-center gap-6">
            {/* Avatar with initials */}
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-[Syne] font-extrabold text-[24px] shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(244,63,94,.15), rgba(168,85,247,.12))',
                color: '#f43f5e',
                border: '2px solid rgba(244,63,94,.25)',
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
                ].filter(Boolean).join(' \u00B7 ')}
              </p>
              <div className="flex gap-[6px] mt-2 flex-wrap">
                {profile.level && (
                  <span
                    className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: 'rgba(244,63,94,.10)', color: '#f43f5e' }}
                  >
                    {LEVEL_LABELS[profile.level]}
                  </span>
                )}
                {profile.field && (
                  <span
                    className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: 'rgba(59,130,246,.10)', color: '#3b82f6' }}
                  >
                    {FIELD_LABELS[profile.field]}
                  </span>
                )}
                {profile.start_date && (
                  <span
                    className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: 'rgba(16,185,129,.10)', color: '#10b981' }}
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

          {/* Left column: Info cards (read-only display) */}
          <div className="flex flex-col gap-5">
            {/* Salary card */}
            {profile.gross_salary && (
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
                <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                  <Briefcase size={16} className="text-[#f43f5e]" />
                  Informacoes do Cargo
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] mb-1">Salario Bruto</p>
                    <p className="font-[DM_Mono] font-medium text-[18px] text-[#10b981]">
                      {profile.gross_salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  {profile.start_date && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] mb-1">Data de Inicio</p>
                      <p className="text-[14px] font-medium text-[var(--sl-t1)]">
                        {new Date(profile.start_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
                {profile.sync_salary_to_finance && (
                  <div className="mt-4 px-4 py-3 bg-[var(--sl-s2)] rounded-xl flex items-center gap-3">
                    <RefreshCw size={14} className="text-[#f43f5e] shrink-0" />
                    <p className="text-[12px] text-[var(--sl-t2)]">Salario sincronizado com Financas como receita mensal</p>
                  </div>
                )}
              </div>
            )}

            {/* XP badges card */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                <TrendingUp size={16} className="text-[#f43f5e]" />
                Evolucao
              </div>
              <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed">
                {profile.current_title || 'Profissional'} em evolucao constante.
                {profile.start_date && ` Desde ${new Date(profile.start_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.`}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="text-[11px] font-semibold px-[10px] py-1 rounded-lg" style={{ background: 'rgba(244,63,94,.10)', color: '#f43f5e' }}>Level {CARREIRA_XP.level}</span>
                <span className="text-[11px] font-semibold px-[10px] py-1 rounded-lg" style={{ background: 'rgba(16,185,129,.10)', color: '#10b981' }}>{history.length} posicoes</span>
              </div>
            </div>
          </div>

          {/* Right column: History sidebar */}
          <div className="flex flex-col gap-5">
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                <Clock size={16} className="text-[#f43f5e]" />
                Historico Recente
              </div>
              {history.length === 0 ? (
                <p className="text-[12px] text-[var(--sl-t3)]">Sem historico ainda.</p>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  {history.slice(0, 4).map((entry, i) => {
                    const borderColors = ['#10b981', '#a855f7', '#f59e0b', '#3b82f6']
                    return (
                      <div
                        key={entry.id}
                        className="p-3 bg-[var(--sl-s2)] rounded-[10px]"
                        style={{ borderLeft: `3px solid ${borderColors[i % borderColors.length]}` }}
                      >
                        <p className="text-[12px] font-semibold text-[var(--sl-t1)]">{entry.title}</p>
                        <p className="text-[11px] text-[var(--sl-t3)]">
                          {entry.company} &middot; {new Date(entry.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </p>
                        {entry.salary && (
                          <p className="font-[DM_Mono] text-[13px] mt-1" style={{ color: i === 0 ? '#10b981' : 'var(--sl-t2)' }}>
                            {Number(entry.salary).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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

      {/* Edit form — when no profile yet or in edit mode */}
      {(editMode || !profile) && (
        <div className="grid grid-cols-[1fr_340px] gap-5 max-lg:grid-cols-1">

          {/* Form */}
          <div className="flex flex-col gap-5">
            {/* Card: Informacoes do Cargo */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 flex flex-col gap-4 transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-2">
              <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                <Briefcase size={16} className="text-[#f43f5e]" />
                Informacoes do Cargo
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10.5px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] mb-[7px] block">Cargo</label>
                  <input
                    type="text"
                    value={form.current_title}
                    onChange={e => setForm(f => ({ ...f, current_title: e.target.value }))}
                    placeholder="Ex: Desenvolvedor Senior"
                    className="w-full px-[15px] py-[11px] rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] mb-[7px] block">Empresa</label>
                  <input
                    type="text"
                    value={form.current_company}
                    onChange={e => setForm(f => ({ ...f, current_company: e.target.value }))}
                    placeholder="Nome da empresa"
                    className="w-full px-[15px] py-[11px] rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)] transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10.5px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] mb-[7px] block">Salario Bruto</label>
                  <input
                    type="number"
                    value={form.gross_salary}
                    onChange={e => setForm(f => ({ ...f, gross_salary: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-full px-[15px] py-[11px] rounded-[10px] text-[13px] font-[DM_Mono] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-h)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold uppercase tracking-[.07em] text-[var(--sl-t3)] mb-[7px] block">Data de Inicio</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-[15px] py-[11px] rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[var(--sl-border-h)] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Card: Area de Atuacao */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-3">
              <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                Area de Atuacao
              </div>
              <div className="flex flex-wrap gap-2">
                {FIELDS.map(f => (
                  <button
                    key={f}
                    onClick={() => setForm(frm => ({ ...frm, field: f }))}
                    className={cn(
                      'inline-flex items-center gap-[5px] px-[14px] py-2 rounded-[10px] text-[12px] font-medium border transition-all',
                      form.field === f
                        ? 'border-[rgba(244,63,94,.2)] text-[#f43f5e]'
                        : 'border-transparent bg-[var(--sl-s2)] text-[var(--sl-t3)] hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t2)]'
                    )}
                    style={form.field === f ? { background: 'rgba(244,63,94,.08)' } : undefined}
                  >
                    {FIELD_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            {/* Card: Nivel Profissional (stepper style) */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-4">
              <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                <TrendingUp size={16} className="text-[#f43f5e]" />
                Nivel Profissional
              </div>
              <div className="flex flex-wrap gap-[6px]">
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => setForm(f => ({ ...f, level: l }))}
                    className={cn(
                      'inline-flex px-3 py-[7px] rounded-lg text-[11px] font-semibold transition-all',
                      form.level === l
                        ? 'text-[#f43f5e] border border-[rgba(244,63,94,.25)]'
                        : 'bg-[var(--sl-s2)] text-[var(--sl-t3)] border border-transparent hover:bg-[var(--sl-s3)] hover:text-[var(--sl-t2)]'
                    )}
                    style={form.level === l ? { background: 'rgba(244,63,94,.12)' } : undefined}
                  >
                    {LEVEL_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>

            {/* Sync + Cancel buttons */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center justify-between p-[14px_16px] bg-[var(--sl-s2)] rounded-xl mb-3">
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-[var(--sl-t1)]">Sync com Financas</p>
                  <p className="text-[11px] text-[var(--sl-t3)]">Salario como receita mensal</p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, sync_salary_to_finance: !f.sync_salary_to_finance }))}
                  className={cn(
                    'w-10 h-[22px] rounded-[11px] transition-all relative cursor-pointer',
                    form.sync_salary_to_finance ? 'bg-[#f43f5e]' : 'bg-[var(--sl-s3)]'
                  )}
                >
                  <div className={cn(
                    'w-[18px] h-[18px] rounded-full bg-white absolute top-[2px] transition-all',
                    form.sync_salary_to_finance ? 'right-[2px]' : 'left-[2px]'
                  )} />
                </button>
              </div>
              {editMode && (
                <button
                  onClick={() => setEditMode(false)}
                  className="w-full py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Sidebar: career history */}
          <div className="flex flex-col gap-5">
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)] sl-fade-up sl-delay-2">
              <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                <Clock size={16} className="text-[#f43f5e]" />
                Historico Recente
                {history.length > 5 && (
                  <span
                    className="ml-auto font-sans text-[12px] font-medium text-[#f43f5e] cursor-pointer hover:underline"
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
                <p className="text-[12px] text-[var(--sl-t3)]">Nenhum historico ainda.</p>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  {history.slice(0, 5).map((entry, i) => {
                    const borderColors = ['#10b981', '#a855f7', '#f59e0b', '#3b82f6', '#06b6d4']
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
                          {entry.salary && <span className="font-[DM_Mono] ml-1">{formatCurrency(String(entry.salary))}</span>}
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
    </div>
    </>
  )

  function formatCurrency(v: string) {
    return v ? parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'
  }
}

