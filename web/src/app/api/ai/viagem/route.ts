import { google } from '@ai-sdk/google'
// import { anthropic } from '@ai-sdk/anthropic'  // ← descomente ao migrar para produção
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Migrar para Claude: trocar apenas a linha do model
const model = google('gemini-1.5-flash')
// const model = anthropic('claude-sonnet-4-5')

const SYSTEM_PROMPT = `Você é um assistente especialista em viagens chamado "SyncLife Travel".
Você ajuda usuários a planejar viagens completas: roteiros, hospedagens, transporte, orçamento e dicas locais.
Seja conciso, prático e use formatação markdown quando útil.
Responda sempre em português do Brasil.
Quando sugerir lugares, inclua dicas práticas e estimativas de custo em Reais (BRL) quando possível.`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

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
}
