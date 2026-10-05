import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'
import { PlanejamentoView } from './PlanejamentoView'
import type { PlanejamentoV5Data, EventoLinha } from '@/hooks/use-planejamento-v5'
import {
  analisar, curvaSaldo, datasLab, efeitosLab, projetar, type EntradaProjecao, type EventoPlan,
} from '@/lib/financas/planejamento'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a>,
}))

const HOJE = '2026-10-03'
const ev = (id: string, tipo: 'in' | 'out', valor: number, data: string, nome: string, extra: Partial<EventoPlan> = {}): EventoPlan => ({
  id, nome, tipo, valor, data, confirmado: false, categoria: null, nota: null, ...extra,
})

const eventos: EventoPlan[] = [
  ev('p8', 'out', 620, '2026-10-24', 'Revisão do carro', { categoria: 'Transporte' }),
  ev('p1', 'in', 2075, '2026-11-20', '13º salário, 1ª parcela', { confirmado: true }),
  ev('p5', 'out', 3200, '2027-01-12', 'Gastos na Itália'),
  ev('p7', 'out', 4500, '2027-03-15', 'Troca do notebook', { nota: 'meta Notebook novo' }),
]

const entrada: EntradaProjecao = {
  hoje: HOJE,
  saldoHoje: 1840,
  recorrentes: [
    { nome: 'Salário', tipo: 'income', valor: 4150, frequencia: 'monthly', inicio: '2026-01-01', fim: null },
    { nome: 'Aluguel', tipo: 'expense', valor: 1800, frequencia: 'monthly', inicio: '2026-01-01', fim: null },
  ],
  rendaVariavel: 600,
  gastoVariavel: 880,
  eventos,
}

function dados(extra: Partial<PlanejamentoV5Data> = {}): PlanejamentoV5Data {
  const serie = projetar(entrada, 'realista')
  const lab = eventos[3]
  const datas = datasLab(lab, HOJE)
  const meta = { nome: 'Itália', data: '2027-01-20' }
  const linhas: EventoLinha[] = eventos.map(e => ({
    id: e.id, nome: e.nome, tipo: e.tipo, valor: e.valor, data: e.data, categoria: e.categoria, nota: e.nota,
    confirmado: e.confirmado, previa: false, fora: false, original: null,
  }))
  return {
    carregando: false,
    erro: null,
    recarregar: () => {},
    hoje: HOJE,
    saldoHoje: 1840,
    cenario: 'realista',
    setCenario: () => {},
    serie,
    analise: analisar(serie, entrada),
    geo: curvaSaldo(serie, 1840),
    eventos: linhas,
    entradas: 2075,
    saidas: 8320,
    lab: {
      evento: lab,
      opcoes: [
        { id: 'antecipar', rotulo: 'Antecipar para dezembro', data: datas.antecipar as string },
        { id: 'manter', rotulo: 'Manter em março', data: datas.manter as string },
        { id: 'adiar', rotulo: 'Adiar para junho', data: datas.adiar as string },
      ],
      efeitos: {
        antecipar: efeitosLab(entrada, lab, datas.antecipar as string, meta),
        manter: efeitosLab(entrada, lab, datas.manter as string, meta),
        adiar: efeitosLab(entrada, lab, datas.adiar as string, meta),
      },
      meta,
    },
    labSel: 'manter',
    setLabSel: () => {},
    previa: null,
    aplicarPrevia: () => {},
    desfazerPrevia: () => {},
    fontes: { eventos: 4, recorrentes: 2, janela: 'julho a setembro', atualizadoAs: '7h12' },
    ehPro: true,
    aviso: '',
    avisar: () => {},
    confirmar: async () => {},
    aposSalvar: () => {},
    ultimaSinc: '14:05',
    ...extra,
  }
}

const render = (d: PlanejamentoV5Data, mob: boolean) =>
  renderToString(<PlanejamentoView d={d} mob={mob} abrirCoach={() => {}} onNovo={() => {}} onEditar={() => {}} />).replace(/<!-- -->/g, '')

const PROIBIDAS = /edição|folha|manchete|colofão|jornal|byline|redação|diário|coach|assessor|o Sy|ao Sy|do Sy|—/i

