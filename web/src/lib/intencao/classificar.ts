/**
 * Classificação da intenção (regex, decisão 4 da Fase 1) e proposta
 * determinística de fallback (spec §6.2, protótipo `prototypes/v5/app/_intencao.html`).
 *
 * Puro: sem I/O, sem relógio. `hojeISO` (YYYY-MM-DD, fuso de São Paulo) vem de fora.
 * Nunca inventa número: efeitos usam o contexto quando existe e caem para uma
 * frase sem cifra do usuário quando não existe.
 */
import { fmtBRL } from '@/lib/format/currency'
import type { FinancasContext, MetaResumo, SkillResumo, TempoResumo, TrilhaResumo } from '@/lib/coach/context'
import { HREF_POR_TABELA, type Caminho, type Proposta, type Registro, type TipoIntencao } from './schemas'

// ─── Classificação ───────────────────────────────────────────────────

const RE_CURSO =
  /\b(curso|aulas?|estudar|aprender)\b.*\b(ingl[eê]s|espanhol|idioma|franc[eê]s|italiano|alem[aã]o)\b|\b(ingl[eê]s|idioma)\b.*\b(curso|aulas?)\b/i

/** Única intenção da whitelist nesta fase. Qualquer outra coisa → null (vai para o coach-thread). */
export function classificarIntencao(texto: string): TipoIntencao | null {
  return RE_CURSO.test(texto) ? 'iniciar_curso' : null
}

// ─── Datas (puras, em UTC sobre a data civil) ────────────────────────

function partes(hojeISO: string): { y: number; m: number; d: number } {
  return { y: Number(hojeISO.slice(0, 4)), m: Number(hojeISO.slice(5, 7)), d: Number(hojeISO.slice(8, 10)) }
}

