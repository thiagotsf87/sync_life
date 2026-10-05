import { describe, it, expect } from 'vitest'
import {
  agruparPorDia, ariaCelula, brlInteiro, celulasDoMes, chavesMaterializadas, classePonto, curtoDesk, curtoMob, diaPadrao,
  itemDeEvento, itemDeProvento, itemDeTransacao, itensDoMes, itensRecorrentes, modoDoMes, numerosDoMes, ocorrenciasNoMes,
  pontosDoDia, projecaoDoMes, saldoAcumulado, semanasDoMes, somaDia, subItem, type ItemCal,
} from './calendario'
import type { RecItem } from './recorrentes'
import type { TransacaoDb } from './transacoes'

const HOJE = '2026-10-03'
const OUT = { ano: 2026, mes: 10 }

const tx = (id: string, date: string, type: TransacaoDb['type'], amount: number, extra: Partial<TransacaoDb> = {}): TransacaoDb => ({
  id, date, type, amount, description: id, payment_method: 'pix', notes: null, is_future: false,
  recurring_transaction_id: null, category: { id: 'c1', name: 'Mercado' }, ...extra,
})

const rec = (id: string, nome: string, valor: number, tipo: RecItem['tipo'], freq: RecItem['freq'], dia: number | null, extra: Partial<RecItem> = {}): RecItem => ({
  id, nome, valor, tipo, freq, dia, inicio: '2026-01-01', fim: null, pausada: false, categoria: null, nota: null, ...extra,
})

const aluguel = rec('r-alu', 'Aluguel', 1200, 'expense', 'monthly', 6, { categoria: 'Moradia' })
const salario = rec('r-sal', 'Salário', 4150, 'income', 'monthly', 30)

describe('grade', () => {
  it('outubro de 2026 começa na quinta: 4 dias de fora reais (27 a 30 de setembro) e fecha em sábado', () => {
    const g = celulasDoMes(OUT)
    expect(g).toHaveLength(5)
    expect(g.every(l => l.length === 7)).toBe(true)
    expect(g[0].slice(0, 4).map(c => [c.dia, c.fora])).toEqual([[27, true], [28, true], [29, true], [30, true]])
    expect(g[0][4]).toMatchObject({ iso: '2026-10-01', dia: 1, fora: false })
    // 31 de outubro é sábado: a última linha fecha sem dias de fora
    expect(g[4][6]).toMatchObject({ iso: '2026-10-31', dia: 31, fora: false })
  })

  it('mês que termina no meio da semana completa a linha com os dias do mês seguinte', () => {
    const g = celulasDoMes({ ano: 2026, mes: 9 }) // 30 de setembro é quarta
    const ult = g[g.length - 1]
    expect(ult[3]).toMatchObject({ iso: '2026-09-30' })
    expect(ult.slice(4).map(c => [c.dia, c.fora])).toEqual([[1, true], [2, true], [3, true]])
  })

  it('mês que começa no domingo não tem dias de fora no começo', () => {
    const g = celulasDoMes({ ano: 2026, mes: 2 }) // 1 de fevereiro de 2026 é domingo, 28 dias
    expect(g).toHaveLength(4)
    expect(g[0][0]).toMatchObject({ iso: '2026-02-01', fora: false })
  })

  it('janeiro pega o fim de dezembro do ano anterior', () => {
    const g = celulasDoMes({ ano: 2027, mes: 1 }) // 1 de janeiro de 2027 é sexta
    expect(g[0].slice(0, 5).map(c => c.dia)).toEqual([27, 28, 29, 30, 31])
    expect(g[0][5]).toMatchObject({ iso: '2027-01-01' })
  })

  it('dia padrão: hoje no mês de hoje, senão o dia 1', () => {
    expect(diaPadrao(OUT, HOJE)).toBe('2026-10-03')
    expect(diaPadrao({ ano: 2026, mes: 11 }, HOJE)).toBe('2026-11-01')
  })

  it('modo do mês', () => {
    expect(modoDoMes(OUT, HOJE)).toBe('atual')
    expect(modoDoMes({ ano: 2026, mes: 9 }, HOJE)).toBe('passado')
    expect(modoDoMes({ ano: 2027, mes: 1 }, HOJE)).toBe('futuro')
  })
})

