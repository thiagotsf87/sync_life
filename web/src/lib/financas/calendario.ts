// Regras puras da tela Calendário v5 (Fase 2, prototypes/v5/app/financas-calendario.html):
// o que o protótipo calcula no JS da página. Grade dom a sáb com dias de fora reais, tipo e forma
// do ponto, saldo do dia, da semana e do mês, pendentes, projeção do mês e a expansão das
// recorrentes em ocorrências previstas. Sem I/O, sem React; `hoje` entra por parâmetro.
//
// Regras de saldo (decisão do protótipo, item 1):
//  - o saldo é o do MÊS: entradas menos saídas; transferências ficam fora;
//  - previstos (recorrentes, eventos planejados, proventos anunciados e lançamentos futuros)
//    só entram nas somas de um dia DEPOIS de hoje; antes disso são "pendentes";
//  - nunca é o `profiles.current_balance`.

import { brl as brlHub } from '@/lib/financas/hub'
import { addDias, addMeses, entreDias, type RecItem } from '@/lib/financas/recorrentes'
import {
  intervaloMes, linhaDeTransacao, mesDe, mesIgual, nomeMes,
  type MesRef, type TransacaoDb, type TxLinha,
} from '@/lib/financas/transacoes'

export const NBSP = ' '

export type TipoPonto = 'entrada' | 'saida' | 'transferencia' | 'recorrente' | 'planejado' | 'provento'
export type OrigemItem = 'transacao' | 'recorrente' | 'evento' | 'provento'

/** Um lançamento (real ou previsto) num dia do calendário. */
export interface ItemCal {
  /** chave estável (id da linha ou id sintético da ocorrência) */
  id: string
  /** YYYY-MM-DD */
  data: string
  dia: number
  tipo: TipoPonto
  desc: string
  cat: string
  /** com sinal: entrada positiva, saída negativa; transferência sempre positiva */
  valor: number
  previsto: boolean
  origem: OrigemItem
  /** transação real: a linha para o painel de edição */
  tx?: TxLinha
  /** evento planejado: id da linha */
  eventoId?: string
  /** provento: o ticker */
  ticker?: string
  /** transferência: `Origem → Destino` */
  contas?: string
}

// ─── linhas do banco (formas mínimas) ──────────────────────────────────────────

export interface EventoDb {
  id: string
  name: string
  amount: number | string
  type: 'income' | 'expense'
  planned_date: string
  is_confirmed: boolean
  categories?: { id: string; name: string } | null
}

export interface ProventoDb {
  id: string
  total_amount: number | string
  payment_date: string
  portfolio_assets?: { ticker: string | null } | null
}

const r2 = (n: number) => Math.round(n * 100) / 100
const pad2 = (n: number) => String(n).padStart(2, '0')
const diaDe = (iso: string) => Number(iso.slice(8, 10))

// ─── formatação ────────────────────────────────────────────────────────────────

/** `R$ 1.840,00` sem sinal (NBSP depois do R$). */
export const brlAbs = (n: number): string => brlHub(Math.abs(n))
/** `+ R$ 1.840,00` / `– R$ 232,40` / `R$ 0,00`. */
export const assinadoBrl = (n: number): string => (n < 0 ? '– ' : n > 0 ? '+ ' : '') + brlAbs(n)
/** `R$ 1.840` / `– R$ 320` (KPIs, sem centavos). */
export const brlInteiro = (n: number): string =>
  `${Math.round(n) < 0 ? '– ' : ''}R$${NBSP}${Math.round(Math.abs(n)).toLocaleString('pt-BR')}`

/** Saldo curto da célula no desktop: `+1.963`, `–232`, `0`. */
export function curtoDesk(n: number): string {
  const a = Math.round(Math.abs(n))
  return a === 0 ? '0' : (n < 0 ? '–' : '+') + a.toLocaleString('pt-BR')
}

