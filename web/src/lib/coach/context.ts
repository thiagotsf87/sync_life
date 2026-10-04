import { MODULES } from '@/lib/modules'
import type { ModuleId } from '@/types/shell'
import { janelaLivre, minutosLivres, fmtMinutos, type EventoJanela } from '@/lib/meu-dia/margem'

/** Persona por módulo: system prompt + label + cor (deriva de MODULES). */
export interface Persona { label: string; color: string; system: string }

const BASE_RULES =
  'Você é o Coach de Vida do SyncLife. Fale em português do Brasil, em segunda pessoa (você). ' +
  'Seja direto e prático, sem jargão. Nunca invente números: use apenas o contexto fornecido. ' +
  'Não use travessão (—) nem emoji. Respostas curtas.'

export const MODULE_PERSONA: Record<ModuleId, Persona> = Object.fromEntries(
  (Object.keys(MODULES) as ModuleId[]).map((id) => [
    id,
    {
      label: MODULES[id].label,
      color: MODULES[id].color,
      system: `${BASE_RULES}\nFoco do módulo: ${MODULES[id].label}.`,
    },
  ]),
) as Record<ModuleId, Persona>

// ─── Finanças (piloto) ───────────────────────────────────────────────
export interface FinancasContext {
  income: number; expenses: number; balance: number; savingsRate: number
  txCount: number
  topCategories: { name: string; total: number }[]
}
type TxRow = { amount: number; type: 'income' | 'expense' | 'transfer'; category: { name: string } | null }

/** Agregação pura (testável sem DB). */
export function summarizeFinancas(txs: TxRow[]): FinancasContext {
  let income = 0, expenses = 0
  const cat = new Map<string, number>()
  for (const t of txs) {
    if (t.type === 'income') income += t.amount
    else if (t.type === 'expense') {
      expenses += t.amount
      const name = t.category?.name ?? 'Outros'
      cat.set(name, (cat.get(name) ?? 0) + t.amount)
    }
  }
  const balance = income - expenses
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0
  const topCategories = [...cat.entries()].map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total).slice(0, 5)
  return { income, expenses, balance, savingsRate, txCount: txs.length, topCategories }
}

// ─── Tipos dos blocos de contexto ────────────────────────────────────
// Type aliases (não interfaces) para o objeto ser atribuível a Record<string, unknown>.
export type ScoreSnapshot = {
  total: number
  financas: number | null
  futuro: number | null
  tempo: number | null
  corpo: number | null
  mente: number | null
  patrimonio: number | null
  carreira: number | null
  experiencias: number | null
  recorded_date: string
}
export type OrcamentoResumo = { category: string; gasto: number; limite: number; pct: number }
export type ContaResumo = { name: string; amount: number; day_of_month: number | null }
export type MetaResumo = {
  name: string; current_amount: number; target_amount: number; target_date: string | null
  monthly_contribution?: number | null
}
export type CheckinResumo = { mood: number; note: string | null }
export type EventoResumo = {
  title: string; date: string; start_time: string | null; end_time: string | null
  all_day: boolean | null; status: string; type: string
}
export type TempoResumo = {
  eventosHoje: EventoResumo[]
  eventosSemana: number
  /** Maior intervalo contínuo sem evento entre agora e 22h, em minutos. */
  janelaLivreMin: number
  /** Início/fim ("HH:MM") desse intervalo; null quando não há janela. */
  janelaInicio: string | null
  janelaFim: string | null
  /** Soma de todos os buracos entre agora e 22h, em minutos. */
  livreTotalMin: number
}
export type FocoResumo = { minutosSemana: number; sessoes: number }
export type TrilhaResumo = { name: string; progress: number; target_date: string | null }
export type SkillResumo = { name: string; category: string | null; proficiency_level: number | null }
export type RoadmapResumo = {
  name: string; current_title: string; target_title: string; progress: number
  passo_atual: string | null
}
export type IntencoesResumo = { total: number; ultima: string | null }

