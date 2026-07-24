// Dados mockados da POC DS v5 (rodada 1).
// Fonte única: os 4 protótipos leem daqui pra comparação entre direções ser justa.
window.SL_MOCK = {
  score: { value: 78, delta: 4, label: 'Life Sync Score' },
  financas: {
    receitas: 5000, despesas: 3160, saldoLivre: 1840,
    poupancaPct: 37, metaPoupancaPct: 30,
    sparkSaldo: [42, 48, 45, 52, 58, 54, 61, 66, 63, 71, 74, 78],
  },
  transacoes: [
    { d: '23 jul', desc: 'Mercado Central', cat: 'Mercado', valor: -182.4 },
    { d: '22 jul', desc: 'Freela landing page', cat: 'Renda extra', valor: 850 },
    { d: '22 jul', desc: 'Aporte CDB', cat: 'Investimento', valor: -300 },
    { d: '21 jul', desc: 'Farmácia', cat: 'Saúde', valor: -64.9 },
    { d: '20 jul', desc: 'Salário', cat: 'Renda', valor: 4150 },
    { d: '19 jul', desc: 'Restaurante japonês', cat: 'Lazer', valor: -128 },
    { d: '18 jul', desc: 'Uber', cat: 'Transporte', valor: -24.9 },
    { d: '18 jul', desc: 'Livraria', cat: 'Lazer', valor: -59.9 },
  ],
  gastosPorCategoria: [
    { nome: 'Moradia', valor: 1240 },
    { nome: 'Mercado', valor: 520 },
    { nome: 'Lazer', valor: 410 },
    { nome: 'Transporte', valor: 310 },
    { nome: 'Saúde', valor: 180 },
  ],
  modulos: [
    { n: '01', nome: 'Finanças' }, { n: '02', nome: 'Tempo' }, { n: '03', nome: 'Corpo' },
    { n: '04', nome: 'Mente' }, { n: '05', nome: 'Patrimônio' }, { n: '06', nome: 'Carreira' },
    { n: '07', nome: 'Experiências' }, { n: '08', nome: 'Conquistas' }, { n: '09', nome: 'Futuro' },
    { n: '10', nome: 'Panorama' }, { n: '11', nome: 'Configurações' },
  ],
  orcamentos: [
    { nome: 'Moradia', gasto: 1240, limite: 1800 },
    { nome: 'Mercado', gasto: 520, limite: 650 },
    { nome: 'Lazer', gasto: 410, limite: 420 },
  ],
  agenda: [
    { hora: '09:00', titulo: 'Revisão de aportes', modulo: 'Finanças' },
    { hora: '12:30', titulo: 'Treino B, inferior', modulo: 'Corpo' },
    { hora: '19:00', titulo: 'Aula de espanhol', modulo: 'Mente' },
  ],
  coach: {
    dashboardA: 'Julho rendeu 4 pontos: foco protegido nas manhãs e aporte antecipado. Falta fechar o lazer, estourou 2%.',
    dashboardC: 'Seu mês está 4 pontos melhor que junho. O segredo foi proteger as manhãs. Hoje só falta olhar o lazer: estourou R$ 8.',
    cross: 'Semanas com foco protegido renderam R$ 380 a mais em aportes.',
    financasA: 'Receitas cresceram 8% e o lazer estourou R$ 8. Se segurar o lazer essa semana, o mês fecha com 39% poupado.',
    financasC: 'Suas contas cabem numa frase: entrou mais, saiu quase igual, sobrou R$ 1.840. O lazer pede um olho hoje.',
    briefing: 'Julho está 4 pontos acima de junho. As manhãs protegidas seguraram o foco, o aporte antecipado rendeu antes da média e o único ponto solto é o orçamento de lazer, que passou do limite por R$ 8. Um ajuste pequeno hoje evita um corte grande na semana que vem.',
    acoes: [
      { titulo: 'Revisar o orçamento de lazer', modulo: 'Finanças', impacto: 'fecha o mês em 39% poupado' },
      { titulo: 'Confirmar o treino de amanhã', modulo: 'Corpo', impacto: 'mantém a sequência de 3 semanas' },
      { titulo: 'Bloquear 2h de foco na sexta', modulo: 'Tempo', impacto: 'historicamente vale R$ 380 em aportes' },
    ],
    whispers: [
      { hora: '07:12', texto: 'Briefing do dia enviado.' },
      { hora: 'ontem', texto: 'Aporte de R$ 300 confirmado, 2 dias antes do planejado.' },
      { hora: 'seg', texto: 'Semana começou com as manhãs livres de reunião. Bom sinal.' },
    ],
  },
  fmtBRL(n) { return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
  fmtBRL0(n) { return 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 }); },
};
