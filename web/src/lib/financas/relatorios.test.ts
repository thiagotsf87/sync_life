import { describe, it, expect } from 'vitest'
import {
  addMes, mesesDoPeriodo, opcoesMes, faixa, montarRelatorio, numeros, categoriasRel, topDespesas, geoC1, geoC3,
  conteudoTip, syTopo, syCategorias, syPoupanca, syTop, syReceitasDespesas, gerarCsv, subtitulo, textoDelta, sparkPath,
  p1, pts, delta, type TxRel, type Relatorio,
} from './relatorios'
import { textoFala } from './hub'

// série do protótipo (SL_MOCK.fin.relatorios.mensal): abril a setembro de 2026
const MES: Record<string, { rec: number; desp: number; cats: Record<string, number> }> = {
  '2026-04': { rec: 4650, desp: 3380, cats: { Moradia: 1240, Mercado: 600, Lazer: 380, Transporte: 330, Saúde: 210 } },
  '2026-05': { rec: 4720, desp: 3290, cats: { Moradia: 1240, Mercado: 580, Lazer: 350, Transporte: 300, Saúde: 190 } },
  '2026-06': { rec: 4800, desp: 3450, cats: { Moradia: 1240, Mercado: 610, Lazer: 420, Transporte: 320, Saúde: 230 } },
  '2026-07': { rec: 4750, desp: 3520, cats: { Moradia: 1240, Mercado: 640, Lazer: 470, Transporte: 330, Saúde: 200 } },
  '2026-08': { rec: 4900, desp: 3250, cats: { Moradia: 1240, Mercado: 590, Lazer: 360, Transporte: 310, Saúde: 190 } },
  '2026-09': { rec: 4630, desp: 2987, cats: { Moradia: 1240, Mercado: 706, Lazer: 310, Transporte: 290, Saúde: 140 } },
}

function fixture(): TxRel[] {
  const out: TxRel[] = []
  for (const [ym, m] of Object.entries(MES)) {
    out.push({ id: `r-${ym}`, date: `${ym}-05`, amount: m.rec, type: 'income', description: 'Salário', category: 'Salário', payment_method: 'pix', notes: null })
    for (const [c, v] of Object.entries(m.cats)) {
      out.push({ id: `d-${ym}-${c}`, date: `${ym}-10`, amount: v, type: 'expense', description: c === 'Moradia' ? 'Aluguel' : `${c} do mês`, category: c, payment_method: 'debit', notes: null })
    }
    // o resto da despesa (as "outras categorias" do protótipo) vira quatro categorias pequenas, fora do top 5
    const resto = m.desp - Object.values(m.cats).reduce((s, v) => s + v, 0)
    for (let i = 1; i <= 4; i++) {
      out.push({ id: `o-${ym}-${i}`, date: `${ym}-20`, amount: resto / 4, type: 'expense', description: `Diversos ${i}`, category: `Pequena ${i}`, payment_method: null, notes: null })
    }
  }
  return out
}

const HOJE = '2026-10-03'

function rel(key: Parameters<typeof mesesDoPeriodo>[0]['key'] = 'tri', historicoInicio: string | null = '2026-04-05', txs = fixture()): Relatorio {
  const { sel, prev } = mesesDoPeriodo({ key, hoje: HOJE })
  return montarRelatorio({ txs, key, sel, prev, hoje: HOJE, historicoInicio, metaPct: 30 })
}

