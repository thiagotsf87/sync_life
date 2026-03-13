import { google } from '@ai-sdk/google'
// import { anthropic } from '@ai-sdk/anthropic'  // ← descomente ao migrar para produção
import { generateObject } from 'ai'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

// Migrar para Claude: trocar apenas a linha do model
const model = google('gemini-2.5-flash')
// const model = anthropic('claude-sonnet-4-5')

// RN-CRP-21: incluir macronutrientes (proteína, carboidrato, gordura) em cada refeição
const MealSchema = z.object({
  name: z.string(),
  calories: z.number(),
  prep_minutes: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
})

const MealPlanSchema = z.object({
  week: z.array(z.object({
    day: z.enum(['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']),
    breakfast: MealSchema,
    lunch: MealSchema,
    dinner: MealSchema,
    snacks: z.array(z.object({ name: z.string(), calories: z.number() })).optional(),
  })).length(7),
  weekly_calories: z.number(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json({ error: 'Serviço de IA indisponível. Configure a GOOGLE_GENERATIVE_AI_API_KEY.' }, { status: 503 })
  }

  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) {
    return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })
  }

  const body = await req.json()

  const InputSchema = z.object({
    tdee: z.number().min(800).max(10000).optional().default(2000),
    goal_type: z.enum(['lose', 'gain', 'maintain']).optional().default('maintain'),
    dietary_restrictions: z.array(z.string().max(100)).max(20).optional().default([]),
    weekly_budget: z.number().min(0).max(100000).optional(),
  })

  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { tdee, goal_type, dietary_restrictions, weekly_budget } = parsed.data

  const prompt = `Gere um cardápio semanal saudável para uma pessoa com:
- TDEE (calorias diárias): ${tdee || 2000} kcal
- Objetivo: ${goal_type === 'lose' ? 'Perder peso (déficit de 300-500 kcal)' : goal_type === 'gain' ? 'Ganhar massa (superávit de 200-400 kcal)' : 'Manter peso'}
- Restrições alimentares: ${dietary_restrictions.length > 0 ? dietary_restrictions.join(', ') : 'Nenhuma'}
${weekly_budget ? `- Orçamento semanal: R$ ${weekly_budget}` : ''}

Priorize refeições simples, práticas e típicas da culinária brasileira.
Cada refeição principal (café, almoço, jantar) deve ter: nome, estimativa de calorias, tempo de preparo em minutos e macronutrientes (proteína em g, carboidrato em g, gordura em g).`

  try {
    const { object } = await generateObject({
      model,
      schema: MealPlanSchema,
      prompt,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error('[AI Cardápio] Error:', error)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}
