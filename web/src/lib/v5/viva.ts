// Camadas vivas da landing v5 — porte dos scripts inline de
// prototypes/v5/landing/landing-viva{,.mobile}.html, com cleanup pra vida React.
// Cada init* retorna uma função de teardown (listeners, rAF, DOM criado).

import { controlBussola3D, areaIcon } from './bussola-3d'

export const prefersReduce = () =>
  typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

// solver da easing assinatura cubic-bezier(.625,.05,0,1) (E-01)
export function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  function comp(t: number, a: number, b: number) { const mt = 1 - t; return 3 * a * mt * mt * t + 3 * b * mt * t * t + t * t * t }
  function deriv(t: number, a: number, b: number) { const mt = 1 - t; return 3 * mt * mt * a + 6 * mt * t * (b - a) + 3 * t * t * (1 - b) }
  return function (x: number) {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 6; i++) {
      const err = comp(t, p1x, p2x) - x
      const d = deriv(t, p1x, p2x)
      if (Math.abs(err) < 1e-4 || Math.abs(d) < 1e-6) break
      t = Math.max(0, Math.min(1, t - err / d))
    }
    return comp(t, p1y, p2y)
  }
}

export type Cleanup = () => void

// ── reveals (.rv/.draw) + marca-texto do hero ──
export function setupReveal(root: HTMLElement, opts: { reduce: boolean; threshold?: number; rootMargin?: string }): Cleanup {
  if (opts.reduce) return () => {}
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      })
    },
    { threshold: opts.threshold ?? 0.12, rootMargin: opts.rootMargin ?? '0px 0px -30px 0px' }
  )
  root.querySelectorAll('.rv, .draw').forEach((el) => io.observe(el))
  const hl = root.querySelector('.hl')
  const t = setTimeout(() => { hl?.classList.add('on') }, 900)
  return () => { io.disconnect(); clearTimeout(t) }
}