describe('períodos', () => {
  it('mês, trimestre, semestre, 12 meses e ano contra o mesmo número de meses antes', () => {
    expect(mesesDoPeriodo({ key: 'mes', hoje: HOJE })).toEqual({ sel: ['2026-10'], prev: ['2026-09'] })
    expect(mesesDoPeriodo({ key: 'tri', hoje: HOJE })).toEqual({ sel: ['2026-08', '2026-09', '2026-10'], prev: ['2026-05', '2026-06', '2026-07'] })
    expect(mesesDoPeriodo({ key: 'sem', hoje: HOJE }).sel).toHaveLength(6)
    const doze = mesesDoPeriodo({ key: '12m', hoje: HOJE })
    expect(doze.sel[0]).toBe('2025-11')
    expect(doze.prev[0]).toBe('2024-11')
    const ano = mesesDoPeriodo({ key: 'ano', hoje: HOJE })
    expect(ano.sel).toHaveLength(10)
    expect(ano.prev[0]).toBe('2025-03')
  })

  it('personalizado ordena as pontas e não passa do mês corrente', () => {
    const r = mesesDoPeriodo({ key: 'custom', hoje: HOJE, de: '2026-09', ate: '2026-07' })
    expect(r.sel).toEqual(['2026-07', '2026-08', '2026-09'])
    expect(r.prev).toEqual(['2026-04', '2026-05', '2026-06'])
    expect(mesesDoPeriodo({ key: 'custom', hoje: HOJE, de: '2026-09', ate: '2027-02' }).sel).toEqual(['2026-09', '2026-10'])
  })

  it('addMes cruza a virada do ano', () => {
    expect(addMes('2026-01', -1)).toBe('2025-12')
    expect(addMes('2026-11', 3)).toBe('2027-02')
  })

  it('faixa escreve o período e põe o ano quando cruza a virada', () => {
    expect(faixa(['2026-07', '2026-08', '2026-09'])).toBe('julho a setembro')
    expect(faixa(['2026-07', '2026-08', '2026-09'], true)).toBe('jul a set')
    expect(faixa(['2026-10'])).toBe('outubro')
    expect(faixa(['2025-11', '2025-12', '2026-01'])).toBe('novembro de 2025 a janeiro de 2026')
  })

  it('opções do personalizado vão do início do histórico ao mês corrente', () => {
    const o = opcoesMes(HOJE, '2026-04-05')
    expect(o[0]).toEqual({ value: '2026-04', label: 'abril' })
    expect(o[o.length - 1].value).toBe('2026-10')
    expect(opcoesMes(HOJE, null)).toHaveLength(12)
    expect(opcoesMes(HOJE, '2020-01-01')).toHaveLength(24)
  })
})

describe('montarRelatorio', () => {
  it('trimestre com histórico completo compara com o anterior', () => {
    const { sel, prev } = mesesDoPeriodo({ key: 'custom', hoje: HOJE, de: '2026-07', ate: '2026-09' })
    const r = montarRelatorio({ txs: fixture(), key: 'custom', sel, prev, hoje: HOJE, historicoInicio: '2026-04-05', metaPct: 30 })
    expect(r.temAnterior).toBe(true)
    expect(r.total.rec).toBe(14280)
    expect(r.total.desp).toBe(9757)
    expect(r.total.saldo).toBe(4523)
    expect(r.totalAnt?.rec).toBe(14170)
    expect(r.totalAnt?.desp).toBe(10120)
    expect(r.txCount).toBe(30)
    expect(r.nota).toBe('')
  })

  it('sem período anterior quando o histórico começa depois dele', () => {
    const r = rel('sem')
    expect(r.temAnterior).toBe(false)
    expect(r.mesesAnt).toEqual([])
    expect(r.totalAnt).toBeNull()
    expect(r.nota).toContain('seu histórico começa em abril')
    expect(r.nota).toContain('outubro até dia 3')
  })

  it('poupança do mês é saldo ÷ receitas, nunca negativa', () => {
    const r = rel('custom', '2026-04-05')
    const jul = r.meses.find(m => m.ym === '2026-07')
    // custom padrão = ago a out; jul não está. Usa trimestre explícito:
    expect(jul).toBeUndefined()
    const t = montarRelatorio({
      txs: [
        { id: '1', date: '2026-07-01', amount: 1000, type: 'income', description: null, category: null, payment_method: null, notes: null },
        { id: '2', date: '2026-07-02', amount: 1500, type: 'expense', description: null, category: null, payment_method: null, notes: null },
        { id: '3', date: '2026-07-02', amount: 700, type: 'transfer', description: null, category: null, payment_method: null, notes: null },
      ],
      key: 'custom', sel: ['2026-07'], prev: ['2026-06'], hoje: HOJE, historicoInicio: '2026-07-01', metaPct: 20,
    })
    expect(t.meses[0].poupPct).toBe(0)
    expect(t.meses[0].saldo).toBe(-500)
    expect(t.meses[0].n).toBe(3)
    expect(t.total.desp).toBe(1500) // transferência fora
  })

  it('sem transações: vazio, e a fala diz isso', () => {
    const r = rel('mes', null, [])
    expect(r.vazio).toBe(true)
    expect(textoFala(syTopo(r))).toBe('Não há transações de outubro.')
  })
})

