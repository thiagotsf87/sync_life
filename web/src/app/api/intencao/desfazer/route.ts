import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-helpers'
import { DesfazerInput } from '@/lib/intencao/schemas'
import { ehIntencaoInvalida, mensagemDesfeito, type Feito } from '@/lib/intencao/rotas'

/**
 * Desfaz uma intenção aplicada (spec §6.2 passo 5, plano Task 16 Step 4).
 * `desfazer_intencao` apaga só o que não foi editado depois e devolve o que ficou.
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
    const parsed = DesfazerInput.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json(parsed.error.flatten().fieldErrors, { status: 400 })
    const { intencaoId } = parsed.data

    const sb = supabase as unknown as RpcClient
    const { data, error } = await sb.rpc('desfazer_intencao', { p_intencao: intencaoId })
    if (error) {
      if (ehIntencaoInvalida(error)) {
        return NextResponse.json({ error: 'Essa proposta não está aplicada.' }, { status: 409 })
      }
      captureApiError('intencao/desfazer', error, { stage: 'rpc' })
      return NextResponse.json({ error: 'Não deu para desfazer.' }, { status: 500 })
    }
    const ficaram = (Array.isArray(data) ? data : []) as Feito[]

    try {
      await sb.from('coach_messages').insert({
        user_id: user.id, role: 'assistant', content: mensagemDesfeito(ficaram.length), kind: 'acao', ref_id: intencaoId,
      })
    } catch (err) {
      captureApiError('intencao/desfazer', err, { stage: 'coach_messages' })
    }

    return NextResponse.json({ ficaram })
  } catch (error) {
    captureApiError('intencao/desfazer', error)
    return NextResponse.json({ error: 'Não deu para desfazer.' }, { status: 500 })
  }
}
