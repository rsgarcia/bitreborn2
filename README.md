# BitReborn 2

Projeto base para um jogo de plataforma em Phaser.

Esta versao porta a demo em Pygame `bitreborn_demosonet.py` para a estrutura Phaser do projeto.

## Controles

- `A/D` ou setas: mover o heroi.
- `W` ou `Espaco`: pular.
- `E`: interagir com o computador no final da fase.
- `Enter`: avancar telas de introducao, conceito, desafio e feedback.
- Durante o desafio: digite a resposta do campo ativo e pressione `Enter`.

Na primeira fase, o heroi atravessa plataformas binarias, evita espinhos, coleta o pendrive `VAR`, insere o pendrive no computador final e resolve um desafio sobre variaveis.

Ao vencer a primeira fase, o heroi desbloqueia a segunda fase com 2 coracoes e uma barra de energia de 100 pontos. A energia consome 3 pontos por segundo e nao recarrega quando o jogador toma dano. A fase 2 apresenta um novo percurso sobre constantes, com plataformas binarias, chao corrompido mortal, coleta do pendrive `CONST`, uso do computador final e desafio sobre valores fixos em JavaScript. Ao perder os 2 coracoes, o jogo volta ao menu.

Ao vencer a segunda fase, o heroi desbloqueia a terceira fase. A plataforma inicial e fixa e possui um terminal que estabiliza as demais plataformas com `const plataforma = true`; antes disso, elas alternam entre visiveis com colisao e invisiveis sem colisao. No final da fase, o pendrive `EXP` libera o terminal de expressoes aritmeticas conectadas ao calculo de plataformas.

Ao vencer a terceira fase, o heroi desbloqueia a quarta fase. O jogador acessa o terminal inicial para calcular `distancia / tamanhoPlataforma`, usando bits como unidade comum, e gerar as plataformas necessarias para alcancar o pendrive `CALC` e o terminal final. O chao corrompido abaixo do percurso causa dano.

## Scripts

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera a versao de producao em `dist/`.
- `npm run preview`: abre uma previa local do build.

## Estrutura

- `src/main.js`: ponto de entrada do jogo.
- `src/config/gameConfig.js`: configuracao global do Phaser.
- `src/scenes/`: cenas principais do jogo.
- `src/entities/`: personagem, pendrive, terminal e objetos interativos.
- `src/systems/`: fundo cyberpunk, particulas e sistemas compartilhados.
- `src/levels/`: dados da fase, texto de introducao, conceito e desafio.
- `src/assets/`: imagens, audio, tilemaps e tilesets.

As proximas especificacoes do jogo podem ser adicionadas sobre esta base.
