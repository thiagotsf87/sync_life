/**
 * "Pede você hoje": critério de seleção da spec §4.1 (conceito sem metáfora).
 * Função pura: recebe o que os hooks já carregam e devolve até 4 itens em ordem
 * de prioridade. Nenhum acesso a dados, nenhum React.
 *
 * Prioridades:
 *  1 decisão pendente (intenção em aberto)            qualquer área
 *  2 risco em janela curta (<= 7 dias)                 orçamento > 85%, conta <= 3 dias, meta <= 7 dias
 *  3 compromisso de hoje com preparo                   saúde, trabalho, ou título que pede preparo
 *  4 mudança desde o último acesso (uma linha agregada) áreas ativas com tendência != 0
 *  5 próxima ação única, se nada acima preencheu
 * Sem nada: 1 item "Nada pede você hoje" (prioridade 5, âncora #checkin).
 * Gatilhos 2 a 5 só disparam para áreas em `ativas`.
 */

import { fmtBRL } from '@/lib/format/currency'

export type AreaCodigo = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08'
export type Prioridade = 1 | 2 | 3 | 4 | 5

export interface IntencaoEmAberto {
  id: string
  texto: string
  areas: string[]
  valorTexto?: string
}
export interface OrcamentoGatilho {
  categoria: string
  gasto: number
  limite: number
  pct: number
}
export interface ContaGatilho {
  nome: string
  valor: number
  diasRestantes: number
}
export interface MetaGatilho {
  nome: string
  diasParaPrazo: number | null
}
export interface EventoGatilho {
  titulo: string
  hora: string | null
  tipo: string
}
export interface AreaGatilho {
  n: string
  nome: string
  tendencia?: number
}
export interface ProximaAcao {
  titulo: string
  detalhe: string
}

export interface EntradaGatilhos {
  ativas: string[]
  intencoesEmAberto: IntencaoEmAberto[]
  orcamentos: OrcamentoGatilho[]
  contas: ContaGatilho[]
  metas: MetaGatilho[]
  eventosHoje: EventoGatilho[]
  areas: AreaGatilho[]
  proximaAcao: ProximaAcao | null
}

export interface AcaoItem {
  tipo: 'decidir' | 'link' | 'ancora'
  href?: string
  rotulo: string
}

export interface ItemPedeVoce {
  prioridade: Prioridade
  area: AreaCodigo
  /** Parte em negrito da linha (HTML-safe, já escapada). */
  destaque: string
  /** Resto da linha (HTML-safe, já escapada). */
  titulo: string
  sub: string
  valor: string
  acao: AcaoItem
  tom: 'normal' | 'warn'
}

export const MAX_ITENS = 4
export const LIMIAR_ORCAMENTO_PCT = 85
export const LIMIAR_CONTA_DIAS = 3
export const LIMIAR_META_DIAS = 7

const AREA_FINANCAS: AreaCodigo = '01'
const AREA_FUTURO: AreaCodigo = '02'
const AREA_TEMPO: AreaCodigo = '03'
const AREA_CORPO: AreaCodigo = '04'

const RE_PREPARO = /consulta|entrevista|prova|voo|fisio/i
const TIPOS_PREPARO = new Set(['saude', 'trabalho'])

const NB = ' '

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** `fmtBRL` com espaço não separável, como o protótipo (`R$&nbsp;1.200,00`). */
/** Moeda sem centavos, máscara do protótipo para pares gasto/limite (`R$ 410 de R$ 420`). */
export function brl0(n: number): string {
  return 'R$ ' + Math.round(n).toLocaleString('pt-BR')
}

export function brl(n: number): string {
  return fmtBRL(n).replace(' ', NB)
}

function isArea(s: string): s is AreaCodigo {
  return /^0[1-8]$/.test(s)
}

function areaOuPadrao(s: string | undefined, padrao: AreaCodigo): AreaCodigo {
  return s !== undefined && isArea(s) ? s : padrao
}

function dias(n: number): string {
  if (n <= 0) return 'hoje'
  if (n === 1) return 'amanhã'
  return `em ${n} dias`
}

// ── prioridade 1 ────────────────────────────────────────────────────────────