/** Contexto do Panorama (Meu dia). Mantém os campos antigos (compat com diario-brief). */
export type PanoramaContext = {
  financas: FinancasContext
  score?: ScoreSnapshot
  orcamentos?: OrcamentoResumo[]
  contas?: ContaResumo[]
  metas?: MetaResumo[]
  checkin_ontem?: CheckinResumo
  tempo?: { eventosHoje: number; janelaLivreMin: number }
  intencoes_em_aberto?: IntencoesResumo
}

export type TempoContext = { tempo?: TempoResumo; foco?: FocoResumo }
export type FuturoContext = { metas?: MetaResumo[] }
export type MenteContext = { trilhas?: TrilhaResumo[]; foco?: FocoResumo }
export type CarreiraContext = { skills?: SkillResumo[]; roadmap?: RoadmapResumo }

// ─── Datas no fuso America/Sao_Paulo ─────────────────────────────────
const TZ = 'America/Sao_Paulo'
/** Fim do dia útil para a janela livre (22:00). */
const FIM_DIA_MIN = 22 * 60

/** Data de hoje no fuso America/Sao_Paulo (YYYY-MM-DD). */
function todaySaoPaulo(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

/** Soma `n` dias a uma data YYYY-MM-DD (aritmética em UTC ao meio-dia, sem DST). */
function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Data de ontem no fuso America/Sao_Paulo (YYYY-MM-DD). */
function yesterdaySaoPaulo(): string {
  return addDays(todaySaoPaulo(), -1)
}

/** Semana corrente, segunda a domingo (decisão 7 do plano da Fase 1). */
function semanaSaoPaulo(today: string): { inicio: string; fim: string } {
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay() // 0 = domingo
  const offset = dow === 0 ? 6 : dow - 1
  const inicio = addDays(today, -offset)
  return { inicio, fim: addDays(inicio, 6) }
}

/** Minutos desde a meia-noite, agora, em America/Sao_Paulo. */
function agoraMinSaoPaulo(): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(new Date())
  const h = Number(parts.find(p => p.type === 'hour')?.value ?? 0) % 24
  const m = Number(parts.find(p => p.type === 'minute')?.value ?? 0)
  return h * 60 + m
}

// ─── Fontes (puro) ───────────────────────────────────────────────────
function plural(n: number, um: string, varios: string): string {
  return `${n} ${n === 1 ? um : varios}`
}

/**
 * Rótulos humanos das fontes lidas, derivados do próprio `ctx` (um bloco presente
 * = um bloco lido com sucesso). Puro e testável. A ordem segue a leitura.
 */
export function fontesDe(ctx: Record<string, unknown>): string[] {
  const out: string[] = []
  const fin = ctx.financas as FinancasContext | undefined
  if (fin && fin.txCount > 0) out.push(plural(fin.txCount, 'transação', 'transações'))
  const orc = ctx.orcamentos as unknown[] | undefined
  if (orc && orc.length > 0) out.push(plural(orc.length, 'orçamento', 'orçamentos'))
  const contas = ctx.contas as unknown[] | undefined
  if (contas && contas.length > 0) out.push(plural(contas.length, 'conta fixa', 'contas fixas'))
  const metas = ctx.metas as unknown[] | undefined
  if (metas && metas.length > 0) out.push(plural(metas.length, 'meta', 'metas'))
  if (ctx.score) out.push('seu Life Sync Score')
  if (ctx.checkin_ontem) out.push('check-in de ontem')
  const tempo = ctx.tempo as Partial<TempoResumo> | PanoramaContext['tempo'] | undefined
  if (tempo) out.push(Array.isArray(tempo.eventosHoje) ? 'agenda da semana' : 'agenda de hoje')
  const foco = ctx.foco as FocoResumo | undefined
  if (foco && foco.minutosSemana > 0) out.push(`${fmtMinutos(foco.minutosSemana)} de foco`)
  const trilhas = ctx.trilhas as unknown[] | undefined
  if (trilhas && trilhas.length > 0) out.push(plural(trilhas.length, 'trilha de estudo', 'trilhas de estudo'))
  const skills = ctx.skills as unknown[] | undefined
  if (skills && skills.length > 0) out.push(plural(skills.length, 'habilidade', 'habilidades'))
  if (ctx.roadmap) out.push('seu roadmap de carreira')
  const intencoes = ctx.intencoes_em_aberto as IntencoesResumo | undefined
  if (intencoes && intencoes.total > 0) out.push(plural(intencoes.total, 'intenção em aberto', 'intenções em aberto'))
  return out
}

