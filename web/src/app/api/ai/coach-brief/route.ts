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

const BriefSchema = z.object({
  eyebrow: z.string(),
  headline: z.object({ text: z.string(), emphasis: z.string().optional() }),
  stats: z.array(z.object({ label: z.string(), value: z.string(), big: z.boolean().optional() })).max(4),
  suggestions: z.array(z.object({ id: z.string(), label: z.string(), prompt: z.string(), primary: z.boolean().optional() })).max(3),
})
const InputSchema = z.object({ moduleId: z.string(), period: z.string() })

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
    const prompt = `${persona.system}\nMódulo: ${persona.label}. Período: ${parsed.data.period}.\n` +
      `Gere um brief para o hero deste módulo com base SOMENTE nestes dados reais:\n${JSON.stringify(context, null, 2)}\n` +
      `eyebrow = "Coach · ${persona.label} · ${parsed.data.period}". headline com um fato e o trecho numérico em "emphasis". ` +
      `stats: até 4 KPIs (o principal com big:true). suggestions: até 3 perguntas úteis.`
    const { object } = await generateObject({ model, schema: BriefSchema, prompt })
    return NextResponse.json(object)
  } catch (error) {
    captureApiError('ai/coach-brief', error)
    return NextResponse.json({ error: 'Erro ao gerar o brief.' }, { status: 500 })
  }
}
