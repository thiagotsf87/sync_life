'use client'

// Fase 1 · Task 15 · arquivo da conversa (/coach). Lê coach_messages dos
// últimos 60 dias e as intenções do usuário (RLS por user_id), agrupa por dia
// em SP (lib/conversa/agrupar) e expõe busca/filtros locais e desfazer.
// Recarrega quando uma intenção muda em outro lugar (evento sy:intencao-mudou).

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EVENTO_INTENCAO } from '@/hooks/use-intencao'
import {
  agruparConversa, filtrando as estaFiltrando, filtrarDias, resumoIntencoes,
  type AplicadoItem, type Dia, type DiaVisivel, type Filtro, type IntencaoRow, type MensagemRow,
} from '@/lib/conversa/agrupar'

const JANELA_DIAS = 60

type Sb = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (t: string) => any
}

export interface ConversaData {
  loading: boolean
  erro: boolean
  hojeISO: string
  dias: Dia[]
  visiveis: DiaVisivel[]
  filtro: Filtro
  filtrando: boolean
  setTipo: (t: Filtro['tipo']) => void
  setArea: (a: Filtro['area']) => void
  setQ: (q: string) => void
  limparBusca: () => void
  totalEntradas: number
  desde: string | null
  intencoes: { aplicada: number; em_aberto: number; desfeita: number }
  ultimaSinc: string
  /** desfaz uma intenção aplicada; devolve quantos registros ficaram (editados depois) ou null em erro */
  desfazer: (intencaoId: string) => Promise<number | null>
}

function hojeSP(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

function horaAgora(): string {
  return new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false })
}

export function useConversa(): ConversaData {
  const [msgs, setMsgs] = useState<MensagemRow[]>([])
  const [intencoes, setIntencoes] = useState<IntencaoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)
  const [versao, setVersao] = useState(0)
  const [ultimaSinc, setUltimaSinc] = useState('')
  const [hojeISO, setHojeISO] = useState('')
  const [filtro, setFiltro] = useState<Filtro>({ tipo: 'tudo', area: 'todas', q: '' })

  useEffect(() => {
    let vivo = true
    const sb = createClient() as unknown as Sb
    const desde = new Date(Date.now() - JANELA_DIAS * 86_400_000).toISOString()
    void (async () => {
      try {
        const [rm, ri] = await Promise.all([
          sb.from('coach_messages')
            .select('id, role, content, module_id, fontes, kind, ref_id, created_at')
            .gte('created_at', desde)
            .order('created_at', { ascending: true }),
          sb.from('intencoes')
            .select('id, texto, tipo, proposta, caminho, aplicado, status, created_at, aplicada_em, desfeita_em')
            .gte('created_at', desde)
            .order('created_at', { ascending: true }),
        ]) as [
          { data: MensagemRow[] | null; error: unknown },
          { data: IntencaoRow[] | null; error: unknown },
        ]
        if (!vivo) return
        setMsgs(rm.data ?? [])
        setIntencoes(ri.data ?? [])
        setErro(!!rm.error && !!ri.error)
      } catch {
        if (vivo) setErro(true)
      } finally {
        if (vivo) {
          setHojeISO(hojeSP())
          setUltimaSinc(horaAgora())
          setLoading(false)
        }
      }
    })()
    return () => { vivo = false }
  }, [versao])

  // intenção aplicada/desfeita na camada (ou em Meu dia): recarrega
  useEffect(() => {
    const onMudou = () => setVersao(v => v + 1)
    window.addEventListener(EVENTO_INTENCAO, onMudou)
    return () => window.removeEventListener(EVENTO_INTENCAO, onMudou)
  }, [])

  const dias = useMemo(() => (hojeISO ? agruparConversa(msgs, intencoes, hojeISO) : []), [msgs, intencoes, hojeISO])
  const visiveis = useMemo(() => filtrarDias(dias, filtro), [dias, filtro])
  const totalEntradas = useMemo(() => dias.reduce((n, d) => n + d.entradas.length, 0), [dias])
  const desde = dias.length ? dias[dias.length - 1].dia : null

  const setTipo = useCallback((tipo: Filtro['tipo']) => setFiltro(f => ({ ...f, tipo })), [])
  const setArea = useCallback((area: Filtro['area']) => setFiltro(f => ({ ...f, area })), [])
  const setQ = useCallback((q: string) => setFiltro(f => ({ ...f, q })), [])
  const limparBusca = useCallback(() => setFiltro(f => ({ ...f, q: '' })), [])

  const desfazer = useCallback(async (intencaoId: string): Promise<number | null> => {
    try {
      const res = await fetch('/api/intencao/desfazer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intencaoId }),
      })
      if (!res.ok) return null
      const { ficaram } = (await res.json()) as { ficaram: AplicadoItem[] }
      const agora = new Date().toISOString()
      // atualiza na hora; o evento recarrega a lista com o que o servidor gravou
      setIntencoes(prev => prev.map(i => (i.id === intencaoId ? { ...i, status: 'desfeita', desfeita_em: agora } : i)))
      window.dispatchEvent(new CustomEvent(EVENTO_INTENCAO))
      return Array.isArray(ficaram) ? ficaram.length : 0
    } catch {
      return null
    }
  }, [])

  return {
    loading,
    erro,
    hojeISO,
    dias,
    visiveis,
    filtro,
    filtrando: estaFiltrando(filtro),
    setTipo,
    setArea,
    setQ,
    limparBusca,
    totalEntradas,
    desde,
    intencoes: resumoIntencoes(intencoes),
    ultimaSinc,
    desfazer,
  }
}