// ─── Leitores por bloco (cada um tolera falha: campo omitido, nunca throw) ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = { from: (t: string) => any }

async function readFoco(sb: SB, userId: string, inicio: string, fim: string): Promise<FocoResumo | undefined> {
  try {
    const { data }: { data: { duration_minutes: number }[] | null } =
      await sb.from('focus_sessions')
        .select('duration_minutes')
        .eq('user_id', userId).gte('date', inicio).lte('date', fim)
    if (!data || data.length === 0) return undefined
    const minutosSemana = data.reduce((s, r) => s + (Number(r.duration_minutes) || 0), 0)
    return { minutosSemana, sessoes: data.length }
  } catch { return undefined }
}

async function readAgendaSemana(sb: SB, userId: string, today: string, inicio: string, fim: string): Promise<TempoResumo | undefined> {
  try {
    const { data }: { data: EventoResumo[] | null } =
      await sb.from('agenda_events')
        .select('title, date, start_time, end_time, all_day, status, type')
        .eq('user_id', userId).gte('date', inicio).lte('date', fim)
        .neq('status', 'cancelado')
        .order('date', { ascending: true }).order('start_time', { ascending: true })
    if (!data) return undefined
    const eventosHoje = data.filter(e => e.date === today)
    const agora = agoraMinSaoPaulo()
    const janela = janelaLivre(eventosHoje as EventoJanela[], agora, FIM_DIA_MIN, 0)
    return {
      eventosHoje, eventosSemana: data.length,
      janelaLivreMin: janela.livreMin, janelaInicio: janela.inicio, janelaFim: janela.fim,
      livreTotalMin: minutosLivres(eventosHoje as EventoJanela[], agora, FIM_DIA_MIN),
    }
  } catch { return undefined }
}

async function readMetas(sb: SB, userId: string, withContribution: boolean): Promise<MetaResumo[] | undefined> {
  try {
    const cols = 'name, current_amount, target_amount, target_date' + (withContribution ? ', monthly_contribution' : '')
    const { data }: { data: MetaResumo[] | null } =
      await sb.from('goals')
        .select(cols)
        .eq('user_id', userId).eq('status', 'active')
        .order('created_at', { ascending: false }).limit(withContribution ? 6 : 3)
    return data && data.length > 0 ? data : undefined
  } catch { return undefined }
}

async function readTrilhas(sb: SB, userId: string): Promise<TrilhaResumo[] | undefined> {
  try {
    const { data }: { data: { name: string; progress: number | string | null; target_date: string | null }[] | null } =
      await sb.from('study_tracks')
        .select('name, progress, target_date')
        .eq('user_id', userId).eq('status', 'in_progress')
        .order('updated_at', { ascending: false }).limit(5)
    if (!data || data.length === 0) return undefined
    return data.map(t => ({ name: t.name, progress: Number(t.progress) || 0, target_date: t.target_date }))
  } catch { return undefined }
}

async function readSkills(sb: SB, userId: string): Promise<SkillResumo[] | undefined> {
  try {
    const { data }: { data: SkillResumo[] | null } =
      await sb.from('skills')
        .select('name, category, proficiency_level')
        .eq('user_id', userId)
        .order('proficiency_level', { ascending: false }).limit(8)
    return data && data.length > 0 ? data : undefined
  } catch { return undefined }
}

