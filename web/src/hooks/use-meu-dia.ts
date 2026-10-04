'use client'

// Fase 1 · Meu dia D: agrega o que a tela precisa a partir dos hooks reais.
// Sem lógica de negócio nova aqui: a aritmética mora em lib/meu-dia (margem,
// gatilhos, laboratório), os números em useDiario, o texto de Sy em
// useMeuDiaBrief, o ritmo em daily_checkins (useCheckin). Tudo degrada gracioso:
// tabela ausente ou dado faltando vira null/[] e a tela mostra o estado quieto.

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useDiario, type DiarioData } from '@/hooks/use-diario'
import { useMeuDiaBrief, type MeuDiaBrief } from '@/hooks/use-diario-brief'
import { useCheckin, type CheckinToday } from '@/hooks/use-checkin'
import { useFocusSessions } from '@/hooks/use-focus-sessions'
import { calcProgress } from '@/hooks/use-metas'
import type { AgendaEvent } from '@/hooks/use-agenda'
import { janelaLivre, hhmmToMin, type JanelaLivre } from '@/lib/meu-dia/margem'
import { cenariosJantar, type Laboratorio } from '@/lib/meu-dia/laboratorio'
import {
  escapeHtml,
  montarItens,
  type IntencaoEmAberto,
  type ItemPedeVoce,
} from '@/lib/meu-dia/gatilhos'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type RitmoId = 'lento' | 'normal' | 'energia'
export type AcordoId = 'pedir' | 'mudar' | 'resumo'

export const RITMO_MOOD: Record<RitmoId, number> = { lento: 2, normal: 3, energia: 4 }
export const RITMO_LABEL: Record<RitmoId, string> = {
  lento: 'Mais lento',
  normal: 'No meu ritmo',
  energia: 'Com energia',
}

export interface IntencaoAberta {
  id: string
  texto: string
  created_at: string
}

export interface LazerHoje {
  categoriaId: string
  nome: string
  teto: number
  gasto: number
  restante: number
  pct: number
}

export interface MetaViagem {
  nome: string
  atual: number
  alvo: number
  pct: number
}

export interface EventoLazer {
  id: string
  titulo: string
  /** "20h" / "20h30", formato do protótipo. */
  hora: string
}

export interface SemanaResumo {
  scoreInicio: number | null
  scoreFim: number | null
  feitos: number
  total: number
  focoMin: number
}

export interface MeuDiaData {
  diario: DiarioData
  brief: MeuDiaBrief | null
  briefLoading: boolean
  /** Minutos desde a meia-noite em SP; null antes de hidratar. */
  agoraMin: number | null
  /** "Sexta · 3 de outubro" (SP); '' antes de hidratar. */
  dataCurta: string
  /** "sexta" (SP); '' antes de hidratar. */
  diaSemana: string
  eventosHoje: AgendaEvent[]
  janela: JanelaLivre
  compromissosAFrente: number
  lazer: LazerHoje | null
  mediaJantarFora: number | null
  /** Quantos gastos de Lazer entraram na média (0 quando não houve). */
  mediaN: number
  metaViagem: MetaViagem | null
  eventoLazer: EventoLazer | null
  lab: Laboratorio | null
  intencoes: IntencaoAberta[]
  itens: ItemPedeVoce[]
  ritmo: {
    atual: RitmoId | null
    registro: CheckinToday | null
    loading: boolean
    unavailable: boolean
    salvar: (r: RitmoId, nota: string) => Promise<boolean>
  }
  acordo: AcordoId
  setAcordo: (a: AcordoId) => void
  semana: SemanaResumo
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const SP_TZ = 'America/Sao_Paulo'
const ACORDO_KEY = 'sy.acordo'
const ACORDO_EVT = 'sy-acordo'

function todaySP(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: SP_TZ })
}

