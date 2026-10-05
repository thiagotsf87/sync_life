// Fase 2 · Importar extrato: regras puras da tela (sem React, sem Supabase).
// A leitura dos arquivos, a categorização por palavra-chave e a regra de duplicata
// continuam em lib/import/* e hooks/use-import.ts; aqui ficam a seleção inicial,
// o resumo "o que reconheci", o "aplicar a todas" por tipo e a formatação.

import { brl, type ParteFala } from '@/lib/financas/hub'

const NBSP = ' '
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export type TipoLinha = 'income' | 'expense'

// ─── seleção inicial ─────────────────────────────────────────────────────────

/** Reconhecidas começam marcadas; possíveis duplicatas começam desmarcadas. */
export function selecaoInicial(
  total: number,
  duplicatas: ReadonlySet<number>,
): { marcadas: Set<number>; puladas: Set<number> } {
  const marcadas = new Set<number>()
  const puladas = new Set<number>()
  for (let i = 0; i < total; i++) (duplicatas.has(i) ? puladas : marcadas).add(i)
  return { marcadas, puladas }
}

// ─── resumo "o que reconheci" ────────────────────────────────────────────────

export interface ResumoExtrato {
  total: number
  comCategoria: number
  semCategoria: number
  duplicatas: number
}

export function resumoReconhecido(
  linhas: { temCategoria: boolean; duplicata: boolean }[],
): ResumoExtrato {
  const comCategoria = linhas.filter(l => l.temCategoria).length
  return {
    total: linhas.length,
    comCategoria,
    semCategoria: linhas.length - comCategoria,
    duplicatas: linhas.filter(l => l.duplicata).length,
  }
}

const plural = (n: number, um: string, varios: string) => (n === 1 ? um : varios)

export function falaReconhecido(banco: string | null, r: ResumoExtrato): ParteFala[] {
  const partes: ParteFala[] = [{ t: banco ? 'Reconheci um extrato do ' : 'Reconheci um extrato' }]
  if (banco) partes.push({ t: banco, b: true })
  partes.push({ t: ' com ' }, { t: String(r.total), b: true }, { t: ` ${plural(r.total, 'linha', 'linhas')}: ` })
  if (r.semCategoria === 0) {
    partes.push({ t: 'todas já com categoria' })
  } else if (r.comCategoria === 0) {
    partes.push({ t: 'nenhuma com categoria' })
  } else {
    partes.push(
      { t: String(r.comCategoria), b: true },
      { t: ' já com categoria, ' },
      { t: String(r.semCategoria), b: true },
      { t: ' sem' },
    )
  }
  if (r.duplicatas > 0) {
    partes.push(
      { t: ', e ' },
      { t: String(r.duplicatas), b: true, w: true },
      { t: ` ${plural(r.duplicatas, 'parece duplicata', 'parecem duplicatas')} do que você já registrou. Deixei ${plural(r.duplicatas, 'a duplicata desmarcada', 'as duplicatas desmarcadas')}.` },
    )
  } else {
    partes.push({ t: '. Nenhuma parece duplicata do que você já registrou.' })
  }
  return partes
}

export function fontesReconhecido(arquivo: string): string {
  return `Lido agora · fontes: ${arquivo}, suas transações do período, suas categorias`
}

// ─── aplicar a todas (respeita o tipo) ───────────────────────────────────────

export interface LinhaAplicar {
  indice: number
  tipo: TipoLinha
  descricao: string
  temCategoria: boolean
  marcada: boolean
}

export interface ResultadoAplicar {
  aplicar: number[]
  fora: { indice: number; descricao: string }[]
}

/** Só linhas marcadas e sem categoria entram; as de outro tipo ficam de fora e são listadas. */
export function aplicarATodas(linhas: LinhaAplicar[], tipoCategoria: TipoLinha): ResultadoAplicar {
  const aplicar: number[] = []
  const fora: { indice: number; descricao: string }[] = []
  for (const l of linhas) {
    if (l.temCategoria || !l.marcada) continue
    if (l.tipo === tipoCategoria) aplicar.push(l.indice)
    else fora.push({ indice: l.indice, descricao: l.descricao })
  }
  return { aplicar, fora }
}

export function mensagemAplicar(res: ResultadoAplicar, tipoCategoria: TipoLinha): ParteFala[] {
  const nome = tipoCategoria === 'income' ? 'receita' : 'despesa'
  const outro = tipoCategoria === 'income' ? 'despesa' : 'receita'
  if (res.aplicar.length === 0) return [{ t: `Nenhuma linha sem categoria é de ${nome}.` }]
  const n = res.aplicar.length
  const partes: ParteFala[] = [
    { t: 'Aplicada a ' }, { t: String(n), b: true }, { t: ` ${plural(n, 'linha', 'linhas')} de ${nome}.` },
  ]
  if (res.fora.length > 0) {
    const nomes = res.fora.map(f => f.descricao).join(', ')
    partes.push({ t: ` ${nomes} ${plural(res.fora.length, 'é', 'são')} ${outro}: escolha à parte.` })
  }
  return partes
}

// ─── totais e SaveBar ────────────────────────────────────────────────────────

export interface LinhaTotal {
  amount: number
  type: TipoLinha
  marcada: boolean
  temCategoria: boolean
}

