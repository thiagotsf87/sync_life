import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'
import { CalendarioView, type CalendarioViewProps } from './CalendarioView'
import { itensDoMes } from '@/lib/financas/calendario'
import type { RecItem } from '@/lib/financas/recorrentes'
import type { TransacaoDb } from '@/lib/financas/transacoes'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a>,
}))

const HOJE = '2026-10-03'
const OUT = { ano: 2026, mes: 10 }

const tx = (id: string, date: string, type: TransacaoDb['type'], amount: number, desc: string, cat = 'Mercado', extra: Partial<TransacaoDb> = {}): TransacaoDb => ({
  id, date, type, amount, description: desc, payment_method: 'pix', notes: null, is_future: false,
  recurring_transaction_id: null, category: { id: 'c1', name: cat }, ...extra,
})
const rec = (id: string, nome: string, valor: number, tipo: RecItem['tipo'], dia: number, categoria: string): RecItem => ({
  id, nome, valor, tipo, freq: 'monthly', dia, inicio: '2026-01-01', fim: null, pausada: false, categoria, nota: null,
})

const itens = itensDoMes({
  transacoes: [
    tx('t1', '2026-10-01', 'income', 5000, 'Salário', 'Renda'),
    tx('t2', '2026-10-01', 'expense', 1000, 'Aluguel de setembro', 'Moradia'),
    tx('t3', '2026-10-03', 'expense', 182.4, 'Mercado Central'),
    tx('t4', '2026-10-02', 'transfer', 500, 'Nubank para Inter', '', {
      category: null, account_from: { id: 'a', name: 'Nubank' }, account_to: { id: 'b', name: 'Inter' },
    }),
  ],
  eventos: [{ id: 'e1', name: 'Revisão do carro', amount: 620, type: 'expense', planned_date: '2026-10-24', is_confirmed: false, categories: { id: 'c9', name: 'Transporte' } }],
  proventos: [{ id: 'p1', total_amount: 78.4, payment_date: '2026-10-15', portfolio_assets: { ticker: 'MXRF11' } }],
  recorrentes: [rec('r1', 'Aluguel', 1200, 'expense', 6, 'Moradia'), rec('r2', 'Salário', 4150, 'income', 30, 'Renda')],
}, OUT, HOJE)

const base = (mob: boolean, extra: Partial<CalendarioViewProps> = {}): CalendarioViewProps => ({
  mob, hoje: HOJE, mes: OUT, onMes: () => {}, onHoje: () => {}, itens, projecao: 2120, loading: false, erro: false,
  onRecarregar: () => {}, sel: HOJE, onSelecionar: () => {}, novaId: null, aviso: '',
  onAdicionarTx: () => {}, onAdicionarEvento: () => {}, onAbrirItem: () => {}, onFalar: () => {}, ...extra,
})

const renderRaw = (p: CalendarioViewProps) => renderToString(<CalendarioView {...p} />).replace(/<!-- -->/g, '')
// NBSP vira espaço comum para comparar texto; a checagem de NBSP usa o HTML cru
const render = (p: CalendarioViewProps) => renderRaw(p).replace(/ /g, ' ')
const PROIBIDAS = /edição|folha|manchete|colofão|jornal|byline|redação|diário|coach|assessor|o Sy|ao Sy|do Sy|—/i

describe('CalendarioView desktop', () => {
  const html = render(base(false))

  it('traz as classes-chave do protótipo', () => {
    for (const c of ['objeto', 'mesnav', 'mesnums', 'principal', 'class="cal ', 'grade-col', 'class="dow"', 'class="grade"', 'class="sem"', 'class="dia', 'class="wk', 'legenda', 'dpanel', 'dnums', 'ditens', 'dacum', 'dacts']) {
      expect(html).toContain(c)
    }
    expect(html).toContain('Calendário')
    expect(html).toContain('outubro de 2026')
    expect(html).toContain('Saldo até hoje')
    expect(html).toContain('Projeção do mês')
    expect(html).toContain('Pendentes')
    expect(html).toContain('Falar com Sy sobre este dia')
  })

  it('grade dom a sáb com 5 semanas e os dias de fora reais', () => {
    expect((html.match(/class="sem"/g) ?? []).length).toBe(5)
    expect(html).toContain('>Dom<')
    expect(html).toContain('>Sáb<')
    expect(html).toContain('>Semana<')
    expect((html.match(/class="dia fora"/g) ?? []).length).toBe(4) // 27 a 30 de setembro
  })

  it('hoje marcado, selecionado e com rótulo de leitura completo', () => {
    expect(html).toContain('dia hoje')
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('sábado, 3 de outubro, hoje, 1 item, saldo do dia – R$ 182,40')
  })

  it('pontos por forma: recorrente (anel), planejado, provento, entrada, saída e transferência', () => {
    for (const k of ['pt entrada in', 'pt saida', 'pt recorrente', 'pt planejado', 'pt provento in', 'pt transferencia']) {
      expect(html).toContain(k)
    }
  })

  it('saldos: o do mês é entradas menos saídas (sem transferência, sem previstos), com a projeção do hub', () => {
    expect(html).toContain('R$ 3.818')
    expect(html).toContain('R$ 5.000')
    expect(html).toContain('R$ 1.182')
    expect(html).toContain('R$ 2.120')
    expect(html).toContain('R$ 1.820,00 a sair · R$ 4.228,40 a entrar')
  })

  it('painel do dia com os itens, o saldo do mês até aqui e as duas ações', () => {
    expect(html).toContain('Mercado Central')
    expect(html).toContain('Saída · Mercado')
    expect(html).toContain('Saldo do mês até aqui')
    expect(html).toContain('+ Transação neste dia')
    expect(html).toContain('+ Evento planejado')
  })

  it('moeda com NBSP e sem as palavras proibidas', () => {
    expect(renderRaw(base(false))).toContain('R$ ')
    expect(html).not.toMatch(PROIBIDAS)
  })
})

