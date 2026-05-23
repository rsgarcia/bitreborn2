import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';
import { CyberBackground } from '../systems/CyberBackground.js';
import { ParticleBurst } from '../systems/Particles.js';

export class FeedbackScene extends Phaser.Scene {
  constructor() {
    super('FeedbackScene');
  }

  create() {
    this.feedback = this.registry.get('feedbackData') ?? {
      skillTitle: 'ARMAZENAR ENERGIA DIGITAL',
      streamProgress: 1,
      total: 6,
      summary: 'Variáveis aprendidas. Próxima: Constantes.',
      nextScene: 'GameScene',
      continueText: '[ ENTER para o menu ]'
    };

    this.background = new CyberBackground(this);
    this.background.create();
    this.particles = new ParticleBurst(this);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.content = this.add.container(0, 0);
    this.createContent();

    this.tweens.add({
      targets: this.content,
      y: 8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update() {
    this.background.update();
    this.particles.emit(Phaser.Math.Between(240, 720), Phaser.Math.Between(150, 440), COLORS.cyan, 1);
    this.particles.update();

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.scene.start(this.feedback.nextScene);
    }
  }

  createContent() {
    [
      ['✓ HABILIDADE DESBLOQUEADA', 44, '#00ff50', 200],
      [this.feedback.skillTitle, 28, '#ffdc00', 260],
      [`STREAM DE RETORNO: ${this.feedback.streamProgress}/${this.feedback.total}`, 28, '#00ffdc', 320],
      [this.feedback.summary, 20, '#c8f0ff', 400],
      [this.feedback.continueText, 20, '#00ff50', 550]
    ].forEach(([text, size, color, y]) => {
      this.content.add(
        this.add
          .text(480, y, text, {
            fontFamily: FONT.family,
            fontSize: `${size}px`,
            color
          })
          .setOrigin(0.5)
      );
    });

    this.content.add(this.add.rectangle(280, 350, 400, 18, 0x5078a0, 1).setOrigin(0));
    this.content.add(
      this.add.rectangle(280, 350, (400 * this.feedback.streamProgress) / this.feedback.total, 18, COLORS.cyan, 1).setOrigin(0)
    );
  }
}
