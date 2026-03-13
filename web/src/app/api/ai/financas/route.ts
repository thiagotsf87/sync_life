import { google } from '@ai-sdk/google'
// import { anthropic } from '@ai-sdk/anthropic'  // ← descomente ao migrar para produção
import { streamText } from 'ai'
import { z } from 'zod'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

// Migrar para Claude: trocar apenas a linha do model
const model = google('gemini-2.5-flash')
// const model = anthropic('claude-sonnet-4-5')

const SYSTEM_PROMPT = `Você é o Consultor Financeiro IA do SyncLife.
Analise os dados financeiros do usuário e responda perguntas em português do Brasil.
Seja conciso, prático e use formatação markdown quando útil.
Use os dados do contexto para personalizar cada resposta.
Quando relevante, sugira ações concretas (reduzir gasto em X, aumentar aporte em Y).
Para valores monetários, use formato "R$ X.XXX,XX".
Nunca invente dados — use apenas o que foi fornecido no contexto.
Limite suas respostas a no máximo 300 palavras.`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response('Serviço de IA indisponível. Configure a GOOGLE_GENERATIVE_AI_API_KEY.', { status: 503 })
  }

  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Muitas requisições. Aguarde um momento.' }), { status: 429, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const body = await req.json()

    const MessageSchema = z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(4000),
    })

    const InputSchema = z.object({
      messages: z.array(MessageSchema).min(1).max(50),
      financialContext: z.record(z.string(), z.unknown()).optional(),
    })

    const parsed = InputSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const { messages, financialContext } = parsed.data

    const systemWithContext = financialContext
      ? `${SYSTEM_PROMPT}\n\nDados financeiros do usuário:\n${JSON.stringify(financialContext, null, 2)}`
      : SYSTEM_PROMPT

    const result = streamText({
      model,
      system: systemWithContext,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[AI Financas] Error:', error)
    return new Response('Erro ao consultar a IA. Tente novamente.', { status: 500 })
  }
}
