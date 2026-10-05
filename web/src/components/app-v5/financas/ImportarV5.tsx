'use client'

// Fase 2 · Finanças > Importar extrato (T4, 3 passos). Container: dados do useImportarV5,
// estado de UI (filtro, drop aberto, nova categoria, licença de desfazer) e a moldura
// SubtelaV5. A apresentação está em ImportarView; o CSS em importar-v5.css.
// Registrar do bar e da bottom bar fica no padrão do chrome (leva a Transações com a captura aberta).

import { useEffect, useMemo, useRef, useState } from 'react'
import { SubtelaV5 } from '@/components/app-v5/SubtelaV5'
import { SUBNAV_FINANCAS } from '@/components/app-v5/SubnavArea'
import { useImportarV5 } from '@/hooks/use-importar-v5'
import { mesclarDesfeitos, type TipoLinha } from '@/lib/financas/importar'
import { prefersReduce } from '@/lib/v5/viva'
import { ImportarView, type FiltroRevisao, type ImportarAcoes, type ImportarUi, type LoteExibido, type NovaCategoriaUi } from './ImportarView'
import './importar-v5.css'

interface Desfeito { lote: LoteExibido; indice: number; removidas: number }

const SUGESTOES = [
  'Quais são as duplicatas?',
  'Que categoria dar a uma linha sem categoria?',
  'O período bate com o que eu já tinha?',
]

export function ImportarV5() {
  const { d, a } = useImportarV5()

  const [filtro, setFiltro] = useState<FiltroRevisao>('todas')
  const [dropAberto, setDropAberto] = useState(false)
  const [bulkValor, setBulkValor] = useState('')
  const [bulkMsg, setBulkMsg] = useState<ImportarUi['bulkMsg']>(null)
  const [nova, setNova] = useState<NovaCategoriaUi | null>(null)
  const [desfazendo, setDesfazendo] = useState<string | null>(null)
  const [erroLote, setErroLote] = useState<string | null>(null)
  const [desfeitos, setDesfeitos] = useState<Desfeito[]>([])
  const [novoLote, setNovoLote] = useState<string | null>(null)
  const [salvoFlash, setSalvoFlash] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const lotes = useMemo(() => mesclarDesfeitos<LoteExibido>(d.lotes, desfeitos), [d.lotes, desfeitos])

  const limparRevisao = () => {
    setFiltro('todas')
    setBulkValor('')
    setBulkMsg(null)
    setNova(null)
  }

  const ui: ImportarUi = { filtro, dropAberto, bulkValor, bulkMsg, nova, desfazendo, erroLote, novoLote, salvoFlash }

  const on: ImportarAcoes = {
    falar: () => undefined, // trocado dentro da moldura, onde abrirCoach existe
    filtrar: setFiltro,
    alternarDrop: () => setDropAberto(v => !v),
    fecharDrop: () => setDropAberto(false),
    arquivo: f => {
      setDropAberto(false)
      limparRevisao()
      void a.escolherArquivo(f)
    },
    alternar: a.alternar,
    alternarTodas: a.alternarTodas,
    categorizar: (i, valor) => {
      if (valor === '__nova') {
        const l = d.linhas[i]
        setNova({ alvo: i, tipo: l?.tipo ?? 'expense', nome: '', erro: null, salvando: false })
        return
      }
      a.categorizar(i, valor || null)
    },
    bulkValor: setBulkValor,
    aplicar: () => {
      if (!bulkValor) { setBulkMsg([{ t: 'Escolha a categoria primeiro.' }]); return }
      setBulkMsg(a.aplicarTodas(bulkValor))
    },
    abrirNova: (alvo, tipo) => setNova({ alvo, tipo, nome: '', erro: null, salvando: false }),
    novaNome: v => setNova(n => (n ? { ...n, nome: v, erro: null } : n)),
    novaTipo: t => setNova(n => (n ? { ...n, tipo: t } : n)),
    cancelarNova: () => setNova(null),
    criarNova: () => {
      if (!nova || nova.salvando) return
      const atual = nova
      setNova({ ...atual, salvando: true })
      void a.criarCategoria(atual.nome, atual.tipo).then(res => {
        if ('erro' in res) {
          setNova({ ...atual, erro: res.erro, salvando: false })
          return
        }
        if (atual.alvo === 'bulk') {
          setBulkValor(res.id)
          setBulkMsg(a.aplicarTodas(res.id, atual.tipo as TipoLinha))
        } else {
          a.categorizar(atual.alvo, res.id)
          setBulkMsg([{ t: `Categoria ${atual.nome.trim()} criada.` }])
        }
        setNova(null)
      })
    },
    coluna: a.setColuna,
    usarColunas: a.usarColunas,
    importar: () => {
      const notes = `Importado de ${d.nomeArquivo}`
      void a.importar().then(ok => {
        if (!ok) return
        setDesfeitos(prev => prev.filter(x => x.lote.notes !== notes))
        setNovoLote(notes)
        setSalvoFlash(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setSalvoFlash(false), 2000)
        requestAnimationFrame(() => {
          document.getElementById('feito')?.scrollIntoView({ block: 'start', behavior: prefersReduce() ? 'auto' : 'smooth' })
        })
      })
    },
    outro: () => {
      a.outroExtrato()
      limparRevisao()
      setDropAberto(true)
      requestAnimationFrame(() => {
        document.getElementById('s1')?.scrollIntoView({ block: 'start', behavior: prefersReduce() ? 'auto' : 'smooth' })
      })
    },
    pedirDesfazer: notes => { setErroLote(null); setDesfazendo(notes) },
    cancelarDesfazer: () => { setErroLote(null); setDesfazendo(null) },
    confirmarDesfazer: notes => {
      const lote = lotes.find(l => l.notes === notes)
      if (!lote) return
      const indice = lotes.findIndex(l => l.notes === notes)
      void a.desfazerLote(notes).then(removidas => {
        if (removidas === null) { setErroLote('Não deu para remover o lote. Tente de novo.'); return }
        setDesfeitos(prev => [...prev, { lote, indice, removidas }])
        setDesfazendo(null)
        setErroLote(null)
      })
    },
    recarregarLotes: a.recarregarLotes,
  }

  const coach = {
    leitura: d.nomeArquivo ? `o extrato ${d.nomeArquivo}` : 'a importação de extrato',
    saudacao: d.passo === 'preview' || d.passo === 'importing'
      ? `Já li o extrato${d.banco ? ` do ${d.banco}` : ''}. O que você quer saber?`
      : 'Escolha um extrato para começar. O que você quer saber sobre importar?',
    sugestoes: SUGESTOES,
  }

  return (
    <SubtelaV5
      area="financas"
      moduloCoach="financas"
      subnav={SUBNAV_FINANCAS}
      subnavRotulo="Telas de Finanças"
      atual="importar"
      voltarHref="/financas"
      voltarRotulo="Finanças"
      voltarNumero="01"
      tituloCurto="Importar extrato"
      classe="importar"
      coach={coach}
      chaveReveal={d.passo}
    >
      {({ abrirCoach, mob }) => (
        <ImportarView d={d} lotes={lotes} ui={ui} on={{ ...on, falar: abrirCoach }} mob={mob} />
      )}
    </SubtelaV5>
  )
}
