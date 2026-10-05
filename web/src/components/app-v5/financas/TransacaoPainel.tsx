'use client'

// Fase 2 · captura e edição de transação (painel lateral no desktop, sheet no mobile).
// Porte de #editor em prototypes/v5/app/financas-transacoes(.mobile).html. Exportado para o
// Calendário: `open`, `onClose`, `inicial` (editar), `dataPadrao` (adicionar no dia), `onSalvo`.
// Criar, editar e excluir passam pelo hook v3 (`useTransactionMutations`), então XP, streak
// e sync com Futuro continuam. Excluir pede licença inline (`Confirma`), também no mobile.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { Painel } from '@/components/app-v5/Painel'
import { Confirma } from '@/components/app-v5/Confirma'
import { useMobV5 } from '@/hooks/use-mob-v5'
import { useCategories } from '@/hooks/use-categories'
import { useAccounts } from '@/hooks/use-accounts'
import { useTransactionMutations, type TransacaoFormData } from '@/hooks/use-transactions'
import {
  METODOS, descricaoTransferencia, maskValor, parseValor, tipoParaDb, valorCampo,
  type MetodoDb, type TipoTx, type TxLinha,
} from '@/lib/financas/transacoes'
import './transacoes-v5.css'

/** Rascunho vindo da captura inline ("Transferência, método e observações →"). */
export interface RascunhoTx {
  desc?: string
  valor?: string
  categoriaId?: string
  data?: string
}

export interface TransacaoPainelProps {
  open: boolean
  onClose: () => void
  /** transação a editar; sem ela, o painel é de captura */
  inicial?: TxLinha | null
  /** data de uma captura nova (YYYY-MM-DD); padrão: hoje */
  dataPadrao?: string
  rascunho?: RascunhoTx | null
  /** depois de criar, editar ou excluir; `id` é nulo na exclusão */
  onSalvo?: (r: { id: string | null; data: string | null }) => void
}

interface Form {
  tipo: TipoTx
  desc: string
  valor: string
  data: string
  categoriaId: string
  metodo: MetodoDb
  obs: string
  deId: string
  paraId: string
}

const hojeSP = (): string => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