function itensIntencoes(input: EntradaGatilhos): ItemPedeVoce[] {
  return input.intencoesEmAberto.map((i) => ({
    prioridade: 1,
    area: areaOuPadrao(i.areas[0], AREA_FINANCAS),
    destaque: escapeHtml(i.texto),
    titulo: 'continua em aberto',
    sub: 'Decisão pendente com Sy',
    valor: i.valorTexto ? escapeHtml(i.valorTexto) : '',
    acao: { tipo: 'decidir', rotulo: 'Decidir' },
    tom: 'normal',
  }))
}

// ── prioridade 2 ────────────────────────────────────────────────────────────

function itensRisco(input: EntradaGatilhos, ativa: (a: AreaCodigo) => boolean): ItemPedeVoce[] {
  const itens: ItemPedeVoce[] = []

  if (ativa(AREA_FINANCAS)) {
    const orcamentos = input.orcamentos
      .filter((o) => o.pct > LIMIAR_ORCAMENTO_PCT)
      .sort((a, b) => b.pct - a.pct || b.gasto - a.gasto)
    for (const o of orcamentos) {
      const resta = o.limite - o.gasto
      const estourou = resta < 0
      itens.push({
        prioridade: 2,
        area: AREA_FINANCAS,
        destaque: escapeHtml(o.categoria),
        titulo: estourou
          ? `passou do teto: ${brl(Math.abs(resta))} acima`
          : `encostou no teto: restam ${brl(resta)} no mês`,
        sub: `${Math.round(o.pct)}% do orçamento usado`,
        valor: `${brl0(o.gasto)} de ${brl0(o.limite)}`,
        acao: { tipo: 'link', href: '/financas#orcamentos', rotulo: 'Ver orçamento' },
        tom: 'warn',
      })
    }

    const contas = input.contas
      .filter((c) => c.diasRestantes <= LIMIAR_CONTA_DIAS)
      .sort((a, b) => a.diasRestantes - b.diasRestantes || b.valor - a.valor)
    for (const c of contas) {
      itens.push({
        prioridade: 2,
        area: AREA_FINANCAS,
        destaque: escapeHtml(c.nome),
        titulo: `vence ${dias(c.diasRestantes)}`,
        sub: 'Conta recorrente deste mês',
        valor: brl(c.valor),
        acao: { tipo: 'link', href: '/financas#recorrentes', rotulo: 'Ver recorrentes' },
        tom: 'normal',
      })
    }
  }

  if (ativa(AREA_FUTURO)) {
    const metas = input.metas
      .filter((m): m is MetaGatilho & { diasParaPrazo: number } => m.diasParaPrazo !== null && m.diasParaPrazo <= LIMIAR_META_DIAS)
      .sort((a, b) => a.diasParaPrazo - b.diasParaPrazo)
    for (const m of metas) {
      itens.push({
        prioridade: 2,
        area: AREA_FUTURO,
        destaque: escapeHtml(m.nome),
        titulo: `vence ${dias(m.diasParaPrazo)}`,
        sub: 'Meta com prazo nesta semana',
        valor: '',
        acao: { tipo: 'link', href: '/futuro', rotulo: 'Ver meta' },
        tom: 'normal',
      })
    }
  }

  return itens
}

// ── prioridade 3 ────────────────────────────────────────────────────────────

function areaDoEvento(e: EventoGatilho): AreaCodigo {
  return e.tipo === 'saude' ? AREA_CORPO : AREA_TEMPO
}

function pedePreparo(e: EventoGatilho): boolean {
  return TIPOS_PREPARO.has(e.tipo) || RE_PREPARO.test(e.titulo)
}

function horaMin(h: string | null): number {
  if (!h) return Number.POSITIVE_INFINITY
  const m = /^(\d{1,2}):(\d{2})/.exec(h)
  return m ? Number(m[1]) * 60 + Number(m[2]) : Number.POSITIVE_INFINITY
}

function itemCompromisso(input: EntradaGatilhos, ativa: (a: AreaCodigo) => boolean): ItemPedeVoce | null {
  const candidatos = input.eventosHoje
    .filter((e) => pedePreparo(e) && ativa(areaDoEvento(e)))
    .sort((a, b) => horaMin(a.hora) - horaMin(b.hora))
  const e = candidatos[0]
  if (!e) return null
  return {
    prioridade: 3,
    area: areaDoEvento(e),
    destaque: escapeHtml(e.titulo),
    titulo: e.hora ? `hoje às ${e.hora}` : 'hoje',
    sub: 'Compromisso de hoje com preparo',
    valor: e.hora ?? '',
    acao: { tipo: 'link', href: '/tempo', rotulo: 'Ver agenda' },
    tom: 'normal',
  }
}

