'use client'

// Landing VIVA · mobile dedicado — porte 1:1 de landing-viva.mobile.html (m1 APROVADO).
// Não é breakpoint: hierarquia própria (390×844). A árvore só inicializa quando visível
// (<1024px); escondida, fica estática completa (E-02). Scroll nativo (sem Lenis).
// Coreografia em scrub SEM pin, gatilho no próprio elemento: produto = voo com encaixe ·
// IA = pop de mensageiro. Bússola WebGL DPR 1 com fallback CSS.

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { mountBussola3D } from '@/lib/v5/bussola-3d'
import { initCompassGL, type CompassGL } from '@/lib/v5/compass-gl'
import {
  prefersReduce, setupReveal, initStrip, initAreas8, initAurora,
  observeOdometros, loadDisplayFonts, type Cleanup,
} from '@/lib/v5/viva'
import {
  ArrowR, BsMark, TickerText, HeroH1, HeroProof, StripCards, Areas8Rows, Areas8Meta,
  ProdHead, ProdStage, MqTrack, IaHead, IaFeats, IaChat, PricingCards, FaqList,
} from './content'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)

function init(root: HTMLElement): Cleanup {
  const reduce = prefersReduce()
  const cleanups: Cleanup[] = []
  let dead = false

  root.querySelectorAll<HTMLElement>('[data-bs3d]').forEach((el) => mountBussola3D(el))

  if (!reduce) root.classList.add('anim')
  cleanups.push(setupReveal(root, { reduce, threshold: 0.12, rootMargin: '0px 0px -30px 0px' }))
  // (sem Lenis no mobile: o scroll nativo com momentum do device já tem o peso certo)

  const strip = root.querySelector<HTMLElement>('.strip')
  if (strip) cleanups.push(initStrip(strip, { reduce, drag: 0.042, spc: 52, tilt: false }))

  const glRef: { current: CompassGL | null } = { current: null }
  cleanups.push(initAreas8(root, { reduce, iconSize: 46, hover: false, onSelect: (i) => glRef.current?.set(i) }))

  const aurora = root.querySelector<HTMLCanvasElement>('.aurora-fix canvas')
  if (aurora) cleanups.push(initAurora(aurora, { reduce }))
  cleanups.push(observeOdometros(root, { reduce }))

  // bússola cromo em three.js: DPR 1 no mobile (orçamento §5.6); catch mantém o CSS
  const glCv = root.querySelector<HTMLCanvasElement>('.a8-gl')
  const stage = root.querySelector<HTMLElement>('.a8-stage')
  if (glCv && stage) {
    initCompassGL(glCv, { size: 220, dpr: 1, reduce })
      .then((gl) => {
        if (dead) { gl.dispose(); return }
        glRef.current = gl
        gl.set(0)
        stage.classList.add('gl-on')
        cleanups.push(() => gl.dispose())
      })
      .catch((err) => { console.warn('WebGL indisponível; a bússola segue no fallback CSS.', err) })
  }

  // COREOGRAFIA (scroll nativo): identidade da r15 adaptada pro toque. Sem pin;
  // gatilho SEMPRE no próprio elemento (nada anima fora da tela).
  if (!reduce) {
    if (!CustomEase.get('sl')) CustomEase.create('sl', '.625,.05,0,1') // easing assinatura (E-01)

    const ctx = gsap.context(() => {
      root.querySelectorAll('.prod .rv, .ia .rv').forEach((el) => el.classList.remove('rv'))

      // — produto: cabeçalho na aproximação; cada peça voa e ENCAIXA na própria travessia
      gsap.from('.prod-head > *', {
        y: 34, opacity: 0, stagger: 0.09, duration: 0.7, ease: 'sl',
        scrollTrigger: { trigger: '.prod-head', start: 'top 88%', once: true },
      })
      const VOO: Record<string, [number, number]> = {
        'pc-score': [-64, -6], 'pc-brief': [72, 7], 'pc-orc': [-72, 6], 'pc-agenda': [72, -7], 'pc-meta': [0, 4],
      }
      root.querySelectorAll<HTMLElement>('.prod-stage .pc').forEach((pc) => {
        let v: [number, number] = [0, 0]
        Object.keys(VOO).forEach((k) => { if (pc.classList.contains(k)) v = VOO[k] })
        gsap.from(pc, {
          x: v[0], y: 64, rotation: v[1], scale: 0.82, opacity: 0, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: pc, start: 'top 97%', end: 'top 58%', scrub: true },
        })
      })

      // — IA: manchete e feats na aproximação; cada mensagem chega com pop de mensageiro
      gsap.from('.ia .head > *', {
        y: 30, opacity: 0, stagger: 0.09, duration: 0.6, ease: 'sl',
        scrollTrigger: { trigger: '.ia .head', start: 'top 88%', once: true },
      })
      gsap.from('.ia-feat', {
        y: 24, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'sl',
        scrollTrigger: { trigger: '.ia-feats', start: 'top 88%', once: true },
      })
      Array.from(root.querySelectorAll<HTMLElement>('[data-iachat] > *')).forEach((m) => {
        const st = { trigger: m, start: 'top 96%', end: 'top 60%', scrub: true }
        if (m.classList.contains('acao')) {
          // o selo CARIMBA (vem grande, assenta) + check se desenha
          const tlA = gsap.timeline({ scrollTrigger: st })
          tlA.from(m, { scale: 1.5, rotation: -5, opacity: 0, duration: 0.45, ease: 'back.out(1.8)', transformOrigin: '30% 50%' })
          tlA.fromTo('.acao .ck', { strokeDashoffset: 20 }, { strokeDashoffset: 0, duration: 0.3, ease: 'none' }, '>-.1')
        } else if (m.classList.contains('chat-input')) {
          gsap.from(m, { y: 26, opacity: 0, ease: 'sl', scrollTrigger: st })
        } else {
          const user = m.classList.contains('u')
          gsap.from(m, {
            scale: 0.55, x: user ? 38 : -38, y: 12, opacity: 0, ease: 'back.out(1.7)',
            transformOrigin: user ? '100% 100%' : '0% 100%', scrollTrigger: st,
          })
        }
      })

      // o wordmark sobe pra fechar a página (Jeton)
      gsap.from('.final .wordmark', {
        yPercent: 30, ease: 'none',
        scrollTrigger: { trigger: '.final', start: 'top 80%', end: 'bottom bottom', scrub: true },
      })

      // cascatas: as 8 áreas e os cartões de preço
      gsap.from('.a8-row', {
        y: 24, opacity: 0, duration: 0.7, ease: 'sl', stagger: 0.06,
        scrollTrigger: { trigger: '.a8-list', start: 'top 84%', once: true },
      })
      gsap.from('.pcard', {
        y: 50, opacity: 0, duration: 0.7, ease: 'sl', stagger: 0.12,
        scrollTrigger: { trigger: '.pcards', start: 'top 82%', once: true },
      })

      // o ticker entorta com a velocidade do scroll (e assenta quando você para)
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

    // manchetes: palavras sobem de máscara (split só com as fontes DE VERDADE — fix m1)
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

export function LandingVivaMobile() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mq = matchMedia('(min-width:1024px)')
    let inited = false
    let cleanup: Cleanup | null = null
    const tryInit = () => { if (!inited && !mq.matches) { inited = true; cleanup = init(root) } }
    tryInit()
    mq.addEventListener('change', tryInit)
    return () => { mq.removeEventListener('change', tryInit); cleanup?.() }
  }, [])

  return (
    <div className="lv-m" ref={rootRef}>
      <div className="aurora-fix" aria-hidden="true"><canvas /></div>

      <div className="navwrap">
        <nav>
          <a className="brand" href="#"><BsMark sz={21} /><span className="wm">Sync<em>Life</em></span></a>
          <a className="btn btn-roxo" href="/cadastro">Começar grátis</a>
        </nav>
        <div className="ticker" aria-hidden="true"><TickerText repeats={3} /></div>
      </div>

      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <span className="pill-novo boot b1"><span className="dot" />Novo · Coach IA em todos os planos</span>
          <HeroH1 />
          <p className="hero-sub boot b4">Finanças, saúde, rotina, carreira e mente. Todas as áreas da sua vida em um só lugar. <span className="hl">Sem planilhas. Sem 8 apps abertos. Sem ansiedade.</span></p>
          <div className="hero-ctas boot b5">
            <a className="btn btn-roxo" href="/cadastro">Começar grátis<ArrowR size={14} /></a>
            <a className="btn btn-ghost" href="#produto-m">Ver demonstração</a>
          </div>
          <HeroProof m />

          <div className="strip-head boot b5">
            <p className="eyebrow"><b>Oito áreas</b> · uma interface</p>
            <span className="drag-cue">Arraste
              <ArrowR size={13} sw={2.2} />
            </span>
          </div>
        </div>
        <div className="strip boot b5" tabIndex={0} aria-label="As oito áreas do SyncLife em uso, faixa com rolagem horizontal; a régua abaixo sintoniza cada área no centro">
          <StripCards m />
        </div>
      </header>

      {/* AS OITO ÁREAS: o índice da sua vida. A lista conversa só com a bússola. */}
      <section className="areas8" id="areas-m">
        <div className="wrap">
          <div className="rv">
            <p className="eyebrow"><b>As oito áreas</b> · o índice da sua vida</p>
            <h2>Cada área tem um rumo. A bússola mostra qual pede você hoje.</h2>
          </div>
          <div className="a8-left rv">
            <div className="a8-stage">
              <div className="bs d3 a8-bs" data-bs3d style={{ '--sz': '150px' } as React.CSSProperties} role="img" aria-label="A Bússola da Vida apontando a área selecionada" />
              <canvas className="a8-gl" width={220} height={220} aria-hidden="true" />
            </div>
            <Areas8Meta />
            <span className="hand rx" style={{ transform: 'rotate(-2deg)' }}>toque na lista: a agulha acompanha</span>
          </div>
          <div className="a8-list rv">
            <Areas8Rows m />
          </div>
        </div>
      </section>

      {/* prova social */}
      <section className="press rv">
        <div className="wrap">
          <p>Mais de 24.000 brasileiros já organizam a vida com SyncLife</p>
          <div className="press-logos">
            <span>Folha de SP</span><span>Exame</span><span>Forbes BR</span><span>O Globo</span>
          </div>
        </div>
      </section>

      {/* O PRODUTO: as peças do painel voam e encaixam na travessia (voo com encaixe) */}
      <section className="prod" id="produto-m">
        <div className="wrap">
          <ProdHead />
          <ProdStage />
        </div>
      </section>

      {/* ticker do índice da vida */}
      <div className="mq" aria-hidden="true">
        <MqTrack repeats={3} />
      </div>

      {/* IA: banda roxa sólida; a conversa chega com pop de mensageiro na travessia */}
      <section className="ia" id="manifesto-m">
        <div className="wrap">
          <IaHead />
          <div className="ia-grid">
            <IaFeats />
            <IaChat />
          </div>
        </div>
      </section>

      {/* PRICING: os dois cartões da r15, empilhados */}
      <section className="precos" id="precos-m">
        <div className="wrap">
          <div className="head rv">
            <p className="eyebrow"><b>Preços</b> · sem pegadinha</p>
            <h2>Comece grátis. Evolua quando quiser.</h2>
            <p className="sub">Sem cartão pra começar, sem multa pra sair.</p>
          </div>
          <PricingCards />
          <p className="hand rv" style={{ textAlign: 'right', margin: '14px 0 0', transform: 'rotate(-1.6deg)' }}>cancela quando quiser, sem drama</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="faqsec" id="faq-m">
        <div className="wrap">
          <div className="rv">
            <h2>Perguntas comuns</h2>
            <p className="fsub">O que todo mundo pergunta antes de criar a conta.</p>
          </div>
          <FaqList chevron={15} />
        </div>
      </section>

      {/* CTA final + wordmark gigante */}
      <section className="final dk rv">
        <div className="wrap">
          <h2>A vida em sincronia<br /><em>começa hoje.</em></h2>
          <p>14 dias grátis no PRO. Sem cartão de crédito. Cancele a qualquer momento.</p>
          <a className="btn btn-roxo" href="/cadastro" style={{ padding: '15px 28px', fontSize: 14.5 }}>Começar agora<ArrowR size={15} /></a>
        </div>
        <span className="wordmark" aria-hidden="true">Sync<em>Life</em></span>
      </section>

      <footer className="dk">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <span className="brand"><BsMark sz={21} /><span className="wm">Sync<em>Life</em></span></span>
              <p className="foot-tag">Sua vida inteira, organizada em um só lugar. Feito no Brasil, com cuidado.</p>
            </div>
            <div className="foot-cols">
              <div className="foot-col"><h5>Produto</h5><a href="#">Recursos</a><a href="#precos-m">Preços</a><a href="#">Roadmap</a></div>
              <div className="foot-col"><h5>Empresa</h5><a href="#">Sobre</a><a href="#manifesto-m">Manifesto</a><a href="#">Blog</a></div>
              <div className="foot-col"><h5>Legal</h5><a href="#">Privacidade</a><a href="#">Termos</a><a href="#">LGPD</a></div>
            </div>
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
