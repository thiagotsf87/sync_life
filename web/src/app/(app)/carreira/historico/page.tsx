'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, TrendingUp, TrendingDown, Scroll, LineChart as LineChartIcon,
  Trophy, Medal, Star, PartyPopper, Wallet, X, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  useCareerHistory, useAddHistoryEntry,
  useProfessionalProfile, useSkills, useCareerRoadmaps, useSaveSkill,
  LEVEL_LABELS,
  type AddHistoryData,
} from '@/hooks/use-carreira'
import { CarreiraMobile } from '@/components/carreira/CarreiraMobile'
import { ModuleHeader } from '@/components/ui/module-header'
import { TextField } from '@/components/ui/text-field'
import { SelectField } from '@/components/ui/select-field'
import { KpiCard } from '@/components/ui/kpi-card'
import { fmtBRL } from '@/lib/format/currency'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer,
} from 'recharts'
import { createTransactionFromSalario } from '@/lib/integrations/financas'
import { CARREIRA_XP } from '@/lib/carreira-xp-mock'

const CARREIRA = '#DB6478'

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
  initial: '#0B2D34',
  promotion: '#0F766E',
  lateral: '#D9962E',
  company_change: '#8B7BD4',
  salary_change: '#3CA0B5',
  other: '#6F7986',
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
        } catch (err) { console.warn('[CrossModule] Falha ao criar transacao de salario em Financas:', err) }
      }

      if (form.change_type === 'promotion' && data.salary) {
        const oldSalary = history[0]?.salary ?? 0
        setCelebracao({
          open: true,
          newTitle: data.title,
          newSalary: data.salary,
          oldSalary,
        })
      }

      toast.success('Histórico adicionado')
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
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* Back link */}
      <button
        onClick={() => router.push('/carreira')}
        className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Carreira
      </button>

      {/* MODULE HEADER */}
      <ModuleHeader
        icon={Scroll}
        iconBg="rgba(219,100,120,.08)"
        iconColor={CARREIRA}
        title="Histórico de carreira"
        subtitle={history.length > 0
          ? `${history.length} registros · ${withSalary.length >= 2 ? `Crescimento total: ${totalGrowthPct >= 0 ? '+' : ''}${totalGrowthPct.toFixed(1)}%` : 'Sem dados salariais suficientes'}`
          : 'Registre sua trajetoria profissional'}
      >
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold
                     text-white hover:brightness-110 transition-all"
          style={{ background: 'var(--sl-em)' }}
        >
          <Plus size={16} />
          Adicionar
        </button>
      </ModuleHeader>

      {/* KPI Strip */}
      {history.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2 sl-fade-up sl-delay-1">
          <KpiCard
            label="Crescimento total"
            value={withSalary.length >= 2 ? `${totalGrowthPct >= 0 ? '+' : ''}${totalGrowthPct.toFixed(1)}%` : '–'}
            accent="var(--sl-em)"
            deltaType={totalGrowthPct >= 0 ? 'up' : 'down'}
          />
          <KpiCard
            label="Maior salário"
            value={withSalary.length > 0 ? fmtBRL(maxSalary) : '–'}
            accent="var(--sl-em)"
          />
          <KpiCard
            label="Registros"
            value={String(history.length)}
            accent="var(--sl-petrol)"
          />
          <KpiCard
            label="Salário inicial"
            value={withSalary.length > 0 ? fmtBRL(withSalary[withSalary.length - 1].salary!) : '–'}
            accent="var(--sl-petrol)"
          />
        </div>
      )}

      {/* Salary Chart */}
      {withSalary.length >= 2 && (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-5 mb-5 sl-fade-up sl-delay-2 transition-colors hover:border-[var(--sl-border-h)]">
          <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-4 flex items-center gap-1.5">
            <LineChartIcon size={16} style={{ color: CARREIRA }} /> Evolução salarial
          </h2>
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
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sl-s3)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--sl-t3)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--sl-t3)' }} tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                <ReTooltip
                  contentStyle={{ background: 'var(--sl-s-hero)', border: '1px solid var(--sl-border)', borderRadius: '10px', fontSize: '11px' }}
                  labelStyle={{ color: 'var(--sl-t2)' }}
                  formatter={(v: number | undefined) => [typeof v === 'number' ? fmtBRL(v) : '–', 'Salário']}
                />
                <Area type="monotone" dataKey="salary" stroke="#0F766E" strokeWidth={2} fill="url(#salGrad)" dot={{ fill: '#0F766E', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-[16px] bg-[var(--sl-s2)] animate-pulse" />)}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-12 text-center">
          <div className="mb-3 flex justify-center"><Scroll size={36} className="text-[var(--sl-t3)]" /></div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Histórico vazio</h3>
          <p className="text-[13px] text-[var(--sl-t2)] mb-5">Registre sua trajetoria profissional.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white hover:opacity-90"
            style={{ background: 'var(--sl-em)' }}
          >
            <Plus size={15} />
            Primeiro registro
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-0 sl-fade-up sl-delay-3">
          {history.map((entry, idx) => {
            const color = CHANGE_TYPE_COLORS[entry.change_type as ChangeType] ?? CHANGE_TYPE_COLORS.other
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
                  <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className="font-semibold text-[14px] text-[var(--sl-t1)]">{entry.title}</h3>
                          <span
                            className="text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full shrink-0"
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
                          <p className="sl-num-strong text-[14px] text-[var(--sl-t1)]">
                            {fmtBRL(entry.salary)}
                          </p>
                          {delta != null && (
                            <div className={cn(
                              'flex items-center justify-end gap-0.5 text-[11px] font-semibold mt-0.5 sl-num',
                              delta >= 0 ? 'text-[var(--sl-em)]' : 'text-[var(--sl-danger)]'
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

      {/* Conquistas do Herói */}
      {history.length > 0 && (
        <div className="mt-5 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] p-5 transition-colors hover:border-[var(--sl-border-h)]">
          <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-3 flex items-center gap-1.5">
            <Trophy size={16} style={{ color: CARREIRA }} /> Conquistas do herói
          </h2>
          <div className="flex gap-2 flex-wrap">
            {history.filter(h => h.change_type === 'promotion' || h.change_type === 'initial').map((h, i) => (
              <div key={h.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold"
                style={{ background: 'rgba(219,100,120,0.10)', color: CARREIRA, border: '1px solid rgba(219,100,120,0.2)' }}>
                {i === 0 ? <Trophy size={12} /> : i === 1 ? <Medal size={12} /> : <Star size={12} />} {h.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Celebração de Promoção */}
      {celebracao?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-[380px] bg-[var(--sl-s1)] rounded-[16px] border border-[var(--sl-border-h)] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--sl-border)]">
              <p className="text-[12px] font-bold flex items-center gap-1" style={{ color: CARREIRA }}>
                <Sparkles size={12} /> Conquista desbloqueada
              </p>
              <button onClick={() => setCelebracao(null)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)]"><X size={16} /></button>
            </div>

            {/* Hero */}
            <div
              className="m-4 p-5 rounded-2xl text-center border border-[rgba(219,100,120,0.28)]"
              style={{ background: 'rgba(219,100,120,0.08)' }}
            >
              <div className="mb-2 flex justify-center"><PartyPopper size={44} style={{ color: CARREIRA }} /></div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: CARREIRA }}>NOVO CAPÍTULO DESBLOQUEADO</p>
              <p className="font-[Syne] font-extrabold text-[22px] text-[var(--sl-t1)] mb-1">{celebracao.newTitle}</p>
              <p className="sl-num-strong text-[28px]" style={{ color: 'var(--sl-em)' }}>
                +100 XP
              </p>
              <p className="text-[11px] text-[var(--sl-t2)] mt-1">Badge &quot;Evolucao&quot; desbloqueado</p>
            </div>

            {/* Impacto financeiro */}
            {celebracao.oldSalary > 0 && celebracao.newSalary > celebracao.oldSalary && (
              <div
                className="mx-4 mb-3 p-4 rounded-xl border border-[rgba(15,118,110,0.2)]"
                style={{ background: 'rgba(15,118,110,0.06)' }}
              >
                <p className="text-[11px] font-bold mb-2.5 flex items-center gap-1.5" style={{ color: 'var(--sl-em)' }}>
                  <Wallet size={12} /> IMPACTO DA CONQUISTA
                </p>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] text-[var(--sl-t2)]">Salário anterior</span>
                  <span className="sl-num text-[13px] text-[var(--sl-t1)] line-through">
                    {fmtBRL(celebracao.oldSalary)}
                  </span>
                </div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] text-[var(--sl-t2)]">Novo salário</span>
                  <span className="sl-num-strong text-[13px]" style={{ color: CARREIRA }}>
                    {fmtBRL(celebracao.newSalary)}
                  </span>
                </div>
                <div className="h-px bg-[var(--sl-border)] my-2" />
                <div className="flex justify-between">
                  <span className="text-[12px] font-semibold text-[var(--sl-t1)]">Aumento</span>
                  <span className="sl-num-strong text-[14px]" style={{ color: 'var(--sl-em)' }}>
                    +{Math.round(((celebracao.newSalary - celebracao.oldSalary) / celebracao.oldSalary) * 100)}% · +{fmtBRL(celebracao.newSalary - celebracao.oldSalary)}/mês
                  </span>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="grid grid-cols-3 gap-2 mx-4 mb-4">
              {([
                [Trophy, 'Evolucao'],
                [LineChartIcon, '+Salary'],
                [Star, `Nivel ${CARREIRA_XP.level}`],
              ] as [typeof Trophy, string][]).map(([Icon, label]) => (
                <div key={label} className="p-3 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl text-center">
                  <div className="mb-1 flex justify-center"><Icon size={22} style={{ color: CARREIRA }} /></div>
                  <p className="text-[10px] font-bold" style={{ color: CARREIRA }}>{label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-4 pb-4">
              <button
                onClick={() => setCelebracao(null)}
                className="w-full py-3.5 rounded-[14px] font-[Syne] font-bold text-[16px] text-white"
                style={{ background: 'var(--sl-em)' }}
              >
                Continuar
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
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[16px] w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--sl-border)]">
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] flex items-center gap-1.5">
                <Scroll size={15} style={{ color: CARREIRA }} /> Novo registro
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)]"><X size={16} /></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {/* Type */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5 block">Tipo de mudança</label>
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
                <TextField
                  label="Cargo"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Dev Senior"
                />
                <TextField
                  label="Empresa"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  placeholder="Nome da empresa"
                />
              </div>

              {/* Salario + Nivel */}
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Salário (R$)"
                  type="number"
                  value={form.salary}
                  onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
                  placeholder="Opcional"
                  min="0"
                />
                <SelectField
                  label="Nivel"
                  value={form.level}
                  onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                  options={[
                    { value: '', label: 'Selecione' },
                    ...Object.entries(LEVEL_LABELS).map(([v, l]) => ({ value: v, label: l })),
                  ]}
                />
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Data de início"
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                />
                <TextField
                  label="Data de saída"
                  type="date"
                  value={form.end_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                />
              </div>

              {/* Notas */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5 block">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Conquistas, motivos, contexto..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-em)] resize-none"
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
                  className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ background: 'var(--sl-em)' }}
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