export interface TotaisMarcadas {
  marcadas: number
  entradas: number
  saidas: number
  semCategoria: number
}

export function totaisMarcadas(linhas: LinhaTotal[]): TotaisMarcadas {
  const t: TotaisMarcadas = { marcadas: 0, entradas: 0, saidas: 0, semCategoria: 0 }
  for (const l of linhas) {
    if (!l.marcada) continue
    t.marcadas++
    if (l.type === 'income') t.entradas += l.amount
    else t.saidas += l.amount
    if (!l.temCategoria) t.semCategoria++
  }
  t.entradas = Math.round(t.entradas * 100) / 100
  t.saidas = Math.round(t.saidas * 100) / 100
  return t
}

export const rotuloImportar = (n: number): string =>
  n === 0 ? 'Marque ao menos uma' : `Importar ${n} ${plural(n, 'transação', 'transações')}`

// ─── formatação ──────────────────────────────────────────────────────────────

/** "+ R$ 4.150,00" / "– R$ 1.200,00" (NBSP depois de R$, en-dash no negativo). */
export const valorLinha = (amount: number, type: TipoLinha): string =>
  type === 'income' ? `+ ${brl(Math.abs(amount))}` : brl(-Math.abs(amount))

export const brlSomaEntrada = (n: number): string => `+ ${brl(n)}`
export const brlSomaSaida = (n: number): string => brl(-n)

/** '2026-09-01' -> '1 set' */
export function dataCurta(iso: string): string {
  const d = Number(iso.slice(8, 10))
  const m = Number(iso.slice(5, 7))
  return `${d}${NBSP}${MESES[m - 1] ?? ''}`
}

/** '1 a 30 set', '28 ago a 3 set' ou '3 set' */
export function intervaloCurto(min: string, max: string): string {
  if (min === max) return dataCurta(min)
  if (min.slice(0, 7) === max.slice(0, 7)) return `${Number(min.slice(8, 10))} a ${dataCurta(max)}`
  return `${dataCurta(min)} a ${dataCurta(max)}`
}

export function intervaloDeDatas(datas: string[]): string {
  if (datas.length === 0) return ''
  let min = datas[0]
  let max = datas[0]
  for (const d of datas) {
    if (d < min) min = d
    if (d > max) max = d
  }
  return intervaloCurto(min, max)
}

// ─── erros ───────────────────────────────────────────────────────────────────

export type ErroImportacao = 'senha' | 'pdf' | 'vazio' | 'mapeamento' | 'lote' | 'generico'

export function textoErro(kind: ErroImportacao, detalhe?: { feitas: number; total: number }): { titulo: string; corpo: string } {
  switch (kind) {
    case 'senha':
      return { titulo: 'Este PDF tem senha.', corpo: 'Exporte o extrato em CSV ou OFX no app do banco e escolha de novo. O SyncLife não pede a senha do seu PDF.' }
    case 'pdf':
      return { titulo: 'Não deu para ler este PDF.', corpo: 'Exporte o extrato em CSV ou OFX no app do banco e escolha de novo.' }
    case 'vazio':
      return { titulo: 'Nenhuma transação neste arquivo.', corpo: 'Confira se é o extrato do período (não um comprovante ou uma fatura em imagem) e tente outro.' }
    case 'mapeamento':
      return { titulo: 'Nenhuma linha válida com estas colunas.', corpo: 'Troque a coluna de data, descrição ou valor e use de novo.' }
    case 'lote':
      return {
        titulo: detalhe ? `${detalhe.feitas} de ${detalhe.total} importadas.` : 'A importação parou.',
        corpo: 'Tente de novo para o resto. O que já entrou fica em Transações.',
      }
    default:
      return { titulo: 'Não deu para importar.', corpo: 'Tente de novo em alguns instantes.' }
  }
}

// ─── mapear colunas (CSV sem banco reconhecido) ──────────────────────────────

export interface MapaColunas { date: string; description: string; amount: string }

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Palpite inicial para o passo de mapear: acha por nome, cai nas 3 primeiras colunas. */
export function chutarColunas(headers: string[]): MapaColunas {
  const acha = (padrao: RegExp, fallback: number) =>
    headers.find(h => padrao.test(norm(h))) ?? headers[Math.min(fallback, Math.max(0, headers.length - 1))] ?? ''
  return {
    date: acha(/data|date|dt/, 0),
    description: acha(/descri|hist|titulo|title|lancamento|memo/, 1),
    amount: acha(/valor|amount|vlr/, 2),
  }
}

// ─── histórico: lotes desfeitos continuam visíveis, riscados ─────────────────

/** Reinsere os lotes desfeitos na posição em que estavam, para a lista não pular. */
export function mesclarDesfeitos<T extends { notes: string }>(
  lotes: T[],
  desfeitos: { lote: T; indice: number; removidas: number }[],
): (T & { desfeito?: number })[] {
  const out: (T & { desfeito?: number })[] = lotes.filter(l => !desfeitos.some(d => d.lote.notes === l.notes))
  const ordenados = [...desfeitos].sort((a, b) => a.indice - b.indice)
  for (const d of ordenados) out.splice(Math.min(d.indice, out.length), 0, { ...d.lote, desfeito: d.removidas })
  return out
}