describe('números e deltas', () => {
  const r = montarRelatorio({ txs: fixture(), key: 'custom', sel: ['2026-07', '2026-08', '2026-09'], prev: ['2026-04', '2026-05', '2026-06'], hoje: HOJE, historicoInicio: '2026-04-05', metaPct: 30 })

  it('delta contra o período anterior, em % com vírgula', () => {
    const n = numeros(r, false)
    expect(n[0]).toEqual({ l: 'Receitas', v: 'R$ 14.280', d: '+0,8% vs abril a junho', ele: true })
    expect(n[1].d).toBe('-3,6% vs abril a junho')
    expect(n[1].ele).toBe(true)
    expect(n[2].d).toBe('+11,7% vs abril a junho')
    expect(n[3].l).toBe('Poupança média')
    expect(n[3].d).toMatch(/^Meta: 30% · [+-]\d+ pontos?$/)
  })

  it('mobile abrevia o período e o rótulo', () => {
    const n = numeros(r, true)
    expect(n[0].d).toBe('+0,8% vs abr a jun')
    expect(n[3].l).toBe('Poupança')
  })

  it('sem período anterior não inventa delta', () => {
    const s = numeros(rel('sem'), false)
    expect(s[0].d).toBe('sem período anterior')
    expect(s[2].d).toBe('sem período anterior')
    expect(s[0].ele).toBe(false)
    expect(s[1].d).toMatch(/% da receita$/)
  })

  it('formatadores', () => {
    expect(p1(8.24)).toBe('+8,2%')
    expect(p1(-3.6)).toBe('-3,6%')
    expect(pts(1)).toBe('+1 ponto')
    expect(pts(-3)).toBe('-3 pontos')
    expect(delta(10, 0)).toBeNull()
    expect(delta(5, -10)).toBe(150)
  })

  it('subtítulo desktop traz as transações, mobile não', () => {
    expect(subtitulo(r, false)).toBe('Julho a setembro · 3 meses · 30 transações · comparado com abril a junho')
    expect(subtitulo(r, true)).toBe('Julho a setembro · 3 meses · comparado com abril a junho')
  })
})

