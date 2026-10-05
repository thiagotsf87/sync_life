'use client'

// Fase 2 · Importar extrato v5: adaptador sobre useImport / useImportHistory (a leitura de
// PDF, CSV e OFX, a categorização por palavra-chave, a regra de duplicata, a gravação em
// lotes de 50 e o histórico por lote continuam lá). Aqui só a forma que a tela v5 pede:
// linhas prontas para exibir, resumo "o que reconheci", totais, erros com texto e as ações.
// As regras puras estão em lib/financas/importar.

import { useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useImport, useImportHistory, buildCategorySuggestions } from '@/hooks/use-import'
import type { ParteFala } from '@/lib/financas/hub'
import {
  resumoReconhecido, falaReconhecido, fontesReconhecido, totaisMarcadas, aplicarATodas, mensagemAplicar,
  valorLinha, dataCurta, intervaloCurto, intervaloDeDatas, brlSomaEntrada, brlSomaSaida, textoErro,
  chutarColunas, type TipoLinha, type MapaColunas, type ResumoExtrato, type ErroImportacao,
} from '@/lib/financas/importar'

export type PassoImportar = 'upload' | 'mapping' | 'preview' | 'importing' | 'done'

export interface LinhaV5 {
  i: number
  /** '1 set' */
  data: string
  desc: string
  tipo: TipoLinha
  tipoRotulo: string
  /** '+ R$ 600,00' / '– R$ 88,00' */
  valor: string
  categoriaId: string | null
  categoriaNome: string | null
  marcada: boolean
  duplicata: boolean
  /** linha que o extrato trouxe sem categoria sugerida (é a que o passo 03 lista) */
  semSugestao: boolean
}

export interface OpcaoCategoria { id: string; nome: string }

export interface LoteV5 {
  notes: string
  nome: string
  /** '2 set' ou null */
  importadoEm: string | null
  n: number
  entradas: string | null
  saidas: string | null
  periodo: string
}

export interface ImportarV5Data {
  passo: PassoImportar
  nomeArquivo: string
  /** 'CSV' | 'PDF' | 'OFX' */
  tipoArquivo: string
  banco: string | null
  periodo: string
  lendo: boolean
  conferindoDuplicatas: boolean
  erro: { kind: ErroImportacao; titulo: string; corpo: string } | null
  linhas: LinhaV5[]
  resumo: ResumoExtrato
  fala: ParteFala[]
  fontes: string
  categoriasProntas: boolean
  despesas: OpcaoCategoria[]
  receitas: OpcaoCategoria[]
  totais: { marcadas: number; entradas: string; saidas: string; semCategoriaMarcadas: number }
  mapeamento: { colunas: string[]; atual: MapaColunas; previa: string[] } | null
  importando: { feitas: number; total: number }
  concluido: { n: number; entradas: string; saidas: string; semCategoria: number; origem: string; periodo: string }
  lotes: LoteV5[]
  lotesCarregando: boolean
  lotesErro: boolean
}

export interface ImportarV5Acoes {
  escolherArquivo: (f: File) => Promise<void>
  alternar: (i: number) => void
  alternarTodas: () => void
  categorizar: (i: number, categoriaId: string | null) => void
  aplicarTodas: (categoriaId: string, tipo?: TipoLinha) => ParteFala[]
  criarCategoria: (nome: string, tipo: TipoLinha) => Promise<{ id: string } | { erro: string }>
  setColuna: (campo: keyof MapaColunas, valor: string) => void
  usarColunas: () => void
  importar: () => Promise<boolean>
  outroExtrato: () => void
  desfazerLote: (notes: string) => Promise<number | null>
  recarregarLotes: () => void
}

const SP_TZ = 'America/Sao_Paulo'

/** ISO com fuso -> dia local 'YYYY-MM-DD' */
function diaLocal(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: SP_TZ })
}

