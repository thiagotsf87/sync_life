// Regras puras da tela Recorrentes v5 (prototypes/v5/app/financas-recorrentes.html):
// normalização mensal, totais, % comprometido, próxima ocorrência, próximos 30 dias
// (aviso a 7 dias ou menos), agrupamento por frequência e a regra do dia do mês.
// Sem I/O, sem React. Datas em ISO `YYYY-MM-DD` (UTC puro, sem fuso); `hoje` entra por parâmetro.

export type Freq = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual'
export type TipoRec = 'income' | 'expense' | 'transfer'

export interface RecItem {
  id: string
  nome: string
  valor: number
  tipo: TipoRec
  freq: Freq
  dia: number | null
  inicio: string
  fim: string | null
  pausada: boolean
  categoria: string | null
  nota: string | null
}

const NBSP = ' '
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MES_LONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const DSEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export const FREQ_ROTULO: Record<Freq, string> = {
  weekly: 'Semanal', biweekly: 'Quinzenal', monthly: 'Mensal', quarterly: 'Trimestral', annual: 'Anual',
}
export const GRUPOS: { freq: Freq; rotulo: string }[] = [
  { freq: 'monthly', rotulo: 'Mensais' },
  { freq: 'weekly', rotulo: 'Semanais' },
  { freq: 'biweekly', rotulo: 'Quinzenais' },
  { freq: 'quarterly', rotulo: 'Trimestrais' },
  { freq: 'annual', rotulo: 'Anuais' },
]

const FATOR: Record<Freq, number> = { weekly: 4.33, biweekly: 2.17, monthly: 1, quarterly: 1 / 3, annual: 1 / 12 }
const PASSO_DIAS: Partial<Record<Freq, number>> = { weekly: 7, biweekly: 14 }
const PASSO_MESES: Partial<Record<Freq, number>> = { monthly: 1, quarterly: 3, annual: 12 }
export const LIMITE_FREE = 5
export const JANELA_DIAS = 30
export const AVISO_DIAS = 7

const r2 = (n: number) => Math.round(n * 100) / 100

/** Equivalente mensal (semanal x4,33, quinzenal x2,17, trimestral /3, anual /12). */
export const normalizarMensal = (valor: number, freq: Freq): number => r2(valor * FATOR[freq])

/** Só mensal, trimestral e anual têm dia do mês; semanal e quinzenal contam a partir do início. */
export const usaDiaDoMes = (freq: Freq): boolean => freq === 'monthly' || freq === 'quarterly' || freq === 'annual'

/** Dia do mês a gravar: null onde não se aplica; 1 a 31 onde se aplica (fora disso, null = inválido). */
export function diaParaSalvar(freq: Freq, dia: number | null | undefined): number | null {
  if (!usaDiaDoMes(freq)) return null
  const n = Number(dia)
  return Number.isInteger(n) && n >= 1 && n <= 31 ? n : null
}

// ── datas ──
const d2n = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
const n2d = (n: number) => new Date(n).toISOString().slice(0, 10)
export const addDias = (iso: string, k: number): string => n2d(d2n(iso) + k * 864e5)
export const entreDias = (a: string, b: string): number => Math.round((d2n(b) - d2n(a)) / 864e5)
const diasNoMes = (y: number, m0: number) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate()