describe('PlanejamentoView desktop', () => {
  const html = render(dados(), false)

  it('traz as classes-chave do protótipo', () => {
    for (const c of ['objeto', 'cenarios', 'principal', 'big num', 'mini', 'curva-head', 'chart', 'eixo', 'prosa', 'lab', 'opcoes', 'imp', 'eventos', 'evrow', 'lista-foot']) {
      expect(html).toContain(c)
    }
    expect(html).toContain('Planejamento · próximos 12 meses')
    expect(html).toContain('Pessimista')
    expect(html).toContain('Realista')
    expect(html).toContain('Otimista')
    expect(html).toContain('Falar com Sy sobre o planejamento')
  })

  it('o laboratório sai do evento de despesa de maior valor, com 3 opções e 3 efeitos reais', () => {
    expect(html).toContain('Quando pagar Troca do notebook?')
    expect(html).toContain('Antecipar para dezembro')
    expect(html).toContain('Manter em março')
    expect(html).toContain('Adiar para junho')
    expect(html).toContain('Ponto mais baixo')
    expect(html).toContain('Saldo na meta Itália')
    expect(html).toContain('Quando acontece')
    expect(html).toContain('Experimentar nesta projeção')
    expect(html).toContain('De onde vêm esses efeitos?')
  })

  it('eventos com Confirmar só nos previstos, Editar em todos, selo Confirmado', () => {
    expect(html).toContain('Revisão do carro')
    expect(html).toContain('Confirmado')
    expect((html.match(/>Confirmar</g) ?? []).length).toBe(3)
    expect((html.match(/>Editar</g) ?? []).length).toBe(4)
    expect(html).toContain('+&nbsp;R$&nbsp;2.075,00'.replace(/&nbsp;/g, ' '))
  })

  it('moeda com NBSP e sem as palavras proibidas', () => {
    expect(html).toContain('R$ ')
    expect(html).not.toMatch(PROIBIDAS)
  })

  it('o tooltip e a leitura mobile não aparecem sem interação', () => {
    expect(html).not.toContain('class="tip')
    expect(html).not.toContain('class="leitura')
  })
})

describe('PlanejamentoView mobile', () => {
  const html = render(dados(), true)

  it('markup próprio: linha de leitura, eventos tocáveis e sem tooltip', () => {
    expect(html).toContain('class="leitura"')
    expect(html).toContain('Toque num mês da curva')
    expect(html).toContain('role="button"')
    expect(html).toContain('class="dica"')
    expect(html).not.toContain('curva-head')
    expect(html).not.toContain('class="rot"')
    expect(html).not.toMatch(PROIBIDAS)
  })
})

describe('estados', () => {
  it('carregando mostra o esqueleto e nenhum número', () => {
    const html = render(dados({ carregando: true, analise: null, geo: null }), false)
    expect(html).toContain('pl-esq')
    expect(html).not.toContain('class="principal')
  })
  it('erro tem Tentar de novo', () => {
    const html = render(dados({ erro: 'x' }), false)
    expect(html).toContain('Tentar de novo')
  })
  it('sem laboratório (nenhum evento de despesa alto) a seção não existe', () => {
    const html = render(dados({ lab: null }), false)
    expect(html).not.toContain('Uma escolha, mais de um efeito')
    expect(html).not.toContain('class="lab')
  })
  it('sem eventos mostra o vazio honesto com o convite', () => {
    const html = render(dados({ eventos: [], entradas: 0, saidas: 0, lab: null }), false)
    expect(html).toContain('Nada planejado para os próximos 12 meses')
    expect(html).toContain('Planejar um evento')
  })
  it('FREE apaga a curva depois de abril e convida para o PRO', () => {
    const html = render(dados({ ehPro: false }), false)
    expect(html).toContain('Projeção de 12 meses no PRO')
    expect(render(dados({ ehPro: true }), false)).not.toContain('Projeção de 12 meses no PRO')
  })
  it('prévia aparece como pílula e selo na linha do evento', () => {
    const d = dados({ previa: 'adiar', labSel: 'adiar' })
    d.eventos = d.eventos.map(e => (e.id === 'p7' ? { ...e, previa: true } : e))
    const html = render(d, false)
    expect(html).toContain('pill-q prev')
    expect(html).toContain('etq prev')
    expect(html).toContain('Desfazer')
  })
})
