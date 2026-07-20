import { streamText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { buildModuleContext, MODULE_PERSONA } from '@/lib/coach/context'
import type { ModuleId } from '@/types/shell'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
const model = groq('llama-3.3-70b-versatile')

const InputSchema = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(4000) })).min(1).max(50),
  moduleId: z.string(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  if (!process.env.GROQ_API_KEY) return new Response('IA indisponível.', { status: 503 })
  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) return new Response(JSON.stringify({ error: 'Muitas requisições. Aguarde um momento.' }), { status: 429 })

  try {
    const parsed = InputSchema.safeParse(await req.json())
    if (!parsed.success) return new Response(JSON.stringify(parsed.error.flatten().fieldErrors), { status: 400 })
    const moduleId = (parsed.data.moduleId as ModuleId)
    const persona = MODULE_PERSONA[moduleId] ?? MODULE_PERSONA.panorama
    const context = await buildModuleContext(supabase, user.id, moduleId)
    const system = `${persona.system}\n\nContexto (dados reais do usuário):\n${JSON.stringify(context, null, 2)}`
    const result = streamText({ model, system, messages: parsed.data.messages })
    return result.toTextStreamResponse()
  } catch (error) {
    captureApiError('ai/coach-thread', error)
    return new Response('Erro ao consultar a IA. Tente novamente.', { status: 500 })
  }
}
