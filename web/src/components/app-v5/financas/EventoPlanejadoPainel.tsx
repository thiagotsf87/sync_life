'use client'

// Fase 2 · painel de evento planejado (criar e editar). Lateral no desktop, sheet no mobile
// (a peça `Painel` troca o corpo pelo CSS). Exportado: Planejamento e Calendário usam o mesmo.
// Porte do #painel de prototypes/v5/app/financas-planejamento(.mobile).html. Escreve direto em
// planning_events pelas funções de hooks/use-planejamento; o pai recarrega em `onSalvo`.
// Confirmar só marca o evento (Situação): não vira transação. Excluir pede `Confirma` inline.

import { useEffect, useState, type FormEvent } from 'react'
import { Painel } from '@/components/app-v5/Painel'
import { Confirma } from '@/components/app-v5/Confirma'
import { useCategories } from '@/hooks/use-categories'
import {
  alterarEventoPlanejado, inserirEventoPlanejado, removerEventoPlanejado,
  type PlanningEvent,
} from '@/hooks/use-planejamento'
import { hojeSP } from '@/lib/financas/planejamento'
import './planejamento-v5.css'

export interface EventoPlanejadoPainelProps {
  open: boolean
  onClose: () => void
  /** evento em edição; sem ele, é um evento novo */
  inicial?: PlanningEvent | null
  /** data sugerida para um evento novo (hoje, se vier antes de hoje ou vazia) */
  dataPadrao?: string
  /** depois de gravar: o pai recarrega os dados e pode mostrar a mensagem */
  onSalvo: (mensagem: string) => void
}

type Tipo = 'income' | 'expense'