describe('categorias e top 5', () => {
  const r = montarRelatorio({ txs: fixture(), key: 'custom', sel: ['2026-07', '2026-08', '2026-09'], prev: ['2026-04', '2026-05', '2026-06'], hoje: HOJE, historicoInicio: '2026-04-05', metaPct: 30 })

  it('categorias atual × anterior ordenadas, com delta e "igual"', () => {
    const c = categoriasRel(r)
    expect(c.linhas.map(l => l.nome)).toEqual(['Moradia', 'Mercado', 'Lazer', 'Transporte', 'Saúde'])
    expect(c.linhas[0].valor).toBe(3720)
    expect(textoDelta(c.linhas[0], true)).toBe('igual')
    expect(textoDelta(c.linhas[1], true)).toBe('+8,2%')
    expect(textoDelta(c.linhas[4], true)).toBe('-15,9%')
    expect(c.linhas[0].wA).toBe(100)
    expect(c.linhas[1].wA).toBeCloseTo(52.0, 1)
    expect(c.linhas[1].wB).toBeCloseTo(48.1, 1)
    expect(c.outras).toBe(1501)
    expect(c.outrasAnt).toBe(1880)
    expect(c.linhas[0].spark).toEqual([1240, 1240, 1240])
  })

  it('sem anterior mostra a parte do total e sem barra B', () => {
    const c = categoriasRel(rel('sem'))
    expect(textoDelta(c.linhas[0], false)).toMatch(/% do total$/)
    expect(c.linhas[0].wB).toBeNull()
    expect(c.outrasAnt).toBeNull()
  })

  it('"Outras" soma o que ficou fora das cinco maiores', () => {
    const extra: TxRel = { id: 'x', date: '2026-08-12', amount: 300, type: 'expense', description: 'Presente', category: 'Presentes', payment_method: null, notes: null }
    const r2 = montarRelatorio({ txs: [...fixture(), extra], key: 'custom', sel: ['2026-07', '2026-08', '2026-09'], prev: ['2026-04', '2026-05', '2026-06'], hoje: HOJE, historicoInicio: '2026-04-05', metaPct: 30 })
    const c = categoriasRel(r2)
    expect(c.linhas).toHaveLength(5)
    expect(c.linhas).toHaveLength(5)
    expect(c.linhas.map(l => l.nome)).not.toContain('Presentes') // 300 < Saúde (530): fica em "Outras"
    expect(c.outras).toBe(1501 + 300)
  })

  it('top 5: as maiores despesas, com barra relativa à primeira', () => {
    const t = topDespesas(r)
    expect(t).toHaveLength(5)
    expect(t[0]).toMatchObject({ desc: 'Aluguel', cat: 'Moradia', valor: 1240, w: 100 })
    expect(t[3].desc).toBe('Mercado do mês')
    expect(t[3].valor).toBe(706)
    expect(t[3].w).toBeCloseTo(56.9, 1)
    expect(t[4].valor).toBe(640)
    expect(t[0].data).toBe('10 set')
  })

  it('sparkPath normaliza entre 2 e 14', () => {
    expect(sparkPath([10, 20, 30])).toBe('M0.0 14.0 L30.0 8.0 L60.0 2.0')
    expect(sparkPath([5])).toBe('')
  })
})

describe('geometria dos gráficos (protótipo, desktop e mobile)', () => {
  const r = montarRelatorio({ txs: fixture(), key: 'custom', sel: ['2026-07', '2026-08', '2026-09'], prev: ['2026-04', '2026-05', '2026-06'], hoje: HOJE, historicoInicio: '2026-04-05', metaPct: 30 })

  it('c1 desktop: mesma linha de receitas, escala 2,5k a 5,5k e sombra no período anterior', () => {
    const g = geoC1(r, false)
    expect(g.g.W).toBe(600)
    expect(g.g.H).toBe(200)
    expect(g.linhaRec).toBe('M30.0 65.0 L138.0 60.8 L246.0 56.0 L354.0 59.0 L462.0 50.0 L570.0 66.2')
    expect(g.linhaDesp).toBe('M30.0 141.2 L138.0 146.6 L246.0 137.0 L354.0 132.8 L462.0 149.0 L570.0 164.8')
    expect(g.grades.map(v => v.toFixed(1))).toEqual(['194.0', '104.0', '14.0'])
    expect(g.sombra).toBe(300)
    expect(g.ylabels.map(l => l.txt)).toEqual(['R$ 2,5k', 'R$ 5,5k'])
    expect(g.ylabels[0].top).toBe('97.00%')
    expect(g.zonas.map(z => z.txt)).toEqual(['abril a junho', 'julho a setembro'])
    expect(g.zonas[1].left).toBe('50.00%')
    expect(g.xl.map(x => x.txt)).toEqual(['abr', 'mai', 'jun', 'jul', 'ago', 'set'])
    expect(g.xl[0].left).toBe('5.00%')
    expect(g.dots[g.dots.length - 1]).toMatchObject({ cor: 'rec', w: 9 })
    expect(g.area?.endsWith('L570.0 200 L30.0 200 Z')).toBe(true)
  })

  it('c1 mobile: 340×150, sem rótulos de zona', () => {
    const g = geoC1(r, true)
    expect(g.g.W).toBe(340)
    expect(g.g.H).toBe(150)
    expect(g.linhaRec.startsWith('M18.0 50.8 L78.8 47.8')).toBe(true)
    expect(g.zonas).toEqual([])
    expect(g.sombra).toBe(170)
  })

  it('c1 com um mês só e sem anterior fica no meio, sem sombra nem área', () => {
    const g = geoC1(rel('mes', '2026-10-01'), false)
    expect(g.g.xs).toEqual([300])
    expect(g.sombra).toBeNull()
    expect(g.area).toBeNull()
  })

  it('c1 não quebra quando a despesa passa da receita', () => {
    const t = montarRelatorio({
      txs: [
        { id: '1', date: '2026-09-01', amount: 1000, type: 'income', description: null, category: null, payment_method: null, notes: null },
        { id: '2', date: '2026-09-02', amount: 5000, type: 'expense', description: null, category: null, payment_method: null, notes: null },
      ],
      key: 'custom', sel: ['2026-09'], prev: ['2026-08'], hoje: HOJE, historicoInicio: '2026-09-01', metaPct: 20,
    })
    const g = geoC1(t, false)
    expect(Number.isFinite(g.linhaRec.length)).toBe(true)
    g.grades.forEach(v => expect(Number.isFinite(v)).toBe(true))
  })

  it('c3: colunas verdes na meta, cinza abaixo, linha da meta e rótulos', () => {
    const g = geoC3(r, false)
    expect(g.baseY).toBe(148)
    expect(g.barras).toHaveLength(6)
    expect(g.barras[0].ant).toBe(true)
    expect(g.barras[3].ant).toBe(false)
    expect(g.barras.map(b => b.ok)).toEqual([false, true, false, false, true, true])
    expect(g.metaY).toBeCloseTo(50.5, 1)
    expect(g.vl[5].left).toBe('92.67%')
    expect(g.xl[3].txt).toBe('jul')
    expect(g.barras[0].w).toBe(34)
  })

  it('aria dos gráficos nomeia os meses e os valores', () => {
    const t = conteudoTip(r, { tipo: 'c1', i: 3 }, false)
    expect(t?.titulo).toBe('Julho')
    expect(t?.blocos[0][0]).toEqual({ l: 'Receitas', v: 'R$ 4.750', k: 'ele' })
  })
})

