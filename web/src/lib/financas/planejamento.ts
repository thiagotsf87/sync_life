// Fase 2 · Planejamento (T3): projeção de 13 meses e laboratório, em funções puras.
// Regra (brief §4.4, plano da Fase 2 §2):
//  - 13 meses a partir do mês de hoje; o saldo de partida é profiles.current_balance
//  - recorrentes ativas normalizadas por mês (mesmos multiplicadores de Recorrentes)
//  - renda e gasto variáveis médios dos últimos 3 meses de transactions não recorrentes
//  - cenários: receita ×1,3 / ×0,7 e despesa ×0,7 / ×1,3, aplicados às recorrentes e aos
//    variáveis; eventos planejados entram sem multiplicador
//  - o mês corrente conta só a fração que falta (o saldo de hoje já tem o que passou)
//  - mês crítico: queda maior que 30% de um mês para o outro, vinda de saldo positivo
// Nada aqui lê Supabase nem relógio: `hoje` entra por parâmetro.

export type CenarioId = 'pessimista' | 'realista' | 'otimista'

export const CENARIOS: { id: CenarioId; rotulo: string; receita: number; despesa: number }[] = [
  { id: 'pessimista', rotulo: 'Pessimista', receita: 0.7, despesa: 1.3 },
  { id: 'realista', rotulo: 'Realista', receita: 1, despesa: 1 },
  { id: 'otimista', rotulo: 'Otimista', receita: 1.3, despesa: 0.7 },
]

export type FrequenciaPlan = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual'

/** mesmos multiplicadores de Recorrentes (normalizeToMonthly) */
export const MULT_MENSAL: Record<FrequenciaPlan, number> = {
  weekly: 4.33,
  biweekly: 2.17,
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
}

export interface RecorrentePlan {
  nome: string
  tipo: 'income' | 'expense' | 'transfer'
  valor: number
  frequencia: FrequenciaPlan
  /** YYYY-MM-DD */
  inicio: string
  fim: string | null
}

export interface EventoPlan {
  id: string
  nome: string
  tipo: 'in' | 'out'
  valor: number
  /** YYYY-MM-DD */
  data: string
  confirmado: boolean
  categoria: string | null
  nota: string | null
}

export interface EntradaProjecao {
  /** YYYY-MM-DD */
  hoje: string
  saldoHoje: number
  recorrentes: RecorrentePlan[]
  rendaVariavel: number
  gastoVariavel: number
  eventos: EventoPlan[]
}

export const N_MESES = 13

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// ─── datas ────────────────────────────────────────────────────────────────────

const pad2 = (n: number) => String(n).padStart(2, '0')

/** índice do mês de `data` em relação ao mês de `hoje` (0 = mês corrente) */
export function idxMes(data: string, hoje: string): number {
  return (Number(data.slice(0, 4)) - Number(hoje.slice(0, 4))) * 12 + (Number(data.slice(5, 7)) - Number(hoje.slice(5, 7)))
}

/** [ano, mês 1-12] do mês i a partir de hoje */
export function anoMes(hoje: string, i: number): [number, number] {
  const base = Number(hoje.slice(0, 4)) * 12 + (Number(hoje.slice(5, 7)) - 1) + i
  return [Math.floor(base / 12), (base % 12) + 1]
}

/** "outubro" ou "outubro de 2026" (o ano aparece com `comAno`, no mês 0 e na virada do ano) */
export function nomeMes(hoje: string, i: number, comAno = false): string {
  const [a, m] = anoMes(hoje, i)
  return MESES[m - 1] + (comAno || i === 0 || i === N_MESES - 1 ? ` de ${a}` : '')
}

/** "out 26", "nov": rótulo do eixo; ano no primeiro, em janeiro e no último */
export function rotuloEixo(hoje: string, i: number): string {
  const [a, m] = anoMes(hoje, i)
  const comAno = i === 0 || m === 1 || i === N_MESES - 1
  return MESES_CURTOS[m - 1] + (comAno ? ` ${String(a).slice(2)}` : '')
}