describe('dia futuro, provento e recorrente', () => {
  it('dia futuro diz que é projeção e usa o saldo previsto', () => {
    const html = render(base(false, { sel: '2026-10-24' }))
    expect(html).toContain('pill-q proj')
    expect(html).toContain('É projeção')
    expect(html).toContain('Saldo previsto do mês até aqui')
    expect(html).toContain('Revisão do carro')
    expect(html).toContain('Planejado · Transporte · em Planejamento')
  })

  it('provento de 06 Patrimônio traz a origem na linha', () => {
    const html = render(base(false, { sel: '2026-10-15' }))
    expect(html).toContain('Provento MXRF11')
    expect(html).toContain('Provento previsto · vem de 06 Patrimônio')
  })

  it('a ocorrência de recorrente sem lançamento leva a Recorrentes (link, não botão)', () => {
    const html = render(base(false, { sel: '2026-10-06' }))
    expect(html).toContain('href="/financas/recorrentes"')
    expect(html).toContain('Recorrente · Moradia · editar em Recorrentes')
  })

  it('dia passado deixa o evento planejado desligado e explica', () => {
    const html = render(base(false, { sel: '2026-10-01' }))
    expect(html).toContain('pill-q">Passado')
    expect(html).toContain('disabled')
    expect(html).toContain('Eventos planejados só de hoje em diante.')
  })

  it('dia sem nada marcado fala isso e mantém as ações', () => {
    const html = render(base(false, { sel: '2026-10-09' }))
    expect(html).toContain('Nada marcado em 9 de outubro.')
    expect(html).toContain('+ Transação neste dia')
  })
})

describe('CalendarioView mobile', () => {
  const html = render(base(true))

  it('markup próprio: grade compacta, números em 2×2 e lista do dia abaixo', () => {
    for (const c of ['gsec', 'class="q"', 'dpanel', 'class="dow"', '>Sem.<', '>D<']) expect(html).toContain(c)
    expect(html).not.toContain('grade-col')
    expect(html).not.toContain('class="cal ')
    expect(html).toContain('Transf.')
    expect(html).toContain('Sem. = saldo da semana')
    expect(html).not.toMatch(PROIBIDAS)
  })

  it('saldo curto com k a partir de mil', () => {
    expect(html).toContain('+3,8k')
  })
})

describe('estados', () => {
  it('carregando: esqueleto da grade, números em traço e painel do dia vazio', () => {
    const html = render(base(false, { loading: true, itens: [] }))
    expect(html).toContain('cal-esq')
    expect(html).not.toContain('class="grade"')
    expect(html).not.toContain('+ Transação neste dia')
    expect(html).toMatch(/id="nSaldo">–</)
  })
  it('erro: ou o mês inteiro, ou o erro, com Tentar de novo', () => {
    const html = render(base(false, { erro: true, itens: [] }))
    expect(html).toContain('Não deu para carregar o calendário.')
    expect(html).toContain('Tentar de novo')
    expect(html).not.toContain('class="grade"')
  })
  it('mês sem nada marcado: grade desenhada, projeção em traço fora da curva e convite', () => {
    const nov = { ano: 2027, mes: 11 }
    const html = render(base(false, { mes: nov, sel: '2027-11-01', itens: [], projecao: null }))
    expect(html).toContain('class="grade"')
    expect(html).toContain('Nada marcado em novembro ainda.')
    expect(html).toContain('além da curva de 12 meses')
    expect(html).toContain('Saldo previsto')
  })
  it('mês passado: saldo do mês e projeção indisponível', () => {
    const html = render(base(false, { mes: { ano: 2026, mes: 9 }, sel: '2026-09-01', itens: [], projecao: null }))
    expect(html).toContain('Saldo do mês')
    expect(html).toContain('mês já fechado')
  })
})
