'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { WizardStepper } from '@/components/shared/WizardStepper'
import { SyncLifeBrand } from '@/components/shell/icons'
import { OnboardingMobile } from '@/components/onboarding/OnboardingMobile'

// ── Types ────────────────────────────────────────────────
interface OnboardingState {
  nome: string
  momentos: string[]
  modo: 'foco' | 'jornada'
  areas: string[]
}

// ── Data ─────────────────────────────────────────────────
const MOMENTOS = [
  { value: 'equilibrio', icon: '⚖️', title: 'Quero mais equilíbrio', desc: 'Sentindo que a vida está desorganizada e quer colocar tudo nos trilhos.' },
  { value: 'crescimento', icon: '🚀', title: 'Estou em fase de crescimento', desc: 'Carreira, estudos ou projetos em ascensão. Quer acompanhar cada passo.' },
  { value: 'virada', icon: '🔄', title: 'Passando por uma virada', desc: 'Mudança de emprego, cidade, relacionamento ou outro marco importante.' },
  { value: 'financas', icon: '💰', title: 'Quero controlar meu dinheiro', desc: 'Foco em organizar finanças, criar hábitos e parar de perder o controle.' },
  { value: 'metas', icon: '🏆', title: 'Tenho grandes metas', desc: 'Objetivos claros que precisa transformar em plano concreto e acompanhar.' },
  { value: 'habitos', icon: '🌱', title: 'Quero construir hábitos', desc: 'Pequenas mudanças consistentes que, com o tempo, transformam a vida.' },
]

const AREAS = [
  { value: 'financas', icon: '💰', title: 'Finanças', desc: 'Gastos, orçamentos, planejamento', color: '#10b981', bg: 'rgba(16,185,129,0.05)', glow: 'rgba(16,185,129,0.1)' },
  { value: 'metas', icon: '🏆', title: 'Metas', desc: 'Objetivos pessoais e financeiros', color: '#8b5cf6', bg: 'rgba(139,92,246,0.05)', glow: 'rgba(139,92,246,0.1)' },
  { value: 'agenda', icon: '📅', title: 'Agenda', desc: 'Compromissos e tempo', color: '#06b6d4', bg: 'rgba(6,182,212,0.05)', glow: 'rgba(6,182,212,0.1)' },
  { value: 'saude', icon: '🩺', title: 'Saúde', desc: 'Hábitos, sono, bem-estar', color: '#f43f5e', bg: 'rgba(244,63,94,0.05)', glow: 'rgba(244,63,94,0.1)' },
  { value: 'carreira', icon: '💼', title: 'Carreira', desc: 'Evolução profissional', color: '#f59e0b', bg: 'rgba(245,158,11,0.05)', glow: 'rgba(245,158,11,0.1)' },
  { value: 'estudos', icon: '📚', title: 'Estudos', desc: 'Aprendizado contínuo', color: '#0055ff', bg: 'rgba(0,85,255,0.05)', glow: 'rgba(0,85,255,0.1)' },
]

const PRO_MODULES = ['saude', 'carreira']

const STEPS = ['Olá!', 'Momento', 'Estilo', 'Áreas', 'Pronto']
const ONBOARDING_STEPS = STEPS.map((label, i) => ({ id: i + 1, label }))

const MODULE_LABELS: Record<string, string> = {
  financas: 'Finanças', metas: 'Metas', agenda: 'Agenda',
  saude: 'Saúde', carreira: 'Carreira', estudos: 'Estudos',
}

// ── Confetti ─────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: ['#10b981', '#0055ff', '#06b6d4', '#f59e0b', '#f43f5e', '#8b5cf6'][Math.floor(Math.random() * 6)],
    size: `${4 + Math.random() * 8}px`,
    duration: `${1.5 + Math.random() * 2}s`,
    delay: `${Math.random() * 0.8}s`,
    round: Math.random() > 0.5,
  }))

  return (
    <div className="ob-confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="ob-confetti-piece"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? '50%' : '2px',
            '--duration': p.duration,
            '--delay': p.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}


