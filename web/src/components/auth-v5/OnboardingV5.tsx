'use client'

// Onda 1 · Onboarding v5 — "a primeira edição" (protótipos auth/onboarding{,.mobile}.html, r2).
// Comportamento herdado do v3: guard de sessão, prefill do nome, persistência em profiles
// (full_name, mode, onboarding_completed, life_moments, active_modules) e destino /financas.
// A bússola aponta a última área ativada (§5.4) e nunca fica sem norte (mínimo 1 área).

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import '@/styles/tokens-v5.css'
import '@/styles/v5.css'
import '@/styles/bussola-3d.css'
import '@/styles/auth-v5.css'
import './onboarding-v5.css'
import { controlBussola3D, type BussolaControl } from '@/lib/v5/bussola-3d'
import { prefersReduce } from '@/lib/v5/viva'
import { useAuthBoot, BsMark, AreaIconSlot, AREAS_V5, IconArrowR, IconChevL, IconCheckWhite } from './chrome'

const OBJETIVOS = [
  { value: 'financas', tt: 'Organizar as finanças', ds: 'Sair do vermelho, controlar gastos, criar orçamento' },
  { value: 'patrimonio', tt: 'Construir patrimônio', ds: 'Investir, acompanhar proventos, crescer o capital' },
  { value: 'saude', tt: 'Cuidar da saúde', ds: 'Treinos, alimentação, peso e exames em dia' },
  { value: 'tempo', tt: 'Ter mais tempo livre', ds: 'Rotina organizada, menos procrastinação, blocos de foco' },
  { value: 'carreira', tt: 'Crescer na carreira', ds: 'Projetos, certificações, networking, promoção' },
  { value: 'sonhos', tt: 'Realizar sonhos', ds: 'Casa própria, viagem dos sonhos, aposentadoria antecipada' },
  { value: 'mente', tt: 'Equilíbrio mental', ds: 'Menos ansiedade, hábitos saudáveis, leitura e reflexão' },
  { value: 'viagens', tt: 'Viajar mais', ds: 'Roteiros, orçamento de viagem e memórias' },
  { value: 'equilibrio', tt: 'Vida equilibrada', ds: 'Visão do todo, nenhuma área esquecida' },
] as const

// valores de módulo (v3) na ordem canônica da bússola (§5.2)
const AREA_VALUES = ['financas', 'futuro', 'tempo', 'corpo', 'mente', 'patrimonio', 'carreira', 'experiencias'] as const
const AREAS_DEFAULT = ['financas', 'futuro', 'tempo', 'corpo', 'mente']

const COMECE = [
  { tt: 'Registre a primeira transação', ds: '01 Finanças · 30 segundos', href: '/financas/transacoes' },
  { tt: 'Crie o primeiro objetivo', ds: '02 Futuro · 1 minuto', href: '/futuro' },
  { tt: 'Proteja um bloco de foco', ds: '03 Tempo · 2 minutos', href: '/tempo' },
] as const

function primeiroNome(nome: string): string {
  const v = nome.trim().split(/\s+/)[0] || ''
  return v ? v.charAt(0).toUpperCase() + v.slice(1) : ''
}

