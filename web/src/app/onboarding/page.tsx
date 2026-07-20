'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ArrowRight,
  Info,
  Check,
  Hand,
  Target,
  Wallet,
  LineChart,
  Activity,
  Clock,
  Briefcase,
  Heart,
  Plane,
  Globe,
  LayoutGrid,
} from 'lucide-react'
import { SyncLifeIcon } from '@/components/shell/icons'
import { OnboardingMobile } from '@/components/onboarding/OnboardingMobile'
import { TextField } from '@/components/ui/text-field'
import { SectionHeader } from '@/components/ui/section-header'

// ── Types ────────────────────────────────────────────────
interface OnboardingState {
  nome: string
  objectives: string[]
  dimensions: string[]
}

type IconName =
  | 'wallet'
  | 'chart'
  | 'pulse'
  | 'clock'
  | 'briefcase'
  | 'target'
  | 'heart'
  | 'plane'
  | 'globe'
  | 'grid'

// ── Objectives Data ──────────────────────────────────────
const OBJECTIVES: ReadonlyArray<{
  value: string
  title: string
  desc: string
  color: string
  bg: string
  icon: IconName
}> = [
  { value: 'financas', title: 'Organizar minhas finanças', desc: 'Sair do vermelho, controlar gastos, criar orçamento', color: '#0F766E', bg: 'rgba(15,118,110,.1)', icon: 'wallet' },
  { value: 'patrimonio', title: 'Construir patrimônio', desc: 'Investir, acompanhar proventos, crescer o patrimônio', color: '#4F88D4', bg: 'rgba(79,136,212,.1)', icon: 'chart' },
  { value: 'saude', title: 'Cuidar da saúde', desc: 'Exercícios, alimentação, perder peso, ganhar massa', color: '#D97534', bg: 'rgba(217,117,52,.1)', icon: 'pulse' },
  { value: 'tempo', title: 'Ter mais tempo livre', desc: 'Organizar rotina, parar de procrastinar, blocos de foco', color: '#3CA0B5', bg: 'rgba(60,160,181,.1)', icon: 'clock' },
  { value: 'carreira', title: 'Crescer na carreira', desc: 'Projetos, certificações, networking, promoção', color: '#DB6478', bg: 'rgba(219,100,120,.1)', icon: 'briefcase' },
  { value: 'sonhos', title: 'Realizar sonhos', desc: 'Casa própria, viagem dos sonhos, aposentadoria antecipada', color: '#0B2D34', bg: 'rgba(11,45,52,.18)', icon: 'target' },
  { value: 'mente', title: 'Equilíbrio mental', desc: 'Menos ansiedade, hábitos saudáveis, diário e reflexão', color: '#D9962E', bg: 'rgba(217,150,46,.1)', icon: 'heart' },
  { value: 'viagens', title: 'Viajar mais', desc: 'Planejar viagens, roteiros, orçamento de aventuras', color: '#C76795', bg: 'rgba(199,103,149,.1)', icon: 'plane' },
  { value: 'equilibrio', title: 'Vida equilibrada', desc: 'Visão holística, nenhuma área negligenciada', color: '#6B6FD4', bg: 'rgba(107,111,212,.1)', icon: 'globe' },
]

// ── Dimensions Data ──────────────────────────────────────
const DIMENSIONS: ReadonlyArray<{
  value: string
  name: string
  desc: string
  color: string
  bg: string
  icon: IconName
  recommended?: boolean
}> = [
  { value: 'financas', name: 'Finanças', desc: 'Despesas, orçamento, receitas e projeções', color: '#0F766E', bg: 'rgba(15,118,110,.1)', icon: 'wallet', recommended: true },
  { value: 'tempo', name: 'Tempo', desc: 'Agenda, rotina, blocos de foco e Pomodoro', color: '#3CA0B5', bg: 'rgba(60,160,181,.1)', icon: 'clock', recommended: true },
  { value: 'futuro', name: 'Futuro', desc: 'Objetivos de longo prazo, metas e milestones', color: '#0B2D34', bg: 'rgba(11,45,52,.18)', icon: 'target' },
  { value: 'corpo', name: 'Corpo', desc: 'Peso, exercícios, alimentação e saúde física', color: '#D97534', bg: 'rgba(217,117,52,.1)', icon: 'pulse' },
  { value: 'mente', name: 'Mente', desc: 'Humor, hábitos, meditação e bem-estar mental', color: '#D9962E', bg: 'rgba(217,150,46,.1)', icon: 'heart' },
  { value: 'patrimonio', name: 'Patrimônio', desc: 'Investimentos, ativos e proventos', color: '#4F88D4', bg: 'rgba(79,136,212,.1)', icon: 'chart' },
  { value: 'carreira', name: 'Carreira', desc: 'Projetos, certificações e networking', color: '#DB6478', bg: 'rgba(219,100,120,.1)', icon: 'briefcase' },
  { value: 'experiencias', name: 'Experiências', desc: 'Viagens, roteiros e aventuras', color: '#C76795', bg: 'rgba(199,103,149,.1)', icon: 'plane' },
]

