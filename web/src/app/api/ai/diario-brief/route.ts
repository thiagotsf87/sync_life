import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { fmtBRL } from '@/lib/format/currency'
import { buildModuleContext, MODULE_PERSONA } from '@/lib/coach/context'
import type { PanoramaContext } from '@/lib/coach/context'

const model = google('gemini-2.5-flash')

const InputSchema = z.object({ period: z.string().min(1).max(40), forceFallback: z.boolean().optional() })

const BriefSchema = z.object({
  headline: z.string(),
  p1: z.string(),
  p2: z.string(),
  hand: z.string(),
  recs: z.array(z.object({ title: z.string(), detail: z.string() })).length(3),
  basedOn: z.string(),
})

type Brief = z.infer<typeof BriefSchema>

/** Troca caracteres de controle ASCII por espaço (viram tofu no client; acentos ficam) e colapsa espaços repetidos. */
const clean = (s: string) => s.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/ {2,}/g, ' ').trim()

function sanitizeBrief(brief: Brief): Brief {
  return {
    headline: clean(brief.headline),
    p1: clean(brief.p1),
    p2: clean(brief.p2),
    hand: clean(brief.hand),
    recs: brief.recs.map(r => ({ title: clean(r.title), detail: clean(r.detail) })),
    basedOn: clean(brief.basedOn),
  }
}

/** "a, b e c" (junção pt-BR, sem vírgula antes do "e"). */
function listaPt(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return items.slice(0, -1).join(', ') + ' e ' + items[items.length - 1]
}

/**
 * Brief determinístico com os números reais do contexto, usado quando a IA
 * está indisponível (sem chave ou generateObject falhou). Nunca inventa números.
 */
