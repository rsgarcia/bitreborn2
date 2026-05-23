import { COLORS, FONT } from '../config/theme.js';

export class DemoTerminal {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.active = true;

    this.base = scene.add.rectangle(x, y, 40, 56, 0x0a1e3c, 1).setOrigin(0).setDepth(18);
    this.base.setStrokeStyle(2, COLORS.cyan);
    this.screen = scene.add.rectangle(x + 4, y + 4, 32, 28, 0x003228, 1).setOrigin(0).setDepth(19);
    this.prompt = scene.add
      .text(x + 6, y + 10, '>_', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#00ff50'
      })
      .setDepth(20);
    this.light = scene.add.circle(x + 20, y + 46, 4, COLORS.green, 1).setDepth(20);
    this.keyHint = scene.add
      .text(x + 14, y - 18, 'E', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#ffdc00'
      })
      .setDepth(20);
  }

  update(time) {
    this.light.setVisible(Math.floor(time / 500) % 2 === 0);
  }

  isNear(bounds) {
    const terminalBounds = new Phaser.Geom.Rectangle(this.x - 50, this.y - 50, 140, 156);
    return Phaser.Geom.Intersects.RectangleToRectangle(bounds, terminalBounds);
  }
}