const DEFAULT_DIMENSIONS = ['financas', 'tempo', 'futuro', 'corpo', 'mente']

// ── Lucide icon resolver ─────────────────────────────────
function ObjIcon({ type, color, size = 18 }: { type: IconName; color: string; size?: number }) {
  const common = { size, color, strokeWidth: 1.8 } as const
  switch (type) {
    case 'wallet':    return <Wallet {...common} />
    case 'chart':     return <LineChart {...common} />
    case 'pulse':     return <Activity {...common} />
    case 'clock':     return <Clock {...common} />
    case 'briefcase': return <Briefcase {...common} />
    case 'target':    return <Target {...common} />
    case 'heart':     return <Heart {...common} />
    case 'plane':     return <Plane {...common} />
    case 'globe':     return <Globe {...common} />
    case 'grid':      return <LayoutGrid {...common} />
    default:          return null
  }
}

// ── "Start here" suggestions ─────────────────────────────
const START_ACTIONS: ReadonlyArray<{
  title: string
  desc: string
  color: string
  bg: string
  icon: IconName
  href: string
}> = [
  { title: 'Registre sua primeira transação', desc: 'Finanças · 30 segundos', color: '#0F766E', bg: 'rgba(15,118,110,.1)', icon: 'wallet', href: '/financas/transacoes' },
  { title: 'Crie seu primeiro objetivo', desc: 'Futuro · 1 minuto', color: '#0B2D34', bg: 'rgba(11,45,52,.18)', icon: 'target', href: '/futuro' },
  { title: 'Configure sua agenda semanal', desc: 'Tempo · 2 minutos', color: '#3CA0B5', bg: 'rgba(60,160,181,.1)', icon: 'clock', href: '/tempo' },
]