export function TransacaoPainel({ open, onClose, inicial = null, dataPadrao, rascunho = null, onSalvo }: TransacaoPainelProps) {
  const mob = useMobV5()
  const qc = useQueryClient()
  const { categories } = useCategories()
  const { accounts } = useAccounts()
  const { create, update, remove } = useTransactionMutations()

  const catsDoTipo = (t: TipoTx) => categories.filter(c => c.type === (t === 'in' ? 'income' : 'expense'))

  const formInicial = (): Form => {
    if (inicial) {
      return {
        tipo: inicial.tipo, desc: inicial.desc, valor: valorCampo(inicial.valor), data: inicial.date,
        categoriaId: inicial.categoriaId ?? '', metodo: inicial.metodo, obs: inicial.obs,
        deId: inicial.contaDeId ?? accounts[0]?.id ?? '', paraId: inicial.contaParaId ?? accounts[1]?.id ?? '',
      }
    }
    const cat = rascunho?.categoriaId ? categories.find(c => c.id === rascunho.categoriaId) : undefined
    const tipo: TipoTx = cat?.type === 'income' ? 'in' : 'out'
    return {
      tipo, desc: rascunho?.desc ?? '', valor: rascunho?.valor ?? '', data: rascunho?.data || dataPadrao || hojeSP(),
      categoriaId: cat?.id ?? catsDoTipo(tipo)[0]?.id ?? '', metodo: 'pix', obs: '',
      deId: accounts[0]?.id ?? '', paraId: accounts[1]?.id ?? '',
    }
  }

  // o formulário recomeça a cada abertura (derivado no render, sem efeito)
  const [form, setForm] = useState<Form>(formInicial)
  const [excluindo, setExcluindo] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [feito, setFeito] = useState('')
  const [abriuAntes, setAbriuAntes] = useState(false)
  if (open !== abriuAntes) {
    setAbriuAntes(open)
    if (open) {
      setForm(formInicial())
      setExcluindo(false); setErro(''); setFeito('')
    }
  }
  const descRef = useRef<HTMLInputElement>(null)

  // captura nova no desktop: foco na descrição (depois do foco no X que o Painel faz)
  useEffect(() => {
    if (!open || inicial || mob) return
    const f = window.setTimeout(() => descRef.current?.focus({ preventScroll: true }), 120)
    return () => window.clearTimeout(f)
  }, [open, inicial, mob])

  const campo = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }))

  const trocarTipo = (t: TipoTx) => {
    setForm(f => {
      const cats = catsDoTipo(t)
      const manter = t !== 'tr' && cats.some(c => c.id === f.categoriaId)
      return { ...f, tipo: t, categoriaId: t === 'tr' ? f.categoriaId : manter ? f.categoriaId : cats[0]?.id ?? '' }
    })
    setErro('')
  }

  const trocarConta = (lado: 'de' | 'para', id: string) => {
    setForm(f => {
      const outro = lado === 'de' ? f.paraId : f.deId
      const novoOutro = outro === id ? accounts.find(a => a.id !== id)?.id ?? '' : outro
      return lado === 'de' ? { ...f, deId: id, paraId: novoOutro } : { ...f, paraId: id, deId: novoOutro }
    })
  }

  const tr = form.tipo === 'tr'
  // categorias e contas podem chegar depois da abertura: o valor efetivo cai no primeiro da lista
  const catsAtuais = catsDoTipo(form.tipo)
  const categoriaEf = catsAtuais.some(c => c.id === form.categoriaId) ? form.categoriaId : catsAtuais[0]?.id ?? ''
  const deEf = accounts.some(a => a.id === form.deId) ? form.deId : accounts[0]?.id ?? ''
  const paraEf = accounts.some(a => a.id === form.paraId) && form.paraId !== deEf
    ? form.paraId
    : accounts.find(a => a.id !== deEf)?.id ?? ''
  const nomeConta = (id: string) => accounts.find(a => a.id === id)?.name ?? ''
  const semContas = tr && accounts.length < 2
  const semCategorias = !tr && catsAtuais.length === 0
  const editando = !!inicial
  const titulo = editando
    ? (tr ? 'Editar transferência' : 'Editar transação')
    : (tr ? 'Nova transferência' : 'Nova transação')

  const aposSalvar = (r: { id: string | null; data: string | null }) => {
    void qc.invalidateQueries({ queryKey: ['financas-v5'] })
    onSalvo?.(r)
    onClose()
  }

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (salvando) return
    const valor = parseValor(form.valor)
    let desc = form.desc.trim()
    if (tr) {
      if (semContas || !deEf || !paraEf) { setErro('Cadastre ao menos duas contas para transferir.'); return }
      if (deEf === paraEf) { setErro('Escolha contas diferentes.'); return }
      if (!desc) desc = descricaoTransferencia(nomeConta(deEf), nomeConta(paraEf))
    } else {
      if (!desc) { setErro('Faltou a descrição.'); return }
      if (!categoriaEf) { setErro('Faltou escolher a categoria.'); return }
    }
    if (!valor) { setErro('Faltou o valor.'); return }
    if (!form.data) { setErro('Faltou a data.'); return }

    const dados: TransacaoFormData = {
      type: tipoParaDb(form.tipo),
      description: desc,
      amount: valor,
      category_id: tr ? '' : categoriaEf,
      date: form.data,
      payment_method: tr ? 'transfer' : form.metodo,
      notes: form.obs.trim() || undefined,
      // criar: ids ausentes; editar: '' limpa as contas de uma transação que deixou de ser transferência
      account_from_id: tr ? deEf : editando ? '' : undefined,
      account_to_id: tr ? paraEf : editando ? '' : undefined,
    }
    setSalvando(true)
    setErro('')
    try {
      const salva = inicial ? await update(inicial.id, dados) : await create(dados)
      const r = { id: salva.id, data: dados.date }
      if (!inicial && mob) {
        setFeito('Registrado.')
        window.setTimeout(() => aposSalvar(r), 650)
      } else {
        aposSalvar(r)
      }
    } catch {
      setErro('Não consegui salvar. Nada mudou na lista.')
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async () => {
    if (!inicial) return
    setSalvando(true)
    setErro('')
    try {
      await remove(inicial.id)
      setExcluindo(false)
      aposSalvar({ id: null, data: null })
    } catch {
      setErro('Não consegui excluir. A transação continua na lista.')
      setExcluindo(false)
    } finally {
      setSalvando(false)
    }
  }

  const corpo = (
    <form id="tx-form" className="tx-form" autoComplete="off" onSubmit={salvar}>
      {inicial?.recorrente && (
        <p className="aviso">Ocorrência de <b>{inicial.desc || 'uma recorrente'}</b>. Editar muda só este lançamento.</p>
      )}
      <div className="f">
        <span className="eyebrow">Tipo</span>
        <div className="tipo" role="group" aria-label="Tipo">
          {([['out', 'Despesa'], ['in', 'Receita'], ['tr', 'Transferência']] as const).map(([v, r]) => (
            <button key={v} className={form.tipo === v ? 'chip on' : 'chip'} type="button" aria-pressed={form.tipo === v} onClick={() => trocarTipo(v)}>{r}</button>
          ))}
        </div>
      </div>
      <div className="f">
        <label className="eyebrow" htmlFor="tx-desc">Descrição</label>
        <input
          ref={descRef} className="ck-note" id="tx-desc" name="desc" type="text" value={form.desc}
          placeholder={tr ? descricaoTransferencia(nomeConta(deEf), nomeConta(paraEf)) : 'Ex.: Mercado Central'}
          onChange={e => campo('desc', e.target.value)}
        />
      </div>
      <div className="f2">
        <div className="f">
          <label className="eyebrow" htmlFor="tx-valor">Valor</label>
          <input
            className="ck-note num" id="tx-valor" name="valor" type="text" inputMode="decimal" placeholder="0,00"
            value={form.valor} onChange={e => campo('valor', maskValor(e.target.value))}
          />
        </div>
        <div className="f">
          <label className="eyebrow" htmlFor="tx-data">Data</label>
          <input className="ck-note num" id="tx-data" name="data" type="date" value={form.data} onChange={e => campo('data', e.target.value)} />
        </div>
      </div>
      {!tr && (
        <div className="f">
          <label className="eyebrow" htmlFor="tx-cat">Categoria</label>
          <div className="sel">
            <select id="tx-cat" name="cat" value={categoriaEf} onChange={e => campo('categoriaId', e.target.value)} disabled={semCategorias}>
              {semCategorias && <option value="">Sem categorias</option>}
              {catsAtuais.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      )}
      {tr && (
        <div className="f">
          <div className="f2">
            <div className="f">
              <label className="eyebrow" htmlFor="tx-de">De</label>
              <div className="sel">
                <select id="tx-de" name="de" value={deEf} onChange={e => trocarConta('de', e.target.value)}>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="f">
              <label className="eyebrow" htmlFor="tx-para">Para</label>
              <div className="sel">
                <select id="tx-para" name="para" value={paraEf} onChange={e => trocarConta('para', e.target.value)}>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          {semContas && (
            <p className="erro-campo" role="alert">
              Transferir pede duas contas. <Link href="/configuracoes/contas">Cadastrar contas →</Link>
            </p>
          )}
        </div>
      )}
      {!tr && (
        <div className="f">
          <label className="eyebrow" htmlFor="tx-met">Método</label>
          <div className="sel">
            <select id="tx-met" name="met" value={form.metodo} onChange={e => campo('metodo', e.target.value as MetodoDb)}>
              {METODOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>
      )}
      <div className="f">
        <label className="eyebrow" htmlFor="tx-obs">Observações</label>
        <textarea className="ck-note" id="tx-obs" name="obs" rows={3} placeholder="Opcional" value={form.obs} onChange={e => campo('obs', e.target.value)} />
      </div>
    </form>
  )

  const rodape = (
    <>
      {erro && <p className="erro-campo" role="alert">{erro}</p>}
      {excluindo && (
        <Confirma rotuloSim="Excluir" onSim={excluir} onNao={() => setExcluindo(false)}>
          Excluir <b>{inicial?.desc || 'esta transação'}</b>? Não dá para desfazer.
        </Confirma>
      )}
      {feito && <output>{feito}</output>}
      <div className="acts">
        {editando && (
          <button className="btn-sm ghost perigo" type="button" onClick={() => setExcluindo(true)} disabled={salvando}>Excluir</button>
        )}
        <button className="btn-sm roxo" type="submit" form="tx-form" disabled={salvando || semContas || semCategorias}>
          {editando ? 'Salvar' : 'Registrar'}
        </button>
      </div>
    </>
  )

  return (
    <Painel open={open} onClose={onClose} eyebrow="01 · Transação" titulo={titulo} idTitulo="tx-titulo" rodape={rodape}>
      {corpo}
    </Painel>
  )
}
