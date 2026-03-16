'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ChevronLeft, ArrowRight, Info, Check } from 'lucide-react'
import { SyncLifeIcon } from '@/components/shell/icons'
import { OnboardingMobile } from '@/components/onboarding/OnboardingMobile'

// ── Types ────────────────────────────────────────────────
interface OnboardingState {
  nome: string
  objectives: string[]
  dimensions: string[]
}

// ── Objectives Data ──────────────────────────────────────
const OBJECTIVES = [
  { value: 'financas', title: 'Organizar minhas financas', desc: 'Sair do vermelho, controlar gastos, criar orcamento', color: '#10b981', bg: 'rgba(16,185,129,.1)', icon: 'dollar' },
  { value: 'patrimonio', title: 'Construir patrimonio', desc: 'Investir, acompanhar proventos, crescer o patrimonio', color: '#3b82f6', bg: 'rgba(59,130,246,.1)', icon: 'chart' },
  { value: 'saude', title: 'Cuidar da saude', desc: 'Exercicios, alimentacao, perder peso, ganhar massa', color: '#f97316', bg: 'rgba(249,115,22,.1)', icon: 'pulse' },
  { value: 'tempo', title: 'Ter mais tempo livre', desc: 'Organizar rotina, parar de procrastinar, blocos de foco', color: '#06b6d4', bg: 'rgba(6,182,212,.1)', icon: 'clock' },
  { value: 'carreira', title: 'Crescer na carreira', desc: 'Projetos, certificacoes, networking, promocao', color: '#f43f5e', bg: 'rgba(244,63,94,.1)', icon: 'briefcase' },
  { value: 'sonhos', title: 'Realizar sonhos', desc: 'Casa propria, viagem dos sonhos, aposentadoria antecipada', color: '#0055ff', bg: 'rgba(0,85,255,.1)', icon: 'target' },
  { value: 'mente', title: 'Equilibrio mental', desc: 'Menos ansiedade, habitos saudaveis, diario e reflexao', color: '#eab308', bg: 'rgba(234,179,8,.1)', icon: 'heart' },
  { value: 'viagens', title: 'Viajar mais', desc: 'Planejar viagens, roteiros, orcamento de aventuras', color: '#ec4899', bg: 'rgba(236,72,153,.1)', icon: 'plane' },
  { value: 'equilibrio', title: 'Vida equilibrada', desc: 'Visao holistica, nenhuma area negligenciada', color: '#6366f1', bg: 'rgba(99,102,241,.1)', icon: 'globe' },
]

// ── Dimensions Data ──────────────────────────────────────
const DIMENSIONS = [
  { value: 'financas', name: 'Financas', desc: 'Despesas, orcamento, receitas e projecoes', color: '#10b981', bg: 'rgba(16,185,129,.1)', icon: 'dollar', recommended: true },
  { value: 'tempo', name: 'Tempo', desc: 'Agenda, rotina, blocos de foco e Pomodoro', color: '#06b6d4', bg: 'rgba(6,182,212,.1)', icon: 'clock', recommended: true },
  { value: 'futuro', name: 'Futuro', desc: 'Objetivos de longo prazo, metas e milestones', color: '#0055ff', bg: 'rgba(0,85,255,.1)', icon: 'target' },
  { value: 'corpo', name: 'Corpo', desc: 'Peso, exercicios, alimentacao e saude fisica', color: '#f97316', bg: 'rgba(249,115,22,.1)', icon: 'pulse' },
  { value: 'mente', name: 'Mente', desc: 'Humor, habitos, meditacao e bem-estar mental', color: '#eab308', bg: 'rgba(234,179,8,.1)', icon: 'heart' },
  { value: 'patrimonio', name: 'Patrimonio', desc: 'Investimentos, ativos e proventos', color: '#3b82f6', bg: 'rgba(59,130,246,.1)', icon: 'chart' },
  { value: 'carreira', name: 'Carreira', desc: 'Projetos, certificacoes e networking', color: '#f43f5e', bg: 'rgba(244,63,94,.1)', icon: 'briefcase' },
  { value: 'experiencias', name: 'Experiencias', desc: 'Viagens, roteiros e aventuras', color: '#ec4899', bg: 'rgba(236,72,153,.1)', icon: 'plane' },
]

const DEFAULT_DIMENSIONS = ['financas', 'tempo', 'futuro', 'corpo', 'mente']

