// Regras puras da tela Relatórios v5 (prototypes/v5/app/financas-relatorios.html e .mobile.html):
// períodos em meses, séries por mês, deltas contra o período anterior, categorias atual × anterior,
// top 5 despesas, geometria dos gráficos SVG, tooltips, linhas de Sy CALCULADAS (texto, sem IA) e CSV.
// Sem I/O e sem React. Valores monetários: `brlInt` e `brl` de `hub.ts` (NBSP depois do R$, en-dash no negativo).

import { brl, brlInt, type ParteFala } from '@/lib/financas/hub'

// ─── tipos ───────────────────────────────────────────────────────────────────

export type PeriodoKey = 'mes' | 'tri' | 'sem' | '12m' | 'ano' | 'custom'

export const PERIODOS: { key: PeriodoKey; rotulo: string; pro: boolean }[] = [
  { key: 'mes', rotulo: 'Mês atual', pro: false },
  { key: 'tri', rotulo: 'Último trimestre', pro: false },
  { key: 'sem', rotulo: 'Último semestre', pro: true },
  { key: '12m', rotulo: 'Últimos 12 meses', pro: true },
  { key: 'ano', rotulo: 'Ano atual', pro: false },
  { key: 'custom', rotulo: 'Personalizado', pro: true },
]

export interface TxRel {
  id: string
  date: string // YYYY-MM-DD
  amount: number
  type: 'income' | 'expense' | 'transfer'
  description: string | null
  category: string | null
  payment_method: string | null
  notes: string | null
}

export interface MesAgg {
  ym: string // YYYY-MM
  rec: number
  desp: number
  saldo: number
  poupPct: number // 0..100, saldo ÷ receitas do mês
  parcial: boolean
  cats: Record<string, number>
  n: number
}

export interface Soma {
  rec: number
  desp: number
  saldo: number
  poup: number // média arredondada dos meses
  cats: Record<string, number>
  n: number
}

export interface Relatorio {
  key: PeriodoKey
  metaPct: number
  hoje: string
  diaHoje: number
  /** meses selecionados (YYYY-MM) e meses do período anterior (vazio quando não há comparação) */
  meses: MesAgg[]
  mesesAnt: MesAgg[]
  temAnterior: boolean
  total: Soma
  totalAnt: Soma | null
  txCount: number
  nCategorias: number
  nota: string
  vazio: boolean
  txs: TxRel[] // só o período selecionado
}

export interface CatLinha {
  nome: string
  valor: number
  /** delta % contra o período anterior; null sem base */
  delta: number | null
  novo: boolean
  pctTotal: number
  wA: number
  wB: number | null
  spark: number[]
}

export interface CatsRel {
  linhas: CatLinha[]
  outras: number
  outrasAnt: number | null
}

export interface TopLinha {
  id: string
  desc: string
  data: string // "1 jul"
  cat: string
  valor: number
  w: number
}

// ─── formatação ──────────────────────────────────────────────────────────────

const MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
export const nomeMes = (ym: string): string => MESES_LONGOS[Number(ym.slice(5, 7)) - 1]
export const curtoMes = (ym: string): string => MESES_CURTOS[Number(ym.slice(5, 7)) - 1]

/** `+8,2%`, `-3,6%`, `0,0%`. */
export function p1(v: number): string {
  const s = Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return `${v > 0 ? '+' : v < 0 ? '-' : ''}${s}%`
}

/** `+3 pontos`, `-1 ponto`. */
export function pts(v: number): string {
  return `${v > 0 ? '+' : v < 0 ? '-' : ''}${Math.abs(v)} ${Math.abs(v) === 1 ? 'ponto' : 'pontos'}`
}

/** `R$ 2,5k` (NBSP). */
export function brlK(v: number): string {
  if (v === 0) return 'R$ 0'
  return `R$ ${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`
}

export function delta(atual: number, anterior: number): number | null {
  if (!anterior) return null
  return ((atual - anterior) / Math.abs(anterior)) * 100
}

// ─── meses e períodos ────────────────────────────────────────────────────────

