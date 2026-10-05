// Regras puras da tela Orçamentos v5 (prototypes/v5/app/financas-orcamentos.html):
// estado do envelope pelo alert_threshold (um só critério), sub da linha, totais, não alocado,
// fora de envelope, fala de Sy e o cálculo do laboratório "E se o teto de Lazer fosse outro?".
// Sem I/O, sem React.

import { brl, brlInt, type ParteFala } from '@/lib/financas/hub'

export type EstadoEnvelope = 'ok' | 'atencao' | 'estourado'

export interface EnvelopeCalc {
  /** nome da categoria */
  categoria: string
  gasto: number
  /** limite gravado no banco (sem a sobra) */
  limiteBase: number
  /** sobra do mês anterior somada ao limite */
  sobra: number
  /** alert_threshold do envelope (50 a 100) */
  alerta: number
}

/** limite efetivo = base + sobra do rollover */
export const limiteEfetivo = (e: Pick<EnvelopeCalc, 'limiteBase' | 'sobra'>): number => e.limiteBase + e.sobra

export function pctEnvelope(e: EnvelopeCalc): number {
  const lim = limiteEfetivo(e)
  if (lim <= 0) return e.gasto > 0 ? 100 : 0
  return Math.round((e.gasto / lim) * 100)
}

/** Um só critério: o `alert_threshold` do envelope. >= 100% é estourado; >= alerta é atenção. */
export function estadoEnvelope(e: EnvelopeCalc): EstadoEnvelope {
  const p = pctEnvelope(e)
  if (p >= 100) return 'estourado'
  return p >= e.alerta ? 'atencao' : 'ok'
}

/** Quanto resta (negativo = passou). */
export const restoEnvelope = (e: EnvelopeCalc): number => limiteEfetivo(e) - e.gasto

/** Sub da linha: "98% · sobram R$ 10,00 · 28 dias · alerta em 80%". */
export function subEnvelope(e: EnvelopeCalc, dias: number): string {
  const resto = restoEnvelope(e)
  const meio = resto > 0 ? `sobram ${brl(resto)}` : resto === 0 ? 'sem folga' : `passou ${brl(-resto)}`
  const tempo = dias > 0 ? ` · ${dias} ${dias === 1 ? 'dia' : 'dias'}` : ''
  return `${pctEnvelope(e)}% · ${meio}${tempo} · alerta em ${e.alerta}%`
}

/** Ordem da lista: maior limite efetivo primeiro; empate, nome. */
export function ordenarEnvelopes<T extends EnvelopeCalc>(envs: T[]): T[] {
  return [...envs].sort(
    (a, b) => limiteEfetivo(b) - limiteEfetivo(a) || a.categoria.localeCompare(b.categoria, 'pt-BR'),
  )
}

export interface TotaisOrcamento {
  orcado: number
  gasto: number
  /** orçado menos gasto (pode ser negativo) */
  disponivel: number
  /** receitas realizadas menos o orçado (negativo = "Orçamento maior que a renda") */
  naoAlocado: number
  pctGasto: number
  qtd: number
  qtdAtencao: number
  qtdOk: number
}

export function totaisOrcamento(envs: EnvelopeCalc[], receitas: number): TotaisOrcamento {
  const orcado = envs.reduce((s, e) => s + limiteEfetivo(e), 0)
  const gasto = envs.reduce((s, e) => s + e.gasto, 0)
  const qtdAtencao = envs.filter(e => estadoEnvelope(e) !== 'ok').length
  return {
    orcado,
    gasto,
    disponivel: orcado - gasto,
    naoAlocado: receitas - orcado,
    pctGasto: orcado > 0 ? Math.round((gasto / orcado) * 100) : 0,
    qtd: envs.length,
    qtdAtencao,
    qtdOk: envs.length - qtdAtencao,
  }
}

export type FiltroEnvelope = 'todos' | 'atencao' | 'ok'

export function passaFiltro(e: EnvelopeCalc, f: FiltroEnvelope): boolean {
  if (f === 'todos') return true
  const st = estadoEnvelope(e)
  return f === 'ok' ? st === 'ok' : st !== 'ok'
}

export interface GastoCategoria { categoriaId: string; nome: string; valor: number }

