'use client'

// Fase 1 · Task 17 · ciclo de vida de UMA intenção composta na camada de Sy:
// propor (POST /api/ai/intencao) → em aberto → aplicar (POST /api/intencao/aplicar)
// → aplicada → desfazer (POST /api/intencao/desfazer) → desfeita. `carregar`
// reabre uma intenção já gravada (o Decidir de Meu dia). Depois de aplicar ou
// desfazer, avisa as outras telas com o evento `sy:intencao-mudou`.

import { useCallback, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PropostaSchema, type Proposta, type Registro } from '@/lib/intencao/schemas'
import type { Feito } from '@/lib/intencao/rotas'

export const EVENTO_INTENCAO = 'sy:intencao-mudou'

export type EstadoIntencaoUI =
  | 'ocioso' | 'propondo' | 'em_aberto' | 'aplicando' | 'aplicada' | 'desfazendo' | 'desfeita' | 'erro'

export interface IntencaoAtual {
  id: string
  texto: string
  proposta: Proposta
  fontes: string[]
  criadaEm: string
}

export interface UseIntencao {
  estado: EstadoIntencaoUI
  atual: IntencaoAtual | null
  /** caminho aplicado (id) quando aplicada */
  caminho: string | null
  feitos: Feito[]
  aplicadaEm: string | null
  /** registros que ficaram no desfazer (editados depois de criados) */
  ficaram: Feito[]
  erro: string | null
  /** a intenção quando virou proposta; null quando o texto não é intenção (vai para a conversa) ou falhou */
  propor: (texto: string, moduleId?: string) => Promise<IntencaoAtual | null>
  carregar: (intencaoId: string) => Promise<IntencaoAtual | null>
  /** a intenção em aberto mais recente com este texto (seed "Decidir: <texto>") */
  carregarAbertaPorTexto: (texto: string) => Promise<IntencaoAtual | null>
  aplicar: (caminho: string, registrosMarcados: Registro[]) => Promise<boolean>
  desfazer: () => Promise<boolean>
  limparErro: () => void
}

type Sb = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (t: string) => any
}

interface IntencaoDb {
  id: string
  texto: string
  proposta: unknown
  caminho: string | null
  aplicado: Feito[] | null
  status: 'em_aberto' | 'aplicada' | 'desfeita'
  created_at: string
  aplicada_em: string | null
}

const COLS = 'id, texto, proposta, caminho, aplicado, status, created_at, aplicada_em'

function avisar() {
  window.dispatchEvent(new CustomEvent(EVENTO_INTENCAO))
}

async function fontesDaIntencao(sb: Sb, id: string): Promise<string[]> {
  try {
    const { data }: { data: { fontes: unknown }[] | null } = await sb
      .from('coach_messages')
      .select('fontes')
      .eq('ref_id', id)
      .eq('kind', 'intencao')
      .limit(1)
    const raw = data?.[0]?.fontes
    return Array.isArray(raw) ? raw.filter((f): f is string => typeof f === 'string') : []
  } catch {
    return []
  }
}