async function readRoadmap(sb: SB, userId: string): Promise<RoadmapResumo | undefined> {
  try {
    const { data: rm }: { data: { id: string; name: string; current_title: string; target_title: string; progress: number | string | null } | null } =
      await sb.from('career_roadmaps')
        .select('id, name, current_title, target_title, progress')
        .eq('user_id', userId).eq('status', 'active')
        .order('updated_at', { ascending: false }).limit(1).maybeSingle()
    if (!rm) return undefined
    let passo_atual: string | null = null
    try {
      const { data: step }: { data: { title: string } | null } =
        await sb.from('roadmap_steps')
          .select('title')
          .eq('roadmap_id', rm.id).neq('status', 'completed')
          .order('sort_order', { ascending: true }).limit(1).maybeSingle()
      passo_atual = step?.title ?? null
    } catch { /* passo atual é opcional */ }
    return { name: rm.name, current_title: rm.current_title, target_title: rm.target_title, progress: Number(rm.progress) || 0, passo_atual }
  } catch { return undefined }
}

async function readIntencoes(sb: SB, userId: string): Promise<IntencoesResumo | undefined> {
  try {
    const { data, count }: { data: { texto: string }[] | null; count: number | null } =
      await sb.from('intencoes')
        .select('texto', { count: 'exact' })
        .eq('user_id', userId).eq('status', 'em_aberto')
        .order('created_at', { ascending: false }).limit(1)
    if (count === null && !data) return undefined
    return { total: count ?? (data?.length ?? 0), ultima: data?.[0]?.texto ?? null }
  } catch { return undefined }
}

async function readFinancasMes(sb: SB, userId: string, today: string) {
  const y = Number(today.slice(0, 4)), m = Number(today.slice(5, 7)) // m = 1-12
  const start = `${today.slice(0, 7)}-01`
  const end = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
  const { data } = await sb.from('transactions')
    .select('amount, type, category:categories(name)')
    .eq('user_id', userId).eq('is_future', false).gte('date', start).lte('date', end)
  const txs = (data ?? []) as TxRow[]
  return { txs, y, m }
}

// ─── Montagem por módulo ─────────────────────────────────────────────

/**
 * Pacote de contexto por módulo + rótulos das fontes lidas.
 * `supabase` = cliente server (await createClient()). Cada bloco é best-effort:
 * tabela ausente (schema drift) ou erro de query = campo omitido, nunca throw.
 */
