import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';
import { INTRO_LINES } from '../levels/levelOne.js';
import { CyberBackground } from '../systems/CyberBackground.js';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create() {
    this.visibleLines = 0;
    this.tick = 0;
    this.background = new CyberBackground(this);
    this.background.create();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  update() {
    this.background.update();
    this.tick += 1;

    if (this.tick % 4 === 0 && this.visibleLines < INTRO_LINES.length - 1) {
      this.visibleLines += 1;
      this.renderLines();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      if (this.visibleLines < INTRO_LINES.length - 1) {
        this.visibleLines = INTRO_LINES.length - 1;
        this.renderLines();
      } else {
        this.scene.start('LevelOneScene');
      }
    }
  }

  renderLines() {
    this.textGroup?.destroy(true);
    this.textGroup = this.add.group();

    INTRO_LINES.slice(0, this.visibleLines + 1).forEach((line, index) => {
      let color = '#c8f0ff';
      if (index === 0) color = '#00ffdc';
      if (line.includes('PROGRAMAR') || line.includes('stream')) color = '#00ff50';
      if (line.includes('ENTER')) color = '#ffdc00';

      this.textGroup.add(
        this.add
          .text(this.scale.width / 2, 80 + index * 32, line, {
            fontFamily: FONT.family,
            fontSize: '20px',
            color
          })
          .setOrigin(0.5)
      );
    });
  }
}