function agoraMinSP(): number {
  const [h, m] = new Date()
    .toLocaleTimeString('en-GB', { timeZone: SP_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .split(':')
    .map(Number)
  return h * 60 + m
}

function diaSemanaSP(): string {
  return new Date()
    .toLocaleDateString('pt-BR', { timeZone: SP_TZ, weekday: 'long' })
    .replace('-feira', '')
}

function dataCurtaSP(): string {
  const sem = diaSemanaSP()
  const resto = new Date().toLocaleDateString('pt-BR', { timeZone: SP_TZ, day: 'numeric', month: 'long' })
  return `${sem.charAt(0).toUpperCase()}${sem.slice(1)} · ${resto}`
}

/** "20:00" → "20h", "20:30" → "20h30". */
export function horaCurta(hhmm: string | null | undefined): string {
  const min = hhmmToMin(hhmm)
  if (min === null) return ''
  const h = Math.floor(min / 60), m = min % 60
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
}

function diasAte(dateStr: string, hoje: string): number {
  const a = Date.parse(`${hoje}T00:00:00Z`)
  const b = Date.parse(`${dateStr.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.POSITIVE_INFINITY
  return Math.round((b - a) / 86400000)
}

function ritmoDoMood(mood: number | undefined): RitmoId | null {
  if (mood === undefined) return null
  if (mood <= 2) return 'lento'
  if (mood >= 4) return 'energia'
  return 'normal'
}

const AREA_POR_NOME: Record<string, string> = {
  financas: '01', futuro: '02', tempo: '03', corpo: '04',
  mente: '05', patrimonio: '06', carreira: '07', experiencias: '08',
}

/** Áreas citadas na proposta (caminhos[].efeitos[].area), como códigos 01..08. */
function areasDaProposta(proposta: unknown): string[] {
  const out: string[] = []
  const caminhos = (proposta as { caminhos?: { efeitos?: { area?: unknown }[] }[] } | null)?.caminhos
  for (const c of Array.isArray(caminhos) ? caminhos : []) {
    for (const e of Array.isArray(c?.efeitos) ? c.efeitos : []) {
      if (typeof e?.area !== 'string') continue
      const raw = e.area.trim()
      const norm = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      const cod = /^0[1-8]$/.test(raw) ? raw : AREA_POR_NOME[norm]
      if (cod && !out.includes(cod)) out.push(cod)
    }
  }
  return out
}

// relógio de minuto (SSR-safe, sem setState em effect)
function subscribeMinuto(cb: () => void) {
  const id = window.setInterval(cb, 30_000)
  return () => window.clearInterval(id)
}
const semDado = () => null
const semTexto = () => ''

// acordo com Sy em localStorage (Fase 7 leva para /configuracoes/sy)
function lerAcordo(): AcordoId {
  try {
    const v = window.localStorage.getItem(ACORDO_KEY)
    return v === 'pedir' || v === 'resumo' || v === 'mudar' ? v : 'mudar'
  } catch {
    return 'mudar'
  }
}
function subscribeAcordo(cb: () => void) {
  window.addEventListener('storage', cb)
  window.addEventListener(ACORDO_EVT, cb)
  return () => {
    window.removeEventListener('storage', cb)
    window.removeEventListener(ACORDO_EVT, cb)
  }
}
const acordoServidor = (): AcordoId => 'mudar'

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useMeuDia(): MeuDiaData {
  const diario = useDiario()
  const briefQ = useMeuDiaBrief()
  const ck = useCheckin()
  const foco = useFocusSessions('week')

  const agoraMin = useSyncExternalStore(subscribeMinuto, agoraMinSP, semDado)
  const dataCurta = useSyncExternalStore(subscribeMinuto, dataCurtaSP, semTexto)
  const diaSemana = useSyncExternalStore(subscribeMinuto, diaSemanaSP, semTexto)
  const acordo = useSyncExternalStore(subscribeAcordo, lerAcordo, acordoServidor)

  const setAcordo = useCallback((a: AcordoId) => {
    try { window.localStorage.setItem(ACORDO_KEY, a) } catch { /* sem storage: vale só a sessão */ }
    window.dispatchEvent(new Event(ACORDO_EVT))
  }, [])

  const { base } = diario
  const hoje = todaySP()

  // ── agenda de hoje + janela livre ──────────────────────────────────────────
  const eventosHoje = useMemo(
    () =>
      base.eventosSemana
        .filter(e => e.date === hoje && e.status !== 'cancelado')
        .sort((a, b) => (hhmmToMin(a.start_time) ?? -1) - (hhmmToMin(b.start_time) ?? -1)),
    [base.eventosSemana, hoje],
  )

  const janela = useMemo(
    () =>
      janelaLivre(
        eventosHoje.map(e => ({
          start_time: e.start_time ?? null,
          end_time: e.end_time ?? null,
          all_day: e.all_day,
          status: e.status,
        })),
        agoraMin ?? 0,
      ),
    [eventosHoje, agoraMin],
  )

  const compromissosAFrente = eventosHoje.filter(e => {
    if (e.status === 'concluido') return false
    const s = hhmmToMin(e.start_time)
    return s !== null && agoraMin !== null && s >= agoraMin
  }).length

  // ── lazer (orçamento por nome) ─────────────────────────────────────────────
  const lazerBudget = base.budgets.find(b => (b.category?.name ?? '').trim().toLowerCase() === 'lazer') ?? null
  const lazer: LazerHoje | null = lazerBudget
    ? {
        categoriaId: lazerBudget.category_id,
        nome: lazerBudget.category?.name ?? 'Lazer',
        teto: lazerBudget.amount,
        gasto: lazerBudget.gasto,
        restante: lazerBudget.amount - lazerBudget.gasto,
        pct: lazerBudget.pct,
      }
    : null

  // média dos 3 últimos gastos de Lazer no mês
  const [media, setMedia] = useState<{ cat: string; valor: number | null; n: number } | null>(null)
  const catLazer = lazer?.categoriaId ?? null
  useEffect(() => {
    if (!catLazer) return
    let vivo = true
    const supabase = createClient()
    const [ano, mes] = hoje.split('-').map(Number)
    const ini = `${ano}-${String(mes).padStart(2, '0')}-01`
    const fim = new Date(Date.UTC(ano, mes, 0)).toISOString().slice(0, 10)
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('amount, date')
          .eq('category_id', catLazer)
          .eq('type', 'expense')
          .eq('is_future', false)
          .gte('date', ini)
          .lte('date', fim)
          .order('date', { ascending: false })
          .limit(3)
        if (!vivo) return
        const rows = (error ? [] : (data ?? [])) as { amount: number }[]
        const valor = rows.length > 0 ? rows.reduce((s, r) => s + Number(r.amount), 0) / rows.length : null
        setMedia({ cat: catLazer, valor, n: rows.length })
      } catch {
        if (vivo) setMedia({ cat: catLazer, valor: null, n: 0 })
      }
    })()
    return () => { vivo = false }
  }, [catLazer, hoje])
  const mediaAtual = media && media.cat === catLazer ? media : null

  // ── meta de viagem ─────────────────────────────────────────────────────────
  const ativas = base.goals.filter(g => g.status === 'active')
  const goalViagem = ativas.find(g => /viagem|it[aá]lia/i.test(g.name)) ?? ativas[0] ?? null
  const metaViagem: MetaViagem | null = goalViagem
    ? {
        nome: goalViagem.name,
        atual: goalViagem.current_amount,
        alvo: goalViagem.target_amount,
        pct: calcProgress(goalViagem.current_amount, goalViagem.target_amount),
      }
    : null

  // ── evento de lazer de hoje (pessoal, a partir das 18h) ────────────────────
  const evLazer = eventosHoje.find(e => {
    const s = hhmmToMin(e.start_time)
    return e.type === 'pessoal' && s !== null && s >= 18 * 60
  })
  const eventoLazer: EventoLazer | null = evLazer
    ? { id: evLazer.id, titulo: evLazer.title, hora: horaCurta(evLazer.start_time) }
    : null

  // cálculo puro e barato: sem memo (o React Compiler cuida)
  const lab = cenariosJantar({
    lazerRestante: lazer?.restante ?? 0,
    tetoLazer: lazer?.teto ?? 0,
    janelaMin: janela.livreMin,
    eventoLazerHoje: eventoLazer ? { titulo: eventoLazer.titulo, hora: eventoLazer.hora } : null,
    mediaJantarFora: mediaAtual?.valor ?? null,
    // a copy do laboratório é HTML: o nome vem do usuário, então entra escapado
    metaViagem: metaViagem
      ? { nome: escapeHtml(metaViagem.nome), atual: metaViagem.atual, alvo: metaViagem.alvo }
      : null,
  })

  // ── intenções em aberto ────────────────────────────────────────────────────
  const [intencoesRaw, setIntencoesRaw] = useState<(IntencaoAberta & { proposta: unknown })[]>([])
  useEffect(() => {
    let vivo = true
    const sb = createClient() as unknown as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      from: (t: string) => any
    }
    void (async () => {
      try {
        const { data, error }: { data: (IntencaoAberta & { proposta: unknown })[] | null; error: unknown } =
          await sb
            .from('intencoes')
            .select('id, texto, proposta, created_at')
            .eq('status', 'em_aberto')
            .order('created_at', { ascending: false })
        if (vivo && !error && data) setIntencoesRaw(data)
      } catch {
        // tabela ausente (migration 028 não aplicada): segue sem intenções
      }
    })()
    return () => { vivo = false }
  }, [])

  const intencoes: IntencaoAberta[] = intencoesRaw.map(({ id, texto, created_at }) => ({ id, texto, created_at }))

  // ── pede você hoje ─────────────────────────────────────────────────────────
  const brief = briefQ.brief
  const itens = useMemo(() => {
    const emAberto: IntencaoEmAberto[] = intencoesRaw.map(i => ({
      id: i.id,
      texto: i.texto,
      areas: areasDaProposta(i.proposta),
    }))
    return montarItens({
      ativas: diario.areas.ativas.map(a => a.n),
      intencoesEmAberto: emAberto,
      orcamentos: base.budgets
        .filter(b => b.amount > 0)
        .map(b => ({ categoria: b.category?.name ?? 'Orçamento', gasto: b.gasto, limite: b.amount, pct: b.pct })),
      contas: base.contas
        .filter(c => c.type === 'expense')
        .map(c => ({ nome: c.name, valor: c.amount, diasRestantes: c.daysLeft })),
      metas: base.goals
        .filter(g => g.status === 'active')
        .map(g => ({ nome: g.name, diasParaPrazo: g.target_date ? diasAte(g.target_date, hoje) : null })),
      eventosHoje: eventosHoje.map(e => ({
        titulo: e.title,
        hora: e.start_time ? e.start_time.slice(0, 5) : null,
        tipo: e.type,
      })),
      areas: diario.areas.ativas.map(a => ({ n: a.n, nome: a.nome, tendencia: a.tendencia })),
      proximaAcao: brief?.recs[0] ? { titulo: brief.recs[0].title, detalhe: brief.recs[0].detail } : null,
    })
  }, [intencoesRaw, diario.areas.ativas, base.budgets, base.contas, base.goals, eventosHoje, brief, hoje])

  // ── ritmo ──────────────────────────────────────────────────────────────────
  const ckSave = ck.save
  const salvarRitmo = useCallback(
    (r: RitmoId, nota: string) => ckSave(RITMO_MOOD[r], nota),
    [ckSave],
  )

  // ── semana ─────────────────────────────────────────────────────────────────
  const hist = base.history
  const eventosSemanaValidos = base.eventosSemana.filter(e => e.status !== 'cancelado')
  const semana: SemanaResumo = {
    scoreInicio: hist.length >= 7 ? Math.round(hist[6].score) : null,
    scoreFim: diario.score ? diario.score.total : null,
    feitos: eventosSemanaValidos.filter(e => e.status === 'concluido').length,
    total: eventosSemanaValidos.length,
    focoMin: foco.kpis.weekMinutes,
  }

  return {
    diario,
    brief,
    briefLoading: briefQ.loading,
    agoraMin,
    dataCurta,
    diaSemana,
    eventosHoje,
    janela,
    compromissosAFrente,
    lazer,
    mediaJantarFora: mediaAtual?.valor ?? null,
    mediaN: mediaAtual?.n ?? 0,
    metaViagem,
    eventoLazer,
    lab,
    intencoes,
    itens,
    ritmo: {
      atual: ritmoDoMood(ck.checkin?.mood),
      registro: ck.checkin,
      loading: ck.loading,
      unavailable: ck.unavailable,
      salvar: salvarRitmo,
    },
    acordo,
    setAcordo,
    semana,
  }
}