describe('ocorrências das recorrentes', () => {
  it('mensal cai no dia do mês, preso ao último dia quando o mês é curto', () => {
    expect(ocorrenciasNoMes(aluguel, OUT)).toEqual(['2026-10-06'])
    expect(ocorrenciasNoMes(rec('x', 'X', 10, 'expense', 'monthly', 31), { ano: 2026, mes: 2 })).toEqual(['2026-02-28'])
  })

  it('semanal conta a partir do início, de 7 em 7 dias', () => {
    const sem = rec('s', 'Feira', 50, 'expense', 'weekly', null, { inicio: '2026-09-30' })
    expect(ocorrenciasNoMes(sem, OUT)).toEqual(['2026-10-07', '2026-10-14', '2026-10-21', '2026-10-28'])
  })

  it('trimestral e anual só caem nos meses certos', () => {
    const tri = rec('t', 'Seguro', 300, 'expense', 'quarterly', 15, { inicio: '2026-01-15' })
    expect(ocorrenciasNoMes(tri, OUT)).toEqual(['2026-10-15']) // jan, abr, jul, out
    expect(ocorrenciasNoMes(tri, { ano: 2026, mes: 11 })).toEqual([])
    const anu = rec('a', 'IPVA', 900, 'expense', 'annual', 20, { inicio: '2025-10-20' })
    expect(ocorrenciasNoMes(anu, OUT)).toEqual(['2026-10-20'])
    expect(ocorrenciasNoMes(anu, { ano: 2026, mes: 9 })).toEqual([])
  })

  it('respeita início, fim e pausa', () => {
    expect(ocorrenciasNoMes(rec('i', 'I', 10, 'expense', 'monthly', 6, { inicio: '2026-11-01' }), OUT)).toEqual([])
    expect(ocorrenciasNoMes(rec('f', 'F', 10, 'expense', 'monthly', 6, { fim: '2026-09-30' }), OUT)).toEqual([])
    expect(ocorrenciasNoMes(rec('p', 'P', 10, 'expense', 'monthly', 6, { pausada: true }), OUT)).toEqual([])
  })

  it('só as de hoje em diante viram pontos previstos; as passadas sem lançamento não aparecem', () => {
    const itens = itensRecorrentes([aluguel, rec('b', 'Internet', 150, 'expense', 'monthly', 2)], OUT, HOJE, new Set())
    expect(itens.map(i => i.desc)).toEqual(['Aluguel'])
    expect(itens[0]).toMatchObject({ tipo: 'recorrente', valor: -1200, previsto: true, origem: 'recorrente', data: '2026-10-06' })
  })

  it('a ocorrência que já virou transação não duplica', () => {
    const materializadas = chavesMaterializadas(
      [{ recurring_transaction_id: 'r-alu', date: '2026-10-05' }],
      new Map([['r-alu', 'monthly' as const]]),
    )
    expect(itensRecorrentes([aluguel], OUT, HOJE, materializadas)).toHaveLength(0)
  })

  it('recorrente de entrada vira ponto de entrada com sinal positivo', () => {
    const [s] = itensRecorrentes([salario], OUT, HOJE, new Set())
    expect(s.valor).toBe(4150)
    expect(classePonto(s)).toBe('recorrente in')
  })
})

