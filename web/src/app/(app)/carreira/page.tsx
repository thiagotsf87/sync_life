'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { useCarreiraDashboard, LEVEL_LABELS } from '@/hooks/use-carreira'
import { KpiCard } from '@/components/ui/kpi-card'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { RoadmapTimeline } from '@/components/carreira/RoadmapTimeline'
import { SkillCard } from '@/components/carreira/SkillCard'

export default function CarreiraPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { profile, activeRoadmap, skills, loading, error } = useCarreiraDashboard()

  const expertSkills = skills.filter(s => s.proficiency_level >= 4).length
  const salaryLabel = profile?.gross_salary
    ? profile.gross_salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—'
  const roadmapProgress = activeRoadmap ? Math.round(activeRoadmap.progress) : 0
  const nextStep = activeRoadmap?.steps?.find(s => s.status !== 'completed')

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className={cn(
          'font-[Syne] font-extrabold text-2xl',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          💼 Carreira
        </h1>
        <div className="flex-1" />
        <button
          onClick={() => router.push('/carreira/perfil')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold
                     bg-[#f59e0b] text-[#03071a] hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          {profile ? 'Editar Perfil' : 'Configurar Perfil'}
        </button>
      </div>

      {/* ② Summary Strip */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        <KpiCard
          label="Cargo Atual"
          value={profile?.level ? LEVEL_LABELS[profile.level] : '—'}
          delta={profile?.current_company ?? profile?.current_title ?? 'Perfil não configurado'}
          deltaType="neutral"
          accent="#f59e0b"
        />
        <KpiCard
          label="Salário Bruto"
          value={salaryLabel}
          accent="#10b981"
        />
        <KpiCard
          label="Roadmap"
          value={`${roadmapProgress}%`}
          delta={activeRoadmap?.name ?? 'Nenhum ativo'}
          deltaType={roadmapProgress > 50 ? 'up' : 'neutral'}
          accent="#0055ff"
        />
        <KpiCard
          label="Habilidades"
          value={String(skills.length)}
          delta={expertSkills > 0 ? `${expertSkills} avançada${expertSkills !== 1 ? 's' : ''}` : 'Adicione'}
          deltaType={expertSkills > 0 ? 'up' : 'neutral'}
          accent="#a855f7"
        />
      </div>

      {/* ③ Jornada Insight */}
      <JornadaInsight
        text={
          profile
            ? <>Você é <strong className="text-[var(--sl-t1)]">{profile.current_title ?? 'profissional'}</strong>
              {activeRoadmap && <> com <strong className="text-[#f59e0b]">{roadmapProgress}%</strong> do caminho para <strong className="text-[var(--sl-t1)]">{activeRoadmap.target_title}</strong> percorrido</>}.
              {nextStep && <> Próximo passo: {nextStep.title}.</>}</>
            : <>Configure seu perfil profissional para desbloquear projeções de carreira e integração com o módulo Finanças.</>
        }
      />

      {/* ④ Main layout */}
      {loading ? (
        <div className="grid grid-cols-[1fr_300px] gap-4 max-lg:grid-cols-1">
          <div className="h-64 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
          <div className="h-64 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_300px] gap-4 max-lg:grid-cols-1">

          {/* Roadmap */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">🗺 Roadmap Ativo</h2>
              <button onClick={() => router.push('/carreira/roadmap')} className="text-[12px] text-[#f59e0b] hover:opacity-80">
                Ver todos →
              </button>
            </div>

            {activeRoadmap ? (
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">{activeRoadmap.name}</h3>
                  <span className="font-[DM_Mono] text-[13px] font-bold text-[#f59e0b]">{roadmapProgress}%</span>
                </div>
                <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden mb-4" style={{ height: '4px' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(roadmapProgress, 100)}%`, background: 'linear-gradient(90deg, #f59e0b, #0055ff)' }}
                  />
                </div>
                <RoadmapTimeline roadmap={activeRoadmap} />
              </div>
            ) : (
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">🗺</div>
                <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Nenhum roadmap ativo</h3>
                <p className="text-[13px] text-[var(--sl-t2)] mb-4">Crie um plano de carreira com passos concretos.</p>
                <button
                  onClick={() => router.push('/carreira/roadmap')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#f59e0b] text-[#03071a] hover:opacity-90"
                >
                  Criar Roadmap
                </button>
              </div>
            )}
          </div>

          {/* Skills sidebar */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 h-fit">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">⭐ Habilidades</h2>
              <button onClick={() => router.push('/carreira/habilidades')} className="text-[11px] text-[#f59e0b] hover:opacity-80">
                Gerenciar →
              </button>
            </div>
            {skills.length === 0 ? (
              <p className="text-[12px] text-[var(--sl-t3)]">Nenhuma habilidade cadastrada.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {skills.slice(0, 6).map(skill => <SkillCard key={skill.id} skill={skill} />)}
                {skills.length > 6 && (
                  <button onClick={() => router.push('/carreira/habilidades')} className="text-[11px] text-[var(--sl-t3)] hover:text-[var(--sl-t2)] text-center py-1">
                    +{skills.length - 6} habilidades
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 mt-4 max-sm:grid-cols-2">
        {[
          { label: '👤 Perfil', href: '/carreira/perfil', color: '#f59e0b' },
          { label: '🗺 Roadmap', href: '/carreira/roadmap', color: '#0055ff' },
          { label: '⭐ Habilidades', href: '/carreira/habilidades', color: '#a855f7' },
          { label: '📜 Histórico', href: '/carreira/historico', color: '#10b981' },
        ].map(({ label, href, color }) => (
          <button key={href} onClick={() => router.push(href)}
            className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4 text-left hover:border-[var(--sl-border-h)] transition-colors sl-fade-up"
          >
            <div className="h-0.5 w-8 rounded-full mb-2" style={{ background: color }} />
            <p className="font-medium text-[13px] text-[var(--sl-t1)]">{label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
