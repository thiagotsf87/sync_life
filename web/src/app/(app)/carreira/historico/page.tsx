'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useCareerHistory, useAddHistoryEntry,
  useProfessionalProfile, useSkills, useCareerRoadmaps, useSaveSkill,
  FIELD_LABELS, LEVEL_LABELS,
  type AddHistoryData,
} from '@/hooks/use-carreira'
import { CarreiraMobile } from '@/components/carreira/CarreiraMobile'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer,
} from 'recharts'
import { createTransactionFromSalario } from '@/lib/integrations/financas'
import { CARREIRA_XP } from '@/lib/carreira-xp-mock'

const CHANGE_TYPES = ['initial', 'promotion', 'lateral', 'company_change', 'salary_change', 'other'] as const
type ChangeType = typeof CHANGE_TYPES[number]

const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  initial: 'Início de carreira',
  promotion: 'Promoção',
  lateral: 'Movimentação lateral',
  company_change: 'Mudança de empresa',
  salary_change: 'Ajuste salarial',
  other: 'Outro',
}

const CHANGE_TYPE_COLORS: Record<ChangeType, string> = {
  initial: '#0055ff',
  promotion: '#10b981',
  lateral: '#f59e0b',
  company_change: '#a855f7',
  salary_change: '#06b6d4',
  other: '#6e90b8',
}

const EMPTY_FORM = {
  title: '',
  company: '',
  field: '',
  level: '',
  salary: '',
  start_date: '',
  end_date: '',
  change_type: 'promotion' as ChangeType,
  notes: '',
}

