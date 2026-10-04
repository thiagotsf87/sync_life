/**
 * Margem do dia: lógica pura (sem React, sem Supabase) para calcular a janela
 * livre entre "agora" e o fim do dia útil, descontando os eventos da agenda.
 * Usada por Meu dia (hero "Sua margem hoje") e pelo pacote de contexto de Sy.
 *
 * Duas leituras do mesmo dia:
 * - `janelaLivre`   → o MAIOR intervalo contínuo sem evento (o que Meu dia mostra
 *                     como "janela de 150 minutos, das 16h30 às 19h") + 8 fatias
 *                     de 1h (14h a 22h) para a linha do dia.
 * - `minutosLivres` → a SOMA de todos os buracos (útil para Sy falar "sobram
 *                     4h30 no seu dia" sem prometer que são contínuas).
 */

export interface EventoJanela {
  start_time: string | null
  end_time: string | null
  all_day?: boolean | null
  status?: string | null
}

export type Segmento = 'on' | 'off'

export interface JanelaLivre {
  /** Duração do maior intervalo contínuo sem evento, em minutos. */
  livreMin: number
  /** Início do intervalo, "HH:MM"; null quando não há janela. */
  inicio: string | null
  /** Fim do intervalo, "HH:MM"; null quando não há janela. */
  fim: string | null
  /** 8 fatias de 1h (14h a 22h): `on` quando a fatia cabe inteira na janela. */
  segmentos8: Segmento[]
}

/** Faixa fixa da linha do dia no protótipo: 14h às 22h, 8 fatias de 1h. */
export const INICIO_PADRAO_MIN = 14 * 60
export const FIM_PADRAO_MIN = 22 * 60
const SEGMENTOS = 8

/** "HH:MM" → minutos desde a meia-noite. Retorna null se a string for inválida. */
export function hhmmToMin(hhmm: string | null | undefined): number | null {
  if (!hhmm) return null
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm)
  if (!m) return null
  const h = Number(m[1]), mi = Number(m[2])
  if (h > 23 || mi > 59) return null
  return h * 60 + mi
}

/** Minutos desde a meia-noite → "HH:MM". */
export function minToHHMM(min: number): string {
  const total = Math.max(0, Math.round(min))
  const h = Math.floor(total / 60), m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Minutos → rótulo humano curto: 390 → "6h30", 120 → "2h", 45 → "45min", 0 → "0min". */
export function fmtMinutos(min: number): string {
  const total = Math.max(0, Math.round(min))
  const h = Math.floor(total / 60), m = total % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}

/**
 * Blocos ocupados dentro de [ini, fim), já recortados e fundidos (sem sobreposição),
 * em ordem crescente. Ignora dia inteiro, cancelados e eventos sem início válido;
 * evento sem `end_time` (ou com fim <= início) ocupa 60 minutos.
 */
function blocosOcupados(eventos: EventoJanela[], ini: number, fim: number): [number, number][] {
  const brutos: [number, number][] = []
  for (const e of eventos) {
    if (e.all_day) continue
    if (e.status === 'cancelado') continue
    const s = hhmmToMin(e.start_time)
    if (s === null) continue
    const eRaw = hhmmToMin(e.end_time)
    const en = eRaw !== null && eRaw > s ? eRaw : s + 60
    const a = Math.max(s, ini), b = Math.min(en, fim)
    if (b > a) brutos.push([a, b])
  }
  brutos.sort((x, y) => x[0] - y[0])

  const fundidos: [number, number][] = []
  for (const [a, b] of brutos) {
    const ultimo = fundidos[fundidos.length - 1]
    if (ultimo && a <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], b)
    else fundidos.push([a, b])
  }
  return fundidos
}

/**
 * Maior intervalo contínuo sem evento entre `max(agoraMin, inicioMin)` e `fimMin`.
 * Por padrão a faixa é a do protótipo (14h a 22h). `segmentos8` fica sempre
 * ancorado em 14h a 22h, independente da faixa pedida, porque é a linha do dia.
 */
export function janelaLivre(
  eventos: EventoJanela[],
  agoraMin: number,
  fimMin: number = FIM_PADRAO_MIN,
  inicioMin: number = INICIO_PADRAO_MIN,
): JanelaLivre {
  const vazio: JanelaLivre = { livreMin: 0, inicio: null, fim: null, segmentos8: Array<Segmento>(SEGMENTOS).fill('off') }
  const ini = Math.max(agoraMin, inicioMin)
  if (fimMin <= ini) return vazio

  const blocos = blocosOcupados(eventos, ini, fimMin)

  let melhor: [number, number] | null = null
  let cursor = ini
  const considerar = (a: number, b: number) => {
    if (b > a && (!melhor || b - a > melhor[1] - melhor[0])) melhor = [a, b]
  }
  for (const [a, b] of blocos) {
    considerar(cursor, a)
    cursor = b
  }
  considerar(cursor, fimMin)

  if (!melhor) return vazio
  const [jIni, jFim] = melhor as [number, number]

  const segmentos8 = Array.from({ length: SEGMENTOS }, (_, i): Segmento => {
    const a = INICIO_PADRAO_MIN + i * 60, b = a + 60
    // regra do protótipo (meu-dia-d.html): a fatia acende com pelo menos 30 min livres dentro dela
    const dentro = Math.max(0, Math.min(b, jFim) - Math.max(a, jIni))
    return dentro >= 30 ? 'on' : 'off'
  })

  return { livreMin: jFim - jIni, inicio: minToHHMM(jIni), fim: minToHHMM(jFim), segmentos8 }
}

/**
 * Soma dos minutos livres (todos os buracos) entre `agoraMin` e `fimMin`.
 * Mesmas regras de ocupação de `janelaLivre`; não exige a faixa das 14h.
 */
export function minutosLivres(eventos: EventoJanela[], agoraMin: number, fimMin: number = FIM_PADRAO_MIN): number {
  const ini = Math.max(0, agoraMin)
  if (fimMin <= ini) return 0
  const ocupado = blocosOcupados(eventos, ini, fimMin).reduce((acc, [a, b]) => acc + (b - a), 0)
  return Math.max(0, fimMin - ini - ocupado)
}