describe('tooltips', () => {
  const r = montarRelatorio({ txs: fixture(), key: 'custom', sel: ['2026-07', '2026-08', '2026-09'], prev: ['2026-04', '2026-05', '2026-06'], hoje: HOJE, historicoInicio: '2026-04-05', metaPct: 30 })

  it('mês anterior leva a marca "anterior"', () => {
    expect(conteudoTip(r, { tipo: 'c1', i: 0 }, false)?.sub).toBe(' · anterior')
    expect(conteudoTip(r, { tipo: 'c1', i: 4 }, false)?.sub).toBe('')
  })

  it('mês corrente leva "até dia N"', () => {
    const t = rel('mes')
    expect(conteudoTip(t, { tipo: 'c3', i: 1 }, false)?.sub).toBe(' · até dia 3')
  })

  it('poupança diz quantos pontos acima ou abaixo da meta', () => {
    const t = conteudoTip(r, { tipo: 'c3', i: 3 }, false)
    expect(t?.blocos[0]).toEqual([{ l: 'Poupança', v: '26%' }, { l: 'Meta', v: '30%' }])
    expect(t?.blocos[1][0].l).toBe('4 pontos abaixo')
    expect(t?.blocos[1][0].v).toBe('R$ 1.230 guardados')
  })

  it('categoria e top 5', () => {
    const c = conteudoTip(r, { tipo: 'cat', nome: 'Mercado' }, false)
    expect(c?.titulo).toBe('Mercado')
    expect(c?.blocos[0]).toEqual([{ l: 'Julho a setembro', v: 'R$ 1.936' }, { l: 'Abril a junho', v: 'R$ 1.790' }])
    const t = conteudoTip(r, { tipo: 'top', i: 0 }, false)
    expect(t?.titulo).toBe('Aluguel')
    expect(t?.blocos[0][0].v).toBe('R$ 1.240,00')
    expect(conteudoTip(r, { tipo: 'top', i: 99 }, false)).toBeNull()
  })
})

