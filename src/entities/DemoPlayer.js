import Phaser from 'phaser';
import { COLORS } from '../config/theme.js';

const MOVE_SPEED = 240;
const JUMP_SPEED = -520;
const WIDTH = 28;
const HEIGHT = 40;

export class DemoPlayer {
  constructor(scene, x, y, particles) {
    this.scene = scene;
    this.particles = particles;
    this.facing = 1;
    this.spawn = new Phaser.Math.Vector2(x, y);

    this.sprite = scene.add.rectangle(x, y, WIDTH, HEIGHT, COLORS.cyan, 1).setOrigin(0).setDepth(30);
    this.sprite.setStrokeStyle(2, COLORS.green);
    scene.physics.add.existing(this.sprite);
    this.sprite.body.setSize(WIDTH, HEIGHT);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setMaxVelocity(260, 760);

    this.eye = scene.add.rectangle(x + 16, y + 8, 6, 6, COLORS.bg, 1).setOrigin(0).setDepth(31);
    this.scanline = scene.add.rectangle(x, y + HEIGHT / 2, WIDTH, 1, COLORS.bg, 1).setOrigin(0).setDepth(31);
  }

  update(keys) {
    const body = this.sprite.body;
    const left = keys.left.isDown || keys.a.isDown;
    const right = keys.right.isDown || keys.d.isDown;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(keys.up) ||
      Phaser.Input.Keyboard.JustDown(keys.w) ||
      Phaser.Input.Keyboard.JustDown(keys.space);

    let dx = 0;
    if (left) dx = -1;
    if (right) dx = 1;

    if (dx !== 0) {
      this.facing = dx;
    }

    body.setVelocityX(dx * MOVE_SPEED);

    if (jumpPressed && body.blocked.down) {
      body.setVelocityY(JUMP_SPEED);
      this.particles.emit(this.sprite.x + WIDTH / 2, this.sprite.y + HEIGHT, COLORS.cyan, 8);
    }

    if (Phaser.Math.Between(0, 100) < 2) {
      this.sprite.setFillStyle(COLORS.glitch);
    } else {
      this.sprite.setFillStyle(COLORS.cyan);
    }

    this.updateVisuals();
  }

  updateVisuals() {
    this.eye.setPosition(this.sprite.x + (this.facing === 1 ? 16 : 6), this.sprite.y + 8);
    this.scanline.setPosition(this.sprite.x, this.sprite.y + HEIGHT / 2);
  }

  getBounds() {
    return this.sprite.getBounds();
  }

  respawn() {
    this.sprite.body.setVelocity(0, 0);
    this.sprite.setPosition(this.spawn.x, this.spawn.y);
    this.updateVisuals();
    this.particles.emit(this.sprite.x + WIDTH / 2, this.sprite.y + HEIGHT / 2, COLORS.red, 20);
  }
}