// ── Main Component ────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [state, setState] = useState<OnboardingState>({
    nome: '', momentos: [], modo: 'foco', areas: [],
  })
  const [isJornada, setIsJornada] = useState(false)
  const [maxHint, setMaxHint] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

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

  // Apply Jornada body class
  useEffect(() => {
    setIsJornada(state.modo === 'jornada')
  }, [state.modo])

  // Show confetti when reaching step 5 in Jornada
  useEffect(() => {
    if (step === 5 && state.modo === 'jornada') {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 3500)
      return () => clearTimeout(t)
    }
  }, [step, state.modo])

  const toggleMomento = useCallback((value: string) => {
    setState(s => {
      const selected = s.momentos.includes(value)
      if (selected) return { ...s, momentos: s.momentos.filter(m => m !== value) }
      if (s.momentos.length >= 3) {
        setMaxHint(true)
        setTimeout(() => setMaxHint(false), 2000)
        return s
      }
      return { ...s, momentos: [...s.momentos, value] }
    })
  }, [])

  const toggleArea = useCallback((value: string) => {
    setState(s => {
      const selected = s.areas.includes(value)
      return {
        ...s,
        areas: selected ? s.areas.filter(a => a !== value) : [...s.areas, value],
      }
    })
  }, [])

  const handleSkip = () => {
    if (confirm('Pular configuração? Você pode refazer isso nas configurações a qualquer momento.')) {
      setStep(5)
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const areas = state.areas.length > 0 ? state.areas : ['financas']

      // Passo 1 — campos obrigatórios (existem em qualquer versão do schema)
      // Upsert garante que a linha existe mesmo sem o trigger handle_new_user
      const { error } = await (supabase as any)
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: state.nome || null,
          mode: state.modo === 'jornada' ? 'jornada' : 'foco',
          onboarding_completed: true,
        })

      if (error) {
        toast.error('Erro ao salvar configurações. Tente novamente.')
        return
      }

      // Passo 2 — campos da migration 001_mvp_v2.sql (non-blocking se não existirem)
      await (supabase as any)
        .from('profiles')
        .update({
          life_moments: state.momentos.length > 0 ? state.momentos : null,
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

  const hasPro = state.areas.some(a => PRO_MODULES.includes(a))

  const momentoHint = () => {
    if (maxHint) return <span className="ob-select-hint max">Máximo de 3 seleções atingido.</span>
    const n = state.momentos.length
    if (n === 0) return <span className="ob-select-hint">Selecione até 3 opções.</span>
    if (n === 3) return <span className="ob-select-hint full">{n} selecionadas · máximo 3</span>
    return <span className="ob-select-hint">{n} selecionada{n > 1 ? 's' : ''} · máximo 3</span>
  }

  return (
    <>
    <OnboardingMobile userName={state.nome || undefined} />
    <div className={`hidden lg:block onboarding-page${isJornada ? ' mode-jornada' : ''}`}>
      {/* Background */}
      <div className="ob-orbs" aria-hidden>
        <div className="ob-orb ob-orb-1" />
        <div className="ob-orb ob-orb-2" />
      </div>

      {showConfetti && <Confetti />}

      {/* Topbar */}
      <div className="ob-topbar">
        <Link href="/" className="ob-logo">
          <SyncLifeBrand size="md" />
        </Link>
        {step < 5 && (
          <button className="ob-skip" onClick={handleSkip}>
            Pular configuração <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Progress */}
      <WizardStepper steps={ONBOARDING_STEPS} currentStep={step} />

      {/* Step Card */}
      <div className="ob-card" key={step}>
        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <>
            <p className="ob-eyebrow">Passo 1 de 5</p>
            <h2 className="ob-title">Olá! Qual é o seu nome?</h2>
            <p className="ob-sub">Vamos personalizar o SyncLife do seu jeito.</p>
            <input
              type="text"
              className="ob-name-input"
              placeholder="Seu nome"
              value={state.nome}
              onChange={(e) => setState(s => ({ ...s, nome: e.target.value }))}
              autoFocus
            />
            <p className="ob-hint">É assim que vamos te chamar no app.</p>
            <div className="ob-nav">
              <span className="ob-btn-back invisible" aria-hidden>.</span>
              <button className="ob-btn-next" onClick={() => setStep(2)}>
                Continuar <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Momento ── */}
        {step === 2 && (
          <>
            <p className="ob-eyebrow">Passo 2 de 5</p>
            <h2 className="ob-title">O que te trouxe até aqui?</h2>
            <p className="ob-sub">Pode escolher até 3 opções. Isso nos ajuda a personalizar sua experiência.</p>
            <div className="ob-momento-grid">
              {MOMENTOS.map((m) => {
                const sel = state.momentos.includes(m.value)
                return (
                  <button
                    key={m.value}
                    className={`ob-momento-card${sel ? ' selected' : ''}`}
                    onClick={() => toggleMomento(m.value)}
                  >
                    {sel && <span className="ob-momento-check">✓</span>}
                    <span className="ob-momento-icon">{m.icon}</span>
                    <div className="ob-momento-title">{m.title}</div>
                    <div className="ob-momento-desc">{m.desc}</div>
                  </button>
                )
              })}
            </div>
            {momentoHint()}
            <div className="ob-nav">
              <button className="ob-btn-back" onClick={() => setStep(1)}>
                <ArrowLeft size={14} /> Voltar
              </button>
              <button className="ob-btn-next" onClick={() => setStep(3)}>
                Continuar <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Mode ── */}
        {step === 3 && (
          <>
            <p className="ob-eyebrow">Passo 3 de 5</p>
            <h2 className="ob-title">Como você prefere ver as informações?</h2>
            <p className="ob-sub">Dois estilos de interface, uma mesma plataforma. Pode mudar a qualquer hora.</p>
            <div className="ob-mode-grid">
              {/* Foco */}
              <button
                className={`ob-mode-card foco${state.modo === 'foco' ? ' selected' : ''}`}
                onClick={() => setState(s => ({ ...s, modo: 'foco' }))}
              >
                {state.modo === 'foco' && <span className="ob-mode-check">✓</span>}
                <span className="ob-mode-icon">🎯</span>
                <div className="ob-mode-badge">MODO FOCO</div>
                <div className="ob-mode-title">Direto ao ponto</div>
                <div className="ob-mode-desc">Interface objetiva, dados densos, sem distrações. Você quer números, não frases.</div>
                <div className="ob-mode-features">
                  <span className="ob-mode-feature">· Métricas em destaque</span>
                  <span className="ob-mode-feature">· Sem animações extras</span>
                  <span className="ob-mode-feature">· Sidebar compacta</span>
                </div>
              </button>

              {/* Jornada */}
              <button
                className={`ob-mode-card jornada${state.modo === 'jornada' ? ' selected' : ''}`}
                onClick={() => setState(s => ({ ...s, modo: 'jornada' }))}
              >
                {state.modo === 'jornada' && <span className="ob-mode-check">✓</span>}
                <span className="ob-mode-icon">🌱</span>
                <div className="ob-mode-badge">MODO JORNADA</div>
                <div className="ob-mode-title">Acompanhe sua evolução</div>
                <div className="ob-mode-desc">Insights, conquistas e motivação. O app celebra com você cada pequena vitória.</div>
                <div className="ob-mode-features">
                  <span className="ob-mode-feature">· Life Sync Score</span>
                  <span className="ob-mode-feature">· Conquistas &amp; badges</span>
                  <span className="ob-mode-feature">· Insights com IA</span>
                </div>
              </button>
            </div>
            <div className="ob-nav">
              <button className="ob-btn-back" onClick={() => setStep(2)}>
                <ArrowLeft size={14} /> Voltar
              </button>
              <button className="ob-btn-next" onClick={() => setStep(4)}>
                Continuar <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* ── Step 4: Areas ── */}
        {step === 4 && (
          <>
            <p className="ob-eyebrow">Passo 4 de 5</p>
            <h2 className="ob-title">Quais áreas da sua vida quer gerenciar?</h2>
            <p className="ob-sub">Ativamos só o que você precisa agora. Pode adicionar ou remover depois.</p>
            <div className="ob-area-grid">
              {AREAS.map((a) => {
                const sel = state.areas.includes(a.value)
                return (
                  <button
                    key={a.value}
                    className={`ob-area-card${sel ? ' selected' : ''}`}
                    onClick={() => toggleArea(a.value)}
                    style={sel ? {
                      '--area-color': a.color,
                      '--area-bg': a.bg,
                      '--area-glow': a.glow,
                    } as React.CSSProperties : undefined}
                  >
                    {sel && (
                      <span className="ob-area-check" style={{ background: a.color }}>✓</span>
                    )}
                    <span className="ob-area-icon">{a.icon}</span>
                    <div className="ob-area-title">{a.title}</div>
                    <div className="ob-area-desc">{a.desc}</div>
                  </button>
                )
              })}
            </div>
            <p className="ob-hint">Selecione pelo menos uma área.</p>
            <div className="ob-nav">
              <button className="ob-btn-back" onClick={() => setStep(3)}>
                <ArrowLeft size={14} /> Voltar
              </button>
              <button className="ob-btn-next" onClick={() => setStep(5)}>
                Continuar <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* ── Step 5: Summary ── */}
        {step === 5 && (
          <>
            <div className="ob-summary-hero">
              <span className="ob-summary-emoji">{state.modo === 'jornada' ? '🎉' : '✅'}</span>
              <h2 className="ob-summary-title">
                Pronto{state.nome ? ', ' : ''}
                {state.nome && <span className="grad-name">{state.nome}</span>}
                {!state.nome && ', você'}!
              </h2>
              <p className="ob-summary-sub">
                {state.modo === 'jornada'
                  ? 'Vamos acompanhar sua evolução juntos. Cada passo conta!'
                  : 'Tudo configurado. Seu painel está pronto.'}
              </p>
            </div>

            <div className="ob-summary-block">
              {state.momentos.length > 0 && (
                <div className="ob-summary-row">
                  <span className="ob-summary-row-icon">🙌</span>
                  <div className="ob-summary-row-content">
                    <div className="ob-summary-row-label">Seu momento</div>
                    <div className="ob-summary-row-value">
                      {state.momentos.map(m => MOMENTOS.find(x => x.value === m)?.title).filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
              )}
              <div className="ob-summary-row">
                <span className="ob-summary-row-icon">🎯</span>
                <div className="ob-summary-row-content">
                  <div className="ob-summary-row-label">Modo de interface</div>
                  <div className="ob-summary-row-value">
                    {state.modo === 'foco' ? '🎯 Modo Foco — Interface objetiva' : '🌱 Modo Jornada — Acompanhe sua evolução'}
                  </div>
                </div>
              </div>
              {(state.areas.length > 0) && (
                <div className="ob-summary-row">
                  <span className="ob-summary-row-icon">🗂️</span>
                  <div className="ob-summary-row-content">
                    <div className="ob-summary-row-label">Módulos ativados</div>
                    <div className="ob-area-chips">
                      {(state.areas.length > 0 ? state.areas : ['financas']).map((a) => {
                        const area = AREAS.find(x => x.value === a)
                        return (
                          <span
                            key={a}
                            className="ob-area-chip"
                            style={{ color: area?.color, borderColor: area?.color }}
                          >
                            {area?.icon} {MODULE_LABELS[a] ?? a}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {hasPro && (
              <div className="ob-pro-warning">
                ⭐ Saúde e Carreira fazem parte do plano PRO. Você pode usar gratuitamente por 14 dias e decidir depois.
              </div>
            )}

            <p className="ob-footer-note">
              Tudo pode ser ajustado nas configurações a qualquer momento.
            </p>

            <div className="ob-nav">
              <button className="ob-btn-back" onClick={() => setStep(4)}>
                <ArrowLeft size={14} /> Voltar
              </button>
              <button
                className="ob-btn-next"
                onClick={handleFinish}
                disabled={isLoading}
              >
                {isLoading ? 'Abrindo seu painel...' : <>Começar minha jornada 🚀</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  )
}