describe('linhas de Sy calculadas', () => {
  const r = montarRelatorio({ txs: fixture(), key: 'custom', sel: ['2026-07', '2026-08', '2026-09'], prev: ['2026-04', '2026-05', '2026-06'], hoje: HOJE, historicoInicio: '2026-04-05', metaPct: 30 })

  it('topo compara o gasto com o período anterior e a poupança com a meta', () => {
    const f = textoFala(syTopo(r))
    expect(f).toMatch(/^Você gastou 3,6% menos que em abril a junho, e a poupança média ficou em \d+%/)
    expect(syTopo(r).filter(p => p.b)[0].t).toBe('3,6%')
  })

  it('mês corrente: frase do dia', () => {
    const f = textoFala(syTopo(rel('mes', '2026-10-01', [
      { id: '1', date: '2026-10-01', amount: 5000, type: 'income', description: null, category: null, payment_method: null, notes: null },
      { id: '2', date: '2026-10-02', amount: 3160, type: 'expense', description: null, category: 'Moradia', payment_method: null, notes: null },
    ])))
    expect(f).toContain('Outubro está no dia 3:')
    expect(f).toContain('R$ 5.000 entraram e R$ 3.160 saíram')
    expect(f).toContain('A poupança do mês está em 37%, acima da meta de 30%.')
  })

  it('sem anterior: melhor mês', () => {
    const f = textoFala(syTopo(rel('sem')))
    expect(f).toMatch(/^De maio a outubro, a poupança média ficou em/)
    expect(f).toMatch(/O melhor mês foi \w+, com R\$ [\d.]+ de saldo\.$/)
  })

  it('receitas × despesas: melhor mês (agosto) e sem travessão', () => {
    expect(textoFala(syReceitasDespesas(r))).toBe('Agosto foi o melhor mês: sobraram R$ 1.650.')
  })

  it('categorias: a que mais subiu', () => {
    expect(textoFala(syCategorias(r))).toBe('Mercado subiu 8,2%; foi a única categoria acima de abril a junho.')
  })

  it('poupança: quantos meses na meta e o mais baixo', () => {
    const f = textoFala(syPoupanca(r))
    expect(f).toMatch(/^Você ficou na meta em \d de 3 meses/)
  })

  it('maiores saídas: moradia domina', () => {
    expect(textoFala(syTop(r))).toBe('Moradia ocupa 3 das 5 maiores saídas: o aluguel, que é fixo.')
  })

  it('nenhuma frase tem travessão', () => {
    const tudo = [syTopo(r), syReceitasDespesas(r), syCategorias(r), syPoupanca(r), syTop(r)].map(textoFala).join(' ')
    expect(tudo).not.toContain('—')
  })
})

describe('CSV', () => {
  const r = rel('mes', '2026-10-01', [
    { id: '1', date: '2026-10-01', amount: 5000, type: 'income', description: 'Salário', category: 'Salário', payment_method: 'pix', notes: null },
    { id: '2', date: '2026-10-02', amount: 1200.5, type: 'expense', description: 'Aluguel "novo"', category: 'Moradia', payment_method: 'boleto', notes: 'ref; outubro' },
    { id: '3', date: '2026-10-03', amount: 80, type: 'expense', description: '=SOMA(A1)', category: null, payment_method: null, notes: null },
  ])
  const csv = gerarCsv(r)

  it('BOM, separador ;, CRLF e decimal com vírgula', () => {
    expect(csv.txt.startsWith('﻿Data;Descrição;Categoria;Tipo;Valor;Método;Notas\r\n')).toBe(true)
    expect(csv.linhas).toBe(3)
    const l = csv.txt.split('\r\n')
    expect(l[1]).toBe('01/10/2026;"Salário";"Salário";Receita;5000,00;Pix;""')
    expect(l[2]).toBe('02/10/2026;"Aluguel ""novo""";"Moradia";Despesa;1200,50;Boleto;"ref; outubro"')
  })

  it('texto que parece fórmula de planilha ganha apóstrofo', () => {
    expect(csv.txt.split('\r\n')[3]).toBe('03/10/2026;"\'=SOMA(A1)";"";Despesa;80,00;;""')
  })

  it('nome do arquivo traz o período', () => {
    expect(csv.nome).toBe('synclife-relatorio-2026-10-a-2026-10.csv')
    expect(gerarCsv(rel('tri')).nome).toBe('synclife-relatorio-2026-08-a-2026-10.csv')
  })
})
