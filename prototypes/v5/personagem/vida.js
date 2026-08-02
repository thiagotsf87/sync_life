// SyncLife · o contrato de vida do coach
//
// Aliveness não vem de anatomia, vem de comportamento. São sete sinais, e este
// arquivo é a única implementação deles. Qualquer forma que o coach venha a ter
// consome daqui, então trocar a forma nunca deveria significar reescrever o
// comportamento. É isso que permite apostar numa forma sem apostar no resto.
//
// 01 Respiração   nunca para. Parado por completo lê como quebrado, não como em repouso.
// 02 Atenção      se orienta pra você. É o que dá alma pra uma luminária da Pixar.
// 03 Antecipação  antes de agir, recua. Sem o recuo a transição vira corte.
// 04 Inércia      mola subamortecida: passa do alvo e assenta. Nunca linear.
// 05 Assimetria   ruído baixo em tudo. Simetria perfeita é assinatura do inanimado.
// 06 Esforço      o estado tem peso: adensa, acelera, tensiona.
// 07 Recuperação  depois do pico volta ao repouso, e nunca exatamente igual.

export const REDUZ = matchMedia('(prefers-reduced-motion: reduce)').matches

// ── ponteiro global, compartilhado por todas as peças da página ──────────
export const PT = { x: null, y: null }
addEventListener('pointermove', e => { PT.x = e.clientX; PT.y = e.clientY }, { passive: true })
addEventListener('pointerleave', () => { PT.x = PT.y = null }, { passive: true })

// ── mola de um escalar ───────────────────────────────────────────────────
// k alto e d abaixo do crítico (2·√k) é o que produz o sobrepasso. Sobrepasso
// é 04 inércia, e a volta pela mesma mola é 07 recuperação, de graça.
export function mola (o, alvo, k, d, dt) {
  o.v += ((alvo - o.p) * k - o.v * d) * dt
  o.p += o.v * dt
  return o.p
}
export const M = (p = 0) => ({ p, v: 0 })

// ── amplitude de voz ─────────────────────────────────────────────────────
// Três senos incomensuráveis: nunca repete o padrão, então lê como fala e não
// como oscilador. Fixa quando reduz, senão a boca fica batendo sozinha.
export const voz = t => REDUZ ? .55
  : Math.abs(Math.sin(t * 11.7) * .5 + Math.sin(t * 6.1) * .32 + Math.sin(t * 17.3) * .18)

// ── o contrato ───────────────────────────────────────────────────────────
export class Vida {
  constructor (semente = 1) {
    this.s = semente
    this.t = 0
    this.fase = semente * 3.1
    this.resp = .5                                     // 01
    this.esf = M(0)                                    // 06 · 04 · 07
    this.preparo = 0; this.ultAlvo = 0                 // 03
    this.mx = 0; this.my = 0; this.mvx = 0; this.mvy = 0 // 02
    this.voz = 0
  }

  // alvo: intensidade do estado, 0..1. ax/ay: mira normalizada, -1..1.
  passo (dt, alvo, ax = 0, ay = 0) {
    if (REDUZ) {
      this.esf.p = alvo; this.esf.v = 0
      this.resp = .5; this.mx = this.my = 0; this.voz = .55
      return
    }
    this.t += dt

    // 03 antecipação: 130ms recuando pro lado contrário antes de ir.
    if (alvo !== this.ultAlvo) { this.preparo = .13; this.ultAlvo = alvo }
    this.preparo = Math.max(0, this.preparo - dt)
    const a = this.preparo > 0 ? (alvo > this.esf.p ? this.esf.p - .24 : this.esf.p + .24) : alvo

    // 04 inércia (zeta ~.59) e 07 recuperação
    mola(this.esf, a, 52, 8.5, dt)

    // 01 respiração, acelerada por 06 esforço. Fase acumulada: mudar a
    // frequência sobre t direto dá salto na senoide.
    this.fase += dt * (1.22 + this.esf.p * 1.75)
    this.resp = .5 + .5 * (Math.sin(this.fase) * .74 + Math.sin(this.fase * .61 + this.s) * .26)

    // 02 atenção: chega com atraso, e cada peça tem seu tempo de reação
    this.mvx += ((ax - this.mx) * 30 - this.mvx * 9) * dt; this.mx += this.mvx * dt
    this.mvy += ((ay - this.my) * 30 - this.mvy * 9) * dt; this.my += this.mvy * dt

    this.voz = voz(this.t)
  }

  get e () { return this.esf.p }

  // 05 assimetria: ruído determinístico e barato, congelado junto com o relógio
  // quando reduz. A irregularidade fica, o movimento some.
  ruido (k, f = 1) {
    return Math.sin(this.t * f + k * 12.9898 + this.s) * .62 +
           Math.sin(this.t * f * 1.63 + k * 78.233) * .38
  }
}

// ── mistura de parâmetros de estado ──────────────────────────────────────
// Um estado não é um número, é um conjunto de parâmetros. Cada um viaja na sua
// mola, então a transição não é um corte com fade: partes do corpo chegam antes
// das outras, que é como corpo de verdade se move.
export class Mistura {
  constructor (base, k = 26, d = 7.4) {
    this.k = k; this.d = d
    this.v = {}
    for (const key in base) this.v[key] = M(base[key])
  }
  passo (dt, alvo) {
    if (REDUZ) { for (const key in this.v) { this.v[key].p = alvo[key] ?? 0; this.v[key].v = 0 }; return this }
    for (const key in this.v) mola(this.v[key], alvo[key] ?? 0, this.k, this.d, dt)
    return this
  }
  // leitura curta: m.g('raio')
  g (key) { return this.v[key].p }
}

// ── palco: canvas, dpr, resize e mira relativa à peça ────────────────────
export function palco (THREE, cv, tetoDpr = 2) {
  const ren = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' })
  const cx = { ren, l: 0, a: 0, retangulo: null }
  const medir = () => {
    const r = cv.parentElement.getBoundingClientRect()
    cx.retangulo = r
    const l = Math.max(1, Math.round(r.width)), a = Math.max(1, Math.round(r.height))
    if (l === cx.l && a === cx.a) return false
    cx.l = l; cx.a = a
    ren.setPixelRatio(Math.min(devicePixelRatio, tetoDpr))
    ren.setSize(l, a, false)
    return true
  }
  medir()
  new ResizeObserver(medir).observe(cv.parentElement)
  addEventListener('scroll', () => { cx.retangulo = cv.parentElement.getBoundingClientRect() }, { passive: true })
  const lim = v => Math.max(-1.5, Math.min(1.5, v))
  cx.mira = () => {
    if (PT.x === null || !cx.retangulo) return [0, 0]
    const r = cx.retangulo
    return [lim((PT.x - (r.left + r.width / 2)) / (r.width / 2)),
            lim(-(PT.y - (r.top + r.height / 2)) / (r.height / 2))]
  }
  return cx
}
