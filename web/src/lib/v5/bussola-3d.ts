// A Bússola da Vida 3D — montagem + controle da agulha.
// Porte 1:1 de prototypes/v5/shared/bussola-3d.js (fonte: marca-3d.html + README §Interactions):
// transição .52s easing assinatura; overshoot em duas etapas (alvo+9°, assenta após 330ms);
// rotateX(16deg) durante o trajeto (.busy); marcação de destino acende 260ms após o início.
// Diferença deliberada: a rotação é acumulada por caminho-mais-curto (315°→0° não dá a volta longa)
// e o overshoot segue o sentido do movimento.

const TPL =
  '<div class="rim"></div><div class="dial"><div class="nsh" aria-hidden="true"><i></i></div>' +
  '<svg class="tk" viewBox="0 0 200 200" aria-hidden="true"></svg>' +
  '<div class="nd"><span class="nh"></span><span class="sh"></span></div><div class="pv"></div></div>' +
  '<div class="gl"></div><div class="sw"></div>'

export function buildTicks(svg: SVGElement): void {
  let h = ''
  for (let j = 0; j < 24; j++) {
    if (j % 3 === 0) continue
    h += '<g transform="rotate(' + j * 15 + ' 100 100)"><line class="mn" x1="100" y1="17" x2="100" y2="25"></line></g>'
  }
  for (let i = 0; i < 8; i++) {
    h += '<g class="t" data-i="' + i + '" transform="rotate(' + i * 45 + ' 100 100)">' +
      '<line class="d" x1="100" y1="13" x2="100" y2="31.6"></line>' +
      '<line class="l" x1="100" y1="14.3" x2="100" y2="30.4"></line></g>'
  }
  svg.innerHTML = h
}

// Degradação por tamanho (thresholds do README: 54 / 34 / 22px)
export function mountBussola3D(el: HTMLElement): HTMLElement {
  el.innerHTML = TPL
  const svg = el.querySelector<SVGElement>('.tk')
  if (svg) buildTicks(svg)
  const sz = el.getBoundingClientRect().width || parseFloat(el.style.getPropertyValue('--sz')) || 0
  if (!sz) return el
  if (sz <= 22) el.classList.add('s-sm', 's-xs')
  else if (sz <= 54) el.classList.add('s-sm')
  if (sz < 54) el.querySelectorAll('.mn').forEach((n) => n.remove())
  el.querySelectorAll('.t').forEach((g) => {
    const i = +(g.getAttribute('data-i') ?? 0)
    if (sz <= 22 ? i !== 0 : sz < 34 && i % 2) g.remove()
  })
  return el
}

export interface BussolaControl {
  point(i: number): void
  glance(i: number): void
  unglance(): void
  index(): number
}

// Controlador de uma peça: point(i) com overshoot/lit, glance(i)/unglance() pra hover.
export function controlBussola3D(el: HTMLElement, opts?: { reduce?: boolean }): BussolaControl {
  const reduce = !!opts?.reduce
  let rot = 0
  let cur = 0
  let timers: ReturnType<typeof setTimeout>[] = []
  function litTick(i: number) {
    el.querySelectorAll('.tk .t').forEach((g) => {
      g.classList.toggle('on', +(g.getAttribute('data-i') ?? -1) === i)
    })
  }
  function targetOf(i: number) {
    const norm = ((rot % 360) + 360) % 360
    return rot + (((i * 45 - norm + 540) % 360) - 180)
  }
  function point(i: number) {
    const tgt = targetOf(i)
    const delta = tgt - rot
    cur = i
    rot = tgt
    timers.forEach(clearTimeout)
    timers = []
    if (reduce) { el.style.setProperty('--rot', tgt + 'deg'); litTick(i); return }
    el.classList.add('busy')
    el.style.setProperty('--rot', tgt + (delta >= 0 ? 9 : -9) + 'deg')
    timers.push(setTimeout(() => { el.style.setProperty('--rot', tgt + 'deg'); el.classList.remove('busy') }, 330))
    timers.push(setTimeout(() => { litTick(i) }, 260))
  }
  function glance(i: number) { el.style.setProperty('--rot', targetOf(i) + 'deg') } // olha sem assentar
  function unglance() { el.style.setProperty('--rot', rot + 'deg') }
  litTick(0)
  return { point, glance, unglance, index: () => cur }
}

// Primitivas geométricas das 8 áreas (spec §05, ordem canônica 01 Finanças..08 Experiências)
const PRIM = [
  '<circle class="accf" cx="28" cy="28" r="7"></circle>',
  '<circle class="eng" cx="28" cy="28.9" r="7.4"></circle><circle class="acc" cx="28" cy="28" r="7.4"></circle>',
  '<circle class="eng" cx="28" cy="28.9" r="7.6"></circle><circle class="top" cx="28" cy="28" r="7.6"></circle><path class="acc" d="M28 24.2 V28 h3.4"></path>',
  '<rect class="eng" x="24.2" y="21.9" width="7.6" height="14" rx="3.8"></rect><rect class="top" x="24.2" y="21" width="7.6" height="14" rx="3.8"></rect><path class="acc" d="M24.6 30.4 h6.8"></path>',
  '<circle class="top" cx="20.9" cy="33.4" r="3.5"></circle><circle class="top" cx="28" cy="28" r="3.5"></circle><circle class="accf" cx="35.1" cy="22.6" r="3.8"></circle>',
  '<rect class="eng" x="21.4" y="22.4" width="13.2" height="13.2" rx="2.4"></rect><rect class="top" x="21.4" y="21.4" width="13.2" height="13.2" rx="2.4"></rect>',
  '<path class="eng" d="M21.4 31.6 L28 25.4 L34.6 31.6"></path><path class="acc" d="M21.4 30.6 L28 24.4 L34.6 30.6"></path>',
  '<path class="eng" d="M28 21.6 L34.6 28.9 L28 36.2 L21.4 28.9 Z"></path><path class="top" d="M28 20.6 L34.6 28 L28 35.4 L21.4 28 Z"></path>',
]

// Ícone de área: bússola em cromo pequeno, sem agulha e sem pivô, marcação do rumo acesa
// + primitiva no centro. Sempre em modo .s-sm (contraste manda), como na spec.
export function areaIcon(i: number, sz?: number): HTMLSpanElement {
  const el = document.createElement('span') // span: pode viver dentro de botões/links
  el.className = 'bs d3 s-sm aic'
  el.style.setProperty('--sz', (sz || 56) + 'px')
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML =
    '<div class="rim"></div><div class="dial">' +
    '<svg class="tk" viewBox="0 0 200 200" aria-hidden="true"></svg>' +
    '<svg class="gly" viewBox="0 0 56 56" aria-hidden="true">' + PRIM[i] + '</svg>' +
    '</div><div class="gl"></div>'
  const svg = el.querySelector<SVGElement>('.tk')
  if (svg) {
    buildTicks(svg)
    svg.querySelectorAll('.mn').forEach((n) => n.remove())
    svg.querySelectorAll('.t').forEach((g) => {
      if (+(g.getAttribute('data-i') ?? -1) === i) g.classList.add('on')
    })
  }
  return el
}
