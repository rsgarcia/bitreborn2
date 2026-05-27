export const LEVEL_ONE = {
  width: 2400,
  height: 600,
  player: {
    x: 60,
    y: 500
  },
  platforms: [
    { x: 0, y: 560, width: 2400, height: 40 },
    { x: 180, y: 430, width: 180, height: 18 },
    { x: 420, y: 360, width: 160, height: 18 },
    { x: 620, y: 270, width: 200, height: 18 },
    { x: 870, y: 380, width: 160, height: 18 },
    { x: 1060, y: 300, width: 180, height: 18 },
    { x: 1260, y: 220, width: 200, height: 18 },
    { x: 1480, y: 320, width: 160, height: 18 },
    { x: 1680, y: 240, width: 200, height: 18 },
    { x: 1900, y: 180, width: 220, height: 18 },
    { x: 2080, y: 300, width: 220, height: 18 }
  ],
  spikes: [
    { x: 340, y: 544, width: 60, height: 16 },
    { x: 780, y: 544, width: 60, height: 16 },
    { x: 1150, y: 544, width: 60, height: 16 },
    { x: 1600, y: 544, width: 60, height: 16 }
  ],
  pendrive: {
    x: 2096,
    y: 262
  },
  terminal: {
    x: 2240,
    y: 244
  }
};

export const INTRO_LINES = [
  'Para voltar à sua realidade, você precisa APRENDER A PROGRAMAR EM JAVASCRIPT.',
  'construa o stream de retorno. Volte para casa.',
  '',
  '[ ENTER para começar a Fase 1 ]'
];

export const CONCEPT_LINES = [
  { text: 'CONCEITO: VARIÁVEL', color: '#00ffdc', size: 44 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: 'Uma variável é um espaço na memória que armazena um dado.', color: '#c8f0ff', size: 20 },
  { text: 'Esse dado pode mudar durante a execução do programa.', color: '#c8f0ff', size: 20 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: 'Exemplo em JavaScript:', color: '#00ff50', size: 20 },
  { text: '    let vidas = 2         // variável do tipo number', color: '#00ffdc', size: 20 },
  { text: '    let energia = 100     // variável do tipo number', color: '#00ffdc', size: 20 },
  { text: '    let ativo = true      // variável do tipo boolean', color: '#00ffdc', size: 20 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: 'Variáveis têm: nome, tipo e valor.', color: '#ffdc00', size: 20 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: '[ ENTER para o desafio ]', color: '#00ff50', size: 28 }
];

export const VARIABLE_CHALLENGE = {
  title: 'Complete o código — Variáveis',
  desc: 'Para liberar o acesso à segunda fase você deve preencher as lacunas com as informações corretas:',
  instructions: [
    '1ª lacuna: Qual a palavra reservada da linguagem JavaScript usada para criar uma variável?',
    '2ª lacuna: Defina o valor de 100 para a variável energia.'
  ],
  lines: [
    '// Fase 1: declaração de variáveis',
    '_____ vidas = 2;',
    'let energia = _____;'
  ],
  blanks: [
    { line: 1, answer: 'let' },
    { line: 2, answer: '100' }
  ]
};

export const PHASE_ONE_FEEDBACK = {
  skillTitle: 'ARMAZENAR ENERGIA DIGITAL',
  streamProgress: 1,
  total: 6,
  summary: 'Variáveis aprendidas. Próxima: Constantes.',
  nextScene: 'LevelTwoScene',
  continueText: '[ ENTER para iniciar a Fase 2 ]'
};
