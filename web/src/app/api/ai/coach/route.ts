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

const SYSTEM_PROMPT = `Você é o Coach de Vida do SyncLife — um assistente completo que ajuda o usuário a evoluir em todas as dimensões da vida.

Áreas de atuação:
- FINANÇAS: orçamento, investimentos, dívidas, economia
- SAÚDE: exercícios, alimentação, sono, peso, bem-estar
- METAS: objetivos pessoais e profissionais, planejamento
- CARREIRA: crescimento profissional, habilidades, networking
- PATRIMÔNIO: investimentos, diversificação, independência financeira
- TEMPO: produtividade, organização, priorização
- BEM-ESTAR: equilíbrio, mindfulness, hábitos

Regras:
1. Seja empático, motivador e prático
2. Use dados do contexto para personalizar cada resposta
3. Sugira ações concretas e mensuráveis
4. Responda em português do Brasil
5. Mantenha respostas concisas (máximo 300 palavras)
6. Para questões médicas ou jurídicas, oriente procurar um profissional
7. Quando possível, faça conexões entre áreas (ex: como saúde impacta produtividade)
8. Use formato markdown para listas e destaque`

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
      lifeContext: z.record(z.string(), z.unknown()).optional(),
    })

    const parsed = InputSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const { messages, healthProfile, lifeContext } = parsed.data

    let systemWithContext = SYSTEM_PROMPT
    if (healthProfile) {
      systemWithContext += `\n\nPerfil de saúde:\n${JSON.stringify(healthProfile, null, 2)}`
    }
    if (lifeContext) {
      systemWithContext += `\n\nContexto de vida do usuário:\n${JSON.stringify(lifeContext, null, 2)}`
    }

    const result = streamText({
      model,
      system: systemWithContext,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[AI Coach] Error:', error)
    captureApiError('ai/coach', error)
    return new Response('Erro ao consultar a IA. Tente novamente.', { status: 500 })
  }
}