/** Saldo curto da célula no mobile: `k` a partir de mil (`+1,8k`). */
export function curtoMob(n: number): string {
  const a = Math.abs(n)
  if (Math.round(a) === 0) return '0'
  const t = a >= 1000 ? (a / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k' : Math.round(a).toLocaleString('pt-BR')
  return (n < 0 ? '–' : '+') + t
}

const DOW = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
export const DOW_CURTO_DESK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const DOW_CURTO_MOB = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export const capitalizar = (s: string): string => s.charAt(0).toLocaleUpperCase('pt-BR') + s.slice(1)

/** dia da semana de uma data ISO, 0 = domingo (sem fuso: a data é só calendário). */
export const diaDaSemana = (iso: string): number => {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay()
}
export const nomeDiaSemana = (iso: string): string => DOW[diaDaSemana(iso)]

/** `3 de outubro` */
export const diaDoMes = (iso: string): string => `${diaDe(iso)} de ${nomeMes(mesDe(iso))}`

export const isoDoDia = (mes: MesRef, dia: number): string => `${mes.ano}-${pad2(mes.mes)}-${pad2(dia)}`
export const diasNoMes = (mes: MesRef): number => new Date(mes.ano, mes.mes, 0).getDate()

/** Dia que abre selecionado: hoje se for o mês de hoje, senão o dia 1. */
export function diaPadrao(mes: MesRef, hoje: string): string {
  return mesIgual(mes, mesDe(hoje)) ? hoje : isoDoDia(mes, 1)
}

export type ModoMes = 'atual' | 'passado' | 'futuro'
export function modoDoMes(mes: MesRef, hoje: string): ModoMes {
  const d = (mes.ano - Number(hoje.slice(0, 4))) * 12 + (mes.mes - Number(hoje.slice(5, 7)))
  return d === 0 ? 'atual' : d < 0 ? 'passado' : 'futuro'
}

// ─── ocorrências das recorrentes ───────────────────────────────────────────────

const PASSO_DIAS: Partial<Record<RecItem['freq'], number>> = { weekly: 7, biweekly: 14 }
const PASSO_MESES: Partial<Record<RecItem['freq'], number>> = { monthly: 1, quarterly: 3, annual: 12 }

/** Datas em que a recorrente cai dentro do mês (respeita início, fim e o passo da frequência). */
export function ocorrenciasNoMes(it: RecItem, mes: MesRef): string[] {
  if (it.pausada) return []
  const { inicio, fim } = intervaloMes(mes)
  const out: string[] = []
  const dentro = (d: string) => d >= inicio && d <= fim && d >= it.inicio && (!it.fim || d <= it.fim)

  const passoD = PASSO_DIAS[it.freq]
  if (passoD) {
    let d = it.inicio
    if (d < inicio) d = addDias(d, Math.ceil(entreDias(d, inicio) / passoD) * passoD)
    while (d <= fim && out.length < 8) {
      if (dentro(d)) out.push(d)
      d = addDias(d, passoD)
    }
    return out
  }

  const passoM = PASSO_MESES[it.freq] ?? 1
  const diff = (mes.ano - Number(it.inicio.slice(0, 4))) * 12 + (mes.mes - Number(it.inicio.slice(5, 7)))
  if (diff < 0 || diff % passoM !== 0) return []
  const d = addMeses(`${mes.ano}-${pad2(mes.mes)}-01`, 0, it.dia)
  return dentro(d) ? [d] : []
}

/** Chaves das ocorrências que já viraram transação (não duplicam o ponto previsto). */
export function chavesMaterializadas(txs: { recurring_transaction_id: string | null; date: string }[], freqs: Map<string, RecItem['freq']>): Set<string> {
  const s = new Set<string>()
  for (const t of txs) {
    if (!t.recurring_transaction_id) continue
    const f = freqs.get(t.recurring_transaction_id)
    // semanal e quinzenal: a data exata; mensal em diante: o mês inteiro
    s.add(f === 'weekly' || f === 'biweekly' ? `${t.recurring_transaction_id}|${t.date}` : `${t.recurring_transaction_id}|${t.date.slice(0, 7)}`)
  }
  return s
}

/** Ocorrências previstas (de hoje em diante) das recorrentes ativas, sem as já materializadas. */
export function itensRecorrentes(recs: RecItem[], mes: MesRef, hoje: string, materializadas: Set<string>): ItemCal[] {
  const itens: ItemCal[] = []
  for (const r of recs) {
    for (const d of ocorrenciasNoMes(r, mes)) {
      if (d < hoje) continue
      const chave = r.freq === 'weekly' || r.freq === 'biweekly' ? `${r.id}|${d}` : `${r.id}|${d.slice(0, 7)}`
      if (materializadas.has(chave)) continue
      const sinal = r.tipo === 'income' ? 1 : r.tipo === 'expense' ? -1 : 1
      itens.push({
        id: `rec-${r.id}-${d}`,
        data: d,
        dia: diaDe(d),
        tipo: r.tipo === 'transfer' ? 'transferencia' : 'recorrente',
        desc: r.nome,
        cat: r.categoria ?? '',
        valor: sinal * Math.abs(r.valor),
        previsto: true,
        origem: 'recorrente',
      })
    }
  }
  return itens
}

// ─── itens do mês ──────────────────────────────────────────────────────────────

export function itemDeTransacao(t: TransacaoDb): ItemCal {
  const l = linhaDeTransacao(t)
  const transf = l.tipo === 'tr'
  const recPrevista = l.recorrente && l.previsto && !transf
  const tipo: TipoPonto = transf ? 'transferencia' : recPrevista ? 'recorrente' : l.tipo === 'in' ? 'entrada' : 'saida'
  return {
    id: l.id,
    data: l.date,
    dia: diaDe(l.date),
    tipo,
    desc: l.desc,
    cat: transf ? '' : l.categoriaNome,
    valor: transf ? l.valor : l.tipo === 'in' ? l.valor : -l.valor,
    previsto: l.previsto,
    origem: 'transacao',
    tx: l,
    contas: transf ? `${l.contaDeNome} → ${l.contaParaNome}` : undefined,
  }
}

export function itemDeEvento(e: EventoDb): ItemCal {
  const v = Math.abs(Number(e.amount))
  return {
    id: `ev-${e.id}`,
    data: e.planned_date,
    dia: diaDe(e.planned_date),
    tipo: 'planejado',
    desc: e.name,
    cat: e.categories?.name ?? '',
    valor: e.type === 'income' ? v : -v,
    previsto: true,
    origem: 'evento',
    eventoId: e.id,
  }
}

export function itemDeProvento(p: ProventoDb): ItemCal {
  const ticker = p.portfolio_assets?.ticker ?? ''
  return {
    id: `prov-${p.id}`,
    data: p.payment_date,
    dia: diaDe(p.payment_date),
    tipo: 'provento',
    desc: ticker ? `Provento ${ticker}` : 'Provento',
    cat: 'Proventos',
    valor: Math.abs(Number(p.total_amount)),
    previsto: true,
    origem: 'provento',
    ticker,
  }
}

export const ORDEM_PONTO: Record<TipoPonto, number> = {
  recorrente: 0, entrada: 1, saida: 2, transferencia: 3, planejado: 4, provento: 5,
}

export function ordenarItens(itens: ItemCal[]): ItemCal[] {
  return [...itens].sort((a, b) => ORDEM_PONTO[a.tipo] - ORDEM_PONTO[b.tipo] || a.desc.localeCompare(b.desc, 'pt-BR'))
}

export interface FontesCal {
  transacoes: TransacaoDb[]
  eventos: EventoDb[]
  proventos: ProventoDb[]
  recorrentes: RecItem[]
}

/** Todos os itens do mês: o que aconteceu e o que está marcado. */
export function itensDoMes(f: FontesCal, mes: MesRef, hoje: string): ItemCal[] {
  const freqs = new Map(f.recorrentes.map(r => [r.id, r.freq]))
  const mat = chavesMaterializadas(f.transacoes, freqs)
  return [
    ...f.transacoes.map(itemDeTransacao),
    ...f.eventos.map(itemDeEvento),
    ...f.proventos.map(itemDeProvento),
    ...itensRecorrentes(f.recorrentes, mes, hoje, mat),
  ]
}

export function agruparPorDia(itens: ItemCal[]): Map<string, ItemCal[]> {
  const m = new Map<string, ItemCal[]>()
  for (const i of itens) {
    const l = m.get(i.data)
    if (l) l.push(i)
    else m.set(i.data, [i])
  }
  for (const [k, l] of m) m.set(k, ordenarItens(l))
  return m
}

// ─── pontos ────────────────────────────────────────────────────────────────────

export const entra = (i: Pick<ItemCal, 'valor' | 'tipo'>): boolean => i.valor > 0 && i.tipo !== 'transferencia'

/** Classe do ponto: a forma é a natureza, `in` marca a direção (entra). */
export const classePonto = (i: Pick<ItemCal, 'valor' | 'tipo'>): string => i.tipo + (entra(i) ? ' in' : '')

export const MAX_PONTOS = 4

export function pontosDoDia(itens: ItemCal[]): { classes: string[]; mais: number } {
  const cls: string[] = []
  for (const i of itens) {
    const c = classePonto(i)
    if (!cls.includes(c)) cls.push(c)
  }
  cls.sort((a, b) => ORDEM_PONTO[a.split(' ')[0] as TipoPonto] - ORDEM_PONTO[b.split(' ')[0] as TipoPonto])
  return { classes: cls.slice(0, MAX_PONTOS), mais: Math.max(0, cls.length - MAX_PONTOS) }
}

// ─── saldos ────────────────────────────────────────────────────────────────────

export interface SomaDia { e: number; s: number; saldo: number; conta: boolean }

/** Um item entra nas somas do dia: sem transferência, e previsto só depois de hoje. */
export const contaNoSaldo = (i: ItemCal, hoje: string): boolean =>
  i.tipo !== 'transferencia' && (!i.previsto || i.data > hoje)

export function somaDia(itens: ItemCal[], hoje: string): SomaDia {
  let e = 0
  let s = 0
  let conta = false
  for (const i of itens) {
    if (!contaNoSaldo(i, hoje)) continue
    conta = true
    if (i.valor > 0) e += i.valor
    else s -= i.valor
  }
  return { e: r2(e), s: r2(s), saldo: r2(e - s), conta }
}

/** Saldo do mês de 1 até `ate` (inclusive): entradas menos saídas, na regra de `somaDia`. */
export function saldoAcumulado(mes: MesRef, porDia: Map<string, ItemCal[]>, hoje: string, ate: string): number {
  let t = 0
  const n = diasNoMes(mes)
  for (let d = 1; d <= n; d++) {
    const iso = isoDoDia(mes, d)
    if (iso > ate) break
    t += somaDia(porDia.get(iso) ?? [], hoje).saldo
  }
  return r2(t)
}

// ─── grade ─────────────────────────────────────────────────────────────────────

export interface Celula {
  /** vazio nas células de fora do mês */
  iso: string | null
  dia: number
  fora: boolean
}

/** Células do mês em linhas de 7 (dom a sáb), com os dias reais dos meses vizinhos nas pontas. */
export function celulasDoMes(mes: MesRef): Celula[][] {
  const n = diasNoMes(mes)
  const dow1 = new Date(mes.ano, mes.mes - 1, 1).getDay()
  const ant = diasNoMes({ ano: mes.mes === 1 ? mes.ano - 1 : mes.ano, mes: mes.mes === 1 ? 12 : mes.mes - 1 })
  const cel: Celula[] = []
  for (let k = dow1; k > 0; k--) cel.push({ iso: null, dia: ant - k + 1, fora: true })
  for (let d = 1; d <= n; d++) cel.push({ iso: isoDoDia(mes, d), dia: d, fora: false })
  let nx = 1
  while (cel.length % 7) cel.push({ iso: null, dia: nx++, fora: true })
  const linhas: Celula[][] = []
  for (let i = 0; i < cel.length; i += 7) linhas.push(cel.slice(i, i + 7))
  return linhas
}

export interface Semana {
  celulas: Celula[]
  /** soma dos saldos dos dias do mês na semana */
  saldo: number
  /** a semana tem algum item */
  tem: boolean
  /** a semana inclui previstos depois de hoje */
  prev: boolean
}

export function semanasDoMes(mes: MesRef, porDia: Map<string, ItemCal[]>, hoje: string): Semana[] {
  return celulasDoMes(mes).map(celulas => {
    let saldo = 0
    let prev = false
    let tem = false
    for (const c of celulas) {
      if (!c.iso) continue
      const its = porDia.get(c.iso) ?? []
      if (its.length) tem = true
      if (c.iso > hoje && its.length) prev = true
      saldo += somaDia(its, hoje).saldo
    }
    return { celulas, saldo: r2(saldo), tem, prev }
  })
}

/** Rótulo de leitura da célula (leitor de tela). */
export function ariaCelula(iso: string, itens: ItemCal[], hoje: string): string {
  const n = itens.length
  const t = somaDia(itens, hoje)
  const base = `${nomeDiaSemana(iso)}, ${diaDoMes(iso)}${iso === hoje ? ', hoje' : ''}`
  if (!n) return `${base}, nada marcado`
  return `${base}, ${n} ${n === 1 ? 'item' : 'itens'}${t.conta ? `, saldo do dia ${assinadoBrl(t.saldo)}${iso > hoje ? ' previsto' : ''}` : ''}`
}

// ─── números do mês ────────────────────────────────────────────────────────────

export interface Pendentes { qtd: number; aSair: number; aEntrar: number }

export function pendentesDe(itens: ItemCal[]): Pendentes {
  let aSair = 0
  let aEntrar = 0
  let qtd = 0
  for (const i of itens) {
    if (!i.previsto) continue
    qtd++
    if (i.tipo === 'transferencia') continue
    if (i.valor < 0) aSair -= i.valor
    else aEntrar += i.valor
  }
  return { qtd, aSair: r2(aSair), aEntrar: r2(aEntrar) }
}

export interface NumerosMes {
  modo: ModoMes
  /** entradas menos saídas do mês (atual: até hoje; passado: o mês; futuro: o previsto) */
  saldo: number
  entradas: number
  saidas: number
  pendentes: Pendentes
}

export function numerosDoMes(mes: MesRef, itens: ItemCal[], hoje: string): NumerosMes {
  const modo = modoDoMes(mes, hoje)
  let e = 0
  let s = 0
  for (const i of itens) {
    if (i.tipo === 'transferencia') continue
    // atual e passado: o que aconteceu; futuro: o que está marcado
    const vale = modo === 'futuro' ? i.previsto : !i.previsto
    if (!vale) continue
    if (i.valor > 0) e += i.valor
    else s -= i.valor
  }
  return { modo, saldo: r2(e - s), entradas: r2(e), saidas: r2(s), pendentes: pendentesDe(itens) }
}

/**
 * Projeção do mês: a MESMA de Planejamento e do hub (`projetar(...)` no cenário realista; o índice
 * 0 é o fechamento do mês de hoje). Meses fora dos 13 da curva, ou já fechados, não têm projeção.
 */
export function projecaoDoMes(serie: number[] | null, mes: MesRef, hoje: string): number | null {
  if (!serie) return null
  const i = (mes.ano - Number(hoje.slice(0, 4))) * 12 + (mes.mes - Number(hoje.slice(5, 7)))
  if (i < 0 || i >= serie.length) return null
  return serie[i]
}

// ─── textos ────────────────────────────────────────────────────────────────────

/** Segunda linha do item no painel do dia. */
export function subItem(i: ItemCal, hoje: string): string {
  switch (i.tipo) {
    case 'recorrente': return `Recorrente${i.cat ? ` · ${i.cat}` : ''}${i.origem === 'recorrente' ? ' · editar em Recorrentes →' : ''}`
    case 'planejado': return `Planejado${i.cat ? ` · ${i.cat}` : ''} · em Planejamento`
    case 'provento': return 'Provento previsto · vem de 06 Patrimônio'
    case 'transferencia': return `Transferência${i.contas ? ` · ${i.contas}` : ''}`
    default: return `${i.valor > 0 ? 'Entrada' : 'Saída'}${i.cat ? ` · ${i.cat}` : ''}${i.data > hoje ? ' · previsto' : ''}`
  }
}

/** Valor do item no painel: transferência sem sinal, o resto assinado. */
export const valorItem = (i: ItemCal): string => (i.tipo === 'transferencia' ? brlAbs(i.valor) : assinadoBrl(i.valor))

export const textoQuantidadeCal = (n: number, mes: string): string => `${n} ${n === 1 ? 'transação' : 'transações'} em ${mes}`
