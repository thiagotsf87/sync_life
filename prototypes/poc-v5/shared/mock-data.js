// Dados mockados da POC DS v5 (rodada 1).
// Fonte única: os 4 protótipos leem daqui pra comparação entre direções ser justa.
window.SL_MOCK = {
  score: { value: 78, delta: 4, label: 'Life Sync Score' },
  financas: {
    receitas: 5000, despesas: 3160, saldoLivre: 1840,
    poupancaPct: 37, metaPoupancaPct: 30,
    sparkSaldo: [42, 48, 45, 52, 58, 54, 61, 66, 63, 71, 74, 78],
  },
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
  },
  fmtBRL(n) { return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
  fmtBRL0(n) { return 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 }); },
};
