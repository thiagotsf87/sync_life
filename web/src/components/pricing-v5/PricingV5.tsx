'use client'

// Onda 1 · Pricing v5 — porte 1:1 dos protótipos aprovados landing/pricing{,.mobile}.html.
// Duas árvores dedicadas (padrão da Onda 0): .pv-d inicializa com Lenis; .pv-m com scroll
// nativo; a escondida fica estática completa (E-02). Conteúdo compartilhado via componentes.

import { useEffect, useRef, useState, type RefObject } from 'react'
import Link from 'next/link'
import Lenis from 'lenis'
import '@/styles/tokens-v5.css'
import '@/styles/v5.css'
import '@/styles/bussola-3d.css'
import './pricing-v5.css'
import { mountBussola3D } from '@/lib/v5/bussola-3d'
import { prefersReduce, setupReveal, initAurora, type Cleanup } from '@/lib/v5/viva'
import { BsMark, IconCheck, IconArrowR } from '@/components/auth-v5/chrome'

const TICKER = ['24.000 BRASILEIROS EM SINCRONIA', '14 DIAS PRO GRÁTIS', 'SEM CARTÃO DE CRÉDITO']

function TickerTk() {
  return (
    <div className="tk">
      {Array.from({ length: 4 }).flatMap((_, r) =>
        TICKER.map((t, i) => [<span key={`${r}-${i}a`}>{t}</span>, <span key={`${r}-${i}b`}>·</span>])
      )}
    </div>
  )
}

