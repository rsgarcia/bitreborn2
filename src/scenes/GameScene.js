import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';
import { CyberBackground } from '../systems/CyberBackground.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.menuIndex = 0;
    this.menuItems = [
      { label: 'INICIAR JOGO', action: () => this.scene.start('IntroScene') },
      { label: 'CRÉDITOS', action: () => this.showCredits() },
      { label: 'SAIR', action: () => this.exitGame() }
    ];
    this.showingCredits = false;
    this.showingExitMessage = false;
    this.t = 0;

    this.background = new CyberBackground(this);
    this.background.create();

    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.renderMenu();
  }

  update() {
    this.t += 0.016;
    this.background.update();

    if (this.showingExitMessage) {
      if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.showingExitMessage = false;
        this.renderMenu();
      }
      return;
    }

    if (this.showingCredits) {
      if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.showingCredits = false;
        this.renderMenu();
      }
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.upKey) || Phaser.Input.Keyboard.JustDown(this.wKey)) {
      this.menuIndex = Phaser.Math.Wrap(this.menuIndex - 1, 0, this.menuItems.length);
      this.renderMenu();
    }

    if (Phaser.Input.Keyboard.JustDown(this.downKey) || Phaser.Input.Keyboard.JustDown(this.sKey)) {
      this.menuIndex = Phaser.Math.Wrap(this.menuIndex + 1, 0, this.menuItems.length);
      this.renderMenu();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.menuItems[this.menuIndex].action();
    }
  }

  renderMenu() {
    this.clearForeground();

    this.add
      .text(480, 150, 'BITREBORN', {
        fontFamily: FONT.family,
        fontSize: '72px',
        color: '#00ffdc'
      })
      .setOrigin(0.5)
      .setName('foreground');

    this.add
      .text(480, 222, 'o caminho de volta pelo código', {
        fontFamily: FONT.family,
        fontSize: '28px',
        color: '#00ff50'
      })
      .setOrigin(0.5)
      .setName('foreground');

    this.add.line(480, 258, -240, 0, 240, 0, COLORS.cyan, 1).setName('foreground');

    this.menuItems.forEach((item, index) => {
      const y = 320 + index * 58;
      const selected = index === this.menuIndex;
      const color = selected ? '#00ffdc' : '#5078a0';

      if (selected) {
        this.add
          .rectangle(480, y + 16, 320, 44, COLORS.cyan, 0.18)
          .setStrokeStyle(2, COLORS.cyan)
          .setName('foreground');
      }

      const label = `${selected ? '> ' : '  '}${item.label}`;
      this.add
        .text(340, y, label, {
          fontFamily: FONT.family,
          fontSize: '28px',
          color
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          this.menuIndex = index;
          this.renderMenu();
        })
        .on('pointerup', item.action)
        .setName('foreground');
    });

    this.add
      .text(480, 572, '↑↓ NAVEGAR   ENTER CONFIRMAR', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#5078a0'
      })
      .setOrigin(0.5)
      .setName('foreground');
  }

  showCredits() {
    this.showingCredits = true;
    this.showingExitMessage = false;
    this.clearForeground();

    this.add
      .text(480, 92, 'CRÉDITOS', {
        fontFamily: FONT.family,
        fontSize: '44px',
        color: '#00ffdc'
      })
      .setOrigin(0.5)
      .setName('foreground');

    const lines = [
      'BitReborn: o caminho de volta pelo código',
      '',
      'Desenvolvido para a disciplina MAC5001 - Jogos Educacionais Digitais (2026).',
      'Sob orientação do Prof. Dr. Pedro Henrique Dias Valle.',
      'Desenvolvimento: Renato de Souza Garcia, estudante de doutorado.',
      '',
      'Serious game educacional de plataforma 2D sobre programação introdutória.',
      'Tecnologias: Phaser.js, JavaScript ES Modules, Vite e HTML5 Canvas.',
      '',
      '[ ENTER para voltar ao menu ]'
    ];

    lines.forEach((line, index) => {
      this.add
        .text(480, 170 + index * 34, line, {
          fontFamily: FONT.family,
          fontSize: '20px',
          color: line.includes('ENTER') ? '#ffdc00' : '#c8f0ff',
          align: 'center',
          wordWrap: { width: 820 }
        })
        .setOrigin(0.5)
        .setName('foreground');
    });
  }

  exitGame() {
    window.close();

    this.showingExitMessage = true;
    this.showingCredits = false;
    this.clearForeground();

    this.add
      .text(480, 250, 'SAIR DO JOGO', {
        fontFamily: FONT.family,
        fontSize: '44px',
        color: '#00ffdc'
      })
      .setOrigin(0.5)
      .setName('foreground');

    this.add
      .text(480, 320, 'O navegador bloqueou o fechamento automático da aba.', {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#c8f0ff'
      })
      .setOrigin(0.5)
      .setName('foreground');

    this.add
      .text(480, 360, '[ ENTER para voltar ao menu ]', {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#ffdc00'
      })
      .setOrigin(0.5)
      .setName('foreground');
  }

  clearForeground() {
    this.children
      .getChildren()
      .filter((child) => child.name === 'foreground')
      .forEach((child) => child.destroy());
  }
}