// ── SVG Icon Component ───────────────────────────────────
function ObjIcon({ type, color, size = 18 }: { type: string; color: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const }
  switch (type) {
    case 'dollar': return <svg {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    case 'chart': return <svg {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
    case 'pulse': return <svg {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    case 'clock': return <svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    case 'briefcase': return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
    case 'target': return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
    case 'heart': return <svg {...props}><path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8z" /></svg>
    case 'plane': return <svg {...props}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>
    case 'globe': return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
    case 'grid': return <svg {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
    default: return null
  }
}

// ── "Start here" suggestions ─────────────────────────────
const START_ACTIONS = [
  { title: 'Registre sua primeira transacao', desc: 'Financas \u00b7 30 segundos', color: '#10b981', bg: 'rgba(16,185,129,.1)', icon: 'dollar', href: '/financas/transacoes' },
  { title: 'Crie seu primeiro objetivo', desc: 'Futuro \u00b7 1 minuto', color: '#0055ff', bg: 'rgba(0,85,255,.1)', icon: 'target', href: '/futuro' },
  { title: 'Configure sua agenda semanal', desc: 'Tempo \u00b7 2 minutos', color: '#06b6d4', bg: 'rgba(6,182,212,.1)', icon: 'clock', href: '/tempo' },
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
    if (confirm('Pular configuracao? Voce pode refazer isso nas configuracoes a qualquer momento.')) {
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
        toast.error('Erro ao salvar configuracoes. Tente novamente.')
        return
      }

      await (supabase as any)
        .from('profiles')
        .update({
          life_moments: state.objectives.length > 0 ? state.objectives : null,
          active_modules: areas,
        })
        .eq('id', user.id)

      toast.success('Tudo configurado! Bem-vindo ao SyncLife.')
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
              SyncLife
            </Link>
            <div className="onb-progress">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`onb-prog-bar${i <= step ? ' active' : ''}`} />
              ))}
            </div>
            {step < 4 ? (
              <button className="onb-skip" onClick={handleSkip}>
                {step === 1 ? 'Pular configuracao' : 'Pular'}
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
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M18 11V6a2 2 0 0 0-4 0" />
                    <path d="M14 10V4a2 2 0 0 0-4 0v2" />
                    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                  </svg>
                  {state.nome.trim().length > 0 && (
                    <div className="onb-wave-check">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </div>
                  )}
                </div>

                <h1>Bem-vindo ao SyncLife!</h1>
                <div className="subtitle" style={{ maxWidth: 420, margin: '0 auto' }}>
                  Vamos personalizar sua experiencia em menos de 1 minuto.
                  <br />Primeiro, como devemos te chamar?
                </div>

                <div className="onb-name-wrap">
                  <div className="onb-name-input-wrap">
                    <input
                      type="text"
                      className="onb-name-input"
                      placeholder="Seu nome"
                      value={state.nome}
                      onChange={(e) => setState(s => ({ ...s, nome: e.target.value }))}
                      autoFocus
                    />
                    {state.nome.trim().length > 0 && (
                      <div className="onb-name-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
                      </div>
                    )}
                  </div>

                  {/* "What comes next" info panel */}
                  <div className="onb-info-panel">
                    <div className="onb-info-panel-title">
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
                        <span className="onb-info-step-text future">Areas de foco</span>
                      </div>
                      <div className="onb-info-step">
                        <div className="onb-info-step-num future">4</div>
                        <span className="onb-info-step-text future">Pronto!</span>
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
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--elec)" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>

                <h1>
                  {displayName ? `${displayName}, quais sao` : 'Quais sao'}
                  <br />seus objetivos de vida?
                </h1>
                <div className="subtitle" style={{ maxWidth: 480, margin: '0 auto' }}>
                  Selecione tudo o que faz sentido pra voce agora. Isso ajuda o SyncLife a personalizar insights e sugestoes inteligentes.
                </div>

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
                          {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>}
                        </div>
                        <div className="onb-obj-card-icon" style={{ background: obj.bg }}>
                          <ObjIcon type={obj.icon} color={obj.color} size={18} />
                        </div>
                        <div className="onb-obj-card-title">{obj.title}</div>
                        <div className="onb-obj-card-desc">{obj.desc}</div>
                      </button>
                    )
                  })}
                </div>

                <div className="onb-obj-count">
                  <span className="onb-obj-count-num">{state.objectives.length}</span>
                  {state.objectives.length === 1 ? 'objetivo selecionado' : 'objetivos selecionados'}
                </div>
              </div>
            )}

            {/* ═══ Step 3: Dimensions ═══ */}
            {step === 3 && (
              <div className="onb-card" style={{ maxWidth: 720 }}>
                <div className="onb-dim-icon">
                  <ObjIcon type="grid" color="var(--green)" size={32} />
                </div>

                <h1>Em quais dimensoes da vida<br />voce quer focar?</h1>
                <div className="subtitle" style={{ maxWidth: 520, margin: '0 auto' }}>
                  Todas as dimensoes ficam disponiveis, mas as selecionadas terao destaque no seu Dashboard e no calculo do Life Sync Score.
                </div>

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
                          <div className="onb-dim-card-name">{dim.name}</div>
                          <div className="onb-dim-card-desc">{dim.desc}</div>
                        </div>
                        <div className="onb-dim-card-right">
                          {dim.recommended && (
                            <span className="onb-dim-badge" style={{ background: dim.bg, color: dim.color }}>
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

                <div className="onb-dim-note">
                  <Info size={14} />
                  Voce pode ativar ou desativar dimensoes a qualquer momento em Configuracoes
                </div>
              </div>
            )}

            {/* ═══ Step 4: Celebration ═══ */}
            {step === 4 && (
              <div className="onb-card">
                {/* Celebration Ring */}
                <div className="celeb-ring">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--s3)" strokeWidth="6" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="url(#celeb-grad)" strokeWidth="6" strokeLinecap="round" strokeDasharray="314" strokeDashoffset="94" transform="rotate(-90 60 60)" />
                    <defs>
                      <linearGradient id="celeb-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--green)" />
                        <stop offset="50%" stopColor="var(--cyan)" />
                        <stop offset="100%" stopColor="var(--blue)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ textAlign: 'center' }}>
                    <div className="celeb-score">70</div>
                    <div className="celeb-label">pts</div>
                  </div>
                </div>

                <h1 style={{ fontSize: 36 }}>
                  Tudo pronto{displayName ? `, ${displayName}` : ''}!
                </h1>
                <div className="subtitle" style={{ maxWidth: 460, margin: '0 auto 8px' }}>
                  Seu SyncLife esta configurado com{' '}
                  <strong style={{ color: 'var(--t1)' }}>{state.objectives.length} {state.objectives.length === 1 ? 'objetivo' : 'objetivos'}</strong>
                  {' '}e{' '}
                  <strong style={{ color: 'var(--t1)' }}>{state.dimensions.length} {state.dimensions.length === 1 ? 'dimensao ativa' : 'dimensoes ativas'}</strong>.
                  {' '}Seu Life Sync Score comeca em{' '}
                  <strong style={{ color: 'var(--green)' }}>70 pontos</strong>.
                </div>

                {/* Active modules strip */}
                <div className="celeb-modules">
                  {state.dimensions.map(val => {
                    const dim = DIMENSIONS.find(d => d.value === val)
                    if (!dim) return null
                    return (
                      <div key={val} className="celeb-mod">
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
                      <div className="celeb-objectives-title">Seus objetivos de vida</div>
                      <div className="celeb-objectives">
                        {state.objectives.map(val => {
                          const obj = OBJECTIVES.find(o => o.value === val)
                          if (!obj) return null
                          return (
                            <span
                              key={val}
                              className="celeb-obj-pill"
                              style={{
                                background: obj.bg,
                                border: `1px solid ${obj.color}33`,
                                color: obj.color,
                              }}
                            >
                              {obj.title.replace('Organizar minhas financas', 'Organizar financas')
                                .replace('Construir patrimonio', 'Construir patrimonio')
                                .replace('Cuidar da saude', 'Cuidar da saude')
                                .replace('Ter mais tempo livre', 'Mais tempo livre')}
                            </span>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {/* Start here actions */}
                  <div className="celeb-actions-title">Comece por aqui</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {START_ACTIONS.map((action) => (
                      <div key={action.title} className="celeb-action">
                        <div className="celeb-action-icon" style={{ background: action.bg }}>
                          <ObjIcon type={action.icon} color={action.color} size={14} />
                        </div>
                        <div className="celeb-action-info">
                          <div className="celeb-action-title">{action.title}</div>
                          <div className="celeb-action-desc">{action.desc}</div>
                        </div>
                        <ChevronLeft size={14} style={{ color: 'var(--t3)', transform: 'rotate(180deg)' }} />
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
              <button className="onb-nav-back" onClick={() => setStep(step - 1)}>
                <ChevronLeft size={14} />
                Voltar
              </button>
            )}

            {step < 4 && (
              <div className="onb-nav-step">Passo {step} de 4</div>
            )}
            {step === 4 && <div />}

            {step < 4 ? (
              <button className="onb-nav-next" onClick={() => setStep(step + 1)}>
                Proximo
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                className="onb-nav-finish"
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
