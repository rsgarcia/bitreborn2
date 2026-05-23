import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';
import { DemoPendrive } from '../entities/DemoPendrive.js';
import { DemoPlayer } from '../entities/DemoPlayer.js';
import { DemoTerminal } from '../entities/DemoTerminal.js';
import { CONCEPT_LINES, LEVEL_ONE, PHASE_ONE_FEEDBACK, VARIABLE_CHALLENGE } from '../levels/levelOne.js';
import { CyberBackground } from '../systems/CyberBackground.js';
import { ParticleBurst } from '../systems/Particles.js';

export class LevelOneScene extends Phaser.Scene {
  constructor() {
    super('LevelOneScene');
  }

  create() {
    this.pendriveCollected = false;
    this.nearTerminal = false;
    this.physics.world.setBounds(0, 0, LEVEL_ONE.width, LEVEL_ONE.height);
    this.cameras.main.setBounds(0, 0, LEVEL_ONE.width, LEVEL_ONE.height);
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.background = new CyberBackground(this);
    this.background.create();
    this.particles = new ParticleBurst(this);

    this.createPlatforms();
    this.createSpikes();
    this.createHud();

    this.player = new DemoPlayer(this, LEVEL_ONE.player.x, LEVEL_ONE.player.y, this.particles);
    this.pendrive = new DemoPendrive(this, LEVEL_ONE.pendrive.x, LEVEL_ONE.pendrive.y, this.particles);
    this.terminal = new DemoTerminal(this, LEVEL_ONE.terminal.x, LEVEL_ONE.terminal.y);

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

  update(time) {
    this.background.update();
    this.particles.update();
    this.player.update(this.keys);
    this.pendrive.update();
    this.terminal.update(time);

    if (this.player.sprite.y > LEVEL_ONE.height + 100 || this.isTouchingSpike()) {
      this.player.respawn();
    }

    if (this.pendrive.overlaps(this.player.getBounds())) {
      this.pendriveCollected = true;
      this.pendrive.collect();
      this.statusText.setText('✓ PENDRIVE COLETADO');
      this.statusText.setColor('#00ff50');
    }

    this.nearTerminal = this.terminal.isNear(this.player.getBounds());
    this.interactionText.setVisible(this.nearTerminal);
    this.interactionText.setText(
      this.pendriveCollected ? 'Pressione E para inserir o pendrive' : 'Colete o pendrive VAR antes de usar o computador'
    );
    this.interactionText.setPosition(this.terminal.x - 70, this.terminal.y - 34);

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact) && this.nearTerminal && this.pendriveCollected) {
      this.registry.set('terminalData', {
        header: '  TERMINAL v1.0 — PENDRIVE VAR_001.usb',
        conceptLines: CONCEPT_LINES,
        nextScene: 'ChallengeScene'
      });
      this.registry.set('challengeData', VARIABLE_CHALLENGE);
      this.registry.set('feedbackData', PHASE_ONE_FEEDBACK);
      this.scene.start('TerminalScene');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.escape)) {
      this.scene.start('GameScene');
    }
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    LEVEL_ONE.platforms.forEach((platform) => {
      const block = this.add
        .rectangle(platform.x, platform.y, platform.width, platform.height, COLORS.platform, 1)
        .setOrigin(0)
        .setDepth(10);
      block.setStrokeStyle(2, COLORS.platformBorder);

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

  createSpikes() {
    this.spikeBounds = LEVEL_ONE.spikes.map((spike) => new Phaser.Geom.Rectangle(spike.x, spike.y, spike.width, spike.height));
    const g = this.add.graphics().setDepth(12);
    g.fillStyle(COLORS.red, 1);

    LEVEL_ONE.spikes.forEach((spike) => {
      for (let i = 0; i < spike.width / 12; i += 1) {
        const px = spike.x + i * 12 + 6;
        g.fillTriangle(px - 5, spike.y + spike.height, px + 5, spike.y + spike.height, px, spike.y);
      }
    });
  }

  createHud() {
    this.add.rectangle(0, 0, this.scale.width, 62, 0x080f23, 1).setOrigin(0).setScrollFactor(0).setDepth(90);
    this.add
      .line(0, 62, 0, 0, this.scale.width, 0, COLORS.cyan, 1)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(91);

    this.add
      .text(16, 10, 'FASE 1 — VARIÁVEIS', {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#00ffdc'
      })
      .setScrollFactor(0)
      .setDepth(92);

    this.statusText = this.add
      .text(480, 10, '[ ] PENDRIVE', {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#5078a0'
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(92);

    this.add
      .text(480, 40, 'WASD / ←→ MOVER   ESPAÇO PULAR   E INTERAGIR', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#5078a0'
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(92);

    this.interactionText = this.add
      .text(0, 0, '', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#ffdc00'
      })
      .setVisible(false)
      .setDepth(95);
  }

  isTouchingSpike() {
    const bounds = this.player.getBounds();
    return this.spikeBounds.some((spike) => Phaser.Geom.Intersects.RectangleToRectangle(bounds, spike));
  }
}
