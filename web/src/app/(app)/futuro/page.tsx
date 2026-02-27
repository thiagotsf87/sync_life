'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { useObjectives, useCreateObjective, type ObjectiveStatus, type ObjectiveCategory } from '@/hooks/use-futuro'
import { KpiCard } from '@/components/ui/kpi-card'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { ObjectiveCard } from '@/components/futuro/ObjectiveCard'
import { ObjectiveWizard } from '@/components/futuro/ObjectiveWizard'

// ─── Filter types ─────────────────────────────────────────────────────────────

type StatusFilter = 'all' | ObjectiveStatus
type CategoryFilter = 'all' | ObjectiveCategory

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'paused', label: 'Pausados' },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FuturoPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { objectives, active, completed, avgProgress, nextDeadline, loading, error, reload } = useObjectives()
  const createObjective = useCreateObjective()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')

  // ─── Filter objectives ──────────────────────────────────────────────────────
  const filtered = objectives.filter(obj => {
    if (statusFilter !== 'all' && obj.status !== statusFilter) return false
    if (search && !obj.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async (data: Parameters<typeof createObjective>[0]) => {
    setIsCreating(true)
    try {
      await createObjective(data)
      toast.success(`Objetivo "${data.name}" criado!`)
      setWizardOpen(false)
      await reload()
    } catch {
      toast.error('Erro ao criar objetivo')
    } finally {
      setIsCreating(false)
    }
  }, [createObjective, reload])

  // ─── KPI formatting ──────────────────────────────────────────────────────────
  const nextDeadlineLabel = nextDeadline?.target_date
    ? new Date(nextDeadline.target_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : 'Sem prazo'

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className={cn(
          'font-[Syne] font-extrabold text-2xl',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          🔮 Futuro
        </h1>
        <div className="flex-1" />
        <button
          onClick={() => setWizardOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#10b981] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Novo Objetivo
        </button>
      </div>

      {/* ② Summary Strip — 4 KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Objetivos Ativos"
          value={String(active.length)}
          accent="#0055ff"
        />
        <KpiCard
          label="Progresso Geral"
          value={`${avgProgress}%`}
          delta={active.length > 0 ? `${active.length} objetivos` : 'Nenhum ativo'}
          deltaType="neutral"
          accent="#10b981"
        />
        <KpiCard
          label="Próximo Prazo"
          value={nextDeadlineLabel}
          delta={nextDeadline?.name ?? ''}
          deltaType="warn"
          accent="#f59e0b"
        />
        <KpiCard
          label="Concluídos"
          value={String(completed.length)}
          delta={completed.length > 0 ? 'Este ciclo' : 'Continue firme!'}
          deltaType={completed.length > 0 ? 'up' : 'neutral'}
          accent="#10b981"
        />
      </div>

      {/* ③ Jornada Insight */}
      <JornadaInsight
        text={
          active.length > 0
            ? <>Você tem <strong className="text-[var(--sl-t1)]">{active.length} objetivos ativos</strong> com progresso médio de <strong className="text-[#10b981]">{avgProgress}%</strong>. {avgProgress >= 50 ? 'Você está no caminho certo!' : 'Vamos adicionar mais metas para acelerar.'}</>
            : <>Crie seu primeiro objetivo para começar a mapear o futuro que você quer construir.</>
        }
      />

      {/* ④ Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border',
              statusFilter === tab.value
                ? 'bg-[#0055ff] text-white border-[#0055ff]'
                : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
            )}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3 py-1.5 max-w-[180px]">
          <Search size={13} className="text-[var(--sl-t3)] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="bg-transparent text-[12px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none w-full"
          />
        </div>
      </div>

      {/* ⑤ Objectives grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[130px] rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-[13px] text-[var(--sl-t2)] mb-4">
            {error.includes('does not exist')
              ? 'Execute a migration 005 no Supabase para ativar este módulo.'
              : error}
          </p>
          <button
            onClick={() => reload()}
            className="px-4 py-2 rounded-[10px] text-[12px] font-semibold bg-[var(--sl-s2)] text-[var(--sl-t1)] hover:opacity-80"
          >
            Tentar novamente
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">🔮</div>
          <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
            {search || statusFilter !== 'all' ? 'Nenhum objetivo encontrado' : 'Comece a desenhar seu futuro'}
          </h3>
          <p className="text-[13px] text-[var(--sl-t2)] max-w-sm mx-auto mb-4">
            {search || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Crie seu primeiro objetivo e defina as metas que vão te levar lá.'}
          </p>
          {!search && statusFilter === 'all' && (
            <button
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                         bg-[#10b981] text-[#03071a] hover:opacity-90 transition-opacity"
            >
              <Plus size={15} />
              Criar primeiro objetivo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
          {filtered.map((obj, idx) => (
            <div key={obj.id} className={`sl-delay-${Math.min(idx + 1, 5)}`}>
              <ObjectiveCard
                objective={obj}
                onClick={() => router.push(`/futuro/${obj.id}`)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Wizard */}
      <ObjectiveWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSave={handleCreate}
        isLoading={isCreating}
      />
    </div>
  )
}
