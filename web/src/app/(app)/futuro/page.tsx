'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { useMetas, type GoalStatus, type GoalFormData } from '@/hooks/use-metas'
import { KpiCard } from '@/components/ui/kpi-card'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { MetaCard } from '@/components/metas/MetaCard'
import { MetaModal } from '@/components/metas/MetaModal'
import { SimuladorAportes } from '@/components/metas/SimuladorAportes'
import { AddContributionModal } from '@/components/metas/AddContributionModal'
import type { Goal } from '@/hooks/use-metas'

type StatusFilter = 'all' | 'active' | 'completed' | 'paused' | 'archived'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Ativas' },
  { value: 'completed', label: 'Concluídas' },
  { value: 'paused', label: 'Pausadas' },
]

function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function MetasPage() {
  const router = useRouter()
  const mode = useShellStore(s => s.mode)
  const isJornada = mode === 'jornada'

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | undefined>()
  const [contribGoal, setContribGoal] = useState<Goal | null>(null)

  const { goals, kpis, isLoading, error, create, update, remove, addContribution } = useMetas({
    status: statusFilter === 'all' ? undefined : statusFilter as GoalStatus,
  })

  const handleCreate = useCallback(async (data: GoalFormData) => {
    try {
      await create(data)
      toast.success('Meta criada com sucesso!')
    } catch (e) {
      toast.error('Erro ao criar meta')
      throw e
    }
  }, [create])

  const handleEdit = useCallback(async (data: GoalFormData) => {
    if (!editGoal) return
    try {
      await update(editGoal.id, data)
      toast.success('Meta atualizada!')
    } catch (e) {
      toast.error('Erro ao atualizar meta')
      throw e
    }
  }, [editGoal, update])

  const handleContrib = useCallback(async (goalId: string, amount: number, date: string, notes?: string) => {
    try {
      await addContribution(goalId, amount, date, notes)
      toast.success('Aporte registrado!')
    } catch (e) {
      toast.error('Erro ao registrar aporte')
      throw e
    }
  }, [addContribution])

  const handleRemove = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return
    try {
      await remove(id)
      toast.success('Meta excluída')
    } catch {
      toast.error('Erro ao excluir meta')
    }
  }, [remove])

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className={cn(
          'font-[Syne] font-extrabold text-2xl',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]',
        )}>
          🎯 {isJornada ? 'Suas Conquistas' : 'Minhas Metas'}
        </h1>
        <div className="flex-1" />
        {/* Filtros de status */}
        <div className="flex items-center gap-1 bg-[var(--sl-s2)] p-1 rounded-[12px] border border-[var(--sl-border)]">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 rounded-[9px] text-[12px] font-semibold transition-all',
                statusFilter === tab.value
                  ? 'bg-[#10b981] text-[#03071a]'
                  : 'text-[var(--sl-t2)] hover:text-[var(--sl-t1)]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditGoal(undefined); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-[12px] text-[13px] font-bold text-[#03071a] hover:brightness-110 transition-all"
          style={{ background: '#10b981' }}
        >
          <Plus size={15} />
          Nova Meta
        </button>
      </div>

      {/* ② KPI Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard label="Total de metas" value={String(kpis.total)} accent="#10b981" />
        <KpiCard
          label="Ativas"
          value={String(kpis.active)}
          delta={kpis.paused > 0 ? `${kpis.paused} pausada${kpis.paused > 1 ? 's' : ''}` : undefined}
          deltaType="warn"
          accent="#0055ff"
        />
        <KpiCard
          label="Concluídas"
          value={String(kpis.completed)}
          delta={kpis.completed > 0 ? '🏆 Parabéns!' : undefined}
          deltaType="up"
          accent="#10b981"
        />
        <KpiCard
          label="Total guardado"
          value={formatCurrency(kpis.totalSaved)}
          delta={`${kpis.overallProgress}% da meta global`}
          deltaType={kpis.overallProgress >= 50 ? 'up' : 'neutral'}
          accent="#f59e0b"
        />
      </div>

      {/* ③ Jornada Insight */}
      <JornadaInsight text={
        kpis.totalSaved > 0
          ? `Você já guardou ${formatCurrency(kpis.totalSaved)} em direção às suas metas — ${kpis.overallProgress}% do total. ${kpis.completed > 0 ? `Você já concluiu ${kpis.completed} meta${kpis.completed > 1 ? 's' : ''}! 🏆` : 'Continue firme!'}`
          : 'Comece criando sua primeira meta. Cada real guardado é um passo para o seu sonho! 🌟'
      } />

      {/* ④ Conteúdo principal */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 h-[280px] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-[#f43f5e] font-semibold mb-2">Erro ao carregar metas</p>
            <p className="text-[13px] text-[var(--sl-t3)]">{error.message}</p>
          </div>
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <span className="text-6xl">🎯</span>
          <div className="text-center">
            <p className="font-[Syne] font-extrabold text-[16px] text-[var(--sl-t1)] mb-1">
              {statusFilter === 'all' ? 'Nenhuma meta criada ainda' : `Nenhuma meta ${statusFilter === 'active' ? 'ativa' : statusFilter === 'completed' ? 'concluída' : 'pausada'}`}
            </p>
            <p className="text-[13px] text-[var(--sl-t3)]">
              {statusFilter === 'all' ? 'Crie sua primeira meta e comece a sonhar grande!' : 'Tente outro filtro ou crie uma nova meta.'}
            </p>
          </div>
          {statusFilter === 'all' && (
            <button
              onClick={() => { setEditGoal(undefined); setModalOpen(true) }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13px] font-bold text-[#03071a] hover:brightness-110 transition-all"
              style={{ background: '#10b981' }}
            >
              <Plus size={15} />
              Criar Primeira Meta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_340px] gap-4 max-lg:grid-cols-1">

          {/* Coluna principal — grid de MetaCards */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              {goals.map((goal, idx) => (
                <div key={goal.id} className={`sl-delay-${Math.min(idx + 1, 5)}`}>
                  <MetaCard
                    goal={goal}
                    onClick={() => router.push(`/futuro/${goal.id}`)}
                    onAddContribution={() => setContribGoal(goal)}
                  />
                  {/* Editar / Excluir */}
                  <div className="flex items-center gap-2 mt-1.5 px-1">
                    <button
                      onClick={() => { setEditGoal(goal); setModalOpen(true) }}
                      className="text-[11px] text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors"
                    >
                      Editar
                    </button>
                    <span className="text-[var(--sl-border)]">·</span>
                    <button
                      onClick={() => handleRemove(goal.id)}
                      className="text-[11px] text-[var(--sl-t3)] hover:text-[#f43f5e] transition-colors"
                    >
                      Excluir
                    </button>
                    <span className="text-[var(--sl-border)]">·</span>
                    <button
                      onClick={() => router.push(`/futuro/${goal.id}`)}
                      className="text-[11px] text-[#10b981] hover:brightness-110 transition-colors"
                    >
                      Ver detalhe →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna lateral — Simulador */}
          <div className="flex flex-col gap-4">
            <SimuladorAportes goals={goals} />

            {/* Jornada: conquistas */}
            {isJornada && kpis.completed > 0 && (
              <div className="hidden [.jornada_&]:block bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up">
                <h3 className="font-[Syne] font-extrabold text-[14px] text-[var(--sl-t1)] mb-3">🏆 Conquistas</h3>
                <div className="flex flex-col gap-2">
                  {goals.filter(g => g.status === 'completed').map(g => (
                    <div key={g.id} className="flex items-center gap-2.5 p-2.5 rounded-[10px] bg-[rgba(16,185,129,.06)] border border-[rgba(16,185,129,.2)]">
                      <span className="text-xl">{g.icon}</span>
                      <div className="flex-1">
                        <p className="text-[12px] font-semibold text-[#10b981]">{g.name}</p>
                        <p className="text-[11px] text-[var(--sl-t3)]">
                          {g.completed_at
                            ? new Date(g.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'Concluída'}
                        </p>
                      </div>
                      <span className="text-[#10b981] text-sm">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Foco: resumo rápido */}
            <div className="[.jornada_&]:hidden bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up">
              <h3 className="font-[Syne] font-extrabold text-[14px] text-[var(--sl-t1)] mb-3">📊 Resumo Global</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between py-2 border-b border-[var(--sl-border)]">
                  <span className="text-[13px] text-[var(--sl-t2)]">Total guardado</span>
                  <span className="font-[DM_Mono] text-[13px] text-[#10b981] font-medium">{formatCurrency(kpis.totalSaved)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--sl-border)]">
                  <span className="text-[13px] text-[var(--sl-t2)]">Total das metas</span>
                  <span className="font-[DM_Mono] text-[13px] text-[var(--sl-t1)] font-medium">{formatCurrency(kpis.totalTarget)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--sl-border)]">
                  <span className="text-[13px] text-[var(--sl-t2)]">Progresso geral</span>
                  <span className="font-[DM_Mono] text-[13px] text-[var(--sl-t1)] font-medium">{kpis.overallProgress}%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[13px] text-[var(--sl-t2)]">Metas ativas</span>
                  <span className="font-[DM_Mono] text-[13px] text-[var(--sl-t1)] font-medium">{kpis.active}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Modals */}
      <MetaModal
        open={modalOpen}
        mode={editGoal ? 'edit' : 'create'}
        goal={editGoal}
        onClose={() => { setModalOpen(false); setEditGoal(undefined) }}
        onSave={editGoal ? handleEdit : handleCreate}
      />

      <AddContributionModal
        open={contribGoal !== null}
        goal={contribGoal}
        onClose={() => setContribGoal(null)}
        onSave={handleContrib}
      />

    </div>
  )
}
