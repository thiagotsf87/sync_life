'use client'

// Landing VIVA · desktop — porte 1:1 de prototypes/v5/landing/landing-viva.html (r15 APROVADA).
// A árvore só INICIALIZA quando visível (>=1024px); escondida, fica estática completa (E-02).
// Coreografia: palcos sem pin, scrub na travessia (produto = voo com encaixe · IA = pop de
// mensageiro), aurora global, arco com régua, bússola WebGL com fallback CSS, Lenis no scroll.

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import Lenis from 'lenis'
import { mountBussola3D } from '@/lib/v5/bussola-3d'
import { initCompassGL, type CompassGL } from '@/lib/v5/compass-gl'
import {
  prefersReduce, setupReveal, initStrip, initAreas8, initAurora,
  observeOdometros, loadDisplayFonts, initMagnetic, type Cleanup,
} from '@/lib/v5/viva'
import {
  ArrowR, BsMark, TickerText, HeroH1, HeroProof, StripCards, Areas8Rows, Areas8Meta,
  ProdHead, ProdStage, MqTrack, IaHead, IaFeats, IaChat, PricingCards, FaqList,
} from './content'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)

declare global {
  interface Window { _lenis?: Lenis }
}

function init(root: HTMLElement): Cleanup {
  const reduce = prefersReduce()
  const cleanups: Cleanup[] = []
  let dead = false

  // marca 3D: monta todas as bússolas da árvore (nav, footer, seção das áreas)
  root.querySelectorAll<HTMLElement>('[data-bs3d]').forEach((el) => mountBussola3D(el))

  if (!reduce) root.classList.add('anim')
  cleanups.push(setupReveal(root, { reduce, threshold: 0.15, rootMargin: '0px 0px -40px 0px' }))

  // scroll com peso (Lenis; html.lenis desliga o scroll-behavior:smooth do CSS)
  let lenis: Lenis | null = null
  if (!reduce) {
    document.documentElement.classList.add('lenis')
    lenis = new Lenis({ lerp: 0.16, wheelMultiplier: 1.05 })
    window._lenis = lenis // exposto p/ QA (scrollTo immediate)
    let raf = 0
    const loop = (t: number) => { lenis?.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    cleanups.push(() => {
      cancelAnimationFrame(raf)
      lenis?.destroy()
      delete window._lenis
      document.documentElement.classList.remove('lenis')
    })
  }

  const strip = root.querySelector<HTMLElement>('.strip')
  if (strip) cleanups.push(initStrip(strip, { reduce, drag: 0.033, spc: 64, tilt: true }))

  const glRef: { current: CompassGL | null } = { current: null }
  cleanups.push(initAreas8(root, { reduce, iconSize: 56, hover: true, onSelect: (i) => glRef.current?.set(i) }))

  const aurora = root.querySelector<HTMLCanvasElement>('.aurora-fix canvas')
  if (aurora) cleanups.push(initAurora(aurora, { reduce }))
  cleanups.push(observeOdometros(root, { reduce }))
  cleanups.push(initMagnetic(root, { reduce }))

  // O OBJETO: bússola cromo em three.js; se WebGL/import falhar, fica o CSS (DS §5.6)
  const glCv = root.querySelector<HTMLCanvasElement>('.a8-gl')
  const stage = root.querySelector<HTMLElement>('.a8-stage')
  if (glCv && stage) {
    initCompassGL(glCv, { size: 300, dpr: Math.min(2, devicePixelRatio || 1), reduce })
      .then((gl) => {
        if (dead) { gl.dispose(); return }
        glRef.current = gl
        gl.set(0)
        stage.classList.add('gl-on') // WebGL ok: o CSS sai, o objeto entra
        cleanups.push(() => gl.dispose())
      })
      .catch((err) => { console.warn('WebGL indisponível; a bússola segue no fallback CSS.', err) })
  }

  // TRANSIÇÕES (GSAP + ScrollTrigger): dirigidas pelo scroll, sem pin (r13).
  if (!reduce) {
    if (!CustomEase.get('sl')) CustomEase.create('sl', '.625,.05,0,1') // easing assinatura (E-01)
    if (lenis) lenis.on('scroll', ScrollTrigger.update)

    const ctx = gsap.context(() => {
      // nos palcos o GSAP é o único condutor: o .rv sai pra não disputar a opacidade
      root.querySelectorAll('.prod .rv, .ia .rv').forEach((el) => el.classList.remove('rv'))

      // — produto: cabeçalho na aproximação, peças voando durante a travessia.
      //   Gatilhos no PRÓPRIO elemento: nada anima antes de estar de fato na tela (r14)
      gsap.from('.prod-head > *', {
        y: 40, opacity: 0, stagger: 0.09, duration: 0.7, ease: 'sl',
        scrollTrigger: { trigger: '.prod-head', start: 'top 88%', once: true },
      })
      const tlP = gsap.timeline({
        scrollTrigger: { trigger: '.prod-stage', start: 'top 92%', end: 'top 22%', scrub: true },
      })
      ;([
        ['.pc-score', -180, -90, -8], ['.pc-brief', 200, -110, 7],
        ['.pc-orc', -240, 110, 7], ['.pc-agenda', 260, 80, -8], ['.pc-meta', 0, 220, 4],
      ] as const).forEach((p, i) => {
        tlP.from(p[0], { x: p[1], y: p[2], rotation: p[3], scale: 0.78, opacity: 0, duration: 0.62, ease: 'back.out(1.5)' }, i * 0.3)
      })

      // — IA: manchete e feats na aproximação, mensagens chegando durante a travessia
      gsap.from('.ia .head > *', {
        y: 36, opacity: 0, stagger: 0.09, duration: 0.6, ease: 'sl',
        scrollTrigger: { trigger: '.ia .head', start: 'top 88%', once: true },
      })
      gsap.from('.ia-feat', {
        y: 26, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'sl',
        scrollTrigger: { trigger: '.ia-feats', start: 'top 88%', once: true },
      })
      const tlI = gsap.timeline({
        scrollTrigger: { trigger: '[data-iachat]', start: 'top 92%', end: 'top 18%', scrub: true },
      })
      Array.from(root.querySelectorAll('[data-iachat] > *')).forEach((m, i) => {
        if (m.classList.contains('acao')) {
          // o selo CARIMBA (vem grande, assenta) + check se desenha
          tlI.from(m, { scale: 1.5, rotation: -5, opacity: 0, duration: 0.45, ease: 'back.out(1.8)', transformOrigin: '30% 50%' }, i * 0.3)
          tlI.fromTo('.acao .ck', { strokeDashoffset: 20 }, { strokeDashoffset: 0, duration: 0.3, ease: 'none' }, '>-.1')
        } else if (m.classList.contains('chat-input')) {
          tlI.from(m, { y: 30, opacity: 0, duration: 0.4, ease: 'sl' }, i * 0.3)
        } else {
          const user = m.classList.contains('u')
          tlI.from(m, {
            scale: 0.55, x: user ? 46 : -46, y: 14, opacity: 0, duration: 0.5, ease: 'back.out(1.7)',
            transformOrigin: user ? '100% 100%' : '0% 100%',
          }, i * 0.3)
        }
      })

      // o wordmark sobe pra fechar a página (Jeton)
      gsap.from('.final .wordmark', {
        yPercent: 34, ease: 'none',
        scrollTrigger: { trigger: '.final', start: 'top 75%', end: 'bottom bottom', scrub: true },
      })

      // cascatas: as 8 áreas e os cartões de preço
      gsap.from('.a8-row', {
        y: 26, opacity: 0, duration: 0.7, ease: 'sl', stagger: 0.06,
        scrollTrigger: { trigger: '.a8-list', start: 'top 84%', once: true },
      })
      gsap.from('.pcard', {
        y: 60, opacity: 0, duration: 0.7, ease: 'sl', stagger: 0.12,
        scrollTrigger: { trigger: '.pcards', start: 'top 80%', once: true },
      })

      // o marquee entorta com a velocidade do scroll (e assenta quando você para)
      const skewSetter = gsap.quickTo('.mq', 'skewX', { duration: 0.35, ease: 'power3' })
      ScrollTrigger.create({
        onUpdate: (self) => { skewSetter(gsap.utils.clamp(-8, 8, self.getVelocity() / -110)) },
      })
      let skTo: ReturnType<typeof setTimeout>
      const onScroll = () => { clearTimeout(skTo); skTo = setTimeout(() => skewSetter(0), 140) }
      addEventListener('scroll', onScroll, { passive: true })
      cleanups.push(() => { removeEventListener('scroll', onScroll); clearTimeout(skTo) })
    }, root)
    cleanups.push(() => ctx.revert())

    // manchetes: palavras sobem de máscara, linha a linha — split só com as fontes DE VERDADE
    const sample = root.querySelector('.areas8 h2')
    if (sample) {
      loadDisplayFonts(sample).then(() => {
        if (dead) return
        ctx.add(() => {
          root.querySelectorAll('.areas8 h2, .precos h2').forEach((h) => {
            const split = new SplitText(h, { type: 'lines,words', linesClass: 'sl-line' })
            gsap.from(split.words, {
              yPercent: 115, duration: 0.9, ease: 'sl', stagger: 0.035,
              scrollTrigger: { trigger: h, start: 'top 86%', once: true },
            })
          })
        })
      })
    }
  }

  return () => { dead = true; cleanups.forEach((fn) => fn()) }
}

export function LandingVivaDesktop() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mq = matchMedia('(min-width:1024px)')
    let inited = false
    let cleanup: Cleanup | null = null
    const tryInit = () => { if (!inited && mq.matches) { inited = true; cleanup = init(root) } }
    tryInit()
    mq.addEventListener('change', tryInit)
    return () => { mq.removeEventListener('change', tryInit); cleanup?.() }
  }, [])

  return (
    <div className="lv-d" ref={rootRef}>
      <div className="aurora-fix" aria-hidden="true"><canvas /></div>

      <div className="navwrap">
        <nav>
          <a className="brand" href="#"><BsMark sz={22} />Sync<em>Life</em></a>
          <div className="nav-links">
            <a href="#produto">Produto</a>
            <a href="#precos">Preços</a>
            <a href="#manifesto">Manifesto</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-cta">
            <a className="entrar" href="/login">Entrar</a>
            <a className="btn btn-roxo" href="/cadastro">Começar grátis</a>
          </div>
        </nav>
        <div className="ticker" aria-hidden="true"><TickerText repeats={4} /></div>
      </div>

      {/* HERO: manchete de dobra inteira, sem mockup */}
      <header className="hero">
        <div className="wrap">
          <span className="pill-novo boot b1"><span className="dot" />Novo · Coach IA em todos os planos</span>
          <HeroH1 />
          <div className="hero-foot">
            <p className="hero-sub boot b4">Finanças, saúde, rotina, carreira e mente. Todas as áreas da sua vida em um só lugar. <span className="hl">Sem planilhas. Sem 8 apps abertos. Sem ansiedade.</span></p>
            <div className="hero-right boot b5">
              <div className="hero-ctas">
                <a className="btn btn-roxo" href="/cadastro">Começar grátis<ArrowR size={14} /></a>
                <a className="btn btn-ghost" href="#produto">Ver demonstração</a>
              </div>
              <HeroProof />
            </div>
          </div>

          <div className="strip-head boot b5">
            <p className="eyebrow"><b>Oito áreas</b> · uma única interface</p>
            <span className="drag-cue">Arraste
              <ArrowR size={14} sw={2.2} />
            </span>
          </div>
        </div>
        <div className="strip boot b5" tabIndex={0} aria-label="As oito áreas do SyncLife em uso, faixa com rolagem horizontal; a régua abaixo sintoniza cada área no centro">
          <StripCards />
        </div>
      </header>

      {/* AS OITO ÁREAS: o índice da sua vida. A lista conversa só com a bússola. */}
      <section className="areas8" id="areas">
        <div className="wrap">
          <div className="rv">
            <p className="eyebrow"><b>As oito áreas</b> · o índice da sua vida</p>
            <h2>Cada área tem um rumo. A bússola mostra qual pede você hoje.</h2>
          </div>
          <div className="a8-grid">
            <div className="a8-left rv">
              <div className="a8-stage">
                <div className="bs d3 a8-bs" data-bs3d style={{ '--sz': '200px' } as React.CSSProperties} role="img" aria-label="A Bússola da Vida apontando a área selecionada" />
                <canvas className="a8-gl" width={300} height={300} aria-hidden="true" />
              </div>
              <Areas8Meta />
              <div className="draw rv" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg className="hand-arrow" width="42" height="24" viewBox="0 0 42 24" aria-hidden="true" style={{ color: 'var(--roxo)' }}><path d="M2 20 C14 4, 27 2, 39 9 M33 3 L39 9 L32 13" /></svg>
                <span className="hand rx" style={{ transform: 'rotate(-2deg)' }}>role a lista: a agulha acompanha</span>
              </div>
            </div>
            <div className="a8-list rv">
              <Areas8Rows />
            </div>
          </div>
        </div>
      </section>

      {/* prova social */}
      <section className="press rv">
        <div className="wrap">
          <p>Mais de 24.000 brasileiros já organizam a vida com SyncLife</p>
          <div className="press-logos">
            <span>Folha de SP</span><span>Exame</span><span>Pequenas Empresas</span><span>Forbes BR</span><span>O Globo</span>
          </div>
        </div>
      </section>

      {/* O PRODUTO: a tela se transforma na travessia — o painel se monta peça a peça */}
      <section className="prod" id="produto">
        <div className="wrap prod-wrap">
          <ProdHead />
          <ProdStage />
        </div>
      </section>

      {/* ticker do índice da vida — os mesmos scores/deltas da lista das 8 áreas */}
      <div className="mq" aria-hidden="true">
        <MqTrack repeats={4} />
      </div>

      {/* IA: banda roxa sólida, a conversa avança com o scroll */}
      <section className="ia" id="manifesto">
        <div className="wrap">
          <IaHead />
          <div className="ia-grid">
            <IaFeats />
            <IaChat />
          </div>
        </div>
      </section>

      {/* PRICING: dois cartões, decisão em cinco segundos */}
      <section className="precos" id="precos">
        <div className="wrap">
          <div className="head rv">
            <p className="eyebrow"><b>Preços</b> · sem pegadinha</p>
            <h2>Comece grátis. Evolua quando quiser.</h2>
            <p className="sub">Sem cartão pra começar, sem multa pra sair.</p>
          </div>
          <PricingCards />
          <p className="hand rv" style={{ textAlign: 'right', maxWidth: 860, margin: '16px auto 0', transform: 'rotate(-1.6deg)' }}>cancela quando quiser, sem drama</p>
        </div>
      </section>

      {/* FAQ: editorial em duas colunas */}
      <section className="faqsec" id="faq">
        <div className="wrap faq-grid">
          <div className="rv">
            <h2>Perguntas comuns</h2>
            <p className="fsub">O que todo mundo pergunta antes de criar a conta.</p>
          </div>
          <FaqList chevron={16} />
        </div>
      </section>

      {/* CTA final + wordmark gigante (Jeton) */}
      <section className="final dk rv">
        <div className="wrap">
          <h2>A vida em sincronia<br /><em>começa hoje.</em></h2>
          <p>14 dias grátis no PRO. Sem cartão de crédito. Cancele a qualquer momento.</p>
          <a className="btn btn-roxo" href="/cadastro" style={{ padding: '17px 32px', fontSize: 15 }}>Começar agora<ArrowR size={15} /></a>
        </div>
        <span className="wordmark" aria-hidden="true">Sync<em>Life</em></span>
      </section>

      <footer className="dk">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <span className="brand"><BsMark sz={22} />Sync<em>Life</em></span>
              <p className="foot-tag">Sua vida inteira, organizada em um só lugar.<br />Feito no Brasil, com cuidado.</p>
            </div>
            <div className="foot-col"><h5>Produto</h5><a href="#">Recursos</a><a href="#precos">Preços</a><a href="#">Roadmap</a><a href="#">Mudanças</a></div>
            <div className="foot-col"><h5>Empresa</h5><a href="#">Sobre</a><a href="#manifesto">Manifesto</a><a href="#">Carreiras</a><a href="#">Blog</a></div>
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
