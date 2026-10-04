/**
 * Arquivo da conversa (`/coach`, plano Fase 1 Task 15): lógica pura.
 * Agrupa `coach_messages` e `intencoes` por dia em São Paulo, monta as
 * entradas (pergunta, ação, intenção, nota), filtra (tipo, área, busca) e
 * escreve os rótulos de dia e as contagens. Sem I/O; `hojeISO` vem de fora.
 */
import { areaDaTabela, areasDosRegistros, type AreaCodigo } from '@/lib/intencao/proposta'

export const SP_TZ = 'America/Sao_Paulo'

// ─── Linhas do banco ─────────────────────────────────────────────────

export type KindMensagem = 'mensagem' | 'acao' | 'intencao' | 'nota'

export interface MensagemRow {
  id: string
  role: 'user' | 'assistant'
  content: string
  module_id: string | null
  fontes: unknown
  kind: KindMensagem
  ref_id: string | null
  created_at: string
}

export interface AplicadoItem { tabela: string; id: string; rotulo: string; href: string }

export type StatusIntencao = 'em_aberto' | 'aplicada' | 'desfeita'

export interface IntencaoRow {
  id: string
  texto: string
  tipo: string
  proposta: unknown
  caminho: string | null
  aplicado: AplicadoItem[] | null
  status: StatusIntencao
  created_at: string
  aplicada_em: string | null
  desfeita_em: string | null
}

// ─── Modelo da tela ──────────────────────────────────────────────────

export type TipoEntrada = 'pergunta' | 'acao' | 'intencao' | 'nota'

export interface Bolha {
  id: string
  role: 'user' | 'assistant'
  kind: KindMensagem
  texto: string
  fontes: string[]
  hora: string
}

export interface Entrada {
  id: string
  tipo: TipoEntrada
  ts: string
  hora: string
  areas: AreaCodigo[]
  bolhas: Bolha[]
  intencao?: IntencaoRow
  /** texto normalizado para a busca local */
  busca: string
}

export interface Dia {
  dia: string
  hoje: boolean
  entradas: Entrada[]
  /** primeira frase do dia, para a lista */
  frase: string
}

export type FiltroTipo = 'tudo' | TipoEntrada
export interface Filtro { tipo: FiltroTipo; area: 'todas' | AreaCodigo; q: string }

// ─── Datas em SP ─────────────────────────────────────────────────────

export function diaSP(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: SP_TZ })
}

export function horaSP(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit', hour12: false })
}