/** "1.234,56" a partir de um número */
function campo(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** "1.234,56" ou "1234.56" para número */
function lerValor(t: string): number {
  let s = t.replace(/[^\d,.]/g, '')
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

export function EventoPlanejadoPainel({ open, onClose, inicial, dataPadrao, onSalvo }: EventoPlanejadoPainelProps) {
  const { categories } = useCategories()
  const [tipo, setTipo] = useState<Tipo>('expense')
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState('')
  const [categoria, setCategoria] = useState('')
  const [notas, setNotas] = useState('')
  const [confirmado, setConfirmado] = useState(false)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  const hoje = hojeSP()

  // preenche ao abrir (o painel fica montado: o estado antigo não pode vazar para o próximo)
  useEffect(() => {
    if (!open) return
    setErro('')
    setExcluindo(false)
    setSalvando(false)
    if (inicial) {
      setTipo(inicial.type)
      setNome(inicial.name)
      setValor(campo(Number(inicial.amount)))
      setData(inicial.planned_date)
      setCategoria(inicial.category_id ?? '')
      setNotas(inicial.notes ?? '')
      setConfirmado(inicial.is_confirmed)
    } else {
      setTipo('expense')
      setNome('')
      setValor('')
      setData(dataPadrao && dataPadrao >= hojeSP() ? dataPadrao : hojeSP())
      setCategoria('')
      setNotas('')
      setConfirmado(false)
    }
  }, [open, inicial, dataPadrao])

  const opcoes = categories.filter(c => c.type === tipo)

  function trocarTipo(t: Tipo) {
    setTipo(t)
    // a categoria só vale para o tipo dela
    if (!categories.some(c => c.id === categoria && c.type === t)) setCategoria('')
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (salvando) return
    const v = lerValor(valor)
    if (nome.trim().length < 2) return setErro('Faltou o nome do evento.')
    if (!v) return setErro('Faltou o valor.')
    if (!data || data < hoje) return setErro('A data precisa ser hoje ou depois.')
    setErro('')
    setSalvando(true)
    const form = {
      type: tipo, name: nome, amount: String(v), planned_date: data,
      category_id: categoria, notes: notas, is_confirmed: confirmado,
    }
    try {
      if (inicial) await alterarEventoPlanejado(inicial.id, form)
      else await inserirEventoPlanejado(form)
      onClose()
      onSalvo(inicial ? 'Salvo.' : 'Planejado. A curva já conta com ele.')
    } catch {
      setErro('Não deu para salvar. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!inicial) return
    setSalvando(true)
    try {
      await removerEventoPlanejado(inicial.id)
      setExcluindo(false)
      onClose()
      onSalvo('Evento excluído. A projeção foi refeita sem ele.')
    } catch {
      setExcluindo(false)
      setErro('Não deu para excluir. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Painel
      open={open}
      onClose={onClose}
      eyebrow="Evento planejado"
      titulo={inicial ? 'Editar evento' : 'Novo evento'}
      idTitulo="p-titulo-evento"
      rodape={
        <>
          {excluindo && inicial && (
            <Confirma rotuloSim="Excluir" onSim={excluir} onNao={() => setExcluindo(false)}>
              Excluir <b>{inicial.name}</b>? A projeção volta sem ele. Não dá para desfazer.
            </Confirma>
          )}
          <div className="acts">
            {inicial && (
              <button className="btn-sm ghost perigo" type="button" onClick={() => setExcluindo(true)} disabled={salvando}>
                Excluir
              </button>
            )}
            <button className="btn-sm roxo" type="submit" form="pform-evento" disabled={salvando}>
              {inicial ? 'Salvar' : 'Planejar'}
            </button>
          </div>
        </>
      }
    >
      <form id="pform-evento" className="pform-evento" autoComplete="off" noValidate onSubmit={enviar}>
        <div className="f">
          <span className="eyebrow">Tipo</span>
          <div className="tipo" role="group" aria-label="Tipo">
            <button className={'chip' + (tipo === 'expense' ? ' on' : '')} type="button" aria-pressed={tipo === 'expense'} onClick={() => trocarTipo('expense')}>Despesa</button>
            <button className={'chip' + (tipo === 'income' ? ' on' : '')} type="button" aria-pressed={tipo === 'income'} onClick={() => trocarTipo('income')}>Receita</button>
          </div>
        </div>
        <div className="f">
          <label className="eyebrow" htmlFor="p-nome">Nome</label>
          <input className="ck-note" id="p-nome" name="nome" type="text" placeholder="Ex.: IPVA, bônus, viagem" value={nome} onChange={e => setNome(e.target.value)} />
        </div>
        <div className="f2">
          <div className="f">
            <label className="eyebrow" htmlFor="p-valor">Valor</label>
            <input className="ck-note num" id="p-valor" name="valor" type="text" inputMode="decimal" placeholder="0,00" value={valor} onChange={e => setValor(e.target.value)} />
          </div>
          <div className="f">
            <label className="eyebrow" htmlFor="p-data">Data</label>
            <input className="ck-note num" id="p-data" name="data" type="date" min={hoje} value={data} onChange={e => setData(e.target.value)} />
          </div>
        </div>
        <div className="f">
          <label className="eyebrow" htmlFor="p-cat">Categoria</label>
          <div className="sel">
            <select id="p-cat" name="cat" value={categoria} onChange={e => setCategoria(e.target.value)}>
              <option value="">Sem categoria</option>
              {opcoes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="f">
          <label className="eyebrow" htmlFor="p-notas">Notas</label>
          <textarea className="ck-note" id="p-notas" name="notas" rows={2} placeholder="Opcional" value={notas} onChange={e => setNotas(e.target.value)} />
        </div>
        <div className="f">
          <span className="eyebrow">Situação</span>
          <div className="tipo" role="group" aria-label="Situação">
            <button className={'chip' + (!confirmado ? ' on' : '')} type="button" aria-pressed={!confirmado} onClick={() => setConfirmado(false)}>Previsto</button>
            <button className={'chip' + (confirmado ? ' on' : '')} type="button" aria-pressed={confirmado} onClick={() => setConfirmado(true)}>Confirmado</button>
          </div>
          <p className="aviso">Confirmar só marca o evento. Ele não vira transação.</p>
        </div>
        <p className="err" role="alert">{erro}</p>
      </form>
    </Painel>
  )
}