/** "24 out" */
export function dataCurta(data: string): string {
  return `${Number(data.slice(8, 10))} ${MESES_CURTOS[Number(data.slice(5, 7)) - 1]}`
}

/** soma `n` meses a uma data ISO, mantendo o dia (ou o último dia do mês destino) */
export function somarMeses(data: string, n: number): string {
  const base = Number(data.slice(0, 4)) * 12 + (Number(data.slice(5, 7)) - 1) + n
  const a = Math.floor(base / 12)
  const m = (base % 12) + 1
  const dim = new Date(a, m, 0).getDate()
  return `${a}-${pad2(m)}-${pad2(Math.min(Number(data.slice(8, 10)), dim))}`
}

/** "2026-10-03" no fuso de São Paulo */
export function hojeSP(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora)
}

/** primeiro dia do mês, 3 meses antes de `hoje` (janela da média variável) */
export function inicioJanelaVariavel(hoje: string): string {
  const [a, m] = anoMes(hoje, -3)
  return `${a}-${pad2(m)}-01`
}

/** primeiro dia do mês de `hoje` (fim exclusivo da janela) */
export function inicioMesAtual(hoje: string): string {
  return `${hoje.slice(0, 7)}-01`
}

// ─── média variável ───────────────────────────────────────────────────────────

export interface TxVariavel {
  amount: number
  type: 'income' | 'expense' | 'transfer'
  date: string
  recurring_transaction_id: string | null
}

/**
 * Renda e gasto variáveis por mês: média dos meses cheios que antecedem `hoje` (até 3),
 * só de lançamentos não recorrentes, sem transferências e sem previstos futuros.
 * Divide pelo número de meses da janela em que o usuário já tinha movimento (mín. 1).
 */
export function mediaVariavel(txs: TxVariavel[], hoje: string): { renda: number; gasto: number; meses: number } {
  const ini = inicioJanelaVariavel(hoje)
  const fim = inicioMesAtual(hoje)
  let renda = 0
  let gasto = 0
  const meses = new Set<string>()
  for (const t of txs) {
    if (t.recurring_transaction_id || t.type === 'transfer') continue
    if (t.date < ini || t.date >= fim) continue
    meses.add(t.date.slice(0, 7))
    if (t.type === 'income') renda += Number(t.amount)
    else gasto += Number(t.amount)
  }
  const n = Math.max(1, meses.size)
  return { renda: renda / n, gasto: gasto / n, meses: meses.size }
}

// ─── projeção ─────────────────────────────────────────────────────────────────

function ativaNoMes(r: RecorrentePlan, hoje: string, i: number): boolean {
  const [a, m] = anoMes(hoje, i)
  const primeiro = `${a}-${pad2(m)}-01`
  const ultimo = `${a}-${pad2(m)}-${pad2(new Date(a, m, 0).getDate())}`
  if (r.inicio > ultimo) return false
  if (r.fim && r.fim < primeiro) return false
  return true
}

/** fração do mês corrente que ainda vai acontecer */
export function fracaoRestante(hoje: string): number {
  const a = Number(hoje.slice(0, 4))
  const m = Number(hoje.slice(5, 7))
  const dim = new Date(a, m, 0).getDate()
  return Math.max(0, (dim - Number(hoje.slice(8, 10))) / dim)
}

/** soma mensal normalizada das recorrentes ativas no mês i: [entradas, saídas] (sem transferências) */
export function recorrentesDoMes(recorrentes: RecorrentePlan[], hoje: string, i: number): [number, number] {
  let ent = 0
  let sai = 0
  for (const r of recorrentes) {
    if (r.tipo === 'transfer' || !ativaNoMes(r, hoje, i)) continue
    const v = r.valor * MULT_MENSAL[r.frequencia]
    if (r.tipo === 'income') ent += v
    else sai += v
  }
  return [ent, sai]
}

