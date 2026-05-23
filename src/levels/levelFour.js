export const LEVEL_FOUR = {
  width: 1960,
  height: 600,
  player: {
    x: 60,
    y: 480
  },
  startPlatform: {
    x: 0,
    y: 530,
    width: 360,
    height: 18
  },
  bridge: {
    x: 420,
    y: 470,
    distance: 960,
    platformSize: 160,
    platformHeight: 18
  },
  endPlatform: {
    x: 1440,
    y: 470,
    width: 360,
    height: 18
  },
  deathFloor: {
    x: 360,
    y: 558,
    width: 1600,
    height: 42
  },
  startTerminal: {
    x: 94,
    y: 474
  },
  pendrive: {
    x: 1538,
    y: 428,
    label: 'CALC'
  },
  terminal: {
    x: 1690,
    y: 414
  }
};

export const LEVEL_FOUR_COMPLETE_LINES = [
  { text: 'ROTA CALCULADA', color: '#00ffdc', size: 44 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: 'A distância e o tamanho da plataforma usaram a mesma unidade: bits.', color: '#c8f0ff', size: 20 },
  { text: 'distância = 960 bits', color: '#00ffdc', size: 20 },
  { text: 'tamanhoPlataforma = 160 bits', color: '#00ffdc', size: 20 },
  { text: 'quantidade = distância / tamanhoPlataforma = 6', color: '#ffdc00', size: 20 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: 'Expressões aritméticas agora controlam a construção do mapa.', color: '#00ff50', size: 20 },
  { text: '', color: '#c8f0ff', size: 20 },
  { text: '[ ENTER para continuar ]', color: '#00ff50', size: 28 }
];

export const PHASE_FOUR_FEEDBACK = {
  skillTitle: 'CONSTRUIR PONTES COM EXPRESSÕES',
  streamProgress: 4,
  total: 6,
  summary: 'A rota foi calculada e materializada em plataformas.',
  nextScene: 'GameScene',
  continueText: '[ ENTER para voltar ao menu ]'
};
