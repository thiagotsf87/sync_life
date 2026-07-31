// Dados mockados do DS v5 (Onda 0+). Fonte única de todos os protótipos v5.
// Evolução de prototypes/poc-v5/shared/mock-data.js com a numeração CANÔNICA (§5.2 do DS):
// as 8 áreas são pontos cardeais da bússola; Panorama/Conquistas/Configurações não são áreas.
window.SL_MOCK = {
  score: { value: 78, delta: 4, label: 'Life Sync Score' }, // global vem do engine (ponderado), não é média das dims

  // ordem canônica das áreas (LEI, §5.2): 01 Finanças no norte, horário até 08 Experiências
  areas: [
    { n: '01', nome: 'Finanças', foco: 'segurar o lazer até sexta' },
    { n: '02', nome: 'Futuro', foco: 'antecipar o aporte da Itália' },
    { n: '03', nome: 'Tempo', foco: 'proteger o bloco de foco de amanhã' },
    { n: '04', nome: 'Corpo', foco: 'hoje é dia de treino, 3 de 7 na semana' },
    { n: '05', nome: 'Mente', foco: '20 minutos de leitura antes de dormir' },
    { n: '06', nome: 'Patrimônio', foco: 'reinvestir os proventos de julho' },
    { n: '07', nome: 'Carreira', foco: 'preparar a 1:1 de terça' },
    { n: '08', nome: 'Experiências', foco: 'fechar o roteiro de Positano' },
  ],
  // telas que não são áreas da bússola (não entram na numeração 01-08)
  extras: ['Panorama', 'Coach IA', 'Conquistas', 'Configurações'],

  // áreas que o usuário ativou no onboarding (fonte: profiles.active_modules)
  ativas: ['01', '02', '04', '08'],

  diario: {
    edicao: 208,
    saudacao: 'Boa tarde, Thiago.',
    sub: 'Julho está 83% executado e a poupança segue acima da meta. Uma única atenção hoje: o lazer chegou perto do teto.',
    checkin: {
      done: false,
      opcoes: ['Péssimo', 'Ruim', 'Neutro', 'Bem', 'Ótimo'],
      doneAs: 'Registrado às 21:14',
      doneMood: 'Bem',
      doneNote: 'Dia produtivo, treino feito.',
    },
    // t = hora OU valor (money:true); due = vence em até 3 dias
    hoje: [
      { t: '07:30', tx: 'Fisioterapia' },
      { t: 'R$ 1.200,00', tx: 'Aluguel', tag: 'EM 3 DIAS', due: true, money: true },
      { t: 'TER 10:00', tx: '1:1 com gestor' },
      { t: 'R$ 580,00', tx: 'Aporte automático', tag: 'QUA', money: true },
      { t: 'SEX 20:00', tx: 'Jantar com Ana' },
      { t: 'R$ 89,90', tx: 'Internet', tag: 'EM 5 DIAS', money: true },
    ],
  },

  // scores por área (ordem canônica; ativas ganham linha rica no Diário; manter n/nome em sincronia com areas)
  dims: [
    { n: '01', nome: 'Finanças',     meta: 'Saldo R$ 1.840 · lazer no limite', score: 82, tr: 2 },
    { n: '02', nome: 'Futuro',       meta: '3 metas · 61% de média',           score: 74, tr: 1 },
    { n: '03', nome: 'Tempo',        meta: '9 eventos · 5/7 dias com foco',    score: 71, tr: 0 },
    { n: '04', nome: 'Corpo',        meta: '3 atividades · 126 min',           score: 64, tr: 3 },
    { n: '05', nome: 'Mente',        meta: '2 sessões de leitura',             score: 58, tr: -1 },
    { n: '06', nome: 'Patrimônio',   meta: 'R$ 48,2k · +7% no ano',            score: 76, tr: 1 },
    { n: '07', nome: 'Carreira',     meta: 'Roadmap 3/5 marcos',               score: 69, tr: 1 },
    { n: '08', nome: 'Experiências', meta: 'Itália em 92 dias',                score: 80, tr: 0 },
  ],

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
    briefing: 'Julho está 4 pontos acima de junho. As manhãs protegidas seguraram o foco, o aporte antecipado rendeu antes da média e o único ponto solto é o orçamento de lazer, que passou do limite por R$ 8. Um ajuste pequeno hoje evita um corte grande na semana que vem.',
    cross: 'Semanas com foco protegido renderam R$ 380 a mais em aportes.',
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
    saudacaoCamada: 'Já li o seu dia. O que você quer saber?',
    sugestoes: [
      'Quanto ainda posso gastar em lazer?',
      'Resumo da minha semana',
      'Simular: e se eu poupar R$ 800?',
    ],
    thread: [
      { de: 'u', msg: 'Quanto ainda posso gastar em lazer esse mês?' },
      { de: 'a', msg: 'Quase nada: R$ 10 até quinta. Você usou R$ 410 dos R$ 420 do orçamento, e o cinema de ontem (R$ 64) foi o que encostou no teto. A boa notícia: o fechamento projeta R$ 2.120.', fontes: 'Fontes: orçamento Lazer · 34 transações · projeção do mês' },
      { de: 'u', msg: 'Então antecipa o aporte da Itália pra hoje.' },
      { de: 'acao', msg: 'Transferência de R$ 580 pra Viagem Itália agendada pra hoje, 16:00. A meta vai a 70% e o saldo projetado segue positivo em R$ 1.540.', done: 'Confirmado por você · 14:04' },
    ],
  },
  fmtBRL(n) { return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
  fmtBRL0(n) { return 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 }); },
};
