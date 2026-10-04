import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { buildContextoComFontes } from '@/lib/coach/context'
import type { PanoramaContext } from '@/lib/coach/context'
import { buildFallbackMeuDia, textoFontes } from '@/lib/meu-dia/brief-fallback'

/**
 * Briefing de Meu dia: o texto de Sy (2 a 3 frases) + 3 recomendações.
 * As fontes NUNCA vêm do modelo: saem de buildContextoComFontes e viram
 * "Atualizado às HH:MM · fontes: ..." aqui no servidor (E-07, decisão 5 da Fase 1).
 * Cache diário em coach_briefs com module_id 'meu-dia' (as linhas 'diario' do
 * briefing editorial antigo não são lidas nem sobrescritas).
 */

const model = google('gemini-2.5-flash')
const CACHE_KEY = 'meu-dia'

const InputSchema = z.object({ period: z.string().min(1).max(40), forceFallback: z.boolean().optional() })

const MeuDiaBriefSchema = z.object({
  fala: z.string().describe('Texto de Sy: 2 ou 3 frases, segunda pessoa, com números do contexto.'),
  recs: z.array(z.object({ title: z.string(), detail: z.string() })).length(3),
})

/** O que fica no cache: a geração + as fontes lidas naquele momento. */
const CachedSchema = MeuDiaBriefSchema.extend({ fontes: z.array(z.string()) })

type MeuDiaBrief = z.infer<typeof MeuDiaBriefSchema>

/**
 * Troca caracteres de controle ASCII por espaço (viram tofu no client; acentos
 * ficam), em-dash por vírgula (copy da casa) e colapsa espaços repetidos.
 */
const clean = (s: string) =>
  s.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s*—\s*/g, ', ').replace(/ {2,}/g, ' ').trim()

function sanitize(brief: MeuDiaBrief): MeuDiaBrief {
  return {
    fala: clean(brief.fala),
    recs: brief.recs.map(r => ({ title: clean(r.title), detail: clean(r.detail) })),
  }
}

function resposta(
  brief: MeuDiaBrief, fontes: string[], generatedAt: string,
  extra: { cached: boolean; fallback?: boolean; forced?: boolean },
) {
  return NextResponse.json({
    fala: brief.fala,
    recs: brief.recs,
    fontes,
    fontesTexto: textoFontes(fontes, generatedAt),
    generatedAt,
    ...extra,
  })
}

function montarPrompt(ctx: Record<string, unknown>, period: string): string {
  return (
    'Você escreve o texto de Sy no topo de Meu dia, a tela do SyncLife que mostra o que merece atenção agora.\n' +
    `Período: ${period}.\n` +
    `Dados reais do usuário (use SOMENTE estes números, nunca invente):\n${JSON.stringify(ctx, null, 2)}\n` +
    'Regras de escrita:\n' +
    '- fala: 2 ou 3 frases em português do Brasil, em segunda pessoa (você), direto e calmo.\n' +
    '- Comece pelo que mudou ou pelo que pede atenção hoje (orçamento perto do teto, saldo, conta que vence, agenda).\n' +
    '- A primeira frase traz um número do contexto ou liga duas áreas. Embuta os números no texto (R$ 1.840,00, 37%).\n' +
    '- Nunca invente dado. Se algo não está no contexto, não fale dele.\n' +
    '- Nunca mencione nem cobre check-in ausente. Se houver checkin_ontem, pode citá-lo de forma positiva.\n' +
    '- Você é Sy: não fale de si mesmo em terceira pessoa e não se apresente.\n' +
    '- Proibido usar as palavras edição, folha, diário, coach, manchete, jornal.\n' +
    '- Sem travessão (—), sem emoji, sem exclamações vazias, sem saudação.\n' +
    '- Exemplo de tom: "Desde ontem mudou uma coisa: o lazer encostou no teto, restam R$ 10 até quinta. ' +
    'Fora isso, outubro já está ganho e a poupança fecha acima da meta."\n' +
    '- recs: exatamente 3 próximas ações derivadas dos dados, com title curto (até 4 palavras, verbo no infinitivo) ' +
    'e detail de 1 frase com o número que justifica.\n' +
    '- Não escreva fontes nem "com base em": isso é montado fora do texto.'
  )
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
      const { ctx, fontes } = await buildContextoComFontes(supabase, user.id, 'panorama')
      const brief = buildFallbackMeuDia(ctx as PanoramaContext, period)
      return resposta(brief, fontes, new Date().toISOString(), { cached: false, fallback: true, forced: true })
    }

    // 1. Cache do dia (1 geração/dia/usuário), chave própria de Meu dia
    const { data: cached }: { data: { payload: unknown; created_at: string } | null } =
      await sb.from('coach_briefs')
        .select('payload, created_at')
        .eq('user_id', user.id).eq('brief_date', today).eq('module_id', CACHE_KEY)
        .maybeSingle()
    if (cached) {
      const payload = CachedSchema.safeParse(cached.payload)
      if (payload.success) {
        const { fontes, ...brief } = payload.data
        return resposta(brief, fontes, cached.created_at, { cached: true })
      }
    }

    // 2. Miss: contexto real do panorama + fontes lidas
    const { ctx, fontes } = await buildContextoComFontes(supabase, user.id, 'panorama')

    // 3. Geração com Gemini (quando a chave existir)
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const { object } = await generateObject({ model, schema: MeuDiaBriefSchema, prompt: montarPrompt(ctx, period) })
        const brief = sanitize(object)
        // Cache best-effort (upsert repara linha ruim do dia): erro não derruba a resposta
        try {
          await sb.from('coach_briefs')
            .upsert(
              { user_id: user.id, brief_date: today, module_id: CACHE_KEY, payload: { ...brief, fontes } },
              { onConflict: 'user_id,brief_date,module_id' },
            )
        } catch { /* cache é otimização */ }
        return resposta(brief, fontes, new Date().toISOString(), { cached: false })
      } catch (error) {
        captureApiError('ai/diario-brief', error, { stage: 'generate' })
        // cai no fallback determinístico abaixo
      }
    }

    // 4. Fallback determinístico (sem cache: se a chave voltar, o próximo load regenera)
    const brief = buildFallbackMeuDia(ctx as PanoramaContext, period)
    return resposta(brief, fontes, new Date().toISOString(), { cached: false, fallback: true })
  } catch (error) {
    captureApiError('ai/diario-brief', error)
    return NextResponse.json({ error: 'Erro ao gerar o briefing.' }, { status: 500 })
  }
}