// ── semicírculo das 8 áreas: drag com peso, inércia, detent + régua de sintonia ──
export function initStrip(strip: HTMLElement, opts: { reduce: boolean; drag: number; spc: number; tilt: boolean }): Cleanup {
  const reduce = opts.reduce
  const STEP = 7.5, MAX = 26.25, N = 8
  let off = 0, offCur = 0, sway = 0, vel = 0, down = false, moved = false, lastX = 0, lastT = 0, idleT = 0
  let tw: { from: number; to: number; t0: number; dur: number } | null = null
  let wasMoving = false
  let raf = 0
  const cleanups: Cleanup[] = []
  const ease = cubicBezier(0.625, 0.05, 0, 1)
  const fine = matchMedia('(pointer: fine)').matches
  const cards = Array.from(strip.querySelectorAll<HTMLElement>('.scard'))

  function angleOf(i: number) { return (i - 3.5) * STEP }
  function clampOff(v: number) { return Math.max(-MAX, Math.min(MAX, v)) }
  function render() {
    strip.style.setProperty('--off', (offCur + sway).toFixed(3) + 'deg')
    if (rtk) rtk.style.transform = 'translateX(' + ((offCur + sway) / STEP * SPC).toFixed(2) + 'px)'
  }
  function nearest() { return Math.max(0, Math.min(N - 1, Math.round(3.5 - off / STEP))) }
  function settle(i: number) { // assenta num detent (só o arco; a bússola não participa)
    mark(i)
    const to = clampOff(-angleOf(i))
    if (reduce) { off = offCur = to; tw = null; render(); return }
    tw = { from: off, to, t0: performance.now(), dur: Math.max(420, Math.min(1200, Math.abs(to - off) * 24)) }
    vel = 0; idleT = 0
  }
  function mark(i: number) { rnums.forEach((b, j) => b.classList.toggle('on', j === i)) }

  // tilt sutil em direção ao cursor (só desktop com ponteiro fino)
  if (opts.tilt && fine && !reduce) {
    cards.forEach((c) => {
      const scin = c.querySelector<HTMLElement>('.scin')
      if (!scin) return
      const leave = () => { scin.style.setProperty('--rx', '0deg'); scin.style.setProperty('--ry', '0deg') }
      const move = (e: MouseEvent) => {
        if (down) return
        const r = scin.getBoundingClientRect()
        const nx = (e.clientX - r.left) / r.width - 0.5
        const ny = (e.clientY - r.top) / r.height - 0.5
        scin.style.setProperty('--ry', (nx * 7).toFixed(2) + 'deg')
        scin.style.setProperty('--rx', (-ny * 6).toFixed(2) + 'deg')
      }
      c.addEventListener('pointerleave', leave)
      c.addEventListener('mousemove', move)
      cleanups.push(() => { c.removeEventListener('pointerleave', leave); c.removeEventListener('mousemove', move) })
    })
  }

  // régua de sintonia: a escala desliza sob o ponteiro fixo, como dial de rádio
  const SPC = opts.spc
  const rnums: HTMLElement[] = []
  const regua = document.createElement('div')
  regua.className = 'regua'
  const rtk = document.createElement('div')
  rtk.className = 'regua-tk'
  for (let q = -16; q <= 16; q++) { const tk = document.createElement('i'); tk.style.left = (q * SPC) / 4 + 'px'; rtk.appendChild(tk) }
  for (let ri = 0; ri < N; ri++) {
    const b = document.createElement('b')
    b.className = 'num'
    b.textContent = '0' + (ri + 1)
    b.style.left = (ri - 3.5) * SPC + 'px'
    b.addEventListener('click', () => settle(ri))
    rtk.appendChild(b)
    rnums.push(b)
  }
  const pon = document.createElement('span')
  pon.className = 'regua-ponteiro'
  regua.appendChild(rtk)
  regua.appendChild(pon)
  strip.appendChild(regua)
  cleanups.push(() => regua.remove())

  const onDown = (e: PointerEvent) => {
    down = true; moved = false; lastX = e.clientX; lastT = performance.now(); vel = 0; tw = null
    strip.classList.add('dragging')
  }
  const onMove = (e: PointerEvent) => {
    if (!down) return
    const dx = e.clientX - lastX
    lastX = e.clientX
    if (Math.abs(dx) > 3) moved = true
    off = clampOff(off + dx * opts.drag)
    const now = performance.now(), dt = now - lastT
    lastT = now
    if (dt > 0) vel = (dx * opts.drag) / dt * 16
    idleT = 0
  }
  const onUp = () => {
    if (!down) return
    down = false
    strip.classList.remove('dragging')
    if (moved && Math.abs(vel) <= 0.004) settle(nearest()) // soltou parado: assenta no detent
  }
  const onClick = (e: Event) => { if (moved) e.preventDefault() }
  const onKey = (e: KeyboardEvent) => { // setas andam de card em card
    if (e.key === 'ArrowRight') { settle(Math.min(N - 1, nearest() + 1)); e.preventDefault() }
    if (e.key === 'ArrowLeft') { settle(Math.max(0, nearest() - 1)); e.preventDefault() }
  }
  strip.addEventListener('pointerdown', onDown)
  addEventListener('pointermove', onMove)
  addEventListener('pointerup', onUp)
  strip.addEventListener('click', onClick, true)
  strip.addEventListener('keydown', onKey)
  cleanups.push(() => {
    strip.removeEventListener('pointerdown', onDown)
    removeEventListener('pointermove', onMove)
    removeEventListener('pointerup', onUp)
    strip.removeEventListener('click', onClick, true)
    strip.removeEventListener('keydown', onKey)
  })

  if (!reduce) {
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      let swayTarget = 0
      if (tw) {
        const p = Math.min(1, (t - tw.t0) / tw.dur)
        off = tw.from + (tw.to - tw.from) * ease(p)
        idleT = 0
        if (p >= 1) tw = null
      } else if (!down) {
        if (Math.abs(vel) > 0.004) { off = clampOff(off + vel); vel *= 0.94; idleT = 0; wasMoving = true }
        else {
          if (wasMoving) { wasMoving = false; settle(nearest()) } // fim da inércia: assenta
          idleT += 16
          if (idleT > 1200) swayTarget = Math.sin(t / 1900) * 2.2 // respiração idle em volta do detent
        }
      }
      sway += (swayTarget - sway) * 0.04
      offCur += (off - offCur) * (down ? 0.42 : 0.17) // peso: 1:1 no drag, pursuit macio no resto
      render()
    }
    raf = requestAnimationFrame(loop)
    cleanups.push(() => cancelAnimationFrame(raf))
  }
  off = offCur = clampOff(-angleOf(nearest()))
  mark(nearest())
  render()
  return () => cleanups.forEach((fn) => fn())
}

