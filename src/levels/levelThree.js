export const LEVEL_THREE = {
  width: 2800,
  height: 600,
  player: {
    x: 60,
    y: 480
  },
  platforms: [
    { x: 0, y: 530, width: 360, height: 18, fixed: true },
    { x: 430, y: 500, width: 180, height: 18, phase: 0.2 },
    { x: 680, y: 445, width: 200, height: 18, phase: 1.4 },
    { x: 940, y: 390, width: 190, height: 18, phase: 2.6 },
    { x: 1190, y: 335, width: 210, height: 18, phase: 0.9 },
    { x: 1460, y: 405, width: 210, height: 18, phase: 2.1 },
    { x: 1720, y: 345, width: 190, height: 18, phase: 3.2 },
    { x: 1970, y: 285, width: 210, height: 18, phase: 1.2 },
    { x: 2240, y: 360, width: 200, height: 18, phase: 2.4 },
    { x: 2500, y: 430, width: 260, height: 18, phase: 0.4 }
  ],
  deathFloor: {
    x: 360,
    y: 558,
    width: 2440,
    height: 42
  },
  startTerminal: {
    x: 94,
    y: 474
  },
  pendrive: {
    x: 2292,
    y: 318,
    label: 'EXP'
  },
  terminal: {
    x: 2630,
    y: 374
  }
};

export const EXPRESSION_CONCEPT_LINES = [
  { text: 'CONCEITO: EXPRESSÕES ARITMÉTICAS', color: '#00ffdc', size: 38 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: 'Uma expressão aritmética combina números, variáveis e operadores.', color: '#c8f0ff', size: 20 },
  { text: 'Ela produz um valor que pode construir partes do mapa.', color: '#c8f0ff', size: 20 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: 'Na próxima fase, tudo usa a mesma unidade: bits.', color: '#00ff50', size: 20 },
  { text: '    distância = 960 bits', color: '#00ffdc', size: 20 },
  { text: '    tamanho da plataforma = 160 bits', color: '#00ffdc', size: 20 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: 'A expressão distância / tamanho descobre quantas plataformas gerar.', color: '#ffdc00', size: 20 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: '[ ENTER para o desafio ]', color: '#00ff50', size: 28 }
];

export const EXPRESSION_CHALLENGE = {
  title: 'Complete o código — Expressões Aritméticas',
  desc: 'Prepare a fórmula que será usada para construir a ponte da próxima fase:',
  instructions: [
    '1ª lacuna: Calcule quantas plataformas são necessárias usando a mesma unidade: bits.',
    '2ª lacuna: Informe o resultado da expressão 960 / 160.'
  ],
  header: '  DESAFIO — COMPLETE O CÓDIGO (Fase 3: Expressões)',
  lines: [
    '// Fase 4: ponte calculada em bits',
    'const distancia = 960;',
    'const tamanhoPlataforma = 160;',
    'const quantidade = _____;',
    'const ponteCompleta = quantidade === _____;',
    'const plataforma = true;'
  ],
  blanks: [
    { line: 3, answer: 'distancia/tamanhoPlataforma', answers: ['distancia/tamanhoPlataforma', '960/160'] },
    { line: 4, answer: '6' }
  ]
};

export const PHASE_THREE_FEEDBACK = {
  skillTitle: 'CALCULAR ROTAS DO SISTEMA',
  streamProgress: 3,
  total: 6,
  summary: 'Expressão de ponte aprendida. Próxima: construir a rota.',
  nextScene: 'LevelFourScene',
  continueText: '[ ENTER para iniciar a Fase 4 ]'
};
