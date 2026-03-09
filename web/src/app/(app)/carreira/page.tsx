'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCarreiraDashboard, useCareerHistory, useSaveSkill, useAddHistoryEntry, LEVEL_LABELS } from '@/hooks/use-carreira'
import { KpiCard } from '@/components/ui/kpi-card'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { RoadmapTimeline } from '@/components/carreira/RoadmapTimeline'
import { SkillCard } from '@/components/carreira/SkillCard'
import { CarreiraMobile } from '@/components/carreira/CarreiraMobile'
import { CarreiraSimuladorModal } from '@/components/carreira/mobile/CarreiraSimuladorModal'
import { CARREIRA_XP } from '@/lib/carreira-xp-mock'

export default function CarreiraPage() {
  const router = useRouter()

  const { profile, activeRoadmap, skills, loading, error } = useCarreiraDashboard()
  const { history } = useCareerHistory()
  const saveSkill = useSaveSkill()
  const addHistory = useAddHistoryEntry()

  const [showSimulador, setShowSimulador] = useState(false)

  const expertSkills = skills.filter(s => s.proficiency_level >= 4).length
  const salaryLabel = profile?.gross_salary
    ? profile.gross_salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—'
  const roadmapProgress = activeRoadmap ? Math.round(activeRoadmap.progress) : 0
  const nextStep = activeRoadmap?.steps?.find(s => s.status !== 'completed')

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
      onReload={async () => { window.location.reload() }}
    />
    <div className="hidden lg:block max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* ① Topbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className="font-[Syne] font-extrabold text-2xl text-sl-grad">
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

      {/* Empty State — shown when no profile and not loading */}
      {!loading && !profile && (
        <div className="py-10 text-center">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="font-[Syne] font-bold text-[18px] text-[var(--sl-t1)] mb-2">Mapeie sua carreira</h2>
          <p className="text-[14px] text-[var(--sl-t2)] leading-relaxed mb-6 max-w-sm mx-auto">
            Configure seu perfil profissional para acompanhar sua evolução, mapear habilidades e planejar próximos passos.
          </p>

          {/* 3-step wizard */}
          <div className="text-left max-w-sm mx-auto flex flex-col gap-2.5 mb-6">
            {[
              { n: 1, title: 'Cargo atual', desc: 'Empresa, salário, especialidade', active: true },
              { n: 2, title: 'Suas habilidades', desc: 'Skills técnicas, soft skills, idiomas', active: false },
              { n: 3, title: 'Roadmap', desc: 'De onde veio e para onde quer ir', active: false },
            ].map(step => (
              <div key={step.n} className={cn(
                'flex items-center gap-3 p-3.5 bg-[var(--sl-s1)] border rounded-[14px]',
                step.active ? 'border-[rgba(244,63,94,0.3)]' : 'border-[var(--sl-border)]'
              )}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-[Syne] text-[14px] font-extrabold shrink-0',
                  step.active ? 'bg-[#f43f5e] text-white' : 'bg-[var(--sl-s3)] text-[var(--sl-t2)]'
                )}>
                  {step.n}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--sl-t1)]">{step.title}</p>
                  <p className="text-[12px] text-[var(--sl-t2)]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/carreira/perfil')}
            className="px-6 py-3 rounded-[14px] font-[Syne] font-bold text-[15px] text-white"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            Começar configuração
          </button>
          <p className="text-[12px] text-[var(--sl-t3)] mt-3">⏱ Leva menos de 3 minutos</p>
        </div>
      )}

      {/* Main dashboard — shown when profile exists or while loading */}
      {(loading || profile) && (<>

      {/* Capítulo Atual */}
      <div className="mb-5">
        <div className="relative bg-[var(--sl-s1)] border rounded-2xl p-5 overflow-hidden"
          style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.05))' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t" style={{ background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }} />
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#c4b5fd' }}>✦ CAPÍTULO ATUAL</p>
          <h2 className="font-[Syne] font-extrabold text-2xl" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {profile?.current_title ?? 'Configure seu cargo'}
          </h2>
          {profile?.current_company && <p className="text-[13px] text-[var(--sl-t2)] mt-0.5">{profile.current_company}</p>}
          {profile && <p className="text-[11px] mt-2 text-[var(--sl-t3)]">🔥 {CARREIRA_XP.streak} dias · Nível {CARREIRA_XP.level} · {CARREIRA_XP.levelTitle}</p>}
        </div>
      </div>

      {/* XpBar */}
      <div className="mb-5">
        <div className="bg-[var(--sl-s1)] border rounded-2xl p-4 overflow-hidden"
          style={{ borderColor: 'rgba(139,92,246,0.25)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-[Syne] text-[11px] font-extrabold text-white px-2 py-0.5 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                Nível {CARREIRA_XP.level}
              </span>
              <span className="text-[12px] text-[var(--sl-t2)]">{CARREIRA_XP.levelTitle}</span>
            </div>
            <span className="text-[13px] font-bold text-[#fb923c]">🔥 {CARREIRA_XP.streak} dias</span>
          </div>
          <div className="w-full bg-[var(--sl-s3)] rounded-full overflow-hidden" style={{ height: '6px' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round(CARREIRA_XP.currentXp / CARREIRA_XP.nextLevelXp * 100)}%`, background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }} />
          </div>
          <p className="text-[11px] text-[var(--sl-t3)] text-right mt-1">{CARREIRA_XP.currentXp} / {CARREIRA_XP.nextLevelXp} XP → Nível {CARREIRA_XP.level + 1}</p>
        </div>
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
            <div className="mt-3 pt-3 border-t border-[var(--sl-border)] flex gap-3 p-3 rounded-xl"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.05))', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>🤖</div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#c4b5fd' }}>Coach Carreira</p>
                <p className="text-[11px] text-[var(--sl-t2)] leading-relaxed">
                  {skills.length > 0
                    ? <>{`Você tem `}<strong className="text-[var(--sl-t1)]">{skills.length} habilidades</strong>{`. `}{expertSkills > 0 ? `${expertSkills} avançada${expertSkills > 1 ? 's' : ''}. ` : ''}{`Foco nas hard skills para avançar.`}</>
                    : 'Adicione habilidades para receber orientação personalizada de carreira.'}
                </p>
              </div>
            </div>
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

      {/* Simulador de Promoção */}
      <div className="mt-4">
        <button onClick={() => setShowSimulador(true)}
          className="w-full bg-[var(--sl-s1)] border rounded-2xl p-4 text-left hover:opacity-90 transition-opacity"
          style={{ borderColor: 'rgba(139,92,246,0.25)', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.04))' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#c4b5fd' }}>✦ SIMULADOR DE PROMOÇÃO</p>
          <p className="font-[Syne] font-bold text-[14px] text-[var(--sl-t1)]">Quanto valeria sua próxima promoção?</p>
          <p className="text-[12px] text-[var(--sl-t2)] mt-1">Calcule impacto salarial e prazo →</p>
        </button>
        {showSimulador && (
          <CarreiraSimuladorModal
            currentTitle={profile?.current_title ?? undefined}
            currentSalary={profile?.gross_salary ?? undefined}
            onClose={() => setShowSimulador(false)}
          />
        )}
      </div>

      </>)}
    </div>
    </>
  )
}
