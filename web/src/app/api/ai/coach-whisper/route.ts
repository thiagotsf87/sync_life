import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { buildModuleContext, MODULE_PERSONA } from '@/lib/coach/context'
import type { ModuleId } from '@/types/shell'

const model = google('gemini-2.5-flash')

const WhisperSchema = z.object({
  lead: z.string(),
  recommendation: z.string(),
  action: z.object({ label: z.string(), href: z.string() }).optional(),
  variant: z.enum(['soft', 'solid']),
  tone: z.enum(['fact', 'suggestion']),
})
const InputSchema = z.object({ moduleId: z.string() })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return new Response('IA indisponível.', { status: 503 })
  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })

  try {
    const parsed = InputSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json(parsed.error.flatten().fieldErrors, { status: 400 })
    const moduleId = parsed.data.moduleId as ModuleId
    const persona = MODULE_PERSONA[moduleId] ?? MODULE_PERSONA.panorama
    const context = await buildModuleContext(supabase, user.id, moduleId)
    const prompt = `${persona.system}\nGere UM nudge curto para ${persona.label} com base nestes dados reais:\n` +
      `${JSON.stringify(context, null, 2)}\nlead = fato principal (<= 18 palavras). recommendation = o que fazer. ` +
      `variant 'solid' se exigir atenção, senão 'soft'. tone 'fact' só se houver dado suficiente; senão 'suggestion'.`
    const { object } = await generateObject({ model, schema: WhisperSchema, prompt })
    return NextResponse.json(object)
  } catch (error) {
    captureApiError('ai/coach-whisper', error)
    return NextResponse.json({ error: 'Erro ao gerar o insight.' }, { status: 500 })
  }
}
