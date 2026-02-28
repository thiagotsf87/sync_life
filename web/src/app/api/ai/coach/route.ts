import { createGroq } from '@ai-sdk/groq'
// import { anthropic } from '@ai-sdk/anthropic'  // ← descomente ao migrar para produção
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  try {
    const { messages, healthProfile } = await req.json()

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
    return new Response('Erro ao consultar a IA. Tente novamente.', { status: 500 })
  }
}
