// Regras puras do hub de Finanças v5 (T1, prototypes/v5/app/financas-a.html):
// fala determinística de Sy, sub das linhas de orçamento, tag das recorrentes,
// próxima ação e linha de fontes. Sem I/O, sem React.

/** Parte de frase: `b` negrito (`<b class="num">`), `w` tensão (`b.w`, coral). */
export interface ParteFala { t: string; b?: boolean; w?: boolean }

export interface OrcResumo { nome: string; gasto: number; limite: number; pct: number }

const NBSP = ' '

/** `R$ 1.840` (sem centavos, NBSP depois do R$, en-dash no negativo). */
export const brlInt = (n: number): string =>
  `${n < 0 ? '– ' : ''}R$${NBSP}${Math.round(Math.abs(n)).toLocaleString('pt-BR')}`

/** `R$ 1.200,00` (com centavos, NBSP, en-dash no negativo). */
export const brl = (n: number): string =>
  `${n < 0 ? '– ' : ''}R$${NBSP}${Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const textoFala = (p: ParteFala[]): string => p.map(x => x.t).join('')

/** Fração do mês já vivida (dia de hoje / dias do mês), 0..1. */
export function fracaoExecutada(hojeISO: string): number {
  const ano = Number(hojeISO.slice(0, 4))
  const mes = Number(hojeISO.slice(5, 7))
  const dia = Number(hojeISO.slice(8, 10))
  return dia / new Date(ano, mes, 0).getDate()
}

const CONTAGEM = ['', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove', 'Dez']

const emRisco = (orcs: OrcResumo[], limiar: number) =>
  orcs.filter(o => o.limite > 0 && o.pct > limiar).sort((a, b) => b.pct - a.pct)

/**
 * Fala de Sy no topo da área (1 ou 2 frases), padrão do protótipo:
 * "O mês está 83% executado. Só o orçamento de lazer pede atenção: R$ 10 até o fim do mês."
 */
export function falaFinancas(input: {
  pctExecutado: number
  orcamentos: OrcResumo[]
  temRegistros: boolean
  mesNome: string
}): ParteFala[] {
  const { pctExecutado, orcamentos, temRegistros, mesNome } = input
  if (!temRegistros) return [{ t: `Ainda não há registros em ${mesNome}. Comece por + Registrar.` }]

  const abre: ParteFala[] = [{ t: 'O mês está ' }, { t: `${pctExecutado}%`, b: true }, { t: ' executado' }]
  const warn = emRisco(orcamentos, 85)
  if (warn.length === 0) {
    if (orcamentos.length === 0) return [...abre, { t: '. Ainda não há orçamentos para acompanhar.' }]
    return [...abre, { t: ' e nenhum orçamento passou de 85%.' }]
  }
  const top = warn[0]
  const nome = top.nome.toLocaleLowerCase('pt-BR')
  const resto = top.limite - top.gasto
  const quem = warn.length === 1
    ? `. Só o orçamento de ${nome} pede atenção: `
    : `. ${CONTAGEM[warn.length] ?? warn.length} orçamentos pedem atenção, o de ${nome} primeiro: `
  const valor: ParteFala[] = resto >= 0
    ? [{ t: brlInt(resto), b: true, w: true }, { t: ' até o fim do mês.' }]
    : [{ t: 'passou ' }, { t: brlInt(-resto), b: true, w: true }, { t: ' do limite.' }]
  return [...abre, { t: quem }, ...valor]
}

/** Sub da linha `.orc`: "69% · sobram R$ 560" / "98% · restam R$ 10 até o fim do mês". */
export function subOrcamento(o: OrcResumo): string {
  const resto = o.limite - o.gasto
  if (resto < 0) return `${o.pct}% · passou ${brlInt(-resto)}`
  if (o.pct > 85) return `${o.pct}% · restam ${brlInt(resto)} até o fim do mês`
  return `${o.pct}% · sobram ${brlInt(resto)}`
}

const SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

/**
 * Tag da recorrente (protótipo: `EM 3 DIAS` coral para conta a vencer, `QUA`
 * para aporte). Despesa conta os dias e vira `.due` em até 3 dias (regra do
 * mock-data: "due = vence em até 3 dias"); entrada e transferência mostram o
 * dia da semana dentro de 6 dias, depois a data.
 */
export function tagRecorrente(r: {
  daysLeft: number
  date: Date
  type: 'income' | 'expense' | 'transfer'
}): { tag: string; due: boolean } {
  const d = Math.max(0, r.daysLeft)
  if (d === 0) return { tag: 'HOJE', due: r.type === 'expense' }
  if (d === 1) return { tag: 'AMANHÃ', due: r.type === 'expense' }
  if (r.type === 'expense') return { tag: `EM ${d} DIAS`, due: d <= 3 }
  if (d <= 6) return { tag: SEMANA[r.date.getDay()], due: false }
  return { tag: `${r.date.getDate()} ${MESES[r.date.getMonth()]}`, due: false }
}

/**
 * Próxima ação (`.prox`) = o maior risco: orçamento acima de 70% com a maior %.
 * O efeito é a poupança projetada no ritmo atual (despesas ÷ fração do mês).
 */
export function proximaAcao(input: {
  orcamentos: OrcResumo[]
  receitas: number
  despesas: number
  fracao: number
  mesNome: string
}): ParteFala[] {
  const { orcamentos, receitas, despesas, fracao, mesNome } = input
  const despesasProj = fracao > 0 ? despesas / Math.min(1, fracao) : despesas
  const poup = receitas > 0 ? Math.round(((receitas - despesasProj) / receitas) * 100) : null
  const efeito: ParteFala[] = poup === null
    ? [{ t: 'o mês ainda não tem receita registrada.' }]
    : poup < 0
      ? [{ t: 'no ritmo atual, o mês fecha sem poupar.' }]
      : [{ t: 'fecha o mês em ' }, { t: `${poup}%`, b: true }, { t: ' poupado.' }]

  if (orcamentos.length === 0) {
    return [{ t: `Criar os orçamentos de ${mesNome}: sem eles não dá para ver onde aperta.` }]
  }
  const top = emRisco(orcamentos, 70)[0]
  if (!top) return [{ t: 'Manter o ritmo: ' }, ...efeito]
  return [{ t: `Revisar o orçamento de ${top.nome.toLocaleLowerCase('pt-BR')}: ` }, ...efeito]
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

/** "3 orçamentos, 34 transações, 3 metas" (só o que existe; ordem do protótipo). */
export function fontesFinancas(n: { orcamentos: number; transacoes: number; metas: number }): string {
  const out: string[] = []
  if (n.orcamentos > 0) out.push(plural(n.orcamentos, 'orçamento', 'orçamentos'))
  if (n.transacoes > 0) out.push(plural(n.transacoes, 'transação', 'transações'))
  if (n.metas > 0) out.push(plural(n.metas, 'meta', 'metas'))
  return out.length > 0 ? out.join(', ') : 'nenhum registro ainda'
}

/** Variação % contra o mês anterior; null quando não há base. */
export function deltaPct(atual: number, anterior: number): number | null {
  if (!anterior) return null
  return Math.round(((atual - anterior) / Math.abs(anterior)) * 100)
}
