/**
 * Lógica pura do cartão de proposta (`PropostaIntencao`, plano Fase 1 Task 17):
 * áreas por tabela, valores editáveis, registros marcados, efeitos ligados e
 * desligados, rótulo do botão e montagem do payload de `/api/intencao/aplicar`.
 * Sem I/O, sem relógio: `hojeISO` (YYYY-MM-DD em SP) vem de fora.
 */
import { AplicarInput, type Caminho, type Registro, type TabelaIntencao } from './schemas'

const NB = ' '

// ─── Áreas ───────────────────────────────────────────────────────────

export type AreaCodigo = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08'

export const AREA_POR_TABELA: Record<TabelaIntencao, AreaCodigo> = {
  recurring_transactions: '01',
  goals: '02',
  agenda_events: '03',
  study_tracks: '05',
  skills: '07',
}

export const NOME_AREA: Record<AreaCodigo, string> = {
  '01': 'Finanças', '02': 'Futuro', '03': 'Tempo', '04': 'Corpo',
  '05': 'Mente', '06': 'Patrimônio', '07': 'Carreira', '08': 'Experiências',
}

/** Código da área de uma tabela qualquer (string do banco); null fora da whitelist. */
export function areaDaTabela(tabela: string): AreaCodigo | null {
  return (AREA_POR_TABELA as Record<string, AreaCodigo | undefined>)[tabela] ?? null
}

/** Áreas tocadas por uma lista de registros, na ordem em que aparecem, sem repetir. */
export function areasDosRegistros(regs: { tabela: string }[]): AreaCodigo[] {
  const out: AreaCodigo[] = []
  for (const r of regs) {
    const a = areaDaTabela(r.tabela)
    if (a && !out.includes(a)) out.push(a)
  }
  return out
}

/** "Mente · trilha X" → { area: 'Mente', resto: 'trilha X' }. Sem separador: tudo é resto. */
export function separarRotulo(rotulo: string): { area: string; resto: string } {
  const i = rotulo.indexOf(' · ')
  if (i < 0) return { area: '', resto: rotulo }
  return { area: rotulo.slice(0, i), resto: rotulo.slice(i + 3) }
}

/** "A, B e C" */
export function listaHumana(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? ''
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`
}

// ─── Moeda e datas ───────────────────────────────────────────────────

/** Moeda sem centavos com NBSP, a máscara do protótipo (`R$ 180/mês`). */
export function brl0(n: number): string {
  return 'R$' + NB + Math.round(n).toLocaleString('pt-BR')
}

/** Moeda completa com NBSP (`R$ 1.840,00`). */
export function brl(n: number): string {
  return 'R$' + NB + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** Valor à direita de cada caminho (`.opc .n`): o mês de início quando a cobrança começa depois, senão o custo mensal. */
export function valorDoCaminho(c: Caminho, hojeISO: string): string {
  const rec = c.registros.find(r => r.tabela === 'recurring_transactions')
  if (!rec || rec.tabela !== 'recurring_transactions') return ''
  if (rec.start_date && rec.start_date.slice(0, 7) > hojeISO.slice(0, 7)) {
    return MESES[Number(rec.start_date.slice(5, 7)) - 1] ?? ''
  }
  return `${brl0(rec.amount)}/mês`
}

/** "Proposta · curso de inglês" a partir do texto da intenção. */
export function tituloDaProposta(texto: string): string {
  const m = texto.match(/ingl[eê]s|espanhol|franc[eê]s|italiano|alem[aã]o/i)
  if (!m) return 'Proposta · curso'
  const idioma = m[0].toLowerCase().replace('ingles', 'inglês').replace('frances', 'francês').replace('alemao', 'alemão')
  return `Proposta · curso de ${idioma}`
}

// ─── Valor editável por registro ─────────────────────────────────────

export type Editavel = { valor: string; tipo: 'brl' | 'txt'; aria: string }

/** O que o cartão deixa editar (os mesmos pontos do protótipo: prazo da trilha, horário, valor mensal). */
export function editavelDe(r: Registro): Editavel | null {
  switch (r.tabela) {
    case 'recurring_transactions':
      return { valor: String(r.amount), tipo: 'brl', aria: 'Valor mensal em reais' }
    case 'study_tracks':
      return { valor: r.target_date.slice(0, 4), tipo: 'txt', aria: 'Ano do prazo da trilha' }
    case 'agenda_events':
      return { valor: r.start_time, tipo: 'txt', aria: 'Horário de início' }
    default:
      return null
  }
}

function hParaRotulo(hm: string): string {
  const [h, m] = hm.split(':')
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`
}

function minutos(hm: string): number {
  return Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5))
}

function hm(min: number): string {
  const c = Math.max(0, Math.min(23 * 60 + 59, min))
  return `${String(Math.floor(c / 60)).padStart(2, '0')}:${String(c % 60).padStart(2, '0')}`
}

/**
 * Aplica o valor digitado ao registro (e ao rótulo, para o Feito mostrar o que foi criado).
 * Devolve null quando o valor não é válido; valor vazio ou igual mantém o registro.
 */