/** Soma `k` meses a um ISO, prendendo o dia ao último do mês (31 vira 30, 28/29). */
export function addMeses(iso: string, k: number, dia?: number | null): string {
  const [y0, m1, d0] = iso.split('-').map(Number)
  const t = m1 - 1 + k
  const y = y0 + Math.floor(t / 12)
  const m = ((t % 12) + 12) % 12
  const d = Math.min(dia || d0, diasNoMes(y, m))
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** "6 out" (com o ano quando não é o de `hoje`). */
export function dataCurta(iso: string, hoje?: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const ano = hoje && y !== Number(hoje.slice(0, 4)) ? ` ${y}` : ''
  return `${d} ${MES[m - 1]}${ano}`
}
export const diaSemana = (iso: string): string => DSEM[new Date(d2n(iso)).getUTCDay()]

/** Recorrente com fim antes de hoje: sai da lista ativa. */
export const encerrada = (it: RecItem, hoje: string): boolean => !!it.fim && it.fim < hoje

/** Próxima data a partir de hoje (hoje conta). Pausada ou encerrada: null. */
export function proxima(it: RecItem, hoje: string): string | null {
  if (it.pausada) return null
  let d: string
  const passoD = PASSO_DIAS[it.freq]
  if (passoD) {
    d = it.inicio
    if (d < hoje) {
      const ciclos = Math.ceil(entreDias(d, hoje) / passoD)
      d = addDias(d, ciclos * passoD)
    }
  } else {
    const passoM = PASSO_MESES[it.freq] ?? 1
    const base = `${it.inicio.slice(0, 7)}-01`
    let k = 0
    d = addMeses(base, 0, it.dia)
    while (d < hoje || d < it.inicio) {
      k += passoM
      d = addMeses(base, k, it.dia)
    }
  }
  if (it.fim && d > it.fim) return null
  return d
}

/** Ocorrências dentro da janela [hoje, hoje + dias]. */
export function ocorrencias(it: RecItem, hoje: string, dias = JANELA_DIAS): string[] {
  const limite = addDias(hoje, dias)
  const out: string[] = []
  let d = proxima(it, hoje)
  const passoD = PASSO_DIAS[it.freq]
  const passoM = PASSO_MESES[it.freq] ?? 1
  while (d && d <= limite && out.length < 10) {
    if (it.fim && d > it.fim) break
    out.push(d)
    d = passoD ? addDias(d, passoD) : addMeses(d, passoM, it.dia)
  }
  return out
}

/** "dia 6", "a cada 14 dias", "dia 20, a cada 3 meses", "10 de março". */
export function quando(it: RecItem): string {
  const dia = it.dia ?? Number(it.inicio.slice(8, 10))
  switch (it.freq) {
    case 'weekly': return 'a cada 7 dias'
    case 'biweekly': return 'a cada 14 dias'
    case 'monthly': return `dia ${dia}`
    case 'quarterly': return `dia ${dia}, a cada 3 meses`
    case 'annual': return `${dia} de ${MES_LONGO[Number(it.inicio.slice(5, 7)) - 1]}`
  }
}

export const emQuanto = (dias: number): string => (dias === 0 ? 'hoje' : dias === 1 ? 'amanhã' : `em ${dias} dias`)

// ── totais ──
export interface Totais {
  /** saída e entrada mensais (ativas, normalizadas), líquido e custo anual das saídas */
  saida: number
  entrada: number
  liquido: number
  anual: number
  nSaidas: number
  nEntradas: number
  ativas: number
  pausadas: number
  encerradas: number
  /** % da renda do perfil comprometida com saídas; null sem renda (nada de número inventado) */
  pct: number | null
}

export function totais(items: RecItem[], hoje: string, renda: number | null): Totais {
  const t = { saida: 0, entrada: 0, nSaidas: 0, nEntradas: 0, ativas: 0, pausadas: 0, encerradas: 0 }
  for (const it of items) {
    if (encerrada(it, hoje)) { t.encerradas++; continue }
    if (it.pausada) { t.pausadas++; continue }
    t.ativas++
    if (it.tipo === 'income') { t.entrada += normalizarMensal(it.valor, it.freq); t.nEntradas++ }
    else if (it.tipo === 'expense') { t.saida += normalizarMensal(it.valor, it.freq); t.nSaidas++ }
  }
  const saida = r2(t.saida)
  const entrada = r2(t.entrada)
  return {
    ...t, saida, entrada, liquido: r2(entrada - saida), anual: r2(saida * 12),
    pct: renda && renda > 0 ? Math.round((saida / renda) * 100) : null,
  }
}

// ── grupos por frequência ──
export interface Grupo {
  freq: Freq
  rotulo: string
  itens: RecItem[]
  saida: number
  entrada: number
  /** todos pausados: o resumo diz "tudo pausado" */
  tudoPausado: boolean
}

function ordem(hoje: string) {
  return (a: RecItem, b: RecItem): number => {
    if (a.freq === 'monthly' && b.freq === 'monthly') return (a.dia ?? 0) - (b.dia ?? 0) || a.nome.localeCompare(b.nome, 'pt-BR')
    const pa = proxima(a, hoje) ?? '9999'
    const pb = proxima(b, hoje) ?? '9999'
    return pa < pb ? -1 : pa > pb ? 1 : a.nome.localeCompare(b.nome, 'pt-BR')
  }
}

/** Grupos na ordem mensais, semanais, quinzenais, trimestrais, anuais; encerradas ficam de fora. */
export function agrupar(items: RecItem[], hoje: string): Grupo[] {
  const out: Grupo[] = []
  for (const g of GRUPOS) {
    const itens = items.filter(it => it.freq === g.freq && !encerrada(it, hoje)).sort(ordem(hoje))
    if (!itens.length) continue
    let saida = 0
    let entrada = 0
    for (const it of itens) {
      if (it.pausada) continue
      if (it.tipo === 'income') entrada += normalizarMensal(it.valor, it.freq)
      else if (it.tipo === 'expense') saida += normalizarMensal(it.valor, it.freq)
    }
    out.push({ freq: g.freq, rotulo: g.rotulo, itens, saida: r2(saida), entrada: r2(entrada), tudoPausado: itens.every(i => i.pausada) })
  }
  return out
}

export const listaEncerradas = (items: RecItem[], hoje: string): RecItem[] =>
  items.filter(it => encerrada(it, hoje)).sort((a, b) => (b.fim ?? '').localeCompare(a.fim ?? ''))

// ── próximos 30 dias ──
export interface Ocorrencia {
  id: string
  nome: string
  tipo: TipoRec
  valor: number
  data: string
  dias: number
  /** saída a 7 dias ou menos: tag coral "em N dias" */
  aviso: boolean
}

export interface Proximos {
  itens: Ocorrencia[]
  saem: number
  entram: number
  ate: string
}

export function proximos30(items: RecItem[], hoje: string): Proximos {
  const itens: Ocorrencia[] = []
  for (const it of items) {
    for (const data of ocorrencias(it, hoje)) {
      const dias = entreDias(hoje, data)
      itens.push({ id: it.id, nome: it.nome, tipo: it.tipo, valor: it.valor, data, dias, aviso: dias <= AVISO_DIAS && it.tipo !== 'income' })
    }
  }
  itens.sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : a.nome.localeCompare(b.nome, 'pt-BR')))
  let saem = 0
  let entram = 0
  for (const o of itens) {
    if (o.tipo === 'income') entram += o.valor
    else if (o.tipo === 'expense') saem += o.valor
  }
  return { itens, saem: r2(saem), entram: r2(entram), ate: addDias(hoje, JANELA_DIAS) }
}