/** Próximo dia da semana `alvo` (0 = domingo) estritamente depois de hoje. */
export function proximoDiaSemana(hojeISO: string, alvo: number): string {
  const { y, m, d } = partes(hojeISO)
  const base = new Date(Date.UTC(y, m - 1, d))
  const delta = ((alvo - base.getUTCDay() + 7) % 7) || 7
  base.setUTCDate(base.getUTCDate() + delta)
  return base.toISOString().slice(0, 10)
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

function ddmm(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
}

// ─── Contexto que o fallback lê (união das 5 áreas) ──────────────────

export type ContextoIntencao = {
  financas?: FinancasContext
  tempo?: Partial<TempoResumo>
  metas?: MetaResumo[]
  trilhas?: TrilhaResumo[]
  skills?: SkillResumo[]
}

// ─── Fallback determinístico ─────────────────────────────────────────

type Plano = {
  id: 'agora' | 'menor' | 'esperar'
  titulo: string
  custo: number
  noites: 1 | 2
  espera: boolean
}

const PLANOS: Plano[] = [
  { id: 'agora', titulo: 'Começar agora, 2 noites', custo: 180, noites: 2, espera: false },
  { id: 'menor', titulo: 'Carga menor, 1 noite', custo: 120, noites: 1, espera: false },
  { id: 'esperar', titulo: 'Começar em janeiro', custo: 180, noites: 2, espera: true },
]

/** Meta de viagem ativa (nome com "viagem" ou "trip"), para nomear o caminho de espera. */
function metaDeViagem(ctx: ContextoIntencao): string | null {
  const m = (ctx.metas ?? []).find(x => /viagem|trip/i.test(x.name))
  return m ? m.name.replace(/^viagem\s+/i, '') : null
}

const TRILHA = 'Inglês para conversação'
const TERCA = 2
const QUINTA = 4

function registrosDo(p: Plano, hojeISO: string): Registro[] {
  const { y, d } = partes(hojeISO)
  const alvo = `${y + 1}-12-31`
  const anoAlvo = y + 1
  const regs: Registro[] = [
    {
      tabela: 'study_tracks', name: TRILHA, target_date: alvo, cost: p.custo,
      rotulo: `Mente · trilha "${TRILHA}", meta até ${anoAlvo}`, href: HREF_POR_TABELA.study_tracks,
    },
  ]
  if (!p.espera) {
    const dias = p.noites === 2 ? [TERCA, QUINTA] : [TERCA]
    for (const dia of dias) {
      const nome = dia === TERCA ? 'ter' : 'qui'
      regs.push({
        tabela: 'agenda_events', title: 'Aula de inglês', date: proximoDiaSemana(hojeISO, dia),
        start_time: '20:00', end_time: '21:00',
        rotulo: `Tempo · aula de inglês, ${nome} 20h, toda semana`, href: HREF_POR_TABELA.agenda_events,
      })
    }
  }
  regs.push(
    {
      tabela: 'recurring_transactions', name: 'Curso de inglês', amount: p.custo, day_of_month: d,
      // esperar: a primeira cobrança é em janeiro, não hoje
      ...(p.espera ? { start_date: `${y + 1}-01-${String(d).padStart(2, '0')}` } : {}),
      rotulo: p.espera
        ? `Finanças · recorrente ${fmtBRL(p.custo)}/mês a partir de janeiro, Educação`
        : `Finanças · recorrente ${fmtBRL(p.custo)}/mês, Educação`,
      href: HREF_POR_TABELA.recurring_transactions,
    },
    { tabela: 'skills', name: 'Inglês', rotulo: 'Carreira · habilidade Inglês ligada à trilha', href: HREF_POR_TABELA.skills },
    {
      tabela: 'goals', name: `Fluência até ${anoAlvo}`, target_date: alvo,
      rotulo: `Futuro · meta Fluência até ${anoAlvo}`, href: HREF_POR_TABELA.goals,
    },
  )
  return regs
}

function efeitosDo(p: Plano, ctx: ContextoIntencao, hojeISO: string): Caminho['efeitos'] {
  const { y, m } = partes(hojeISO)
  const mes = MESES[m - 1]
  const anoAlvo = y + 1
  const noites = p.noites === 2 ? '2 noites' : '1 noite'
  const horario = p.noites === 2 ? 'ter e qui 20h' : 'ter 20h'

  // 05 Mente
  const nTrilhas = ctx.trilhas?.length ?? 0
  const mente = nTrilhas > 0
    ? `Mente · a trilha de idiomas entra ao lado de ${nTrilhas} ${nTrilhas === 1 ? 'trilha' : 'trilhas'} em andamento`
    : 'Mente · primeira trilha de idiomas; hoje nenhuma trilha em andamento'

  // 03 Tempo
  const eventosSemana = ctx.tempo?.eventosSemana
  const tempo = p.espera
    ? 'Tempo · nada muda até janeiro; as noites continuam livres'
    : `Tempo · ${noites} por semana ${p.noites === 2 ? 'ficam reservadas' : 'fica reservada'}, ${horario}` +
      (typeof eventosSemana === 'number' ? `; a semana tem ${eventosSemana} ${eventosSemana === 1 ? 'evento' : 'eventos'}` : '')

  // 01 Finanças
  const fin = ctx.financas
  const temSaldo = !!fin && fin.txCount > 0
  const financas = p.espera
    ? `Finanças · a margem de ${mes} não muda; de janeiro em diante, ${fmtBRL(p.custo)}/mês`
    : temSaldo
      ? `Finanças · margem de ${mes} cai de ${fmtBRL(fin.balance)} para ${fmtBRL(fin.balance - p.custo)}`
      : `Finanças · ${fmtBRL(p.custo)}/mês entram como despesa recorrente de Educação`

  // 07 Carreira
  const nSkills = ctx.skills?.length ?? 0
  const jaTemIngles = (ctx.skills ?? []).some(s => /ingl[eê]s|english/i.test(s.name))
  const carreira = jaTemIngles
    ? 'Carreira · Inglês já consta nas habilidades; a trilha passa a alimentá-la'
    : nSkills > 0
      ? `Carreira · Inglês entra ao lado das suas ${nSkills} ${nSkills === 1 ? 'habilidade' : 'habilidades'}`
      : 'Carreira · Inglês passa a constar no seu perfil'

  // 02 Futuro
  const nMetas = ctx.metas?.length ?? 0
  const futuro = p.espera
    ? `Futuro · a meta Fluência até ${anoAlvo} começa a andar em janeiro`
    : `Futuro · a meta Fluência até ${anoAlvo} ganha ritmo: ${noites} por semana` +
      (nMetas > 0 ? `, ao lado de ${nMetas} ${nMetas === 1 ? 'meta ativa' : 'metas ativas'}` : '')

  return [
    { area: '05', texto: mente },
    { area: '03', texto: tempo },
    { area: '01', texto: financas },
    { area: '07', texto: carreira },
    { area: '02', texto: futuro },
  ]
}

function resumoDo(p: Plano, hojeISO: string, viagem: string | null): string {
  if (p.espera) {
    return `O curso começa em janeiro${viagem ? ', depois da viagem' : ''}. A agenda de agora não muda; trilha, recorrente de ${fmtBRL(p.custo)}/mês a partir de janeiro, habilidade e meta ficam registradas.`
  }
  const inicio = ddmm(proximoDiaSemana(hojeISO, TERCA))
  return p.noites === 2
    ? `Duas noites por semana, terça e quinta às 20h, a partir de ${inicio}. Custa ${fmtBRL(p.custo)} por mês.`
    : `Uma noite por semana, terça às 20h, a partir de ${inicio}. Custa ${fmtBRL(p.custo)} por mês e deixa mais noites livres.`
}

/**
 * Proposta determinística com os 3 caminhos do protótipo (R$ 180 · R$ 120 · janeiro).
 * Usada sem chave do Gemini, quando o modelo falha ou quando a saída do modelo
 * não sobrevive à validação por registro.
 */
export function propostaFallback(ctx: ContextoIntencao, hojeISO: string): Proposta {
  const viagem = metaDeViagem(ctx)
  return {
    tipo: 'iniciar_curso',
    caminhos: PLANOS.map(p => ({
      id: p.id,
      // só fala em viagem quando existe uma meta de viagem de verdade
      titulo: p.espera && viagem ? `Esperar a ${viagem} passar` : p.titulo,
      resumo: resumoDo(p, hojeISO, viagem),
      registros: registrosDo(p, hojeISO),
      efeitos: efeitosDo(p, ctx, hojeISO),
    })),
  }
}