export function aplicarEdicao(r: Registro, valor: string | undefined): Registro | null {
  const ed = editavelDe(r)
  if (!ed || valor === undefined) return r
  const v = valor.trim()
  if (v === '' || v === ed.valor) return r

  switch (r.tabela) {
    case 'recurring_transactions': {
      const n = Number(v.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, ''))
      if (!Number.isFinite(n) || n <= 0) return null
      const rotulo = r.rotulo
        .replace(`R$ ${r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        .replace(`R$ ${Math.round(r.amount).toLocaleString('pt-BR')}`, `R$ ${Math.round(n).toLocaleString('pt-BR')}`)
      return { ...r, amount: n, rotulo }
    }
    case 'study_tracks': {
      if (!/^\d{4}$/.test(v)) return null
      const velho = r.target_date.slice(0, 4)
      return { ...r, target_date: v + r.target_date.slice(4), rotulo: r.rotulo.split(velho).join(v) }
    }
    case 'agenda_events': {
      const m = v.match(/^(\d{1,2})(?::|h)?(\d{2})?h?$/)
      if (!m) return null
      const h = Number(m[1]); const mi = Number(m[2] ?? '0')
      if (h > 23 || mi > 59) return null
      const novo = hm(h * 60 + mi)
      const dur = Math.max(0, minutos(r.end_time) - minutos(r.start_time))
      return {
        ...r,
        start_time: novo,
        end_time: hm(minutos(novo) + dur),
        rotulo: r.rotulo.split(hParaRotulo(r.start_time)).join(hParaRotulo(novo)),
      }
    }
    default:
      return r
  }
}

// ─── Marcados, efeitos e botão ───────────────────────────────────────

export function contarMarcados(marcados: boolean[]): number {
  return marcados.reduce((n, m) => n + (m ? 1 : 0), 0)
}

export function rotuloCriar(n: number): string {
  if (n === 0) return 'Marque ao menos um registro'
  return n === 1 ? 'Criar 1 registro' : `Criar ${n} registros`
}

/**
 * Efeito por área com `off` quando a área tem registros no caminho e nenhum
 * deles está marcado (o protótipo apaga a linha do efeito junto com o registro).
 */
export function efeitosComEstado(c: Caminho, marcados: boolean[]): { area: AreaCodigo; texto: string; off: boolean }[] {
  const on = new Map<AreaCodigo, boolean>()
  c.registros.forEach((r, i) => {
    const a = AREA_POR_TABELA[r.tabela]
    on.set(a, (on.get(a) ?? false) || !!marcados[i])
  })
  return c.efeitos.map(e => ({
    area: e.area as AreaCodigo,
    texto: e.texto,
    off: on.has(e.area as AreaCodigo) && !on.get(e.area as AreaCodigo),
  }))
}

export type PayloadAplicar =
  | { ok: true; body: { intencaoId: string; caminho: string; registros: Registro[] } }
  | { ok: false; erro: string }

/**
 * Monta o corpo de `/api/intencao/aplicar` com os registros marcados e os
 * valores editados. Valida com o mesmo `AplicarInput` do servidor.
 */
export function montarPayloadAplicar(
  intencaoId: string,
  c: Caminho,
  marcados: boolean[],
  valores: (string | undefined)[],
): PayloadAplicar {
  const registros: Registro[] = []
  for (let i = 0; i < c.registros.length; i++) {
    if (!marcados[i]) continue
    const r = aplicarEdicao(c.registros[i], valores[i])
    if (!r) {
      const { area } = separarRotulo(c.registros[i].rotulo)
      return { ok: false, erro: `Confira o valor de ${area || 'um registro'}.` }
    }
    registros.push(r)
  }
  if (registros.length === 0) return { ok: false, erro: 'Marque ao menos um registro.' }
  const body = { intencaoId, caminho: c.id, registros }
  const parsed = AplicarInput.safeParse(body)
  if (!parsed.success) return { ok: false, erro: 'Algum valor ficou fora do formato. Confira os campos.' }
  return { ok: true, body: parsed.data }
}

/** "Feito · 5 registros em 5 áreas" contando áreas pela tabela de cada registro criado. */
export function rotuloFeito(feitos: { tabela: string }[]): string {
  const n = feitos.length
  const areas = areasDosRegistros(feitos).length || new Set(feitos.map(f => f.tabela)).size
  return `${n} ${n === 1 ? 'registro' : 'registros'} em ${areas} ${areas === 1 ? 'área' : 'áreas'}`
}

// ─── Números em `.num` ───────────────────────────────────────────────

/**
 * Quebra um texto em partes, marcando moeda, horas, percentuais e números para
 * `.num` (Syne tabular). `R$ ` vira `R$` + NBSP, como no protótipo.
 */
export function partesNumericas(s: string): { t: string; num: boolean }[] {
  const texto = s.replace(/R\$ /g, 'R$' + NB)
  const re = /R\$ [\d.]+(?:,\d{2})?|\b\d{1,2}:\d{2}\b|\b\d+(?:[.,]\d+)*%?/g
  const out: { t: string; num: boolean }[] = []
  let i = 0
  for (const m of texto.matchAll(re)) {
    const at = m.index ?? 0
    if (at > i) out.push({ t: texto.slice(i, at), num: false })
    out.push({ t: m[0], num: true })
    i = at + m[0].length
  }
  if (i < texto.length) out.push({ t: texto.slice(i), num: false })
  return out
}