export async function buildContextoComFontes(
  supabase: unknown, userId: string, moduleId: ModuleId,
): Promise<{ ctx: Record<string, unknown>; fontes: string[] }> {
  const sb = supabase as unknown as SB
  const today = todaySaoPaulo()
  const semana = semanaSaoPaulo(today)

  if (moduleId === 'tempo') {
    const ctx: TempoContext = {}
    const tempo = await readAgendaSemana(sb, userId, today, semana.inicio, semana.fim)
    if (tempo) ctx.tempo = tempo
    const foco = await readFoco(sb, userId, semana.inicio, semana.fim)
    if (foco) ctx.foco = foco
    return { ctx, fontes: fontesDe(ctx) }
  }

  if (moduleId === 'futuro') {
    const ctx: FuturoContext = {}
    const metas = await readMetas(sb, userId, true)
    if (metas) ctx.metas = metas
    // `objectives` fica de fora: calcObjectiveProgress vive em um módulo 'use client'
    // (hooks/use-futuro.ts) e não é importável de uma rota server.
    return { ctx, fontes: fontesDe(ctx) }
  }

  if (moduleId === 'mente') {
    const ctx: MenteContext = {}
    const trilhas = await readTrilhas(sb, userId)
    if (trilhas) ctx.trilhas = trilhas
    const foco = await readFoco(sb, userId, semana.inicio, semana.fim)
    if (foco) ctx.foco = foco
    return { ctx, fontes: fontesDe(ctx) }
  }

  if (moduleId === 'carreira') {
    const ctx: CarreiraContext = {}
    const skills = await readSkills(sb, userId)
    if (skills) ctx.skills = skills
    const roadmap = await readRoadmap(sb, userId)
    if (roadmap) ctx.roadmap = roadmap
    return { ctx, fontes: fontesDe(ctx) }
  }

  if (moduleId !== 'financas' && moduleId !== 'panorama') return { ctx: {}, fontes: [] }

  // Janela do mês corrente derivada da data em America/Sao_Paulo (não do fuso do
  // servidor): perto da virada do mês em UTC, o mês local ainda é o anterior.
  const { txs, y, m } = await readFinancasMes(sb, userId, today)
  const ctx: PanoramaContext = { financas: summarizeFinancas(txs) }
  if (moduleId === 'financas') return { ctx, fontes: fontesDe(ctx) }

  // Panorama: enriquecimento best-effort, bloco a bloco.
  try {
    const { data: row }: { data: (Record<'score' | 'financas_score' | 'futuro_score' | 'tempo_score' | 'corpo_score' | 'mente_score' | 'patrimonio_score' | 'carreira_score' | 'experiencias_score', number | null> & { score: number; recorded_date: string }) | null } =
      await sb.from('life_sync_scores')
        .select('score, financas_score, futuro_score, tempo_score, corpo_score, mente_score, patrimonio_score, carreira_score, experiencias_score, recorded_date')
        .eq('user_id', userId).order('recorded_date', { ascending: false }).limit(1).maybeSingle()
    if (row) {
      ctx.score = {
        total: row.score,
        financas: row.financas_score, futuro: row.futuro_score, tempo: row.tempo_score,
        corpo: row.corpo_score, mente: row.mente_score, patrimonio: row.patrimonio_score,
        carreira: row.carreira_score, experiencias: row.experiencias_score,
        recorded_date: row.recorded_date,
      }
    }
  } catch { /* life_sync_scores pode não existir neste ambiente */ }

  try {
    const { data: buds }: { data: { amount: number; category: { name: string } | null }[] | null } =
      await sb.from('budgets')
        .select('amount, category:categories(name)')
        .eq('user_id', userId).eq('month', m).eq('year', y)
    if (buds && buds.length > 0) {
      const spent = new Map<string, number>()
      for (const t of txs) {
        if (t.type !== 'expense') continue
        const name = t.category?.name ?? 'Outros'
        spent.set(name, (spent.get(name) ?? 0) + t.amount)
      }
      const rows: OrcamentoResumo[] = []
      for (const b of buds) {
        const name = b.category?.name
        if (!name || b.amount <= 0) continue
        const gasto = spent.get(name) ?? 0
        rows.push({ category: name, gasto, limite: b.amount, pct: Math.round((gasto / b.amount) * 100) })
      }
      rows.sort((a, b) => b.pct - a.pct)
      if (rows.length > 0) ctx.orcamentos = rows.slice(0, 3)
    }
  } catch { /* orçamentos são opcionais no contexto */ }

  try {
    const { data: recs }: { data: { name: string; amount: number; day_of_month: number | null }[] | null } =
      await sb.from('recurring_transactions')
        .select('name, amount, day_of_month')
        .eq('user_id', userId).eq('is_active', true).eq('type', 'expense')
        .order('day_of_month', { ascending: true }).limit(3)
    if (recs && recs.length > 0) {
      ctx.contas = recs.map(r => ({ name: r.name, amount: r.amount, day_of_month: r.day_of_month }))
    }
  } catch { /* contas fixas são opcionais no contexto */ }

  const metas = await readMetas(sb, userId, false)
  if (metas) ctx.metas = metas

  try {
    const { data: checkin }: { data: CheckinResumo | null } =
      await sb.from('daily_checkins')
        .select('mood, note')
        .eq('user_id', userId).eq('checkin_date', yesterdaySaoPaulo()).maybeSingle()
    if (checkin) ctx.checkin_ontem = checkin
  } catch { /* check-in de ontem é opcional no contexto */ }

  const tempo = await readAgendaSemana(sb, userId, today, semana.inicio, semana.fim)
  if (tempo) ctx.tempo = { eventosHoje: tempo.eventosHoje.length, janelaLivreMin: tempo.janelaLivreMin }

  const intencoes = await readIntencoes(sb, userId)
  if (intencoes) ctx.intencoes_em_aberto = intencoes

  return { ctx, fontes: fontesDe(ctx) }
}

/** Snapshot server-side por módulo (compat: devolve só o ctx). */
export async function buildModuleContext(
  supabase: unknown, userId: string, moduleId: ModuleId,
): Promise<Record<string, unknown>> {
  const { ctx } = await buildContextoComFontes(supabase, userId, moduleId)
  return ctx
}