// ── prioridade 4 ────────────────────────────────────────────────────────────

function itemMudanca(input: EntradaGatilhos, ativa: (a: AreaCodigo) => boolean): ItemPedeVoce | null {
  const ativas = input.areas.filter((a) => isArea(a.n) && ativa(a.n))
  const comTendencia = ativas.filter((a) => (a.tendencia ?? 0) !== 0)
  if (comTendencia.length === 0) return null

  const subiram = ativas.filter((a) => (a.tendencia ?? 0) > 0)
  const cairam = ativas.filter((a) => (a.tendencia ?? 0) < 0)
  const paradas = ativas.filter((a) => (a.tendencia ?? 0) === 0)
  const total = ativas.length

  const soCaem = subiram.length === 0
  const n = soCaem ? cairam.length : subiram.length
  const verbo = soCaem ? (n === 1 ? 'caiu' : 'caíram') : n === 1 ? 'subiu' : 'subiram'
  const titulo = `${n} das ${total} áreas ${verbo}`

  const partes: string[] = []
  if (!soCaem && cairam.length > 0) partes.push(`${cairam.map((a) => escapeHtml(a.nome)).join(', ')} ${cairam.length === 1 ? 'caiu' : 'caíram'}`)
  if (paradas.length > 0) {
    const nomes = paradas.map((a) => escapeHtml(a.nome)).join(', ')
    const prefixo = partes.length === 0 ? 'Só ' : ''
    partes.push(`${prefixo}${nomes} ${paradas.length === 1 ? 'ficou parada' : 'ficaram paradas'}`)
  }
  const sub = partes.length > 0 ? partes.join(' · ') : 'Todas as áreas ativas se moveram desde o último acesso'

  const maior = [...comTendencia].sort((a, b) => Math.abs(b.tendencia ?? 0) - Math.abs(a.tendencia ?? 0))[0]
  return {
    prioridade: 4,
    area: areaOuPadrao(maior?.n, AREA_FINANCAS),
    destaque: '',
    titulo,
    sub,
    valor: '',
    acao: { tipo: 'link', href: '/dashboard/score', rotulo: 'Ver o número' },
    tom: soCaem ? 'warn' : 'normal',
  }
}

// ── prioridade 5 ────────────────────────────────────────────────────────────

function itemProximaAcao(input: EntradaGatilhos, areaAnterior: AreaCodigo | null): ItemPedeVoce | null {
  const p = input.proximaAcao
  if (!p) return null
  return {
    prioridade: 5,
    area: areaAnterior ?? AREA_FINANCAS,
    destaque: escapeHtml(p.titulo),
    titulo: escapeHtml(p.detalhe),
    sub: 'Próxima ação sugerida por Sy',
    valor: '',
    acao: { tipo: 'link', href: '/coach', rotulo: 'Falar com Sy' },
    tom: 'normal',
  }
}

const ITEM_NADA: ItemPedeVoce = {
  prioridade: 5,
  area: AREA_FINANCAS,
  destaque: '',
  titulo: 'Nada pede você hoje',
  sub: 'Como foi o dia?',
  valor: '',
  acao: { tipo: 'ancora', href: '#checkin', rotulo: 'Registrar o dia' },
  tom: 'normal',
}

// ── montagem ────────────────────────────────────────────────────────────────

export function montarItens(input: EntradaGatilhos): ItemPedeVoce[] {
  const ativasSet = new Set(input.ativas)
  const ativa = (a: AreaCodigo) => ativasSet.has(a)

  const itens: ItemPedeVoce[] = []
  const push = (lista: (ItemPedeVoce | null)[]) => {
    for (const it of lista) {
      if (it && itens.length < MAX_ITENS) itens.push(it)
    }
  }

  push(itensIntencoes(input))
  push(itensRisco(input, ativa))
  push([itemCompromisso(input, ativa)])
  push([itemMudanca(input, ativa)])

  // Prioridade 5 só quando nada acima preencheu e há pelo menos uma área ativa
  // (a spec amarra os gatilhos 2 a 5 a `profiles.active_modules`).
  if (itens.length === 0 && ativasSet.size > 0) {
    const areaAnterior = [...ativasSet].find(isArea) ?? null
    push([itemProximaAcao(input, areaAnterior)])
  }

  return itens.length > 0 ? itens : [ITEM_NADA]
}
