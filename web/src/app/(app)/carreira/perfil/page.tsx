'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useProfessionalProfile, useCareerHistory, useSkills, useCareerRoadmaps, useSaveProfile, useSaveSkill, useAddHistoryEntry,
  FIELD_LABELS, LEVEL_LABELS,
  type ProfessionalField, type CareerLevel,
} from '@/hooks/use-carreira'
import { createTransactionFromSalario } from '@/lib/integrations/financas'
import { CarreiraMobile } from '@/components/carreira/CarreiraMobile'
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
    <div className="hidden lg:block max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/carreira')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Carreira
        </button>
        <h1 className="font-[Syne] font-extrabold text-xl text-sl-grad">
          👤 Perfil Profissional
        </h1>
        {!editMode && profile ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] hover:border-[var(--sl-border-h)]"
          >
            ✏️ Editar
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                       bg-[#f59e0b] text-[#03071a] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Save size={15} />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        )}
      </div>

      {/* Display view — when profile exists and not in edit mode */}
      {!editMode && profile && (
        <div className="grid grid-cols-[1fr_340px] gap-5 max-lg:grid-cols-1">

          {/* Main column: Profile card */}
          <div className="flex flex-col gap-4">
            {/* Profile hero card */}
            <div
              className="bg-[var(--sl-s1)] border border-[rgba(244,63,94,0.2)] rounded-2xl p-5"
              style={{ background: 'linear-gradient(160deg, rgba(244,63,94,0.1), rgba(139,92,246,0.06))' }}
            >
              <div className="flex gap-4 items-start mb-4">
                <div className="w-16 h-16 rounded-[20px] border-2 border-[rgba(244,63,94,0.3)] bg-[rgba(244,63,94,0.15)] flex items-center justify-center text-[32px] shrink-0">
                  👨‍💻
                </div>
                <div className="flex-1">
                  <p className="text-[17px] font-bold text-[var(--sl-t1)]">{profile.current_title || 'Sem cargo'}</p>
                  <p className="text-[13px] text-[#f43f5e] mt-0.5">
                    {profile.level ? LEVEL_LABELS[profile.level] : '—'} · {profile.field ? FIELD_LABELS[profile.field] : '—'}
                  </p>
                  <p className="text-[12px] text-[var(--sl-t2)] mt-0.5">{profile.current_company || '—'}</p>
                </div>
              </div>
              {/* Salary */}
              {profile.gross_salary && (
                <div className="pt-3 border-t border-[var(--sl-border)]">
                  <p className="text-[11px] text-[var(--sl-t3)] mb-1">Salário bruto</p>
                  <p className="font-[DM_Mono] font-bold text-[18px] text-[#f43f5e]">
                    {profile.gross_salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              )}
            </div>

            {/* Jornada-only narrative */}
            <div className="bg-[var(--sl-s1)] border border-[rgba(139,92,246,0.2)] rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c4b5fd] mb-2">✦ HERÓI EM EVOLUÇÃO</p>
              <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed">
                {profile.current_title || 'Profissional'} em evolução constante.
                {profile.start_date && ` Desde ${new Date(profile.start_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.`}
              </p>
              {/* XP badges */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-[rgba(139,92,246,0.15)] text-[#c4b5fd]">⚡ Nível {CARREIRA_XP.level}</span>
                <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981]">{history.length} posições</span>
              </div>
            </div>
          </div>

          {/* Right column: History sidebar */}
          <div className="flex flex-col gap-4">
            {/* Experience section */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-3">
                <span className="text-[#c4b5fd]">CAPÍTULOS DA JORNADA</span>
              </p>
              {history.length === 0 ? (
                <p className="text-[12px] text-[var(--sl-t3)]">Sem histórico ainda.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {history.slice(0, 4).map((entry, i) => (
                    <div key={entry.id} className="flex items-start gap-3 py-2.5 border-b border-[var(--sl-border)] last:border-0">
                      <div className={cn(
                        'w-9 h-9 rounded-[11px] flex items-center justify-center text-[16px] shrink-0',
                        i === 0 ? 'bg-[rgba(244,63,94,0.15)]' : 'bg-[rgba(100,100,100,0.1)]'
                      )}>
                        💼
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--sl-t1)]">{entry.title}</p>
                        <p className="text-[11px] text-[var(--sl-t2)]">
                          {entry.company} · {new Date(entry.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-[#c4b5fd] mt-0.5">
                          ⚡ +{i === 0 ? 280 : 200} XP neste capítulo
                        </p>
                      </div>
                      {i === 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(244,63,94,0.12)] text-[#f43f5e] shrink-0">Atual</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit form — when no profile yet or in edit mode */}
      {(editMode || !profile) && (
        <div className="grid grid-cols-[1fr_340px] gap-5 max-lg:grid-cols-1">

          {/* Form */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Cargo</label>
                <input
                  type="text"
                  value={form.current_title}
                  onChange={e => setForm(f => ({ ...f, current_title: e.target.value }))}
                  placeholder="Ex: Desenvolvedor Sênior"
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Empresa</label>
                <input
                  type="text"
                  value={form.current_company}
                  onChange={e => setForm(f => ({ ...f, current_company: e.target.value }))}
                  placeholder="Nome da empresa"
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Área</label>
              <div className="grid grid-cols-3 gap-1.5 max-sm:grid-cols-2">
                {FIELDS.map(f => (
                  <button
                    key={f}
                    onClick={() => setForm(frm => ({ ...frm, field: f }))}
                    className={cn(
                      'px-2 py-1.5 rounded-[8px] text-[11px] border transition-all text-left truncate',
                      form.field === f
                        ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[var(--sl-t1)]'
                        : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    {FIELD_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Nível</label>
              <div className="grid grid-cols-3 gap-1.5 max-sm:grid-cols-2">
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => setForm(f => ({ ...f, level: l }))}
                    className={cn(
                      'px-2 py-1.5 rounded-[8px] text-[11px] border transition-all',
                      form.level === l
                        ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[var(--sl-t1)]'
                        : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                    )}
                  >
                    {LEVEL_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Salário Bruto (R$)</label>
                <input
                  type="number"
                  value={form.gross_salary}
                  onChange={e => setForm(f => ({ ...f, gross_salary: e.target.value }))}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Data de Início</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>
            </div>

            {/* Sync toggle */}
            <div className="flex items-center justify-between p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
              <div>
                <p className="text-[13px] font-medium text-[var(--sl-t1)]">Sincronizar salário com Finanças</p>
                <p className="text-[11px] text-[var(--sl-t3)]">Cria receita recorrente mensal automaticamente</p>
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, sync_salary_to_finance: !f.sync_salary_to_finance }))}
                className={cn(
                  'w-10 h-6 rounded-full transition-all relative',
                  form.sync_salary_to_finance ? 'bg-[#f59e0b]' : 'bg-[var(--sl-s3)]'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full bg-white absolute top-1 transition-all',
                  form.sync_salary_to_finance ? 'left-5' : 'left-1'
                )} />
              </button>
            </div>

            {/* Cancel button when in edit mode */}
            {editMode && (
              <button
                onClick={() => setEditMode(false)}
                className="w-full py-2.5 rounded-[10px] text-[13px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>

          {/* Sidebar: career history */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
            <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-3">
              📜 Histórico Recente
            </h2>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-lg bg-[var(--sl-s2)] animate-pulse" />)}
              </div>
            ) : history.length === 0 ? (
              <p className="text-[12px] text-[var(--sl-t3)]">Nenhum histórico ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.slice(0, 5).map(entry => (
                  <div key={entry.id} className="p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-semibold text-[var(--sl-t1)]">{entry.title}</p>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#f59e0b] shrink-0">
                        {CHANGE_TYPE_LABELS[entry.change_type]}
                      </span>
                    </div>
                    {entry.company && <p className="text-[11px] text-[var(--sl-t3)]">{entry.company}</p>}
                    <p className="text-[10px] text-[var(--sl-t3)] mt-0.5">
                      {new Date(entry.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                      {entry.salary && ` · ${formatCurrency(String(entry.salary))}`}
                    </p>
                  </div>
                ))}
                {history.length > 5 && (
                  <button onClick={() => router.push('/carreira/historico')} className="text-[11px] text-[#f59e0b] hover:opacity-80 text-center py-1">
                    Ver histórico completo →
                  </button>
                )}
              </div>
            )}
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

