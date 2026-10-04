import { streamText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { buildContextoComFontes, MODULE_PERSONA } from '@/lib/coach/context'
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
    const { ctx, fontes } = await buildContextoComFontes(supabase, user.id, moduleId)

    // Persistência best-effort em coach_messages (migration 028). Sem a tabela,
    // o insert falha em silêncio e a conversa continua respondendo.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as unknown as { from: (t: string) => any }
    const ultimaDoUsuario = [...parsed.data.messages].reverse().find(m => m.role === 'user')
    if (ultimaDoUsuario) {
      try {
        await sb.from('coach_messages').insert({ user_id: user.id, role: 'user', content: ultimaDoUsuario.content, module_id: moduleId })
      } catch { /* tabela ausente ou RLS: segue sem gravar */ }
    }

    const system =
      `${persona.system}\n` +
      'Não liste fontes nem diga de onde tirou os números; o aplicativo mostra as fontes.\n\n' +
      `Contexto (dados reais do usuário):\n${JSON.stringify(ctx, null, 2)}`

    const result = streamText({
      model, system, messages: parsed.data.messages,
      onFinish: async ({ text }) => {
        try {
          await sb.from('coach_messages').insert({ user_id: user.id, role: 'assistant', content: text, module_id: moduleId, fontes })
        } catch { /* best-effort */ }
      },
    })
    return result.toTextStreamResponse({
      headers: { 'x-sy-fontes': encodeURIComponent(JSON.stringify(fontes)) },
    })
  } catch (error) {
    captureApiError('ai/coach-thread', error)
    return new Response('Erro ao consultar a IA. Tente novamente.', { status: 500 })
  }
}