const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const MES3 = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function civil(dia: string): { sem: number; d: number; m: number } {
  const [y, m, d] = dia.split('-').map(Number)
  return { sem: new Date(Date.UTC(y, m - 1, d)).getUTCDay(), d, m: m - 1 }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Linha da lista: { hoje: true, resto: 'sexta, 3 out' } ou { hoje: false, resto: 'Quinta · 2 out' }. */
export function rotuloDiaLista(dia: string, hojeISO: string): { hoje: boolean; resto: string } {
  const { sem, d, m } = civil(dia)
  if (dia === hojeISO) return { hoje: true, resto: `${SEMANA[sem]}, ${d} ${MES3[m]}` }
  return { hoje: false, resto: `${cap(SEMANA[sem])} · ${d} ${MES3[m]}` }
}

/** Eyebrow da thread: 'sexta, 3 de outubro' (hoje) ou 'Quinta · 2 de outubro'. */
export function rotuloDiaThread(dia: string, hojeISO: string): { hoje: boolean; resto: string } {
  const { sem, d, m } = civil(dia)
  if (dia === hojeISO) return { hoje: true, resto: `${SEMANA[sem]}, ${d} de ${MESES[m]}` }
  return { hoje: false, resto: `${cap(SEMANA[sem])} · ${d} de ${MESES[m]}` }
}

/** '22 de setembro' */
export function diaPorExtenso(dia: string): string {
  const { d, m } = civil(dia)
  return `${d} de ${MESES[m]}`
}

/** '23 set, 07:40' */
export function quandoCurto(iso: string): string {
  const { d, m } = civil(diaSP(iso))
  return `${d} ${MES3[m]}, ${horaSP(iso)}`
}

// ─── Áreas ───────────────────────────────────────────────────────────

const AREA_POR_MODULO: Record<string, AreaCodigo> = {
  financas: '01', futuro: '02', tempo: '03', corpo: '04',
  mente: '05', patrimonio: '06', carreira: '07', experiencias: '08',
}

export function areaDoModulo(moduleId: string | null): AreaCodigo | null {
  return moduleId ? AREA_POR_MODULO[moduleId] ?? null : null
}

function registrosDaProposta(proposta: unknown, caminho: string | null): { tabela: string; rotulo: string }[] {
  const caminhos = (proposta as { caminhos?: { id?: string; registros?: { tabela?: unknown; rotulo?: unknown }[] }[] } | null)?.caminhos
  if (!Array.isArray(caminhos) || caminhos.length === 0) return []
  const c = caminhos.find(x => x?.id === caminho) ?? caminhos[0]
  return (Array.isArray(c?.registros) ? c.registros : [])
    .filter(r => typeof r?.tabela === 'string' && typeof r?.rotulo === 'string')
    .map(r => ({ tabela: r.tabela as string, rotulo: r.rotulo as string }))
}

/** Títulos de caminho da proposta: o escolhido (aplicada/desfeita) ou o primeiro (em aberto). */
export function tituloDoCaminho(it: IntencaoRow): string {
  const caminhos = (it.proposta as { caminhos?: { id?: string; titulo?: unknown }[] } | null)?.caminhos
  if (!Array.isArray(caminhos) || caminhos.length === 0) return ''
  const c = caminhos.find(x => x?.id === it.caminho) ?? caminhos[0]
  return typeof c?.titulo === 'string' ? c.titulo : ''
}

/** Os registros que o cartão da intenção lista: os criados (aplicado) ou os do caminho proposto. */
export function registrosDaIntencao(it: IntencaoRow): { tabela: string; rotulo: string; href?: string }[] {
  if (Array.isArray(it.aplicado) && it.aplicado.length > 0) return it.aplicado
  return registrosDaProposta(it.proposta, it.caminho)
}

export function areasDaIntencao(it: IntencaoRow): AreaCodigo[] {
  return areasDosRegistros(registrosDaIntencao(it))
}

// ─── Agrupamento ─────────────────────────────────────────────────────

export function normalizar(s: string): string {
  return s.replace(/ /g, ' ').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function fontesDe(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((f): f is string => typeof f === 'string') : []
}

function primeiraFrase(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim()
  const m = t.match(/^.+?[.!?](?=\s|$)/)
  return (m ? m[0] : t).slice(0, 160)
}

function addAreas(e: Entrada, areas: (AreaCodigo | null)[]) {
  for (const a of areas) if (a && !e.areas.includes(a)) e.areas.push(a)
}

/**
 * Agrupa por dia (SP, mais recente primeiro; entradas em ordem de hora).
 * - mensagem do usuário abre uma entrada `pergunta`; respostas seguintes entram nela;
 * - `acao` do assistente vira entrada `acao` (cola na pergunta anterior se ela ainda não teve resposta);
 * - `nota` é uma entrada sozinha;
 * - `intencao` do assistente (a fala "Li suas cinco áreas…") entra na pergunta que a pediu;
 * - cada intenção vira uma entrada `intencao` no dia de `created_at`, com estado e `aplicado`.
 */
export function agruparConversa(msgs: MensagemRow[], intencoes: IntencaoRow[], hojeISO: string): Dia[] {
  const ordenadas = [...msgs].sort((a, b) => a.created_at.localeCompare(b.created_at))
  const intPorId = new Map(intencoes.map(i => [i.id, i]))
  const entradas: Entrada[] = []
  let aberta: Entrada | null = null

  const nova = (tipo: TipoEntrada, m: { id: string; created_at: string }): Entrada => ({
    id: `${tipo}:${m.id}`, tipo, ts: m.created_at, hora: horaSP(m.created_at), areas: [], bolhas: [], busca: '',
  })

  for (const m of ordenadas) {
    const bolha: Bolha = {
      id: m.id, role: m.role, kind: m.kind, texto: m.content, fontes: fontesDe(m.fontes), hora: horaSP(m.created_at),
    }
    const mesmoDia = aberta && diaSP(aberta.ts) === diaSP(m.created_at)

    if (m.role === 'user') {
      aberta = nova('pergunta', m)
      aberta.bolhas.push(bolha)
      addAreas(aberta, [areaDoModulo(m.module_id)])
      entradas.push(aberta)
      continue
    }

    if (m.kind === 'nota') {
      const e = nova('nota', m)
      e.bolhas.push(bolha)
      addAreas(e, [areaDoModulo(m.module_id)])
      entradas.push(e)
      aberta = null
      continue
    }

    if (m.kind === 'acao') {
      const refInt = m.ref_id ? intPorId.get(m.ref_id) : undefined
      const semResposta = aberta && mesmoDia && aberta.bolhas.every(b => b.role === 'user')
      const e = semResposta && aberta ? aberta : nova('acao', m)
      e.tipo = 'acao'
      e.bolhas.push(bolha)
      addAreas(e, [areaDoModulo(m.module_id), ...(refInt ? areasDaIntencao(refInt) : [])])
      if (e !== aberta) entradas.push(e)
      aberta = null
      continue
    }

    // resposta comum ou fala da intenção: entra na pergunta aberta do mesmo dia
    const refInt = m.kind === 'intencao' && m.ref_id ? intPorId.get(m.ref_id) : undefined
    if (aberta && mesmoDia) {
      aberta.bolhas.push(bolha)
      addAreas(aberta, [areaDoModulo(m.module_id), ...(refInt ? areasDaIntencao(refInt) : [])])
    } else {
      const e = nova('pergunta', m)
      e.bolhas.push(bolha)
      addAreas(e, [areaDoModulo(m.module_id), ...(refInt ? areasDaIntencao(refInt) : [])])
      entradas.push(e)
      aberta = e
    }
  }

  for (const it of intencoes) {
    entradas.push({
      id: `intencao:${it.id}`, tipo: 'intencao', ts: it.created_at, hora: horaSP(it.created_at),
      areas: areasDaIntencao(it), bolhas: [], intencao: it, busca: '',
    })
  }

  for (const e of entradas) {
    const partes = e.bolhas.map(b => `${b.texto} ${b.fontes.join(' ')}`)
    if (e.intencao) partes.push(e.intencao.texto, tituloDoCaminho(e.intencao), ...registrosDaIntencao(e.intencao).map(r => r.rotulo))
    e.busca = normalizar(partes.join(' '))
  }

  const porDia = new Map<string, Entrada[]>()
  for (const e of entradas) {
    const d = diaSP(e.ts)
    const lista = porDia.get(d)
    if (lista) lista.push(e)
    else porDia.set(d, [e])
  }

  return [...porDia.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dia, es]) => {
      // intenção logo depois da fala que a apresentou (mesmo segundo do insert)
      es.sort((a, b) => a.ts.localeCompare(b.ts) || (a.tipo === 'intencao' ? 1 : 0) - (b.tipo === 'intencao' ? 1 : 0))
      const primeira = es[0]
      const texto = primeira.intencao ? primeira.intencao.texto : primeira.bolhas[0]?.texto ?? ''
      return { dia, hoje: dia === hojeISO, entradas: es, frase: primeiraFrase(texto) }
    })
}

