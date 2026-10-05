import { describe, it, expect } from 'vitest'
import {
  selecaoInicial, resumoReconhecido, falaReconhecido, aplicarATodas, mensagemAplicar,
  totaisMarcadas, rotuloImportar, valorLinha, dataCurta, intervaloDeDatas, textoErro,
  chutarColunas, mesclarDesfeitos, type LinhaAplicar,
} from './importar'
import { textoFala } from './hub'

const N = String.fromCharCode(160)

describe('selecaoInicial', () => {
  it('reconhecidas marcadas, duplicatas desmarcadas', () => {
    const { marcadas, puladas } = selecaoInicial(5, new Set([1, 3]))
    expect([...marcadas]).toEqual([0, 2, 4])
    expect([...puladas]).toEqual([1, 3])
  })
  it('sem duplicatas, tudo marcado', () => {
    expect(selecaoInicial(3, new Set()).marcadas.size).toBe(3)
  })
})

describe('resumo e fala', () => {
  const linhas = [
    ...Array.from({ length: 15 }, () => ({ temCategoria: true, duplicata: false })),
    { temCategoria: false, duplicata: false },
    { temCategoria: false, duplicata: false },
    { temCategoria: false, duplicata: false },
  ]
  linhas[16] = { temCategoria: true, duplicata: true }
  linhas[17] = { temCategoria: true, duplicata: true }

  it('conta linhas, categorias e duplicatas', () => {
    const r = resumoReconhecido(linhas)
    expect(r).toEqual({ total: 18, comCategoria: 17, semCategoria: 1, duplicatas: 2 })
  })

  it('fala do banco, com singular e plural', () => {
    const t = textoFala(falaReconhecido('Nubank', { total: 18, comCategoria: 15, semCategoria: 3, duplicatas: 2 }))
    expect(t).toBe('Reconheci um extrato do Nubank com 18 linhas: 15 já com categoria, 3 sem, e 2 parecem duplicatas do que você já registrou. Deixei as duplicatas desmarcadas.')
    const u = textoFala(falaReconhecido(null, { total: 1, comCategoria: 1, semCategoria: 0, duplicatas: 1 }))
    expect(u).toContain('um extrato com 1 linha: todas já com categoria')
    expect(u).toContain('1 parece duplicata')
    expect(u).toContain('Deixei a duplicata desmarcada.')
  })

  it('sem duplicatas diz isso', () => {
    const t = textoFala(falaReconhecido('Inter', { total: 4, comCategoria: 4, semCategoria: 0, duplicatas: 0 }))
    expect(t).toContain('Nenhuma parece duplicata')
  })

  it('sem travessão', () => {
    const t = textoFala(falaReconhecido('Nubank', { total: 18, comCategoria: 15, semCategoria: 3, duplicatas: 2 }))
    expect(t).not.toContain('—')
  })
})

describe('aplicarATodas', () => {
  const l = (indice: number, tipo: 'income' | 'expense', temCategoria: boolean, marcada = true): LinhaAplicar =>
    ({ indice, tipo, descricao: `L${indice}`, temCategoria, marcada })
  const linhas = [l(0, 'income', false), l(1, 'expense', false), l(2, 'expense', false), l(3, 'expense', true), l(4, 'expense', false, false)]

  it('categoria de despesa só vai para despesa e lista a receita que ficou de fora', () => {
    const r = aplicarATodas(linhas, 'expense')
    expect(r.aplicar).toEqual([1, 2])
    expect(r.fora).toEqual([{ indice: 0, descricao: 'L0' }])
    expect(textoFala(mensagemAplicar(r, 'expense'))).toBe('Aplicada a 2 linhas de despesa. L0 é receita: escolha à parte.')
  })

  it('categoria de receita só vai para receita', () => {
    const r = aplicarATodas(linhas, 'income')
    expect(r.aplicar).toEqual([0])
    expect(r.fora.map(f => f.indice)).toEqual([1, 2])
    expect(textoFala(mensagemAplicar(r, 'income'))).toContain('L1, L2 são despesa')
  })

  it('nenhuma linha do tipo', () => {
    const r = aplicarATodas([l(0, 'income', false)], 'expense')
    expect(textoFala(mensagemAplicar(r, 'expense'))).toBe('Nenhuma linha sem categoria é de despesa.')
  })
})

describe('totais e rótulos', () => {
  it('soma só as marcadas e conta as sem categoria', () => {
    const t = totaisMarcadas([
      { amount: 4150, type: 'income', marcada: true, temCategoria: true },
      { amount: 1200.1, type: 'expense', marcada: true, temCategoria: false },
      { amount: 55.9, type: 'expense', marcada: true, temCategoria: true },
      { amount: 99, type: 'expense', marcada: false, temCategoria: false },
    ])
    expect(t).toEqual({ marcadas: 3, entradas: 4150, saidas: 1256, semCategoria: 1 })
  })
  it('rótulo da SaveBar', () => {
    expect(rotuloImportar(0)).toBe('Marque ao menos uma')
    expect(rotuloImportar(1)).toBe('Importar 1 transação')
    expect(rotuloImportar(16)).toBe('Importar 16 transações')
  })
})

describe('formatação', () => {
  it('valor com sinal, NBSP e en-dash', () => {
    expect(valorLinha(4150, 'income')).toBe(`+ R$${N}4.150,00`)
    expect(valorLinha(320, 'expense')).toBe(`– R$${N}320,00`)
  })
  it('datas curtas e intervalo', () => {
    expect(dataCurta('2026-09-01')).toBe(`1${N}set`)
    expect(intervaloDeDatas(['2026-09-30', '2026-09-01', '2026-09-14'])).toBe(`1 a 30${N}set`)
    expect(intervaloDeDatas(['2026-08-28', '2026-09-03'])).toBe(`28${N}ago a 3${N}set`)
    expect(intervaloDeDatas(['2026-09-03'])).toBe(`3${N}set`)
    expect(intervaloDeDatas([])).toBe('')
  })
})

describe('erros e colunas', () => {
  it('textos dos erros do protótipo', () => {
    expect(textoErro('senha').titulo).toBe('Este PDF tem senha.')
    expect(textoErro('vazio').titulo).toBe('Nenhuma transação neste arquivo.')
    expect(textoErro('lote', { feitas: 50, total: 120 }).titulo).toBe('50 de 120 importadas.')
  })
  it('chuta as colunas pelo nome e cai na ordem', () => {
    expect(chutarColunas(['data_mov', 'historico', 'valor_rs'])).toEqual({ date: 'data_mov', description: 'historico', amount: 'valor_rs' })
    expect(chutarColunas(['a', 'b', 'c'])).toEqual({ date: 'a', description: 'b', amount: 'c' })
    expect(chutarColunas([])).toEqual({ date: '', description: '', amount: '' })
  })
})

describe('mesclarDesfeitos', () => {
  const lote = (notes: string) => ({ notes })
  it('devolve o lote desfeito à posição de antes', () => {
    const atuais = [lote('A'), lote('C')]
    const r = mesclarDesfeitos(atuais, [{ lote: lote('B'), indice: 1, removidas: 22 }])
    expect(r.map(x => x.notes)).toEqual(['A', 'B', 'C'])
    expect(r[1].desfeito).toBe(22)
    expect(r[0].desfeito).toBeUndefined()
  })
  it('não duplica se o lote ainda estiver na lista', () => {
    const r = mesclarDesfeitos([lote('A'), lote('B')], [{ lote: lote('B'), indice: 1, removidas: 2 }])
    expect(r.map(x => x.notes)).toEqual(['A', 'B'])
    expect(r[1].desfeito).toBe(2)
  })
})