export function useIntencao(): UseIntencao {
  const [estado, setEstado] = useState<EstadoIntencaoUI>('ocioso')
  const [atual, setAtual] = useState<IntencaoAtual | null>(null)
  const [caminho, setCaminho] = useState<string | null>(null)
  const [feitos, setFeitos] = useState<Feito[]>([])
  const [aplicadaEm, setAplicadaEm] = useState<string | null>(null)
  const [ficaram, setFicaram] = useState<Feito[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const atualRef = useRef<IntencaoAtual | null>(null)

  const definir = useCallback((it: IntencaoAtual | null) => {
    atualRef.current = it
    setAtual(it)
  }, [])

  const propor = useCallback(async (texto: string, moduleId = 'panorama'): Promise<IntencaoAtual | null> => {
    setEstado('propondo')
    setErro(null)
    try {
      const res = await fetch('/api/ai/intencao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, moduleId }),
      })
      if (!res.ok) { setEstado(atualRef.current ? 'em_aberto' : 'ocioso'); return null }
      const json = (await res.json()) as { tipo: string | null; intencaoId?: string; proposta?: unknown; fontes?: unknown }
      const prop = PropostaSchema.safeParse(json.proposta)
      if (!json.tipo || !json.intencaoId || !prop.success) {
        setEstado(atualRef.current ? 'em_aberto' : 'ocioso')
        return null
      }
      const novo: IntencaoAtual = {
        id: json.intencaoId,
        texto,
        proposta: prop.data,
        fontes: Array.isArray(json.fontes) ? json.fontes.filter((f): f is string => typeof f === 'string') : [],
        criadaEm: new Date().toISOString(),
      }
      definir(novo)
      setCaminho(null); setFeitos([]); setFicaram([]); setAplicadaEm(null)
      setEstado('em_aberto')
      return novo
    } catch {
      setEstado(atualRef.current ? 'em_aberto' : 'ocioso')
      return null
    }
  }, [definir])

  const abrirDoBanco = useCallback(async (sb: Sb, row: IntencaoDb | null): Promise<IntencaoAtual | null> => {
    const prop = PropostaSchema.safeParse(row?.proposta)
    if (!row || !prop.success) return null
    const it: IntencaoAtual = { id: row.id, texto: row.texto, proposta: prop.data, fontes: await fontesDaIntencao(sb, row.id), criadaEm: row.created_at }
    definir(it)
    setCaminho(row.caminho)
    setFeitos(row.status === 'aplicada' && Array.isArray(row.aplicado) ? row.aplicado : [])
    setAplicadaEm(row.aplicada_em)
    setFicaram([])
    setErro(null)
    setEstado(row.status === 'aplicada' ? 'aplicada' : row.status === 'desfeita' ? 'desfeita' : 'em_aberto')
    return it
  }, [definir])

  const carregar = useCallback(async (intencaoId: string): Promise<IntencaoAtual | null> => {
    const sb = createClient() as unknown as Sb
    try {
      const { data }: { data: IntencaoDb | null } = await sb.from('intencoes').select(COLS).eq('id', intencaoId).maybeSingle()
      return await abrirDoBanco(sb, data)
    } catch {
      return null
    }
  }, [abrirDoBanco])

  const carregarAbertaPorTexto = useCallback(async (texto: string): Promise<IntencaoAtual | null> => {
    const sb = createClient() as unknown as Sb
    try {
      const { data }: { data: IntencaoDb[] | null } = await sb
        .from('intencoes')
        .select(COLS)
        .eq('status', 'em_aberto')
        .eq('texto', texto)
        .order('created_at', { ascending: false })
        .limit(1)
      return await abrirDoBanco(sb, data?.[0] ?? null)
    } catch {
      return null
    }
  }, [abrirDoBanco])

  const aplicar = useCallback(async (cam: string, registros: Registro[]): Promise<boolean> => {
    const it = atualRef.current
    if (!it || registros.length === 0) return false
    setEstado('aplicando')
    setErro(null)
    try {
      const res = await fetch('/api/intencao/aplicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intencaoId: it.id, caminho: cam, registros }),
      })
      if (res.status === 409) {
        setErro('Essa proposta já foi respondida.')
        setEstado('em_aberto')
        return false
      }
      if (!res.ok) {
        setErro('Não deu para criar os registros agora. Tente de novo em instantes.')
        setEstado('em_aberto')
        return false
      }
      const { feitos: f } = (await res.json()) as { feitos: Feito[] }
      setFeitos(Array.isArray(f) ? f : [])
      setCaminho(cam)
      setAplicadaEm(new Date().toISOString())
      setEstado('aplicada')
      avisar()
      return true
    } catch {
      setErro('Não deu para criar os registros agora. Tente de novo em instantes.')
      setEstado('em_aberto')
      return false
    }
  }, [])

  const desfazer = useCallback(async (): Promise<boolean> => {
    const it = atualRef.current
    if (!it) return false
    setEstado('desfazendo')
    setErro(null)
    try {
      const res = await fetch('/api/intencao/desfazer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intencaoId: it.id }),
      })
      if (!res.ok) {
        setErro(res.status === 409 ? 'Essa proposta não está mais aplicada.' : 'Não deu para desfazer agora. Tente de novo em instantes.')
        setEstado('aplicada')
        return false
      }
      const { ficaram: fi } = (await res.json()) as { ficaram: Feito[] }
      setFicaram(Array.isArray(fi) ? fi : [])
      setEstado('desfeita')
      avisar()
      return true
    } catch {
      setErro('Não deu para desfazer agora. Tente de novo em instantes.')
      setEstado('aplicada')
      return false
    }
  }, [])

  const limparErro = useCallback(() => setErro(null), [])

  return {
    estado, atual, caminho, feitos, aplicadaEm, ficaram, erro,
    propor, carregar, carregarAbertaPorTexto, aplicar, desfazer, limparErro,
  }
}
