import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';
import { DemoPendrive } from '../entities/DemoPendrive.js';
import { DemoPlayer } from '../entities/DemoPlayer.js';
import { DemoTerminal } from '../entities/DemoTerminal.js';
import { CONSTANT_CHALLENGE, CONSTANT_CONCEPT_LINES, LEVEL_TWO, PHASE_TWO_FEEDBACK } from '../levels/levelTwo.js';
import { CyberBackground } from '../systems/CyberBackground.js';
import { ParticleBurst } from '../systems/Particles.js';

const MAX_ENERGY = 100;
const ENERGY_DRAIN_PER_SECOND = 3;
const STARTING_HEARTS = 2;

export class LevelTwoScene extends Phaser.Scene {
  constructor() {
    super('LevelTwoScene');
  }

  create() {
    this.pendriveCollected = false;
    this.nearTerminal = false;
    this.hearts = STARTING_HEARTS;
    this.energy = MAX_ENERGY;

    this.physics.world.setBounds(0, 0, LEVEL_TWO.width, LEVEL_TWO.height);
    this.cameras.main.setBounds(0, 0, LEVEL_TWO.width, LEVEL_TWO.height);
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.background = new CyberBackground(this);
    this.background.create();
    this.particles = new ParticleBurst(this);

    this.createDeathFloor();
    this.createPlatforms();
    this.createHud();

    this.player = new DemoPlayer(this, LEVEL_TWO.player.x, LEVEL_TWO.player.y, this.particles);
    this.pendrive = new DemoPendrive(
      this,
      LEVEL_TWO.pendrive.x,
      LEVEL_TWO.pendrive.y,
      this.particles,
      LEVEL_TWO.pendrive.label
    );
    this.terminal = new DemoTerminal(this, LEVEL_TWO.terminal.x, LEVEL_TWO.terminal.y);

    this.physics.add.collider(this.player.sprite, this.platforms);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1, -180, 0);

    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC
    });
  }

  update(time, delta) {
    this.background.update();
    this.particles.update();
    this.updateDeathFloor();
    this.player.update(this.keys);
    this.pendrive.update();
    this.terminal.update(time);

    this.energy = Math.max(0, this.energy - ENERGY_DRAIN_PER_SECOND * (delta / 1000));
    this.updateEnergyHud();

    if (this.energy <= 0) {
      this.loseHeart('Energia esgotada. Constantes mantêm regras críticas estáveis.');
    }

    if (this.player.sprite.y > LEVEL_TWO.height + 100 || this.isTouchingDeathFloor()) {
      this.loseHeart('Falha no trajeto estável. Reiniciando do checkpoint.');
    }

    if (this.pendrive.overlaps(this.player.getBounds())) {
      this.pendriveCollected = true;
      this.pendrive.collect();
      this.statusText.setText('✓ PENDRIVE CONST COLETADO');
      this.statusText.setColor('#00ff50');
    }

    this.nearTerminal = this.terminal.isNear(this.player.getBounds());
    this.interactionText.setVisible(this.nearTerminal);
    this.interactionText.setText(
      this.pendriveCollected
        ? 'Pressione E para inserir o pendrive CONST'
        : 'Colete o pendrive CONST antes de usar o computador'
    );
    this.interactionText.setPosition(this.terminal.x - 94, this.terminal.y - 34);

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact) && this.nearTerminal && this.pendriveCollected) {
      this.registry.set('terminalData', {
        header: '  TERMINAL v2.0 — PENDRIVE CONST_002.usb',
        conceptLines: CONSTANT_CONCEPT_LINES,
        nextScene: 'ChallengeScene'
      });
      this.registry.set('challengeData', CONSTANT_CHALLENGE);
      this.registry.set('feedbackData', PHASE_TWO_FEEDBACK);
      this.scene.start('TerminalScene');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.escape)) {
      this.scene.start('GameScene');
    }
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    LEVEL_TWO.platforms.forEach((platform) => {
      const block = this.add
        .rectangle(platform.x, platform.y, platform.width, platform.height, 0x1a4f52, 1)
        .setOrigin(0)
        .setDepth(10);
      block.setStrokeStyle(2, COLORS.green);

      this.physics.add.existing(block, true);
      block.body.updateFromGameObject();
      this.platforms.add(block);

      this.createPlatformBits(platform);
    });
  }

  createPlatformBits(platform) {
    const padding = 4;
    const bitWidth = Math.max(0, platform.width - padding * 2);
    const bitHeight = Math.max(0, platform.height - padding);
    const bitCount = Math.ceil(bitWidth / 9);

    this.add
      .text(platform.x + padding, platform.y + 2, '01'.repeat(bitCount), {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#00b4ff',
        fixedWidth: bitWidth,
        fixedHeight: bitHeight
      })
      .setDepth(11);
  }

  createDeathFloor() {
    const textureKey = this.createDeathFloorTexture();
    const floor = LEVEL_TWO.deathFloor;

    this.deathFloor = this.add
      .tileSprite(floor.x, floor.y, floor.width, floor.height, textureKey)
      .setOrigin(0)
      .setDepth(6);

    const g = this.add.graphics().setDepth(7);
    g.lineStyle(2, COLORS.red, 0.8);
    for (let x = 0; x < floor.width; x += 64) {
      const y1 = floor.y + Phaser.Math.Between(2, 14);
      const y2 = floor.y + floor.height - Phaser.Math.Between(2, 10);
      g.lineBetween(x, y1, x + 26, y2);
      g.lineBetween(x + 26, y2, x + 54, y1 + Phaser.Math.Between(4, 16));
    }

    g.lineStyle(1, COLORS.cyan, 0.45);
    for (let x = 10; x < floor.width; x += 92) {
      g.lineBetween(x, floor.y + 7, x + 42, floor.y + floor.height - 8);
    }
  }

  createDeathFloorTexture() {
    const key = 'bitreborn-corrupted-death-floor';
    if (this.textures.exists(key)) {
      return key;
    }

    const texture = this.textures.createCanvas(key, 512, 80);
    const ctx = texture.getContext();
    ctx.fillStyle = '#150008';
    ctx.fillRect(0, 0, 512, 80);

    for (let y = 0; y < 80; y += 4) {
      const offset = Math.sin(y * 0.31) * 18;
      ctx.fillStyle = y % 12 === 0 ? '#ff3250' : '#460018';
      ctx.fillRect(offset, y, 512 - Math.abs(offset), 2);
    }

    ctx.font = '18px Courier New';
    for (let x = -20; x < 520; x += 44) {
      const y = 20 + ((x * 7) % 48);
      ctx.fillStyle = x % 88 === 0 ? '#00ffdc' : '#ff3250';
      ctx.fillText(x % 88 === 0 ? '0101' : '1010', x + Math.sin(x) * 8, y);
    }

    for (let i = 0; i < 120; i += 1) {
      ctx.fillStyle = i % 3 === 0 ? '#ffdc00' : '#ff3250';
      ctx.globalAlpha = 0.28;
      ctx.fillRect(Math.random() * 512, Math.random() * 80, 2 + Math.random() * 18, 1 + Math.random() * 4);
    }
    ctx.globalAlpha = 1;

    texture.refresh();
    return key;
  }

  updateDeathFloor() {
    this.deathFloor.tilePositionX += 1.2;
    this.deathFloor.tilePositionY += 0.25;
  }

  createHud() {
    this.add.rectangle(0, 0, this.scale.width, 82, 0x080f23, 1).setOrigin(0).setScrollFactor(0).setDepth(90);
    this.add.line(0, 82, 0, 0, this.scale.width, 0, COLORS.green, 1).setOrigin(0).setScrollFactor(0).setDepth(91);

    this.add
      .text(16, 10, 'FASE 2 — CONSTANTES', {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#00ffdc'
      })
      .setScrollFactor(0)
      .setDepth(92);

    this.heartsText = this.add
      .text(280, 10, this.getHeartsText(), {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#ff3250'
      })
      .setScrollFactor(0)
      .setDepth(92);

    this.statusText = this.add
      .text(520, 10, '[ ] PENDRIVE CONST', {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#5078a0'
      })
      .setScrollFactor(0)
      .setDepth(92);

    this.add
      .text(16, 40, 'ENERGIA', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#ffdc00'
      })
      .setScrollFactor(0)
      .setDepth(92);

    this.energyBarBack = this.add.rectangle(96, 48, 260, 14, 0x5078a0, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(92);
    this.energyBar = this.add.rectangle(96, 48, 260, 14, COLORS.yellow, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(93);
    this.energyText = this.add
      .text(370, 40, '100', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#ffdc00'
      })
      .setScrollFactor(0)
      .setDepth(92);

    this.add
      .text(948, 58, 'WASD / ←→ MOVER   ESPAÇO PULAR   E INTERAGIR', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#5078a0'
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(92);

    this.messageText = this.add
      .text(480, 84, '', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#ffdc00',
        backgroundColor: '#080f23'
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(94);

    this.interactionText = this.add
      .text(0, 0, '', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#ffdc00'
      })
      .setVisible(false)
      .setDepth(95);
  }

  updateEnergyHud() {
    this.energyBar.setScale(this.energy / MAX_ENERGY, 1);
    this.energyText.setText(Math.ceil(this.energy).toString().padStart(3, '0'));
  }

  getHeartsText() {
    return `${'♥'.repeat(this.hearts)}${'♡'.repeat(STARTING_HEARTS - this.hearts)}`;
  }

  loseHeart(message) {
    if (this.recovering) {
      return;
    }

    this.recovering = true;
    this.hearts -= 1;
    this.heartsText.setText(this.getHeartsText());
    this.messageText.setText(message);

    if (this.hearts <= 0) {
      this.time.delayedCall(800, () => this.scene.start('GameScene'));
      return;
    }

    this.player.respawn();
    this.time.delayedCall(900, () => {
      this.messageText.setText('');
      this.recovering = false;
    });
  }

  isTouchingDeathFloor() {
    const bounds = this.player.getBounds();
    const floor = LEVEL_TWO.deathFloor;
    return bounds.bottom >= floor.y && bounds.right > floor.x && bounds.left < floor.x + floor.width;
  }
}