// frases de contexto por área (aria-live), idênticas nos dois protótipos
export const FRASES_A8 = [
  'O lazer estourou R$ 8. Segurando essa semana, o mês fecha com 39% poupado.',
  'A reserva cobre 4,2 meses. O aporte da Itália pode ser antecipado.',
  '2h de foco livres hoje à tarde. A agenda da semana está 80% protegida.',
  'Três treinos na semana, meta batida. O sono é quem está devendo.',
  'Leitura em dia, 2 sessões na semana. A trilha de UX pede 20 min hoje.',
  'Carteira +2,1% no mês. Proventos de julho já reinvestidos.',
  '3 de 5 skills no alvo do próximo nível. A 1:1 de terça está preparada.',
  '92 dias pra Itália. Falta fechar o roteiro de Positano.',
]

// ── as oito áreas: a lista conversa SÓ com a bússola (toque/hover aponta) ──
export function initAreas8(
  root: HTMLElement,
  opts: { reduce: boolean; iconSize: number; hover: boolean; onSelect?: (i: number) => void }
): Cleanup {
  const bs = root.querySelector<HTMLElement>('.a8-bs')
  if (!bs) return () => {}
  const a8 = controlBussola3D(bs, { reduce: opts.reduce })
  const rows = Array.from(root.querySelectorAll<HTMLElement>('.a8-row'))
  const a8ix = root.querySelector('.a8-ix')
  const a8nome = root.querySelector('.a8-nome')
  const a8frase = root.querySelector('.a8-frase')
  const cleanups: Cleanup[] = []
  rows.forEach((r) => {
    const i = +(r.getAttribute('data-area') ?? 0)
    const slot = r.querySelector('.aic-slot')
    if (slot) slot.appendChild(areaIcon(i, opts.iconSize))
    const sel = () => {
      a8.point(i)
      opts.onSelect?.(i)
      rows.forEach((x) => x.classList.toggle('on', x === r))
      if (a8ix) a8ix.textContent = '0' + (i + 1) + ' · 08'
      if (a8nome) a8nome.textContent = r.querySelector('.nm')?.textContent ?? ''
      if (a8frase) a8frase.textContent = FRASES_A8[i]
    }
    r.addEventListener('click', sel)
    cleanups.push(() => r.removeEventListener('click', sel))
    if (opts.hover && matchMedia('(pointer: fine)').matches) {
      r.addEventListener('pointerenter', sel)
      cleanups.push(() => r.removeEventListener('pointerenter', sel))
    }
  })
  a8.point(0)
  return () => cleanups.forEach((fn) => fn())
}

// ── AURORA (r13/r15): massas azul/lilás/roxo passeando atrás de toda área clara.
//    Canvas a 1/3 da resolução + blur no CSS; as bandas escuras cobrem naturalmente. ──
const AURORA_BLOBS = [
  { c: '104,64,255', a: 0.55, fx: 0.58, fy: 0.46, px: 0.26, py: 0.30, ph: 0 },   // roxo
  { c: '74,108,255', a: 0.42, fx: 0.44, fy: 0.56, px: 0.72, py: 0.24, ph: 2.1 }, // azul
  { c: '165,138,255', a: 0.34, fx: 0.36, fy: 0.46, px: 0.50, py: 0.80, ph: 4.2 }, // lilás
  { c: '82,39,230', a: 0.26, fx: 0.30, fy: 0.38, px: 0.86, py: 0.62, ph: 5.4 },  // roxo profundo
]

