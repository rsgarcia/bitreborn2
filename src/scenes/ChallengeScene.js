import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';
import { VARIABLE_CHALLENGE } from '../levels/levelOne.js';

export class ChallengeScene extends Phaser.Scene {
  constructor() {
    super('ChallengeScene');
  }

  create() {
    this.challenge = this.registry.get('challengeData') ?? VARIABLE_CHALLENGE;
    this.current = 0;
    this.inputs = this.challenge.blanks.map(() => '');
    this.inputActive = '';
    this.done = false;
    this.correct = null;

    this.input.keyboard.on('keydown', this.handleKeyDown, this);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', this.handleKeyDown, this);
    });
    this.render();
  }

  handleKeyDown(event) {
    if (this.done) {
      if (event.key === 'Enter') {
        if (this.correct) {
          this.scene.start('FeedbackScene');
        } else {
          this.current = 0;
          this.inputs = this.challenge.blanks.map(() => '');
          this.inputActive = '';
          this.done = false;
          this.correct = null;
          this.render();
        }
      }
      return;
    }

    if (event.key === 'Backspace') {
      this.inputActive = this.inputActive.slice(0, -1);
      this.render();
      return;
    }

    if (event.key === 'Enter') {
      this.submitCurrentInput();
      return;
    }

    if (event.key.length === 1 && this.inputActive.length < 40) {
      this.inputActive += event.key;
      this.render();
    }
  }

  submitCurrentInput() {
    const blank = this.challenge.blanks[this.current];
    const value = this.inputActive.trim();
    this.inputs[this.current] = value;

    const answers = blank.answers ?? [blank.answer];
    if (answers.some((answer) => this.normalizeAnswer(value) === this.normalizeAnswer(answer))) {
      if (this.current + 1 < this.challenge.blanks.length) {
        this.current += 1;
        this.inputActive = '';
      } else {
        this.done = true;
        this.correct = true;
      }
    } else {
      this.done = true;
      this.correct = false;
    }

    this.render();
  }

  normalizeAnswer(value) {
    return value.replace(/\s+/g, '').toLowerCase();
  }

  render() {
    this.children.removeAll(true);
    this.cameras.main.setBackgroundColor(0x050c19);

    this.add.rectangle(40, 30, 880, 540, 0x05140a, 1).setOrigin(0).setStrokeStyle(2, COLORS.green);
    this.add.rectangle(40, 30, 880, 40, COLORS.green, 1).setOrigin(0);
    this.add.text(48, 40, this.challenge.header ?? '  DESAFIO — COMPLETE O CÓDIGO (Fase 1: Variáveis)', {
      fontFamily: FONT.family,
      fontSize: '20px',
      color: '#050814'
    });

    this.add
      .text(480, 88, this.challenge.desc, {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#ffdc00',
        align: 'center',
        wordWrap: { width: 820 }
      })
      .setOrigin(0.5);

    const hasInstructions = Array.isArray(this.challenge.instructions) && this.challenge.instructions.length > 0;
    if (hasInstructions) {
      this.challenge.instructions.forEach((instruction, index) => {
        this.add
          .text(80, 125 + index * 28, instruction, {
            fontFamily: FONT.family,
            fontSize: '17px',
            color: '#c8f0ff',
            wordWrap: { width: 800 }
          })
          .setOrigin(0);
      });
    }

    const codeStartY = hasInstructions ? 210 : 130;
    const activeBlank = this.done ? null : this.challenge.blanks[this.current];
    this.challenge.lines.forEach((rawLine, lineIndex) => {
      this.renderCodeLine(rawLine, lineIndex, activeBlank, codeStartY);
    });

    if (!this.done && activeBlank) {
      this.add
        .text(480, 532, 'Digite e pressione ENTER para confirmar', {
          fontFamily: FONT.family,
          fontSize: '15px',
          color: '#5078a0'
        })
        .setOrigin(0.5);
    } else if (this.correct) {
      this.add
        .text(480, 500, '✓ CORRETO!\nHabilidade desbloqueada!\n[ ENTER para continuar ]', {
          fontFamily: FONT.family,
          fontSize: '22px',
          color: '#00ff50',
          align: 'center',
          lineSpacing: 6
        })
        .setOrigin(0.5);
    } else {
      this.add
        .text(480, 506, '✗ Resposta incorreta.\n[ ENTER para tentar de novo ]', {
          fontFamily: FONT.family,
          fontSize: '22px',
          color: '#ff3250',
          align: 'center',
          lineSpacing: 6
        })
        .setOrigin(0.5);
    }

    this.drawScanlines();
  }

  renderCodeLine(rawLine, lineIndex, activeBlank, startY = 130) {
    const y = startY + lineIndex * 38;
    const blankIndex = this.challenge.blanks.findIndex((blank) => blank.line === lineIndex);
    const isActiveLine = activeBlank && activeBlank.line === lineIndex;
    const color = isActiveLine ? '#00ff50' : '#c8f0ff';

    if (!rawLine.includes('_____')) {
      this.add.text(80, y, rawLine, {
        fontFamily: FONT.family,
        fontSize: '28px',
        color
      });
      return;
    }

    const [before, after] = rawLine.split('_____');
    const beforeText = this.add.text(80, y, before, {
      fontFamily: FONT.family,
      fontSize: '28px',
      color
    });

    const boxX = 80 + beforeText.width;
    const inputText = isActiveLine ? `${this.inputActive}${Date.now() % 1000 < 500 ? '|' : ''}` : this.inputs[blankIndex];
    const boxWidth = Math.max(90, inputText.length * 18 + 20);
    this.add.rectangle(boxX, y - 2, boxWidth, 32, 0x002814, 1).setOrigin(0).setStrokeStyle(1, COLORS.green);
    this.add.text(boxX + 4, y, inputText, {
      fontFamily: FONT.family,
      fontSize: '28px',
      color: '#00ffdc'
    });
    this.add.text(boxX + boxWidth + 4, y, after, {
      fontFamily: FONT.family,
      fontSize: '28px',
      color
    });
  }

  drawScanlines() {
    const g = this.add.graphics().setDepth(10);
    g.lineStyle(1, 0x000000, 0.18);
    for (let y = 0; y < this.scale.height; y += 4) {
      g.lineBetween(0, y, this.scale.width, y);
    }
  }
}