/** Despesas do mês em categorias sem envelope, maiores primeiro. */
export function foraDeEnvelope(gastos: GastoCategoria[], idsComEnvelope: Set<string>): GastoCategoria[] {
  return gastos
    .filter(g => g.valor > 0 && !idsComEnvelope.has(g.categoriaId))
    .sort((a, b) => b.valor - a.valor)
}

/** Dias que faltam no mês: mês corrente = último dia menos hoje; futuro = mês inteiro; passado = 0. */
export function diasRestantes(mes: number, ano: number, hojeISO: string): number {
  const ultimo = new Date(ano, mes, 0).getDate()
  const hAno = Number(hojeISO.slice(0, 4))
  const hMes = Number(hojeISO.slice(5, 7))
  const hDia = Number(hojeISO.slice(8, 10))
  if (hAno === ano && hMes === mes) return Math.max(0, ultimo - hDia)
  return ano * 12 + mes < hAno * 12 + hMes ? 0 : ultimo
}

/** Valor digitado em pt-BR ("1.240,50", "R$ 420") → número positivo; 0 se inválido. */
export function parseValor(s: string): number {
  const limpo = s.replace(/[R$\s ]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(limpo)
  return Number.isFinite(n) ? Math.abs(n) : 0
}

/** Número → texto do campo ("1240.5" → "1.240,50"). */
export function valorCampo(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}


function listaNomes(nomes: string[]): string {
  if (nomes.length <= 1) return nomes[0] ?? ''
  if (nomes.length === 2) return `${nomes[0]} e ${nomes[1]}`
  if (nomes.length === 3) return `${nomes[0]}, ${nomes[1]} e ${nomes[2]}`
  return `${nomes[0]}, ${nomes[1]} e mais ${nomes.length - 2}`
}

/**
 * Fala de Sy no topo (1 linha). Padrão do protótipo:
 * "Lazer e Assinaturas passaram do alerta. Lazer tem R$ 10 para 28 dias."
 */
export function falaOrcamentos(envs: EnvelopeCalc[], dias: number, mesNome: string): ParteFala[] {
  if (envs.length === 0) return [{ t: `Ainda não há envelopes em ${mesNome}. Crie o primeiro para comparar gasto e teto.` }]
  const alvos = envs
    .filter(e => estadoEnvelope(e) !== 'ok')
    .sort((a, b) => pctEnvelope(b) - pctEnvelope(a))
  const t = totaisOrcamento(envs, 0)
  if (alvos.length === 0) {
    return [
      { t: `Nenhum envelope passou do alerta em ${mesNome}. Você usou ` },
      { t: `${t.pctGasto}%`, b: true },
      { t: ' do orçado.' },
    ]
  }
  const top = alvos[0]
  const resto = restoEnvelope(top)
  const abre = `${listaNomes(alvos.map(a => a.categoria))} ${alvos.length === 1 ? 'passou' : 'passaram'} do alerta. `
  const cola: ParteFala[] = resto >= 0
    ? [{ t: `${top.categoria} tem ` }, { t: brlInt(resto), b: true, w: true }, { t: dias > 0 ? ` para ${dias} ${dias === 1 ? 'dia' : 'dias'}.` : ' de folga.' }]
    : [{ t: `${top.categoria} passou ` }, { t: brlInt(-resto), b: true, w: true }, { t: ' do limite.' }]
  return [{ t: abre }, ...cola]
}

/** Linha de fontes sob a fala: "6 orçamentos, 34 transações, receitas de outubro". */
export function fontesOrcamentos(n: { envelopes: number; transacoes: number }, mesNome: string): string {
  const out: string[] = []
  if (n.envelopes > 0) out.push(`${n.envelopes} ${n.envelopes === 1 ? 'orçamento' : 'orçamentos'}`)
  if (n.transacoes > 0) out.push(`${n.transacoes} ${n.transacoes === 1 ? 'transação' : 'transações'}`)
  out.push(`receitas de ${mesNome}`)
  return out.join(', ')
}

/** Referência 50-30-20 sobre a renda. */
export function regra5030(base: number): { necessidades: number; desejos: number; poupanca: number } {
  return { necessidades: Math.round(base * 0.5), desejos: Math.round(base * 0.3), poupanca: Math.round(base * 0.2) }
}

// ─── laboratório: "E se o teto de X fosse outro?" ────────────────────────────

export interface MetaLab {
  nome: string
  atual: number
  alvo: number
  /** aporte mensal fixo da meta (monthly_contribution); 0 se não houver */
  aporteFixo: number
}

export interface EntradaLab {
  /** limite base atual do envelope */
  tetoAtual: number
  /** teto simulado (limite base) */
  teto: number
  sobra: number
  gasto: number
  alerta: number
  dias: number
  receitas: number
  /** receitas menos despesas realizadas do mês */
  saldoMes: number
  /** saldo projetado para o fim do mês (usePlanejamento, cenário realista); null sem base */
  fechamentoBase: number | null
  meta: MetaLab | null
}

export interface EfeitosLab {
  delta: number
  /** o que sobra no envelope com o teto simulado */
  resto: number
  pct: number
  acimaDoAlerta: boolean
  fechamento: number | null
  /** poupança do mês em %, null sem receitas */
  poupancaPct: number | null
  poupado: number
  /** quanto sobra para antecipar a meta, além do aporte fixo; null sem meta */
  aporteExtra: number | null
}

/**
 * Cada R$ 1 a mais no teto sai do fechamento projetado, do que fica poupado e do que sobra
 * para a meta. O que já saiu não muda; o cálculo supõe o teto inteiro usado (como o protótipo).
 * Sobra para a meta = saldo do mês menos o aporte fixo menos o aumento, limitada ao que falta.
 */
export function efeitosTeto(i: EntradaLab): EfeitosLab {
  const delta = i.teto - i.tetoAtual
  const limite = i.teto + i.sobra
  const resto = limite - i.gasto
  const pct = limite > 0 ? Math.round((i.gasto / limite) * 100) : i.gasto > 0 ? 100 : 0
  const poupado = i.saldoMes - delta
  let aporteExtra: number | null = null
  if (i.meta) {
    const falta = Math.max(0, i.meta.alvo - i.meta.atual - i.meta.aporteFixo)
    aporteExtra = Math.min(Math.max(0, i.saldoMes - i.meta.aporteFixo - delta), falta)
  }
  return {
    delta,
    resto,
    pct,
    acimaDoAlerta: pct >= i.alerta,
    fechamento: i.fechamentoBase === null ? null : i.fechamentoBase - delta,
    poupancaPct: i.receitas > 0 ? Math.round((poupado / i.receitas) * 100) : null,
    poupado,
    aporteExtra,
  }
}

/** Opções do laboratório: o teto atual, +50 e +100. */
export function opcoesTeto(tetoAtual: number): number[] {
  return [tetoAtual, tetoAtual + 50, tetoAtual + 100]
}

/** Copy do cenário (partes com negrito; sem HTML). */
export function copiaLab(i: EntradaLab, x: EfeitosLab, envelope: string): ParteFala[] {
  const dias = i.dias > 0 ? ` para ${i.dias} ${i.dias === 1 ? 'dia' : 'dias'}` : ''
  const meta = i.meta && x.aporteExtra !== null
    ? ` e sobram ${brlInt(x.aporteExtra)} para antecipar ${i.meta.nome}${i.meta.aporteFixo > 0 ? `, além do aporte de ${brlInt(i.meta.aporteFixo)}` : ''}`
    : ''
  const fech = x.fechamento !== null ? `, o fechamento ${x.delta ? 'cai para' : 'segue em'} ${brlInt(x.fechamento)}` : ''
  if (!x.delta) {
    return [
      { t: 'Você mantém o teto. ' },
      { t: `${envelope} fica com ${brlInt(x.resto)}${dias}`, b: true },
      { t: `${fech}${meta}.` },
    ]
  }
  if (x.acimaDoAlerta) {
    return [
      { t: `Mais ${brlInt(x.delta)} dão ` },
      { t: `${brlInt(x.resto)}${dias}`, b: true },
      { t: `, mas ${envelope} continua acima do alerta de ${i.alerta}% (${x.pct}%)${fech}${meta}.` },
    ]
  }
  return [
    { t: `Com ${brlInt(x.delta)} a mais, ` },
    { t: `${envelope} volta para baixo do alerta`, b: true },
    { t: ` (${x.pct}%), com ${brlInt(x.resto)}${dias}${fech}${meta}.` },
  ]
}

/** Texto único de uma fala (para teste). */
export const textoPartes = (p: ParteFala[]): string => p.map(x => x.t).join('')