// ── Main Component ────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [state, setState] = useState<OnboardingState>({
    nome: '',
    objectives: [],
    dimensions: [...DEFAULT_DIMENSIONS],
  })
  const [isLoading, setIsLoading] = useState(false)

  // Pre-fill name from auth profile
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('full_name, onboarding_completed')
        .eq('id', user.id)
        .single()
      if (profile?.onboarding_completed) {
        router.push('/financas')
        return
      }
      if (profile?.full_name) {
        setState(s => ({ ...s, nome: profile.full_name }))
      }
    }
    load()
  }, [router])

  const toggleObjective = useCallback((value: string) => {
    setState(s => {
      const selected = s.objectives.includes(value)
      return {
        ...s,
        objectives: selected
          ? s.objectives.filter(o => o !== value)
          : [...s.objectives, value],
      }
    })
  }, [])

  const toggleDimension = useCallback((value: string) => {
    setState(s => {
      const selected = s.dimensions.includes(value)
      return {
        ...s,
        dimensions: selected
          ? s.dimensions.filter(d => d !== value)
          : [...s.dimensions, value],
      }
    })
  }, [])

  const handleSkip = () => {
    if (confirm('Pular configuração? Você pode refazer isso nas configurações a qualquer momento.')) {
      setStep(4)
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const areas = state.dimensions.length > 0 ? state.dimensions : ['financas']

      const { error } = await (supabase as any)
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: state.nome || null,
          mode: 'jornada',
          onboarding_completed: true,
        })

      if (error) {
        toast.error('Erro ao salvar configurações. Tente novamente.')
        return
      }

      await (supabase as any)
        .from('profiles')
        .update({
          life_moments: state.objectives.length > 0 ? state.objectives : null,
          active_modules: areas,
        })
        .eq('id', user.id)

      toast.success('Tudo configurado. Bem-vindo ao SyncLife.')
      router.push('/financas')
      router.refresh()
    } catch {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const displayName = state.nome.trim().split(' ')[0] || ''

  return (
    <>
      <OnboardingMobile userName={state.nome || undefined} />
      <div className="hidden lg:block onboarding-page">
        <div className="onb-layout" key={step}>
          {/* ── Header ── */}
          <div className="onb-header">
            <Link href="/" className="onb-logo">
              <SyncLifeIcon size={20} animated={false} />
              <span className="font-[Syne] font-bold">
                <span className="text-[var(--sl-t1)]">Sync</span>
                <span className="text-[var(--sl-em)]">Life</span>
              </span>
            </Link>
            <div className="onb-progress">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`onb-prog-bar${i <= step ? ' active' : ''}`} />
              ))}
            </div>
            {step < 4 ? (
              <button className="onb-skip font-[DM_Sans]" onClick={handleSkip}>
                {step === 1 ? 'Pular configuração' : 'Pular'}
              </button>
            ) : (
              <div />
            )}
          </div>

          {/* ── Content ── */}
          <div className="onb-content">
            {/* ═══ Step 1: Name ═══ */}
            {step === 1 && (
              <div className="onb-card">
                {/* Wave hand icon */}
                <div className="onb-wave-icon">
                  <Hand size={40} strokeWidth={1.8} color="var(--sl-em)" />
                  {state.nome.trim().length > 0 && (
                    <div className="onb-wave-check">
                      <Check size={10} strokeWidth={3} color="#fff" />
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <SectionHeader
                    eyebrow="01 · NOME"
                    title="Bem-vindo ao SyncLife"
                    sub="Vamos personalizar sua experiência em menos de 1 minuto. Primeiro, como devemos te chamar?"
                    className="items-center text-center [&>h2]:font-[Syne] [&>h2]:text-[32px] [&>h2]:font-bold [&>h2]:tracking-tight [&>p:last-child]:max-w-[420px] [&>p:last-child]:mx-auto [&>p:last-child]:mt-2"
                  />
                </div>

                <div className="onb-name-wrap">
                  <TextField
                    label="Seu nome"
                    placeholder="Digite seu nome"
                    value={state.nome}
                    onChange={(e) => setState(s => ({ ...s, nome: e.target.value }))}
                    autoFocus
                    suffix={state.nome.trim().length > 0 ? <Check size={14} strokeWidth={2.5} color="var(--sl-em)" /> : null}
                  />

                  {/* "What comes next" info panel */}
                  <div className="onb-info-panel">
                    <div className="onb-info-panel-title font-[DM_Sans]">
                      <Info size={14} style={{ color: 'var(--cyan)' }} />
                      O que vem a seguir
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className="onb-info-step">
                        <div className="onb-info-step-num active">1</div>
                        <span className="onb-info-step-text active">Seu nome</span>
                        <span className="onb-info-step-now">agora</span>
                      </div>
                      <div className="onb-info-step">
                        <div className="onb-info-step-num future">2</div>
                        <span className="onb-info-step-text future">Seus objetivos de vida</span>
                      </div>
                      <div className="onb-info-step">
                        <div className="onb-info-step-num future">3</div>
                        <span className="onb-info-step-text future">Áreas de foco</span>
                      </div>
                      <div className="onb-info-step">
                        <div className="onb-info-step-num future">4</div>
                        <span className="onb-info-step-text future">Pronto.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Step 2: Objectives ═══ */}
            {step === 2 && (
              <div className="onb-card" style={{ maxWidth: 680 }}>
                <div className="onb-obj-icon">
                  <Target size={32} strokeWidth={1.8} color="var(--sl-em)" />
                </div>

                <SectionHeader
                  eyebrow="02 · OBJETIVOS"
                  title={displayName ? `${displayName}, quais são seus objetivos de vida?` : 'Quais são seus objetivos de vida?'}
                  sub="Selecione tudo o que faz sentido pra você agora. Isso ajuda o SyncLife a personalizar insights e sugestões inteligentes."
                  className="items-center text-center [&>h2]:font-[Syne] [&>h2]:text-[32px] [&>h2]:font-bold [&>h2]:tracking-tight [&>p:last-child]:max-w-[480px] [&>p:last-child]:mx-auto [&>p:last-child]:mt-2"
                />

                <div className="onb-obj-grid">
                  {OBJECTIVES.map((obj) => {
                    const sel = state.objectives.includes(obj.value)
                    return (
                      <button
                        key={obj.value}
                        className={`onb-obj-card${sel ? ' selected' : ''}`}
                        style={{ '--obj-color': obj.color } as React.CSSProperties}
                        onClick={() => toggleObjective(obj.value)}
                      >
                        <div className={`onb-obj-check ${sel ? 'checked' : 'unchecked'}`} style={sel ? { background: obj.color } : undefined}>
                          {sel && <Check size={10} strokeWidth={3} color="#fff" />}
                        </div>
                        <div className="onb-obj-card-icon" style={{ background: obj.bg }}>
                          <ObjIcon type={obj.icon} color={obj.color} size={18} />
                        </div>
                        <div className="onb-obj-card-title font-[DM_Sans]">{obj.title}</div>
                        <div className="onb-obj-card-desc font-[DM_Sans]">{obj.desc}</div>
                      </button>
                    )
                  })}
                </div>

                <div className="onb-obj-count font-[DM_Sans]">
                  <span className="onb-obj-count-num sl-num-strong">{state.objectives.length}</span>
                  {state.objectives.length === 1 ? 'objetivo selecionado' : 'objetivos selecionados'}
                </div>
              </div>
            )}

            {/* ═══ Step 3: Dimensions ═══ */}
            {step === 3 && (
              <div className="onb-card" style={{ maxWidth: 720 }}>
                <div className="onb-dim-icon">
                  <LayoutGrid size={32} strokeWidth={1.8} color="var(--sl-em)" />
                </div>

                <SectionHeader
                  eyebrow="03 · DIMENSÕES"
                  title="Em quais dimensões da vida você quer focar?"
                  sub="Todas as dimensões ficam disponíveis, mas as selecionadas terão destaque no seu Dashboard e no cálculo do Life Sync Score."
                  className="items-center text-center [&>h2]:font-[Syne] [&>h2]:text-[32px] [&>h2]:font-bold [&>h2]:tracking-tight [&>p:last-child]:max-w-[520px] [&>p:last-child]:mx-auto [&>p:last-child]:mt-2"
                />

                <div className="onb-dim-list">
                  {DIMENSIONS.map((dim) => {
                    const sel = state.dimensions.includes(dim.value)
                    return (
                      <div
                        key={dim.value}
                        className={`onb-dim-card ${sel ? 'active' : 'inactive'}`}
                        style={{ '--dim-color': dim.color, borderColor: sel ? dim.color : undefined } as React.CSSProperties}
                        onClick={() => toggleDimension(dim.value)}
                      >
                        <div className="onb-dim-card-icon" style={{ background: dim.bg }}>
                          <ObjIcon type={dim.icon} color={dim.color} size={20} />
                        </div>
                        <div className="onb-dim-card-info">
                          <div className="onb-dim-card-name font-[DM_Sans]">{dim.name}</div>
                          <div className="onb-dim-card-desc font-[DM_Sans]">{dim.desc}</div>
                        </div>
                        <div className="onb-dim-card-right">
                          {dim.recommended && (
                            <span className="onb-dim-badge font-[DM_Sans]" style={{ background: dim.bg, color: dim.color }}>
                              Recomendado
                            </span>
                          )}
                          <div
                            className={`onb-toggle ${sel ? 'on' : 'off'}`}
                            style={sel ? { background: dim.color } : undefined}
                          >
                            <div className="onb-toggle-knob" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="onb-dim-note font-[DM_Sans]">
                  <Info size={14} />
                  Você pode ativar ou desativar dimensões a qualquer momento em Configurações
                </div>
              </div>
            )}

            {/* ═══ Step 4: Celebration ═══ */}
            {step === 4 && (
              <div className="onb-card">
                {/* Celebration Ring — RingProgress exception G-03: gradient permitido */}
                <div className="celeb-ring">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--s3)" strokeWidth="6" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="url(#celeb-grad)" strokeWidth="6" strokeLinecap="round" strokeDasharray="314" strokeDashoffset="94" transform="rotate(-90 60 60)" />
                    <defs>
                      <linearGradient id="celeb-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0F766E" />
                        <stop offset="100%" stopColor="#0B2D34" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ textAlign: 'center' }}>
                    <div className="celeb-score sl-num-strong">70</div>
                    <div className="celeb-label font-[DM_Sans]">pts</div>
                  </div>
                </div>

                <SectionHeader
                  eyebrow="04 · PRONTO"
                  title={`Tudo pronto${displayName ? `, ${displayName}` : ''}.`}
                  className="items-center text-center [&>h2]:font-[Syne] [&>h2]:text-[36px] [&>h2]:font-bold [&>h2]:tracking-tight"
                />

                <div className="subtitle font-[DM_Sans]" style={{ maxWidth: 460, margin: '12px auto 8px' }}>
                  Seu SyncLife está configurado com{' '}
                  <strong style={{ color: 'var(--t1)' }}>
                    <span className="sl-num">{state.objectives.length}</span> {state.objectives.length === 1 ? 'objetivo' : 'objetivos'}
                  </strong>
                  {' '}e{' '}
                  <strong style={{ color: 'var(--t1)' }}>
                    <span className="sl-num">{state.dimensions.length}</span> {state.dimensions.length === 1 ? 'dimensão ativa' : 'dimensões ativas'}
                  </strong>.
                  {' '}Seu Life Sync Score começa em{' '}
                  <strong style={{ color: 'var(--sl-em)' }}>
                    <span className="sl-num">70</span> pontos
                  </strong>.
                </div>

                {/* Active modules strip */}
                <div className="celeb-modules">
                  {state.dimensions.map(val => {
                    const dim = DIMENSIONS.find(d => d.value === val)
                    if (!dim) return null
                    return (
                      <div key={val} className="celeb-mod font-[DM_Sans]">
                        <span className="celeb-mod-dot" style={{ background: dim.color }} />
                        {dim.name}
                      </div>
                    )
                  })}
                </div>

                <div style={{ maxWidth: 480, margin: '24px auto 0', textAlign: 'left' }}>
                  {/* Objectives summary */}
                  {state.objectives.length > 0 && (
                    <>
                      <div className="celeb-objectives-title font-[DM_Sans]">Seus objetivos de vida</div>
                      <div className="celeb-objectives">
                        {state.objectives.map(val => {
                          const obj = OBJECTIVES.find(o => o.value === val)
                          if (!obj) return null
                          return (
                            <span
                              key={val}
                              className="celeb-obj-pill font-[DM_Sans]"
                              style={{
                                background: obj.bg,
                                border: `1px solid ${obj.color}33`,
                                color: obj.color,
                              }}
                            >
                              {obj.title}
                            </span>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {/* Start here actions */}
                  <div className="celeb-actions-title font-[DM_Sans]">Comece por aqui</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {START_ACTIONS.map((action) => (
                      <div key={action.title} className="celeb-action">
                        <div className="celeb-action-icon" style={{ background: action.bg }}>
                          <ObjIcon type={action.icon} color={action.color} size={14} />
                        </div>
                        <div className="celeb-action-info">
                          <div className="celeb-action-title font-[DM_Sans]">{action.title}</div>
                          <div className="celeb-action-desc font-[DM_Sans]">{action.desc}</div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--t3)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom Nav ── */}
          <div className="onb-nav">
            {step === 1 ? (
              <div />
            ) : (
              <button className="onb-nav-back font-[DM_Sans]" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={14} />
                Voltar
              </button>
            )}

            {step < 4 && (
              <div className="onb-nav-step font-[DM_Sans]">Passo {step} de 4</div>
            )}
            {step === 4 && <div />}

            {step < 4 ? (
              <button className="onb-nav-next font-[DM_Sans]" onClick={() => setStep(step + 1)}>
                Próximo
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                className="onb-nav-finish font-[DM_Sans]"
                onClick={handleFinish}
                disabled={isLoading}
              >
                {isLoading ? 'Preparando...' : 'Ir para o Dashboard'}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