// ─── Filtros ─────────────────────────────────────────────────────────

export function passaFiltro(e: Entrada, f: Filtro): boolean {
  if (f.tipo !== 'tudo' && e.tipo !== f.tipo) return false
  if (f.area !== 'todas' && !e.areas.includes(f.area)) return false
  const q = normalizar(f.q.trim())
  if (q && !e.busca.includes(q)) return false
  return true
}

export function filtrando(f: Filtro): boolean {
  return f.tipo !== 'tudo' || f.area !== 'todas' || f.q.trim() !== ''
}

export interface DiaVisivel { dia: Dia; visiveis: Entrada[] }

/** Dias com ao menos uma entrada que passa; os outros saem da lista. */
export function filtrarDias(dias: Dia[], f: Filtro): DiaVisivel[] {
  return dias
    .map(dia => ({ dia, visiveis: dia.entradas.filter(e => passaFiltro(e, f)) }))
    .filter(d => d.visiveis.length > 0)
}

export function plural(n: number): string {
  return `${n} ${n === 1 ? 'entrada' : 'entradas'}`
}

/** '3 entradas' ou, filtrando, '1 de 3 entradas'. */
export function contagem(vis: number, total: number, comFiltro: boolean): string {
  return comFiltro ? `${vis} de ${plural(total)}` : plural(total)
}

export function resumoIntencoes(intencoes: IntencaoRow[]): { aplicada: number; em_aberto: number; desfeita: number } {
  const r = { aplicada: 0, em_aberto: 0, desfeita: 0 }
  for (const i of intencoes) r[i.status]++
  return r
}

export { areaDaTabela }

const NOMES_TIPO: Record<TipoEntrada, [string, string]> = {
  nota: ['nota', 'notas'],
  pergunta: ['pergunta', 'perguntas'],
  acao: ['ação', 'ações'],
  intencao: ['intenção', 'intenções'],
}

/**
 * Título da thread do dia sem inventar resumo: a composição do dia por tipo,
 * em partes (o número vai em `.num`). Ex.: [{n:1,t:'nota'},{n:2,t:'perguntas'}].
 */
export function composicaoDoDia(entradas: Entrada[]): { n: number; t: string }[] {
  const ordem: TipoEntrada[] = ['nota', 'pergunta', 'acao', 'intencao']
  return ordem
    .map(tipo => {
      const n = entradas.filter(e => e.tipo === tipo).length
      return { n, t: NOMES_TIPO[tipo][n === 1 ? 0 : 1] }
    })
    .filter(p => p.n > 0)
}
