import { createGroq } from '@ai-sdk/groq'
// import { anthropic } from '@ai-sdk/anthropic'  // ← descomente ao migrar para produção
import { streamText } from 'ai'
import { z } from 'zod'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'

// Groq + Llama: velocidade alta, custo zero (free tier: 14.400 req/dia)
// Migrar para Claude: trocar model por anthropic('claude-sonnet-4-5')
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
const model = groq('llama-3.3-70b-versatile')

const SYSTEM_PROMPT = `Você é um coach de saúde e bem-estar chamado "SyncLife Coach".
Você ajuda usuários a atingir objetivos de saúde: perda de peso, ganho de massa, melhor alimentação e exercícios.
Seja empático, motivador e científico nas suas respostas.
Baseie suas sugestões em evidências científicas atuais.
Responda sempre em português do Brasil.
IMPORTANTE: Você não é médico. Para questões médicas, sempre oriente o usuário a consultar um profissional de saúde.`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!process.env.GROQ_API_KEY) {
    return new Response('Serviço de IA indisponível. Configure a GROQ_API_KEY.', { status: 503 })
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
      healthProfile: z.record(z.string(), z.unknown()).optional(),
    })

    const parsed = InputSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const { messages, healthProfile } = parsed.data

    const systemWithProfile = healthProfile
      ? `${SYSTEM_PROMPT}\n\nPerfil de saúde do usuário:\n${JSON.stringify(healthProfile, null, 2)}`
      : SYSTEM_PROMPT

    const result = streamText({
      model,
      system: systemWithProfile,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[AI Coach] Error:', error)
    captureApiError('ai/coach', error)
    return new Response('Erro ao consultar a IA. Tente novamente.', { status: 500 })
  }
}
