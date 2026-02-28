import { google } from '@ai-sdk/google'
// import { anthropic } from '@ai-sdk/anthropic'  // ← descomente ao migrar para produção
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  try {
    const { messages, financialContext } = await req.json()

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
