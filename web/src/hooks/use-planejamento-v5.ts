'use client'

// Fase 2 · dados de Planejamento v5 (T3, prototypes/v5/app/financas-planejamento.html).
// Adaptador sobre usePlanejamento (v3): eventos, recorrentes, saldo do perfil, renda e gasto
// variáveis médios e o CRUD continuam ali. A projeção, o mês crítico, as frases e o
// laboratório saem de lib/financas/planejamento (puro e testado). O laboratório só existe
// quando há um evento de despesa de valor alto nos próximos 12 meses; os efeitos são
// recalculados da projeção real. A prévia do laboratório é local: nada vai ao banco.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePlanejamento, entradaProjecao, type PlanningEvent } from '@/hooks/use-planejamento'
import { useMetas } from '@/hooks/use-metas'
import { useUserPlan } from '@/hooks/use-user-plan'
import {
  analisar, anoMes, candidatoLab, curvaSaldo, datasLab, efeitosLab, hojeSP, idxMes, inicioJanelaVariavel, nomeMesDe, projetar,
  type Analise, type CenarioId, type CurvaGeo, type EfeitosLab, type EventoPlan, type MetaViagemPlan, type OpcaoLab,
} from '@/lib/financas/planejamento'

export interface EventoLinha {
  id: string
  nome: string
  tipo: 'in' | 'out'
  valor: number
  /** data efetiva (a da prévia, se houver) */
  data: string
  categoria: string | null
  nota: string | null
  confirmado: boolean
  /** a linha do evento que o laboratório está movendo */
  previa: boolean
  /** além dos 13 meses da curva */
  fora: boolean
  /** a linha do banco, para editar */
  original: PlanningEvent | null
}

export interface LabOpcao {
  id: OpcaoLab
  rotulo: string
  data: string
}

export interface LabDados {
  evento: EventoPlan
  opcoes: LabOpcao[]
  efeitos: Partial<Record<OpcaoLab, EfeitosLab>>
  meta: MetaViagemPlan | null
}

export interface PlanejamentoV5Data {
  /** primeira carga em andamento (as seguintes não piscam o esqueleto) */
  carregando: boolean
  erro: string | null
  recarregar: () => void
  hoje: string
  saldoHoje: number
  cenario: CenarioId
  setCenario: (c: CenarioId) => void
  serie: number[]
  analise: Analise | null
  geo: CurvaGeo | null
  eventos: EventoLinha[]
  entradas: number
  saidas: number
  lab: LabDados | null
  labSel: OpcaoLab
  setLabSel: (o: OpcaoLab) => void
  previa: OpcaoLab | null
  aplicarPrevia: () => void
  desfazerPrevia: () => void
  /** fontes da linha de Sy */
  fontes: { eventos: number; recorrentes: number; janela: string; atualizadoAs: string | null }
  ehPro: boolean
  aviso: string
  avisar: (t: string) => void
  confirmar: (id: string) => Promise<void>
  /** depois de criar, editar ou excluir pelo painel */
  aposSalvar: (mensagem: string) => void
  /** hora da última sincronização, "14:05" */
  ultimaSinc: string | null
}

const REGEX_VIAGEM = /viagem|it[aá]lia/i
const pad2 = (n: number) => String(n).padStart(2, '0')