export function initAurora(cv: HTMLCanvasElement, opts: { reduce: boolean }): Cleanup {
  const ctx = cv.getContext('2d')
  if (!ctx) return () => {}
  let leanX = 0, leanY = 0, mNX = 0.5, mNY = 0.5
  let raf = 0
  const onPointer = (e: PointerEvent) => { mNX = e.clientX / innerWidth; mNY = e.clientY / innerHeight }
  addEventListener('pointermove', onPointer)
  function size() { // mede o pai (canvas é replaced: o bitmap não pode derivar do próprio box)
    const p = cv.parentElement
    if (!p) return
    cv.width = Math.max(2, Math.floor((p.clientWidth * 1) / 3))
    cv.height = Math.max(2, Math.floor((p.clientHeight * 1) / 3))
  }
  size()
  addEventListener('resize', size)
  function draw(t: number) {
    if (!ctx) return
    const w = cv.width, h = cv.height
    ctx.clearRect(0, 0, w, h)
    for (const b of AURORA_BLOBS) {
      // r15: amplitude ampla — a nuvem PASSEIA pela tela (~metade por ciclo de ~10s)
      const x = w * (b.px + 0.26 * Math.sin(t * b.fx * 0.001 + b.ph) + 0.10 * Math.sin(t * b.fx * 0.0023 + b.ph * 2)) + leanX * w * 0.07
      const y = h * (b.py + 0.22 * Math.cos(t * b.fy * 0.001 + b.ph * 1.3) + 0.08 * Math.cos(t * b.fy * 0.0019 + b.ph)) + leanY * h * 0.05
      const r = Math.max(w, h) * 0.36 * (1 + 0.11 * Math.sin(t * 0.0007 + b.ph * 3))
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, 'rgba(' + b.c + ',' + b.a + ')')
      g.addColorStop(1, 'rgba(' + b.c + ',0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }
  }
  if (!opts.reduce) {
    let skip = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden || skip++ % 2) return
      leanX += (mNX - 0.5 - leanX) * 0.025
      leanY += (mNY - 0.5 - leanY) * 0.025
      draw(t)
    }
    raf = requestAnimationFrame(loop)
  } else draw(0)
  return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', onPointer); removeEventListener('resize', size) }
}

// ── A TINTA: números assentam como instrumento (sobem, passam do ponto e voltam) ──
function odometro(el: Element) {
  const raw = el.textContent?.trim() ?? ''
  const alvo = parseInt(raw, 10)
  if (!alvo) return
  let t0: number | null = null
  const c1 = 1.4
  function step(ts: number) {
    if (!t0) t0 = ts
    const p = Math.min(1, (ts - t0) / 1100)
    const f = 1 + (c1 + 1) * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2)
    el.textContent = String(Math.max(0, Math.round(alvo * f)))
    if (p < 1) requestAnimationFrame(step)
    else el.textContent = raw
  }
  requestAnimationFrame(step)
}

export function observeOdometros(root: HTMLElement, opts: { reduce: boolean }): Cleanup {
  if (opts.reduce || !('IntersectionObserver' in window)) return () => {}
  const io = new IntersectionObserver(
    (es) => { es.forEach((e) => { if (e.isIntersecting) { odometro(e.target); io.unobserve(e.target) } }) },
    { threshold: 0.5 }
  )
  root.querySelectorAll('.a8-row .score, .badge78 .b-n').forEach((el) => io.observe(el))
  return () => io.disconnect()
}

// SplitText só depois das fontes DE VERDADE: fonts.ready pode resolver antes do
// Space Grotesk começar a baixar (nenhum load pendente ainda). Pedir as faces pela
// família COMPUTADA (o next/font renomeia a família) força o download antes da medida.
export function loadDisplayFonts(sample: Element): Promise<unknown> {
  if (!document.fonts?.load) return Promise.resolve()
  const fam = getComputedStyle(sample).fontFamily
  return Promise.all([
    document.fonts.load('500 32px ' + fam),
    document.fonts.load('700 32px ' + fam),
  ]).then(() => document.fonts.ready)
}

// botões magnéticos (só desktop com ponteiro fino, só sem reduce)
export function initMagnetic(root: HTMLElement, opts: { reduce: boolean }): Cleanup {
  if (opts.reduce || !matchMedia('(pointer: fine)').matches) return () => {}
  const cleanups: Cleanup[] = []
  root.querySelectorAll<HTMLElement>('.btn-roxo').forEach((b) => {
    const move = (e: MouseEvent) => {
      const r = b.getBoundingClientRect()
      const x = (e.clientX - r.left - r.width / 2) / r.width
      const y = (e.clientY - r.top - r.height / 2) / r.height
      b.style.translate = (x * 6).toFixed(1) + 'px ' + (y * 5).toFixed(1) + 'px'
    }
    const leave = () => { b.style.translate = '' }
    b.addEventListener('mousemove', move)
    b.addEventListener('mouseleave', leave)
    cleanups.push(() => { b.removeEventListener('mousemove', move); b.removeEventListener('mouseleave', leave) })
  })
  return () => cleanups.forEach((fn) => fn())
}
