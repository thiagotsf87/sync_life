'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Plus, Star, Clock, BarChart3, CheckCircle2, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCarreiraDashboard, useCareerHistory, useSaveSkill, useAddHistoryEntry, LEVEL_LABELS, SKILL_LEVEL_LABELS } from '@/hooks/use-carreira'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { ModuleHeader } from '@/components/ui/module-header'
import { HorizontalTimeline } from '@/components/ui/horizontal-timeline'
import type { TimelineStepStatus } from '@/components/ui/horizontal-timeline'
import { SkillBars } from '@/components/carreira/skill-bars'
import { RoadmapTimeline } from '@/components/carreira/RoadmapTimeline'
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
  const advancedSkills = skills.filter(s => s.proficiency_level >= 3 && s.proficiency_level < 5).length
  const salaryLabel = profile?.gross_salary
    ? profile.gross_salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '---'
  const roadmapProgress = activeRoadmap ? Math.round(activeRoadmap.progress) : 0
  const nextStep = activeRoadmap?.steps?.find(s => s.status !== 'completed')

  // Calculate time in current role
  const timeInRole = (() => {
    if (!profile?.start_date) return ''
    const start = new Date(profile.start_date)
    const now = new Date()
    const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    if (diffMonths < 1) return 'menos de 1 mes'
    if (diffMonths === 1) return '1 mes'
    if (diffMonths < 12) return `${diffMonths} meses`
    const years = Math.floor(diffMonths / 12)
    const months = diffMonths % 12
    if (months === 0) return `${years} ano${years > 1 ? 's' : ''}`
    return `${years} ano${years > 1 ? 's' : ''} e ${months} mes${months > 1 ? 'es' : ''}`
  })()

  // Build subtitle for ModuleHeader
  const headerSubtitle = (() => {
    const parts: string[] = []
    if (profile?.current_title) parts.push(profile.current_title)
    if (profile?.current_company) parts.push(`na ${profile.current_company}`)
    if (timeInRole) parts.push(`desde ${timeInRole} no cargo`)
    return parts.length > 0 ? parts.join(' ') : 'Configure seu perfil profissional'
  })()

  // Build steps for HorizontalTimeline from activeRoadmap
  const timelineSteps = (() => {
    if (!activeRoadmap?.steps) return []
    return activeRoadmap.steps.map(s => ({
      label: s.title,
      date: s.target_date
        ? new Date(s.target_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        : undefined,
      status: (s.status === 'completed' ? 'done' : s.status === 'in_progress' ? 'current' : 'pending') as TimelineStepStatus,
    }))
  })()

  // Build skill bars data (top 6 skills)
  const skillBarsData = skills.slice(0, 6).map(s => ({
    name: s.name,
    level: Math.min(Math.max(s.proficiency_level, 1), 5) as 1 | 2 | 3 | 4 | 5,
    label: SKILL_LEVEL_LABELS[s.proficiency_level] ?? 'N/A',
    color: s.category === 'hard_skill' ? '#f43f5e'
      : s.category === 'soft_skill' ? '#10b981'
      : s.category === 'language' ? '#f59e0b'
      : s.category === 'certification' ? '#a855f7'
      : '#f43f5e',
  }))

  // Roadmap completed/total steps count
  const completedSteps = activeRoadmap?.steps?.filter(s => s.status === 'completed').length ?? 0
  const totalSteps = activeRoadmap?.steps?.length ?? 0

  // Calculate salary impact estimate for simulador
  const estimatedImpact = profile?.gross_salary
    ? Math.round(profile.gross_salary * 0.44)
    : 5500
  const estimatedPct = profile?.gross_salary ? 44 : 0

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
    <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

      {/* MODULE HEADER */}
      <ModuleHeader
        icon={Briefcase}
        iconBg="rgba(244,63,94,.08)"
        iconColor="#f43f5e"
        title="Carreira"
        subtitle={headerSubtitle}
      >
        <button
          onClick={() => router.push('/carreira/perfil')}
          className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px]
                     font-semibold border border-[var(--sl-border)] bg-transparent text-[var(--sl-t2)]
                     hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
        >
          {profile ? 'Editar Perfil' : 'Configurar Perfil'}
        </button>
      </ModuleHeader>

      {/* Empty State -- shown when no profile and not loading */}
      {!loading && !profile && (
        <div className="py-10 text-center">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="font-[Syne] font-bold text-[18px] text-[var(--sl-t1)] mb-2">Mapeie sua carreira</h2>
          <p className="text-[14px] text-[var(--sl-t2)] leading-relaxed mb-6 max-w-sm mx-auto">
            Configure seu perfil profissional para acompanhar sua evolucao, mapear habilidades e planejar proximos passos.
          </p>

          {/* 3-step wizard */}
          <div className="text-left max-w-sm mx-auto flex flex-col gap-2.5 mb-6">
            {[
              { n: 1, title: 'Cargo atual', desc: 'Empresa, salario, especialidade', active: true },
              { n: 2, title: 'Suas habilidades', desc: 'Skills tecnicas, soft skills, idiomas', active: false },
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
            Comecar configuracao
          </button>
          <p className="text-[12px] text-[var(--sl-t3)] mt-3">Leva menos de 3 minutos</p>
        </div>
      )}

      {/* Main dashboard -- shown when profile exists or while loading */}
      {(loading || profile) && (<>

      {/* HERO: CAPITULO ATUAL */}
      <div
        className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-7 overflow-hidden mb-7 sl-fade-up sl-delay-1"
      >
        {/* Accent bar: gradient rose -> purple -> cyan */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[18px]"
          style={{ background: 'linear-gradient(90deg, #f43f5e, #a855f7, #06b6d4)' }}
        />

        <div className="flex items-center gap-6">
          {/* Left: Chapter info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[10px] mb-[10px]">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--sl-t3)]">
                Capitulo Atual
              </span>
              <span
                className="inline-flex items-center gap-1 px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: 'rgba(244,63,94,0.10)', color: '#f43f5e' }}
              >
                Level {CARREIRA_XP.level}
              </span>
              <span
                className="inline-flex items-center gap-1 px-[10px] py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: 'rgba(245,158,11,0.10)', color: '#f59e0b' }}
              >
                <Flame size={11} />
                {CARREIRA_XP.streak} dias seguidos
              </span>
            </div>

            <h2 className="font-[Syne] font-extrabold text-[28px] leading-[1.15] text-[var(--sl-t1)] mb-[3px]">
              {profile?.current_title ?? 'Configure seu cargo'}
            </h2>
            <p className="text-[13px] text-[var(--sl-t2)]">
              {[
                profile?.current_company,
                profile?.field ? profile.field.charAt(0).toUpperCase() + profile.field.slice(1) : null,
                timeInRole ? `${timeInRole} no cargo` : null,
              ].filter(Boolean).join(' \u00B7 ')}
            </p>

            {/* XP Progress bar */}
            <div className="flex items-center gap-3 mt-[14px]">
              <div className="flex-1 max-w-[220px]">
                <div className="h-1 bg-[var(--sl-s3)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                      width: `${Math.round(CARREIRA_XP.currentXp / CARREIRA_XP.nextLevelXp * 100)}%`,
                      background: '#f43f5e',
                    }}
                  />
                </div>
              </div>
              <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t2)]">
                {CARREIRA_XP.currentXp} / {CARREIRA_XP.nextLevelXp} XP
              </span>
            </div>
          </div>

          {/* Right: Quick Stats inline */}
          <div className="flex border border-[var(--sl-border)] rounded-[14px] overflow-hidden shrink-0 min-w-0">
            <div className="flex-1 min-w-0 px-[22px] py-4 text-center border-r border-[var(--sl-border)]">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mb-1">
                Salario
              </div>
              <div className="font-[DM_Mono] text-[22px] font-medium leading-none text-[#10b981] truncate">
                {salaryLabel}
              </div>
              {history.length > 0 && history[0].salary && profile?.gross_salary && history[0].salary !== profile.gross_salary && (
                <div className="text-[10px] text-[#10b981] mt-[2px]">
                  {profile.gross_salary > history[0].salary
                    ? `+${Math.round(((profile.gross_salary - history[0].salary) / history[0].salary) * 100)}% vs anterior`
                    : ''}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 px-[22px] py-4 text-center border-r border-[var(--sl-border)]">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mb-1">
                Roadmap
              </div>
              <div className="font-[DM_Mono] text-[22px] font-medium leading-none text-[#f59e0b]">
                {roadmapProgress}%
              </div>
              <div className="text-[10px] text-[var(--sl-t3)] mt-[2px]">
                {completedSteps} de {totalSteps} etapas
              </div>
            </div>
            <div className="flex-1 min-w-0 px-[22px] py-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mb-1">
                Skills
              </div>
              <div className="font-[DM_Mono] text-[22px] font-medium leading-none text-[var(--sl-t1)]">
                {skills.length}
              </div>
              <div className="text-[10px] text-[var(--sl-t3)] mt-[2px]">
                {expertSkills > 0 ? `${expertSkills} expert` : ''}{expertSkills > 0 && advancedSkills > 0 ? ', ' : ''}{advancedSkills > 0 ? `${advancedSkills} avanc.` : ''}{expertSkills === 0 && advancedSkills === 0 ? 'Adicione' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jornada Insight */}
      <JornadaInsight
        text={
          profile
            ? <>Voce e <strong className="text-[var(--sl-t1)]">{profile.current_title ?? 'profissional'}</strong>
              {activeRoadmap && <> com <strong className="text-[#f59e0b]">{roadmapProgress}%</strong> do caminho para <strong className="text-[var(--sl-t1)]">{activeRoadmap.target_title}</strong> percorrido</>}.
              {nextStep && <> Proximo passo: {nextStep.title}.</>}</>
            : <>Configure seu perfil profissional para desbloquear projecoes de carreira e integracao com o modulo Financas.</>
        }
      />

      {/* BENTO GRID: Roadmap + Skills */}
      {loading ? (
        <div className="grid grid-cols-[1fr_380px] gap-[14px] max-lg:grid-cols-1">
          <div className="h-80 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
          <div className="h-80 rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
        </div>
      ) : error ? (
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-8 text-center">
          <p className="text-[13px] text-[var(--sl-t2)]">
            {error.includes('does not exist') ? 'Execute a migration 005 no Supabase.' : error}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_380px] gap-[14px] max-lg:grid-cols-1 sl-fade-up sl-delay-2">

          {/* LEFT: Active Roadmap */}
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)]">
            <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
              <Clock size={16} className="text-[#f43f5e]" />
              {activeRoadmap
                ? <>Roadmap Ativo: {activeRoadmap.target_title}{activeRoadmap.target_date ? ` em ${Math.max(0, Math.ceil((new Date(activeRoadmap.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)))} ano${Math.ceil((new Date(activeRoadmap.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)) !== 1 ? 's' : ''}` : ''}</>
                : 'Roadmap Ativo'
              }
              {activeRoadmap && (
                <span
                  className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold ml-[6px]"
                  style={{ background: 'rgba(245,158,11,0.10)', color: '#f59e0b' }}
                >
                  {roadmapProgress}%
                </span>
              )}
              <span
                className="ml-auto font-sans text-[12px] font-medium text-[#f43f5e] cursor-pointer hover:underline"
                onClick={() => router.push('/carreira/roadmap')}
              >
                Ver todos &rarr;
              </span>
            </div>

            {activeRoadmap ? (
              <>
                <p className="text-[12px] text-[var(--sl-t3)] mb-[18px]">
                  {activeRoadmap.current_title} &rarr; {activeRoadmap.target_title}
                  {activeRoadmap.target_date && ` \u00B7 Prazo: ${new Date(activeRoadmap.target_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`}
                  {activeRoadmap.target_salary && ` \u00B7 Salario alvo: ${activeRoadmap.target_salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                </p>

                {/* Horizontal Timeline */}
                <HorizontalTimeline
                  steps={timelineSteps}
                  progressPercent={roadmapProgress}
                  accentColor="#10b981"
                />

                {/* Next action box */}
                {nextStep && (
                  <div className="mt-5 px-[18px] py-[14px] bg-[var(--sl-s2)] rounded-xl flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(244,63,94,0.10)' }}
                    >
                      <CheckCircle2 size={16} className="text-[#f43f5e]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[var(--sl-t1)]">
                        Proxima etapa: {nextStep.title}
                      </p>
                      <p className="text-[11px] text-[var(--sl-t3)]">
                        {nextStep.target_date
                          ? `Prazo: ${new Date(nextStep.target_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
                          : 'Sem prazo definido'}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center px-[10px] py-1 rounded-lg text-[11px] font-semibold shrink-0"
                      style={{ background: 'rgba(244,63,94,0.10)', color: '#f43f5e' }}
                    >
                      Em andamento
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🗺</div>
                <h3 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-2">Nenhum roadmap ativo</h3>
                <p className="text-[13px] text-[var(--sl-t2)] mb-4">Crie um plano de carreira com passos concretos.</p>
                <button
                  onClick={() => router.push('/carreira/roadmap')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold bg-[#f43f5e] text-white hover:opacity-90 transition-opacity"
                >
                  Criar Roadmap
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Top Skills + Simulador */}
          <div className="flex flex-col gap-[14px]">
            {/* Top Skills card */}
            <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 flex-1 transition-colors hover:border-[var(--sl-border-h)]">
              <div className="flex items-center gap-[9px] font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[18px]">
                <Star size={16} className="text-[#f43f5e]" />
                Top Habilidades
                <span
                  className="ml-auto font-sans text-[12px] font-medium text-[#f43f5e] cursor-pointer hover:underline"
                  onClick={() => router.push('/carreira/habilidades')}
                >
                  Ver todas &rarr;
                </span>
              </div>

              {skills.length === 0 ? (
                <p className="text-[12px] text-[var(--sl-t3)]">Nenhuma habilidade cadastrada.</p>
              ) : (
                <SkillBars skills={skillBarsData} accentColor="#f43f5e" />
              )}
            </div>

            {/* Simulador CTA */}
            <div
              className="bg-[var(--sl-s1)] border rounded-[18px] p-6 transition-colors hover:border-[var(--sl-border-h)] cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(244,63,94,0.06), rgba(168,85,247,0.04))',
                borderColor: 'rgba(244,63,94,0.15)',
              }}
              onClick={() => setShowSimulador(true)}
            >
              <div className="flex items-center gap-[14px]">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(244,63,94,0.12)' }}
                >
                  <BarChart3 size={20} className="text-[#f43f5e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--sl-t1)] mb-[2px]">
                    Simulador de Promocao
                  </p>
                  <p className="text-[12px] text-[var(--sl-t2)]">
                    {activeRoadmap
                      ? <>{activeRoadmap.current_title} &rarr; {activeRoadmap.target_title}: </>
                      : 'Impacto estimado: '
                    }
                    <span className="font-[DM_Mono] text-[#10b981] font-medium">
                      +{estimatedImpact.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mes
                      {estimatedPct > 0 ? ` (+${estimatedPct}%)` : ''}
                    </span>
                  </p>
                  {activeRoadmap?.target_date && (
                    <p className="text-[11px] text-[var(--sl-t3)] mt-[2px]">
                      Estimativa em {Math.max(0, Math.ceil((new Date(activeRoadmap.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))} meses
                    </p>
                  )}
                </div>
                <button
                  className="inline-flex items-center gap-[7px] px-[18px] py-2 rounded-[11px] text-[12px]
                             font-semibold bg-[#f43f5e] text-white hover:brightness-110 transition-all shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowSimulador(true)
                  }}
                >
                  Simular
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulador Modal */}
      {showSimulador && (
        <CarreiraSimuladorModal
          currentTitle={profile?.current_title ?? undefined}
          currentSalary={profile?.gross_salary ?? undefined}
          onClose={() => setShowSimulador(false)}
        />
      )}

      </>)}
    </div>
    </>
  )
}
