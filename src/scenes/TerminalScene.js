import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';
import { CONCEPT_LINES } from '../levels/levelOne.js';

export class TerminalScene extends Phaser.Scene {
  constructor() {
    super('TerminalScene');
  }

  create() {
    const terminalData = this.registry.get('terminalData') ?? {
      header: '  TERMINAL v1.0 — PENDRIVE VAR_001.usb',
      conceptLines: CONCEPT_LINES,
      nextScene: 'ChallengeScene'
    };

    this.cameras.main.setBackgroundColor(0x050c19);

    this.add.rectangle(40, 30, 880, 540, 0x081432, 1).setOrigin(0).setStrokeStyle(2, COLORS.cyan);
    this.add.rectangle(40, 30, 880, 40, COLORS.cyan, 1).setOrigin(0);
    this.add.text(48, 40, terminalData.header, {
      fontFamily: FONT.family,
      fontSize: '20px',
      color: '#050814'
    });

    terminalData.conceptLines.forEach((line, index) => {
      this.add
        .text(480, 100 + index * 33, line.text, {
          fontFamily: FONT.family,
          fontSize: `${line.size}px`,
          color: line.color
        })
        .setOrigin(0.5);
    });

    this.drawScanlines();

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start(terminalData.nextScene);
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
