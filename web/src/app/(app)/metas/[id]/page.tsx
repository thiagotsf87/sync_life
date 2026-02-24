'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Pencil, Pause, Play, Archive, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { useMetaDetail, useMetas, type GoalFormData } from '@/hooks/use-metas'
import { MetaDetailHero } from '@/components/metas/MetaDetailHero'
import { MilestoneTimeline } from '@/components/metas/MilestoneTimeline'
import { AddContributionModal } from '@/components/metas/AddContributionModal'
import { MetaModal } from '@/components/metas/MetaModal'
import { calcProgress } from '@/hooks/use-metas'
import { JornadaInsight } from '@/components/ui/jornada-insight'

function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MetaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const mode = useShellStore(s => s.mode)
  const isJornada = mode === 'jornada'

  const { goal, contributions, milestones, isLoading, error, refresh } = useMetaDetail(id)
  const { update, remove, addContribution } = useMetas()

  const [editOpen, setEditOpen] = useState(false)
  const [contribOpen, setContribOpen] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)

  const handleContrib = useCallback(async (goalId: string, amount: number, date: string, notes?: string) => {
    try {
      await addContribution(goalId, amount, date, notes)
      refresh()
      toast.success('Aporte registrado!')
    } catch {
      toast.error('Erro ao registrar aporte')
      throw new Error('aporte failed')
    }
  }, [addContribution, refresh])

  const handleEdit = useCallback(async (data: GoalFormData) => {
    if (!goal) return
    try {
      await update(goal.id, data)
      refresh()
      toast.success('Meta atualizada!')
    } catch {
      toast.error('Erro ao atualizar meta')
      throw new Error('update failed')
    }
  }, [goal, update, refresh])

  const handleStatusChange = useCallback(async (newStatus: 'active' | 'paused' | 'archived') => {
    if (!goal) return
    setActionsOpen(false)
    try {
      await update(goal.id, { status: newStatus })
      refresh()
      toast.success(
        newStatus === 'active' ? 'Meta reativada!' :
        newStatus === 'paused' ? 'Meta pausada' :
        'Meta arquivada',
      )
    } catch {
      toast.error('Erro ao alterar status')
    }
  }, [goal, update, refresh])

  const handleDelete = useCallback(async () => {
    if (!goal) return
    if (!confirm(`Excluir a meta "${goal.name}"? Esta ação não pode ser desfeita.`)) return
    try {
      await remove(goal.id)
      toast.success('Meta excluída')
      router.push('/metas')
    } catch {
      toast.error('Erro ao excluir meta')
    }
  }, [goal, remove, router])

  if (isLoading) {
    return (
      <div className="max-w-[1140px] mx-auto px-6 py-7">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-8 w-32 bg-[var(--sl-s2)] rounded-lg" />
          <div className="h-[200px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl" />
          <div className="grid grid-cols-[1fr_320px] gap-4">
            <div className="h-[300px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl" />
            <div className="h-[300px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !goal) {
    return (
      <div className="max-w-[1140px] mx-auto px-6 py-16 text-center">
        <p className="text-[#f43f5e] font-semibold mb-2">Meta não encontrada</p>
        <p className="text-[13px] text-[var(--sl-t3)] mb-4">{error?.message}</p>
        <button
          onClick={() => router.push('/metas')}
          className="px-4 py-2 rounded-[10px] text-[13px] font-semibold"
          style={{ background: '#10b981', color: '#03071a' }}
        >
          Voltar para Metas
        </button>
      </div>
    )
  }

  const pct = calcProgress(goal.current_amount, goal.target_amount)

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <button
          onClick={() => router.push('/metas')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        <div className="flex items-center gap-2">
          {goal.status === 'active' && (
            <button
              onClick={() => setContribOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[12px] font-bold transition-all hover:brightness-110"
              style={{ background: 'rgba(16,185,129,.12)', color: '#10b981', border: '1px solid rgba(16,185,129,.25)' }}
            >
              <Plus size={13} />
              Aporte
            </button>
          )}

          <button
            onClick={() => { setEditOpen(true) }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[12px] font-semibold border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
          >
            <Pencil size={13} />
            Editar
          </button>

          {/* Dropdown de ações */}
          <div className="relative">
            <button
              onClick={() => setActionsOpen(o => !o)}
              className="px-3.5 py-2 rounded-[10px] text-[12px] font-semibold border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
            >
              ···
            </button>
            {actionsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setActionsOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[180px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-1.5 shadow-xl">
                  {goal.status === 'active' && (
                    <ActionItem icon={<Pause size={13} />} label="Pausar meta" onClick={() => handleStatusChange('paused')} />
                  )}
                  {goal.status === 'paused' && (
                    <ActionItem icon={<Play size={13} />} label="Reativar" onClick={() => handleStatusChange('active')} />
                  )}
                  <ActionItem icon={<Archive size={13} />} label="Arquivar" onClick={() => handleStatusChange('archived')} />
                  <div className="my-1 h-px bg-[var(--sl-border)]" />
                  <ActionItem icon={<Trash2 size={13} />} label="Excluir meta" onClick={handleDelete} danger />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ③ Jornada Insight */}
      <JornadaInsight text={
        pct >= 100
          ? `🏆 Você concluiu esta meta! Celebre essa conquista — você se provou capaz de realizar seus objetivos.`
          : `💡 Você está a ${formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))} de concluir "${goal.name}". Continue com os aportes mensais!`
      } />

      {/* Grid principal */}
      <div className="grid grid-cols-[1fr_320px] gap-4 max-lg:grid-cols-1">

        {/* Coluna principal */}
        <div className="flex flex-col gap-4">

          {/* Hero */}
          <MetaDetailHero
            goal={goal}
            contributions={contributions}
            isJornada={isJornada}
          />

          {/* Histórico de aportes */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-[Syne] font-extrabold text-[14px] text-[var(--sl-t1)]">
                💰 Histórico de Aportes
              </h3>
              <span className="text-[11px] font-bold text-[var(--sl-t3)] font-[DM_Mono]">
                {contributions.length} registros
              </span>
            </div>

            {contributions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="text-3xl">📭</span>
                <p className="text-[13px] text-[var(--sl-t3)]">Nenhum aporte registrado ainda.</p>
                {goal.status === 'active' && (
                  <button
                    onClick={() => setContribOpen(true)}
                    className="text-[12px] text-[#10b981] hover:brightness-110 transition-colors mt-1"
                  >
                    + Registrar primeiro aporte
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--sl-border)]">
                {contributions.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[rgba(16,185,129,.12)] flex items-center justify-center text-[12px]">
                        💵
                      </div>
                      <div>
                        <p className="text-[13px] text-[var(--sl-t1)] font-medium">
                          {c.notes ?? 'Aporte'}
                        </p>
                        <p className="text-[11px] text-[var(--sl-t3)]">{formatDate(c.date)}</p>
                      </div>
                    </div>
                    <span className="font-[DM_Mono] font-medium text-[14px] text-[#10b981]">
                      +{formatCurrency(c.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Coluna lateral */}
        <div className="flex flex-col gap-4">

          {/* Milestones */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-1">
            <h3 className="font-[Syne] font-extrabold text-[14px] text-[var(--sl-t1)] mb-4">
              🏁 Marcos
            </h3>
            <MilestoneTimeline milestones={milestones} currentPct={pct} />
          </div>

          {/* Info da meta */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 sl-fade-up sl-delay-2">
            <h3 className="font-[Syne] font-extrabold text-[14px] text-[var(--sl-t1)] mb-3">ℹ️ Informações</h3>
            <div className="flex flex-col gap-2">
              <InfoRow label="Categoria" value={goal.category} />
              <InfoRow label="Tipo" value={goal.goal_type === 'monetary' ? 'Financeira' : 'Hábito'} />
              <InfoRow
                label="Início"
                value={formatDate(goal.start_date)}
                mono
              />
              {goal.notes && (
                <div className="pt-2 mt-1 border-t border-[var(--sl-border)]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">Observações</p>
                  <p className="text-[12px] text-[var(--sl-t2)] leading-relaxed">{goal.notes}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <AddContributionModal
        open={contribOpen}
        goal={goal}
        onClose={() => setContribOpen(false)}
        onSave={handleContrib}
      />

      <MetaModal
        open={editOpen}
        mode="edit"
        goal={goal}
        onClose={() => setEditOpen(false)}
        onSave={handleEdit}
      />

    </div>
  )
}

function ActionItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 rounded-[9px] text-[12px] font-medium transition-colors',
        danger
          ? 'text-[#f43f5e] hover:bg-[rgba(244,63,94,.08)]'
          : 'text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] hover:text-[var(--sl-t1)]',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[var(--sl-t3)]">{label}</span>
      <span className={cn('text-[12px] text-[var(--sl-t1)]', mono && 'font-[DM_Mono]')}>{value}</span>
    </div>
  )
}
