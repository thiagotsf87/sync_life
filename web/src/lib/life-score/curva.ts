// Curva de 30 dias do Life Score (puro). Mesma geometria do protótipo
// life-score-v2: domínio [mín − 2, máx + 2] mapeado entre `top` e `bottom`,
// x de `pad` a `w − pad`, suavização Catmull-Rom → Bézier (tensão 1/6).

export interface Geometria { w: number; h: number; top: number; bottom: number; pad: number }

export const GEO_DESKTOP: Geometria = { w: 720, h: 160, top: 16, bottom: 148, pad: 6 }
export const GEO_MOBILE: Geometria = { w: 350, h: 140, top: 14, bottom: 128, pad: 5 }

export interface Curva {
  linha: string
  area: string
  fim: { x: number; y: number }
  meio: number   // y da hairline do meio
}

const f2 = (n: number) => n.toFixed(2)

/** `valores` em ordem cronológica (mais antigo primeiro). Precisa de pelo menos 2 pontos. */
export function curvaPath(valores: number[], g: Geometria): Curva | null {
  if (valores.length < 2) return null
  const min = Math.min(...valores) - 2
  const max = Math.max(...valores) + 2
  const span = max - min || 1
  const passo = (g.w - 2 * g.pad) / (valores.length - 1)
  const pts = valores.map((v, i) => ({
    x: g.pad + i * passo,
    y: g.bottom - ((v - min) / span) * (g.bottom - g.top),
  }))
  let d = `M${f2(pts[0].x)} ${f2(pts[0].y)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${f2(c1x)} ${f2(c1y)} ${f2(c2x)} ${f2(c2y)} ${f2(p2.x)} ${f2(p2.y)}`
  }
  const ult = pts[pts.length - 1]
  const area = `${d} L${f2(ult.x)} ${g.bottom} L${f2(pts[0].x)} ${g.bottom} Z`
  return { linha: d, area, fim: { x: ult.x, y: ult.y }, meio: (g.top + g.bottom) / 2 }
}

export interface ResumoCurva {
  de: number
  para: number
  dias: number
  variacao: number
  maiorRecuo: number   // em pontos, >= 0
  maiorSalto: number   // em pontos, >= 0
}

/** Resumo para a prosa embaixo da curva (valores cronológicos, inteiros arredondados). */
export function resumoCurva(valores: number[]): ResumoCurva | null {
  if (valores.length < 2) return null
  const r = valores.map((v) => Math.round(v))
  let maiorRecuo = 0
  let maiorSalto = 0
  for (let i = 1; i < r.length; i++) {
    const d = r[i] - r[i - 1]
    if (d < 0) maiorRecuo = Math.max(maiorRecuo, -d)
    if (d > 0) maiorSalto = Math.max(maiorSalto, d)
  }
  return { de: r[0], para: r[r.length - 1], dias: r.length, variacao: r[r.length - 1] - r[0], maiorRecuo, maiorSalto }
}
