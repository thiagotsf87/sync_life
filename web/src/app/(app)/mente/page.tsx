'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Brain, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { useMenteDashboard, useCreateTrack } from '@/hooks/use-mente'
import { KpiCard } from '@/components/ui/kpi-card'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { TrackCard } from '@/components/mente/TrackCard'
import { TrackWizard } from '@/components/mente/TrackWizard'
import { StudySessionCard } from '@/components/mente/StudySessionCard'
import { toast } from 'sonner'

export default function MentePage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { activeTracks, weekHours, todaySessions, streak, recentSessions, loading, error, reload } = useMenteDashboard()
  const createTrack = useCreateTrack()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreate(data: Parameters<typeof createTrack>[0]) {
    setIsCreating(true)
    try {
      await createTrack(data)
      toast.success(`Trilha "${data.name}" criada!`)
      setWizardOpen(false)
      await reload()
    } catch {
      toast.error('Erro ao criar trilha')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className={cn(
          'font-[Syne] font-extrabold text-2xl',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          🧠 Mente
        </h1>
        <div className="flex-1" />
        <button
          onClick={() => router.push('/mente/timer')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] hover:border-[var(--sl-border-h)] transition-colors"
        >
          ⏱ Timer Pomodoro
        </button>
        <button
          onClick={() => setWizardOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#a855f7] text-white hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Nova Trilha
        </button>
      </div>

      {/* ② Summary Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Horas esta semana"
          value={`${weekHours}h`}
          accent="#a855f7"
        />
        <KpiCard
          label="Streak de Estudos"
          value={`${streak.current_streak}d`}
          delta={streak.longest_streak > 0 ? `Recorde: ${streak.longest_streak}d` : 'Comece hoje!'}
          deltaType={streak.current_streak > 0 ? 'up' : 'neutral'}
          accent="#f97316"
        />
        <KpiCard
          label="Trilhas Ativas"
          value={String(activeTracks.length)}
          accent="#0055ff"
        />
        <KpiCard
          label="Sessões Hoje"
          value={String(todaySessions)}
          delta={todaySessions > 0 ? 'Ótimo ritmo!' : 'Vamos estudar?'}
          deltaType={todaySessions > 0 ? 'up' : 'neutral'}
          accent="#10b981"
        />
      </div>

      {/* ③ Jornada Insight */}
      <JornadaInsight
        text={
          activeTracks.length > 0
            ? <>Você acumulou <strong className="text-[var(--sl-t1)]">{weekHours}h de foco</strong> esta semana
              {streak.current_streak > 1 && <>, com <strong className="text-[#f97316]">🔥 {streak.current_streak} dias</strong> de streak</>}.
              {weekHours >= 5 ? ' Continue assim!' : ' Tente chegar a 5h essa semana.'}</>
            : <>Crie sua primeira trilha de aprendizado e use o Timer Pomodoro para construir o hábito de estudar todos os dias.</>
        }
      />

      {/* ④ Main layout */}
      <div className="grid grid-cols-[1fr_300px] gap-4 max-lg:grid-cols-1">

        {/* Trilhas ativas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">
              Trilhas Ativas ({activeTracks.length})
            </h2>
            <button
              onClick={() => router.push('/mente/trilhas')}
              className="text-[12px] text-[#a855f7] hover:opacity-80 transition-opacity"
            >
              Ver todas →
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[130px] rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 text-center">
              <p className="text-[13px] text-[var(--sl-t2)] mb-2">
                {error.includes('does not exist')
                  ? 'Execute a migration 005 no Supabase para ativar este módulo.'
                  : error}
              </p>
              <button onClick={reload} className="text-[12px] text-[#a855f7] hover:opacity-80">Tentar novamente</button>
            </div>
          ) : activeTracks.length === 0 ? (
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-10 text-center">
              <Brain size={32} className="text-[#a855f7] mx-auto mb-3 opacity-60" />
              <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">
                Nenhuma trilha ativa
              </h3>
              <p className="text-[13px] text-[var(--sl-t2)] max-w-sm mx-auto mb-4">
                Crie sua primeira trilha e organize o que você quer aprender.
              </p>
              <button
                onClick={() => setWizardOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                           bg-[#a855f7] text-white hover:opacity-90 transition-opacity"
              >
                <Plus size={15} />
                Criar Trilha
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              {activeTracks.map((track, idx) => (
                <div key={track.id} className={`sl-delay-${Math.min(idx + 1, 5)}`}>
                  <TrackCard
                    track={track}
                    onClick={() => router.push(`/mente/trilhas`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sessões recentes */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 h-fit">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">
              📊 Sessões Recentes
            </h2>
            <button
              onClick={() => router.push('/mente/sessoes')}
              className="text-[11px] text-[#a855f7] hover:opacity-80"
            >
              Ver todas →
            </button>
          </div>

          {recentSessions.length === 0 ? (
            <p className="text-[12px] text-[var(--sl-t3)]">
              Nenhuma sessão esta semana.{' '}
              <button
                onClick={() => router.push('/mente/timer')}
                className="text-[#a855f7] hover:opacity-80"
              >
                Iniciar timer →
              </button>
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentSessions.map(session => (
                <StudySessionCard key={session.id} session={session} compact />
              ))}
            </div>
          )}

          {/* Streak visual */}
          {streak.current_streak > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--sl-border)] flex items-center gap-2">
              <Flame size={16} className="text-[#f97316]" />
              <div>
                <p className="text-[12px] font-bold text-[var(--sl-t1)]">
                  {streak.current_streak} dia{streak.current_streak !== 1 ? 's' : ''} de streak!
                </p>
                <p className="text-[10px] text-[var(--sl-t3)]">
                  Recorde: {streak.longest_streak}d
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mt-4 max-sm:grid-cols-1">
        {[
          { label: '⏱ Timer Pomodoro', desc: 'Iniciar sessão de foco agora', href: '/mente/timer', color: '#0055ff' },
          { label: '📚 Biblioteca', desc: 'Links, livros e recursos', href: '/mente/biblioteca', color: '#a855f7' },
          { label: '📊 Histórico', desc: 'Todas as sessões de estudo', href: '/mente/sessoes', color: '#10b981' },
        ].map(({ label, desc, href, color }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 text-left hover:border-[var(--sl-border-h)] transition-colors sl-fade-up"
          >
            <div className="h-0.5 w-10 rounded-full mb-3" style={{ background: color }} />
            <p className="font-semibold text-[13px] text-[var(--sl-t1)]">{label}</p>
            <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      {/* Wizard */}
      <TrackWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSave={handleCreate}
        isLoading={isCreating}
      />
    </div>
  )
}
