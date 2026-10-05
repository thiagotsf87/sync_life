// Regras puras da tela Transações v5 (Fase 2, prototypes/v5/app/financas-transacoes.html):
// o que o protótipo calcula no JS da página (modelo da linha, agrupamento por dia com
// subtotal, ordenação, totais do mês inteiro, navegação de mês, máscara de valor).
// Sem I/O, sem React.

import { brl } from '@/lib/financas/hub'

export const NBSP = ' '
/** "Carregar mais" traz 20 por vez. */
export const PAGINA = 20
/** Quantos previstos aparecem antes de "Ver os N previstos". */
export const PREVISTOS_VISIVEIS = 3

export type TipoTx = 'in' | 'out' | 'tr'
export type FiltroTipo = 'todas' | 'in' | 'out' | 'tr' | 'rec'
export type Ordem = 'recente' | 'antigo' | 'maior' | 'menor'
export type MetodoDb = 'pix' | 'credit' | 'debit' | 'cash' | 'transfer' | 'boleto'
export type TipoDb = 'income' | 'expense' | 'transfer'

export const METODOS: { value: MetodoDb; label: string }[] = [
  { value: 'pix', label: 'Pix' },
  { value: 'credit', label: 'Crédito' },
  { value: 'debit', label: 'Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'boleto', label: 'Boleto' },
]

export const ORDENS: { value: Ordem; label: string }[] = [
  { value: 'recente', label: 'Mais recente' },
  { value: 'antigo', label: 'Mais antigo' },
  { value: 'maior', label: 'Maior valor' },
  { value: 'menor', label: 'Menor valor' },
]

/** Linha da lista e entrada de edição do painel (modelo único, sem tipos do Supabase). */
export interface TxLinha {
  id: string
  date: string
  desc: string
  tipo: TipoTx
  valor: number
  categoriaId: string | null
  categoriaNome: string
  metodo: MetodoDb
  obs: string
  recorrente: boolean
  previsto: boolean
  contaDeId: string | null
  contaParaId: string | null
  contaDeNome: string
  contaParaNome: string
  /** ocorrência prevista de uma recorrente que ainda não virou transação (não abre o painel) */
  ocorrencia?: boolean
}

/** Forma mínima de uma transação vinda do hook v3 (`Transaction`). */
export interface TransacaoDb {
  id: string
  amount: number | string
  type: TipoDb
  description: string | null
  date: string
  payment_method: string | null
  notes: string | null
  is_future: boolean
  recurring_transaction_id: string | null
  category: { id: string; name: string } | null
  account_from?: { id: string; name: string } | null
  account_to?: { id: string; name: string } | null
}

const METODOS_VALIDOS = new Set<string>(METODOS.map(m => m.value))

export const tipoDeDb = (t: TipoDb): TipoTx => (t === 'income' ? 'in' : t === 'expense' ? 'out' : 'tr')
export const tipoParaDb = (t: TipoTx): TipoDb => (t === 'in' ? 'income' : t === 'out' ? 'expense' : 'transfer')

export function linhaDeTransacao(t: TransacaoDb): TxLinha {
  return {
    id: t.id,
    date: t.date,
    desc: t.description ?? '',
    tipo: tipoDeDb(t.type),
    valor: Math.abs(Number(t.amount)),
    categoriaId: t.category?.id ?? null,
    categoriaNome: t.category?.name ?? '',
    metodo: METODOS_VALIDOS.has(t.payment_method ?? '') ? (t.payment_method as MetodoDb) : 'pix',
    obs: t.notes ?? '',
    recorrente: !!t.recurring_transaction_id,
    previsto: t.is_future === true,
    contaDeId: t.account_from?.id ?? null,
    contaParaId: t.account_to?.id ?? null,
    contaDeNome: t.account_from?.name ?? '',
    contaParaNome: t.account_to?.name ?? '',
  }
}

// ─── formatação ─────────────────────────────────────────────────────────────

const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MES_LONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const DIA_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const sinal = (t: TipoTx) => (t === 'in' ? 1 : t === 'out' ? -1 : 0)

/** `3 out` */
export function dataCurta(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${Number(d)} ${MES_CURTO[Number(m) - 1]}`
}

/** `Sexta` (desktop) ou `Sexta · 3 out` (mobile), pelo calendário real. */
export function rotuloDia(iso: string, mob: boolean): string {
  const [a, m, d] = iso.split('-').map(Number)
  const nome = DIA_SEMANA[new Date(a, m - 1, d).getDay()]
  return mob ? `${nome} · ${dataCurta(iso)}` : nome
}

/** `+ R$ 850,00` / `– R$ 182,40` (NBSP depois do R$, en-dash no negativo). */
export function assinado(n: number): string {
  return `${n < 0 ? '–' : '+'} ${brl(Math.abs(n))}`
}

/** Valor da linha: transferência sem sinal, o resto assinado. */
export function valorTxt(l: Pick<TxLinha, 'tipo' | 'valor'>): string {
  return l.tipo === 'tr' ? brl(l.valor) : assinado(sinal(l.tipo) * l.valor)
}

/** Segunda coluna da linha: categoria, ou `Origem → Destino` na transferência. */
export function ctTxt(l: TxLinha): string {
  return l.tipo === 'tr' ? `${l.contaDeNome} → ${l.contaParaNome}` : l.categoriaNome
}

export function ariaLinha(l: TxLinha): string {
  return `Editar ${l.desc}, ${valorTxt(l).split(NBSP).join(' ')}${l.previsto ? ', previsto' : ''}`
}

/** Descrição de uma transferência sem texto próprio. */
export function descricaoTransferencia(de: string, para: string): string {
  return de && para ? `${de} → ${para}` : 'Transferência'
}

// ─── valor digitado ─────────────────────────────────────────────────────────

/** `1.234,50` / `1234,5` / `R$ 12` → 1234.5 (sempre positivo; 0 se inválido). */
export function parseValor(s: string): number {
  const limpo = s.replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(limpo)
  return Number.isFinite(n) ? Math.abs(n) : 0
}

/** Máscara de moeda enquanto digita: só dígitos e uma vírgula, milhar com ponto. */
export function maskValor(raw: string): string {
  const limpo = raw.replace(/[^\d,]/g, '')
  const i = limpo.indexOf(',')
  let inteiro = i >= 0 ? limpo.slice(0, i) : limpo
  const dec = i >= 0 ? limpo.slice(i + 1).replace(/,/g, '').slice(0, 2) : undefined
  inteiro = inteiro.replace(/^0+(\d)/, '$1')
  if (!inteiro && dec === undefined) return ''
  if (!inteiro) inteiro = '0'
  const milhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return dec !== undefined ? `${milhar},${dec}` : milhar
}

/** 1234.5 → `1.234,50` (para o campo). */
export function valorCampo(n: number): string {
  return Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── mês ────────────────────────────────────────────────────────────────────

export interface MesRef { ano: number; mes: number }

export const mesDe = (iso: string): MesRef => ({ ano: Number(iso.slice(0, 4)), mes: Number(iso.slice(5, 7)) })
export const mesIgual = (a: MesRef, b: MesRef): boolean => a.ano === b.ano && a.mes === b.mes
export const nomeMes = (m: MesRef): string => MES_LONGO[m.mes - 1]
export const rotuloMes = (m: MesRef): string => `${nomeMes(m)} de ${m.ano}`
export const capitalizar = (s: string): string => s.charAt(0).toLocaleUpperCase('pt-BR') + s.slice(1)

export function deslocarMes(m: MesRef, delta: number): MesRef {
  const idx = m.ano * 12 + (m.mes - 1) + delta
  return { ano: Math.floor(idx / 12), mes: (idx % 12) + 1 }
}

export function intervaloMes(m: MesRef): { inicio: string; fim: string } {
  const p = (n: number) => String(n).padStart(2, '0')
  const ultimo = new Date(m.ano, m.mes, 0).getDate()
  return { inicio: `${m.ano}-${p(m.mes)}-01`, fim: `${m.ano}-${p(m.mes)}-${p(ultimo)}` }
}

// ─── ordenação (servidor) ───────────────────────────────────────────────────

/** Coluna e sentido do `order()` do Supabase para cada ordem (empate desempata por criação). */
export function ordenacaoServidor(o: Ordem): { col: 'date' | 'amount'; asc: boolean } {
  return { col: o === 'maior' || o === 'menor' ? 'amount' : 'date', asc: o === 'antigo' || o === 'menor' }
}

export const ordenaPorData = (o: Ordem): boolean => o === 'recente' || o === 'antigo'

// ─── agrupamento e totais ───────────────────────────────────────────────────

export interface GrupoDia { date: string; rotulo: string; soma: number; temValor: boolean; linhas: TxLinha[] }

/** Soma assinada ignorando transferências; `temValor` false se só houver transferências. */
export function somaLinhas(ls: TxLinha[]): { soma: number; temValor: boolean } {
  let soma = 0
  let temValor = false
  for (const l of ls) {
    if (l.tipo === 'tr') continue
    soma += sinal(l.tipo) * l.valor
    temValor = true
  }
  return { soma: Math.round(soma * 100) / 100, temValor }
}

/** Agrupa por dia mantendo a ordem de chegada (a lista já vem ordenada). */
export function agruparPorDia(ls: TxLinha[], mob: boolean): GrupoDia[] {
  const grupos: GrupoDia[] = []
  const porData = new Map<string, GrupoDia>()
  for (const l of ls) {
    let g = porData.get(l.date)
    if (!g) {
      g = { date: l.date, rotulo: rotuloDia(l.date, mob), soma: 0, temValor: false, linhas: [] }
      porData.set(l.date, g)
      grupos.push(g)
    }
    g.linhas.push(l)
  }
  for (const g of grupos) Object.assign(g, somaLinhas(g.linhas))
  return grupos
}

export interface TotaisMes { entradas: number; saidas: number; saldo: number; quantidade: number }

/** Totais do MÊS INTEIRO (não da página). Transferências contam na quantidade, não nas somas. */
export function totaisDoMes(rows: { type: TipoDb; amount: number | string }[]): TotaisMes {
  let entradas = 0
  let saidas = 0
  for (const r of rows) {
    const v = Math.abs(Number(r.amount))
    if (r.type === 'income') entradas += v
    else if (r.type === 'expense') saidas += v
  }
  entradas = Math.round(entradas * 100) / 100
  saidas = Math.round(saidas * 100) / 100
  return { entradas, saidas, saldo: Math.round((entradas - saidas) * 100) / 100, quantidade: rows.length }
}

/** `4 de 34` (com filtro, o 34 é o total filtrado). */
export function contagemTela(visiveis: number, total: number | null): string {
  if (total === null) return `${visiveis} ${visiveis === 1 ? 'exibida' : 'exibidas'}`
  return `${visiveis} de ${total}`
}

export function textoQuantidade(n: number, mes: string): string {
  return `${n} ${n === 1 ? 'transação' : 'transações'} em ${mes}`
}

export function textoPrevistos(n: number, aberto: boolean): string {
  return aberto ? `Mostrar só os próximos ${PREVISTOS_VISIVEIS}` : `Ver os ${n} previstos`
}

// ─── previstos: ocorrências de recorrentes (mês corrente) ───────────────────

/** Ocorrência de recorrente (ItemCal do Calendário reduzido ao que a lista precisa). */
export interface OcorrenciaRec { id: string; data: string; desc: string; cat: string; valor: number }

/** Linha prevista de uma ocorrência: selos Recorrente + Previsto; valor com sinal vira tipo e módulo. */
export function linhaDeOcorrencia(o: OcorrenciaRec): TxLinha {
  return {
    id: o.id, date: o.data, desc: o.desc, tipo: o.valor < 0 ? 'out' : 'in', valor: Math.abs(o.valor),
    categoriaId: null, categoriaNome: o.cat, metodo: 'pix', obs: '', recorrente: true, previsto: true,
    contaDeId: null, contaParaId: null, contaDeNome: '', contaParaNome: '', ocorrencia: true,
  }
}

/** Mesmos filtros da lista aplicados a uma ocorrência (categoria por nome, busca na descrição). */
export function ocorrenciaPassa(l: TxLinha, f: { tipo: FiltroTipo; categoriaNome: string; q: string }): boolean {
  if (f.tipo === 'in' && l.tipo !== 'in') return false
  if (f.tipo === 'out' && l.tipo !== 'out') return false
  if (f.tipo === 'tr') return false
  if (f.categoriaNome && l.categoriaNome !== f.categoriaNome) return false
  if (f.q && !l.desc.toLocaleLowerCase('pt-BR').includes(f.q.toLocaleLowerCase('pt-BR'))) return false
  return true
}

/** Previstos do bloco: lançamentos futuros + ocorrências, por data (empate: lançamento primeiro). */
export function mesclarPrevistos(futuros: TxLinha[], ocorrencias: TxLinha[]): TxLinha[] {
  return [...futuros, ...ocorrencias].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}
