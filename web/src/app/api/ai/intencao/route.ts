import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { buildContextoComFontes } from '@/lib/coach/context'
import type { ModuleId } from '@/types/shell'
import { IntencaoInput } from '@/lib/intencao/schemas'
import { classificarIntencao, type ContextoIntencao } from '@/lib/intencao/classificar'
import {
  ModeloPropostaSchema, falaDaProposta, juntarContextos, montarRespostaIntencao,
  type ModeloProposta,
} from '@/lib/intencao/rotas'

/**
 * Intenção composta (spec §6.2, plano Fase 1 Task 16 Step 2).
 * Classifica por regex; só `iniciar_curso` vira proposta. O modelo gera os
 * caminhos, mas a whitelist (registro a registro) e os hrefs são do servidor.
 * Sem chave ou com falha do modelo: proposta determinística do protótipo.
 */

const model = google('gemini-2.5-flash')
const AREAS: ModuleId[] = ['tempo', 'financas', 'futuro', 'carreira', 'mente']

function hojeSaoPaulo(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

function montarPrompt(texto: string, ctx: Record<string, unknown>, hojeISO: string): string {
  const ano = Number(hojeISO.slice(0, 4))
  return (
    'Você é Sy, a camada que liga as áreas do SyncLife. A pessoa escreveu uma intenção e você propõe caminhos concretos.\n' +
    `Intenção: "${texto}"\n` +
    `Hoje: ${hojeISO} (America/Sao_Paulo).\n` +
    `Dados reais das cinco áreas (use SOMENTE estes números, nunca invente):\n${JSON.stringify(ctx, null, 2)}\n` +
    'O que gerar:\n' +
    '- 2 ou 3 caminhos (ex.: começar agora · carga menor · esperar algo terminar). Nenhum caminho é o melhor: ' +
    'nunca rotule um como recomendado, ideal, melhor ou mais indicado. A prioridade é da pessoa.\n' +
    '- resumo: a conclusão de Sy em 1 ou 2 frases curtas, segunda pessoa. Os números ficam nos registros e nos efeitos.\n' +
    '- efeitos: o impacto em cada área tocada, uma linha cada, no formato "Área · efeito". Códigos de área: ' +
    '01 Finanças, 02 Futuro, 03 Tempo, 05 Mente, 07 Carreira. Ex.: "Finanças · margem de outubro cai de R$ 1.840,00 para R$ 1.660,00".\n' +
    '- registros: só destas tabelas e com estes campos (o resto é descartado):\n' +
    `  study_tracks {name, target_date YYYY-MM-DD, cost >= 0}: a trilha de estudo (Mente). Prazo padrão ${ano + 1}-12-31.\n` +
    '  agenda_events {title, date YYYY-MM-DD, start_time HH:MM, end_time HH:MM}: um registro por dia da semana do curso, ' +
    'na próxima ocorrência depois de hoje (repete toda semana). Use os horários livres do contexto quando houver; senão, 20:00 a 21:00.\n' +
    '  recurring_transactions {name, amount > 0, day_of_month 1..31}: a mensalidade (Finanças, Educação).\n' +
    '  skills {name}: no máximo uma, a habilidade do idioma (Carreira).\n' +
    `  goals {name, target_date YYYY-MM-DD}: a meta de fluência (Futuro). Prazo padrão ${ano + 1}-12-31.\n` +
    '  Todo registro tem rotulo: uma linha "Área · o que nasce" com o número. Um caminho que espera não cria agenda agora.\n' +
    '- Se o preço não estiver na intenção, assuma R$ 180 por mês para 2 noites e R$ 120 para 1 noite; a pessoa edita depois.\n' +
    'Regras de escrita: português do Brasil, segunda pessoa (você), direto e calmo. Moeda como R$ 1.840,00. ' +
    'Sem travessão (—), sem emoji, sem exclamação. Nunca use a palavra coach. Não fale de si mesmo em terceira pessoa. ' +
    'Não escreva fontes nem "com base em": isso é montado fora do texto.'
  )
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })

  try {
    const parsed = IntencaoInput.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json(parsed.error.flatten().fieldErrors, { status: 400 })
    const { texto, moduleId } = parsed.data

    const tipo = classificarIntencao(texto)
    if (!tipo) return NextResponse.json({ tipo: null })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as unknown as { from: (t: string) => any }
    const hoje = hojeSaoPaulo()

    // 1. Contexto das cinco áreas (cada bloco é best-effort dentro de buildContextoComFontes)
    const pacotes = await Promise.all(AREAS.map(a => buildContextoComFontes(supabase, user.id, a)))
    const { ctx, fontes } = juntarContextos(pacotes)

    // 2. Proposta do modelo (quando houver chave); a validação por registro decide o resto
    let modelo: ModeloProposta | null = null
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const { object } = await generateObject({ model, schema: ModeloPropostaSchema, prompt: montarPrompt(texto, ctx, hoje) })
        modelo = object
      } catch (error) {
        captureApiError('ai/intencao', error, { stage: 'generate' })
      }
    }
    const { proposta, fallback } = montarRespostaIntencao(modelo, ctx as ContextoIntencao, hoje)

    // 3. Persistência: a intenção é obrigatória (o id volta para aplicar/desfazer)
    const { data: row, error: insErr }: { data: { id: string } | null; error: unknown } =
      await sb.from('intencoes')
        .insert({ user_id: user.id, texto, tipo, proposta, status: 'em_aberto' })
        .select('id')
        .single()
    if (insErr || !row) throw insErr ?? new Error('intencoes: insert sem id')
    const intencaoId = row.id

    // 4. Conversa: best-effort, não derruba a resposta
    try {
      await sb.from('coach_messages').insert([
        { user_id: user.id, role: 'user', content: texto, module_id: moduleId, kind: 'mensagem' },
        {
          user_id: user.id, role: 'assistant', content: falaDaProposta(proposta), module_id: moduleId,
          kind: 'intencao', ref_id: intencaoId, fontes,
        },
      ])
    } catch (error) {
      captureApiError('ai/intencao', error, { stage: 'coach_messages' })
    }

    return NextResponse.json({ tipo, intencaoId, proposta, fontes, fallback })
  } catch (error) {
    captureApiError('ai/intencao', error)
    return NextResponse.json({ error: 'Erro ao montar a proposta.' }, { status: 500 })
  }
}