/** A próxima saída (para a frase do cabeçalho). */
export function proximaSaida(items: RecItem[], hoje: string): { nome: string; dias: number } | null {
  let melhor: { nome: string; data: string } | null = null
  for (const it of items) {
    if (it.tipo === 'income') continue
    const d = proxima(it, hoje)
    if (d && (!melhor || d < melhor.data)) melhor = { nome: it.nome, data: d }
  }
  return melhor ? { nome: melhor.nome, dias: entreDias(hoje, melhor.data) } : null
}

// ── formatos (NBSP depois do R$, en-dash no negativo) ──
export const brlInt = (n: number): string => `R$${NBSP}${Math.round(Math.abs(n)).toLocaleString('pt-BR')}`
export const brl = (n: number): string =>
  `R$${NBSP}${Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const sinal = (t: TipoRec): string => (t === 'income' ? '+ ' : t === 'expense' ? '– ' : '')
export const plural = (n: number, s: string, p: string): string => `${n} ${n === 1 ? s : p}`

/** Valor para o campo do formulário: "1.200,00" (sem R$). */
export const valorParaCampo = (n: number): string =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** "1.200,50" ou "1200,5" para número; 0 quando não dá. */
export function lerValor(s: string): number {
  const n = parseFloat(String(s).replace(/[R$\s ]/g, '').replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? Math.abs(n) : 0
}
