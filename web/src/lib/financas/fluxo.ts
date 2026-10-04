// Fluxo de caixa do hub de Finanças (T1), em funções puras. Saiu de
// app/(app)/financas/page.tsx (cfDays/cfSummary) para ser testável e servir o
// SVG do protótipo prototypes/v5/app/financas-a.html (viewBox 0 0 600 170).

export interface TxFluxo {
  date: string // YYYY-MM-DD
  amount: number
  type: 'income' | 'expense' | 'transfer'
  is_future?: boolean
}

/** Parte de uma frase: `b` = número em negrito (`<b>` no markup). */
export interface Parte { t: string; b?: boolean }

export const textoDe = (partes: Parte[]): string => partes.map(p => p.t).join('')

const pad2 = (n: number) => String(n).padStart(2, '0')

/**
 * Saldo acumulado (receitas − despesas) por dia do mês, do dia 1 até hoje
 * (mês corrente) ou até o último dia (mês passado). Transferências e
 * lançamentos futuros (`is_future`) ficam de fora. Mês futuro: [].
 */
export function saldoAcumuladoPorDia(
  transacoes: TxFluxo[], ano: number, mes: number, hojeISO: string,
): number[] {
  const diasMes = new Date(ano, mes, 0).getDate()
  const prefixo = `${ano}-${pad2(mes)}-`
  const mesHoje = hojeISO.slice(0, 7)
  const atual = `${ano}-${pad2(mes)}`
  let ate: number
  if (atual === mesHoje) ate = Math.min(diasMes, Number(hojeISO.slice(8, 10)))
  else if (atual < mesHoje) ate = diasMes
  else return []

  const net = new Array<number>(ate).fill(0)
  for (const t of transacoes) {
    if (t.is_future || t.type === 'transfer') continue
    if (!t.date.startsWith(prefixo)) continue
    const dia = Number(t.date.slice(8, 10))
    if (dia < 1 || dia > ate) continue
    net[dia - 1] += t.type === 'income' ? Number(t.amount) : -Number(t.amount)
  }
  let acc = 0
  return net.map(v => (acc += v))
}

/**
 * Até 12 leituras da série, numa escala 0..100 centrada no zero (50 = saldo
 * zero; o maior |saldo| com 25% de folga fica em 10 ou 90). Série com menos de
 * 12 pontos devolve uma leitura por ponto, sem inventar dado. Inteiros.
 */
export function leituras12(serie: number[]): number[] {
  const n = serie.length
  if (n === 0) return []
  const idx = n <= 12 ? serie.map((_, i) => i) : Array.from({ length: 12 }, (_, i) => Math.round((i * (n - 1)) / 11))
  const amostra = idx.map(i => serie[i])
  const maxAbs = Math.max(...serie.map(v => Math.abs(v)))
  if (maxAbs === 0) return amostra.map(() => 50)
  const M = maxAbs * 1.25
  return amostra.map(v => Math.max(0, Math.min(100, Math.round(50 + (50 * v) / M))))
}

/** Índices (0-based) das leituras que caíram em relação à anterior. */
export function recuos(serie: number[]): number[] {
  const out: number[] = []
  for (let i = 1; i < serie.length; i++) if (serie[i] < serie[i - 1]) out.push(i)
  return out
}

const r1 = (n: number) => Math.round(n * 10) / 10
const yDe = (v: number) => r1(170 - 1.5 * v)

/**
 * Geometria do SVG do protótipo: x de 0 a 600 em passos iguais, y = 170 − 1,5·v
 * (v=42 → 107, v=78 → 53, como no path de financas-a.html).
 */
export function pathFluxo(leituras: number[]): {
  linha: string; area: string; pontos: { x: number; y: number }[]; fim: { x: number; y: number }
} {
  if (leituras.length === 0) return { linha: '', area: '', pontos: [], fim: { x: 596, y: 95 } }
  const pts = leituras.length === 1
    ? [{ x: 0, y: yDe(leituras[0]) }, { x: 600, y: yDe(leituras[0]) }]
    : leituras.map((v, i) => ({ x: r1((i * 600) / (leituras.length - 1)), y: yDe(v) }))
  const linha = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
  const ultimo = pts[pts.length - 1]
  return {
    linha,
    area: `${linha} L600 170 L0 170 Z`,
    pontos: leituras.length === 1 ? [pts[0]] : pts,
    fim: { x: 596, y: ultimo.y },
  }
}

const CONTAGEM = ['', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove', 'Dez', 'Onze']

function listaOrdinais(idx: number[]): string {
  const ords = idx.map(i => `${i + 1}ª`)
  if (ords.length === 1) return ords[0]
  return `${ords.slice(0, -1).join(', ')} e ${ords[ords.length - 1]}`
}

/**
 * Legenda em prosa do fluxo (protótipo financas-a), com os números reais.
 * `mobile` usa a versão curta de financas-a.mobile.html.
 */
export function prosaFluxo(leituras: number[], variante: 'desktop' | 'mobile' = 'desktop'): Parte[] {
  const n = leituras.length
  if (n === 0) return [{ t: 'Ainda não há saldo acumulado neste mês.' }]
  if (n === 1) {
    return [
      { t: 'Saldo acumulado do mês em ' }, { t: '1', b: true }, { t: ' leitura até agora: ' },
      { t: String(leituras[0]), b: true }, { t: ' numa escala de 0 a 100.' },
    ]
  }
  const ini = String(leituras[0])
  const fim = String(leituras[n - 1])
  const partes: Parte[] = variante === 'mobile'
    ? [
        { t: 'Saldo acumulado do mês em ' }, { t: String(n), b: true }, { t: ' leituras, de ' },
        { t: ini, b: true }, { t: ' a ' }, { t: fim, b: true }, { t: ' numa escala de 0 a 100. ' },
      ]
    : [
        { t: 'Saldo acumulado do mês em ' }, { t: String(n), b: true },
        { t: ' leituras, numa escala de 0 a 100: começou em ' }, { t: ini, b: true },
        { t: ' e chegou a ' }, { t: fim, b: true }, { t: '. ' },
      ]

  const rc = recuos(leituras)
  const caminho = variante === 'mobile' ? '' : ' no caminho'
  if (rc.length === 0) {
    partes.push({ t: `Nenhum recuo${caminho}.` })
    return partes
  }
  const quedas = rc.map(i => leituras[i - 1] - leituras[i])
  const maior = Math.max(...quedas)
  const pequenos = maior <= 5
  const recuperado = (i: number) => i + 1 < n && leituras[i + 1] >= leituras[i - 1]
  const qtdRec = rc.filter(recuperado).length

  if (rc.length === 1) {
    partes.push(
      { t: `Um recuo${pequenos ? ' pequeno' : ''}${caminho} (${listaOrdinais(rc)} leitura), de ` },
      { t: String(maior), b: true },
      { t: ` pontos, ${qtdRec === 1 ? 'recuperado na leitura seguinte' : 'ainda não recuperado'}.` },
    )
    return partes
  }
  const qtd = CONTAGEM[rc.length] ?? String(rc.length)
  const rec = qtdRec === rc.length
    ? 'todos recuperados na leitura seguinte'
    : qtdRec === 0
      ? 'nenhum recuperado na leitura seguinte'
      : `${qtdRec} ${qtdRec === 1 ? 'recuperado' : 'recuperados'} na leitura seguinte`
  partes.push(
    { t: `${qtd} recuos${pequenos ? ' pequenos' : ''}${caminho} (${listaOrdinais(rc)} leituras), nenhum maior que ` },
    { t: String(maior), b: true },
    { t: ` pontos, ${rec}.` },
  )
  return partes
}