/** saldo de fim de cada um dos 13 meses (índice 0 = fechamento do mês de hoje) */
export function projetar(e: EntradaProjecao, cenario: CenarioId): number[] {
  const sc = CENARIOS.find(c => c.id === cenario) ?? CENARIOS[1]
  const frac = fracaoRestante(e.hoje)
  const serie: number[] = []
  let saldo = e.saldoHoje
  for (let i = 0; i < N_MESES; i++) {
    const f = i === 0 ? frac : 1
    const [ent, sai] = recorrentesDoMes(e.recorrentes, e.hoje, i)
    let liquido = ((ent + e.rendaVariavel) * sc.receita - (sai + e.gastoVariavel) * sc.despesa) * f
    for (const ev of e.eventos) {
      if (ev.data < e.hoje || idxMes(ev.data, e.hoje) !== i) continue
      liquido += ev.tipo === 'in' ? ev.valor : -ev.valor
    }
    saldo += liquido
    serie.push(saldo)
  }
  return serie
}

export interface MesCritico {
  /** índice do mês (1..12) */
  i: number
  de: number
  para: number
  /** a maior saída do mês: evento planejado; se não houver, a maior recorrente */
  motivo: string
}

export interface Analise {
  min: number
  iMin: number
  max: number
  iMax: number
  critico: MesCritico | null
  /** primeiro mês com saldo negativo, ou -1 */
  negDesde: number
  s6: number
  s12: number
}

/** maior saída do mês i (nome), para explicar o mês crítico */
export function maiorSaida(e: EntradaProjecao, i: number): string {
  let melhor: { nome: string; valor: number } | null = null
  for (const ev of e.eventos) {
    if (ev.tipo !== 'out' || ev.data < e.hoje || idxMes(ev.data, e.hoje) !== i) continue
    if (!melhor || ev.valor > melhor.valor) melhor = { nome: ev.nome, valor: ev.valor }
  }
  if (melhor) return melhor.nome
  for (const r of e.recorrentes) {
    if (r.tipo !== 'expense' || !ativaNoMes(r, e.hoje, i)) continue
    const v = r.valor * MULT_MENSAL[r.frequencia]
    if (!melhor || v > melhor.valor) melhor = { nome: r.nome, valor: v }
  }
  return melhor ? melhor.nome : ''
}

export function analisar(serie: number[], e: EntradaProjecao): Analise {
  let min = Infinity
  let iMin = 0
  let max = -Infinity
  let iMax = 0
  let negDesde = -1
  serie.forEach((v, i) => {
    if (v < min) { min = v; iMin = i }
    if (v > max) { max = v; iMax = i }
    if (negDesde < 0 && v < 0) negDesde = i
  })
  let critico: MesCritico | null = null
  for (let i = 1; i < serie.length; i++) {
    const a = serie[i - 1]
    const b = serie[i]
    if (a > 0 && (a - b) / a > 0.3) {
      critico = { i, de: a, para: b, motivo: maiorSaida(e, i) }
      break
    }
  }
  return {
    min, iMin, max, iMax, critico, negDesde,
    s6: serie[Math.min(6, serie.length - 1)] ?? 0,
    s12: serie[serie.length - 1] ?? 0,
  }
}

// ─── laboratório ──────────────────────────────────────────────────────────────

/** valor mínimo para um evento ser "alto" o bastante para virar pergunta */
export const VALOR_MINIMO_LAB = 500

export type OpcaoLab = 'antecipar' | 'manter' | 'adiar'

/** o maior evento de despesa dos próximos 12 meses, se for de valor alto; senão null (sem laboratório) */
export function candidatoLab(eventos: EventoPlan[], hoje: string): EventoPlan | null {
  let melhor: EventoPlan | null = null
  for (const ev of eventos) {
    if (ev.tipo !== 'out' || ev.data < hoje) continue
    const i = idxMes(ev.data, hoje)
    if (i < 0 || i > 12) continue
    if (!melhor || ev.valor > melhor.valor) melhor = ev
  }
  return melhor && melhor.valor >= VALOR_MINIMO_LAB ? melhor : null
}

