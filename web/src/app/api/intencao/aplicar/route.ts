import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { AplicarInput } from '@/lib/intencao/schemas'
import { ehIntencaoInvalida, mensagemFeito, normalizarRegistrosParaAplicar, type Feito } from '@/lib/intencao/rotas'

/**
 * Aplica um caminho da intenção (spec §6.2 passo 4, plano Task 16 Step 3).
 * Os registros já vêm validados pelo Zod (whitelist por tabela); o href é
 * sempre o do servidor. A inserção é atômica em `aplicar_intencao`.
 */

type RpcClient = {
  rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message?: string } | null }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (t: string) => any
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })

  try {
    const parsed = AplicarInput.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json(parsed.error.flatten().fieldErrors, { status: 400 })
    const { intencaoId, caminho } = parsed.data
    const registros = normalizarRegistrosParaAplicar(parsed.data.registros)

    const sb = supabase as unknown as RpcClient
    const { data, error } = await sb.rpc('aplicar_intencao', {
      p_intencao: intencaoId, p_caminho: caminho, p_registros: registros,
    })
    if (error) {
      if (ehIntencaoInvalida(error)) {
        return NextResponse.json({ error: 'Essa proposta já foi respondida.' }, { status: 409 })
      }
      captureApiError('intencao/aplicar', error, { stage: 'rpc' })
      return NextResponse.json({ error: 'Não deu para criar os registros.' }, { status: 500 })
    }
    const feitos = (Array.isArray(data) ? data : []) as Feito[]

    try {
      await sb.from('coach_messages').insert({
        user_id: user.id, role: 'assistant', content: mensagemFeito(feitos), kind: 'acao', ref_id: intencaoId,
      })
    } catch (err) {
      captureApiError('intencao/aplicar', err, { stage: 'coach_messages' })
    }

    return NextResponse.json({ feitos })
  } catch (error) {
    captureApiError('intencao/aplicar', error)
    return NextResponse.json({ error: 'Não deu para criar os registros.' }, { status: 500 })
  }
}