export function usePlanejamentoV5(): PlanejamentoV5Data {
  const plan = usePlanejamento()
  const metas = useMetas()
  const { isPro, isLoading: planoCarregando } = useUserPlan()
  const [cenario, setCenarioEstado] = useState<CenarioId>('realista')
  const [labSel, setLabSel] = useState<OpcaoLab>('manter')
  const [previa, setPrevia] = useState<OpcaoLab | null>(null)
  const [aviso, setAviso] = useState('')
  const [carregou, setCarregou] = useState(false)
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null)
  const timer = useRef<number | null>(null)

  const hoje = useMemo(() => hojeSP(), [])

  // ao terminar cada carga (a primeira libera o esqueleto): ajuste de estado na renderização
  const [carregandoAntes, setCarregandoAntes] = useState(true)
  if (plan.loading !== carregandoAntes) {
    setCarregandoAntes(plan.loading)
    if (!plan.loading) {
      setCarregou(true)
      setAtualizadoEm(new Date())
    }
  }

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current) }, [])

  const avisar = useCallback((t: string) => {
    setAviso(t)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAviso(''), 3200)
  }, [])

  // ── entrada pura da projeção (dados reais) ─────────────────────────────────
  const entrada = useMemo(
    () => entradaProjecao(plan.recurringItems, plan.planningEvents, plan.currentBalance, plan.variavel, hoje),
    [plan.recurringItems, plan.planningEvents, plan.currentBalance, plan.variavel, hoje],
  )

  const meta = useMemo<MetaViagemPlan | null>(() => {
    const g = metas.goals.find(x => x.status === 'active' && x.target_date && REGEX_VIAGEM.test(x.name))
    return g && g.target_date ? { nome: g.name, data: g.target_date } : null
  }, [metas.goals])

  // ── laboratório: o maior evento de despesa dos próximos 12 meses ───────────
  const lab = useMemo<LabDados | null>(() => {
    const ev = candidatoLab(entrada.eventos, hoje)
    if (!ev) return null
    const datas = datasLab(ev, hoje)
    const ordem: OpcaoLab[] = ['antecipar', 'manter', 'adiar']
    const opcoes: LabOpcao[] = []
    const efeitos: LabDados['efeitos'] = {}
    for (const id of ordem) {
      const data = datas[id]
      if (!data) continue
      const mes = nomeMesDe(data)
      const rotulo = id === 'manter'
        ? `Manter em ${mes}`
        : `${id === 'antecipar' ? 'Antecipar' : 'Adiar'} para ${data === hoje ? 'hoje' : mes}`
      opcoes.push({ id, rotulo, data })
      efeitos[id] = efeitosLab(entrada, ev, data, meta)
    }
    return { evento: ev, opcoes, efeitos, meta }
  }, [entrada, hoje, meta])

  // a seleção precisa existir nas opções (antecipar some quando não há como antecipar)
  const labSelValido: OpcaoLab = lab?.opcoes.some(o => o.id === labSel) ? labSel : 'manter'
  const previaValida = lab && previa && lab.efeitos[previa] ? previa : null

  // ── projeção exibida (com a prévia, se houver) ─────────────────────────────
  const entradaExibida = useMemo(() => {
    if (!lab || !previaValida) return entrada
    const data = lab.opcoes.find(o => o.id === previaValida)?.data
    if (!data) return entrada
    return { ...entrada, eventos: entrada.eventos.map(e => (e.id === lab.evento.id ? { ...e, data } : e)) }
  }, [entrada, lab, previaValida])

  const cenarioExibido: CenarioId = previaValida ? 'realista' : cenario
  const serie = useMemo(() => projetar(entradaExibida, cenarioExibido), [entradaExibida, cenarioExibido])
  const analise = useMemo(() => analisar(serie, entradaExibida), [serie, entradaExibida])
  const geo = useMemo(() => curvaSaldo(serie, entrada.saldoHoje), [serie, entrada.saldoHoje])

  // ── lista de eventos ───────────────────────────────────────────────────────
  const eventos = useMemo<EventoLinha[]>(() => {
    const porId = new Map(plan.planningEvents.map(e => [e.id, e]))
    return entradaExibida.eventos
      .map(e => ({
        id: e.id,
        nome: e.nome,
        tipo: e.tipo,
        valor: e.valor,
        data: e.data,
        categoria: e.categoria,
        nota: e.nota,
        confirmado: e.confirmado,
        previa: !!previaValida && lab?.evento.id === e.id,
        fora: idxMes(e.data, hoje) > 12,
        original: porId.get(e.id) ?? null,
      }))
      .sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : a.nome.localeCompare(b.nome)))
  }, [entradaExibida, plan.planningEvents, previaValida, lab, hoje])

  const entradas = useMemo(() => eventos.reduce((s, e) => s + (e.tipo === 'in' ? e.valor : 0), 0), [eventos])
  const saidas = useMemo(() => eventos.reduce((s, e) => s + (e.tipo === 'out' ? e.valor : 0), 0), [eventos])

  const setCenario = useCallback((c: CenarioId) => {
    setPrevia(null)
    setLabSel('manter')
    setCenarioEstado(c)
  }, [])

  const aplicarPrevia = useCallback(() => {
    setCenarioEstado('realista')
    setPrevia(labSelValido)
  }, [labSelValido])

  const desfazerPrevia = useCallback(() => {
    setPrevia(null)
    setLabSel('manter')
  }, [])

  const confirmar = useCallback(async (id: string) => {
    try {
      await plan.confirmEvent(id)
      avisar('Confirmado. Continua planejado: não vira transação.')
    } catch {
      avisar('Não deu para confirmar. Tente de novo.')
    }
  }, [plan, avisar])

  const aposSalvar = useCallback((mensagem: string) => {
    plan.refresh()
    avisar(mensagem)
  }, [plan, avisar])

  const janela = (() => {
    const [a, m] = anoMes(hoje, -1)
    return `${nomeMesDe(inicioJanelaVariavel(hoje))} a ${nomeMesDe(`${a}-${pad2(m)}-01`)}`
  })()

  const hh = atualizadoEm ? pad2(atualizadoEm.getHours()) : null
  const mm = atualizadoEm ? pad2(atualizadoEm.getMinutes()) : null

  return {
    carregando: plan.loading && !carregou,
    erro: plan.error,
    recarregar: plan.refresh,
    hoje,
    saldoHoje: entrada.saldoHoje,
    cenario: cenarioExibido,
    setCenario,
    serie,
    analise: carregou ? analise : null,
    geo: carregou ? geo : null,
    eventos,
    entradas,
    saidas,
    lab,
    labSel: labSelValido,
    setLabSel,
    previa: previaValida,
    aplicarPrevia,
    desfazerPrevia,
    fontes: {
      eventos: entrada.eventos.length,
      recorrentes: entrada.recorrentes.filter(r => r.tipo !== 'transfer').length,
      janela,
      atualizadoAs: hh && mm ? `${hh}h${mm}` : null,
    },
    ehPro: isPro || planoCarregando,
    aviso,
    avisar,
    confirmar,
    aposSalvar,
    ultimaSinc: hh && mm ? `${hh}:${mm}` : null,
  }
}
