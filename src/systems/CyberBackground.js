import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';

export class CyberBackground {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.width = options.width ?? scene.scale.width;
    this.height = options.height ?? scene.scale.height;
    this.bits = [];
  }

  create() {
    this.grid = this.scene.add.graphics().setScrollFactor(0).setDepth(-20);
    this.grid.lineStyle(1, COLORS.grid, 1);

    for (let x = 0; x <= this.width; x += 40) {
      this.grid.lineBetween(x, 0, x, this.height);
    }

    for (let y = 0; y <= this.height; y += 40) {
      this.grid.lineBetween(0, y, this.width, y);
    }

    for (let i = 0; i < 80; i += 1) {
      this.bits.push(this.createBit());
    }
  }

  createBit() {
    const text = this.scene.add
      .text(
        Phaser.Math.Between(0, this.width),
        Phaser.Math.Between(-20, this.height),
        Phaser.Math.Between(0, 1).toString(),
        {
          fontFamily: FONT.family,
          fontSize: '15px',
          color: Phaser.Math.RND.pick(['#00ffdc', '#00ff50', COLORS.dim])
        }
      )
      .setAlpha(Phaser.Math.FloatBetween(0.18, 0.55))
      .setScrollFactor(0)
      .setDepth(-10);

    text.fallSpeed = Phaser.Math.FloatBetween(0.3, 1.2);
    return text;
  }

  update() {
    this.bits.forEach((bit) => {
      bit.y += bit.fallSpeed;

      if (bit.y > this.height + 20) {
        bit.setPosition(Phaser.Math.Between(0, this.width), -20);
        bit.setText(Phaser.Math.Between(0, 1).toString());
      }
    });
  }

  drawScanlines() {
    const scanlines = this.scene.add.graphics().setScrollFactor(0).setDepth(200);
    scanlines.lineStyle(1, 0x000000, 0.18);

    for (let y = 0; y < this.height; y += 4) {
      scanlines.lineBetween(0, y, this.width, y);
    }

    return scanlines;
  }
}