export function OnboardingV5() {
  const router = useRouter()
  const root = useRef<HTMLDivElement>(null)
  useAuthBoot(root, { aurora: false, dark: true })

  const [step, setStep] = useState(1)
  const [nome, setNome] = useState('')
  const [objetivos, setObjetivos] = useState<string[]>([])
  const [areas, setAreas] = useState<string[]>([...AREAS_DEFAULT])
  const [salvando, setSalvando] = useState(false)

  // guard + prefill (comportamento do v3)
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
      if (profile?.onboarding_completed) { router.push('/financas'); return }
      if (profile?.full_name) setNome(profile.full_name)
    }
    load()
  }, [router])

  // a bússola do passo 03 (montada pelo boot; aqui só o controle da agulha)
  const ctl = useRef<BussolaControl | null>(null)
  useEffect(() => {
    const bs = root.current?.querySelector<HTMLElement>('.a-stage .bs')
    if (bs) ctl.current = controlBussola3D(bs, { reduce: prefersReduce() })
  }, [])

  const goto = (n: number) => { setStep(Math.max(1, Math.min(4, n))); scrollTo(0, 0) }
  const pular = () => {
    if (confirm('Pular configuração? Você pode refazer isso nas configurações a qualquer momento.')) goto(4)
  }

  const toggleObjetivo = (v: string) =>
    setObjetivos((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))

  const toggleArea = (v: string, i: number) => {
    setAreas((s) => {
      const ligada = s.includes(v)
      if (ligada && s.length === 1) return s // a bússola nunca fica sem norte
      if (!ligada) ctl.current?.point(i)
      return ligada ? s.filter((x) => x !== v) : [...s, v]
    })
  }

  const finalizar = async () => {
    setSalvando(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const ativos = areas.length > 0 ? areas : ['financas']
      const { error } = await (supabase as any)
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: nome || null,
          mode: 'jornada',
          onboarding_completed: true,
        })
      if (error) { toast.error('Erro ao salvar configurações. Tente novamente.'); return }
      await (supabase as any)
        .from('profiles')
        .update({
          life_moments: objetivos.length > 0 ? objetivos : null,
          active_modules: ativos,
        })
        .eq('id', user.id)
      toast.success('Tudo configurado. Bem-vindo ao SyncLife.')
      router.push('/financas')
      router.refresh()
    } catch {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const nomeEco = primeiroNome(nome)

  return (
    <div className="v5">
      <div className="grain" aria-hidden="true" />
      <div className="onb dk" ref={root}>

        <header className="bar">
          <span className="brand"><BsMark /><span className="wm">Sync<em>Life</em></span></span>
          <nav className="tabs" aria-label="Passos da configuração">
            {(['Nome', 'Objetivos', 'Áreas', 'Pronto'] as const).map((lbl, i) => (
              <button key={lbl} className={'tab' + (step === i + 1 ? ' on' : '') + (step > i + 1 ? ' done' : '')} onClick={() => goto(i + 1)}>
                <span className="n num">{String(i + 1).padStart(2, '0')}</span>{lbl}
              </button>
            ))}
          </nav>
          <button className="pular" onClick={pular}>Pular configuração</button>
        </header>
        <div className="prog" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => <i key={i} className={step >= i ? 'on' : undefined} />)}
        </div>

        {/* ═══ passo 01 · nome ═══ */}
        <section className={'step wrap' + (step === 1 ? ' on' : '')}>
          <p className="eyebrow boot b1"><b>Sua primeira edição</b> · passo 01 de 04</p>
          <h1 className="boot b2">Antes de tudo: como devemos te chamar?</h1>
          <p className="sub boot b2">É assim que o seu briefing diário vai começar. Leva menos de um minuto configurar tudo.</p>
          <div className="gname boot b3">
            <input type="text" placeholder="Seu nome" autoComplete="given-name" aria-label="Seu nome"
              value={nome} onChange={(e) => setNome(e.target.value)} />
            <div className="handrow">
              <span className="hand" style={{ transform: 'rotate(-2deg)' }}>pode ser apelido</span>
            </div>
          </div>
          <div className="prox boot b4">
            <div className="r now"><span className="n num">01</span><span>Seu nome</span><span className="tagnow">agora</span></div>
            <div className="r"><span className="n num">02</span><span>Seus objetivos de vida</span><span /></div>
            <div className="r"><span className="n num">03</span><span>As áreas da sua bússola</span><span /></div>
            <div className="r"><span className="n num">04</span><span>Pronto.</span><span /></div>
          </div>
        </section>

        {/* ═══ passo 02 · objetivos ═══ */}
        <section className={'step wrap' + (step === 2 ? ' on' : '')}>
          <p className="eyebrow"><b>Sua primeira edição</b> · passo 02 de 04</p>
          <h1>{nomeEco ? `${nomeEco}, o que você quer mudar?` : 'O que você quer mudar?'}</h1>
          <p className="sub">Marque tudo que fizer sentido agora. Isso calibra os insights do coach e o seu Life Sync Score.</p>
          <div className="objs">
            {OBJETIVOS.map((o) => {
              const sel = objetivos.includes(o.value)
              return (
                <button key={o.value} type="button" className={'obj' + (sel ? ' sel' : '')} onClick={() => toggleObjetivo(o.value)}>
                  <span><span className="tt">{o.tt}</span><span className="ds">{o.ds}</span></span>
                  <span className="ok"><IconCheckWhite /></span>
                </button>
              )
            })}
          </div>
          <p className="contagem">
            <b className="num">{objetivos.length}</b>{' '}
            {objetivos.length === 1 ? 'objetivo selecionado' : 'objetivos selecionados'}
          </p>
        </section>

        {/* ═══ passo 03 · áreas ═══ */}
        <section className={'step wrap' + (step === 3 ? ' on' : '')}>
          <p className="eyebrow"><b>Sua primeira edição</b> · passo 03 de 04</p>
          <h1>Quais áreas entram na sua bússola?</h1>
          <p className="sub">Todas ficam disponíveis. As ativas ganham destaque no panorama e puxam o seu Life Sync Score.</p>
          <div className="a-grid">
            <div className="alist">
              {AREAS_V5.map((a, i) => {
                const v = AREA_VALUES[i]
                const on = areas.includes(v)
                return (
                  <div key={v} className={'arow' + (on ? '' : ' off')} onClick={() => toggleArea(v, i)}>
                    <AreaIconSlot i={i} size={46} sizeM={40} />
                    <span className="ix num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="tx">
                      <span className="nm">{a.nome}</span>
                      <span className="ds"><span className="d-only">{a.ds}</span><span className="m-only">{a.dsM}</span></span>
                    </span>
                    <span className="tgl" role="switch" aria-checked={on} aria-label={a.nome} />
                  </div>
                )
              })}
            </div>
            <div className="a-side">
              <div className="a-stage">
                <div className="bs d3" data-bs3d role="img" aria-label="A Bússola da Vida apontando a última área ativada" />
              </div>
              <p className="b-meta">Áreas ativas · <b className="num">{String(areas.length).padStart(2, '0')}</b></p>
              <p className="a-nota">
                Você muda isso quando quiser em Configurações.<span className="d-only"> A bússola nunca perde uma área de vista, só o destaque muda.</span>
              </p>
            </div>
          </div>
        </section>

        {/* ═══ passo 04 · pronto ═══ */}
        <section className={'step wrap fim-step' + (step === 4 ? ' on' : '')}>
          <p className="eyebrow"><b>Sua primeira edição</b> · passo 04 de 04</p>
          <div className="fim">
            <div className="selo" role="img" aria-label="Life Sync Score inicial: 70 pontos">
              <div className="k">LIFE SYNC SCORE</div>
              <div className="n num">70</div>
              <div className="d num">ponto de partida</div>
              <div className="s">calibra a cada registro</div>
            </div>
            <div>
              <h1>{nomeEco ? `Pronto, ${nomeEco}. Sua bússola está calibrada.` : 'Pronto. Sua bússola está calibrada.'}</h1>
              <p className="prosa">
                Sua vida agora tem <b className="num">{areas.length} {areas.length === 1 ? 'área' : 'áreas'}</b> ativas
                e <b className="num">{objetivos.length} {objetivos.length === 1 ? 'objetivo' : 'objetivos'}</b> no radar.
                O seu Life Sync Score nasce em <b className="num">70 pontos</b> e fica mais preciso a cada registro.
                <span className="d-only"> Amanhã cedo, o seu primeiro briefing chega escrito.</span>
              </p>
              <p className="assin">Escrito agora · com base nas suas escolhas</p>
              <div className="comece">
                <p className="eyebrow">Comece por aqui</p>
                {COMECE.map((c, i) => (
                  <div key={c.tt} className="r" onClick={finalizar} role="button" tabIndex={0}>
                    <span className="n num">{String(i + 1).padStart(2, '0')}</span>
                    <span><span className="tt">{c.tt}</span><span className="ds">{c.ds}</span></span>
                    <IconArrowR size={15} sw={2.2} />
                  </div>
                ))}
              </div>
              <div className="fim-cta">
                <button className="btn btn-roxo" type="button" style={{ padding: '15px 30px', fontSize: '14.5px' }}
                  disabled={salvando} onClick={finalizar}>
                  {salvando ? 'Preparando…' : 'Abrir meu panorama'}
                  <IconArrowR size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className={'onbnav' + (step > 1 ? ' tem-volta' : '')}>
          <div className="in">
            <button className="btn btn-ghost" type="button" onClick={() => goto(step - 1)}>
              <IconChevL size={12} />Voltar
            </button>
            <span className="meio num">Passo {step} de 4</span>
            <button className="btn btn-roxo" type="button" style={{ visibility: step === 4 ? 'hidden' : 'visible' }} onClick={() => goto(step + 1)}>
              Próximo<IconArrowR size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