export default function HistoricoCarreiraPage() {
  const router = useRouter()

  const { history, loading, reload } = useCareerHistory()
  const { profile } = useProfessionalProfile()
  const { skills } = useSkills()
  const { roadmaps } = useCareerRoadmaps()
  const activeRoadmap = roadmaps.find(r => r.status === 'active') ?? null
  const saveSkill = useSaveSkill()
  const addHistory = useAddHistoryEntry()

  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [celebracao, setCelebracao] = useState<{
    open: boolean
    newTitle: string
    newSalary: number
    oldSalary: number
  } | null>(null)

  async function handleAdd() {
    if (!form.title.trim() || !form.start_date) {
      toast.error('Informe o cargo e a data de início')
      return
    }
    setIsSaving(true)
    try {
      const data: AddHistoryData = {
        title: form.title.trim(),
        company: form.company.trim() || null,
        field: form.field || null,
        level: form.level || null,
        salary: form.salary ? parseFloat(form.salary) : null,
        start_date: form.start_date,
        end_date: form.end_date || null,
        change_type: form.change_type,
        notes: form.notes.trim() || null,
      }
      await addHistory(data)

      // RN-CAR-15: promoção/ajuste salarial → receita em Finanças (opt-in)
      if (data.salary && ['promotion', 'salary_change', 'initial', 'company_change'].includes(form.change_type)) {
        try {
          const settings = JSON.parse(localStorage.getItem('sl_integrations_settings') ?? '{}')
          if (settings.car_salario_financas !== false) {
            await createTransactionFromSalario({
              title: data.title,
              grossSalary: data.salary,
              competenceDate: data.start_date,
            })
          }
        } catch { /* ignore integration error */ }
      }

      // Show celebration modal for promotions in Jornada mode
      if (form.change_type === 'promotion' && data.salary) {
        const oldSalary = history[0]?.salary ?? 0
        setCelebracao({
          open: true,
          newTitle: data.title,
          newSalary: data.salary,
          oldSalary,
        })
      }

      toast.success('Histórico adicionado!')
      setShowModal(false)
      setForm(EMPTY_FORM)
      await reload()
    } catch {
      toast.error('Erro ao adicionar histórico')
    } finally {
      setIsSaving(false)
    }
  }

  function salaryDelta(idx: number) {
    if (idx >= history.length - 1) return null
    const curr = history[idx].salary
    const prev = history[idx + 1].salary
    if (!curr || !prev) return null
    const pct = ((curr - prev) / prev) * 100
    return pct
  }

  // Summary stats
  const withSalary = history.filter(h => h.salary != null)
  const maxSalary = withSalary.length ? Math.max(...withSalary.map(h => h.salary!)) : 0
  const minSalary = withSalary.length ? Math.min(...withSalary.map(h => h.salary!)) : 0
  const totalGrowthPct = withSalary.length >= 2
    ? ((withSalary[0].salary! - withSalary[withSalary.length - 1].salary!) / withSalary[withSalary.length - 1].salary!) * 100
    : 0

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
    <div className="hidden lg:block max-w-[860px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => router.push('/carreira')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Carreira
        </button>
        <h1 className="font-[Syne] font-extrabold text-xl flex-1 text-sl-grad">
          📜 Histórico de Carreira
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#f59e0b] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
          <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b bg-[#10b981]" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">Crescimento Total</p>
            <p className={cn('font-[DM_Mono] font-medium text-xl', totalGrowthPct >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
              {withSalary.length >= 2 ? `${totalGrowthPct >= 0 ? '+' : ''}${totalGrowthPct.toFixed(1)}%` : '—'}
            </p>
          </div>
          <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b bg-[#10b981]" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">Maior Salário</p>
            <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)]">
              {withSalary.length > 0 ? maxSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
            </p>
          </div>
          <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b bg-[#0055ff]" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">Registros</p>
            <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)]">{history.length}</p>
          </div>
          {withSalary.length > 0 ? (
            <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 overflow-hidden">
              <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b bg-[#0055ff]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">Salário Inicial</p>
              <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)]">
                {withSalary[withSalary.length - 1].salary!.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          ) : (
            <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 overflow-hidden">
              <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b bg-[#0055ff]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-0.5">Salário Inicial</p>
              <p className="font-[DM_Mono] font-medium text-xl text-[var(--sl-t1)]">—</p>
            </div>
          )}
        </div>
      )}

      {/* Salary Chart */}
      {withSalary.length >= 2 && (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 mb-5 sl-fade-up">
          <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-4">📈 Evolução Salarial</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[...withSalary].reverse().map(h => ({
                  label: new Date(h.start_date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
                  salary: h.salary!,
                }))}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sl-s3)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--sl-t3)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--sl-t3)' }} tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                <ReTooltip
                  contentStyle={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)', borderRadius: '10px', fontSize: '11px' }}
                  formatter={(v: number | undefined) => [typeof v === 'number' ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—', 'Salário']}
                />
                <Area type="monotone" dataKey="salary" stroke="#10b981" strokeWidth={2} fill="url(#salGrad)" dot={{ fill: '#10b981', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">📜</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Histórico vazio</h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-5">Registre sua trajetória profissional.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#f59e0b] text-[#03071a] hover:opacity-90"
          >
            <Plus size={15} />
            Primeiro registro
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {history.map((entry, idx) => {
            const color = CHANGE_TYPE_COLORS[entry.change_type as ChangeType] ?? '#6e90b8'
            const delta = salaryDelta(idx)
            const isLast = idx === history.length - 1

            return (
              <div key={entry.id} className="flex gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center pt-3" style={{ minWidth: '28px' }}>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10"
                    style={{ borderColor: color, background: color + '20' }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-[var(--sl-border)] mt-1" style={{ minHeight: '24px' }} />}
                </div>

                {/* Content */}
                <div className={cn('flex-1 pb-4', isLast ? 'pb-0' : '')}>
                  <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 hover:border-[var(--sl-border-h)] transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className="font-semibold text-[14px] text-[var(--sl-t1)]">{entry.title}</h3>
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ color, background: color + '20' }}
                          >
                            {CHANGE_TYPE_LABELS[entry.change_type as ChangeType] ?? entry.change_type}
                          </span>
                        </div>
                        {entry.company && (
                          <p className="text-[12px] text-[var(--sl-t2)]">{entry.company}</p>
                        )}
                        <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
                          {new Date(entry.start_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                          {entry.end_date && ` → ${new Date(entry.end_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
                          {entry.level && ` · ${LEVEL_LABELS[entry.level as keyof typeof LEVEL_LABELS] ?? entry.level}`}
                        </p>
                      </div>

                      {entry.salary != null && (
                        <div className="text-right shrink-0">
                          <p className="font-[DM_Mono] font-medium text-[14px] text-[var(--sl-t1)]">
                            {entry.salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                          {delta != null && (
                            <div className={cn(
                              'flex items-center justify-end gap-0.5 text-[11px] font-semibold mt-0.5',
                              delta >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'
                            )}>
                              {delta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {entry.notes && (
                      <p className="text-[11px] text-[var(--sl-t3)] mt-2 italic border-t border-[var(--sl-border)] pt-2">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Conquistas do Herói — Jornada only */}
      {history.length > 0 && (
        <div className="mt-5 bg-[var(--sl-s1)] border rounded-2xl p-5"
          style={{ borderColor: 'rgba(139,92,246,0.25)', background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(236,72,153,0.03))' }}>
          <h2 className="font-[Syne] font-bold text-[13px] mb-3" style={{ color: '#c4b5fd' }}>🏆 Conquistas do Herói</h2>
          <div className="flex gap-2 flex-wrap">
            {history.filter(h => h.change_type === 'promotion' || h.change_type === 'initial').map((h, i) => (
              <div key={h.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.2)' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : '⭐'} {h.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Celebração de Promoção — Jornada only */}
      {celebracao?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-[380px] bg-[var(--sl-s1)] rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--sl-border)]">
              <p className="text-[12px] font-bold text-[#c4b5fd]">✦ Conquista Desbloqueada!</p>
              <h3 className="font-[Syne] font-bold text-[16px] text-[var(--sl-t1)]">Promoção Registrada</h3>
              <button onClick={() => setCelebracao(null)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)]">✕</button>
            </div>

            {/* Hero */}
            <div
              className="m-4 p-5 rounded-2xl text-center border border-[rgba(139,92,246,0.28)]"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(244,63,94,0.08))' }}
            >
              <div className="text-[48px] mb-2">🎉</div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#c4b5fd] mb-1">NOVO CAPÍTULO DESBLOQUEADO</p>
              <p className="font-[Syne] font-extrabold text-[22px] text-[var(--sl-t1)] mb-1">{celebracao.newTitle}</p>
              <p
                className="font-[DM_Mono] font-bold text-[28px]"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                +100 XP
              </p>
              <p className="text-[11px] text-[var(--sl-t2)] mt-1">Badge &quot;Evolução&quot; desbloqueado</p>
            </div>

            {/* Impacto financeiro */}
            {celebracao.oldSalary > 0 && celebracao.newSalary > celebracao.oldSalary && (
              <div
                className="mx-4 mb-3 p-4 rounded-xl border border-[rgba(16,185,129,0.2)]"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(244,63,94,0.06))' }}
              >
                <p className="text-[11px] font-bold text-[#c4b5fd] mb-2.5">💰 IMPACTO DA CONQUISTA</p>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] text-[var(--sl-t2)]">Salário anterior</span>
                  <span className="font-[DM_Mono] text-[13px] text-[var(--sl-t1)] line-through">
                    {celebracao.oldSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] text-[var(--sl-t2)]">Novo salário</span>
                  <span className="font-[DM_Mono] text-[13px] font-semibold text-[#f43f5e]">
                    {celebracao.newSalary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="h-px bg-[var(--sl-border)] my-2" />
                <div className="flex justify-between">
                  <span className="text-[12px] font-semibold text-[var(--sl-t1)]">Aumento</span>
                  <span className="font-[DM_Mono] text-[14px] font-bold text-[#10b981]">
                    +{Math.round(((celebracao.newSalary - celebracao.oldSalary) / celebracao.oldSalary) * 100)}% · +{(celebracao.newSalary - celebracao.oldSalary).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
                  </span>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="grid grid-cols-3 gap-2 mx-4 mb-4">
              {([['🏆', 'Evolução'], ['📈', '+Salary'], ['⭐', `Nível ${CARREIRA_XP.level}`]] as [string, string][]).map(([emoji, label]) => (
                <div key={label} className="p-3 bg-[var(--sl-s2)] border border-[rgba(139,92,246,0.2)] rounded-xl text-center">
                  <div className="text-[24px] mb-1">{emoji}</div>
                  <p className="text-[10px] font-bold text-[#c4b5fd]">{label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-4 pb-4">
              <button
                onClick={() => setCelebracao(null)}
                className="w-full py-3.5 rounded-[14px] font-[Syne] font-bold text-[16px] text-white"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #f43f5e)' }}
              >
                ✦ Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">📜 Novo Registro</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] text-xl leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {/* Type */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5 block">Tipo de Mudança</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CHANGE_TYPES.map(ct => (
                    <button
                      key={ct}
                      onClick={() => setForm(f => ({ ...f, change_type: ct }))}
                      className={cn(
                        'px-2 py-1.5 rounded-[8px] text-[11px] border transition-all text-left',
                        form.change_type === ct
                          ? 'text-[var(--sl-t1)]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                      style={form.change_type === ct ? {
                        borderColor: CHANGE_TYPE_COLORS[ct],
                        background: CHANGE_TYPE_COLORS[ct] + '15',
                      } : undefined}
                    >
                      {CHANGE_TYPE_LABELS[ct]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cargo + Empresa */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Cargo</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Dev Sênior"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Empresa</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Nome da empresa"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              {/* Salário + Nível */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Salário (R$)</label>
                  <input
                    type="number"
                    value={form.salary}
                    onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
                    placeholder="Opcional"
                    min="0"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Nível</label>
                  <select
                    value={form.level}
                    onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b] appearance-none"
                  >
                    <option value="">Selecione</option>
                    {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Data de Início</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Data de Saída</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#f59e0b]"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Conquistas, motivos, contexto..."
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
                  onClick={handleAdd}
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f59e0b] text-[#03071a] hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isSaving ? 'Salvando...' : 'Adicionar'}
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