/**
 * As três datas do laboratório: antecipar 3 meses (nunca antes de hoje), manter, adiar 3 meses.
 * Se antecipar não muda a data (o evento já está perto de hoje), a opção some (valor null).
 */
export function datasLab(ev: EventoPlan, hoje: string): Record<OpcaoLab, string | null> {
  let antes = somarMeses(ev.data, -3)
  if (antes < hoje) antes = hoje
  return {
    antecipar: antes < ev.data ? antes : null,
    manter: ev.data,
    adiar: somarMeses(ev.data, 3),
  }
}

export interface MetaViagemPlan {
  nome: string
  /** YYYY-MM-DD */
  data: string
}

export interface EfeitosLab {
  serie: number[]
  min: number
  iMin: number
  /** saldo no mês da meta de viagem; null sem meta ou fora dos 13 meses */
  viagem: { nome: string; saldo: number; i: number } | null
  /** quando o item chega (a data da compra na opção) */
  chega: string
  /** meses entre a data original e a da opção (negativo = antes) */
  deslocamento: number
  /** a compra saiu da janela de 13 meses */
  foraDaJanela: boolean
}

/** a mesma projeção real, com o evento movido para a data da opção */
export function efeitosLab(
  e: EntradaProjecao, ev: EventoPlan, data: string, meta: MetaViagemPlan | null,
): EfeitosLab {
  const eventos = e.eventos.map(x => (x.id === ev.id ? { ...x, data } : x))
  const entrada = { ...e, eventos }
  const serie = projetar(entrada, 'realista')
  const a = analisar(serie, entrada)
  let viagem: EfeitosLab['viagem'] = null
  if (meta) {
    const i = idxMes(meta.data, e.hoje)
    if (i >= 0 && i < serie.length) viagem = { nome: meta.nome, saldo: serie[i], i }
  }
  return {
    serie, min: a.min, iMin: a.iMin, viagem, chega: data,
    deslocamento: idxMes(data, e.hoje) - idxMes(ev.data, e.hoje),
    foraDaJanela: idxMes(data, e.hoje) > 12,
  }
}

// ─── geometria da curva (viewBox 1000 × 240; pontos e rótulos em % no HTML) ───

/** posição horizontal (%) do vértice k; k = 0 é hoje, k = 1..13 os fins de mês */
export const posX = (k: number): number => 1.5 + k * (96 / 13)

/** escala vertical em % da altura, com folga acima e abaixo e o zero sempre visível */
export function escalaY(serie: number[], saldoHoje: number): (v: number) => number {
  let lo = Math.min(0, saldoHoje)
  let hi = Math.max(0, saldoHoje)
  for (const v of serie) { lo = Math.min(lo, v); hi = Math.max(hi, v) }
  if (hi === lo) hi = lo + 1
  const pad = (hi - lo) * 0.06
  lo -= pad
  hi += pad * 1.6
  return v => 8 + ((hi - v) / (hi - lo)) * 84
}

export interface CurvaGeo {
  /** linha: 14 vértices (hoje + 13 fins de mês) */
  d: string
  /** área entre a linha e o zero */
  area: string
  /** y do zero no viewBox */
  y0: number
  /** % da altura do zero e função de escala */
  y: (v: number) => number
}

export function curvaSaldo(serie: number[], saldoHoje: number): CurvaGeo {
  const y = escalaY(serie, saldoHoje)
  const vals = [saldoHoje, ...serie]
  const pts = vals.map((v, k): [number, number] => [posX(k) * 10, y(v) * 2.4])
  const d = 'M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')
  const y0 = y(0) * 2.4
  const ult = pts[pts.length - 1]
  const area = `${d} L${ult[0].toFixed(1)} ${y0.toFixed(1)} L${pts[0][0].toFixed(1)} ${y0.toFixed(1)} Z`
  return { d, area, y0, y }
}

// ─── texto (frases determinísticas de Sy; números em negrito) ─────────────────

