import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';

export class DemoPendrive {
  constructor(scene, x, y, particles, label = 'VAR') {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.particles = particles;
    this.floatTime = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.collected = false;

    this.glow = scene.add.circle(x + 22, y + 14, 28, COLORS.yellow, 0.25).setDepth(19);
    this.plug = scene.add.rectangle(x + 38, y + 7, 12, 14, 0xc8c850, 1).setOrigin(0).setDepth(20);
    this.body = scene.add.rectangle(x, y, 40, 28, 0x1e1e46, 1).setOrigin(0).setDepth(20);
    this.body.setStrokeStyle(2, COLORS.yellow);
    this.plug.setStrokeStyle(1, COLORS.yellow);
    this.label = scene.add.rectangle(x + 5, y + 7, 28, 14, 0xc8c850, 1).setOrigin(0).setDepth(21);
    this.text = scene.add
      .text(x + 7, y + 8, label, {
        fontFamily: FONT.family,
        fontSize: '10px',
        color: '#050814'
      })
      .setDepth(22);
  }

  update() {
    if (this.collected) return;

    this.floatTime += 0.04;
    const fy = this.y + Math.sin(this.floatTime) * 6;
    const alpha = Phaser.Math.Linear(0.18, 0.55, 0.5 + Math.sin(this.floatTime * 3) * 0.5);

    this.body.setY(fy);
    this.plug.setY(fy + 7);
    this.label.setY(fy + 7);
    this.text.setY(fy + 8);
    this.glow.setPosition(this.x + 22, fy + 14).setAlpha(alpha);
  }

  overlaps(bounds) {
    return !this.collected && Phaser.Geom.Intersects.RectangleToRectangle(this.body.getBounds(), bounds);
  }

  collect() {
    this.collected = true;
    this.particles.emit(this.x + 22, this.y + 14, COLORS.yellow, 30);
    [this.glow, this.plug, this.body, this.label, this.text].forEach((item) => item.destroy());
  }
}