function buildFallbackBrief(ctx: PanoramaContext, period: string): Brief {
  const f = ctx.financas
  const orcamentos = ctx.orcamentos ?? []
  const contas = ctx.contas ?? []
  const metas = ctx.metas ?? []
  const tenso = orcamentos[0] ?? null
  const hasTx = f.txCount > 0
  const saldoTxt = f.balance < 0
    ? `saldo negativo de ${fmtBRL(Math.abs(f.balance))}`
    : `saldo de ${fmtBRL(f.balance)}`

  // Headline: maior tensão de orçamento > saldo negativo > poupança > saldo > neutro
  let headline: string
  if (tenso && tenso.pct > 85) headline = `O orçamento de ${tenso.category} chegou a ${tenso.pct}% do limite.`
  else if (f.income > 0 && f.balance < 0) headline = 'As despesas do mês passaram as receitas até aqui.'
  else if (f.income > 0 && f.savingsRate >= 20) headline = `Você está guardando ${f.savingsRate}% do que ganhou neste mês.`
  else if (hasTx) headline = `Seu mês segue com ${saldoTxt} até aqui.`
  else headline = `Seu diário de ${period} está pronto para começar.`

  let p1: string
  if (hasTx) {
    p1 = `Em ${period}, você registrou ${fmtBRL(f.income)} em receitas e ${fmtBRL(f.expenses)} em despesas, com ${saldoTxt}.`
    if (f.income > 0) p1 += ` A taxa de poupança do mês está em ${f.savingsRate}%.`
    if (tenso) p1 += ` O orçamento mais pressionado é ${tenso.category}: ${fmtBRL(tenso.gasto)} de ${fmtBRL(tenso.limite)} (${tenso.pct}%).`
  } else {
    p1 = `Ainda não há transações registradas em ${period}. Quando você registrar receitas e despesas, esta folha traz a leitura do mês.`
  }

  const p2Parts: string[] = []
  if (ctx.score) p2Parts.push(`Seu Life Sync Score está em ${ctx.score.total}.`)
  if (metas.length > 0) {
    const meta = metas[0]
    const pctMeta = meta.target_amount > 0 ? Math.round((meta.current_amount / meta.target_amount) * 100) : 0
    p2Parts.push(`Na meta ${meta.name}, você já acumulou ${fmtBRL(meta.current_amount)} de ${fmtBRL(meta.target_amount)} (${pctMeta}%).`)
  }
  if (contas.length > 0) {
    const conta = contas[0]
    p2Parts.push(conta.day_of_month
      ? `Das contas fixas, ${conta.name} (${fmtBRL(conta.amount)}) vence no dia ${conta.day_of_month}.`
      : `Das contas fixas, ${conta.name} soma ${fmtBRL(conta.amount)} por mês.`)
  }
  if (ctx.checkin_ontem) p2Parts.push('Você registrou seu check-in ontem, e isso deixa a leitura dos próximos dias mais fiel.')
  const p2 = p2Parts.length > 0
    ? p2Parts.join(' ')
    : 'Sem metas ou contas fixas registradas por enquanto. O diário cresce junto com os seus dados.'

  const candidatos: Brief['recs'] = []
  if (tenso && tenso.pct > 85) {
    candidatos.push({ title: `Segurar ${tenso.category}`, detail: `Já foram ${fmtBRL(tenso.gasto)} de ${fmtBRL(tenso.limite)}, ${tenso.pct}% do limite.` })
  } else if (tenso && tenso.pct > 70) {
    candidatos.push({ title: `De olho em ${tenso.category}`, detail: `O orçamento está em ${tenso.pct}% do limite, ainda dá para fechar o mês dentro do limite.` })
  }
  if (contas.length > 0) {
    const conta = contas[0]
    candidatos.push({
      title: `Separar ${conta.name}`,
      detail: conta.day_of_month ? `${fmtBRL(conta.amount)}, vence no dia ${conta.day_of_month}.` : `${fmtBRL(conta.amount)} por mês em conta fixa.`,
    })
  }
  if (metas.length > 0) {
    const meta = metas[0]
    const falta = Math.max(0, meta.target_amount - meta.current_amount)
    candidatos.push({
      title: `Aportar em ${meta.name}`,
      detail: falta > 0 ? `Faltam ${fmtBRL(falta)} para o alvo de ${fmtBRL(meta.target_amount)}.` : 'A meta chegou ao alvo, vale revisar o próximo passo.',
    })
  }
  const topCat = f.topCategories[0]
  if (topCat && (!tenso || tenso.category !== topCat.name)) {
    candidatos.push({ title: `Revisar ${topCat.name}`, detail: `Foi a categoria com mais gastos no mês: ${fmtBRL(topCat.total)}.` })
  }
  if (f.income > 0) {
    candidatos.push({ title: 'Acompanhar a poupança', detail: `A taxa do mês está em ${f.savingsRate}%; registrar os gastos do dia mantém o número fiel.` })
  }
  candidatos.push({ title: 'Registrar o dia', detail: 'Uma entrada de hoje mantém o diário fiel ao que aconteceu.' })
  candidatos.push({ title: 'Percorrer suas áreas', detail: 'Os módulos no menu mostram como cada área da sua vida está agora.' })
  candidatos.push({ title: 'Falar com o coach', detail: 'A camada do coach responde sobre qualquer área usando os seus dados.' })

  const fontes: string[] = [f.txCount === 1 ? '1 transação' : `${f.txCount} transações`]
  if (orcamentos.length > 0) fontes.push(orcamentos.length === 1 ? '1 orçamento' : `${orcamentos.length} orçamentos`)
  if (metas.length > 0) fontes.push(metas.length === 1 ? '1 meta' : `${metas.length} metas`)
  if (contas.length > 0) fontes.push(contas.length === 1 ? '1 conta fixa' : `${contas.length} contas fixas`)
  if (ctx.score) fontes.push('seu Life Sync Score')

  return {
    headline,
    p1,
    p2,
    hand: 'Um dia de cada vez.',
    recs: candidatos.slice(0, 3),
    basedOn: listaPt(fontes),
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })

  try {
    const parsed = InputSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json(parsed.error.flatten().fieldErrors, { status: 400 })
    const period = parsed.data.period

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as unknown as { from: (t: string) => any }
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

    // 0. Kill-switch: saída 100% determinística, sem cache (nem leitura) e sem Gemini
    if (parsed.data.forceFallback) {
      const context = await buildModuleContext(supabase, user.id, 'panorama') as PanoramaContext
      const brief = buildFallbackBrief(context, period)
      return NextResponse.json({ ...brief, generatedAt: new Date().toISOString(), cached: false, fallback: true, forced: true })
    }

    // 1. Cache do dia (1 geração/dia/usuário)
    const { data: cached }: { data: { payload: unknown; created_at: string } | null } =
      await sb.from('coach_briefs')
        .select('payload, created_at')
        .eq('user_id', user.id).eq('brief_date', today).eq('module_id', 'diario')
        .maybeSingle()
    if (cached) {
      const payload = BriefSchema.safeParse(cached.payload)
      if (payload.success) {
        return NextResponse.json({ ...payload.data, generatedAt: cached.created_at, cached: true })
      }
    }

    // 2. Miss: contexto real do panorama
    const context = await buildModuleContext(supabase, user.id, 'panorama') as PanoramaContext

    // 3. Geração com Gemini (quando a chave existir)
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const persona = MODULE_PERSONA.panorama
        const prompt =
          `${persona.system}\n` +
          `Você escreve o briefing diário do usuário, a folha de abertura do Diário. Período: ${period}.\n` +
          `Dados reais do usuário (use SOMENTE estes números, nunca invente):\n${JSON.stringify(context, null, 2)}\n` +
          'Regras de escrita:\n' +
          '- Prosa em português do Brasil, sempre em segunda pessoa (você).\n' +
          '- Tom direto e caloroso, sem exclamações vazias.\n' +
          '- headline: uma frase editorial curta sobre o momento do usuário.\n' +
          '- p1: um parágrafo com os números do mês (receitas, despesas, saldo, poupança, orçamentos).\n' +
          '- p2: um parágrafo sobre o resto da vida (score, metas, contas), apenas com o que existir no contexto.\n' +
          '- hand: 1 frase curta e leve, como um rabisco à mão do coach.\n' +
          '- recs: exatamente 3 recomendações acionáveis derivadas dos dados, com title curto e detail de 1 frase.\n' +
          '- basedOn: resumo curto das fontes usadas, por exemplo "34 transações, 3 orçamentos e 2 metas".\n' +
          '- NUNCA mencione nem cobre check-in ausente. Se houver checkin_ontem no contexto, pode referenciá-lo de forma positiva.'
        const { object } = await generateObject({ model, schema: BriefSchema, prompt })
        const brief = sanitizeBrief(object)
        // Cache best-effort (upsert repara linha ruim do dia): erro não derruba a resposta
        try {
          await sb.from('coach_briefs')
            .upsert(
              { user_id: user.id, brief_date: today, module_id: 'diario', payload: brief },
              { onConflict: 'user_id,brief_date,module_id' },
            )
        } catch { /* cache é otimização */ }
        return NextResponse.json({ ...brief, generatedAt: new Date().toISOString(), cached: false })
      } catch (error) {
        captureApiError('ai/diario-brief', error, { stage: 'generate' })
        // cai no fallback determinístico abaixo
      }
    }

    // 4. Fallback determinístico (sem cache: se a chave voltar, o próximo load regenera)
    const brief = buildFallbackBrief(context, period)
    return NextResponse.json({ ...brief, generatedAt: new Date().toISOString(), cached: false, fallback: true })
  } catch (error) {
    captureApiError('ai/diario-brief', error)
    return NextResponse.json({ error: 'Erro ao gerar o briefing.' }, { status: 500 })
  }
}