describe('itens e pontos', () => {
  it('a transação vira entrada ou saída (cheio); a prevista recorrente vira anel', () => {
    expect(itemDeTransacao(tx('a', '2026-10-01', 'income', 2000))).toMatchObject({ tipo: 'entrada', valor: 2000 })
    expect(itemDeTransacao(tx('b', '2026-10-01', 'expense', 80))).toMatchObject({ tipo: 'saida', valor: -80 })
    const rp = itemDeTransacao(tx('c', '2026-10-08', 'expense', 80, { is_future: true, recurring_transaction_id: 'r1' }))
    expect(rp).toMatchObject({ tipo: 'recorrente', previsto: true })
    const rr = itemDeTransacao(tx('d', '2026-10-02', 'expense', 80, { recurring_transaction_id: 'r1' }))
    expect(rr).toMatchObject({ tipo: 'saida', previsto: false })
  })

  it('transferência vira traço, sem sinal, com as contas na linha', () => {
    const t = itemDeTransacao(tx('t', '2026-10-02', 'transfer', 500, {
      category: null, account_from: { id: 'a', name: 'Nubank' }, account_to: { id: 'b', name: 'Inter' },
    }))
    expect(t).toMatchObject({ tipo: 'transferencia', valor: 500, contas: 'Nubank → Inter' })
    expect(subItem(t, HOJE)).toBe('Transferência · Nubank → Inter')
  })

  it('evento planejado e provento viram quadrado e losango', () => {
    const e = itemDeEvento({ id: 'e1', name: 'Revisão do carro', amount: 620, type: 'expense', planned_date: '2026-10-24', is_confirmed: false, categories: { id: 'c', name: 'Transporte' } })
    expect(e).toMatchObject({ tipo: 'planejado', valor: -620, eventoId: 'e1', cat: 'Transporte' })
    const p = itemDeProvento({ id: 'p1', total_amount: 78.4, payment_date: '2026-10-15', portfolio_assets: { ticker: 'MXRF11' } })
    expect(p).toMatchObject({ tipo: 'provento', valor: 78.4, desc: 'Provento MXRF11', origem: 'provento' })
    expect(subItem(p, HOJE)).toContain('06 Patrimônio')
    expect(classePonto(p)).toBe('provento in')
  })

  it('pontos do dia: sem repetir, ordenados por natureza, no máximo 4 com o excedente contado', () => {
    const mk = (tipo: ItemCal['tipo'], valor: number): ItemCal => ({ id: tipo + valor, data: '2026-10-15', dia: 15, tipo, desc: '', cat: '', valor, previsto: false, origem: 'transacao' })
    const p = pontosDoDia([mk('saida', -1), mk('saida', -2), mk('entrada', 5), mk('recorrente', -3)])
    expect(p.classes).toEqual(['recorrente', 'entrada in', 'saida'])
    expect(p.mais).toBe(0)
    const muitos = pontosDoDia([mk('saida', -1), mk('entrada', 5), mk('recorrente', -3), mk('recorrente', 4), mk('planejado', -9), mk('provento', 7)])
    expect(muitos.classes).toHaveLength(4)
    expect(muitos.mais).toBe(2)
  })
})

