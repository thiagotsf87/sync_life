import { google } from '@ai-sdk/google'
// import { anthropic } from '@ai-sdk/anthropic'  // ← descomente ao migrar para produção
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Migrar para Claude: trocar apenas a linha do model
const model = google('gemini-2.5-flash')
// const model = anthropic('claude-sonnet-4-5')

const SYSTEM_PROMPT = `Você é um assistente especialista em viagens chamado "SyncLife Travel".
Você ajuda usuários a planejar viagens completas: roteiros, hospedagens, transporte, orçamento e dicas locais.
Seja conciso, prático e use formatação markdown quando útil.
Responda sempre em português do Brasil.
Quando sugerir lugares, inclua dicas práticas e estimativas de custo na moeda da viagem quando possível.

Sempre que fizer sentido, adicione ao final da resposta (após um separador "---") os blocos XML abaixo:

1) Sugestões acionáveis de roteiro:
<sync_suggestions>
[{"day_offset":0,"title":"Nome da atividade","category":"sightseeing","address":"endereço opcional","estimated_time":"09:00","estimated_cost":120,"notes":"dica opcional"}]
</sync_suggestions>

2) Estimativa de orçamento:
<sync_budget_estimate>
{"daily_estimate":350,"total_estimate":2100,"assumptions":["referência média","não inclui compras de luxo"]}
</sync_budget_estimate>

Regras importantes:
- Retorne JSON válido dentro dos blocos.
- day_offset começa em 0 (primeiro dia da viagem).
- category deve ser uma destas: sightseeing, restaurant, museum, beach, shopping, transport, rest, other.
- Se não houver dados suficientes, mantenha os blocos com arrays vazios ou valores nulos.`

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
    const { messages, context } = await req.json()

    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\nContexto da viagem atual:\n${JSON.stringify(context, null, 2)}`
      : SYSTEM_PROMPT

    const result = streamText({
      model,
      system: systemWithContext,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[AI Viagem] Error:', error)
    return new Response('Erro ao consultar a IA. Tente novamente.', { status: 500 })
  }
}