export function useImportarV5(): { d: ImportarV5Data; a: ImportarV5Acoes } {
  const imp = useImport()
  const hist = useImportHistory()
  const { categories, parsedData, skippedIndices, duplicateIndices, categoryAssignments } = imp

  const catPorId = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories])
  const categoriasProntas = categories.length > 0
  const sugeridas = useMemo(
    () => (parsedData.length > 0 && categoriasProntas ? buildCategorySuggestions(parsedData, categories) : new Map<number, string>()),
    [parsedData, categories, categoriasProntas],
  )

  const linhas: LinhaV5[] = useMemo(
    () => parsedData.map((t, i) => {
      const cid = categoryAssignments.get(i) ?? null
      const cat = cid ? catPorId.get(cid) : undefined
      return {
        i,
        data: dataCurta(t.date),
        desc: t.description,
        tipo: t.type,
        tipoRotulo: t.type === 'income' ? 'Receita' : 'Despesa',
        valor: valorLinha(t.amount, t.type),
        categoriaId: cat ? cid : null,
        categoriaNome: cat ? cat.name : null,
        marcada: !skippedIndices.has(i),
        duplicata: duplicateIndices.has(i),
        semSugestao: !sugeridas.has(i),
      }
    }),
    [parsedData, categoryAssignments, catPorId, skippedIndices, duplicateIndices, sugeridas],
  )

  // "o que reconheci": o que o arquivo trouxe, não muda com as escolhas do passo 03
  const resumo = useMemo(
    () => resumoReconhecido(linhas.map(l => ({ temCategoria: !l.semSugestao, duplicata: l.duplicata }))),
    [linhas],
  )
  const fala = useMemo(() => falaReconhecido(imp.bankName, resumo), [imp.bankName, resumo])

  const tot = useMemo(
    () => totaisMarcadas(parsedData.map((t, i) => ({
      amount: t.amount, type: t.type, marcada: !skippedIndices.has(i), temCategoria: Boolean(linhas[i]?.categoriaId),
    }))),
    [parsedData, skippedIndices, linhas],
  )

  const despesas = useMemo(() => categories.filter(c => c.type === 'expense').map(c => ({ id: c.id, nome: c.name })), [categories])
  const receitas = useMemo(() => categories.filter(c => c.type === 'income').map(c => ({ id: c.id, nome: c.name })), [categories])

  const erro = imp.error && imp.errorKind
    ? {
        kind: imp.errorKind,
        ...textoErro(imp.errorKind, imp.errorKind === 'lote' ? { feitas: imp.importedCount, total: imp.importTotal } : undefined),
      }
    : null

  const mapeamento = imp.step === 'mapping'
    ? (() => {
        const atual = imp.columnMapping ?? chutarColunas(imp.headers)
        const previa = imp.sampleRows.map(r => [r[atual.date], r[atual.description], r[atual.amount]].filter(Boolean).join(' · '))
        return { colunas: imp.headers, atual, previa }
      })()
    : null

  const marcadasDatas = parsedData.filter((_, i) => !skippedIndices.has(i)).map(t => t.date)
  const periodo = intervaloDeDatas(parsedData.map(t => t.date))

  const lotes: LoteV5[] = hist.batches.map(b => ({
    notes: b.notes,
    nome: b.fileName,
    importadoEm: b.importedAt ? dataCurta(diaLocal(b.importedAt)) : null,
    n: b.count,
    entradas: b.totalIncome > 0 ? brlSomaEntrada(b.totalIncome) : null,
    saidas: b.totalExpense > 0 ? brlSomaSaida(b.totalExpense) : null,
    periodo: intervaloCurto(b.dateRange.min, b.dateRange.max),
  }))

  const d: ImportarV5Data = {
    passo: imp.step,
    nomeArquivo: imp.fileName,
    tipoArquivo: (imp.fileType ?? 'csv').toUpperCase(),
    banco: imp.bankName,
    periodo,
    lendo: imp.reading,
    conferindoDuplicatas: imp.checkingDuplicates,
    erro,
    linhas,
    resumo,
    fala,
    fontes: fontesReconhecido(imp.fileName),
    categoriasProntas,
    despesas,
    receitas,
    totais: {
      marcadas: tot.marcadas,
      entradas: brlSomaEntrada(tot.entradas),
      saidas: brlSomaSaida(tot.saidas),
      semCategoriaMarcadas: tot.semCategoria,
    },
    mapeamento,
    importando: { feitas: imp.importProgress, total: imp.importTotal },
    concluido: {
      n: imp.importedCount,
      entradas: brlSomaEntrada(tot.entradas),
      saidas: brlSomaSaida(tot.saidas),
      semCategoria: tot.semCategoria,
      origem: imp.bankName ? `Do ${imp.bankName}` : imp.fileName,
      periodo: intervaloDeDatas(marcadasDatas),
    },
    lotes,
    lotesCarregando: hist.isLoading,
    lotesErro: hist.isError,
  }

  const { toggleSkip, toggleAll, setCategoryForTransaction, setColumnMapping, applyMapping, executeImport, reset, refetchCategories } = imp

  const alternarTodas = useCallback(() => {
    toggleAll(skippedIndices.size === 0)
  }, [toggleAll, skippedIndices])

  const aplicarTodas = useCallback((categoriaId: string, tipo?: TipoLinha): ParteFala[] => {
    // categoria recém-criada ainda não está na lista recarregada: o tipo vem de quem criou
    const tipoCat = catPorId.get(categoriaId)?.type ?? tipo
    if (!tipoCat) return []
    const res = aplicarATodas(
      parsedData.map((t, i) => ({
        indice: i, tipo: t.type, descricao: t.description,
        temCategoria: categoryAssignments.has(i), marcada: !skippedIndices.has(i),
      })),
      tipoCat,
    )
    res.aplicar.forEach(i => setCategoryForTransaction(i, categoriaId))
    return mensagemAplicar(res, tipoCat)
  }, [catPorId, parsedData, categoryAssignments, skippedIndices, setCategoryForTransaction])

  const criarCategoria = useCallback(async (nome: string, tipo: TipoLinha): Promise<{ id: string } | { erro: string }> => {
    const limpo = nome.trim()
    if (!limpo) return { erro: 'Faltou o nome.' }
    if (categories.some(c => c.name.trim().toLowerCase() === limpo.toLowerCase())) return { erro: 'Essa categoria já existe.' }
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { erro: 'Entre de novo para criar a categoria.' }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as unknown as { from: (t: string) => any }
      // sem ícone nem cor escolhidos (E-09): a tabela pede os dois, vão os neutros
      const { data, error }: { data: { id: string } | null; error: { message: string } | null } = await sb
        .from('categories')
        .insert({ user_id: user.id, name: limpo, icon: '📦', color: '#6F7986', type: tipo, is_default: false })
        .select('id')
        .single()
      if (error || !data) return { erro: 'Não deu para criar a categoria. Tente de novo.' }
      refetchCategories()
      return { id: data.id }
    } catch {
      return { erro: 'Não deu para criar a categoria. Tente de novo.' }
    }
  }, [categories, refetchCategories])

  const setColuna = useCallback((campo: keyof MapaColunas, valor: string) => {
    const base = imp.columnMapping ?? chutarColunas(imp.headers)
    setColumnMapping({ ...base, [campo]: valor })
  }, [imp.columnMapping, imp.headers, setColumnMapping])

  const usarColunas = useCallback(() => {
    applyMapping(imp.columnMapping ?? chutarColunas(imp.headers))
  }, [applyMapping, imp.columnMapping, imp.headers])

  const desfazerLote = useCallback(async (notes: string): Promise<number | null> => {
    try {
      return await hist.deleteBatch(notes)
    } catch {
      return null
    }
  }, [hist])

  const a: ImportarV5Acoes = {
    escolherArquivo: imp.setFile,
    alternar: toggleSkip,
    alternarTodas,
    categorizar: setCategoryForTransaction,
    aplicarTodas,
    criarCategoria,
    setColuna,
    usarColunas,
    importar: executeImport,
    outroExtrato: reset,
    desfazerLote,
    recarregarLotes: () => { void hist.refetch() },
  }

  return { d, a }
}
