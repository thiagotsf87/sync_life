import { google } from '@ai-sdk/google'
// import { anthropic } from '@ai-sdk/anthropic'  // ← descomente ao migrar para produção
import { generateObject } from 'ai'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'

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
    diet_type: z.string().optional(),
    preferred_proteins: z.array(z.string()).optional(),
    meals_per_day: z.number().min(3).max(6).optional(),
    pre_workout_meal: z.boolean().optional(),
    post_workout_meal: z.boolean().optional(),
    supplements: z.array(z.string()).optional(),
  })

  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const {
    tdee, goal_type, dietary_restrictions, weekly_budget,
    diet_type, preferred_proteins, meals_per_day,
    pre_workout_meal, post_workout_meal, supplements,
  } = parsed.data

  const dietTypeLabel: Record<string, string> = {
    balanced: 'Balanceada',
    'low-carb': 'Low Carb',
    ketogenic: 'Cetogenica',
    vegetarian: 'Vegetariana',
    vegan: 'Vegana',
    carnivore: 'Carnivora',
    mediterranean: 'Mediterranea',
    paleo: 'Paleo',
  }

  const proteinLabel: Record<string, string> = {
    chicken: 'Frango',
    beef: 'Carne Bovina',
    fish: 'Peixe',
    eggs: 'Ovos',
    whey: 'Whey Protein',
    tofu: 'Tofu',
    legumes: 'Leguminosas',
  }

  const supplementLabel: Record<string, string> = {
    creatine: 'Creatina',
    whey: 'Whey Protein',
    bcaa: 'BCAA',
    glutamine: 'Glutamina',
    multivitamin: 'Multivitaminico',
    omega3: 'Omega 3',
  }

  const wizardLines: string[] = []
  if (diet_type) wizardLines.push(`- Tipo de dieta preferida: ${dietTypeLabel[diet_type] ?? diet_type}`)
  if (preferred_proteins && preferred_proteins.length > 0) {
    wizardLines.push(`- Proteinas preferidas: ${preferred_proteins.map(p => proteinLabel[p] ?? p).join(', ')}`)
  }
  if (meals_per_day) wizardLines.push(`- Numero de refeicoes por dia: ${meals_per_day}`)
  if (pre_workout_meal) wizardLines.push(`- Incluir refeicao pre-treino`)
  if (post_workout_meal) wizardLines.push(`- Incluir refeicao pos-treino`)
  if (supplements && supplements.length > 0) {
    wizardLines.push(`- Suplementos em uso: ${supplements.map(s => supplementLabel[s] ?? s).join(', ')}`)
  }

  const prompt = `Gere um cardapio semanal saudavel para uma pessoa com:
- TDEE (calorias diarias): ${tdee || 2000} kcal
- Objetivo: ${goal_type === 'lose' ? 'Perder peso (deficit de 300-500 kcal)' : goal_type === 'gain' ? 'Ganhar massa (superavit de 200-400 kcal)' : 'Manter peso'}
- Restricoes alimentares: ${dietary_restrictions.length > 0 ? dietary_restrictions.join(', ') : 'Nenhuma'}
${weekly_budget ? `- Orcamento semanal: R$ ${weekly_budget}` : ''}
${wizardLines.length > 0 ? '\nPreferencias do wizard:\n' + wizardLines.join('\n') : ''}

Priorize refeicoes simples, praticas e tipicas da culinaria brasileira.
Cada refeicao principal (cafe, almoco, jantar) deve ter: nome, estimativa de calorias, tempo de preparo em minutos e macronutrientes (proteina em g, carboidrato em g, gordura em g).
${diet_type ? `Adapte todas as refeicoes ao estilo ${dietTypeLabel[diet_type] ?? diet_type}.` : ''}
${preferred_proteins && preferred_proteins.length > 0 ? `Priorize as seguintes fontes de proteina: ${preferred_proteins.map(p => proteinLabel[p] ?? p).join(', ')}.` : ''}
${pre_workout_meal ? 'Inclua uma refeicao leve pre-treino (30-60 min antes do exercicio).' : ''}
${post_workout_meal ? 'Inclua uma refeicao pos-treino rica em proteina e carboidrato.' : ''}
${supplements && supplements.length > 0 ? `O usuario toma os seguintes suplementos: ${supplements.map(s => supplementLabel[s] ?? s).join(', ')}. Considere isso na distribuicao de macros.` : ''}`

  try {
    const { object } = await generateObject({
      model,
      schema: MealPlanSchema,
      prompt,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error('[AI Cardápio] Error:', error)
    captureApiError('ai/cardapio', error)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}
