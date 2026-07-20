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

const CrossSchema = z.object({
  segments: z.array(z.object({ moduleId: z.string(), text: z.string(), bold: z.boolean().optional() })).min(1).max(3),
  action: z.object({ label: z.string(), targetModule: z.string(), href: z.string() }),
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
    const prompt = `${persona.system}\nConecte ${persona.label} a outro módulo com base nestes dados reais:\n` +
      `${JSON.stringify(context, null, 2)}\nsegments: 2 trechos (moduleId + text; o 2º com bold:true). ` +
      `action: label "Ver em <módulo>", targetModule e href do módulo alvo. Só use fatos do contexto.`
    const { object } = await generateObject({ model, schema: CrossSchema, prompt })
    return NextResponse.json(object)
  } catch (error) {
    captureApiError('ai/coach-cross', error)
    return NextResponse.json({ error: 'Erro ao gerar o cross-insight.' }, { status: 500 })
  }
}