export interface ParteTexto { t: string; b?: boolean; w?: boolean; n?: boolean }

const NBSP = ' '

/** `R$ 1.840` (NBSP depois do R$, en-dash antes do negativo) */
export function reais(n: number): string {
  const r = Math.round(n)
  return `${r < 0 ? '– ' : ''}R$${NBSP}${Math.abs(r).toLocaleString('pt-BR')}`
}

/** `R$ 1.840,00` */
export function reais2(n: number): string {
  return `R$${NBSP}${Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "março" (ou "março de 2027") do mês de uma data ISO */
export function nomeMesDe(data: string, comAno = false): string {
  const m = MESES[Number(data.slice(5, 7)) - 1]
  return comAno ? `${m} de ${data.slice(0, 4)}` : m
}

/** "15 de março" */
export function dataLonga(data: string): string {
  return `${Number(data.slice(8, 10))} de ${nomeMesDe(data)}`
}

const b = (v: number, w = false): ParteTexto => ({ t: reais(v), b: true, n: true, w: w || v < 0 })

/** linha "Ponto mais baixo … · próximo mês crítico: …" */
export function textoDe(a: Analise, hoje: string): ParteTexto[] {
  const p: ParteTexto[] = [
    { t: 'Ponto mais baixo ' }, b(a.min), { t: ` em ${nomeMes(hoje, a.iMin, true)} · ` },
  ]
  if (a.critico) {
    p.push({ t: 'próximo mês crítico: ' }, { t: nomeMes(hoje, a.critico.i), b: true })
    if (a.critico.motivo) p.push({ t: `, ${a.critico.motivo}` })
  } else {
    p.push({ t: 'nenhum mês crítico neste cenário' })
  }
  return p
}

/** a fala de Sy no topo: 1 ou 2 frases, só com números da projeção */
export function falaPlanejamento(a: Analise, hoje: string): ParteTexto[] {
  const c = a.critico
  if (!c) {
    return [
      { t: 'Nenhum mês crítico neste cenário: o saldo nunca cai mais de 30% de um mês para o outro. O ponto mais baixo é ' },
      b(a.min), { t: `, em ${nomeMes(hoje, a.iMin, true)}.` },
    ]
  }
  const p: ParteTexto[] = [{ t: `${cap(nomeMes(hoje, c.i))} é o mês que aperta: ` }]
  p.push({ t: c.motivo ? `${c.motivo} leva o saldo de ` : 'o saldo cai de ' }, b(c.de), { t: ' para ' }, b(c.para), { t: '.' })
  if (a.negDesde >= 0) {
    p.push({ t: ` Neste cenário o saldo fica negativo já em ${nomeMes(hoje, a.negDesde, true)} e chega a ` }, b(a.min, true), { t: ` em ${nomeMes(hoje, a.iMin, true)}.` })
  } else if (a.iMin !== c.i) {
    p.push({ t: ` O ponto mais baixo vem em ${nomeMes(hoje, a.iMin)}, ` }, b(a.min), { t: '.' })
  } else {
    p.push({ t: ' É também o ponto mais baixo do ano.' })
  }
  return p
}

/** a prosa embaixo da curva */
export function prosaCurva(serie: number[], a: Analise, saldoHoje: number, hoje: string, cenario: string, previa: boolean): ParteTexto[] {
  return [
    { t: `Saldo de fim de mês no cenário ${cenario}${previa ? ', com a prévia do laboratório' : ''}: de ` },
    b(saldoHoje), { t: ' hoje para ' }, b(serie[0]), { t: ' no fechamento de ' },
    { t: `${nomeMes(hoje, 0)}. O mais alto é ` }, b(a.max), { t: `, em ${nomeMes(hoje, a.iMax, true)}; o mais baixo, ` }, b(a.min),
    { t: `, em ${nomeMes(hoje, a.iMin, true)}. ${cap(nomeMes(hoje, N_MESES - 1, true))} fecha em ` }, b(a.s12), { t: '.' },
  ]
}
