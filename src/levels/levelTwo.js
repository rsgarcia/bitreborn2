export const LEVEL_TWO = {
  width: 2600,
  height: 600,
  player: {
    x: 60,
    y: 480
  },
  platforms: [
    { x: 0, y: 530, width: 360, height: 18 },
    { x: 430, y: 500, width: 180, height: 18 },
    { x: 700, y: 430, width: 220, height: 18 },
    { x: 1010, y: 360, width: 170, height: 18 },
    { x: 1220, y: 285, width: 220, height: 18 },
    { x: 1520, y: 390, width: 190, height: 18 },
    { x: 1780, y: 315, width: 180, height: 18 },
    { x: 2020, y: 240, width: 210, height: 18 },
    { x: 2300, y: 355, width: 230, height: 18 }
  ],
  deathFloor: {
    x: 0,
    y: 558,
    width: 2600,
    height: 42
  },
  pendrive: {
    x: 2048,
    y: 198,
    label: 'CONST'
  },
  terminal: {
    x: 2425,
    y: 299
  }
};

export const CONSTANT_CONCEPT_LINES = [
  { text: 'CONCEITO: CONSTANTE', color: '#00ffdc', size: 44 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: 'Uma constante armazena um valor que não deve mudar durante o programa.', color: '#c8f0ff', size: 20 },
  { text: 'Ela ajuda a estabilizar regras importantes do sistema.', color: '#c8f0ff', size: 20 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: 'Exemplo em JavaScript:', color: '#00ff50', size: 20 },
  { text: '    const MAX_ENERGIA = 100', color: '#00ffdc', size: 20 },
  { text: '    const VIDAS_INICIAIS = 2', color: '#00ffdc', size: 20 },
  { text: '    const GASTO_POR_SEGUNDO = 3', color: '#00ffdc', size: 20 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: 'Constantes tornam regras fixas mais claras e seguras.', color: '#ffdc00', size: 20 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: '[ ENTER para o desafio ]', color: '#00ff50', size: 28 }
];

export const CONSTANT_CHALLENGE = {
  title: 'Complete o código — Constantes',
  desc: 'Para liberar o acesso à terceira fase você deve preencher as lacunas com as informações corretas:',
  instructions: [
    '1ª lacuna: Qual a palavra reservada da linguagem JavaScript usada para criar uma constante?',
    '2ª lacuna: Defina o valor de 2 para a constante VIDAS_INICIAIS.'
  ],
  header: '  DESAFIO — COMPLETE O CÓDIGO (Fase 2: Constantes)',
  lines: [
    '// Fase 2: constantes do sistema',
    '_____ MAX_ENERGIA = 100;',
    'const VIDAS_INICIAIS = _____;',
    'const GASTO_POR_SEGUNDO = 3;'
  ],
  blanks: [
    { line: 1, answer: 'const' },
    { line: 2, answer: '2' }
  ]
};

export const PHASE_TWO_FEEDBACK = {
  skillTitle: 'ESTABILIZAR VALORES DO SISTEMA',
  streamProgress: 2,
  total: 6,
  summary: 'Constantes aprendidas. Próxima: Expressões.',
  nextScene: 'LevelThreeScene',
  continueText: '[ ENTER para iniciar a Fase 3 ]'
};