describe('saldos', () => {
  const fontes = {
    transacoes: [
      tx('sal', '2026-10-01', 'income', 5000),
      tx('mer1', '2026-10-01', 'expense', 1000),
      tx('mer2', '2026-10-02', 'expense', 100),
      tx('mer3', '2026-10-03', 'expense', 232.4),
      tx('tr', '2026-10-02', 'transfer', 700, { category: null }),
    ],
    eventos: [{ id: 'e1', name: 'Revisão', amount: 620, type: 'expense' as const, planned_date: '2026-10-24', is_confirmed: false }],
    proventos: [{ id: 'p1', total_amount: 78, payment_date: '2026-10-15', portfolio_assets: { ticker: 'MXRF11' } }],
    recorrentes: [aluguel, salario],
  }
  const itens = itensDoMes(fontes, OUT, HOJE)
  const porDia = agruparPorDia(itens)

  it('o saldo do dia deixa transferência fora', () => {
    const d2 = somaDia(porDia.get('2026-10-02') ?? [], HOJE)
    expect(d2).toMatchObject({ e: 0, s: 100, saldo: -100, conta: true })
  })

  it('saldo até hoje = entradas menos saídas realizadas, sem previstos', () => {
    expect(saldoAcumulado(OUT, porDia, HOJE, HOJE)).toBe(3667.6)
    const n = numerosDoMes(OUT, itens, HOJE)
    expect(n).toMatchObject({ modo: 'atual', entradas: 5000, saidas: 1332.4, saldo: 3667.6 })
  })

  it('o saldo acumulado dos dias futuros soma os previstos', () => {
    // aluguel (6), provento (15), evento (24), salário (30)
    expect(saldoAcumulado(OUT, porDia, HOJE, '2026-10-31')).toBe(r2(3667.6 - 1200 + 78 - 620 + 4150))
  })

  it('pendentes: quantidade e totais a sair e a entrar', () => {
    const { pendentes } = numerosDoMes(OUT, itens, HOJE)
    expect(pendentes).toEqual({ qtd: 4, aSair: 1820, aEntrar: 4228 })
  })

  it('semana: saldo dos dias do mês, previsto marcado quando há item depois de hoje', () => {
    const sem = semanasDoMes(OUT, porDia, HOJE)
    expect(sem).toHaveLength(5)
    expect(sem[0]).toMatchObject({ saldo: 3667.6, tem: true, prev: false })
    expect(sem[1]).toMatchObject({ saldo: -1200, tem: true, prev: true })
    expect(sem[2]).toMatchObject({ saldo: 78, prev: true })
    expect(sem[3]).toMatchObject({ saldo: -620, prev: true })
  })

  it('mês futuro: os números são o previsto e o saldo é a diferença', () => {
    const nov = { ano: 2026, mes: 11 }
    const itensNov = itensDoMes({ ...fontes, transacoes: [], eventos: [], proventos: [] }, nov, HOJE)
    const n = numerosDoMes(nov, itensNov, HOJE)
    expect(n).toMatchObject({ modo: 'futuro', entradas: 4150, saidas: 1200, saldo: 2950 })
  })

  it('mês passado: o que aconteceu, sem pendências inventadas', () => {
    const set = { ano: 2026, mes: 9 }
    const itensSet = itensDoMes({ ...fontes, transacoes: [tx('x', '2026-09-10', 'expense', 40)], eventos: [], proventos: [] }, set, HOJE)
    expect(itensSet).toHaveLength(1)
    expect(numerosDoMes(set, itensSet, HOJE)).toMatchObject({ modo: 'passado', saidas: 40, saldo: -40, pendentes: { qtd: 0 } })
  })

  it('previsto de hoje fica fora do saldo (pendente), o de amanhã entra', () => {
    const hojeItem: ItemCal = { id: 'h', data: HOJE, dia: 3, tipo: 'recorrente', desc: 'H', cat: '', valor: -50, previsto: true, origem: 'recorrente' }
    const amanha: ItemCal = { ...hojeItem, id: 'a', data: '2026-10-04', dia: 4 }
    expect(somaDia([hojeItem], HOJE).conta).toBe(false)
    expect(somaDia([amanha], HOJE)).toMatchObject({ s: 50, conta: true })
  })
})

describe('projeção do mês', () => {
  const serie = [2120, 3000, 4100, 5200, 6300, 7400, 8500, 9600, 10700, 11800, 12900, 14000, 15100]
  it('é a curva de Planejamento: índice 0 no mês de hoje', () => {
    expect(projecaoDoMes(serie, OUT, HOJE)).toBe(2120)
    expect(projecaoDoMes(serie, { ano: 2026, mes: 12 }, HOJE)).toBe(4100)
  })
  it('mês fechado, além dos 13 meses ou sem curva: sem projeção', () => {
    expect(projecaoDoMes(serie, { ano: 2026, mes: 9 }, HOJE)).toBeNull()
    expect(projecaoDoMes(serie, { ano: 2027, mes: 11 }, HOJE)).toBeNull()
    expect(projecaoDoMes(null, OUT, HOJE)).toBeNull()
  })
})

describe('formatos', () => {
  it('saldo curto no desktop e no mobile', () => {
    expect(curtoDesk(1962.7)).toBe('+1.963')
    expect(curtoDesk(-232.4)).toBe('–232')
    expect(curtoDesk(0.2)).toBe('0')
    expect(curtoMob(1840)).toBe('+1,8k')
    expect(curtoMob(-232.4)).toBe('–232')
  })
  it('KPI sem centavos, NBSP e en-dash no negativo', () => {
    expect(brlInteiro(1840)).toBe('R$ 1.840')
    expect(brlInteiro(-320)).toBe('– R$ 320')
  })
  it('rótulo de leitura da célula', () => {
    const d = itemDeTransacao(tx('x', '2026-10-03', 'expense', 232.4))
    expect(ariaCelula('2026-10-03', [d], HOJE)).toBe('sábado, 3 de outubro, hoje, 1 item, saldo do dia – R$ 232,40')
    expect(ariaCelula('2026-10-09', [], HOJE)).toBe('sexta, 9 de outubro, nada marcado')
  })
})

function r2(n: number) { return Math.round(n * 100) / 100 }