export function addMes(ym: string, n: number): string {
  const idx = Number(ym.slice(0, 4)) * 12 + (Number(ym.slice(5, 7)) - 1) + n
  return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`
}

export function mesesEntre(de: string, ate: string): string[] {
  const out: string[] = []
  for (let m = de; m <= ate && out.length < 60; m = addMes(m, 1)) out.push(m)
  return out
}

export function ultimoDia(ym: string): number {
  return new Date(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)), 0).getDate()
}

/** "julho a setembro", "outubro"; com o ano nas pontas quando o período cruza a virada. */
export function faixa(meses: string[], curto = false): string {
  if (meses.length === 0) return ''
  const nome = curto ? curtoMes : nomeMes
  const a = meses[0]
  const z = meses[meses.length - 1]
  const cruza = a.slice(0, 4) !== z.slice(0, 4)
  const rot = (ym: string) => (cruza ? (curto ? `${nome(ym)}/${ym.slice(2, 4)}` : `${nome(ym)} de ${ym.slice(0, 4)}`) : nome(ym))
  return meses.length === 1 ? rot(a) : `${rot(a)} a ${rot(z)}`
}

export interface PeriodoMeses { sel: string[]; prev: string[] }

/** Meses do período e do período anterior (mesmo número de meses, logo antes). Só calendário, sem dados. */
export function mesesDoPeriodo(input: { key: PeriodoKey; hoje: string; de?: string; ate?: string }): PeriodoMeses {
  const cur = input.hoje.slice(0, 7)
  let sel: string[]
  switch (input.key) {
    case 'mes': sel = [cur]; break
    case 'tri': sel = mesesEntre(addMes(cur, -2), cur); break
    case 'sem': sel = mesesEntre(addMes(cur, -5), cur); break
    case '12m': sel = mesesEntre(addMes(cur, -11), cur); break
    case 'ano': sel = mesesEntre(`${cur.slice(0, 4)}-01`, cur); break
    default: {
      let de = input.de ?? addMes(cur, -2)
      let ate = input.ate ?? cur
      if (de > ate) [de, ate] = [ate, de]
      if (ate > cur) ate = cur
      if (de > ate) de = ate
      sel = mesesEntre(de, ate)
    }
  }
  const prev = mesesEntre(addMes(sel[0], -sel.length), addMes(sel[0], -1))
  return { sel, prev }
}

/** Opções do seletor Personalizado: do início do histórico (no máximo 24 meses) até o mês corrente. */
export function opcoesMes(hoje: string, historicoInicio: string | null): { value: string; label: string }[] {
  const cur = hoje.slice(0, 7)
  const piso = addMes(cur, -23)
  let ini = historicoInicio ? historicoInicio.slice(0, 7) : addMes(cur, -11)
  if (ini < piso) ini = piso
  if (ini > cur) ini = cur
  return mesesEntre(ini, cur).map(ym => ({
    value: ym,
    label: ym.slice(0, 4) === cur.slice(0, 4) ? nomeMes(ym) : `${nomeMes(ym)} de ${ym.slice(0, 4)}`,
  }))
}

// ─── agregação ───────────────────────────────────────────────────────────────

export function agregarMes(txs: TxRel[], ym: string, parcial: boolean): MesAgg {
  let rec = 0
  let desp = 0
  let n = 0
  const cats: Record<string, number> = {}
  for (const t of txs) {
    if (!t.date.startsWith(ym)) continue
    n++
    if (t.type === 'income') rec += t.amount
    else if (t.type === 'expense') {
      desp += t.amount
      const c = t.category ?? 'Sem categoria'
      cats[c] = (cats[c] ?? 0) + t.amount
    }
  }
  const saldo = rec - desp
  return { ym, rec, desp, saldo, poupPct: rec > 0 ? Math.max(0, Math.round((saldo / rec) * 100)) : 0, parcial, cats, n }
}

export function somar(meses: MesAgg[]): Soma {
  const o: Soma = { rec: 0, desp: 0, saldo: 0, poup: 0, cats: {}, n: 0 }
  let pp = 0
  for (const m of meses) {
    o.rec += m.rec
    o.desp += m.desp
    o.n += m.n
    pp += m.poupPct
    for (const c in m.cats) o.cats[c] = (o.cats[c] ?? 0) + m.cats[c]
  }
  o.saldo = o.rec - o.desp
  o.poup = meses.length ? Math.round(pp / meses.length) : 0
  return o
}

export interface MontarInput {
  txs: TxRel[]
  key: PeriodoKey
  sel: string[]
  prev: string[]
  hoje: string
  /** data (YYYY-MM-DD) da transação mais antiga do usuário, se houver */
  historicoInicio: string | null
  metaPct: number
}

export function montarRelatorio(input: MontarInput): Relatorio {
  const { txs, key, sel, prev, hoje, historicoInicio, metaPct } = input
  const cur = hoje.slice(0, 7)
  const meses = sel.map(ym => agregarMes(txs, ym, ym === cur))
  const prevAgg = prev.map(ym => agregarMes(txs, ym, false))
  const total = somar(meses)
  const totalPrev = somar(prevAgg)
  const cobreHistorico = historicoInicio !== null && historicoInicio.slice(0, 7) <= prev[0]
  const temAnterior = cobreHistorico && (totalPrev.rec > 0 || totalPrev.desp > 0)

  const notas: string[] = []
  if (!temAnterior) {
    if (historicoInicio === null) notas.push('sem transações registradas ainda')
    else if (cobreHistorico) notas.push('sem transações no período anterior')
    else notas.push(`seu histórico começa em ${nomeMes(historicoInicio.slice(0, 7))}`)
  }
  if (sel.includes(cur)) notas.push(`${nomeMes(cur)} até dia ${Number(hoje.slice(8, 10))}`)

  const selTxs = txs.filter(t => sel.includes(t.date.slice(0, 7)))
  return {
    key,
    metaPct,
    hoje,
    diaHoje: Number(hoje.slice(8, 10)),
    meses,
    mesesAnt: temAnterior ? prevAgg : [],
    temAnterior,
    total,
    totalAnt: temAnterior ? totalPrev : null,
    txCount: selTxs.length,
    nCategorias: Object.keys(total.cats).length,
    nota: notas.join(' · '),
    vazio: selTxs.length === 0,
    txs: selTxs,
  }
}

export const rotuloPeriodo = (r: Relatorio, curto = false): string => faixa(r.meses.map(m => m.ym), curto)
export const rotuloAnterior = (r: Relatorio, curto = false): string => faixa(r.mesesAnt.map(m => m.ym), curto)

// ─── números, categorias, top 5 ──────────────────────────────────────────────

export interface Celula { l: string; v: string; d: string; ele: boolean }

export function numeros(r: Relatorio, mob: boolean): Celula[] {
  const a = r.total
  const b = r.totalAnt
  const vs = b ? ` vs ${rotuloAnterior(r, mob)}` : ''
  const sem = 'sem período anterior'
  const semBase = 'sem base no período anterior'
  const dl = (atual: number, ant: number): string => {
    const d = delta(atual, ant)
    return d === null ? semBase : `${p1(d)}${vs}`
  }
  const meta = `Meta: ${r.metaPct}%${b ? ` · ${pts(a.poup - b.poup)}` : ''}`
  return [
    { l: 'Receitas', v: brlInt(a.rec), d: b ? dl(a.rec, b.rec) : sem, ele: !!b && a.rec >= b.rec },
    {
      l: 'Despesas', v: brlInt(a.desp),
      d: b ? dl(a.desp, b.desp) : a.rec > 0 ? `${Math.round((a.desp / a.rec) * 100)}% da receita` : 'sem receita no período',
      ele: !!b && a.desp <= b.desp,
    },
    { l: 'Saldo', v: brlInt(a.saldo), d: b ? dl(a.saldo, b.saldo) : sem, ele: !!b && a.saldo >= b.saldo },
    { l: mob ? 'Poupança' : 'Poupança média', v: `${a.poup}%`, d: meta, ele: a.poup >= r.metaPct },
  ]
}

/** Cinco maiores categorias de despesa do período, com o anterior ao lado. */
export function categoriasRel(r: Relatorio): CatsRel {
  const a = r.total
  const b = r.totalAnt
  const nomes = Object.keys(a.cats).sort((x, y) => a.cats[y] - a.cats[x]).slice(0, 5)
  let mx = 0
  for (const c of nomes) mx = Math.max(mx, a.cats[c], b?.cats[c] ?? 0)
  const linhas: CatLinha[] = nomes.map(c => {
    const v = a.cats[c]
    const ant = b ? b.cats[c] ?? 0 : null
    const d = ant ? delta(v, ant) : null
    return {
      nome: c,
      valor: v,
      delta: d,
      novo: b !== null && !ant,
      pctTotal: a.desp > 0 ? Math.round((v / a.desp) * 100) : 0,
      wA: mx ? (v / mx) * 100 : 0,
      wB: ant === null || !mx ? null : (ant / mx) * 100,
      spark: r.meses.map(m => m.cats[c] ?? 0),
    }
  })
  const somaTop = nomes.reduce((s, c) => s + a.cats[c], 0)
  const outras = Math.max(0, a.desp - somaTop)
  const outrasAnt = b ? Math.max(0, b.desp - nomes.reduce((s, c) => s + (b.cats[c] ?? 0), 0)) : null
  return { linhas, outras, outrasAnt }
}

export function textoDelta(l: CatLinha, temAnterior: boolean): string {
  if (!temAnterior) return `${l.pctTotal}% do total`
  if (l.novo) return 'novo'
  if (l.delta === null || Math.abs(l.delta) < 0.05) return 'igual'
  return p1(l.delta)
}

export function classeDelta(l: CatLinha): '' | 'up' | 'down' {
  if (l.delta === null || Math.abs(l.delta) < 0.05) return l.novo ? 'up' : ''
  return l.delta > 0 ? 'up' : 'down'
}

/** Pontos de uma sparkline de 60×16 (viewBox) para os valores mensais da categoria. */
export function sparkPath(vals: number[]): string {
  if (vals.length < 2) return ''
  const lo = Math.min(...vals)
  const hi = Math.max(...vals)
  const rg = hi - lo || 1
  return vals.map((x, i) => `${i ? 'L' : 'M'}${((i * 60) / (vals.length - 1)).toFixed(1)} ${(14 - ((x - lo) / rg) * 12).toFixed(1)}`).join(' ')
}

export function topDespesas(r: Relatorio, n = 5): TopLinha[] {
  const ds = r.txs
    .filter(t => t.type === 'expense')
    .sort((x, y) => y.amount - x.amount || (x.date < y.date ? 1 : -1))
    .slice(0, n)
  const mx = ds[0]?.amount ?? 0
  return ds.map(t => ({
    id: t.id,
    desc: t.description?.trim() || 'Sem descrição',
    data: `${Number(t.date.slice(8, 10))} ${curtoMes(t.date.slice(0, 7))}`,
    cat: t.category ?? 'Sem categoria',
    valor: t.amount,
    w: mx ? (t.amount / mx) * 100 : 0,
  }))
}

// ─── geometria dos dois gráficos de coluna ───────────────────────────────────

export interface GeoBase {
  /** meses mostrados: anterior + selecionado */
  ms: MesAgg[]
  n: number
  /** quantos do começo são do período anterior */
  k: number
  W: number
  H: number
  xs: number[]
}

export function geoBase(r: Relatorio, mob: boolean, qual: 'c1' | 'c3'): GeoBase {
  const ms = [...r.mesesAnt, ...r.meses]
  const n = ms.length
  const W = mob ? 340 : 600
  const H = qual === 'c1' ? (mob ? 150 : 200) : (mob ? 120 : 150)
  const pad = qual === 'c1' ? (mob ? 18 : 30) : (mob ? 26 : 44)
  const xs = ms.map((_, i) => (n === 1 ? W / 2 : pad + (i * (W - 2 * pad)) / (n - 1)))
  return { ms, n, k: r.mesesAnt.length, W, H, xs }
}

export const pct = (v: number, tot: number): string => `${((v / tot) * 100).toFixed(2)}%`
const f1 = (v: number): string => v.toFixed(1)

export interface C1Geo {
  g: GeoBase
  grades: number[]
  area: string | null
  linhaRec: string
  linhaDesp: string
  dots: { x: number; y: number; w: number; cor: 'rec' | 'desp' }[]
  sombra: number | null
  ylabels: { top: string; txt: string }[]
  zonas: { left: string; txt: string }[]
  xl: { left: string; txt: string; ant: boolean }[]
}

export function geoC1(r: Relatorio, mob: boolean): C1Geo {
  const g = geoBase(r, mob, 'c1')
  const { ms, H, W } = g
  const recs = ms.map(m => m.rec)
  const desps = ms.map(m => m.desp)
  const hi = Math.ceil((Math.max(...recs, ...desps) + 200) / 500) * 500
  const lo = Math.max(0, Math.floor((Math.min(...recs, ...desps) - 300) / 500) * 500)
  const pt = 14
  const pb = 6
  const span = hi - lo || 1
  const y = (v: number) => pt + ((hi - v) / span) * (H - pt - pb)
  const path = (a: number[]) => a.map((v, i) => `${i ? 'L' : 'M'}${f1(g.xs[i])} ${f1(y(v))}`).join(' ')
  const grades = [lo, (lo + hi) / 2, hi].map(y)
  const linhaRec = path(recs)
  const area = g.n > 1 ? `${linhaRec} L${f1(g.xs[g.n - 1])} ${H} L${f1(g.xs[0])} ${H} Z` : null
  const dots: C1Geo['dots'] = []
  ms.forEach((_, i) => {
    dots.push({ x: g.xs[i], y: y(desps[i]), w: 6, cor: 'desp' })
    dots.push({ x: g.xs[i], y: y(recs[i]), w: i === g.n - 1 ? 9 : 7, cor: 'rec' })
  })
  const bx = g.k ? (g.xs[g.k - 1] + g.xs[g.k]) / 2 : null
  const zonas: C1Geo['zonas'] = bx !== null && !mob
    ? [{ left: '0', txt: rotuloAnterior(r) }, { left: pct(bx, W), txt: rotuloPeriodo(r) }]
    : []
  return {
    g,
    grades,
    area,
    linhaRec,
    linhaDesp: path(desps),
    dots,
    sombra: bx,
    ylabels: [lo, hi].map(v => ({ top: pct(y(v), H), txt: brlK(v) })),
    zonas,
    xl: ms.map((m, i) => ({ left: pct(g.xs[i], W), txt: curtoMes(m.ym), ant: i < g.k })),
  }
}

export interface C3Geo {
  g: GeoBase
  baseY: number
  barras: { x: number; y: number; w: number; h: number; ok: boolean; ant: boolean }[]
  metaY: number
  vl: { left: string; top: string; txt: string; ok: boolean; ant: boolean }[]
  xl: { left: string; txt: string; ant: boolean }[]
}

export function geoC3(r: Relatorio, mob: boolean): C3Geo {
  const g = geoBase(r, mob, 'c3')
  const { ms, W, H } = g
  const meta = r.metaPct
  const vs = ms.map(m => m.poupPct)
  const hi = Math.max(40, Math.ceil((Math.max(...vs, meta) + 5) / 10) * 10)
  const pt = 18
  const pb = 2
  const y = (v: number) => pt + ((hi - v) / hi) * (H - pt - pb)
  const bw = Math.min(mob ? 22 : 34, ((W - 2 * g.xs[0]) / Math.max(1, g.n - 1)) * 0.5 || 34)
  return {
    g,
    baseY: H - pb,
    barras: vs.map((v, i) => ({ x: g.xs[i] - bw / 2, y: y(v), w: bw, h: H - pb - y(v), ok: v >= meta, ant: i < g.k })),
    metaY: y(meta),
    vl: vs.map((v, i) => ({ left: pct(g.xs[i], W), top: pct(y(v), H), txt: `${v}%`, ok: v >= meta, ant: i < g.k })),
    xl: ms.map((m, i) => ({ left: pct(g.xs[i], W), txt: curtoMes(m.ym), ant: i < g.k })),
  }
}

const plain = (s: string): string => s.replace(/ /g, ' ')

export function aria1(r: Relatorio): string {
  return `Receitas e despesas por mês, ${rotuloPeriodo(r)}: ${r.meses.map(m => `${nomeMes(m.ym)} ${plain(brlInt(m.rec))} e ${plain(brlInt(m.desp))}`).join('; ')}`
}

export function aria3(r: Relatorio): string {
  return `Poupança por mês contra a meta de ${r.metaPct}%: ${r.meses.map(m => `${nomeMes(m.ym)} ${m.poupPct}%`).join(', ')}`
}

// ─── tooltips ────────────────────────────────────────────────────────────────

export interface TipLinha { l: string; v: string; k?: 'ele' | 'dsp' }
export interface TipData { titulo: string; sub?: string; blocos: TipLinha[][] }

export type TipRef =
  | { tipo: 'c1' | 'c3'; i: number }
  | { tipo: 'cat'; nome: string }
  | { tipo: 'top'; i: number }

function tagMes(r: Relatorio, g: GeoBase, i: number): string {
  if (i < g.k) return ' · anterior'
  return g.ms[i].parcial ? ` · até dia ${r.diaHoje}` : ''
}

export function conteudoTip(r: Relatorio, ref: TipRef, mob: boolean): TipData | null {
  if (ref.tipo === 'c1') {
    const g = geoBase(r, mob, 'c1')
    const m = g.ms[ref.i]
    if (!m) return null
    return {
      titulo: cap(nomeMes(m.ym)),
      sub: tagMes(r, g, ref.i),
      blocos: [
        [{ l: 'Receitas', v: brlInt(m.rec), k: 'ele' }, { l: 'Despesas', v: brlInt(m.desp), k: 'dsp' }],
        [{ l: 'Saldo', v: brlInt(m.saldo) }, { l: 'Poupança', v: `${m.poupPct}%` }],
      ],
    }
  }
  if (ref.tipo === 'c3') {
    const g = geoBase(r, mob, 'c3')
    const m = g.ms[ref.i]
    if (!m) return null
    const dif = m.poupPct - r.metaPct
    const quanto = dif === 0 ? 'Na meta' : `${pts(Math.abs(dif)).replace('+', '')} ${dif > 0 ? 'acima' : 'abaixo'}`
    return {
      titulo: cap(nomeMes(m.ym)),
      sub: tagMes(r, g, ref.i),
      blocos: [
        [{ l: 'Poupança', v: `${m.poupPct}%` }, { l: 'Meta', v: `${r.metaPct}%` }],
        [{ l: quanto, v: `${brlInt(m.saldo)} guardados` }],
      ],
    }
  }
  if (ref.tipo === 'cat') {
    const c = ref.nome
    const a = r.total
    const b = r.totalAnt
    const top: TipLinha[] = [{ l: cap(rotuloPeriodo(r)), v: brlInt(a.cats[c] ?? 0) }]
    if (b) top.push({ l: cap(rotuloAnterior(r)), v: brlInt(b.cats[c] ?? 0) })
    const meses: TipLinha[] = r.meses.slice(-4).map(m => ({ l: cap(nomeMes(m.ym)), v: brlInt(m.cats[c] ?? 0) }))
    meses.push({ l: 'Parte das despesas', v: `${a.desp > 0 ? Math.round(((a.cats[c] ?? 0) / a.desp) * 100) : 0}%` })
    return { titulo: c, blocos: [top, meses] }
  }
  const x = topDespesas(r)[ref.i]
  if (!x) return null
  const a = r.total
  const bloco1: TipLinha[] = [
    { l: 'Valor', v: brl(x.valor) },
    { l: 'Parte das despesas', v: `${a.desp > 0 ? ((x.valor / a.desp) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '0'}%` },
  ]
  const blocos = [bloco1]
  if (a.cats[x.cat] !== undefined) blocos.push([{ l: `${x.cat} no período`, v: brlInt(a.cats[x.cat]) }])
  return { titulo: x.desc, sub: ` · ${x.data}`, blocos }
}

// ─── linhas de Sy (calculadas, sem chamada a IA) ─────────────────────────────

const T = (t: string): ParteFala => ({ t })
const B = (t: string, w = false): ParteFala => (w ? { t, b: true, w: true } : { t, b: true })

function trechoMeta(r: Relatorio): ParteFala[] {
  const p = r.total.poup
  const M = r.metaPct
  if (p >= M) return [T(p === M ? ', na meta' : `, acima da meta de ${M}%`)]
  return [T(', abaixo da meta de '), B(`${M}%`, true)]
}

function melhorMes(meses: MesAgg[]): MesAgg {
  const fechados = meses.filter(m => !m.parcial)
  const base = fechados.length ? fechados : meses
  return base.reduce((best, m) => (m.saldo > best.saldo ? m : best), base[0])
}

/** Fala do topo: 1 ou 2 frases. */
export function syTopo(r: Relatorio): ParteFala[] {
  if (r.vazio) return [T(`Não há transações de ${rotuloPeriodo(r)}.`)]
  const a = r.total
  const b = r.totalAnt
  const meta = trechoMeta(r)
  if (r.meses.length === 1 && r.meses[0].parcial) {
    return [
      T(`${cap(nomeMes(r.meses[0].ym))} está no dia ${r.diaHoje}: `), B(brlInt(a.rec)), T(' entraram e '), B(brlInt(a.desp)),
      T(' saíram. A poupança do mês está em '), B(`${a.poup}%`), ...meta, T('.'),
    ]
  }
  const dd = b ? delta(a.desp, b.desp) : null
  if (b && dd !== null) {
    const quanto: ParteFala[] = Math.abs(dd) < 0.05
      ? [T('Você gastou o mesmo que em ')]
      : [T('Você gastou '), B(p1(dd).replace(/^[+-]/, ''), dd > 0), T(dd > 0 ? ' mais que em ' : ' menos que em ')]
    return [...quanto, T(`${rotuloAnterior(r)}, e a poupança média ficou em `), B(`${a.poup}%`), ...meta, T('.')]
  }
  const abre: ParteFala[] = [T(`De ${rotuloPeriodo(r)}, a poupança ${r.meses.length > 1 ? 'média ' : ''}ficou em `), B(`${a.poup}%`), ...meta, T('.')]
  if (r.meses.length > 1) {
    const bm = melhorMes(r.meses)
    abre.push(T(` O melhor mês foi ${nomeMes(bm.ym)}, com `), B(brlInt(bm.saldo)), T(' de saldo.'))
  }
  return abre
}

/** Sy sobre receitas × despesas. */
export function syReceitasDespesas(r: Relatorio): ParteFala[] {
  if (r.vazio) return []
  const bm = melhorMes(r.meses)
  if (r.meses.length === 1) {
    const m = r.meses[0]
    const base: ParteFala[] = m.parcial
      ? [T(`${cap(nomeMes(m.ym))} tem `), B(brlInt(m.saldo)), T(' de saldo até agora')]
      : [T(`${cap(nomeMes(m.ym))} fechou com `), B(brlInt(m.saldo)), T(' de saldo')]
    const ant = r.mesesAnt[0]
    if (r.temAnterior && ant) {
      return [...base, T(`, ${m.saldo >= ant.saldo ? 'acima de' : 'abaixo de'} ${nomeMes(ant.ym)}${m.parcial ? ' inteiro' : ''} (`), B(brlInt(ant.saldo)), T(').')]
    }
    return [...base, T('.')]
  }
  if (bm.saldo <= 0) return [T('Nenhum mês do período fechou com sobra.')]
  return [T(`${cap(nomeMes(bm.ym))} foi o melhor mês: sobraram `), B(brlInt(bm.saldo)), T('.')]
}

/** Sy sobre categorias. */
export function syCategorias(r: Relatorio): ParteFala[] {
  const a = r.total
  const nomes = Object.keys(a.cats)
  if (!nomes.length) return []
  const b = r.totalAnt
  if (!b) {
    const mc = nomes.reduce((m, c) => (a.cats[c] > a.cats[m] ? c : m), nomes[0])
    return [T(`${mc} leva `), B(`${Math.round((a.cats[mc] / a.desp) * 100)}%`), T(' das despesas do período.')]
  }
  const ups = nomes.filter(c => (b.cats[c] ?? 0) > 0 && a.cats[c] > b.cats[c])
  if (!ups.length) return [T(`Nenhuma categoria subiu em relação a ${rotuloAnterior(r)}.`)]
  const dl = (c: string) => ((a.cats[c] - b.cats[c]) / b.cats[c]) * 100
  const mu = ups.reduce((m, c) => (dl(c) > dl(m) ? c : m), ups[0])
  return [
    T(`${mu} subiu `), B(p1(dl(mu)).replace('+', '')),
    T(ups.length === 1 ? `; foi a única categoria acima de ${rotuloAnterior(r)}.` : `; ${ups.length} categorias ficaram acima de ${rotuloAnterior(r)}.`),
  ]
}

/** Sy sobre a poupança contra a meta. */
export function syPoupanca(r: Relatorio): ParteFala[] {
  if (r.vazio) return []
  const M = r.metaPct
  if (r.meses.length === 1) {
    const m = r.meses[0]
    return [T(`${cap(nomeMes(m.ym))} está em `), B(`${m.poupPct}%`), T(`, ${m.poupPct >= M ? 'acima' : 'abaixo'} da meta de ${M}%.`)]
  }
  const ok = r.meses.filter(m => m.poupPct >= M)
  const pior = r.meses.reduce((p, m) => (m.poupPct < p.poupPct ? m : p), r.meses[0])
  const abre: ParteFala[] = [T('Você ficou na meta em '), B(`${ok.length} de ${r.meses.length}`), T(' meses')]
  if (ok.length < r.meses.length) return [...abre, T(`; ${nomeMes(pior.ym)} foi o mais baixo, `), B(`${pior.poupPct}%`), T('.')]
  return [...abre, T('.')]
}

/** Sy sobre as maiores despesas. */
export function syTop(r: Relatorio): ParteFala[] {
  const t = topDespesas(r)
  if (!t.length) return []
  const cnt: Record<string, number> = {}
  for (const x of t) cnt[x.cat] = (cnt[x.cat] ?? 0) + 1
  const mc = Object.keys(cnt).reduce((m, c) => (cnt[c] > cnt[m] ? c : m), t[0].cat)
  if (cnt[mc] >= 2) {
    return [T(`${mc} ocupa `), B(`${cnt[mc]} das ${t.length}`), T(mc === 'Moradia' ? ' maiores saídas: o aluguel, que é fixo.' : ' maiores saídas.')]
  }
  return [T(`A maior saída foi ${t[0].desc.toLocaleLowerCase('pt-BR')}, `), B(brl(t[0].valor)), T('.')]
}

/** "97 transações · jul a set" etc. */
export function subtitulo(r: Relatorio, mob: boolean): string {
  const n = r.meses.length
  let s = `${cap(rotuloPeriodo(r))} · ${n} ${n === 1 ? 'mês' : 'meses'}`
  if (!mob) s += ` · ${r.txCount} ${r.txCount === 1 ? 'transação' : 'transações'}`
  if (r.mesesAnt.length) s += ` · comparado com ${rotuloAnterior(r)}`
  if (r.nota) s += ` · ${r.nota}`
  return s
}

export function fontes(r: Relatorio): string {
  return `${r.txCount} ${r.txCount === 1 ? 'transação' : 'transações'}, ${r.nCategorias} ${r.nCategorias === 1 ? 'categoria' : 'categorias'}, meta de poupança de ${r.metaPct}%`
}

export const resumoTabela = (r: Relatorio): string => `Mês a mês · ${r.meses.length} ${r.meses.length === 1 ? 'mês' : 'meses'}`

/** Colunas da tabela mês a mês: as 5 maiores categorias do período. */
export function colunasTabela(r: Relatorio): string[] {
  return categoriasRel(r).linhas.map(l => l.nome)
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

const PAGAMENTO: Record<string, string> = {
  pix: 'Pix', credit: 'Crédito', debit: 'Débito', cash: 'Dinheiro', transfer: 'TED/DOC', boleto: 'Boleto',
}

const TIPO: Record<TxRel['type'], string> = { income: 'Receita', expense: 'Despesa', transfer: 'Transferência' }

/** Texto de célula: aspas dobradas e prefixo contra fórmula de planilha. */
function celula(s: string | null): string {
  const v = (s ?? '').replace(/"/g, '""')
  return `"${/^[=+\-@]/.test(v) ? `'${v}` : v}"`
}

export interface CsvRel { nome: string; linhas: number; txt: string }

/** CSV do período: `;`, BOM UTF-8, decimal com vírgula, data dd/mm/aaaa, uma linha por transação. */
export function gerarCsv(r: Relatorio): CsvRel {
  const linhas = ['Data;Descrição;Categoria;Tipo;Valor;Método;Notas']
  const ordem = [...r.txs].sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0))
  for (const t of ordem) {
    const [a, m, d] = t.date.split('-')
    linhas.push([
      `${d}/${m}/${a}`,
      celula(t.description),
      celula(t.category),
      TIPO[t.type],
      t.amount.toFixed(2).replace('.', ','),
      t.payment_method ? PAGAMENTO[t.payment_method] ?? t.payment_method : '',
      celula(t.notes),
    ].join(';'))
  }
  const ini = r.meses[0].ym
  const fim = r.meses[r.meses.length - 1].ym
  return { nome: `synclife-relatorio-${ini}-a-${fim}.csv`, linhas: linhas.length - 1, txt: `﻿${linhas.join('\r\n')}` }
}
