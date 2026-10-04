/**
 * Laboratório de Meu dia: "uma escolha, mais de um efeito".
 * Porte puro da aritmética de `prototypes/v5/shared/lab.js` + `SL_MOCK.lab`.
 * Só existe com dado real (evento de lazer hoje + orçamento de lazer); sem isso
 * devolve null e a tela mostra "Nenhuma escolha aberta hoje" (decisão 3 do plano).
 * Nenhum cenário é rotulado como melhor: a prioridade é de quem lê.
 */

import { fmtMinutos } from '@/lib/meu-dia/margem'

export type CenarioId = 'fora' | 'casa' | 'simples'

export interface EntradaLaboratorio {
  /** Quanto resta do orçamento de lazer no mês (pode ser negativo). */
  lazerRestante: number
  /** Limite do orçamento de lazer; <= 0 significa "sem orçamento". */
  tetoLazer: number
  /** Janela livre de hoje, em minutos (de `janelaLivre`). */
  janelaMin: number
  eventoLazerHoje: { titulo: string; hora: string } | null
  /** Média dos últimos jantares da categoria Lazer; null usa o padrão. */
  mediaJantarFora: number | null
  metaViagem: { nome: string; atual: number; alvo: number } | null
}

export interface EfeitosCenario {
  /** Lazer restante depois da escolha (negativo = passa do teto). */
  lazer: number
  /** Minutos livres que sobram na janela depois do preparo. */
  tempoLivreMin: number
  /** Diferença frente a jantar fora (o que poderia virar aporte). */
  aporte: number
  /** Percentual da meta se o aporte fosse feito; null sem meta. */
  metaPct: number | null
}

export interface Cenario {
  id: CenarioId
  nome: string
  custo: number
  prep: number
  /** Rótulo da linha de agenda na prévia ("Jantar em casa com Ana"). */
  agenda: string
  /** Complemento do rótulo ("fora", "em casa", "simples"). */
  agendaSub: string
  efeitos: EfeitosCenario
  /** HTML simples (só <b>), igual à copy do protótipo. */
  copy: string
}

export interface Laboratorio {
  titulo: string
  pergunta: string
  cenarios: [Cenario, Cenario, Cenario]
}

export const CUSTO_FORA_PADRAO = 120
export const CUSTO_CASA = 55
export const CUSTO_SIMPLES = 35
export const PREP_FORA = 0
export const PREP_CASA = 50
export const PREP_SIMPLES = 20

const NB = ' '

/** `R$ 65` sem centavos e com espaço não separável, como `SLLab.brl`. */
export function brl0(n: number): string {
  return 'R$' + NB + Math.abs(n).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function metaPct(meta: EntradaLaboratorio['metaViagem'], aporte: number): number | null {
  if (!meta || meta.alvo <= 0) return null
  return Math.round(((meta.atual + aporte) / meta.alvo) * 100)
}

/** "Jantar com Ana" → "Jantar em casa com Ana" / "Jantar simples com Ana" (como no mock). */
function nomeAgenda(titulo: string, complemento: string): string {
  const m = /^(\S+)(\s.*)?$/.exec(titulo.trim())
  if (!m) return `${titulo} ${complemento}`
  return `${m[1]} ${complemento}${m[2] ?? ''}`
}

function copyFora(efeitos: EfeitosCenario): string {
  const lazer = efeitos.lazer < 0
    ? '<b>O lazer do mês estoura</b>, e isso é uma escolha legítima: a experiência pode valer o gasto.'
    : '<b>O lazer do mês fica dentro do teto</b>, e a escolha é legítima: a experiência pode valer o gasto.'
  return `Você preserva a janela livre e sai para jantar. ${lazer} Sy só mostra o efeito.`
}

function copyCasa(efeitos: EfeitosCenario, prep: number, meta: EntradaLaboratorio['metaViagem']): string {
  const teto = efeitos.lazer < 0
    ? 'O lazer ainda passa do teto, mas por pouco'
    : 'O lazer fica dentro do teto'
  const destino = meta ? `para a ${meta.nome}` : 'para outra prioridade'
  return `Você troca <b>${prep} minutos</b> da janela por <b>${brl0(efeitos.aporte)}</b> de diferença. ${teto}, e a diferença poderia ir ${destino}, se essa for a prioridade.`
}

function copySimples(efeitos: EfeitosCenario, prep: number): string {
  return `A opção de menor custo, com <b>${prep} minutos</b> de preparo. Você preserva <b>${fmtMinutos(efeitos.tempoLivreMin)}</b> livres e <b>${brl0(efeitos.aporte)}</b> que poderiam ir para outra prioridade.`
}

export function cenariosJantar(input: EntradaLaboratorio): Laboratorio | null {
  if (!input.eventoLazerHoje || input.tetoLazer <= 0) return null

  const custoFora = Math.round(input.mediaJantarFora ?? CUSTO_FORA_PADRAO)
  const titulo = input.eventoLazerHoje.titulo

  const efeitos = (custo: number, prep: number): EfeitosCenario => {
    const aporte = custoFora - custo
    return {
      lazer: input.lazerRestante - custo,
      tempoLivreMin: Math.max(0, input.janelaMin - prep),
      aporte,
      metaPct: metaPct(input.metaViagem, aporte),
    }
  }

  const efFora = efeitos(custoFora, PREP_FORA)
  const efCasa = efeitos(CUSTO_CASA, PREP_CASA)
  const efSimples = efeitos(CUSTO_SIMPLES, PREP_SIMPLES)

  const fora: Cenario = {
    id: 'fora',
    nome: 'Sair para jantar',
    custo: custoFora,
    prep: PREP_FORA,
    agenda: titulo,
    agendaSub: 'fora',
    efeitos: efFora,
    copy: copyFora(efFora),
  }
  const casa: Cenario = {
    id: 'casa',
    nome: 'Cozinhar em casa',
    custo: CUSTO_CASA,
    prep: PREP_CASA,
    agenda: nomeAgenda(titulo, 'em casa'),
    agendaSub: 'em casa',
    efeitos: efCasa,
    copy: copyCasa(efCasa, PREP_CASA, input.metaViagem),
  }
  const simples: Cenario = {
    id: 'simples',
    nome: 'Fazer algo simples',
    custo: CUSTO_SIMPLES,
    prep: PREP_SIMPLES,
    agenda: nomeAgenda(titulo, 'simples'),
    agendaSub: 'simples',
    efeitos: efSimples,
    copy: copySimples(efSimples, PREP_SIMPLES),
  }

  return {
    titulo: 'E se o jantar de hoje fosse diferente?',
    pergunta: `${titulo}, hoje às ${input.eventoLazerHoje.hora}.`,
    cenarios: [fora, casa, simples],
  }
}
