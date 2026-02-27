import { google } from '@ai-sdk/google'
// import { anthropic } from '@ai-sdk/anthropic'  // ← descomente ao migrar para produção
import { generateObject } from 'ai'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Migrar para Claude: trocar apenas a linha do model
const model = google('gemini-1.5-flash')
// const model = anthropic('claude-sonnet-4-5')

const MealPlanSchema = z.object({
  week: z.array(z.object({
    day: z.enum(['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']),
    breakfast: z.object({ name: z.string(), calories: z.number(), prep_minutes: z.number() }),
    lunch: z.object({ name: z.string(), calories: z.number(), prep_minutes: z.number() }),
    dinner: z.object({ name: z.string(), calories: z.number(), prep_minutes: z.number() }),
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

  const body = await req.json()
  const { tdee, goal_type, dietary_restrictions = [], weekly_budget } = body

  const prompt = `Gere um cardápio semanal saudável para uma pessoa com:
- TDEE (calorias diárias): ${tdee || 2000} kcal
- Objetivo: ${goal_type === 'lose' ? 'Perder peso (déficit de 300-500 kcal)' : goal_type === 'gain' ? 'Ganhar massa (superávit de 200-400 kcal)' : 'Manter peso'}
- Restrições alimentares: ${dietary_restrictions.length > 0 ? dietary_restrictions.join(', ') : 'Nenhuma'}
${weekly_budget ? `- Orçamento semanal: R$ ${weekly_budget}` : ''}

Priorize refeições simples, práticas e típicas da culinária brasileira.
Cada refeição deve ter nome, estimativa de calorias e tempo de preparo em minutos.`

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