function Chevron({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function Bill({ anual, setAnual, id }: { anual: boolean; setAnual: (v: boolean) => void; id: string }) {
  return (
    <div className="bill boot b4" role="group" aria-label="Período de cobrança">
      <button type="button" className={anual ? undefined : 'on'} id={`${id}-mensal`} onClick={() => setAnual(false)}>Mensal</button>
      <button type="button" className={anual ? 'on' : undefined} id={`${id}-anual`} onClick={() => setAnual(true)}>Anual</button>
      <span className="desc num">2 meses grátis</span>
    </div>
  )
}

function PCards({ check }: { check: number }) {
  const freeItens = [
    'Todas as 8 áreas da vida', 'Coach IA com briefing diário', 'Life Sync Score',
    '50 transações por mês', 'Web e mobile, 1 dispositivo',
  ]
  const proItens = [
    'Tudo do Free, sem limites', 'Consultor IA que executa por você', 'Relatórios completos em PDF',
    'Cardápio e planos gerados por IA', 'Google Calendar bidirecional', 'Dispositivos ilimitados',
  ]
  return (
    <div className="pcards rv">
      <div className="pcard">
        <div className="pn">Free</div>
        <div className="pp num">R$&nbsp;0<small>pra sempre</small></div>
        <ul>{freeItens.map((t) => <li key={t}><IconCheck size={check} />{t}</li>)}</ul>
        <Link className="btn btn-ghost" href="/cadastro">Começar grátis</Link>
        <p className="pfoot">Grátis pra sempre, de verdade.</p>
      </div>
      <div className="pcard pro">
        <span className="tag">RECOMENDADO</span>
        <div className="pn">PRO</div>
        <div className="pp num">
          <span className="mensal">R$&nbsp;24,90<small>por mês</small></span>
          <span className="anual">R$&nbsp;20,75<small>por mês</small></span>
        </div>
        <ul>{proItens.map((t) => <li key={t}><IconCheck size={check} />{t}</li>)}</ul>
        <Link className="btn btn-roxo" href="/cadastro">Testar 14 dias grátis</Link>
        <p className="pfoot">
          <span className="mensal">Sem cartão de crédito no teste.</span>
          <span className="anual">Cobrado R$&nbsp;249 uma vez por ano.</span>
        </p>
      </div>
    </div>
  )
}

const OK = (size: number) => <IconCheck size={size} />
const NO = <span className="no">–</span>

function Faq({ compact }: { compact?: boolean }) {
  const QS: Array<[string, string, boolean?]> = [
    ['Posso usar grátis pra sempre?', 'Sim. O plano Free dura indefinidamente. PRO desbloqueia limites e as features de IA que executam por você, mas o essencial funciona pra sempre sem custo.', true],
    ['Posso trocar de plano quando quiser?', compact
      ? 'Sim. O upgrade vale na hora; no downgrade você mantém o PRO até o fim do período já pago. Nada se perde.'
      : 'Sim. O upgrade vale na hora; no downgrade você mantém o PRO até o fim do período já pago. Nada se perde: seus dados continuam intactos nos dois sentidos.'],
    ['O que acontece se eu cancelar o PRO?', compact
      ? 'Sua conta volta pro Free e todos os registros ficam onde estavam. Sem multa, sem retenção forçada.'
      : 'Sua conta volta pro Free e todos os registros ficam onde estavam. Sem multa, sem retenção forçada, sem ligação de "não vá embora".'],
    ['Quais formas de pagamento?', 'Cartão de crédito e Pix. No plano anual, o Pix ganha 5% a mais de desconto.'],
    [compact ? 'Meus dados ficam seguros?' : 'Meus dados financeiros ficam seguros?', compact
      ? 'Sim. LGPD-compliant, criptografia em trânsito (TLS 1.3) e em repouso (AES-256). Você exporta ou exclui tudo quando quiser.'
      : 'Sim. SyncLife é LGPD-compliant, dados criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Você pode exportar ou excluir tudo a qualquer momento.'],
  ]
  if (!compact) QS.push(['Tem versão Web e Mobile?', 'Sim, interfaces nativas para iOS, Android e Web. Tudo sincroniza em tempo real.'])
  return (
    <div className="faq rv">
      {QS.map(([q, a, open]) => (
        <details key={q} open={open}>
          <summary>{q}<Chevron size={compact ? 15 : 16} /></summary>
          <p className="ans">{a}</p>
        </details>
      ))}
    </div>
  )
}

// init de uma árvore visível: gate .anim, bússolas, reveals, aurora (+ Lenis no desktop)
function useTreeInit(rootRef: RefObject<HTMLDivElement | null>, mqQuery: string, lenis: boolean) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let cleanup: Cleanup | null = null
    const mq = matchMedia(mqQuery)
    const boot = () => {
      if (!mq.matches || cleanup) return
      const reduce = prefersReduce()
      if (!reduce) root.classList.add('anim')
      root.querySelectorAll<HTMLElement>('[data-bs3d]').forEach((el) => mountBussola3D(el))
      const fns: Cleanup[] = [setupReveal(root, { reduce, threshold: 0.15, rootMargin: '0px 0px -40px 0px' })]
      const cv = root.querySelector<HTMLCanvasElement>('.aurora-fix canvas')
      if (cv) fns.push(initAurora(cv, { reduce }))
      if (lenis && !reduce) {
        document.documentElement.classList.add('lenis')
        const l = new Lenis({ lerp: 0.16, wheelMultiplier: 1.05 })
        ;(window as unknown as { _lenis?: Lenis })._lenis = l
        let raf = 0
        const loop = (t: number) => { l.raf(t); raf = requestAnimationFrame(loop) }
        raf = requestAnimationFrame(loop)
        fns.push(() => {
          cancelAnimationFrame(raf)
          l.destroy()
          delete (window as unknown as { _lenis?: Lenis })._lenis
          document.documentElement.classList.remove('lenis')
        })
      }
      cleanup = () => fns.forEach((fn) => fn())
    }
    boot()
    mq.addEventListener('change', boot)
    return () => { mq.removeEventListener('change', boot); cleanup?.() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

function PricingDesktop() {
  const root = useRef<HTMLDivElement>(null)
  const [anual, setAnual] = useState(false)
  useTreeInit(root, '(min-width:1024px)', true)

  const c = 15
  return (
    <div className={'pv pv-d' + (anual ? ' anual-on' : '')} ref={root}>
      <div className="aurora-fix" aria-hidden="true"><canvas /></div>

      <div className="navwrap">
        <nav>
          <Link className="brand" href="/"><BsMark /><span className="wm">Sync<em>Life</em></span></Link>
          <div className="nav-links">
            <Link href="/#produto">Produto</Link>
            <a href="#" className="on">Preços</a>
            <Link href="/#manifesto">Manifesto</Link>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-cta">
            <Link className="entrar" href="/login">Entrar</Link>
            <Link className="btn btn-roxo" href="/cadastro">Começar grátis</Link>
          </div>
        </nav>
        <div className="ticker" aria-hidden="true"><TickerTk /></div>
      </div>

      <header className="phero">
        <div className="wrap">
          <p className="eyebrow boot b1"><b>Preços</b> · sem pegadinha</p>
          <h1 className="boot b2">Um preço simples<br />pra <em>uma vida inteira.</em></h1>
          <p className="sub boot b3">Comece grátis hoje. Assine o PRO quando o consultor começar a trabalhar por você.</p>
          <Bill anual={anual} setAnual={setAnual} id="pvd" />
        </div>
      </header>

      <section className="precos" id="planos">
        <div className="wrap">
          <PCards check={c} />
          <span className="hand hand-precos rv">cancela quando quiser, sem drama</span>
        </div>
      </section>

      <section className="cmp">
        <div className="wrap">
          <div className="head rv">
            <p className="eyebrow"><b>Compare</b> · linha a linha</p>
            <h2>Tudo que vem em cada plano.</h2>
            <p className="csub">Sem asterisco escondido: o que está aqui é o que existe.</p>
          </div>
          <div className="ctable rv">
            <div className="crow chead"><span /><span className="pl num">Free</span><span className="pl pro num">PRO</span></div>

            <div className="cgroup"><p className="eyebrow"><b>01</b> · O essencial</p></div>
            <div className="crow"><span className="ft">Áreas da vida</span><span className="vv num">Todas as 8</span><span className="vv pro num">Todas as 8</span></div>
            <div className="crow"><span className="ft">Life Sync Score<span className="fd">as 8 áreas num número só, todo dia</span></span><span className="vv">{OK(c)}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Transações</span><span className="vv num">50 por mês</span><span className="vv pro">Ilimitadas</span></div>
            <div className="crow"><span className="ft">Dispositivos</span><span className="vv num">1</span><span className="vv pro">Ilimitados</span></div>
            <div className="crow"><span className="ft">Web e mobile</span><span className="vv">{OK(c)}</span><span className="vv pro">{OK(c)}</span></div>

            <div className="cgroup"><p className="eyebrow"><b>02</b> · Inteligência</p></div>
            <div className="crow"><span className="ft">Briefing diário do coach<span className="fd">o seu dia chega lido, às 07:12</span></span><span className="vv">{OK(c)}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Consultor que executa por você<span className="fd">agenda o aporte, remarca o treino, protege o foco</span></span><span className="vv">{NO}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Cardápio e planos gerados por IA</span><span className="vv">{NO}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Relatórios completos em PDF</span><span className="vv">{NO}</span><span className="vv pro">{OK(c)}</span></div>

            <div className="cgroup"><p className="eyebrow"><b>03</b> · Conexões</p></div>
            <div className="crow"><span className="ft">Google Calendar bidirecional</span><span className="vv">{NO}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Notificações inteligentes</span><span className="vv">{OK(c)}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Exportar seus dados<span className="fd">tudo é seu; leva quando quiser</span></span><span className="vv">{OK(c)}</span><span className="vv pro">{OK(c)}</span></div>

            <div className="cgroup"><p className="eyebrow"><b>04</b> · Cuidado</p></div>
            <div className="crow"><span className="ft">Criptografia e LGPD</span><span className="vv">{OK(c)}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Suporte</span><span className="vv">E-mail</span><span className="vv pro">Prioritário</span></div>
          </div>
        </div>
      </section>

      <section className="faqsec" id="faq">
        <div className="wrap faq-grid">
          <div className="rv">
            <h2>Perguntas comuns</h2>
            <p className="fsub">O que todo mundo pergunta antes de assinar.</p>
          </div>
          <Faq />
        </div>
      </section>

      <section className="final dk rv">
        <div className="wrap">
          <h2>Comece grátis.<br /><em>O resto é consequência.</em></h2>
          <p>14 dias de PRO no primeiro acesso. Sem cartão de crédito, sem multa pra sair.</p>
          <Link className="btn btn-roxo" href="/cadastro" style={{ padding: '17px 32px', fontSize: 15 }}>
            Criar conta grátis<IconArrowR size={15} />
          </Link>
        </div>
      </section>

      <footer className="dk">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <span className="brand"><BsMark /><span className="wm">Sync<em>Life</em></span></span>
              <p className="foot-tag">Sua vida inteira, organizada em um só lugar.<br />Feito no Brasil, com cuidado.</p>
            </div>
            <div className="foot-col"><h5>Produto</h5><Link href="/#produto">Recursos</Link><a href="#">Preços</a><a href="#">Roadmap</a><a href="#">Mudanças</a></div>
            <div className="foot-col"><h5>Empresa</h5><a href="#">Sobre</a><Link href="/#manifesto">Manifesto</Link><a href="#">Carreiras</a><a href="#">Blog</a></div>
            <div className="foot-col"><h5>Suporte</h5><a href="#">Central de ajuda</a><a href="#">Contato</a><a href="#">Status</a><a href="#">API</a></div>
            <div className="foot-col"><h5>Legal</h5><a href="#">Privacidade</a><a href="#">Termos</a><a href="#">Cookies</a><a href="#">LGPD</a></div>
          </div>
          <div className="foot-base">
            <span>© 2026 SyncLife. Todos os direitos reservados.</span>
            <span>v0.9.4 · São Paulo, Brasil</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PricingMobile() {
  const root = useRef<HTMLDivElement>(null)
  const [anual, setAnual] = useState(false)
  useTreeInit(root, '(max-width:1023px)', false)

  const c = 14
  return (
    <div className={'pv pv-m' + (anual ? ' anual-on' : '')} ref={root}>
      <div className="aurora-fix" aria-hidden="true"><canvas /></div>

      <div className="navwrap">
        <nav>
          <Link className="brand" href="/"><BsMark /><span className="wm">Sync<em>Life</em></span></Link>
          <Link className="btn btn-roxo" href="/cadastro">Começar grátis</Link>
        </nav>
        <div className="ticker" aria-hidden="true"><TickerTk /></div>
      </div>

      <header className="phero">
        <div className="wrap">
          <p className="eyebrow boot b1"><b>Preços</b> · sem pegadinha</p>
          <h1 className="boot b2">Um preço simples pra <em>uma vida inteira.</em></h1>
          <p className="sub boot b3">Comece grátis hoje. Assine o PRO quando o consultor começar a trabalhar por você.</p>
          <Bill anual={anual} setAnual={setAnual} id="pvm" />
        </div>
      </header>

      <section className="precos" id="planos-m">
        <div className="wrap">
          <PCards check={c} />
          <span className="hand hand-precos rv">cancela quando quiser, sem drama</span>
        </div>
      </section>

      <section className="cmp">
        <div className="wrap">
          <div className="head rv">
            <p className="eyebrow"><b>Compare</b> · linha a linha</p>
            <h2>Tudo que vem em cada plano.</h2>
            <p className="csub">Sem asterisco escondido.</p>
          </div>
          <div className="rv">
            <div className="crow chead"><span /><span className="pl num">Free</span><span className="pl pro num">PRO</span></div>

            <div className="cgroup"><p className="eyebrow"><b>01</b> · O essencial</p></div>
            <div className="crow"><span className="ft">Áreas da vida</span><span className="vv num">8</span><span className="vv pro num">8</span></div>
            <div className="crow"><span className="ft">Life Sync Score</span><span className="vv">{OK(c)}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Transações</span><span className="vv num">50/mês</span><span className="vv pro">Sem limite</span></div>
            <div className="crow"><span className="ft">Dispositivos</span><span className="vv num">1</span><span className="vv pro">Sem limite</span></div>

            <div className="cgroup"><p className="eyebrow"><b>02</b> · Inteligência</p></div>
            <div className="crow"><span className="ft">Briefing diário do coach</span><span className="vv">{OK(c)}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Consultor que executa</span><span className="vv">{NO}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Cardápio e planos por IA</span><span className="vv">{NO}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Relatórios em PDF</span><span className="vv">{NO}</span><span className="vv pro">{OK(c)}</span></div>

            <div className="cgroup"><p className="eyebrow"><b>03</b> · Conexões e cuidado</p></div>
            <div className="crow"><span className="ft">Google Calendar</span><span className="vv">{NO}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Exportar seus dados</span><span className="vv">{OK(c)}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Criptografia e LGPD</span><span className="vv">{OK(c)}</span><span className="vv pro">{OK(c)}</span></div>
            <div className="crow"><span className="ft">Suporte</span><span className="vv">E-mail</span><span className="vv pro">Prioritário</span></div>
          </div>
        </div>
      </section>

      <section className="faqsec" id="faq-m">
        <div className="wrap">
          <div className="rv">
            <h2>Perguntas comuns</h2>
            <p className="fsub">O que todo mundo pergunta antes de assinar.</p>
          </div>
          <Faq compact />
        </div>
      </section>

      <section className="final dk rv">
        <div className="wrap">
          <h2>Comece grátis.<br /><em>O resto é consequência.</em></h2>
          <p>14 dias de PRO no primeiro acesso. Sem cartão, sem multa pra sair.</p>
          <Link className="btn btn-roxo" href="/cadastro" style={{ padding: '15px 28px', fontSize: 14 }}>
            Criar conta grátis<IconArrowR size={14} />
          </Link>
        </div>
      </section>

      <footer className="dk">
        <div className="wrap">
          <span className="brand"><BsMark /><span className="wm">Sync<em>Life</em></span></span>
          <p className="foot-tag">Sua vida inteira, organizada em um só lugar. Feito no Brasil, com cuidado.</p>
          <div className="foot-cols">
            <div className="foot-col"><h5>Produto</h5><Link href="/#produto">Recursos</Link><a href="#">Preços</a><a href="#">Roadmap</a></div>
            <div className="foot-col"><h5>Empresa</h5><a href="#">Sobre</a><a href="#">Carreiras</a><a href="#">Blog</a></div>
            <div className="foot-col"><h5>Legal</h5><a href="#">Privacidade</a><a href="#">Termos</a><a href="#">LGPD</a></div>
          </div>
          <div className="foot-base">
            <span>© 2026 SyncLife. Todos os direitos reservados.</span>
            <span>v0.9.4 · São Paulo, Brasil</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function PricingV5() {
  useEffect(() => {
    document.documentElement.classList.add('v5-scroll')
    return () => { document.documentElement.classList.remove('v5-scroll') }
  }, [])

  return (
    <div className="v5">
      <div className="grain" aria-hidden="true" />
      <PricingDesktop />
      <PricingMobile />
    </div>
  )
}
